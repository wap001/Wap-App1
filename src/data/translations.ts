import { LanguageCode } from '../types/architecture';

export interface TranslationSet {
  appName: string;
  tagline: string;
  architectureBlueprint: string;
  liveSimulator: string;
  customerApp: string;
  driverApp: string;
  vendorPortal: string;
  databaseSchema: string;
  googleMapsSpec: string;
  paymentGateways: string;
  offlineSync: string;
  
  // Customer flow
  bookRide: string;
  sendPackage: string;
  orderVendor: string;
  whereTo: string;
  pickupLocation: string;
  destinationLocation: string;
  landmarkHint: string;
  estimatedFare: string;
  paymentMethod: string;
  findingNearbyDriver: string;
  driverAssigned: string;
  driverEnRoute: string;
  motoTaxi: string;
  expressParcel: string;
  safetyHelmetRequired: string;
  
  // Driver flow
  goOnline: string;
  goOffline: string;
  newRideRequest: string;
  acceptRide: string;
  decline: string;
  navigatingToPickup: string;
  startTrip: string;
  completeTrip: string;
  collectCash: string;
  earningsToday: string;
  offlineQueueNotice: string;
  
  // Vendor flow
  vendorDirectory: string;
  openOrders: string;
  dispatchMoto: string;
  preparingOrder: string;
  riderAssignedToPickup: string;
  menuInventory: string;
  dailyRevenue: string;

  // Audio / Speech
  voicePrompt: string;
  audioGuide: string;

  // Ride Cancellation & Safety Modal
  cancelRide: string;
  cancelRideConfirmationTitle: string;
  cancelRideWarning: string;
  cancelRideDriverEnRoute: string;
  cancelRidePolicyNotice: string;
  cancelReasonPrompt: string;
  cancelReasonTooFar: string;
  cancelReasonChangeOfPlans: string;
  cancelReasonWrongLocation: string;
  cancelReasonSafetyConcern: string;
  cancelReasonMistake: string;
  keepRide: string;
  confirmCancel: string;
  cancelAudioNotice: string;
  rideCancelledSuccess: string;

  // Post-Ride Rating Screen
  rateYourTrip: string;
  howWasYourDriver: string;
  ratingPoor: string;
  ratingFair: string;
  ratingGood: string;
  ratingVeryGood: string;
  ratingExcellent: string;
  ratingFeedbackPlaceholder: string;
  submitRating: string;
  skipRating: string;
  ratingSubmittedSuccess: string;
  tagSafeDriving: string;
  tagPoliteFriendly: string;
  tagCleanHelmet: string;
  tagFastRoute: string;

  // Share Trip Feature
  shareTrip: string;
  shareTripModalTitle: string;
  shareTripSubtitle: string;
  shareTripLinkCopied: string;
  copyTrackingLink: string;
  shareViaWhatsApp: string;
  shareViaSMS: string;
  shareTripSafetyNote: string;

  // Driver Ride History Feature
  driverRideHistory: string;
  driverRideHistorySubtitle: string;
  totalTripsCompleted: string;
  totalNetEarnings: string;
  totalDistanceDriven: string;
  averageRating: string;
  allTrips: string;
  completedTrips: string;
  cancelledTrips: string;
  backToRadar: string;
  viewReceipt: string;
  tripsCompleted: string;
  dispatchRadar: string;
  viewAllHistory: string;
  filterAll: string;
  filterCompleted: string;
  filterDigital: string;
  filterCash: string;
  filterCancelled: string;
  noRidesFound: string;
  completedBadge: string;
  cancelledBadge: string;
  grossFare: string;
  platformFee: string;
  driverTip: string;
  netEarnings: string;

  // 3-Sided Marketplace & Liberté Cash (LBC) Brokerage
  liberteCash: string;
  lbcBalance: string;
  earnLbcRewards: string;
  convertLbcBrokerage: string;
  marketplace3Sided: string;
  fractionalStocks: string;
  etfIndexFunds: string;
  regionalAssets: string;
  localFiatCashout: string;
  convertTokens: string;
  portfolioValue: string;
  activeOrderFulfillment: string;
}

export const translations: Record<LanguageCode, TranslationSet> = {
  ht: {
    appName: 'Wap',
    tagline: 'Motosiklis sou kòmand, livrezon ak kous pou kominote nou an',
    architectureBlueprint: 'Achitekti Sistèm',
    liveSimulator: 'Similatè Platfòm',
    customerApp: 'Aplikasyon Kliyan',
    driverApp: 'Aplikasyon Chofè (Moto)',
    vendorPortal: 'Pòtay Machann',
    databaseSchema: 'Estrikti Bazdone',
    googleMapsSpec: 'Entegrasyon Google Maps',
    paymentGateways: 'Peman Lokal & MonCash',
    offlineSync: 'Kach & Fonksyònman San Entènèt',
    
    bookRide: 'Pran yon Moto (Wap Ride)',
    sendPackage: 'Voye yon Pakè (Wap Express)',
    orderVendor: 'Kòmande nan Boutik/Machann',
    whereTo: 'Kote w prale?',
    pickupLocation: 'Kote pou pran w (Pwen Depa)',
    destinationLocation: 'Kote w prale (Destinasyon)',
    landmarkHint: 'Mete yon referans (pa egzanp: Akote legliz la, Devan mache a)',
    estimatedFare: 'Pri Estimasyon',
    paymentMethod: 'Mwayen Peman',
    findingNearbyDriver: 'N ap chèche yon motosiklis pre w...',
    driverAssigned: 'Chofè Wap la sou wout!',
    driverEnRoute: 'Chofè a ap rive sou ou nan',
    motoTaxi: 'Motosiklèt Wap',
    expressParcel: 'Livrezon Rapid',
    safetyHelmetRequired: 'Kas sekirite obligatwa pou tout pasaje',
    
    goOnline: 'Mete w Disponib',
    goOffline: 'Fèmen Sèvis',
    newRideRequest: 'Nouvo Kous Disponib!',
    acceptRide: 'Aksepte Kous la',
    decline: 'Refize',
    navigatingToPickup: 'Vire sou pwen kote kliyan an ye a',
    startTrip: 'Kòmanse Vwayaj la',
    completeTrip: 'Vwayaj Fini',
    collectCash: 'Resevwa Lajan Kach',
    earningsToday: 'Kòb ou fè jodi a',
    offlineQueueNotice: 'Ou pa gen rezo; done yo anrejistre lokalman e y ap voye lè gen rezo.',
    
    vendorDirectory: 'Lis Machann & Restoran',
    openOrders: 'Kòmand Ki Louvri',
    dispatchMoto: 'Mande yon Moto pou livrezon',
    preparingOrder: 'N ap prepare kòmand lan',
    riderAssignedToPickup: 'Motosiklis la rive pran pakè a',
    menuInventory: 'Meni & Pwodwi',
    dailyRevenue: 'Revni Jounen an',
    
    voicePrompt: 'Koute enstriksyon vokal la',
    audioGuide: 'Gid Vokal Kreyòl',

    // Ride Cancellation & Safety Modal
    cancelRide: 'Anile Kous la',
    cancelRideConfirmationTitle: 'Èske w sèten ou vle anile kous la?',
    cancelRideWarning: 'Chofè Wap la deja sou wout pou li vin chèche w. Pou sekirite ak respè travay chofè a, tanpri konfime si w vle anile vrèman.',
    cancelRideDriverEnRoute: 'Chofè Wap la ap deplase vin sou ou',
    cancelRidePolicyNotice: 'Règleman Sekirite Wap: Si w anile apre 2 minit, yon ti frè dedomajman ka aplike pou kouvri depans gaz ak tan deplasman chofè a.',
    cancelReasonPrompt: 'Tanpri chwazi rezon ki fè w ap anile a:',
    cancelReasonTooFar: 'Chofè a twò lwen / ap pran twòp tan pou l rive',
    cancelReasonChangeOfPlans: 'Plan mwen chanje / Mwen pa bezwen kous la ankò',
    cancelReasonWrongLocation: 'Mwen te mete yon move pwen depa oswa move referans',
    cancelReasonSafetyConcern: 'Enkyetid sou sekirite oswa kondisyon motosiklèt la',
    cancelReasonMistake: 'Mwen te kòmande pa erè',
    keepRide: 'Non, Kenbe Kous la',
    confirmCancel: 'Wi, Anile Kous la',
    cancelAudioNotice: 'Atansyon: Chofè w la deja sou wout. Èske w sèten ou vle anile kous la?',
    rideCancelledSuccess: 'Kous la anile avèk siksè. Nou enfòme chofè a pou l pa kontinye wout la.',

    // Post-Ride Rating Screen
    rateYourTrip: 'Ki nòt ou bay kous la?',
    howWasYourDriver: 'Kijan kous la te pase ak chofè a?',
    ratingPoor: 'Trè Pòv',
    ratingFair: 'Pasab',
    ratingGood: 'Bon',
    ratingVeryGood: 'Trè Bon',
    ratingExcellent: 'Ekselan',
    ratingFeedbackPlaceholder: 'Kite yon kòmantè sou konpòtman chofè a oswa sèvis la (opsyonèl)...',
    submitRating: 'Voye Evalyasyon an',
    skipRating: 'Sote etap sa a',
    ratingSubmittedSuccess: 'Mèsi anpil pou evalyasyon ou! Sa ede nou garanti sekirite ak kalite sèvis Wap la.',
    tagSafeDriving: 'Kondwi Pridan',
    tagPoliteFriendly: 'Chofè Janti & Respektè',
    tagCleanHelmet: 'Kas Pwòp Bay',
    tagFastRoute: 'Wout Rapid & Eficas',

    // Share Trip Feature
    shareTrip: 'Pataje Kous la',
    shareTripModalTitle: 'Pataje Wout Kous la an Dirèk',
    shareTripSubtitle: 'Pèmèt yon fanmi oswa yon zanmi swiv kous ou ak kote w ye an tan reyèl pou plis sekirite.',
    shareTripLinkCopied: 'Lyen swivi a kopye nan klipbòd ou!',
    copyTrackingLink: 'Kopye Lyen Swivi an Dirèk',
    shareViaWhatsApp: 'Pataje sou WhatsApp',
    shareViaSMS: 'Voye pa SMS',
    shareTripSafetyNote: 'Fanmi w ap ka wè non chofè a, plak moto a, kote w ye sou kat la ak bouton sekirite.',

    // Driver Ride History Feature
    driverRideHistory: 'Istorik Kous Chofè a',
    driverRideHistorySubtitle: 'Gade tout ansyen kous ou te fè yo, kòb ou touche ak kòmantè pasaje yo.',
    totalTripsCompleted: 'Kous Fini',
    totalNetEarnings: 'Total Kòb Nèt',
    totalDistanceDriven: 'Distans Fèt',
    averageRating: 'Mwayèn Nòt',
    allTrips: 'Tout Kous yo',
    completedTrips: 'Kous Fini',
    cancelledTrips: 'Kous Anile',
    backToRadar: 'Retounen sou Radar Kous',
    viewReceipt: 'Resi Kous la',
    tripsCompleted: 'Kous Fini',
    dispatchRadar: 'Radar Kous',
    viewAllHistory: 'Gade Tout Istorik',
    filterAll: 'Tout',
    filterCompleted: 'Fini',
    filterDigital: 'MonCash/Divilje',
    filterCash: 'Kach',
    filterCancelled: 'Anile',
    noRidesFound: 'Pa gen kous nan filtè sa a',
    completedBadge: 'Fini',
    cancelledBadge: 'Anile',
    grossFare: 'Pri Mèt la',
    platformFee: 'Frè Wap',
    driverTip: 'Pouspous (Tip)',
    netEarnings: 'Kòb Nèt Ou',

    // 3-Sided Marketplace & Liberté Cash (LBC) Brokerage
    liberteCash: 'Liberté Cash (LBC)',
    lbcBalance: 'Balans LBC',
    earnLbcRewards: 'Resevwa Rekonpans LBC',
    convertLbcBrokerage: 'Konvèti nan Aksyon & Kòb Kach',
    marketplace3Sided: 'Mache Tri-Patit (Kliyan, Chofè, Machann)',
    fractionalStocks: 'Aksyon Fraksyonèl (US & Global)',
    etfIndexFunds: 'Endèks & Fon ETF',
    regionalAssets: 'Byen Rejyon Diaspora & Obligasyon',
    localFiatCashout: 'Retrè Kòb Kach Lokal (MonCash / SEPA)',
    convertTokens: 'Konvèti Jetons LBC',
    portfolioValue: 'Valè Pòtfolyo Envestisman',
    activeOrderFulfillment: 'Lòd nan Preparasyon & Livrezon',
  },
  fr: {
    appName: 'Wap',
    tagline: 'Transport moto et livraisons à la demande pour nos communautés',
    architectureBlueprint: 'Architecture Système',
    liveSimulator: 'Simulateur Plateforme',
    customerApp: 'Application Client',
    driverApp: 'Application Chauffeur Moto',
    vendorPortal: 'Portail Commerçant',
    databaseSchema: 'Structure Base de Données',
    googleMapsSpec: 'Intégration Google Maps',
    paymentGateways: 'Passerelles de Paiement',
    offlineSync: 'Cache & Mode Hors-Ligne',
    
    bookRide: 'Commander un Moto-Taxi',
    sendPackage: 'Envoyer un Colis',
    orderVendor: 'Commander chez un Commerçant',
    whereTo: 'Où souhaitez-vous aller ?',
    pickupLocation: 'Point de départ',
    destinationLocation: 'Destination',
    landmarkHint: 'Indiquez un repère (ex: Près de la pharmacie, en face de l’école)',
    estimatedFare: 'Tarif estimé',
    paymentMethod: 'Mode de paiement',
    findingNearbyDriver: 'Recherche d’un motard à proximité...',
    driverAssigned: 'Chauffeur trouvé !',
    driverEnRoute: 'Votre motard arrive dans',
    motoTaxi: 'Moto Wap Express',
    expressParcel: 'Livraison Rapide',
    safetyHelmetRequired: 'Casque de sécurité obligatoire pour le passager',
    
    goOnline: 'Passer en ligne',
    goOffline: 'Se déconnecter',
    newRideRequest: 'Nouvelle course disponible !',
    acceptRide: 'Accepter la course',
    decline: 'Refuser',
    navigatingToPickup: 'En route vers le client',
    startTrip: 'Démarrer la course',
    completeTrip: 'Terminer la course',
    collectCash: 'Encaisser le montant',
    earningsToday: 'Gains du jour',
    offlineQueueNotice: 'Connexion réseau instable : enregistrement local avec synchronisation automatique.',
    
    vendorDirectory: 'Répertoire Commerçants',
    openOrders: 'Commandes en cours',
    dispatchMoto: 'Appeler un coursier moto',
    preparingOrder: 'Commande en préparation',
    riderAssignedToPickup: 'Motard en route pour le retrait',
    menuInventory: 'Catalogue & Stocks',
    dailyRevenue: 'Chiffre d’affaires',
    
    voicePrompt: 'Écouter la consigne vocale',
    audioGuide: 'Guide Audio Français',

    // Ride Cancellation & Safety Modal
    cancelRide: 'Annuler la course',
    cancelRideConfirmationTitle: 'Êtes-vous sûr de vouloir annuler la course ?',
    cancelRideWarning: 'Votre motard Wap est déjà en route vers votre point de prise en charge. Pour garantir la sécurité et le respect du travail du chauffeur, veuillez confirmer l’annulation.',
    cancelRideDriverEnRoute: 'Le motard Wap est en route vers vous',
    cancelRidePolicyNotice: 'Politique de sécurité Wap : Après 2 minutes, des frais d’annulation équitables peuvent être appliqués pour compenser le carburant et le temps de trajet du motard.',
    cancelReasonPrompt: 'Veuillez sélectionner le motif de l’annulation :',
    cancelReasonTooFar: 'Le chauffeur est trop loin / met trop de temps à arriver',
    cancelReasonChangeOfPlans: 'Changement de programme / Plus besoin de transport',
    cancelReasonWrongLocation: 'Repère ou adresse de départ erronée',
    cancelReasonSafetyConcern: 'Inquiétude liée à la sécurité ou à l’état du véhicule',
    cancelReasonMistake: 'Commande effectuée par erreur',
    keepRide: 'Non, conserver la course',
    confirmCancel: 'Oui, annuler la course',
    cancelAudioNotice: 'Attention : Votre motard est déjà en route. Êtes-vous sûr de vouloir annuler la course ?',
    rideCancelledSuccess: 'Course annulée avec succès. Le chauffeur a été immédiatement averti.',

    // Post-Ride Rating Screen
    rateYourTrip: 'Évaluez votre course',
    howWasYourDriver: 'Comment s’est déroulée votre course avec le chauffeur ?',
    ratingPoor: 'Médiocre',
    ratingFair: 'Passable',
    ratingGood: 'Bonne',
    ratingVeryGood: 'Très bonne',
    ratingExcellent: 'Excellente',
    ratingFeedbackPlaceholder: 'Laissez un commentaire sur le trajet ou la conduite (optionnel)...',
    submitRating: 'Envoyer l’avis',
    skipRating: 'Passer',
    ratingSubmittedSuccess: 'Merci pour votre évaluation ! Cela permet de maintenir nos standards de sécurité et de qualité.',
    tagSafeDriving: 'Conduite Prudente',
    tagPoliteFriendly: 'Courtois & Respectueux',
    tagCleanHelmet: 'Casque Propre Fourni',
    tagFastRoute: 'Trajet Optimal & Efficace',

    // Share Trip Feature
    shareTrip: 'Partager la Course',
    shareTripModalTitle: 'Partager le Trajet en Direct',
    shareTripSubtitle: 'Permettez à vos proches de suivre votre itinéraire et position GPS en direct pour votre sécurité.',
    shareTripLinkCopied: 'Lien de suivi copié dans le presse-papiers !',
    copyTrackingLink: 'Copier le Lien de Suivi',
    shareViaWhatsApp: 'Partager sur WhatsApp',
    shareViaSMS: 'Envoyer par SMS',
    shareTripSafetyNote: 'Vos proches verront le nom du chauffeur, la plaque d’immatriculation, la progression sur la carte et l’assistance d’urgence.',

    // Driver Ride History Feature
    driverRideHistory: 'Historique des Courses Chauffeur',
    driverRideHistorySubtitle: 'Consultez l’ensemble de vos courses passées, revenus nets et retours clients.',
    totalTripsCompleted: 'Courses Terminées',
    totalNetEarnings: 'Revenu Net Total',
    totalDistanceDriven: 'Distance Parcourue',
    averageRating: 'Note Moyenne',
    allTrips: 'Toutes les Courses',
    completedTrips: 'Terminées',
    cancelledTrips: 'Annulées',
    backToRadar: 'Retour au Radar de Courses',
    viewReceipt: 'Reçu Numérique',
    tripsCompleted: 'Courses Réalisées',
    dispatchRadar: 'Radar de Courses',
    viewAllHistory: 'Voir Tout l’Historique',
    filterAll: 'Toutes',
    filterCompleted: 'Terminées',
    filterDigital: 'Paiement Mobile',
    filterCash: 'Espèces',
    filterCancelled: 'Annulées',
    noRidesFound: 'Aucune course ne correspond aux filtres',
    completedBadge: 'Terminée',
    cancelledBadge: 'Annulée',
    grossFare: 'Tarif Brut',
    platformFee: 'Frais Wap (-15%)',
    driverTip: 'Pourboire Reçu',
    netEarnings: 'Gain Net Chauffeur',

    // 3-Sided Marketplace & Liberté Cash (LBC) Brokerage
    liberteCash: 'Liberté Cash (LBC)',
    lbcBalance: 'Solde LBC',
    earnLbcRewards: 'Gagner des Récompenses LBC',
    convertLbcBrokerage: 'Convertir en Actions & Devises',
    marketplace3Sided: 'Marché Tripartite (Clients, Chauffeurs, Marchands)',
    fractionalStocks: 'Actions Fractionnées (US & International)',
    etfIndexFunds: 'ETF & Fonds Indiciels',
    regionalAssets: 'Actifs Régionaux Diaspora & Obligations',
    localFiatCashout: 'Retrait Monnaie Locale (MonCash / SEPA)',
    convertTokens: 'Convertir Jetons LBC',
    portfolioValue: 'Valeur Portefeuille Investissement',
    activeOrderFulfillment: 'Exécution Commandes & Livraisons',
  },
  en: {
    appName: 'Wap',
    tagline: 'On-demand motorcycle rides, courier deliveries, and diaspora commerce',
    architectureBlueprint: 'System Architecture',
    liveSimulator: 'Platform Simulator',
    customerApp: 'Customer App',
    driverApp: 'Moto Driver App',
    vendorPortal: 'Vendor Portal',
    databaseSchema: 'Database Schema',
    googleMapsSpec: 'Google Maps Integration',
    paymentGateways: 'Payment Gateways',
    offlineSync: 'Offline Caching & Sync',
    
    bookRide: 'Book Moto-Taxi',
    sendPackage: 'Send Package',
    orderVendor: 'Order from Vendor',
    whereTo: 'Where to?',
    pickupLocation: 'Pickup Location',
    destinationLocation: 'Drop-off Destination',
    landmarkHint: 'Add a landmark (e.g., Beside central market, opposite clinic)',
    estimatedFare: 'Estimated Fare',
    paymentMethod: 'Payment Method',
    findingNearbyDriver: 'Matching nearest motorcycle driver...',
    driverAssigned: 'Driver assigned!',
    driverEnRoute: 'Driver is arriving in',
    motoTaxi: 'Wap Moto-Taxi',
    expressParcel: 'Wap Courier Delivery',
    safetyHelmetRequired: 'Passenger safety helmet mandatory',
    
    goOnline: 'Go Online',
    goOffline: 'Go Offline',
    newRideRequest: 'New Ride Request!',
    acceptRide: 'Accept Ride',
    decline: 'Decline',
    navigatingToPickup: 'Routing to pickup point',
    startTrip: 'Start Trip',
    completeTrip: 'Complete Trip',
    collectCash: 'Collect Cash',
    earningsToday: 'Today’s Earnings',
    offlineQueueNotice: 'Offline mode active: transactions queued in local storage.',
    
    vendorDirectory: 'Vendor Directory',
    openOrders: 'Active Orders',
    dispatchMoto: 'Dispatch Courier',
    preparingOrder: 'Order in preparation',
    riderAssignedToPickup: 'Courier dispatched for pickup',
    menuInventory: 'Menu & Inventory',
    dailyRevenue: 'Daily Gross Revenue',
    
    voicePrompt: 'Play voice instruction',
    audioGuide: 'English Voice Guide',

    // Ride Cancellation & Safety Modal
    cancelRide: 'Cancel Ride',
    cancelRideConfirmationTitle: 'Are you sure you want to cancel this ride?',
    cancelRideWarning: 'Your Wap driver is already en route to your pickup point. To preserve dispatch safety and respect our drivers, please confirm if you really need to cancel.',
    cancelRideDriverEnRoute: 'Wap driver is currently en route to you',
    cancelRidePolicyNotice: 'Wap Safety & Fare Policy: Cancellations made after 2 minutes of dispatch may incur a fair cancellation fee to reimburse the driver’s transit time and fuel.',
    cancelReasonPrompt: 'Please select a cancellation reason:',
    cancelReasonTooFar: 'Driver is too far away / taking too long',
    cancelReasonChangeOfPlans: 'My plans changed / I no longer need the ride',
    cancelReasonWrongLocation: 'Wrong pickup landmark or pickup address',
    cancelReasonSafetyConcern: 'Safety concern or motorcycle condition',
    cancelReasonMistake: 'Requested ride by mistake',
    keepRide: 'No, Keep My Ride',
    confirmCancel: 'Yes, Cancel Ride',
    cancelAudioNotice: 'Attention: Your driver is already en route. Are you sure you want to cancel this ride?',
    rideCancelledSuccess: 'Ride cancelled successfully. Your driver has been notified to discontinue transit.',

    // Post-Ride Rating Screen
    rateYourTrip: 'Rate Your Ride',
    howWasYourDriver: 'How was your experience with your driver?',
    ratingPoor: 'Poor',
    ratingFair: 'Fair',
    ratingGood: 'Good',
    ratingVeryGood: 'Very Good',
    ratingExcellent: 'Excellent',
    ratingFeedbackPlaceholder: 'Share optional feedback about vehicle condition, safety, or service...',
    submitRating: 'Submit Rating',
    skipRating: 'Skip',
    ratingSubmittedSuccess: 'Thank you for your rating! Your feedback helps uphold high standards of community safety and service.',
    tagSafeDriving: 'Safe Driving',
    tagPoliteFriendly: 'Courteous & Friendly',
    tagCleanHelmet: 'Clean Helmet Provided',
    tagFastRoute: 'Efficient Route',

    // Share Trip Feature
    shareTrip: 'Share Trip',
    shareTripModalTitle: 'Share Live Trip Progress',
    shareTripSubtitle: 'Allow family or friends to follow your real-time GPS route, driver details, and arrival progress.',
    shareTripLinkCopied: 'Tracking link copied to clipboard!',
    copyTrackingLink: 'Copy Live Tracking Link',
    shareViaWhatsApp: 'Share on WhatsApp',
    shareViaSMS: 'Send via SMS',
    shareTripSafetyNote: 'Recipients will see driver name, vehicle plate, live coordinates, and safety emergency hotlines.',

    // Driver Ride History Feature
    driverRideHistory: 'Driver Ride History',
    driverRideHistorySubtitle: 'Review past completed trips, verified fares, tips, and rider ratings.',
    totalTripsCompleted: 'Completed Rides',
    totalNetEarnings: 'Net Earnings',
    totalDistanceDriven: 'Distance Traveled',
    averageRating: 'Average Rating',
    allTrips: 'All Rides',
    completedTrips: 'Completed',
    cancelledTrips: 'Cancelled',
    backToRadar: 'Back to Dispatch Radar',
    viewReceipt: 'Trip Receipt',
    tripsCompleted: 'Trips Completed',
    dispatchRadar: 'Dispatch Radar',
    viewAllHistory: 'View All History',
    filterAll: 'All',
    filterCompleted: 'Completed',
    filterDigital: 'Mobile Money',
    filterCash: 'Cash',
    filterCancelled: 'Cancelled',
    noRidesFound: 'No ride records found matching your filters',
    completedBadge: 'Completed',
    cancelledBadge: 'Cancelled',
    grossFare: 'Gross Fare',
    platformFee: 'Wap Fee (-15%)',
    driverTip: 'Driver Tip',
    netEarnings: 'Net Earnings',

    // 3-Sided Marketplace & Liberté Cash (LBC) Brokerage
    liberteCash: 'Liberté Cash (LBC)',
    lbcBalance: 'LBC Balance',
    earnLbcRewards: 'Earn LBC Rewards',
    convertLbcBrokerage: 'Convert to Stocks, ETFs & Cash',
    marketplace3Sided: '3-Sided Marketplace (Drivers, Customers, Merchants)',
    fractionalStocks: 'Fractional US & Global Stocks',
    etfIndexFunds: 'Index & Thematic ETFs',
    regionalAssets: 'Regional Diaspora Assets & Bonds',
    localFiatCashout: 'Local Fiat Cash Payouts',
    convertTokens: 'Convert LBC Tokens',
    portfolioValue: 'Investment Portfolio Value',
    activeOrderFulfillment: 'Order Prep & Tripartite Delivery',
  },
  nl: {
    appName: 'Wap',
    tagline: 'On-demand motorritten, pakketbezorging en lokale handel',
    architectureBlueprint: 'Systeemarchitectuur',
    liveSimulator: 'Platformsimulator',
    customerApp: 'Klant-app',
    driverApp: 'Chauffeurs-app (Motor)',
    vendorPortal: 'Handelaarsportaal',
    databaseSchema: 'Databasestructuur',
    googleMapsSpec: 'Google Maps Integratie',
    paymentGateways: 'Betaalmethoden & Gateways',
    offlineSync: 'Offline Caching & Synchronisatie',
    
    bookRide: 'Boek Motorrit',
    sendPackage: 'Verzend Pakket',
    orderVendor: 'Bestel bij Winkelier',
    whereTo: 'Waar wil je heen?',
    pickupLocation: 'Ophaallocatie',
    destinationLocation: 'Bestemming',
    landmarkHint: 'Voeg herkenningspunt toe (bijv. tegenover de markt)',
    estimatedFare: 'Geschat tarief',
    paymentMethod: 'Betaalwijze',
    findingNearbyDriver: 'Zoeken naar dichtstbijzijnde motorrijder...',
    driverAssigned: 'Chauffeur toegewezen!',
    driverEnRoute: 'Chauffeur arriveert over',
    motoTaxi: 'Wap Motortaxi',
    expressParcel: 'Express Bezorging',
    safetyHelmetRequired: 'Veiligheidshelm verplicht voor passagier',
    
    goOnline: 'Online gaan',
    goOffline: 'Offline gaan',
    newRideRequest: 'Nieuwe ritoproep!',
    acceptRide: 'Accepteer Rit',
    decline: 'Weigeren',
    navigatingToPickup: 'Navigatie naar ophaallocatie',
    startTrip: 'Start Rit',
    completeTrip: 'Voltooi Rit',
    collectCash: 'Ontvang Contant Geld',
    earningsToday: 'Verdiensten Vandaag',
    offlineQueueNotice: 'Offline modus actief: transacties lokaal opgeslagen.',
    
    vendorDirectory: 'Winkelgids',
    openOrders: 'Lopende Bestellingen',
    dispatchMoto: 'Stuur Motorkoerier',
    preparingOrder: 'Bestelling wordt voorbereid',
    riderAssignedToPickup: 'Koerier onderweg voor afhaling',
    menuInventory: 'Assortiment & Voorraad',
    dailyRevenue: 'Dagomzet',
    
    voicePrompt: 'Beluister steminstructie',
    audioGuide: 'Nederlandse Audiobegeleiding',

    // Ride Cancellation & Safety Modal
    cancelRide: 'Rit Annuleren',
    cancelRideConfirmationTitle: 'Weet u zeker dat u deze rit wilt annuleren?',
    cancelRideWarning: 'Uw Wap chauffeur is reeds onderweg naar uw ophaallocatie. Voor de veiligheid en het respect voor de chauffeur, vragen we u de annulering te bevestigen.',
    cancelRideDriverEnRoute: 'Wap chauffeur is momenteel onderweg naar u',
    cancelRidePolicyNotice: 'Wap Veiligheids- & Tariefbeleid: Bij annulering na meer dan 2 minuten kan een billijke vergoeding in rekening worden gebracht ter dekking van brandstof en rijtijd.',
    cancelReasonPrompt: 'Selecteer alstublieft een reden voor annulering:',
    cancelReasonTooFar: 'Chauffeur is te ver weg / het duurt te lang',
    cancelReasonChangeOfPlans: 'Mijn plannen zijn gewijzigd / Ik heb de rit niet meer nodig',
    cancelReasonWrongLocation: 'Verkeerde ophaallocatie of herkenningspunt ingevoerd',
    cancelReasonSafetyConcern: 'Bezorgdheid over veiligheid of staat van het voertuig',
    cancelReasonMistake: 'Per abuis een rit aangevraagd',
    keepRide: 'Nee, Behoud Rit',
    confirmCancel: 'Ja, Rit Annuleren',
    cancelAudioNotice: 'Let op: Uw chauffeur is reeds onderweg. Weet u zeker dat u deze rit wilt annuleren?',
    rideCancelledSuccess: 'Rit succesvol geannuleerd. De chauffeur is geïnformeerd om de rit te staken.',

    // Post-Ride Rating Screen
    rateYourTrip: 'Beoordeel uw rit',
    howWasYourDriver: 'Hoe was uw ervaring met uw chauffeur?',
    ratingPoor: 'Slecht',
    ratingFair: 'Matig',
    ratingGood: 'Goed',
    ratingVeryGood: 'Zeer Goed',
    ratingExcellent: 'Uitstekend',
    ratingFeedbackPlaceholder: 'Geef optionele feedback over veiligheid, voertuig of service...',
    submitRating: 'Beoordeling Verzenden',
    skipRating: 'Overslaan',
    ratingSubmittedSuccess: 'Bedankt voor uw beoordeling! Uw feedback helpt onze veiligheids- en servicestandaarden te waarborgen.',
    tagSafeDriving: 'Veilige Rijstijl',
    tagPoliteFriendly: 'Vriendelijk & Beleefd',
    tagCleanHelmet: 'Schone Helm Aanwezig',
    tagFastRoute: 'Snelle & Goede Route',

    // Share Trip Feature
    shareTrip: 'Deel Rit',
    shareTripModalTitle: 'Deel Live Ritvoortgang',
    shareTripSubtitle: 'Laat familie of vrienden uw realtime GPS-route, chauffeurgegevens en geschatte aankomsttijd volgen.',
    shareTripLinkCopied: 'Volglink gekopieerd naar klembord!',
    copyTrackingLink: 'Kopieer Live Volglink',
    shareViaWhatsApp: 'Delen via WhatsApp',
    shareViaSMS: 'Verstuur via SMS',
    shareTripSafetyNote: 'Ontvangers zien de naam van de chauffeur, het kenteken, realtime positie en noodhulpnummers.',

    // Driver Ride History Feature
    driverRideHistory: 'Chauffeurs Rithistorie',
    driverRideHistorySubtitle: 'Bekijk al uw voltooide ritten, netto inkomsten, fooien en passagiersbeoordelingen.',
    totalTripsCompleted: 'Voltooide Ritten',
    totalNetEarnings: 'Netto Inkomsten',
    totalDistanceDriven: 'Afgelegde Afstand',
    averageRating: 'Gemiddelde Score',
    allTrips: 'Alle Ritten',
    completedTrips: 'Voltooid',
    cancelledTrips: 'Geannuleerd',
    backToRadar: 'Terug naar Meldradius',
    viewReceipt: 'Digitaal Ritbewijs',
    tripsCompleted: 'Voltooide Ritten',
    dispatchRadar: 'Rit-Radar',
    viewAllHistory: 'Bekijk Alle Historie',
    filterAll: 'Alles',
    filterCompleted: 'Voltooid',
    filterDigital: 'Uni5Pay / Digitaal',
    filterCash: 'Contant',
    filterCancelled: 'Geannuleerd',
    noRidesFound: 'Geen ritten gevonden voor deze filter',
    completedBadge: 'Voltooid',
    cancelledBadge: 'Geannuleerd',
    grossFare: 'Bruto Tarief',
    platformFee: 'Wap Kosten (-15%)',
    driverTip: 'Ontvangen Fooi',
    netEarnings: 'Netto Verdiensten',

    // 3-Sided Marketplace & Liberté Cash (LBC) Brokerage
    liberteCash: 'Liberté Cash (LBC)',
    lbcBalance: 'LBC Saldo',
    earnLbcRewards: 'Verdien LBC Beloningen',
    convertLbcBrokerage: 'Converteer naar Aandelen, ETF\'s & Contant',
    marketplace3Sided: 'Driezijdige Marktplaats (Chauffeurs, Klanten, Winkeliers)',
    fractionalStocks: 'Fractionele Aandelen (VS & Wereldwijd)',
    etfIndexFunds: 'Index- & Thematische ETF\'s',
    regionalAssets: 'Regionale Diaspora Activa & Obligaties',
    localFiatCashout: 'Lokale Fiat Uitbetalingen (Uni5Pay / SEPA)',
    convertTokens: 'Converteer LBC Tokens',
    portfolioValue: 'Beleggingsportefeuille Waarde',
    activeOrderFulfillment: 'Bestellingsafhandeling & Bezorging',
  },
  sr: {
    appName: 'Wap',
    tagline: 'Snel bromfiets taxi, boskopu bezorging nanga winkel bisti gi wi pipel',
    architectureBlueprint: 'Systeem Bouwplan',
    liveSimulator: 'Wap Wrokoman Eksempre',
    customerApp: 'Klant App',
    driverApp: 'Bromfiets Man App',
    vendorPortal: 'Winkelman Poort',
    databaseSchema: 'Database Struktuur',
    googleMapsSpec: 'Google Maps Wrokostelsel',
    paymentGateways: 'Moni Pai Systeem',
    offlineSync: 'Sonde Internet Caching',
    
    bookRide: 'Taki wan Bromfiets (Wap Ride)',
    sendPackage: 'Seni wan Boskopu (Wap Express)',
    orderVendor: 'Bestei na Winkel',
    whereTo: 'Pe yu wani go?',
    pickupLocation: 'Pe fu teki yu',
    destinationLocation: 'Pe yu musu go',
    landmarkHint: 'Pot wan bekenti presi (f.e.: Krosbei na kerki, fesi a marikiti)',
    estimatedFare: 'Moni Prijs',
    paymentMethod: 'Fa yu o pai',
    findingNearbyDriver: 'Wi e suku wan bromfiets man krosbei...',
    driverAssigned: 'Drayver e kon!',
    driverEnRoute: 'A drayver e doro baka',
    motoTaxi: 'Wap Bromfiets',
    expressParcel: 'Hasti Boskopu',
    safetyHelmetRequired: 'Valhelm de ferplekti gi ala suma',
    
    goOnline: 'Go Online',
    goOffline: 'Gwe Offline',
    newRideRequest: 'Nyun wroko de!',
    acceptRide: 'Teki a wroko',
    decline: 'No teki',
    navigatingToPickup: 'Go pe a suma de',
    startTrip: 'Bribi a waka',
    completeTrip: 'Waka kaba',
    collectCash: 'Teki a cash moni',
    earningsToday: 'Moni fu tide',
    offlineQueueNotice: 'Netwerk no de; ala san poti na un telefoon teleki a kon baka.',
    
    vendorDirectory: 'Winkelman Lis',
    openOrders: 'Wroko di e drai',
    dispatchMoto: 'Kari wan bromfiets fu tyari',
    preparingOrder: 'E seti a nyanyan/sani',
    riderAssignedToPickup: 'Bromfiets doro fu teki a paketi',
    menuInventory: 'Sani di de fu bai',
    dailyRevenue: 'Moni meki tide',
    
    voicePrompt: 'Arki a stem',
    audioGuide: 'Sranan Tongo Stem Gid',

    // Ride Cancellation & Safety Modal
    cancelRide: 'Kansele a Waka',
    cancelRideConfirmationTitle: 'Yu de seiker taki yu wani kansele a waka disi?',
    cancelRideWarning: 'A Wap drayver de na pasi kba fu kon teki yu. Fu seykerheid nanga lespeki gi a wrokoman, grantangi sori wi fu sanede yu wani stop a waka.',
    cancelRideDriverEnRoute: 'A drayver e rèi kon na yu now nowde',
    cancelRidePolicyNotice: 'Wap Seykerheid & Pori Pai: Efu yu kansele baka 2 minuut di a drayver rèi, wan pikin bensin pai kan de fanowdu gi en ten.',
    cancelReasonPrompt: 'Grantangi kosi fu sanede yu e kansele a waka:',
    cancelReasonTooFar: 'A drayver de tumsi fara / e teki tumsi langa ten',
    cancelReasonChangeOfPlans: 'Pramisi kenki / Mi no abi a waka fanowdu moro',
    cancelReasonWrongLocation: 'A presi fu teki mi no ben skrifi bun',
    cancelReasonSafetyConcern: 'Mi e span nanga seykerheid noso a bromfiets srefi',
    cancelReasonMistake: 'Mi meki fowtu na ini a bestei',
    keepRide: 'No, Hori a Waka',
    confirmCancel: 'Iya, Kansele a Waka',
    cancelAudioNotice: 'Kijk uit: A drayver de na pasi kba. Yu de seiker taki yu wani kansele a waka disi?',
    rideCancelledSuccess: 'A waka kansele bun. Wi seni boskopu gi a drayver taki a no abi fu kon moro.',

    // Post-Ride Rating Screen
    rateYourTrip: 'Poti wan mark gi a waka',
    howWasYourDriver: 'Fa a waka nanga a drayver ben go?',
    ratingPoor: 'No bun kweti',
    ratingFair: 'A psa so so',
    ratingGood: 'Bun',
    ratingVeryGood: 'Tumsi Bun',
    ratingExcellent: 'Fruferi Bun / Top',
    ratingFeedbackPlaceholder: 'Skrifi wan pikin boskopu fu a drayver noso a bromfiets (efu yu wani)...',
    submitRating: 'Seni a Mark',
    skipRating: 'Pasa a san disi',
    ratingSubmittedSuccess: 'Grantangi gi yu mark! Disi e yepi wi fu hori ala waka seyker nanga bun.',
    tagSafeDriving: 'Seyker Rèi',
    tagPoliteFriendly: 'Lespeki & Switi Taki',
    tagCleanHelmet: 'Krin Valhelm De',
    tagFastRoute: 'Bun & Snel Pasi',

    // Share Trip Feature
    shareTrip: 'Pratifasi a Waka',
    shareTripModalTitle: 'Pratifasi a Waka Pasi Now Now',
    shareTripSubtitle: 'Meki yu famiri noso mati si a live GPS pasi nanga a drayver fu meki yu tan seyker.',
    shareTripLinkCopied: 'A link kopye bun tapu yu klipbòd!',
    copyTrackingLink: 'Kopye a Live Link',
    shareViaWhatsApp: 'Pratifasi tapu WhatsApp',
    shareViaSMS: 'Seni nanga SMS',
    shareTripSafetyNote: 'Yu famiri o si a nen fu a drayver, a plati fu a bromfiets, pe yu de now nanga yepi nomru.',

    // Driver Ride History Feature
    driverRideHistory: 'Drayver Waka Istori',
    driverRideHistorySubtitle: 'Luku ala den waka di yu kba meki, a moni di yu wini nanga den mark fu den pasasir.',
    totalTripsCompleted: 'Waka Kba',
    totalNetEarnings: 'Net Moni Wini',
    totalDistanceDriven: 'Distansi Yu Rei',
    averageRating: 'Gemiddelde Mark',
    allTrips: 'Ala Waka',
    completedTrips: 'Kba Bun',
    cancelledTrips: 'Kansele',
    backToRadar: 'Drai go baka na Radar',
    viewReceipt: 'Resifi fu a Waka',
    tripsCompleted: 'Waka Kba',
    dispatchRadar: 'Waka Radar',
    viewAllHistory: 'Luku Ala Waka',
    filterAll: 'Ala',
    filterCompleted: 'Kba Bun',
    filterDigital: 'Moni Pai',
    filterCash: 'Cash Moni',
    filterCancelled: 'Kansele',
    noRidesFound: 'No waka feni nanga a filter disi',
    completedBadge: 'Kba Bun',
    cancelledBadge: 'Kansele',
    grossFare: 'Moni Fari',
    platformFee: 'Wap Kostu (-15%)',
    driverTip: 'Tip Moni',
    netEarnings: 'Net Moni Wini',

    // 3-Sided Marketplace & Liberté Cash (LBC) Brokerage
    liberteCash: 'Liberté Cash (LBC)',
    lbcBalance: 'LBC Moni Saldo',
    earnLbcRewards: 'Wini LBC Paiman',
    convertLbcBrokerage: 'Kenki kon na Aandelen, ETF & Cash Moni',
    marketplace3Sided: '3-Kanti Marikiti (Drayver, Klant, Winkelman)',
    fractionalStocks: 'Pikin Aandelen (VS & Grontapu)',
    etfIndexFunds: 'Index & ETF Moni Fondi',
    regionalAssets: 'Regio Diaspora Assets & Bond',
    localFiatCashout: 'Pai na Lokali Moni (Uni5Pay / Cash)',
    convertTokens: 'Kenki LBC Tokens',
    portfolioValue: 'Investeringsportefeuille Waarde',
    activeOrderFulfillment: 'Seti a Wroko & Tyari a Paketi',
  },
};
