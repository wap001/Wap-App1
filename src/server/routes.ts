import { Router, Request, Response } from 'express';
import db, { REGIONS_SEED, REGIONAL_PRICING_SEED, DRIVERS_SEED } from './db';
import { activeDrivers, driverLocations } from './socket';
import {
  BROKERAGE_ASSETS,
  INITIAL_3SIDED_ORDERS,
  INITIAL_LBC_TRANSACTIONS,
  INITIAL_LBC_WALLETS,
  INITIAL_PORTFOLIO_HOLDINGS,
  LBC_REWARD_RULES,
  LBC_TREASURY_APY,
  LBC_USD_PEG_RATE
} from '../data/lbcBrokerageData';
import {
  BrokerageConversionTrade,
  BrokeragePortfolioHolding,
  LbcTransaction,
  MarketplaceOrder3Sided,
  MarketplaceSide
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
      const custLbc = order.lbcRewards.customerLbc;
      lbcWallets[order.customerId].balanceLbc += custLbc;
      lbcWallets[order.customerId].totalEarnedLbc += custLbc;
      lbcWallets[order.customerId].usdValue =
        lbcWallets[order.customerId].balanceLbc * LBC_USD_PEG_RATE;

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
      rewardsDistributed.customer = { lbcEarned: custLbc, newBalance: lbcWallets[order.customerId].balanceLbc };
    }

    // 2. Merchant Reward (if applicable)
    if (order.merchantId && lbcWallets[order.merchantId]) {
      const merchLbc = order.lbcRewards.merchantLbc;
      lbcWallets[order.merchantId].balanceLbc += merchLbc;
      lbcWallets[order.merchantId].totalEarnedLbc += merchLbc;
      lbcWallets[order.merchantId].usdValue =
        lbcWallets[order.merchantId].balanceLbc * LBC_USD_PEG_RATE;

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
      rewardsDistributed.merchant = { lbcEarned: merchLbc, newBalance: lbcWallets[order.merchantId].balanceLbc };
    }

    // 3. Driver Reward
    if (order.driverId && lbcWallets[order.driverId]) {
      const drvLbc = order.lbcRewards.driverLbc;
      lbcWallets[order.driverId].balanceLbc += drvLbc;
      lbcWallets[order.driverId].totalEarnedLbc += drvLbc;
      lbcWallets[order.driverId].usdValue =
        lbcWallets[order.driverId].balanceLbc * LBC_USD_PEG_RATE;

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
      rewardsDistributed.driver = { lbcEarned: drvLbc, newBalance: lbcWallets[order.driverId].balanceLbc };
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
    pegRateUsd: LBC_USD_PEG_RATE,
    treasuryApyPercent: LBC_TREASURY_APY,
    rules: LBC_REWARD_RULES
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
 * Award LBC tokens directly to any user for platform activity
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
      linkedBrokerageAccount: `WAP-BRK-${userId.toUpperCase()}-SIP`
    };
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

export default router;

