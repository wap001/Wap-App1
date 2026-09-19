import {
  BrokerageAsset,
  LbcRewardRule,
  LbcTransaction,
  LbcWallet,
  BrokeragePortfolioHolding,
  MarketplaceOrder3Sided,
  TripartiteRatingRecord,
  ParticipantPerformanceMetric
} from '../types/architecture';

export const LBC_TOKENS_PER_LIBERTY_CASH = 167; // 167 LBC tokens = 1 Liberty Cash
export const LIBERTY_CASH_USD_PEG = 1.00; // 1 Liberty Cash is pegged to 1 USD ($1.00 USD)
export const LBC_USD_PEG_RATE = LIBERTY_CASH_USD_PEG / LBC_TOKENS_PER_LIBERTY_CASH; // 1 LBC = 1/167 USD (~$0.00598802 USD)
export const LBC_TREASURY_APY = 5.2; // 5.2% APY auto-compounding on idle treasury balance
export const LIBERTY_CASH_MIN_PURCHASING_POWER_USD = 0.50; // Guaranteed minimum equivalence of 0.50 USD in local purchasing power floor

export const LBC_REWARD_RULES: LbcRewardRule[] = [
  // RIDES
  {
    activity: 'ride_completed',
    label: 'Passenger Motorcycle Ride Completed',
    side: 'customer',
    baseLbc: 15,
    bonusLbc: 5,
    description: 'Earn 15 LBC per ride + 5 LBC eco/helmet verification bonus (optional reward)',
    usdEquivalent: 0.12 // 20 LBC / 167
  },
  {
    activity: 'ride_completed',
    label: 'Driver Trip Completion & Safe Transit',
    side: 'driver',
    baseLbc: 35,
    bonusLbc: 10,
    description: 'Earn 35 LBC per trip + 10 LBC 5-star passenger rating bonus (optional reward)',
    usdEquivalent: 0.27 // 45 LBC / 167
  },
  // DELIVERIES
  {
    activity: 'delivery_completed',
    label: 'Express Courier & Parcel Delivery',
    side: 'customer',
    baseLbc: 12,
    bonusLbc: 4,
    description: 'Earn 12 LBC per courier shipment booked + 4 LBC off-peak bonus',
    usdEquivalent: 0.10 // 16 LBC / 167
  },
  {
    activity: 'delivery_completed',
    label: 'Express Courier Delivery Fulfillment',
    side: 'driver',
    baseLbc: 30,
    bonusLbc: 8,
    description: 'Earn 30 LBC per parcel delivered + 8 LBC priority transit bonus',
    usdEquivalent: 0.23 // 38 LBC / 167
  },
  // MERCHANT ORDER FULFILLMENT (3-SIDED)
  {
    activity: 'merchant_fulfillment',
    label: 'Merchant Market Order Placement',
    side: 'customer',
    baseLbc: 20,
    bonusLbc: 10,
    description: 'Earn 20 LBC per merchant order + 10 LBC for orders over $25 USD',
    usdEquivalent: 0.18 // 30 LBC / 167
  },
  {
    activity: 'merchant_fulfillment',
    label: 'Merchant Food & Goods Prep Fulfillment',
    side: 'merchant',
    baseLbc: 25,
    bonusLbc: 15,
    description: 'Earn 25 LBC per order fulfilled + 15 LBC rapid prep (<12 mins) bonus',
    usdEquivalent: 0.24 // 40 LBC / 167
  },
  {
    activity: 'merchant_fulfillment',
    label: 'Merchant Order Courier Pickup & Delivery',
    side: 'driver',
    baseLbc: 35,
    bonusLbc: 10,
    description: 'Earn 35 LBC for picking up from merchant and delivering hot/secure',
    usdEquivalent: 0.27 // 45 LBC / 167
  },
  // COMPLETED SERVICES & ERRANDS
  {
    activity: 'service_completed',
    label: 'On-Demand Local Errand / Provisioning Service',
    side: 'customer',
    baseLbc: 18,
    bonusLbc: 6,
    description: 'Earn 18 LBC for completed errand concierge booking',
    usdEquivalent: 0.14 // 24 LBC / 167
  },
  {
    activity: 'service_completed',
    label: 'Local Concierge Errand / Service Completion',
    side: 'driver',
    baseLbc: 40,
    bonusLbc: 15,
    description: 'Earn 40 LBC for completing specialized local concierge errand',
    usdEquivalent: 0.33 // 55 LBC / 167
  },
  {
    activity: 'service_completed',
    label: 'Service Partner Goods Sourcing Fulfillment',
    side: 'merchant',
    baseLbc: 30,
    bonusLbc: 10,
    description: 'Earn 30 LBC for supplying wholesale or retail items for errand runs',
    usdEquivalent: 0.24 // 40 LBC / 167
  }
];

export const BROKERAGE_ASSETS: BrokerageAsset[] = [
  // 1. FRACTIONAL STOCKS
  {
    id: 'stock-nvda',
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    assetClass: 'fractional_stock',
    priceUsd: 118.25,
    change24h: 3.42,
    currency: 'USD',
    exchange: 'NASDAQ',
    description: 'Leading AI semiconductor, GPU computing & accelerated infrastructure giant.',
    minLbcToConvert: 50,
    categoryTag: 'AI & Semiconductors',
    iconSymbol: '💻'
  },
  {
    id: 'stock-aapl',
    ticker: 'AAPL',
    name: 'Apple Inc.',
    assetClass: 'fractional_stock',
    priceUsd: 228.50,
    change24h: 1.15,
    currency: 'USD',
    exchange: 'NASDAQ',
    description: 'Consumer hardware, iOS mobile ecosystem, and digital services titan.',
    minLbcToConvert: 50,
    categoryTag: 'Consumer Tech',
    iconSymbol: '🍎'
  },
  {
    id: 'stock-tsla',
    ticker: 'TSLA',
    name: 'Tesla Inc.',
    assetClass: 'fractional_stock',
    priceUsd: 245.80,
    change24h: -0.85,
    currency: 'USD',
    exchange: 'NASDAQ',
    description: 'Electric vehicles, energy storage, robotics & automated mobility.',
    minLbcToConvert: 50,
    categoryTag: 'Clean Mobility',
    iconSymbol: '⚡'
  },
  {
    id: 'stock-googl',
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    assetClass: 'fractional_stock',
    priceUsd: 179.40,
    change24h: 0.92,
    currency: 'USD',
    exchange: 'NASDAQ',
    description: 'Global search, Google Cloud, Android OS, and generative AI research.',
    minLbcToConvert: 50,
    categoryTag: 'Internet & AI',
    iconSymbol: '🔍'
  },
  {
    id: 'stock-msft',
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    assetClass: 'fractional_stock',
    priceUsd: 432.10,
    change24h: 0.54,
    currency: 'USD',
    exchange: 'NASDAQ',
    description: 'Azure cloud, enterprise productivity, gaming, and OpenAI copilot systems.',
    minLbcToConvert: 50,
    categoryTag: 'Cloud & Enterprise',
    iconSymbol: '🪟'
  },
  {
    id: 'stock-amzn',
    ticker: 'AMZN',
    name: 'Amazon.com Inc.',
    assetClass: 'fractional_stock',
    priceUsd: 188.75,
    change24h: 1.68,
    currency: 'USD',
    exchange: 'NASDAQ',
    description: 'E-commerce logistics powerhouse and AWS cloud computing leader.',
    minLbcToConvert: 50,
    categoryTag: 'Commerce & Logistics',
    iconSymbol: '📦'
  },

  // 2. INDEX & THEMATIC ETFS
  {
    id: 'etf-voo',
    ticker: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    assetClass: 'etf',
    priceUsd: 512.40,
    change24h: 0.74,
    currency: 'USD',
    exchange: 'NYSE Arca',
    description: 'Low-cost fractional ownership of the 500 largest US publicly traded corporations.',
    minLbcToConvert: 50,
    categoryTag: 'US Large Cap',
    iconSymbol: '📈'
  },
  {
    id: 'etf-qqq',
    ticker: 'QQQ',
    name: 'Invesco QQQ Trust (Nasdaq-100)',
    assetClass: 'etf',
    priceUsd: 486.20,
    change24h: 1.12,
    currency: 'USD',
    exchange: 'NASDAQ',
    description: 'Top 100 non-financial companies driving cutting-edge software and hardware.',
    minLbcToConvert: 50,
    categoryTag: 'Tech Growth ETF',
    iconSymbol: '🚀'
  },
  {
    id: 'etf-vt',
    ticker: 'VT',
    name: 'Vanguard Total World Stock ETF',
    assetClass: 'etf',
    priceUsd: 115.80,
    change24h: 0.45,
    currency: 'USD',
    exchange: 'NYSE Arca',
    description: 'Diversified worldwide market exposure spanning 40+ developed & emerging nations.',
    minLbcToConvert: 50,
    categoryTag: 'Global Diversified',
    iconSymbol: '🌍'
  },
  {
    id: 'etf-eem',
    ticker: 'EEM',
    name: 'iShares MSCI Emerging Markets ETF',
    assetClass: 'etf',
    priceUsd: 44.30,
    change24h: 1.82,
    currency: 'USD',
    exchange: 'NYSE Arca',
    description: 'Exposure to large and mid-sized companies in emerging developing economies.',
    minLbcToConvert: 50,
    categoryTag: 'Emerging Markets',
    iconSymbol: '🌱'
  },

  // 3. REGIONAL MARKET ASSETS & DIASPORA BONDS
  {
    id: 'reg-brvm',
    ticker: 'BRVM-C',
    name: 'BRVM West Africa Composite Index',
    assetClass: 'regional_asset',
    priceUsd: 42.50,
    change24h: 2.10,
    currency: 'USD',
    exchange: 'BRVM Abidjan',
    description: 'Benchmark index covering 46 blue-chip equities across Senegal, Ivory Coast & WAEMU.',
    minLbcToConvert: 25,
    categoryTag: 'West Africa Blue-Chip',
    yieldAnnualPercent: 6.8,
    iconSymbol: '🦁'
  },
  {
    id: 'reg-jse',
    ticker: 'JSE-CARICOM',
    name: 'CARICOM Diaspora Blue Chip Index',
    assetClass: 'regional_asset',
    priceUsd: 31.20,
    change24h: 1.48,
    currency: 'USD',
    exchange: 'JSE Kingston',
    description: 'Regional Caribbean equity basket across banking, telecom, and consumer logistics.',
    minLbcToConvert: 25,
    categoryTag: 'Caribbean Equities',
    yieldAnnualPercent: 5.4,
    iconSymbol: '🌴'
  },
  {
    id: 'reg-latam',
    ticker: 'B3-LATAM',
    name: 'Brazil & Guiana Shield Commodities Index',
    assetClass: 'regional_asset',
    priceUsd: 28.90,
    change24h: 0.94,
    currency: 'USD',
    exchange: 'B3 São Paulo',
    description: 'Agricultural commodities, sustainable forestry, and Guiana shield green transition.',
    minLbcToConvert: 25,
    categoryTag: 'LatAm & Guiana Basin',
    yieldAnnualPercent: 7.1,
    iconSymbol: '🦜'
  },
  {
    id: 'reg-cdg-bond',
    ticker: 'CDG-BOND',
    name: 'Caribbean Diaspora Green Energy Bond',
    assetClass: 'regional_asset',
    priceUsd: 100.00,
    change24h: 0.15,
    currency: 'USD',
    exchange: 'Sovereign Debt Clearing',
    description: 'Sovereign-backed microgrid & solar infrastructure bond with guaranteed 7.5% APY payout.',
    minLbcToConvert: 100,
    categoryTag: 'Fixed Income (7.5% APY)',
    yieldAnnualPercent: 7.5,
    iconSymbol: '☀️'
  },
  {
    id: 'reg-ht-micro',
    ticker: 'HT-MICRO',
    name: 'Haiti Microfinance Diaspora Impact Note',
    assetClass: 'regional_asset',
    priceUsd: 50.00,
    change24h: 0.65,
    currency: 'USD',
    exchange: 'Micro-Credit Custody',
    description: 'Capital revolving fund financing motorcycle taxi operators and market women with 8.2% APY.',
    minLbcToConvert: 50,
    categoryTag: 'Social Impact (8.2% APY)',
    yieldAnnualPercent: 8.2,
    iconSymbol: '🤝'
  },

  // 4. LOCAL FIAT CASH PAYOUTS
  {
    id: 'fiat-moncash',
    ticker: 'MONCASH-HTG',
    name: 'Digicel MonCash Instant Cashout',
    assetClass: 'fiat_cashout',
    priceUsd: 1.00,
    change24h: 0.00,
    currency: 'HTG',
    exchange: 'MonCash API Rail',
    description: 'Instant local Haitian Gourdes cash transfer directly to your verified MonCash phone wallet.',
    minLbcToConvert: 20,
    categoryTag: 'Haiti Mobile Money',
    fiatRail: '1 USD = 131.50 HTG',
    iconSymbol: '📱'
  },
  {
    id: 'fiat-natcash',
    ticker: 'NATCASH-HTG',
    name: 'Natcom Natcash Direct Cashout',
    assetClass: 'fiat_cashout',
    priceUsd: 1.00,
    change24h: 0.00,
    currency: 'HTG',
    exchange: 'Natcash Gateway',
    description: 'Direct payout in Gourdes to Natcash mobile account with zero cashout agency fee.',
    minLbcToConvert: 20,
    categoryTag: 'Haiti Mobile Money',
    fiatRail: '1 USD = 132.00 HTG',
    iconSymbol: '📲'
  },
  {
    id: 'fiat-sepa',
    ticker: 'SEPA-EUR',
    name: 'SEPA Instant Euro Payout',
    assetClass: 'fiat_cashout',
    priceUsd: 1.08,
    change24h: 0.10,
    currency: 'EUR',
    exchange: 'European SEPA Banking',
    description: 'Instant credit to any French Guiana / EU IBAN bank account within 10 seconds.',
    minLbcToConvert: 30,
    categoryTag: 'French Guiana / EU',
    fiatRail: '1 USD = 0.925 EUR',
    iconSymbol: '💶'
  },
  {
    id: 'fiat-mmg',
    ticker: 'MMG-GYD',
    name: 'MMG+ Mobile Money Guyana',
    assetClass: 'fiat_cashout',
    priceUsd: 1.00,
    change24h: 0.00,
    currency: 'GYD',
    exchange: 'GTT MMG+ Switch',
    description: 'Instant deposit to Guyana GTT MMG+ mobile wallet usable at 800+ agents nationwide.',
    minLbcToConvert: 25,
    categoryTag: 'Guyana Mobile Money',
    fiatRail: '1 USD = 208.50 GYD',
    iconSymbol: '🇬🇾'
  },
  {
    id: 'fiat-uni5pay',
    ticker: 'UNI5PAY-SRD',
    name: 'Uni5Pay / Telesur Suriname Payout',
    assetClass: 'fiat_cashout',
    priceUsd: 1.00,
    change24h: 0.00,
    currency: 'SRD',
    exchange: 'Southern Commercial Bank',
    description: 'Instant cash payout in Suriname Dollars (SRD) via Uni5Pay QR or ATM voucher.',
    minLbcToConvert: 25,
    categoryTag: 'Suriname Mobile Money',
    fiatRail: '1 USD = 35.60 SRD',
    iconSymbol: '🇸🇷'
  },
  {
    id: 'fiat-dominica-xcd',
    ticker: 'XCD-DOMINICA',
    name: 'Dominica MoBanking / EC$ Payout',
    assetClass: 'fiat_cashout',
    priceUsd: 1.00,
    change24h: 0.00,
    currency: 'XCD',
    exchange: 'National Bank of Dominica Rail',
    description: 'Instant Eastern Caribbean Dollar (EC$) cash payout via NBD MoBanking or Digicel MyCash.',
    minLbcToConvert: 25,
    categoryTag: 'Dominica Mobile Money',
    fiatRail: '1 USD = 2.70 XCD (Guaranteed $0.50 USD Purchasing Floor)',
    iconSymbol: '🇩🇲'
  },
  {
    id: 'fiat-pix-ach',
    ticker: 'PIX-ACH-USD',
    name: 'Pix / ACH / Diaspora Cash Remittance',
    assetClass: 'fiat_cashout',
    priceUsd: 1.00,
    change24h: 0.00,
    currency: 'USD/BRL',
    exchange: 'Diaspora Banking Bridge',
    description: 'Cross-border payout via Pix (Brazil) or ACH / Western Union agent cash pickup.',
    minLbcToConvert: 50,
    categoryTag: 'Diaspora Global Payout',
    fiatRail: '1 USD = 5.45 BRL or $1 USD',
    iconSymbol: '💸'
  }
];

// INITIAL 3-SIDED USER WALLETS (167 LBC = 1 Liberty Cash = 1 USD Peg)
export const INITIAL_LBC_WALLETS: Record<string, LbcWallet> = {
  driver_moise: {
    userId: 'driver_moise',
    userType: 'driver',
    userName: 'Jean-Baptiste Moïse (Driver)',
    balanceLbc: 2450,
    totalEarnedLbc: 3820,
    usdValue: 14.67, // 2450 / 167
    annualYieldApy: LBC_TREASURY_APY,
    stakingRewardsEarned: 1.11,
    linkedBrokerageAccount: 'WAP-BRK-DRV-88219-SIP',
    earningLbcEnabled: true // Earning LBC tokens is optional
  },
  customer_fabienne: {
    userId: 'customer_fabienne',
    userType: 'customer',
    userName: 'Fabienne Voltaire (Customer)',
    balanceLbc: 920,
    totalEarnedLbc: 1340,
    usdValue: 5.51, // 920 / 167
    annualYieldApy: LBC_TREASURY_APY,
    stakingRewardsEarned: 0.43,
    linkedBrokerageAccount: 'WAP-BRK-CST-44102-SIP',
    earningLbcEnabled: true // Earning LBC tokens is optional
  },
  merchant_chef_fifi: {
    userId: 'merchant_chef_fifi',
    userType: 'merchant',
    userName: 'Chef Fifi - Chez Fifi Resto (Merchant)',
    balanceLbc: 4850,
    totalEarnedLbc: 7200,
    usdValue: 29.04, // 4850 / 167
    annualYieldApy: LBC_TREASURY_APY,
    stakingRewardsEarned: 2.18,
    linkedBrokerageAccount: 'WAP-BRK-MCH-99304-SIP',
    earningLbcEnabled: true // Earning LBC tokens is optional
  }
};

// INITIAL PORTFOLIO HOLDINGS
export const INITIAL_PORTFOLIO_HOLDINGS: Record<string, BrokeragePortfolioHolding[]> = {
  driver_moise: [
    {
      id: 'hold_drv_1',
      assetId: 'stock-nvda',
      ticker: 'NVDA',
      name: 'NVIDIA Corporation',
      assetClass: 'fractional_stock',
      sharesOrUnits: 0.65,
      avgCostUsd: 110.00,
      currentPriceUsd: 118.25,
      totalValueUsd: 76.86,
      totalReturnUsd: 5.36,
      totalReturnPercent: 7.5,
      acquiredAt: '2026-08-14'
    },
    {
      id: 'hold_drv_2',
      assetId: 'reg-cdg-bond',
      ticker: 'CDG-BOND',
      name: 'Caribbean Diaspora Green Energy Bond',
      assetClass: 'regional_asset',
      sharesOrUnits: 1.0,
      avgCostUsd: 100.00,
      currentPriceUsd: 100.00,
      totalValueUsd: 100.00,
      totalReturnUsd: 3.75,
      totalReturnPercent: 3.75,
      acquiredAt: '2026-07-20'
    }
  ],
  customer_fabienne: [
    {
      id: 'hold_cst_1',
      assetId: 'etf-voo',
      ticker: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      assetClass: 'etf',
      sharesOrUnits: 0.12,
      avgCostUsd: 495.00,
      currentPriceUsd: 512.40,
      totalValueUsd: 61.49,
      totalReturnUsd: 2.09,
      totalReturnPercent: 3.51,
      acquiredAt: '2026-08-01'
    }
  ],
  merchant_chef_fifi: [
    {
      id: 'hold_mch_1',
      assetId: 'stock-aapl',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      assetClass: 'fractional_stock',
      sharesOrUnits: 1.15,
      avgCostUsd: 215.00,
      currentPriceUsd: 228.50,
      totalValueUsd: 262.78,
      totalReturnUsd: 15.53,
      totalReturnPercent: 6.28,
      acquiredAt: '2026-06-15'
    },
    {
      id: 'hold_mch_2',
      assetId: 'reg-brvm',
      ticker: 'BRVM-C',
      name: 'BRVM West Africa Composite Index',
      assetClass: 'regional_asset',
      sharesOrUnits: 3.5,
      avgCostUsd: 39.00,
      currentPriceUsd: 42.50,
      totalValueUsd: 148.75,
      totalReturnUsd: 12.25,
      totalReturnPercent: 8.97,
      acquiredAt: '2026-07-04'
    }
  ]
};

// INITIAL 3-SIDED MARKETPLACE ORDERS
export const INITIAL_3SIDED_ORDERS: MarketplaceOrder3Sided[] = [
  {
    id: 'ord-3s-101',
    type: 'merchant_goods',
    title: 'Griot Espesyal & Akra Platter (Chez Fifi Resto)',
    customerId: 'customer_fabienne',
    customerName: 'Fabienne Voltaire',
    customerPhone: '+509 3712-4491',
    merchantId: 'merchant_chef_fifi',
    merchantName: 'Chef Fifi - Chez Fifi Resto',
    driverId: 'driver_moise',
    driverName: 'Jean-Baptiste Moïse',
    driverVehicle: 'Haojue 125cc (TP-9821)',
    items: [
      { name: 'Griot Espesyal ak Bannann Peze', quantity: 2, price: 450 },
      { name: 'Pikliz & Akra Koulè', quantity: 1, price: 150 },
      { name: 'Ji Papay Fre', quantity: 2, price: 120 }
    ],
    subtotal: 1290,
    deliveryFee: 250,
    total: 1540,
    currency: 'HTG',
    status: 'driver_assigned',
    pickupLandmark: 'Rue Capois #45, Devant Rex Théâtre',
    dropoffLandmark: 'Av. Panamericaine, Pétion-Ville',
    distanceKm: 4.8,
    lbcRewards: {
      customerLbc: 20,
      merchantLbc: 25,
      driverLbc: 35
    },
    createdAt: '12 mins ago'
  },
  {
    id: 'ord-3s-102',
    type: 'merchant_goods',
    title: 'Urgent Antibiotic & First-Aid Kit',
    customerId: 'customer_fabienne',
    customerName: 'Fabienne Voltaire',
    customerPhone: '+509 3712-4491',
    merchantId: 'merch_pharma_01',
    merchantName: 'Pharmacie Nouvelle Jérusalem',
    driverId: 'driver_moise',
    driverName: 'Jean-Baptiste Moïse',
    driverVehicle: 'Haojue 125cc (TP-9821)',
    items: [
      { name: 'Amoxicilline 500mg (Boîte de 20)', quantity: 1, price: 550 },
      { name: 'Bande Stérile & Alcool 70%', quantity: 2, price: 180 }
    ],
    subtotal: 910,
    deliveryFee: 200,
    total: 1110,
    currency: 'HTG',
    status: 'in_transit',
    pickupLandmark: 'Angle Delmas 33, Face Digicel Store',
    dropoffLandmark: 'Delmas 75, Ruelle Rivière #12',
    distanceKm: 3.2,
    lbcRewards: {
      customerLbc: 20,
      merchantLbc: 25,
      driverLbc: 35
    },
    createdAt: '24 mins ago'
  },
  {
    id: 'ord-3s-103',
    type: 'ride',
    title: 'Express Passenger Ride to Carrefour Aeroport',
    customerId: 'customer_fabienne',
    customerName: 'Fabienne Voltaire',
    customerPhone: '+509 3712-4491',
    driverId: 'driver_moise',
    driverName: 'Jean-Baptiste Moïse',
    driverVehicle: 'Haojue 125cc (TP-9821)',
    subtotal: 450,
    deliveryFee: 0,
    total: 450,
    currency: 'HTG',
    status: 'delivered',
    pickupLandmark: 'Champ de Mars, Stand Tricentenaire',
    dropoffLandmark: 'Aéroport International Toussaint Louverture',
    distanceKm: 6.5,
    lbcRewards: {
      customerLbc: 15,
      merchantLbc: 0,
      driverLbc: 35
    },
    createdAt: '1 hour ago',
    completedAt: '42 mins ago'
  }
];

// INITIAL RECENT LBC TRANSACTIONS LEDGER (167 LBC = 1 Liberty Cash = $1 USD Peg)
export const INITIAL_LBC_TRANSACTIONS: LbcTransaction[] = [
  {
    id: 'tx-lbc-9901',
    timestamp: 'Just now',
    userId: 'driver_moise',
    userType: 'driver',
    userName: 'Jean-Baptiste Moïse',
    activityType: 'ride_completed',
    activityReferenceId: 'ord-3s-103',
    amountLbc: 35,
    usdEquivalent: 0.21, // 35 / 167
    txHash: '0x7e8b9...f4a1c',
    status: 'confirmed',
    note: 'Ride completion payout to driver wallet (+35 LBC)'
  },
  {
    id: 'tx-lbc-9902',
    timestamp: 'Just now',
    userId: 'customer_fabienne',
    userType: 'customer',
    userName: 'Fabienne Voltaire',
    activityType: 'ride_completed',
    activityReferenceId: 'ord-3s-103',
    amountLbc: 15,
    usdEquivalent: 0.09, // 15 / 167
    txHash: '0x3c11d...e882a',
    status: 'confirmed',
    note: 'Ride completed customer reward rebate (+15 LBC)'
  },
  {
    id: 'tx-lbc-9903',
    timestamp: '18 mins ago',
    userId: 'merchant_chef_fifi',
    userType: 'merchant',
    userName: 'Chef Fifi (Chez Fifi Resto)',
    activityType: 'merchant_fulfillment',
    activityReferenceId: 'ord-3s-101',
    amountLbc: 40, // 25 base + 15 rapid prep
    usdEquivalent: 0.24, // 40 / 167
    txHash: '0x992fa...11c09',
    status: 'confirmed',
    note: 'Merchant fast prep (<10m) & order fulfillment bonus (+40 LBC)'
  },
  {
    id: 'tx-lbc-9904',
    timestamp: '45 mins ago',
    userId: 'driver_moise',
    userType: 'driver',
    userName: 'Jean-Baptiste Moïse',
    activityType: 'merchant_fulfillment',
    activityReferenceId: 'ord-3s-102',
    amountLbc: 35,
    usdEquivalent: 0.21, // 35 / 167
    txHash: '0x44aa2...8831f',
    status: 'confirmed',
    note: 'Delivery fulfillment from Pharmacy to Delmas 75 (+35 LBC)'
  },
  {
    id: 'tx-lbc-9905',
    timestamp: '2 hours ago',
    userId: 'customer_fabienne',
    userType: 'customer',
    userName: 'Fabienne Voltaire',
    activityType: 'merchant_fulfillment',
    activityReferenceId: 'ord-3s-101',
    amountLbc: 20,
    usdEquivalent: 0.12, // 20 / 167
    txHash: '0x66f12...b0994',
    status: 'confirmed',
    note: 'Customer food delivery order reward cashback (+20 LBC)'
  },
  {
    id: 'tx-lbc-9906',
    timestamp: '3 hours ago',
    userId: 'driver_moise',
    userType: 'driver',
    userName: 'Jean-Baptiste Moïse',
    activityType: 'streak_bonus',
    activityReferenceId: 'streak-5star-aug',
    amountLbc: 50,
    usdEquivalent: 0.30, // 50 / 167
    txHash: '0x11cc4...77e92',
    status: 'confirmed',
    note: 'Weekly 5-Star Zero-Cancellation Driver Performance Streak (+50 LBC)'
  },
  {
    id: 'tx-lbc-9907',
    timestamp: 'Yesterday',
    userId: 'customer_fabienne',
    userType: 'customer',
    userName: 'Fabienne Voltaire',
    activityType: 'rating_bonus',
    activityReferenceId: 'rate-3w-001',
    amountLbc: 25,
    usdEquivalent: 0.15, // 25 / 167
    txHash: '0x88bb3...44d21',
    status: 'confirmed',
    note: '5-Star rating feedback bonus (+25 LBC)'
  }
];

export const INITIAL_3WAY_RATINGS: TripartiteRatingRecord[] = [
  {
    id: 'rate-3w-001',
    orderId: 'ord-3s-101',
    timestamp: '15 mins ago',
    fromRole: 'customer',
    fromName: 'Fabienne Voltaire',
    toRole: 'driver',
    toName: 'Jean-Baptiste Moïse',
    overallStars: 5,
    punctualityScore: 5,
    communicationScore: 5,
    reliabilityOrQualityScore: 5,
    comment: 'Exceptional riding safety through traffic, helmet provided, polite greeting!',
    bonusLbcAwarded: 15
  },
  {
    id: 'rate-3w-002',
    orderId: 'ord-3s-101',
    timestamp: '16 mins ago',
    fromRole: 'customer',
    fromName: 'Fabienne Voltaire',
    toRole: 'merchant',
    toName: 'Chef Fifi (Chez Fifi Resto)',
    overallStars: 5,
    punctualityScore: 5,
    communicationScore: 5,
    reliabilityOrQualityScore: 5,
    comment: 'Griot was piping hot, sauce securely sealed with biodegradable container!',
    bonusLbcAwarded: 15
  },
  {
    id: 'rate-3w-003',
    orderId: 'ord-3s-101',
    timestamp: '18 mins ago',
    fromRole: 'driver',
    fromName: 'Jean-Baptiste Moïse',
    toRole: 'merchant',
    toName: 'Chef Fifi (Chez Fifi Resto)',
    overallStars: 5,
    punctualityScore: 5,
    communicationScore: 5,
    reliabilityOrQualityScore: 5,
    comment: 'Order ready right at the dispatch pickup counter, zero wait time for rider!',
    bonusLbcAwarded: 15
  },
  {
    id: 'rate-3w-004',
    orderId: 'ord-3s-101',
    timestamp: '20 mins ago',
    fromRole: 'driver',
    fromName: 'Jean-Baptiste Moïse',
    toRole: 'customer',
    toName: 'Fabienne Voltaire',
    overallStars: 5,
    punctualityScore: 5,
    communicationScore: 5,
    reliabilityOrQualityScore: 5,
    comment: 'Clear landmark instructions given, met curbside immediately with smile.',
    bonusLbcAwarded: 10
  },
  {
    id: 'rate-3w-005',
    orderId: 'ord-3s-101',
    timestamp: '22 mins ago',
    fromRole: 'merchant',
    fromName: 'Chef Fifi (Chez Fifi Resto)',
    toRole: 'driver',
    toName: 'Jean-Baptiste Moïse',
    overallStars: 5,
    punctualityScore: 5,
    communicationScore: 5,
    reliabilityOrQualityScore: 5,
    comment: 'Equipped with insulated thermal bag, verified order number accurately.',
    bonusLbcAwarded: 15
  },
  {
    id: 'rate-3w-006',
    orderId: 'ord-3s-102',
    timestamp: '1 hour ago',
    fromRole: 'customer',
    fromName: 'Dr. Réginald B.',
    toRole: 'driver',
    toName: 'Jean-Baptiste Moïse',
    overallStars: 5,
    punctualityScore: 5,
    communicationScore: 5,
    reliabilityOrQualityScore: 5,
    comment: 'Medicine delivered promptly and securely. Reliable community partner.',
    bonusLbcAwarded: 15
  }
];

export const INITIAL_PERFORMANCE_METRICS: ParticipantPerformanceMetric[] = [
  {
    id: 'driver_moise',
    role: 'driver',
    name: 'Jean-Baptiste Moïse',
    avatarIcon: '🏍️',
    ratingAverage: 4.96,
    totalTripsOrOrders: 642,
    metricLabel: 'Driver Efficiency & Safety',
    metricValue: '98.8% On-Time Completion',
    tierBadge: 'Elite Platinum',
    streakWeeks: 9,
    bonusLbcDistributed: 380,
    financialFreedomSummary: 'Your high efficiency has grown your LBC balance toward your goal of fractional S&P 500 ownership!'
  },
  {
    id: 'customer_fabienne',
    role: 'customer',
    name: 'Fabienne Voltaire',
    avatarIcon: '⭐',
    ratingAverage: 4.98,
    totalTripsOrOrders: 128,
    metricLabel: 'Customer Reliability & Courtesy',
    metricValue: '99.5% Curbside Punctuality',
    tierBadge: 'Elite Platinum',
    streakWeeks: 6,
    bonusLbcDistributed: 190,
    financialFreedomSummary: 'Reliable order pickups generate passive LBC savings, building an accessible investment portfolio.'
  },
  {
    id: 'merchant_chef_fifi',
    role: 'merchant',
    name: 'Chef Fifi (Chez Fifi Resto)',
    avatarIcon: '🍲',
    ratingAverage: 4.92,
    totalTripsOrOrders: 415,
    metricLabel: 'Merchant Fulfillment Speed',
    metricValue: '7.8 min Avg Kitchen Dispatch',
    tierBadge: 'Gold Star',
    streakWeeks: 7,
    bonusLbcDistributed: 310,
    financialFreedomSummary: 'Rapid prep times earn daily LBC rewards, creating a business growth reserve and treasury yield.'
  }
];
