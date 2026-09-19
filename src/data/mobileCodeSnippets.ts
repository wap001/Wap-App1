export interface ScreenCodeDefinition {
  id: string;
  title: string;
  category: 'passenger' | 'driver';
  wireframeSpec: {
    layoutType: string;
    targetResolution: string;
    minTouchTarget: string;
    contrastRatio: string;
    networkBudget: string;
    keyElements: string[];
    interactionNotes: string;
  };
  flutterCode: string;
  reactNativeCode: string;
}

export const MOBILE_SCREEN_DEFINITIONS: ScreenCodeDefinition[] = [
  // --------------------------------------------------------------------------
  // 1. PASSENGER SCREEN 1: Phone / OTP Authentication & Region Selector
  // --------------------------------------------------------------------------
  {
    id: 'passenger-auth',
    title: 'Screen 1: Phone / OTP Auth & Region Selector',
    category: 'passenger',
    wireframeSpec: {
      layoutType: 'Single Column Vertical Stack with Bottom-Pinned Action Area',
      targetResolution: '360 x 640 dp (Baseline low-cost Android / iOS)',
      minTouchTarget: '48 x 48 dp (Complies with WCAG 2.5.5 / Material Design)',
      contrastRatio: '7.8:1 (High-contrast Sunlight legibility)',
      networkBudget: '< 15 KB initial bundle / SMS & WhatsApp OTP fallbacks',
      keyElements: [
        'Branded minimalist header with country region flag picker dropdown',
        'Pre-configured regions: Africa (SN, CI, KE), LatAm (CO, BR, PA), Caribbean (HT, GY, SR), North America (US)',
        'E.164 phone number input field with country code prefix lock',
        '4-Digit PIN input cells with auto-focus and hardware keypad trigger',
        'Fallback verification channels: Send via WhatsApp & Resend via SMS timers'
      ],
      interactionNotes: 'On submit, trigger lightweight POST /api/v1/auth/request-otp with retry countdown timer (30s) preventing spam.'
    },
    flutterCode: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// Wap Multi-Modal Passenger Auth Screen (Flutter Production Code)
class PhoneOtpAuthScreen extends StatefulWidget {
  const PhoneOtpAuthScreen({Key? key}) : super(key: key);

  @override
  State<PhoneOtpAuthScreen> createState() => _PhoneOtpAuthScreenState();
}

class _PhoneOtpAuthScreenState extends State<PhoneOtpAuthScreen> {
  final TextEditingController _phoneController = TextEditingController();
  final List<TextEditingController> _otpControllers = 
      List.generate(4, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(4, (_) => FocusNode());

  String _selectedCountryCode = '+509';
  String _selectedCountryFlag = '🇭🇹';
  String _selectedCountryName = 'Haiti';
  bool _otpSent = false;
  bool _isLoading = false;
  int _resendCountdown = 30;

  final List<Map<String, String>> _regions = [
    {'flag': '🇭🇹', 'name': 'Haiti', 'code': '+509', 'currency': 'HTG'},
    {'flag': '🇸🇳', 'name': 'Senegal', 'code': '+221', 'currency': 'XOF'},
    {'flag': '🇨🇮', 'name': 'Ivory Coast', 'code': '+225', 'currency': 'XOF'},
    {'flag': '🇰🇪', 'name': 'Kenya', 'code': '+254', 'currency': 'KES'},
    {'flag': '🇵🇦', 'name': 'Panama', 'code': '+507', 'currency': 'USD'},
    {'flag': '🇨🇴', 'name': 'Colombia', 'code': '+57', 'currency': 'COP'},
    {'flag': '🇬🇾', 'name': 'Guyana', 'code': '+592', 'currency': 'GYD'},
    {'flag': '🇸🇷', 'name': 'Suriname', 'code': '+597', 'currency': 'SRD'},
    {'flag': '🇺🇸', 'name': 'United States', 'code': '+1', 'currency': 'USD'},
  ];

  void _sendOtp({bool isWhatsApp = false}) {
    if (_phoneController.text.trim().isEmpty) return;
    setState(() => _isLoading = true);
    Future.delayed(const Duration(milliseconds: 900), () {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _otpSent = true;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // High-contrast palette: Outdoor black/amber
    const Color bgDark = Color(0xFF0F0F11);
    const Color cardDark = Color(0xFF18191D);
    const Color primaryAmber = Color(0xFFFFB800);
    const Color textLight = Color(0xFFFFFFFF);
    const Color textMuted = Color(0xFF9E9E9E);

    return Scaffold(
      backgroundColor: bgDark,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header brand
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: primaryAmber.withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: primaryAmber, width: 1.5),
                    ),
                    child: const Center(
                      child: Text('WAP', style: TextStyle(color: primaryAmber, fontWeight: FontWeight.w900, fontSize: 13)),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: cardDark,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: Colors.white24),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.wifi_tethering, color: Colors.greenAccent, size: 14),
                        SizedBox(width: 4),
                        Text('LOW-BANDWIDTH MODE', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),

              Text(
                _otpSent ? 'Verify Safety PIN' : 'Enter Your Mobile',
                style: const TextStyle(color: textLight, fontSize: 24, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              Text(
                _otpSent 
                    ? 'Enter the 4-digit code sent to $_selectedCountryCode \${_phoneController.text}'
                    : 'Choose your operating territory to dispatch motorcycles, tuk-tuks, or cars.',
                style: const TextStyle(color: textMuted, fontSize: 13, height: 1.4),
              ),
              const SizedBox(height: 24),

              if (!_otpSent) ...[
                // Region Dropdown Button
                Container(
                  height: 52,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: cardDark,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white24, width: 1.2),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _selectedCountryCode,
                      dropdownColor: cardDark,
                      isExpanded: true,
                      icon: const Icon(Icons.keyboard_arrow_down, color: primaryAmber),
                      items: _regions.map((reg) {
                        return DropdownMenuItem<String>(
                          value: reg['code'],
                          child: Row(
                            children: [
                              Text(reg['flag']!, style: const TextStyle(fontSize: 18)),
                              const SizedBox(width: 10),
                              Text(reg['name']!, style: const TextStyle(color: textLight, fontSize: 14, fontWeight: FontWeight.w600)),
                              const Spacer(),
                              Text(reg['code']!, style: const TextStyle(color: primaryAmber, fontSize: 13, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) {
                          final match = _regions.firstWhere((r) => r['code'] == val);
                          setState(() {
                            _selectedCountryCode = val;
                            _selectedCountryFlag = match['flag']!;
                            _selectedCountryName = match['name']!;
                          });
                        }
                      },
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                // Phone Input Field (Min 48dp height)
                Container(
                  height: 56,
                  decoration: BoxDecoration(
                    color: cardDark,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white24, width: 1.2),
                  ),
                  child: Row(
                    children: [
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 14),
                        child: Text(
                          '$_selectedCountryFlag $_selectedCountryCode',
                          style: const TextStyle(color: primaryAmber, fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                      ),
                      Container(width: 1, height: 28, color: Colors.white24),
                      Expanded(
                        child: TextField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          style: const TextStyle(color: textLight, fontSize: 16, fontWeight: FontWeight.bold),
                          decoration: const InputDecoration(
                            border: InputBorder.none,
                            hintText: '37 12 3456',
                            hintStyle: TextStyle(color: Colors.white38),
                            contentPadding: EdgeInsets.symmetric(horizontal: 14),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const Spacer(),

                // Continue Button (48dp min height)
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryAmber,
                      foregroundColor: bgDark,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    onPressed: _isLoading ? null : () => _sendOtp(isWhatsApp: false),
                    child: _isLoading 
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: bgDark))
                        : const Text('GET VERIFICATION CODE', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14, letterSpacing: 0.5)),
                  ),
                ),
              ] else ...[
                // OTP Input Blocks
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(4, (index) {
                    return SizedBox(
                      width: 65,
                      height: 64,
                      child: TextField(
                        controller: _otpControllers[index],
                        focusNode: _focusNodes[index],
                        textAlign: TextAlign.center,
                        keyboardType: TextInputType.number,
                        maxLength: 1,
                        style: const TextStyle(color: primaryAmber, fontSize: 24, fontWeight: FontWeight.w900),
                        decoration: InputDecoration(
                          counterText: '',
                          filled: true,
                          fillColor: cardDark,
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: Colors.white24, width: 1.5),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12),
                            borderSide: const BorderSide(color: primaryAmber, width: 2),
                          ),
                        ),
                        onChanged: (val) {
                          if (val.isNotEmpty && index < 3) {
                            _focusNodes[index + 1].requestFocus();
                          } else if (val.isEmpty && index > 0) {
                            _focusNodes[index - 1].requestFocus();
                          }
                        },
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 24),

                // WhatsApp Fallback Option
                InkWell(
                  onTap: () => _sendOtp(isWhatsApp: true),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    height: 48,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    decoration: BoxDecoration(
                      color: const Color(0xFF25D366).withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF25D366).withOpacity(0.5)),
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.chat_bubble_outline, color: Color(0xFF25D366), size: 18),
                        SizedBox(width: 8),
                        Text('Send Code via WhatsApp Fallback', style: TextStyle(color: Color(0xFF25D366), fontWeight: FontWeight.bold, fontSize: 13)),
                      ],
                    ),
                  ),
                ),
                const Spacer(),

                // Verify Button
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryAmber,
                      foregroundColor: bgDark,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: () {
                      // Navigate to Screen 2
                    },
                    child: const Text('VERIFY & ENTER WAP', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}`,
    reactNativeCode: `import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

// Wap Multi-Modal Passenger Auth Screen (React Native Production Code)
export const PhoneOtpAuthScreen: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState({
    name: 'Haiti',
    code: '+509',
    flag: '🇭🇹',
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const otpRefs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];

  const handleRequestOtp = (channel: 'sms' | 'whatsapp') => {
    if (!phoneNumber.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
    }, 800);
  };

  const handleOtpChange = (text: string, index: number) => {
    const updated = [...otpValues];
    updated[index] = text;
    setOtpValues(updated);
    if (text && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F11" />
      <View style={styles.inner}>
        {/* Header Branding */}
        <View style={styles.header}>
          <View style={styles.brandBox}>
            <Text style={styles.brandText}>WAP</Text>
          </View>
          <View style={styles.lowDataBadge}>
            <Text style={styles.lowDataDot}>●</Text>
            <Text style={styles.lowDataText}>LOW-DATA 2G/3G READY</Text>
          </View>
        </View>

        <Text style={styles.headline}>{otpSent ? 'Verify Safety OTP' : 'Enter Mobile Number'}</Text>
        <Text style={styles.subhead}>
          {otpSent
            ? \`Enter the 4-digit security PIN sent to \${selectedCountry.code} \${phoneNumber}\`
            : 'Select your operational territory in Africa, LatAm, or Caribbean.'}
        </Text>

        {!otpSent ? (
          <View style={styles.formArea}>
            {/* Country Selector Card */}
            <TouchableOpacity style={styles.countryPicker} activeOpacity={0.7}>
              <Text style={styles.flag}>{selectedCountry.flag}</Text>
              <Text style={styles.countryName}>{selectedCountry.name}</Text>
              <Text style={styles.countryCode}>{selectedCountry.code}</Text>
            </TouchableOpacity>

            {/* Phone Input */}
            <View style={styles.phoneInputRow}>
              <Text style={styles.prefix}>{selectedCountry.code}</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="37 12 3456"
                placeholderTextColor="#666"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                maxLength={12}
              />
            </View>

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => handleRequestOtp('sms')}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#0F0F11" />
              ) : (
                <Text style={styles.primaryButtonText}>REQUEST VERIFICATION CODE</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formArea}>
            {/* OTP 4-Box Row */}
            <View style={styles.otpRow}>
              {otpValues.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={otpRefs[idx]}
                  style={styles.otpBox}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(txt) => handleOtpChange(txt, idx)}
                  textAlign="center"
                />
              ))}
            </View>

            {/* WhatsApp Fallback */}
            <TouchableOpacity
              style={styles.whatsAppButton}
              onPress={() => handleRequestOtp('whatsapp')}
              activeOpacity={0.7}
            >
              <Text style={styles.whatsAppButtonText}>💬 Send Code via WhatsApp Fallback</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>CONFIRM & PROCEED</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F11' },
  inner: { flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  brandBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FFB800',
    backgroundColor: 'rgba(255,184,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: { color: '#FFB800', fontWeight: '900', fontSize: 13 },
  lowDataBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18191D',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  lowDataDot: { color: '#00E676', fontSize: 10, marginRight: 5 },
  lowDataText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  headline: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 6 },
  subhead: { color: '#9E9E9E', fontSize: 13, lineHeight: 18, marginBottom: 24 },
  formArea: { flex: 1 },
  countryPicker: {
    height: 52,
    backgroundColor: '#18191D',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  flag: { fontSize: 20, marginRight: 10 },
  countryName: { color: '#FFF', fontSize: 14, fontWeight: '600', flex: 1 },
  countryCode: { color: '#FFB800', fontSize: 14, fontWeight: '800' },
  phoneInputRow: {
    height: 56,
    backgroundColor: '#18191D',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  prefix: { color: '#FFB800', fontWeight: '800', fontSize: 15, marginRight: 12 },
  phoneInput: { flex: 1, color: '#FFF', fontSize: 16, fontWeight: '700' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  otpBox: {
    width: 68,
    height: 64,
    backgroundColor: '#18191D',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#444',
    color: '#FFB800',
    fontSize: 24,
    fontWeight: '900',
  },
  whatsAppButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#25D366',
    backgroundColor: 'rgba(37,211,102,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whatsAppButtonText: { color: '#25D366', fontWeight: '700', fontSize: 13 },
  primaryButton: {
    height: 52,
    backgroundColor: '#FFB800',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: { color: '#0F0F11', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
});`
  },

  // --------------------------------------------------------------------------
  // 2. PASSENGER SCREEN 2: Interactive Map View & Vehicle Selector
  // --------------------------------------------------------------------------
  {
    id: 'passenger-map',
    title: 'Screen 2: Interactive Map & Vehicle Tier Selector',
    category: 'passenger',
    wireframeSpec: {
      layoutType: 'Full-Screen Map with Floating HUD & Bottom Sheet Selector',
      targetResolution: '360 x 640 dp to 412 x 915 dp',
      minTouchTarget: '52 x 52 dp for vehicle tier cards & floating controls',
      contrastRatio: '8.2:1 (Direct sunlight vector map tiles + amber highlights)',
      networkBudget: '< 2.5 KB per map vector tile / Vector icon glyphs',
      keyElements: [
        'Full-bleed vector map with live nearby driver markers (2W, 3W, 4W)',
        'Pickup & destination pill badges with ETA & distance overlays',
        'Horizontal Vehicle Tier Carousel at screen bottom:',
        '  - 2-Wheeler (Motorbike): Solo rider, express traffic cutter, 0.7x base',
        '  - 3-Wheeler (Tuk-Tuk): 3 Pax, covered canopy, luggage friendly, 1.0x base',
        '  - 4-Wheeler (Car/Van): 4-6 Pax, AC comfort, standard/premium, 1.85x base',
        'Upfront Fare Estimation card displaying breakdown and guaranteed local currency total'
      ],
      interactionNotes: 'Horizontal swipe snaps between vehicle tiers with instant fare recalculation and visual vehicle 3D silhouette elevation.'
    },
    flutterCode: `import 'package:flutter/material.dart';

// Wap Passenger Interactive Map & Vehicle Selector (Flutter Production Code)
class InteractiveMapVehicleSelectorScreen extends StatefulWidget {
  const InteractiveMapVehicleSelectorScreen({Key? key}) : super(key: key);

  @override
  State<InteractiveMapVehicleSelectorScreen> createState() =>
      _InteractiveMapVehicleSelectorScreenState();
}

class _InteractiveMapVehicleSelectorScreenState
    extends State<InteractiveMapVehicleSelectorScreen> {
  int _selectedVehicleTierIndex = 0; // 0 = 2W, 1 = 3W, 2 = 4W

  final List<Map<String, dynamic>> _vehicleTiers = [
    {
      'id': '2w',
      'title': '2-Wheeler Moto',
      'subtitle': 'Fastest Solo / Courier',
      'icon': Icons.two_wheeler,
      'capacity': '1 Pax',
      'eta': '3 min',
      'localFare': '350 HTG',
      'usdFare': '$2.65 USD',
      'multiplier': '0.7x',
      'color': Color(0xFFFFB800),
    },
    {
      'id': '3w',
      'title': '3-Wheeler Tuk-Tuk',
      'subtitle': 'Covered / Rain Protected',
      'icon': Icons.electric_rickshaw,
      'capacity': '3 Pax',
      'eta': '5 min',
      'localFare': '500 HTG',
      'usdFare': '$3.80 USD',
      'multiplier': '1.0x',
      'color': Color(0xFF00E5FF),
    },
    {
      'id': '4w',
      'title': '4-Wheeler Sedan/Van',
      'subtitle': 'Family & Luggage AC',
      'icon': Icons.directions_car,
      'capacity': '4-6 Pax',
      'eta': '7 min',
      'localFare': '925 HTG',
      'usdFare': '$7.00 USD',
      'multiplier': '1.85x',
      'color': Color(0xFF00E676),
    },
  ];

  @override
  Widget build(BuildContext context) {
    final activeTier = _vehicleTiers[_selectedVehicleTierIndex];

    return Scaffold(
      backgroundColor: const Color(0xFF0F0F11),
      body: Stack(
        children: [
          // Simulated Full-Bleed High-Contrast Low-Data Map Canvas
          Container(
            color: const Color(0xFF141518),
            child: Stack(
              children: [
                // Simulated Vector Roads (High Contrast for Outdoor Sunlight)
                CustomPaint(
                  size: Size.infinite,
                  painter: _MapRoadsPainter(),
                ),

                // Simulated Driver Pin 1 (2-Wheeler)
                const Positioned(
                  top: 220,
                  left: 140,
                  child: _DriverMarker(icon: Icons.two_wheeler, label: 'Moto 3m'),
                ),

                // Simulated Driver Pin 2 (3-Wheeler)
                const Positioned(
                  top: 180,
                  right: 80,
                  child: _DriverMarker(icon: Icons.electric_rickshaw, label: 'Tuk-Tuk 5m'),
                ),

                // Pickup Pin
                const Positioned(
                  top: 260,
                  left: 90,
                  child: _WaypointPin(color: Color(0xFF00E676), label: 'Pickup: Delmas 33'),
                ),

                // Destination Pin
                const Positioned(
                  top: 120,
                  right: 90,
                  child: _WaypointPin(color: Color(0xFFFF5252), label: 'Dropoff: Pétion-Ville'),
                ),
              ],
            ),
          ),

          // Top Floating Floating Status / Navigation Bar
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFF0F0F11),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(color: Colors.white24),
                    ),
                    child: const Icon(Icons.arrow_back, color: Colors.white),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Container(
                      height: 48,
                      padding: const EdgeInsets.symmetric(horizontal: 14),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F0F11),
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(color: const Color(0xFFFFB800), width: 1.2),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.near_me, color: Color(0xFFFFB800), size: 16),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Delmas 33 → Pétion-Ville (5.4 km)',
                              style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Bottom Sheet Card (Vehicle Tier Carousel + Fare Quote + Call to Action)
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              decoration: const BoxDecoration(
                color: Color(0xFF0F0F11),
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                border: Border(top: BorderSide(color: Colors.white24, width: 1.5)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Section Title
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('SELECT VEHICLE CLASS', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.8)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: const Color(0xFF1C1D22), borderRadius: BorderRadius.circular(10)),
                        child: const Text('14 MIN ESTIMATE', style: TextStyle(color: Color(0xFFFFB800), fontSize: 10, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Horizontal Vehicle Tier Selector
                  SizedBox(
                    height: 106,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: _vehicleTiers.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 10),
                      itemBuilder: (context, index) {
                        final tier = _vehicleTiers[index];
                        final isSelected = _selectedVehicleTierIndex == index;

                        return GestureDetector(
                          onTap: () => setState(() => _selectedVehicleTierIndex = index),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 180),
                            width: 135,
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: isSelected ? const Color(0xFF1F2026) : const Color(0xFF141518),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isSelected ? const Color(0xFFFFB800) : Colors.white12,
                                width: isSelected ? 2.0 : 1.0,
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Icon(tier['icon'], color: tier['color'], size: 24),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                                      decoration: BoxDecoration(color: Colors.black45, borderRadius: BorderRadius.circular(6)),
                                      child: Text(tier['capacity'], style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(tier['title'].toString().split(' ')[1], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12)),
                                    Text(tier['localFare'], style: const TextStyle(color: Color(0xFFFFB800), fontWeight: FontWeight.w900, fontSize: 12)),
                                  ],
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Upfront Fare Breakdown Card
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF18191D),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(activeTier['title'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                            Text('Guaranteed upfront price • No hidden surge', style: TextStyle(color: Colors.white.withOpacity(0.5), fontSize: 11)),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(activeTier['localFare'], style: const TextStyle(color: Color(0xFFFFB800), fontWeight: FontWeight.w900, fontSize: 16)),
                            Text(activeTier['usdFare'], style: const TextStyle(color: Colors.white60, fontSize: 11, fontFamily: 'monospace')),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),

                  // Primary Request Action Button (Min 48dp)
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFFB800),
                        foregroundColor: const Color(0xFF0F0F11),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {},
                      child: Text(
                        'REQUEST \${activeTier["title"].toUpperCase()}',
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, letterSpacing: 0.5),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// Low-Data High-Contrast Road Painter
class _MapRoadsPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paintRoad = Paint()
      ..color = const Color(0xFF262830)
      ..strokeWidth = 14
      ..style = PaintingStyle.stroke;

    final paintAccent = Paint()
      ..color = const Color(0xFFFFB800).withOpacity(0.4)
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke;

    // Simulated primary route
    final path = Path()
      ..moveTo(size.width * 0.25, size.height * 0.42)
      ..quadraticBezierTo(size.width * 0.5, size.height * 0.35, size.width * 0.72, size.height * 0.2);

    canvas.drawPath(path, paintRoad);
    canvas.drawPath(path, paintAccent);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _DriverMarker extends StatelessWidget {
  final IconData icon;
  final String label;
  const _DriverMarker({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: const Color(0xFFFFB800),
            borderRadius: BorderRadius.circular(19),
            boxShadow: const [BoxShadow(color: Colors.black54, blurRadius: 6)],
          ),
          child: Icon(icon, color: Colors.black, size: 20),
        ),
        Container(
          margin: const EdgeInsets.top(3),
          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
          decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(4)),
          child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
        ),
      ],
    );
  }
}

class _WaypointPin extends StatelessWidget {
  final Color color;
  final String label;
  const _WaypointPin({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(color: const Color(0xFF0F0F11), borderRadius: BorderRadius.circular(8), border: Border.all(color: color, width: 1.5)),
      child: Row(
        children: [
          Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 6),
          Text(label, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}`,
    reactNativeCode: `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

// Wap Passenger Interactive Map & Vehicle Selector (React Native Production Code)
export const InteractiveMapVehicleSelectorScreen: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<'2w' | '3w' | '4w'>('2w');

  const tiers = [
    {
      id: '2w',
      name: '2-Wheeler',
      sub: 'Moto Courier',
      capacity: '1 Pax',
      localPrice: '350 HTG',
      usdPrice: '$2.65',
      icon: '🏍️',
      color: '#FFB800',
    },
    {
      id: '3w',
      name: '3-Wheeler',
      sub: 'Tuk-Tuk Canopy',
      capacity: '3 Pax',
      localPrice: '500 HTG',
      usdPrice: '$3.80',
      icon: '🛺',
      color: '#00E5FF',
    },
    {
      id: '4w',
      name: '4-Wheeler',
      sub: 'Sedan / Van AC',
      capacity: '4-6 Pax',
      localPrice: '925 HTG',
      usdPrice: '$7.00',
      icon: '🚗',
      color: '#00E676',
    },
  ];

  const active = tiers.find((t) => t.id === selectedTier)!;

  return (
    <SafeAreaView style={styles.container}>
      {/* Map Surface View (Vector Simulated for Low-Bandwidth Devices) */}
      <View style={styles.mapCanvas}>
        {/* Route Overlay Line */}
        <View style={styles.mockRoutePath} />

        {/* Dynamic Driver Marker 1 */}
        <View style={[styles.driverMarker, { top: '35%', left: '42%' }]}>
          <Text style={styles.driverEmoji}>🏍️</Text>
          <View style={styles.driverTag}>
            <Text style={styles.driverTagText}>Moto • 3m</Text>
          </View>
        </View>

        {/* Dynamic Driver Marker 2 */}
        <View style={[styles.driverMarker, { top: '28%', right: '22%' }]}>
          <Text style={styles.driverEmoji}>🛺</Text>
          <View style={styles.driverTag}>
            <Text style={styles.driverTagText}>Tuk-Tuk • 5m</Text>
          </View>
        </View>

        {/* Top Destination Pill */}
        <View style={styles.topHud}>
          <View style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </View>
          <View style={styles.routePill}>
            <Text style={styles.routePillText}>Delmas 33 → Pétion-Ville (5.4 km)</Text>
          </View>
        </View>
      </View>

      {/* Bottom Modal Card */}
      <View style={styles.bottomCard}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>SELECT VEHICLE CLASS</Text>
          <Text style={styles.etaBadge}>14 MIN TRIP</Text>
        </View>

        {/* Vehicle Carousel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
          {tiers.map((t) => {
            const isSel = selectedTier === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.tierCard,
                  isSel && { borderColor: '#FFB800', backgroundColor: '#1E1F25' },
                ]}
                onPress={() => setSelectedTier(t.id as any)}
                activeOpacity={0.7}
              >
                <View style={styles.tierTopRow}>
                  <Text style={styles.tierIcon}>{t.icon}</Text>
                  <Text style={styles.capacityBadge}>{t.capacity}</Text>
                </View>
                <Text style={styles.tierName}>{t.name}</Text>
                <Text style={styles.tierPrice}>{t.localPrice}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Upfront Fare Estimate Box */}
        <View style={styles.fareSummaryBox}>
          <View>
            <Text style={styles.fareVehicleTitle}>{active.name} ({active.sub})</Text>
            <Text style={styles.fareGuarantee}>Guaranteed upfront price • Zero surge shock</Text>
          </View>
          <View style={styles.fareValues}>
            <Text style={styles.fareLocal}>{active.localPrice}</Text>
            <Text style={styles.fareUSD}>{active.usdPrice} USD</Text>
          </View>
        </View>

        {/* Action Button (Min 48dp) */}
        <TouchableOpacity style={styles.requestButton} activeOpacity={0.85}>
          <Text style={styles.requestButtonText}>CONFIRM {active.name.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F11' },
  mapCanvas: { flex: 1, backgroundColor: '#16171B', position: 'relative' },
  mockRoutePath: {
    position: 'absolute',
    top: '32%',
    left: '25%',
    width: 180,
    height: 6,
    backgroundColor: 'rgba(255,184,0,0.45)',
    borderRadius: 3,
    transform: [{ rotate: '-25deg' }],
  },
  driverMarker: { position: 'absolute', alignItems: 'center' },
  driverEmoji: { fontSize: 24 },
  driverTag: { backgroundColor: '#000', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4, marginTop: 2 },
  driverTagText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  topHud: { position: 'absolute', top: 12, left: 16, right: 16, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0F0F11', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  backArrow: { color: '#FFF', fontSize: 20 },
  routePill: { flex: 1, height: 48, backgroundColor: '#0F0F11', borderRadius: 24, marginLeft: 10, justifyContent: 'center', paddingHorizontal: 16, borderWidth: 1.2, borderColor: '#FFB800' },
  routePillText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  bottomCard: { backgroundColor: '#0F0F11', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 16, borderTopWidth: 1.5, borderColor: '#333' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sheetTitle: { color: '#9E9E9E', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  etaBadge: { color: '#FFB800', fontSize: 10, fontWeight: '800', backgroundColor: '#1C1D22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  carousel: { marginBottom: 14 },
  tierCard: { width: 130, height: 102, backgroundColor: '#141518', borderRadius: 16, padding: 10, marginRight: 10, borderWidth: 1, borderColor: '#2A2B30', justifyContent: 'space-between' },
  tierTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tierIcon: { fontSize: 22 },
  capacityBadge: { color: '#FFF', fontSize: 9, fontWeight: '700', backgroundColor: '#000', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  tierName: { color: '#FFF', fontWeight: '800', fontSize: 12 },
  tierPrice: { color: '#FFB800', fontWeight: '900', fontSize: 12 },
  fareSummaryBox: { backgroundColor: '#18191D', padding: 12, borderRadius: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  fareVehicleTitle: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  fareGuarantee: { color: '#888', fontSize: 10, marginTop: 2 },
  fareValues: { alignItems: 'flex-end' },
  fareLocal: { color: '#FFB800', fontWeight: '900', fontSize: 16 },
  fareUSD: { color: '#888', fontSize: 11, fontFamily: 'monospace' },
  requestButton: { height: 52, backgroundColor: '#FFB800', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  requestButtonText: { color: '#0F0F11', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
});`
  },

  // --------------------------------------------------------------------------
  // 3. PASSENGER SCREEN 3: Payment & Safety Checkout
  // --------------------------------------------------------------------------
  {
    id: 'passenger-safety',
    title: 'Screen 3: Payment & Safety Checkout',
    category: 'passenger',
    wireframeSpec: {
      layoutType: 'Checkout Ledger with High-Visibility Emergency Safety Bar',
      targetResolution: '360 x 640 dp',
      minTouchTarget: '52 x 52 dp (Payment items & SOS emergency trigger)',
      contrastRatio: '9.0:1 (Vibrant red SOS emergency banner + crisp payment rails)',
      networkBudget: '< 8 KB / Offline caching for emergency dispatch payload',
      keyElements: [
        'Multi-currency payment rail picker supporting Cash, Mobile Money (Wave, Orange Money, M-Pesa, MonCash), and Cards',
        'Safety Overlay Header with live verified driver identity & license plate',
        'Prominent "One-Tap SOS Emergency" button with instant GPS beacon broadcast',
        '"Share Trip Status" button generating end-to-end encrypted live tracking web links'
      ],
      interactionNotes: 'Tapping SOS triggers instantaneous haptic vibration, opens local emergency contacts, and broadcasts coordinates over SMS mesh if offline.'
    },
    flutterCode: `import 'package:flutter/material.dart';

// Wap Passenger Payment & Safety Checkout (Flutter Production Code)
class PaymentSafetyCheckoutScreen extends StatefulWidget {
  const PaymentSafetyCheckoutScreen({Key? key}) : super(key: key);

  @override
  State<PaymentSafetyCheckoutScreen> createState() =>
      _PaymentSafetyCheckoutScreenState();
}

class _PaymentSafetyCheckoutScreenState
    extends State<PaymentSafetyCheckoutScreen> {
  String _selectedPaymentMethod = 'mobile_money'; // cash | mobile_money | card

  final List<Map<String, dynamic>> _paymentOptions = [
    {
      'id': 'cash',
      'title': 'Cash on Pickup',
      'subtitle': 'Pay driver physical notes directly',
      'icon': Icons.payments_outlined,
      'badge': 'NO INTERNET NEEDED',
    },
    {
      'id': 'mobile_money',
      'title': 'Mobile Money Wallet',
      'subtitle': 'Wave, Orange Money, M-Pesa, MonCash',
      'icon': Icons.phone_android,
      'badge': 'INSTANT SETTLEMENT',
    },
    {
      'id': 'card',
      'title': 'Credit / Debit Card',
      'subtitle': 'Visa, Mastercard, Local Banking',
      'icon': Icons.credit_card,
      'badge': 'SECURE 3DS',
    },
  ];

  void _triggerSosEmergency() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1E0B0B),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.redAccent, size: 48),
            const SizedBox(height: 10),
            const Text(
              'ONE-TAP SOS ACTIVATED',
              style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 8),
            const Text(
              'Broadcasting live GPS telemetry (Lat 18.542, Lon -72.298) to local police command and emergency contacts via encrypted SMS mesh.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.white70, fontSize: 12),
            ),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
                onPressed: () => Navigator.pop(ctx),
                child: const Text('DISMISS SOS ALERT', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    const Color bgDark = Color(0xFF0F0F11);
    const Color cardDark = Color(0xFF18191D);
    const Color primaryAmber = Color(0xFFFFB800);

    return Scaffold(
      backgroundColor: bgDark,
      appBar: AppBar(
        backgroundColor: bgDark,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () {},
        ),
        title: const Text('Payment & Safety Checkout', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Critical Safety Header Banner (Prominent One-Tap SOS)
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF2A1010),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.redAccent, width: 1.5),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: const BoxDecoration(color: Colors.redAccent, shape: BoxShape.circle),
                      child: const Icon(Icons.shield_outlined, color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('WAP SAFETY SHIELD ACTIVE', style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w900, fontSize: 12)),
                          Text('Monitored trip • 24/7 Security Dispatch', style: TextStyle(color: Colors.white70, fontSize: 11)),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: _triggerSosEmergency,
                      child: const Text('SOS 🚨', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 12)),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Share Trip Status Button
              InkWell(
                onTap: () {},
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  height: 48,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: cardDark,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(Icons.share_location_rounded, color: primaryAmber, size: 18),
                          SizedBox(width: 8),
                          Text('Share Live Trip Status with Family', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w600)),
                        ],
                      ),
                      Icon(Icons.chevron_right, color: Colors.white38),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Payment Methods Header
              const Text('SELECT PAYMENT METHOD', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.8)),
              const SizedBox(height: 10),

              // Payment Selection List
              ..._paymentOptions.map((opt) {
                final isSelected = _selectedPaymentMethod == opt['id'];

                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: InkWell(
                    onTap: () => setState(() => _selectedPaymentMethod = opt['id']),
                    borderRadius: BorderRadius.circular(14),
                    child: Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: cardDark,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                          color: isSelected ? primaryAmber : Colors.white12,
                          width: isSelected ? 2.0 : 1.0,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(opt['icon'], color: isSelected ? primaryAmber : Colors.white60, size: 24),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(opt['title'], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14)),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(color: Colors.white10, borderRadius: BorderRadius.circular(4)),
                                      child: Text(opt['badge'], style: const TextStyle(color: primaryAmber, fontSize: 8, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 3),
                                Text(opt['subtitle'], style: const TextStyle(color: Colors.white54, fontSize: 11)),
                              ],
                            ),
                          ),
                          Icon(
                            isSelected ? Icons.check_circle : Icons.radio_button_unchecked,
                            color: isSelected ? primaryAmber : Colors.white30,
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),

              const Spacer(),

              // Checkout Total Box & Dispatch Button
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(color: cardDark, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white12)),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Total Payable Fare', style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600)),
                    Text('500 HTG ($3.80 USD)', style: TextStyle(color: primaryAmber, fontSize: 16, fontWeight: FontWeight.w900)),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: primaryAmber,
                    foregroundColor: bgDark,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: () {},
                  child: const Text('CONFIRM TRIP & DISPATCH DRIVER', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`,
    reactNativeCode: `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';

// Wap Passenger Payment & Safety Checkout (React Native Production Code)
export const PaymentSafetyCheckoutScreen: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'momo' | 'card'>('momo');

  const methods = [
    {
      id: 'cash',
      name: 'Cash on Pickup',
      desc: 'Pay driver physical notes directly',
      badge: 'OFFLINE CAPABLE',
      icon: '💵',
    },
    {
      id: 'momo',
      name: 'Mobile Money Wallet',
      desc: 'Wave, Orange Money, M-Pesa, MonCash',
      badge: 'INSTANT PAYOUT',
      icon: '📱',
    },
    {
      id: 'card',
      name: 'Credit / Debit Card',
      desc: 'Visa, Mastercard & Local Bank Cards',
      badge: 'SECURE 3DS',
      icon: '💳',
    },
  ];

  const handleSos = () => {
    Alert.alert(
      '🚨 EMERGENCY SOS ACTIVATED',
      'Transmitting vehicle GPS coordinates and driver telemetry to local emergency dispatch & selected safety contacts.',
      [{ text: 'DISMISS ALERT', style: 'cancel' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Prominent One-Tap SOS Emergency Banner */}
        <View style={styles.sosBanner}>
          <View style={styles.sosLeft}>
            <View style={styles.sosIconCircle}>
              <Text style={styles.sosShield}>🛡️</Text>
            </View>
            <View>
              <Text style={styles.sosTitle}>WAP SAFETY SHIELD</Text>
              <Text style={styles.sosSubtitle}>24/7 Monitored GPS Route</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.sosButton} onPress={handleSos} activeOpacity={0.8}>
            <Text style={styles.sosButtonText}>SOS 🚨</Text>
          </TouchableOpacity>
        </View>

        {/* Share Trip Status Button */}
        <TouchableOpacity style={styles.shareRow} activeOpacity={0.7}>
          <Text style={styles.shareText}>📍 Share Live Trip Status with Family</Text>
          <Text style={styles.shareChevron}>→</Text>
        </TouchableOpacity>

        {/* Payment Header */}
        <Text style={styles.sectionHeader}>SELECT PAYMENT METHOD</Text>

        {methods.map((m) => {
          const isSel = selectedMethod === m.id;
          return (
            <TouchableOpacity
              key={m.id}
              style={[styles.paymentCard, isSel && { borderColor: '#FFB800' }]}
              onPress={() => setSelectedMethod(m.id as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.methodIcon}>{m.icon}</Text>
              <View style={styles.methodInfo}>
                <View style={styles.titleBadgeRow}>
                  <Text style={styles.methodName}>{m.name}</Text>
                  <View style={styles.badgeBox}>
                    <Text style={styles.badgeText}>{m.badge}</Text>
                  </View>
                </View>
                <Text style={styles.methodDesc}>{m.desc}</Text>
              </View>
              <View style={[styles.radioCircle, isSel && styles.radioCircleActive]} />
            </TouchableOpacity>
          );
        })}

        <View style={{ flex: 1 }} />

        {/* Total & Checkout Action */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total Payable Fare</Text>
          <Text style={styles.totalValue}>500 HTG ($3.80 USD)</Text>
        </View>

        <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.85}>
          <Text style={styles.checkoutBtnText}>CONFIRM TRIP & DISPATCH</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F11' },
  inner: { flex: 1, padding: 16 },
  sosBanner: {
    backgroundColor: '#290E0E',
    borderColor: '#FF5252',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sosLeft: { flexDirection: 'row', alignItems: 'center' },
  sosIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FF5252', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  sosShield: { fontSize: 18 },
  sosTitle: { color: '#FF5252', fontWeight: '900', fontSize: 12 },
  sosSubtitle: { color: '#CCC', fontSize: 11 },
  sosButton: { backgroundColor: '#FF5252', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  sosButtonText: { color: '#FFF', fontWeight: '900', fontSize: 12 },
  shareRow: {
    height: 48,
    backgroundColor: '#18191D',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  shareText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  shareChevron: { color: '#888', fontSize: 16 },
  sectionHeader: { color: '#888', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 10 },
  paymentCard: {
    backgroundColor: '#18191D',
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: '#2A2B30',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  methodIcon: { fontSize: 24, marginRight: 12 },
  methodInfo: { flex: 1 },
  titleBadgeRow: { flexDirection: 'row', alignItems: 'center' },
  methodName: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  badgeBox: { backgroundColor: '#262830', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 6 },
  badgeText: { color: '#FFB800', fontSize: 8, fontWeight: '800' },
  methodDesc: { color: '#888', fontSize: 11, marginTop: 2 },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#555' },
  radioCircleActive: { borderColor: '#FFB800', backgroundColor: '#FFB800' },
  totalBox: { backgroundColor: '#18191D', padding: 14, borderRadius: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalLabel: { color: '#888', fontSize: 13, fontWeight: '600' },
  totalValue: { color: '#FFB800', fontSize: 16, fontWeight: '900' },
  checkoutBtn: { height: 52, backgroundColor: '#FFB800', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  checkoutBtnText: { color: '#0F0F11', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
});`
  },

  // --------------------------------------------------------------------------
  // 4. DRIVER SCREEN 1: Driver Document Onboarding
  // --------------------------------------------------------------------------
  {
    id: 'driver-onboarding',
    title: 'Screen 4: Driver Document Onboarding',
    category: 'driver',
    wireframeSpec: {
      layoutType: 'Step-by-Step Document Camera Viewfinder with Edge Detection',
      targetResolution: '360 x 640 dp',
      minTouchTarget: '48 x 48 dp for camera shutter & step cards',
      contrastRatio: '8.5:1 (Outdoor high glare contrast viewfinder)',
      networkBudget: '< 180 KB compressed JPEG with local client-side OCR parsing',
      keyElements: [
        '3-Step progress header: Driver License → Vehicle Registration → Commercial Insurance',
        'Camera viewfinder overlay with corner guide brackets and lighting warning',
        'Upload status badge (Verified, Reviewing, Action Required)',
        'Local image compressor ensuring uploads complete under poor 2G/EDGE connectivity'
      ],
      interactionNotes: 'On snap, runs local TensorFlow Lite / ML Kit edge boundary detection to reject blurry or obstructed documents immediately.'
    },
    flutterCode: `import 'package:flutter/material.dart';

// Wap Driver Document Camera Onboarding (Flutter Production Code)
class DriverDocumentOnboardingScreen extends StatefulWidget {
  const DriverDocumentOnboardingScreen({Key? key}) : super(key: key);

  @override
  State<DriverDocumentOnboardingScreen> createState() =>
      _DriverDocumentOnboardingScreenState();
}

class _DriverDocumentOnboardingScreenState
    extends State<DriverDocumentOnboardingScreen> {
  int _currentStep = 0; // 0 = License, 1 = Registration, 2 = Insurance
  bool _photoCaptured = false;

  final List<Map<String, String>> _docSteps = [
    {
      'title': "Driver's License",
      'desc': 'Take a clear photo of the front of your official driving permit.',
      'code': 'PERMIS_DE_CONDUIRE',
    },
    {
      'title': 'Vehicle Registration',
      'desc': 'Capture your vehicle ownership card (Carte Grise / Titulo).',
      'code': 'CARTE_GRISE',
    },
    {
      'title': 'Passenger Insurance',
      'desc': 'Commercial passenger indemnity policy valid for 2026.',
      'code': 'ASSURANCE_WAP',
    },
  ];

  @override
  Widget build(BuildContext context) {
    const Color bgDark = Color(0xFF0F0F11);
    const Color primaryAmber = Color(0xFFFFB800);
    final activeDoc = _docSteps[_currentStep];

    return Scaffold(
      backgroundColor: bgDark,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header & Step Indicator
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('DRIVER VERIFICATION', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16)),
                  Text('Step \${_currentStep + 1} of 3', style: const TextStyle(color: primaryAmber, fontWeight: FontWeight.bold, fontSize: 12)),
                ],
              ),
              const SizedBox(height: 12),

              // Progress Bar
              Row(
                children: List.generate(3, (i) {
                  return Expanded(
                    child: Container(
                      height: 4,
                      margin: EdgeInsets.only(right: i < 2 ? 6 : 0),
                      decoration: BoxDecoration(
                        color: i <= _currentStep ? primaryAmber : Colors.white12,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  );
                }),
              ),
              const SizedBox(height: 20),

              Text(activeDoc['title']!, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)),
              const SizedBox(height: 4),
              Text(activeDoc['desc']!, style: const TextStyle(color: Colors.white60, fontSize: 12, height: 1.4)),
              const SizedBox(height: 20),

              // Camera Viewfinder Box with Visual Corner Guides
              Expanded(
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: const Color(0xFF16171B),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Viewfinder Corner Brackets
                      Positioned(top: 20, left: 20, child: _CornerBracket(isTop: true, isLeft: true)),
                      Positioned(top: 20, right: 20, child: _CornerBracket(isTop: true, isLeft: false)),
                      Positioned(bottom: 20, left: 20, child: _CornerBracket(isTop: false, isLeft: true)),
                      Positioned(bottom: 20, right: 20, child: _CornerBracket(isTop: false, isLeft: false)),

                      if (!_photoCaptured) ...[
                        const Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.camera_alt_outlined, color: primaryAmber, size: 48),
                            SizedBox(height: 10),
                            Text('Align document inside the frame', style: TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.bold)),
                            SizedBox(height: 4),
                            Text('Ensure good outdoor daylight & avoid glare', style: TextStyle(color: Colors.white38, fontSize: 10)),
                          ],
                        ),
                      ] else ...[
                        Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.check_circle, color: Color(0xFF00E676), size: 48),
                            const SizedBox(height: 10),
                            const Text('Document Captured Successfully', style: TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
                            const SizedBox(height: 4),
                            Text('OCR Confidence: 97.4% • \${activeDoc["code"]}', style: const TextStyle(color: primaryAmber, fontSize: 11)),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Shutter or Next Step Button
              if (!_photoCaptured) ...[
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: primaryAmber,
                      foregroundColor: bgDark,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: () => setState(() => _photoCaptured = true),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.camera, size: 20),
                        SizedBox(width: 8),
                        Text('CAPTURE PHOTO NOW', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
                      ],
                    ),
                  ),
                ),
              ] else ...[
                Row(
                  children: [
                    Expanded(
                      child: SizedBox(
                        height: 52,
                        child: OutlinedButton(
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: Colors.white30),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: () => setState(() => _photoCaptured = false),
                          child: const Text('RE-TAKE', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: SizedBox(
                        height: 52,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF00E676),
                            foregroundColor: bgDark,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          ),
                          onPressed: () {
                            if (_currentStep < 2) {
                              setState(() {
                                _currentStep++;
                                _photoCaptured = false;
                              });
                            }
                          },
                          child: Text(
                            _currentStep == 2 ? 'FINISH UPLOAD' : 'CONFIRM & NEXT',
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _CornerBracket extends StatelessWidget {
  final bool isTop;
  final bool isLeft;
  const _CornerBracket({required this.isTop, required this.isLeft});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        border: Border(
          top: isTop ? const BorderSide(color: Color(0xFFFFB800), width: 3) : BorderSide.none,
          bottom: !isTop ? const BorderSide(color: Color(0xFFFFB800), width: 3) : BorderSide.none,
          left: isLeft ? const BorderSide(color: Color(0xFFFFB800), width: 3) : BorderSide.none,
          right: !isLeft ? const BorderSide(color: Color(0xFFFFB800), width: 3) : BorderSide.none,
        ),
      ),
    );
  }
}`,
    reactNativeCode: `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

// Wap Driver Document Camera Onboarding (React Native Production Code)
export const DriverDocumentOnboardingScreen: React.FC = () => {
  const [step, setStep] = useState(0);
  const [captured, setCaptured] = useState(false);

  const steps = [
    { title: "Driver's License", desc: 'Scan government issued driver permit front.' },
    { title: 'Vehicle Registration', desc: 'Scan official motorcycle/tuk-tuk title card.' },
    { title: 'Commercial Insurance', desc: 'Scan passenger indemnity policy document.' },
  ];

  const current = steps[step];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Top Stepper */}
        <View style={styles.topRow}>
          <Text style={styles.headerTitle}>DRIVER VERIFICATION</Text>
          <Text style={styles.stepIndicator}>Step {step + 1} of 3</Text>
        </View>

        {/* Segmented Bar */}
        <View style={styles.progressBar}>
          {steps.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressSegment,
                i <= step && { backgroundColor: '#FFB800' },
              ]}
            />
          ))}
        </View>

        <Text style={styles.docTitle}>{current.title}</Text>
        <Text style={styles.docDesc}>{current.desc}</Text>

        {/* Camera Viewfinder */}
        <View style={styles.viewfinder}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {!captured ? (
            <View style={styles.viewfinderCenter}>
              <Text style={styles.cameraIcon}>📸</Text>
              <Text style={styles.cameraHelp}>Align document within the guides</Text>
              <Text style={styles.cameraSub}>Outdoor sunlight recommended</Text>
            </View>
          ) : (
            <View style={styles.viewfinderCenter}>
              <Text style={styles.cameraIcon}>✅</Text>
              <Text style={styles.cameraHelp}>Photo Captured & OCR Scanned</Text>
              <Text style={styles.ocrSuccess}>Confidence: 98.2% • Verified</Text>
            </View>
          )}
        </View>

        {/* Action Controls */}
        {!captured ? (
          <TouchableOpacity
            style={styles.captureBtn}
            onPress={() => setCaptured(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.captureBtnText}>CAPTURE DOCUMENT PHOTO</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.retakeBtn}
              onPress={() => setCaptured(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.retakeBtnText}>RE-TAKE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => {
                if (step < 2) {
                  setStep(step + 1);
                  setCaptured(false);
                }
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmBtnText}>
                {step === 2 ? 'SUBMIT ALL' : 'CONFIRM & NEXT'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F11' },
  inner: { flex: 1, padding: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerTitle: { color: '#FFF', fontWeight: '900', fontSize: 15 },
  stepIndicator: { color: '#FFB800', fontWeight: '800', fontSize: 12 },
  progressBar: { flexDirection: 'row', gap: 6, marginBottom: 20 },
  progressSegment: { flex: 1, height: 4, backgroundColor: '#222', borderRadius: 2 },
  docTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  docDesc: { color: '#888', fontSize: 12, lineHeight: 18, marginBottom: 20 },
  viewfinder: {
    flex: 1,
    backgroundColor: '#16171B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  corner: { position: 'absolute', width: 22, height: 22, borderColor: '#FFB800' },
  cornerTL: { top: 16, left: 16, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTR: { top: 16, right: 16, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBL: { bottom: 16, left: 16, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBR: { bottom: 16, right: 16, borderBottomWidth: 3, borderRightWidth: 3 },
  viewfinderCenter: { alignItems: 'center' },
  cameraIcon: { fontSize: 42, marginBottom: 10 },
  cameraHelp: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  cameraSub: { color: '#777', fontSize: 11, marginTop: 4 },
  ocrSuccess: { color: '#00E676', fontWeight: '800', fontSize: 12, marginTop: 4 },
  captureBtn: { height: 52, backgroundColor: '#FFB800', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  captureBtnText: { color: '#0F0F11', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  btnRow: { flexDirection: 'row', gap: 10 },
  retakeBtn: { flex: 1, height: 52, borderWidth: 1, borderColor: '#444', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  retakeBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  confirmBtn: { flex: 2, height: 52, backgroundColor: '#00E676', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  confirmBtnText: { color: '#0F0F11', fontWeight: '900', fontSize: 13 },
});`
  },

  // --------------------------------------------------------------------------
  // 5. DRIVER SCREEN 2: Driver Dashboard & Ride Dispatch
  // --------------------------------------------------------------------------
  {
    id: 'driver-dispatch',
    title: 'Screen 5: Driver Dashboard & Ride Dispatch',
    category: 'driver',
    wireframeSpec: {
      layoutType: 'Live Status Dashboard with Incoming Trip Request Overlay Card',
      targetResolution: '360 x 640 dp',
      minTouchTarget: '56 x 56 dp for Accept & Decline actions',
      contrastRatio: '9.2:1 (Emergency yellow dispatch banner + high contrast accept/decline buttons)',
      networkBudget: '< 1.2 KB payload per dispatch ping with audio chirp trigger',
      keyElements: [
        'Top bar with physical Online/Offline toggle switch & today total earnings ticker',
        'Hourly earnings pace gauge ($5.00 - $12.00 USD/hr target)',
        'Pop-up incoming dispatch card with 15s circular countdown timer',
        'Pickup distance, trip fare in local currency and USD, vehicle tier (2W Moto), passenger rating',
        'Large Accept (green) and Decline (neutral grey) touch areas'
      ],
      interactionNotes: 'Accept triggers turn-by-turn vector navigation HUD with low-data caching.'
    },
    flutterCode: `import 'package:flutter/material.dart';

// Wap Driver Dashboard & Ride Dispatch (Flutter Production Code)
class DriverDashboardDispatchScreen extends StatefulWidget {
  const DriverDashboardDispatchScreen({Key? key}) : super(key: key);

  @override
  State<DriverDashboardDispatchScreen> createState() =>
      _DriverDashboardDispatchScreenState();
}

class _DriverDashboardDispatchScreenState
    extends State<DriverDashboardDispatchScreen> {
  bool _isOnline = true;
  bool _hasIncomingTrip = true;
  int _countdownSeconds = 14;

  @override
  Widget build(BuildContext context) {
    const Color bgDark = Color(0xFF0F0F11);
    const Color cardDark = Color(0xFF18191D);
    const Color primaryAmber = Color(0xFFFFB800);

    return Scaffold(
      backgroundColor: bgDark,
      body: SafeArea(
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Header with Online/Offline Switch
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              color: primaryAmber.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: primaryAmber),
                            ),
                            child: const Center(
                              child: Text('JM', style: TextStyle(color: primaryAmber, fontWeight: FontWeight.w900)),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Jean-Marc Valmy', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                              Row(
                                children: [
                                  Container(
                                    width: 8,
                                    height: 8,
                                    decoration: BoxDecoration(
                                      color: _isOnline ? const Color(0xFF00E676) : Colors.grey,
                                      shape: BoxShape.circle,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    _isOnline ? 'ONLINE & READY' : 'OFFLINE',
                                    style: TextStyle(
                                      color: _isOnline ? const Color(0xFF00E676) : Colors.grey,
                                      fontSize: 10,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),

                      // Online / Offline Switch
                      Switch(
                        value: _isOnline,
                        activeColor: const Color(0xFF00E676),
                        inactiveThumbColor: Colors.grey,
                        onChanged: (val) => setState(() => _isOnline = val),
                      ),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Today Earnings Pacer ($5 - $12/hr Target)
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: cardDark,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text("TODAY'S NET EARNINGS", style: TextStyle(color: Colors.white60, fontSize: 10, fontWeight: FontWeight.bold)),
                            SizedBox(height: 4),
                            Text('$34.50 USD', style: TextStyle(color: primaryAmber, fontSize: 20, fontWeight: FontWeight.w900)),
                            Text('≈ 4,500 HTG (11 Completed Trips)', style: TextStyle(color: Colors.white54, fontSize: 11)),
                          ],
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF00E676).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(color: const Color(0xFF00E676)),
                          ),
                          child: const Column(
                            children: [
                              Text('Pace', style: TextStyle(color: Color(0xFF00E676), fontSize: 9, fontWeight: FontWeight.bold)),
                              Text('$8.60/hr', style: TextStyle(color: Color(0xFF00E676), fontSize: 14, fontWeight: FontWeight.w900)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Pop-Up Incoming Trip Request Card
            if (_hasIncomingTrip && _isOnline)
              Align(
                alignment: Alignment.bottomCenter,
                child: Container(
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(18),
                  decoration: BoxDecoration(
                    color: const Color(0xFF141518),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: primaryAmber, width: 2.0),
                    boxShadow: const [BoxShadow(color: Colors.black87, blurRadius: 16)],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Alert Banner & Countdown
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Row(
                            children: [
                              Icon(Icons.bolt, color: primaryAmber, size: 20),
                              SizedBox(width: 6),
                              Text('NEW DISPATCH OFFER', style: TextStyle(color: primaryAmber, fontWeight: FontWeight.w900, fontSize: 13)),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(8)),
                            child: Text('$_countdownSeconds s', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 11)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      // Fare & Vehicle Pill
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Guaranteed Net Fare', style: TextStyle(color: Colors.white54, fontSize: 11)),
                              const Text('500 HTG ($3.80 USD)', style: TextStyle(color: primaryAmber, fontSize: 20, fontWeight: FontWeight.w900)),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(color: const Color(0xFF1F2026), borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.white24)),
                            child: const Row(
                              children: [
                                Icon(Icons.two_wheeler, color: primaryAmber, size: 16),
                                SizedBox(width: 6),
                                Text('2-WHEELER MOTO', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10)),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),

                      // Pickup & Destination
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(color: const Color(0xFF1B1C22), borderRadius: BorderRadius.circular(12)),
                        child: const Column(
                          children: [
                            Row(
                              children: [
                                Icon(Icons.location_on, color: Color(0xFF00E676), size: 16),
                                SizedBox(width: 8),
                                Expanded(child: Text('Pickup: Delmas 33 (0.8 km • 3 min away)', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold))),
                              ],
                            ),
                            Divider(color: Colors.white12, height: 16),
                            Row(
                              children: [
                                Icon(Icons.navigation, color: Colors.redAccent, size: 16),
                                SizedBox(width: 8),
                                Expanded(child: Text('Dropoff: Pétion-Ville, Otèl Kinam (5.4 km)', style: TextStyle(color: Colors.white70, fontSize: 12))),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),

                      // Accept / Decline Buttons (Min 52dp Touch targets)
                      Row(
                        children: [
                          Expanded(
                            child: SizedBox(
                              height: 52,
                              child: OutlinedButton(
                                style: OutlinedButton.styleFrom(
                                  side: const BorderSide(color: Colors.white24),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                ),
                                onPressed: () => setState(() => _hasIncomingTrip = false),
                                child: const Text('DECLINE', style: TextStyle(color: Colors.white60, fontWeight: FontWeight.bold)),
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            flex: 2,
                            child: SizedBox(
                              height: 52,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF00E676),
                                  foregroundColor: bgDark,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                                ),
                                onPressed: () {
                                  // Accept logic
                                },
                                child: const Text('ACCEPT TRIP', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 14)),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}`,
    reactNativeCode: `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

// Wap Driver Dashboard & Ride Dispatch (React Native Production Code)
export const DriverDashboardDispatchScreen: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [incomingOffer, setIncomingOffer] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Top Header */}
        <View style={styles.header}>
          <View style={styles.driverProfile}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarText}>JM</Text>
            </View>
            <View>
              <Text style={styles.driverName}>Jean-Marc Valmy</Text>
              <Text style={[styles.statusText, isOnline ? styles.onlineColor : styles.offlineColor]}>
                {isOnline ? '● ONLINE & SEARCHING' : '○ OFFLINE'}
              </Text>
            </View>
          </View>
          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{ false: '#333', true: '#00E676' }}
            thumbColor="#FFF"
          />
        </View>

        {/* Daily Earnings Gauge */}
        <View style={styles.earningsBox}>
          <View>
            <Text style={styles.earningsLabel}>TODAY'S NET REVENUE</Text>
            <Text style={styles.earningsValue}>$34.50 USD</Text>
            <Text style={styles.earningsLocal}>≈ 4,500 HTG (11 Rides)</Text>
          </View>
          <View style={styles.paceBadge}>
            <Text style={styles.paceLabel}>PACE</Text>
            <Text style={styles.paceValue}>$8.60/hr</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* Incoming Dispatch Overlay Card */}
        {incomingOffer && isOnline && (
          <View style={styles.dispatchCard}>
            <View style={styles.dispatchTopRow}>
              <Text style={styles.dispatchTitle}>⚡ NEW DISPATCH OFFER</Text>
              <View style={styles.timerBadge}>
                <Text style={styles.timerText}>14s</Text>
              </View>
            </View>

            {/* Fare and Vehicle */}
            <View style={styles.fareRow}>
              <View>
                <Text style={styles.fareLabel}>Guaranteed Net Earnings</Text>
                <Text style={styles.fareAmount}>500 HTG ($3.80 USD)</Text>
              </View>
              <View style={styles.vehiclePill}>
                <Text style={styles.vehiclePillText}>🏍️ 2-WHEELER</Text>
              </View>
            </View>

            {/* Route Landmarks */}
            <View style={styles.routeBox}>
              <Text style={styles.pickupText}>🟢 Pickup: Delmas 33 (0.8 km • 3m away)</Text>
              <View style={styles.divider} />
              <Text style={styles.dropoffText}>🔴 Dropoff: Pétion-Ville, Otèl Kinam (5.4 km)</Text>
            </View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.declineBtn}
                onPress={() => setIncomingOffer(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.declineBtnText}>DECLINE</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} activeOpacity={0.85}>
                <Text style={styles.acceptBtnText}>ACCEPT TRIP</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F11' },
  inner: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  driverProfile: { flexDirection: 'row', alignItems: 'center' },
  avatarBox: { width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: '#FFB800', backgroundColor: 'rgba(255,184,0,0.15)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: '#FFB800', fontWeight: '900' },
  driverName: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  statusText: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  onlineColor: { color: '#00E676' },
  offlineColor: { color: '#888' },
  earningsBox: { backgroundColor: '#18191D', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#333', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  earningsLabel: { color: '#888', fontSize: 10, fontWeight: '800' },
  earningsValue: { color: '#FFB800', fontSize: 22, fontWeight: '900', marginTop: 2 },
  earningsLocal: { color: '#888', fontSize: 11, marginTop: 2 },
  paceBadge: { backgroundColor: 'rgba(0,230,118,0.12)', borderWidth: 1, borderColor: '#00E676', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, alignItems: 'center' },
  paceLabel: { color: '#00E676', fontSize: 9, fontWeight: '800' },
  paceValue: { color: '#00E676', fontSize: 14, fontWeight: '900' },
  dispatchCard: { backgroundColor: '#141518', borderRadius: 22, borderWidth: 2, borderColor: '#FFB800', padding: 16 },
  dispatchTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dispatchTitle: { color: '#FFB800', fontWeight: '900', fontSize: 13 },
  timerBadge: { backgroundColor: '#000', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  timerText: { color: '#FFF', fontWeight: '900', fontSize: 11 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  fareLabel: { color: '#888', fontSize: 11 },
  fareAmount: { color: '#FFB800', fontSize: 18, fontWeight: '900' },
  vehiclePill: { backgroundColor: '#1E1F25', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#333' },
  vehiclePillText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  routeBox: { backgroundColor: '#1B1C22', padding: 12, borderRadius: 12, marginBottom: 16 },
  pickupText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#333', marginVertical: 8 },
  dropoffText: { color: '#AAA', fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 10 },
  declineBtn: { flex: 1, height: 52, borderWidth: 1, borderColor: '#444', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  declineBtnText: { color: '#AAA', fontWeight: '700', fontSize: 13 },
  acceptBtn: { flex: 2, height: 52, backgroundColor: '#00E676', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  acceptBtnText: { color: '#0F0F11', fontWeight: '900', fontSize: 14 },
});`
  },

  // --------------------------------------------------------------------------
  // 6. DRIVER SCREEN 3: Real-Time Earnings & Cash-Out Screen
  // --------------------------------------------------------------------------
  {
    id: 'driver-earnings',
    title: 'Screen 6: Real-Time Earnings & Cash-Out',
    category: 'driver',
    wireframeSpec: {
      layoutType: 'Financial Ledger & Micro-Chart Dashboard with Instant Settlement Rail',
      targetResolution: '360 x 640 dp',
      minTouchTarget: '52 x 52 dp for instant cash-out button',
      contrastRatio: '8.4:1 (Outdoor high contrast financial ledger)',
      networkBudget: '< 4 KB payload for ledger synchronization',
      keyElements: [
        'Daily and weekly earnings summary graph (Bar visualization)',
        'Clear breakdown of Cash Collected (in-hand) vs. App Credit Balance (in-wallet)',
        'Platform 12% commission deductor transparency',
        '"Instant Cash Out to Mobile Wallet / Bank" primary action button with zero latency transfer'
      ],
      interactionNotes: 'Instant cash-out integrates with regional mobile money rails (MonCash, Wave, M-Pesa) without locking funds.'
    },
    flutterCode: `import 'package:flutter/material.dart';

// Wap Driver Earnings & Instant Cash-Out (Flutter Production Code)
class DriverEarningsCashOutScreen extends StatefulWidget {
  const DriverEarningsCashOutScreen({Key? key}) : super(key: key);

  @override
  State<DriverEarningsCashOutScreen> createState() =>
      _DriverEarningsCashOutScreenState();
}

class _DriverEarningsCashOutScreenState
    extends State<DriverEarningsCashOutScreen> {
  double _walletCreditUSD = 42.80;
  double _cashInHandUSD = 18.20;
  bool _isCashingOut = false;

  final List<double> _weeklyEarnings = [24, 38, 45, 52, 48, 62, 58]; // Mon-Sun ($)

  void _handleInstantCashOut() {
    setState(() => _isCashingOut = true);
    Future.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) {
        setState(() {
          _isCashingOut = false;
          _walletCreditUSD = 0.0;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            backgroundColor: Color(0xFF00E676),
            content: Text('Payout Transferred Instantly to Mobile Money Wallet!', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    const Color bgDark = Color(0xFF0F0F11);
    const Color cardDark = Color(0xFF18191D);
    const Color primaryAmber = Color(0xFFFFB800);

    return Scaffold(
      backgroundColor: bgDark,
      appBar: AppBar(
        backgroundColor: bgDark,
        elevation: 0,
        title: const Text('Earnings & Instant Cash-Out', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Total Balance Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: cardDark,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: primaryAmber.withOpacity(0.5), width: 1.5),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('AVAILABLE FOR INSTANT CASH-OUT', style: TextStyle(color: Colors.white60, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.8)),
                    const SizedBox(height: 6),
                    Text('\$\${_walletCreditUSD.toStringAsFixed(2)} USD', style: const TextStyle(color: primaryAmber, fontSize: 28, fontWeight: FontWeight.w900)),
                    Text('≈ \${(_walletCreditUSD * 131.5).toStringAsFixed(0)} HTG (Local Mobile Rail)', style: const TextStyle(color: Colors.white54, fontSize: 11)),
                  ],
                ),
              ),
              const SizedBox(height: 14),

              // Breakdown: Cash Collected vs App Credit Balance
              Row(
                children: [
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: cardDark, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white12)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Cash in Hand', style: TextStyle(color: Colors.white60, fontSize: 10)),
                          const SizedBox(height: 4),
                          Text('\$\${_cashInHandUSD.toStringAsFixed(2)} USD', style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w800)),
                          const Text('Collected directly', style: TextStyle(color: Colors.white38, fontSize: 9)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(color: cardDark, borderRadius: BorderRadius.circular(14), border: Border.all(color: Colors.white12)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('App Wallet Credit', style: TextStyle(color: Colors.white60, fontSize: 10)),
                          const SizedBox(height: 4),
                          Text('\$\${_walletCreditUSD.toStringAsFixed(2)} USD', style: const TextStyle(color: Color(0xFF00E676), fontSize: 15, fontWeight: FontWeight.w800)),
                          const Text('Ready to withdraw', style: TextStyle(color: Colors.white38, fontSize: 9)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Weekly Earnings Summary Bar Chart
              const Text('WEEKLY RUN-RATE ($5 - $12/HR BENCHMARK)', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.8)),
              const SizedBox(height: 10),

              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(color: cardDark, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white12)),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: List.generate(7, (i) {
                        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                        final val = _weeklyEarnings[i];
                        final heightFactor = val / 70.0;

                        return Column(
                          children: [
                            Text('\$\${val.toInt()}', style: const TextStyle(color: Colors.white54, fontSize: 9)),
                            const SizedBox(height: 4),
                            Container(
                              width: 26,
                              height: 80 * heightFactor,
                              decoration: BoxDecoration(
                                color: i == 6 ? primaryAmber : const Color(0xFF2C2D35),
                                borderRadius: BorderRadius.circular(6),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(days[i], style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
                          ],
                        );
                      }),
                    ),
                  ],
                ),
              ),
              const Spacer(),

              // Instant Cash Out Primary Button (Min 52dp)
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF00E676),
                    foregroundColor: bgDark,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: _walletCreditUSD <= 0 || _isCashingOut ? null : _handleInstantCashOut,
                  child: _isCashingOut
                      ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: bgDark))
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.flash_on, size: 20),
                            SizedBox(width: 8),
                            Text('INSTANT CASH OUT TO MOBILE WALLET', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.5)),
                          ],
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}`,
    reactNativeCode: `import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';

// Wap Driver Earnings & Instant Cash-Out (React Native Production Code)
export const DriverEarningsCashOutScreen: React.FC = () => {
  const [walletBalance, setWalletBalance] = useState(42.8);
  const [cashCollected, setCashCollected] = useState(18.2);
  const [loading, setLoading] = useState(false);

  const weekly = [24, 38, 45, 52, 48, 62, 58];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const handleCashOut = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setWalletBalance(0);
      Alert.alert(
        '⚡ CASHOUT COMPLETE',
        'Funds sent instantly via mobile money gateway (Wave / Orange Money / MonCash).'
      );
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Main Wallet Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>AVAILABLE FOR INSTANT CASH-OUT</Text>
          <Text style={styles.balanceAmount}>\${walletBalance.toFixed(2)} USD</Text>
          <Text style={styles.balanceLocal}>≈ {(walletBalance * 131.5).toFixed(0)} HTG Local Mobile Money</Text>
        </View>

        {/* Breakdown Row */}
        <View style={styles.breakdownRow}>
          <View style={styles.splitBox}>
            <Text style={styles.splitLabel}>Cash in Hand</Text>
            <Text style={styles.splitValue}>\${cashCollected.toFixed(2)} USD</Text>
            <Text style={styles.splitSub}>Physical notes</Text>
          </View>
          <View style={styles.splitBox}>
            <Text style={styles.splitLabel}>App Credit</Text>
            <Text style={[styles.splitValue, { color: '#00E676' }]}>\${walletBalance.toFixed(2)} USD</Text>
            <Text style={styles.splitSub}>Digital wallet</Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <Text style={styles.chartTitle}>WEEKLY RUN-RATE ($5 - $12/HR BENCHMARK)</Text>
        <View style={styles.chartContainer}>
          <View style={styles.chartRow}>
            {weekly.map((val, idx) => {
              const h = (val / 70) * 80;
              const isToday = idx === 6;
              return (
                <View key={idx} style={styles.barCol}>
                  <Text style={styles.barVal}>\${val}</Text>
                  <View style={[styles.bar, { height: h }, isToday && { backgroundColor: '#FFB800' }]} />
                  <Text style={styles.barDay}>{days[idx]}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* Cash Out Button (Min 52dp) */}
        <TouchableOpacity
          style={[styles.cashOutBtn, walletBalance <= 0 && { opacity: 0.5 }]}
          onPress={handleCashOut}
          disabled={walletBalance <= 0 || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#0F0F11" />
          ) : (
            <Text style={styles.cashOutBtnText}>⚡ INSTANT CASH OUT TO MOBILE WALLET</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F11' },
  inner: { flex: 1, padding: 16 },
  balanceCard: { backgroundColor: '#18191D', borderWidth: 1.5, borderColor: '#FFB800', borderRadius: 20, padding: 18, marginBottom: 12 },
  balanceLabel: { color: '#888', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  balanceAmount: { color: '#FFB800', fontSize: 30, fontWeight: '900', marginTop: 4 },
  balanceLocal: { color: '#888', fontSize: 11, marginTop: 4 },
  breakdownRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  splitBox: { flex: 1, backgroundColor: '#18191D', borderRadius: 14, borderWidth: 1, borderColor: '#333', padding: 12 },
  splitLabel: { color: '#888', fontSize: 10, fontWeight: '700' },
  splitValue: { color: '#FFF', fontSize: 16, fontWeight: '900', marginTop: 4 },
  splitSub: { color: '#666', fontSize: 9, marginTop: 2 },
  chartTitle: { color: '#888', fontSize: 11, fontWeight: '800', letterSpacing: 0.8, marginBottom: 10 },
  chartContainer: { backgroundColor: '#18191D', borderRadius: 16, borderWidth: 1, borderColor: '#333', padding: 16 },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 110 },
  barCol: { alignItems: 'center' },
  barVal: { color: '#777', fontSize: 9, marginBottom: 4 },
  bar: { width: 24, backgroundColor: '#2C2D35', borderRadius: 6 },
  barDay: { color: '#FFF', fontSize: 10, fontWeight: '700', marginTop: 6 },
  cashOutBtn: { height: 52, backgroundColor: '#00E676', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cashOutBtnText: { color: '#0F0F11', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
});`
  },
];
