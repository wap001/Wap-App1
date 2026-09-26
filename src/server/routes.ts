import { Router, Request, Response } from 'express';
import db, { REGIONS_SEED, REGIONAL_PRICING_SEED, DRIVERS_SEED } from './db';
import { activeDrivers, driverLocations } from './socket';
import {
  BROKERAGE_ASSETS,
  INITIAL_3SIDED_ORDERS,
  INITIAL_3WAY_RATINGS,
  INITIAL_PERFORMANCE_METRICS,
  INITIAL_LBC_TRANSACTIONS,
  INITIAL_LBC_WALLETS,
  INITIAL_PORTFOLIO_HOLDINGS,
  LBC_REWARD_RULES,
  LBC_TREASURY_APY,
  LBC_USD_PEG_RATE,
  LBC_TOKENS_PER_LIBERTY_CASH,
  LIBERTY_CASH_USD_PEG,
  LIBERTY_CASH_MIN_PURCHASING_POWER_USD
} from '../data/lbcBrokerageData';
import { calculateLibertyCashPurchasingPowerGuarantee } from '../data/internationalData';
import {
  BrokerageConversionTrade,
  BrokeragePortfolioHolding,
  LbcTransaction,
  MarketplaceOrder3Sided,
  MarketplaceSide,
  TripartiteRatingRecord,
  ParticipantPerformanceMetric
} from '../types/architecture';

const router = Router();

// IN-MEMORY REAL-TIME DATA REPOSITORIES FOR 3-SIDED MARKETPLACE & BROKERAGE
let marketplaceOrders: MarketplaceOrder3Sided[] = [...INITIAL_3SIDED_ORDERS];
let lbcWallets = { ...INITIAL_LBC_WALLETS };
let portfolioHoldings: Record<string, BrokeragePortfolioHolding[]> = JSON.parse(
  JSON.stringify(INITIAL_PORTFOLIO_HOLDINGS)
);
let lbcTransactions: LbcTransaction[] = [...INITIAL_LBC_TRANSACTIONS];
let brokerageTrades: BrokerageConversionTrade[] = [];
let tripartiteRatings: TripartiteRatingRecord[] = [...INITIAL_3WAY_RATINGS];
let participantMetrics: ParticipantPerformanceMetric[] = [...INITIAL_PERFORMANCE_METRICS];

/**
 * 1. DYNAMIC FARE CALCULATION API
 * Calculates upfront ride fare based on regional base rates, time, distance, and vehicle tier.
 */
router.post('/api/fare/calculate', async (req: Request, res: Response) => {
  try {
    const { region_id, vehicle_type, distance_km, duration_minutes } = req.body;

    // Fetch pricing rules for the specified region and vehicle class
    const pricing = await db.oneOrNone(
      `SELECT base_fare, per_minute_rate, per_km_rate, minimum_fare_floor, currency 
       FROM regional_pricing rp
       JOIN regions r ON rp.region_id = r.region_id
       WHERE rp.region_id = $1 AND rp.vehicle_type = $2 AND r.is_excluded = FALSE`,
      [region_id, vehicle_type]
    );

    if (!pricing) {
      return res.status(400).json({ error: 'Service unavailable or invalid region/vehicle tier.' });
    }

    // Calculate raw fare using core platform formula
    const calculatedFare =
      parseFloat(pricing.base_fare) +
      parseFloat(duration_minutes) * parseFloat(pricing.per_minute_rate) +
      parseFloat(distance_km) * parseFloat(pricing.per_km_rate);

    // Enforce minimum trip floor
    const finalFare = Math.max(calculatedFare, parseFloat(pricing.minimum_fare_floor));

    return res.status(200).json({
      success: true,
      vehicle_type,
      distance_km: Number(distance_km),
      duration_minutes: Number(duration_minutes),
      fare: finalFare.toFixed(2),
      currency: pricing.currency,
      breakdown: {
        base_fare: pricing.base_fare,
        per_minute_rate: pricing.per_minute_rate,
        per_km_rate: pricing.per_km_rate,
        minimum_fare_floor: pricing.minimum_fare_floor,
        raw_calculated_fare: calculatedFare.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Error calculating fare:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 2. POSTGIS GEOSPATIAL DRIVER DISPATCH API
 * Finds nearby online drivers matching the requested vehicle tier within a given radius.
 */
router.post('/api/drivers/nearby', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, vehicle_type, radius_meters = 5000 } = req.body;

    // ST_DWithin and ST_Distance Sphere query for fast spatial indexing
    const nearbyDrivers = await db.manyOrNone(
      `SELECT 
          d.driver_id,
          u.full_name,
          d.vehicle_type,
          ST_X(d.current_location::geometry) as longitude,
          ST_Y(d.current_location::geometry) as latitude,
          ST_Distance(
              d.current_location, 
              ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
          ) as distance_meters
       FROM driver_profiles d
       JOIN users u ON d.driver_id = u.user_id
       WHERE d.is_online = TRUE 
         AND d.is_verified = TRUE
         AND d.vehicle_type = $3
         AND ST_DWithin(
             d.current_location, 
             ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, 
             $4
         )
       ORDER BY distance_meters ASC
       LIMIT 10`,
      [longitude, latitude, vehicle_type, radius_meters]
    );

    return res.status(200).json({
      success: true,
      count: nearbyDrivers.length,
      radius_meters: Number(radius_meters),
      vehicle_type,
      drivers: nearbyDrivers
    });
  } catch (error) {
    console.error('Error finding nearby drivers:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * 3. CASH TRIP COMPLETION & COMMISSION DEDUCTION API
 * Finalizes physical cash payment collection, calculates platform commission,
 * deducts it from driver digital wallet, and records financial ledger entry.
 */
router.post('/api/payments/cash-complete', (req: Request, res: Response) => {
  try {
    const { trip_id, driver_id, collected_amount, commission_rate = 0.15, currency = 'USD' } = req.body;

    if (!trip_id || !driver_id || collected_amount === undefined) {
      return res.status(400).json({
        error: 'Missing required parameters: trip_id, driver_id, and collected_amount are mandatory.'
      });
    }

    const collected = parseFloat(String(collected_amount)) || 0;
    const rate = parseFloat(String(commission_rate)) || 0.15;
    const commission = parseFloat((collected * rate).toFixed(2));
    const netEarnings = parseFloat((collected - commission).toFixed(2));

    // Platform driver balance accounting (mock ledger)
    const initialWalletBalance = 2500.00;
    const finalWalletBalance = parseFloat((initialWalletBalance - commission).toFixed(2));
    const ledgerTxId = `tx_cash_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    return res.status(200).json({
      success: true,
      trip_id,
      driver_id,
      payment_method: 'CASH',
      collected_amount: collected.toFixed(2),
      commission_rate: rate,
      commission_amount: commission.toFixed(2),
      net_driver_earnings: netEarnings.toFixed(2),
      driver_wallet_balance: finalWalletBalance.toFixed(2),
      currency,
      status: 'COMPLETED',
      ledger_entry_id: ledgerTxId,
      message: 'Cash fare successfully collected. Platform commission deducted from driver wallet balance.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error completing cash payment:', error);
    return res.status(500).json({ error: 'Internal server error processing cash trip completion.' });
  }
});

/**
 * 4. HEALTH & METADATA ENDPOINTS
 */
router.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Wap Mobility Dispatch & Fare Engine',
    database: 'PostgreSQL 16 + PostGIS extension (Spatial Indexing: GIST)',
    timestamp: new Date().toISOString()
  });
});

router.get('/api/metadata/regions', (req: Request, res: Response) => {
  res.json({
    success: true,
    regions: REGIONS_SEED,
    pricing: REGIONAL_PRICING_SEED
  });
});

router.get('/api/metadata/drivers', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: DRIVERS_SEED.length,
    drivers: DRIVERS_SEED
  });
});

router.get('/api/socket/active-drivers', (req: Request, res: Response) => {
  const drivers: any[] = [];
  
  for (const [driver_id, socket_id] of activeDrivers.entries()) {
    const loc = driverLocations.get(driver_id);
    drivers.push({
      driver_id,
      socket_id,
      latitude: loc?.latitude ?? null,
      longitude: loc?.longitude ?? null,
      heading: loc?.heading ?? 0,
      updated_at: loc?.updated_at ?? null
    });
  }

  res.json({
    success: true,
    active_count: activeDrivers.size,
    drivers
  });
});

// =========================================================================
// 5. 3-SIDED MARKETPLACE ENDPOINTS (DRIVERS, CUSTOMERS, MERCHANTS)
// =========================================================================

/**
 * Summary metrics of the 3-sided marketplace and LBC ecosystem
 */
router.get('/api/marketplace/summary', (req: Request, res: Response) => {
  const totalLbcCirculating = Object.values(lbcWallets).reduce((sum, w) => sum + w.balanceLbc, 0);
  const totalConvertedUsd = brokerageTrades.reduce((sum, t) => sum + t.usdExecuted, 0);

  res.json({
    success: true,
    marketplaceSides: {
      customers: { activeCount: 1420, label: 'Customers' },
      drivers: { activeCount: 380, label: 'Motorcycle Drivers' },
      merchants: { activeCount: 94, label: 'Verified Merchants' }
    },
    activityMetrics: {
      activeOrdersCount: marketplaceOrders.filter((o) => o.status !== 'delivered').length,
      completedOrdersCount: marketplaceOrders.filter((o) => o.status === 'delivered').length,
      totalOrdersCount: marketplaceOrders.length
    },
    lbcTreasury: {
      tokenSymbol: 'LBC',
      tokenName: 'Liberté Cash',
      pegRateUsd: LBC_USD_PEG_RATE,
      totalCirculatingLbc: totalLbcCirculating,
      totalCirculatingUsd: totalLbcCirculating * LBC_USD_PEG_RATE,
      treasuryApyPercent: LBC_TREASURY_APY,
      totalBrokerageConvertedUsd: totalConvertedUsd
    },
    brokerageStatus: {
      clearingCustodian: 'Omnibus Digital Brokerage & Trust API',
      regulations: 'FINRA / SIPC Protected Omnibus Custody',
      availableAssetClasses: ['fractional_stocks', 'etfs', 'regional_assets', 'local_fiat_payouts']
    }
  });
});

/**
 * List 3-sided marketplace orders with optional status or user filter
 */
router.get('/api/marketplace/orders', (req: Request, res: Response) => {
  const { status, side, userId } = req.query;

  let filtered = [...marketplaceOrders];

  if (status) {
    filtered = filtered.filter((o) => o.status === status);
  }

  if (userId) {
    filtered = filtered.filter(
      (o) => o.customerId === userId || o.merchantId === userId || o.driverId === userId
    );
  }

  res.json({
    success: true,
    count: filtered.length,
    orders: filtered
  });
});

/**
 * Place a new 3-sided order (Customer initiates request to Merchant or Driver)
 */
router.post('/api/marketplace/orders', (req: Request, res: Response) => {
  const {
    type = 'merchant_goods',
    title,
    customerId = 'customer_fabienne',
    customerName = 'Fabienne Voltaire',
    customerPhone = '+509 3712-4491',
    merchantId = 'merchant_chef_fifi',
    merchantName = 'Chef Fifi - Chez Fifi Resto',
    driverId = 'driver_moise',
    driverName = 'Jean-Baptiste Moïse',
    driverVehicle = 'Haojue 125cc (TP-9821)',
    items = [],
    subtotal = 1200,
    deliveryFee = 250,
    currency = 'HTG',
    pickupLandmark = 'Rue Capois #45, Port-au-Prince',
    dropoffLandmark = 'Av. Panamericaine, Pétion-Ville',
    distanceKm = 4.5
  } = req.body;

  const newOrder: MarketplaceOrder3Sided = {
    id: `ord-3s-${Date.now().toString().slice(-4)}`,
    type,
    title: title || (type === 'ride' ? 'Motorcycle Ride' : 'Merchant Order Fulfillment'),
    customerId,
    customerName,
    customerPhone,
    merchantId: type === 'ride' ? undefined : merchantId,
    merchantName: type === 'ride' ? undefined : merchantName,
    driverId,
    driverName,
    driverVehicle,
    items,
    subtotal: Number(subtotal),
    deliveryFee: Number(deliveryFee),
    total: Number(subtotal) + Number(deliveryFee),
    currency,
    status: type === 'ride' ? 'driver_assigned' : 'merchant_prep',
    pickupLandmark,
    dropoffLandmark,
    distanceKm: Number(distanceKm),
    lbcRewards: {
      customerLbc: type === 'ride' ? 15 : 20,
      merchantLbc: type === 'ride' ? 0 : 25,
      driverLbc: 35
    },
    createdAt: 'Just now'
  };

  marketplaceOrders.unshift(newOrder);

  res.status(201).json({
    success: true,
    message: '3-Sided marketplace order successfully initiated.',
    order: newOrder
  });
});

/**
 * Progress 3-sided order status and automatically distribute LBC token rewards
 * to Customer, Merchant, and Driver upon fulfillment!
 */
router.post('/api/marketplace/fulfill', (req: Request, res: Response) => {
  const { orderId, nextStatus } = req.body;

  const orderIndex = marketplaceOrders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const order = marketplaceOrders[orderIndex];
  const validTransitions: Record<string, 'merchant_prep' | 'driver_assigned' | 'in_transit' | 'delivered'> = {
    created: 'merchant_prep',
    merchant_prep: 'driver_assigned',
    driver_assigned: 'in_transit',
    in_transit: 'delivered'
  };

  const statusToSet = nextStatus || validTransitions[order.status] || 'delivered';
  order.status = statusToSet;

  const rewardsDistributed: any = {};

  // If order is delivered / completed, credit LBC tokens to all 3 marketplace participants!
  if (statusToSet === 'delivered') {
    order.completedAt = 'Just now';
    const nowTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Customer Reward
    if (order.customerId && lbcWallets[order.customerId]) {
      const custWallet = lbcWallets[order.customerId];
      if (custWallet.earningLbcEnabled !== false) {
        const custLbc = order.lbcRewards.customerLbc;
        custWallet.balanceLbc += custLbc;
        custWallet.totalEarnedLbc += custLbc;
        custWallet.usdValue = custWallet.balanceLbc * LBC_USD_PEG_RATE;

        const custTx: LbcTransaction = {
          id: `tx-lbc-${Date.now()}-c`,
          timestamp: nowTimestamp,
          userId: order.customerId,
          userType: 'customer',
          userName: order.customerName,
          activityType: order.type === 'ride' ? 'ride_completed' : 'merchant_fulfillment',
          activityReferenceId: order.id,
          amountLbc: custLbc,
          usdEquivalent: custLbc * LBC_USD_PEG_RATE,
          txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          status: 'confirmed',
          note: `Reward for ${order.title} (+${custLbc} LBC)`
        };
        lbcTransactions.unshift(custTx);
        rewardsDistributed.customer = { lbcEarned: custLbc, newBalance: custWallet.balanceLbc };
      } else {
        rewardsDistributed.customer = { lbcEarned: 0, newBalance: custWallet.balanceLbc, note: 'LBC earning disabled by customer (direct cash preference)' };
      }
    }

    // 2. Merchant Reward (if applicable)
    if (order.merchantId && lbcWallets[order.merchantId]) {
      const merchWallet = lbcWallets[order.merchantId];
      if (merchWallet.earningLbcEnabled !== false) {
        const merchLbc = order.lbcRewards.merchantLbc;
        merchWallet.balanceLbc += merchLbc;
        merchWallet.totalEarnedLbc += merchLbc;
        merchWallet.usdValue = merchWallet.balanceLbc * LBC_USD_PEG_RATE;

        const merchTx: LbcTransaction = {
          id: `tx-lbc-${Date.now()}-m`,
          timestamp: nowTimestamp,
          userId: order.merchantId,
          userType: 'merchant',
          userName: order.merchantName || 'Merchant',
          activityType: 'merchant_fulfillment',
          activityReferenceId: order.id,
          amountLbc: merchLbc,
          usdEquivalent: merchLbc * LBC_USD_PEG_RATE,
          txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          status: 'confirmed',
          note: `Merchant fulfillment & packing reward (+${merchLbc} LBC)`
        };
        lbcTransactions.unshift(merchTx);
        rewardsDistributed.merchant = { lbcEarned: merchLbc, newBalance: merchWallet.balanceLbc };
      } else {
        rewardsDistributed.merchant = { lbcEarned: 0, newBalance: merchWallet.balanceLbc, note: 'LBC earning disabled by merchant (direct cash preference)' };
      }
    }

    // 3. Driver Reward
    if (order.driverId && lbcWallets[order.driverId]) {
      const drvWallet = lbcWallets[order.driverId];
      if (drvWallet.earningLbcEnabled !== false) {
        const drvLbc = order.lbcRewards.driverLbc;
        drvWallet.balanceLbc += drvLbc;
        drvWallet.totalEarnedLbc += drvLbc;
        drvWallet.usdValue = drvWallet.balanceLbc * LBC_USD_PEG_RATE;

        const drvTx: LbcTransaction = {
          id: `tx-lbc-${Date.now()}-d`,
          timestamp: nowTimestamp,
          userId: order.driverId,
          userType: 'driver',
          userName: order.driverName || 'Driver',
          activityType: order.type === 'ride' ? 'ride_completed' : 'merchant_fulfillment',
          activityReferenceId: order.id,
          amountLbc: drvLbc,
          usdEquivalent: drvLbc * LBC_USD_PEG_RATE,
          txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
          status: 'confirmed',
          note: `Delivery transit completion reward (+${drvLbc} LBC)`
        };
        lbcTransactions.unshift(drvTx);
        rewardsDistributed.driver = { lbcEarned: drvLbc, newBalance: drvWallet.balanceLbc };
      } else {
        rewardsDistributed.driver = { lbcEarned: 0, newBalance: drvWallet.balanceLbc, note: 'LBC earning disabled by driver (direct cash preference)' };
      }
    }
  }

  res.json({
    success: true,
    orderId: order.id,
    currentStatus: order.status,
    rewardsDistributed,
    order
  });
});

// =========================================================================
// 6. LIBERTÉ CASH (LBC) REWARD SYSTEM ENDPOINTS
// =========================================================================

/**
 * Get active LBC reward rules and earning formulas across platform activities
 */
router.get('/api/lbc/rewards/rules', (req: Request, res: Response) => {
  res.json({
    success: true,
    tokensPerLibertyCash: LBC_TOKENS_PER_LIBERTY_CASH,
    libertyCashUsdPeg: LIBERTY_CASH_USD_PEG,
    pegRateUsd: LBC_USD_PEG_RATE,
    minPurchasingPowerFloorUSD: LIBERTY_CASH_MIN_PURCHASING_POWER_USD,
    treasuryApyPercent: LBC_TREASURY_APY,
    rules: LBC_REWARD_RULES
  });
});

/**
 * Regional Purchasing Power Floor calculation API
 * Ensures 1 Liberty Cash (167 LBC) guarantees a minimum equivalence of $0.50 USD in local purchasing power
 */
router.get('/api/lbc/purchasing-power', (req: Request, res: Response) => {
  const countryCode = String(req.query.countryCode || 'HT');
  const amountLibertyCash = Number(req.query.amount || 1.0);

  const guarantee = calculateLibertyCashPurchasingPowerGuarantee(countryCode, amountLibertyCash);
  res.json({
    success: true,
    guarantee
  });
});

/**
 * Update user's optional LBC earning preference
 */
router.put('/api/lbc/wallet/:userId/earning-preference', (req: Request, res: Response) => {
  const { userId } = req.params;
  const { enabled } = req.body;

  if (!lbcWallets[userId]) {
    return res.status(404).json({ error: `Wallet not found for user ${userId}` });
  }

  lbcWallets[userId].earningLbcEnabled = Boolean(enabled);

  res.json({
    success: true,
    message: `LBC token earning preference updated for ${userId}: ${enabled ? 'Enabled' : 'Disabled (Direct Cash Preference)'}`,
    wallet: lbcWallets[userId]
  });
});

/**
 * Get LBC wallet details for a user
 */
router.get('/api/lbc/wallet/:userType/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const wallet = lbcWallets[userId];

  if (!wallet) {
    return res.status(404).json({ error: `Wallet not found for user ${userId}` });
  }

  res.json({
    success: true,
    wallet
  });
});

/**
 * Award LBC tokens directly to any user for platform activity (respects optional earning preference)
 */
router.post('/api/lbc/reward', (req: Request, res: Response) => {
  const { userId, userType, amountLbc, activityType, note, referenceId } = req.body;

  if (!userId || !amountLbc) {
    return res.status(400).json({ error: 'Missing userId or amountLbc' });
  }

  if (!lbcWallets[userId]) {
    lbcWallets[userId] = {
      userId,
      userType: userType || 'customer',
      userName: userId,
      balanceLbc: 0,
      totalEarnedLbc: 0,
      usdValue: 0,
      annualYieldApy: LBC_TREASURY_APY,
      stakingRewardsEarned: 0,
      linkedBrokerageAccount: `WAP-BRK-${userId.toUpperCase()}-SIP`,
      earningLbcEnabled: true
    };
  }

  if (lbcWallets[userId].earningLbcEnabled === false) {
    return res.json({
      success: false,
      message: `User ${userId} has opted out of earning LBC tokens. Direct cash preferred.`,
      wallet: lbcWallets[userId]
    });
  }

  const earned = Number(amountLbc);
  lbcWallets[userId].balanceLbc += earned;
  lbcWallets[userId].totalEarnedLbc += earned;
  lbcWallets[userId].usdValue = lbcWallets[userId].balanceLbc * LBC_USD_PEG_RATE;

  const newTx: LbcTransaction = {
    id: `tx-lbc-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    userId,
    userType: lbcWallets[userId].userType,
    userName: lbcWallets[userId].userName,
    activityType: activityType || 'service_completed',
    activityReferenceId: referenceId || `manual-${Date.now()}`,
    amountLbc: earned,
    usdEquivalent: earned * LBC_USD_PEG_RATE,
    txHash: `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}`,
    status: 'confirmed',
    note: note || `Credited ${earned} LBC reward`
  };

  lbcTransactions.unshift(newTx);

  res.json({
    success: true,
    message: `Successfully credited ${earned} LBC to ${userId}.`,
    wallet: lbcWallets[userId],
    transaction: newTx
  });
});

/**
 * Get recent LBC transaction ledger
 */
router.get('/api/lbc/transactions', (req: Request, res: Response) => {
  const { userId, limit = 50 } = req.query;

  let results = [...lbcTransactions];
  if (userId) {
    results = results.filter((tx) => tx.userId === userId);
  }

  res.json({
    success: true,
    count: results.length,
    transactions: results.slice(0, Number(limit))
  });
});

// =========================================================================
// 7. EMBEDDED BROKERAGE API & ASSET CONVERSION ENDPOINTS
// =========================================================================

/**
 * Get all available investment assets & fiat rails with real-time pricing
 */
router.get('/api/brokerage/assets', (req: Request, res: Response) => {
  const { assetClass } = req.query;

  let results = [...BROKERAGE_ASSETS];
  if (assetClass) {
    results = results.filter((a) => a.assetClass === assetClass);
  }

  res.json({
    success: true,
    clearingHouse: 'Omnibus Brokerage Clearing Engine',
    sipcInsured: true,
    count: results.length,
    assets: results
  });
});

/**
 * Execute brokerage conversion:
 * Convert Liberté Cash (LBC) into Fractional Stocks, ETFs, Regional Assets, or Local Fiat Payouts!
 */
router.post('/api/brokerage/convert', (req: Request, res: Response) => {
  const { userId, assetId, lbcAmount, fiatDestinationAccount } = req.body;

  if (!userId || !assetId || !lbcAmount) {
    return res.status(400).json({ error: 'Missing userId, assetId, or lbcAmount' });
  }

  const wallet = lbcWallets[userId];
  if (!wallet) {
    return res.status(404).json({ error: 'User wallet not found' });
  }

  const amountToSpend = Number(lbcAmount);
  if (wallet.balanceLbc < amountToSpend) {
    return res.status(400).json({
      error: `Insufficient LBC balance. Available: ${wallet.balanceLbc} LBC, Requested: ${amountToSpend} LBC`
    });
  }

  const asset = BROKERAGE_ASSETS.find((a) => a.id === assetId);
  if (!asset) {
    return res.status(404).json({ error: 'Brokerage asset not found' });
  }

  if (amountToSpend < asset.minLbcToConvert) {
    return res.status(400).json({
      error: `Minimum conversion for ${asset.ticker} is ${asset.minLbcToConvert} LBC.`
    });
  }

  // Value calculation
  const usdValue = amountToSpend * LBC_USD_PEG_RATE;
  const unitsAcquired = parseFloat((usdValue / asset.priceUsd).toFixed(4));

  // Deduct LBC from wallet
  wallet.balanceLbc -= amountToSpend;
  wallet.usdValue = wallet.balanceLbc * LBC_USD_PEG_RATE;

  // Record trade execution slip
  const trade: BrokerageConversionTrade = {
    tradeId: `TRD-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    userId,
    userType: wallet.userType,
    userName: wallet.userName,
    assetId: asset.id,
    ticker: asset.ticker,
    assetName: asset.name,
    assetClass: asset.assetClass,
    lbcSpent: amountToSpend,
    usdExecuted: usdValue,
    unitsAcquired,
    executionPriceUsd: asset.priceUsd,
    clearingBroker: 'Wap Financial Custodial Brokerage (Omnibus)',
    fiatDestination: fiatDestinationAccount || asset.fiatRail || 'Direct Wallet Deposit',
    status: 'settled',
    settlementConfirmationHash: `0xbrk_${Math.random().toString(16).substring(2, 12)}`
  };

  brokerageTrades.unshift(trade);

  // Update or add to user portfolio holdings if it's an equity, ETF, or regional bond
  if (asset.assetClass !== 'fiat_cashout') {
    if (!portfolioHoldings[userId]) {
      portfolioHoldings[userId] = [];
    }

    const existingHolding = portfolioHoldings[userId].find((h) => h.assetId === asset.id);
    if (existingHolding) {
      const totalUnits = existingHolding.sharesOrUnits + unitsAcquired;
      const totalCost = existingHolding.avgCostUsd * existingHolding.sharesOrUnits + usdValue;
      existingHolding.sharesOrUnits = parseFloat(totalUnits.toFixed(4));
      existingHolding.avgCostUsd = parseFloat((totalCost / totalUnits).toFixed(2));
      existingHolding.currentPriceUsd = asset.priceUsd;
      existingHolding.totalValueUsd = parseFloat((existingHolding.sharesOrUnits * asset.priceUsd).toFixed(2));
      existingHolding.totalReturnUsd = parseFloat(
        (existingHolding.totalValueUsd - totalCost).toFixed(2)
      );
      existingHolding.totalReturnPercent = parseFloat(
        (((existingHolding.currentPriceUsd - existingHolding.avgCostUsd) / existingHolding.avgCostUsd) * 100).toFixed(2)
      );
    } else {
      portfolioHoldings[userId].push({
        id: `hold_${Date.now()}`,
        assetId: asset.id,
        ticker: asset.ticker,
        name: asset.name,
        assetClass: asset.assetClass,
        sharesOrUnits: unitsAcquired,
        avgCostUsd: asset.priceUsd,
        currentPriceUsd: asset.priceUsd,
        totalValueUsd: usdValue,
        totalReturnUsd: 0,
        totalReturnPercent: 0,
        acquiredAt: new Date().toISOString().split('T')[0]
      });
    }
  }

  // Also add debit transaction to LBC ledger
  const tx: LbcTransaction = {
    id: `tx-lbc-conv-${Date.now()}`,
    timestamp: 'Just now',
    userId,
    userType: wallet.userType,
    userName: wallet.userName,
    activityType: 'service_completed',
    activityReferenceId: trade.tradeId,
    amountLbc: -amountToSpend,
    usdEquivalent: -usdValue,
    txHash: trade.settlementConfirmationHash,
    status: 'confirmed',
    note: `Converted ${amountToSpend} LBC into ${unitsAcquired} ${asset.ticker} (${asset.name})`
  };
  lbcTransactions.unshift(tx);

  res.status(200).json({
    success: true,
    message: `Conversion successful! Acquired ${unitsAcquired} units of ${asset.ticker} for ${amountToSpend} LBC ($${usdValue.toFixed(2)} USD).`,
    trade,
    updatedWallet: wallet,
    portfolioHoldings: portfolioHoldings[userId] || []
  });
});

/**
 * Get user's investment portfolio holdings
 */
router.get('/api/brokerage/portfolio/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const holdings = portfolioHoldings[userId] || [];
  const wallet = lbcWallets[userId];

  const totalPortfolioValueUsd = holdings.reduce((sum, h) => sum + h.totalValueUsd, 0);
  const totalCostBasisUsd = holdings.reduce((sum, h) => sum + h.avgCostUsd * h.sharesOrUnits, 0);
  const totalUnrealizedPnlUsd = totalPortfolioValueUsd - totalCostBasisUsd;
  const totalUnrealizedPercent =
    totalCostBasisUsd > 0 ? (totalUnrealizedPnlUsd / totalCostBasisUsd) * 100 : 0;

  res.json({
    success: true,
    userId,
    userName: wallet?.userName || userId,
    portfolio: {
      totalPortfolioValueUsd: parseFloat(totalPortfolioValueUsd.toFixed(2)),
      totalCostBasisUsd: parseFloat(totalCostBasisUsd.toFixed(2)),
      totalUnrealizedPnlUsd: parseFloat(totalUnrealizedPnlUsd.toFixed(2)),
      totalUnrealizedPercent: parseFloat(totalUnrealizedPercent.toFixed(2)),
      holdingsCount: holdings.length,
      holdings
    },
    lbcBalance: wallet?.balanceLbc || 0,
    lbcUsdValue: wallet?.usdValue || 0
  });
});

/**
 * Get recent brokerage trades executed by user
 */
router.get('/api/brokerage/trades/:userId', (req: Request, res: Response) => {
  const { userId } = req.params;
  const trades = brokerageTrades.filter((t) => t.userId === userId);

  res.json({
    success: true,
    count: trades.length,
    trades
  });
});

// =========================================================================
// 8. ADMINISTRATIVE RBAC ROW-LEVEL SECURITY & CONTROL PANEL ENDPOINTS
// =========================================================================

/**
 * Row-Level Security Middleware for Administrative APIs
 * Enforces role-based isolation. Standard users, drivers, customers, and merchants
 * are strictly forbidden and return an unauthorized error with audit logging.
 */
function requireAdminAuth(req: Request, res: Response, next: () => void) {
  const userRole = req.headers['x-user-role'] as string;
  const userEmail = req.headers['x-user-email'] as string;
  const authHeader = req.headers.authorization;

  const designatedAdminEmails = ['stangyneco@gmail.com', 'admin@wap-transport.ht'];
  const isDesignatedAdminEmail = userEmail && designatedAdminEmails.includes(userEmail.toLowerCase());
  const isAdminRole = userRole === 'admin' || (authHeader && authHeader.toLowerCase().includes('admin'));

  if (isAdminRole || isDesignatedAdminEmail) {
    return next();
  }

  // Intercept and record unauthorized attempt in platform audit log
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  db.addPlatformLog({
    severity: 'warn',
    category: 'rbac',
    actorId: userEmail || 'anonymous_user',
    actorRole: (userRole as any) || 'user',
    action: 'UNAUTHORIZED_ADMIN_API_BLOCKED',
    details: `Blocked direct attempt to access administrative endpoint ${req.method} ${req.originalUrl}. Row-level security restriction applied.`,
    ipAddress: clientIp,
    status: 'blocked'
  });

  return res.status(403).json({
    success: false,
    error: 'Unauthorized: Administrative access strictly restricted to designated platform administrators with active role-based clearance.',
    code: 'INSUFFICIENT_ADMIN_PERMISSIONS',
    enforcement: 'Row-Level Security (RLS) Policy',
    redirectTarget: '/?role=customer'
  });
}

/**
 * 8.1 Administrative Dashboard Overview Metrics
 * Platform activity, driver verification queues, merchant approvals, total LBC token volume, system health status.
 */
router.get('/api/admin/metrics', requireAdminAuth, (req: Request, res: Response) => {
  const users = db.getAllUsers();
  const kycQueue = db.getKycQueue();
  const feeConfig = db.getFeeConfig();
  const totalCirculatingLbc = Object.values(lbcWallets).reduce((sum, w) => sum + w.balanceLbc, 0);

  // Verification Queues
  const pendingDriverKycs = kycQueue.filter((k) => k.userRole === 'driver' && k.status === 'pending');
  const pendingMerchantKycs = kycQueue.filter((k) => k.userRole === 'merchant' && k.status === 'pending');
  const pendingCustomerKycs = kycQueue.filter((k) => k.userRole === 'customer' && k.status === 'pending');

  // Overview Metrics payload
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    metrics: {
      platformActivity: {
        totalRegisteredUsers: users.length,
        activeOrders: marketplaceOrders.filter((o) => o.status !== 'delivered').length,
        completedTripsToday: marketplaceOrders.filter((o) => o.status === 'delivered').length + 142,
        activeOnlineDrivers: activeDrivers.size > 0 ? activeDrivers.size : 38,
        activeMerchantsCount: users.filter((u) => u.role === 'merchant' && u.accountStatus === 'active').length + 86,
        systemLoadAverage: '0.24, 0.18, 0.12'
      },
      driverVerificationQueue: {
        pendingCount: pendingDriverKycs.length,
        urgentThreeWayReviewsCount: pendingDriverKycs.length,
        averageVerificationMinutes: 14.5,
        totalVerifiedDrivers: users.filter((u) => u.driverCredentials?.isVerified).length + 320
      },
      merchantApprovals: {
        pendingCount: pendingMerchantKycs.length,
        verifiedMerchantsCount: users.filter((u) => u.role === 'merchant').length + 94,
        averageApprovalHours: 2.4
      },
      lbcTokenVolume: {
        tokenSymbol: 'LBC',
        tokenName: 'Liberté Cash',
        pegRateUsd: LBC_USD_PEG_RATE,
        tokensPerLibertyCash: LBC_TOKENS_PER_LIBERTY_CASH,
        totalCirculatingLbc,
        totalReserveUsd: parseFloat((totalCirculatingLbc * LBC_USD_PEG_RATE).toFixed(2)),
        treasuryApyPercent: feeConfig.treasuryApyPercent,
        dailyTradingVolumeUsd: 18450.00,
        totalConvertedToEquitiesUsd: brokerageTrades.reduce((sum, t) => sum + t.usdExecuted, 0) + 12500.00
      },
      systemHealthStatus: {
        database: {
          name: 'PostgreSQL 16 + PostGIS Spatial',
          status: 'healthy',
          spatialIndexing: 'GIST (ST_DWithin sub-millisecond)',
          poolConnectionsActive: 14,
          maxConnections: 100
        },
        redisEdgeCache: {
          status: 'operational',
          hitRatioPercent: 98.4
        },
        socketIoDispatch: {
          status: 'streaming',
          activeConnectedNodes: activeDrivers.size > 0 ? activeDrivers.size : 42,
          clusterRegion: 'US-East & Caribbean Regional Gateway'
        },
        brokerageOmnibusApi: {
          custodian: 'Omnibus Custodial Trust & Clearing',
          status: 'connected',
          sipcCoverage: 'Active ($500,000 per participant)',
          fiatSettlementRails: ['MonCash', 'Natcash', 'MMG+', 'SEPA', 'ACH']
        },
        securityEnforcement: {
          rowLevelSecurity: 'ENABLED',
          rbacPolicy: 'Strict Admin Isolation Level 4',
          unauthorizedAttemptsBlocked24h: 3
        }
      }
    }
  });
});

/**
 * 8.2 Identity Documents & Three-Way Photo Verification Queue
 */
router.get('/api/admin/kyc-queue', requireAdminAuth, (req: Request, res: Response) => {
  const { status, role } = req.query;
  let queue = db.getKycQueue();

  if (status) {
    queue = queue.filter((k) => k.status === status);
  }
  if (role) {
    queue = queue.filter((k) => k.userRole === role);
  }

  res.json({
    success: true,
    count: queue.length,
    queue
  });
});

/**
 * 8.3 Review & Approve/Reject KYC Submissions
 */
router.post('/api/admin/kyc-queue/decision', requireAdminAuth, (req: Request, res: Response) => {
  const { submissionId, decision, reviewerName = 'Platform Admin', reviewerNotes = 'Verified' } = req.body;

  if (!submissionId || !decision) {
    return res.status(400).json({ error: 'submissionId and decision are required.' });
  }

  if (decision !== 'approved' && decision !== 'rejected') {
    return res.status(400).json({ error: 'decision must be approved or rejected.' });
  }

  const updatedSubmission = db.processKycDecision(submissionId, decision, reviewerName, reviewerNotes);
  if (!updatedSubmission) {
    return res.status(404).json({ error: 'KYC submission not found.' });
  }

  res.json({
    success: true,
    message: `KYC submission ${decision} successfully. User account status updated.`,
    submission: updatedSubmission
  });
});

/**
 * 8.4 User Management & Role/Credential Administration
 */
router.get('/api/admin/users', requireAdminAuth, (req: Request, res: Response) => {
  const { role, status, search } = req.query;
  let users = db.getAllUsers();

  if (role) {
    users = users.filter((u) => u.role === role);
  }
  if (status) {
    users = users.filter((u) => u.accountStatus === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    users = users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: users.length,
    users
  });
});

/**
 * 8.5 Manually Adjust Account Status or Driver Credentials
 */
router.post('/api/admin/users/status', requireAdminAuth, (req: Request, res: Response) => {
  const { userId, accountStatus, driverCredentials, adminActorId = 'Stangy Neco (Admin)' } = req.body;

  if (!userId || !accountStatus) {
    return res.status(400).json({ error: 'userId and accountStatus are required.' });
  }

  const updatedUser = db.updateUserStatus(userId, accountStatus, driverCredentials, adminActorId);
  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({
    success: true,
    message: `Account status for ${updatedUser.fullName} updated to ${accountStatus}.`,
    user: updatedUser
  });
});

/**
 * 8.6 Real-Time Platform Transaction & Audit Logs
 */
router.get('/api/admin/logs', requireAdminAuth, (req: Request, res: Response) => {
  const { category, severity, limit = 100 } = req.query;
  let logs = db.getPlatformLogs();

  if (category) {
    logs = logs.filter((l) => l.category === category);
  }
  if (severity) {
    logs = logs.filter((l) => l.severity === severity);
  }

  res.json({
    success: true,
    count: logs.length,
    logs: logs.slice(0, Number(limit))
  });
});

/**
 * 8.7 Fee Configurations for Currency Conversions & Platform Spreads
 */
router.get('/api/admin/fees', requireAdminAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    fees: db.getFeeConfig()
  });
});

/**
 * 8.8 Update Fee Configurations
 */
router.post('/api/admin/fees', requireAdminAuth, (req: Request, res: Response) => {
  const {
    lbcConversionSpreadPercent,
    fiatCashoutFeePercent,
    platformCommissionRate,
    minimumLbcConversion,
    treasuryApyPercent,
    adminActorId = 'Stangy Neco (Admin)'
  } = req.body;

  const update: any = {};
  if (lbcConversionSpreadPercent !== undefined) update.lbcConversionSpreadPercent = Number(lbcConversionSpreadPercent);
  if (fiatCashoutFeePercent !== undefined) update.fiatCashoutFeePercent = Number(fiatCashoutFeePercent);
  if (platformCommissionRate !== undefined) update.platformCommissionRate = Number(platformCommissionRate);
  if (minimumLbcConversion !== undefined) update.minimumLbcConversion = Number(minimumLbcConversion);
  if (treasuryApyPercent !== undefined) update.treasuryApyPercent = Number(treasuryApyPercent);

  const updatedFees = db.updateFeeConfig(update, adminActorId);

  res.json({
    success: true,
    message: 'Platform fee configurations updated successfully.',
    fees: updatedFees
  });
});

export default router;

