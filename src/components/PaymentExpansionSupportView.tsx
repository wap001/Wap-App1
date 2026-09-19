import React, { useState } from 'react';
import {
  CreditCard,
  MessageSquare,
  Globe,
  Headphones,
  ShieldAlert,
  Send,
  Volume2,
  CheckCircle2,
  Sparkles,
  Smartphone,
  ExternalLink,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import {
  EXPANSION_GATEWAYS,
  SAMPLE_CHAT_MESSAGES
} from '../data/extendedArchitectureData';
import { ExpansionCountry, SupportChatMessage } from '../types/architecture';

export const PaymentExpansionSupportView: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState<ExpansionCountry>('brazil');
  const [chatMessages, setChatMessages] = useState<SupportChatMessage[]>(SAMPLE_CHAT_MESSAGES);
  const [newChatText, setNewChatText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'gateways' | 'support_chat' | 'diaspora_remittance' | 'emergency_sos'>('gateways');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  const countryData = EXPANSION_GATEWAYS.find((g) => g.country === selectedCountry) || EXPANSION_GATEWAYS[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    const newMessage: SupportChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'usr-customer-101',
      senderName: 'Daphnée (Customer)',
      senderRole: 'customer',
      originalLanguage: 'ht',
      originalText: newChatText,
      translatedText: `[Auto-Translated] ${newChatText}`,
      targetLanguage: 'fr',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    };

    setChatMessages([...chatMessages, newMessage]);
    setNewChatText('');
  };

  const handleSimulateVoiceNote = () => {
    setIsRecordingVoice(true);
    setTimeout(() => {
      setIsRecordingVoice(false);
      const voiceMsg: SupportChatMessage = {
        id: `msg-voice-${Date.now()}`,
        senderId: 'usr-driver-891',
        senderName: 'Jean-Baptiste (Moto Driver)',
        senderRole: 'driver',
        originalLanguage: 'ht',
        originalText: '🎙️ [Nòt Vokal]: "Mwen devan pòtay la, tanpri soti."',
        translatedText: '🎙️ [Message Vocal]: "Je suis devant le portail, veuillez sortir s’il vous plaît."',
        targetLanguage: 'fr',
        audioUrl: '/audio/voice_notes/simulated.mp3',
        audioDurationSeconds: 3,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'delivered',
      };
      setChatMessages((prev) => [...prev, voiceMsg]);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
          <Globe className="w-5 h-5" />
          <span>REGIONAL EXPANSION & MULTI-CHANNEL SUPPORT</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Payment Gateway Expansion & Omni-Channel Multilingual Support
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
          Unifies Latin American & North American payment rails (PIX, OXXO, SPEI, Webpay, PSE, Diaspora Remittance)
          with a real-time, voice-enabled, auto-translating support dispatcher.
        </p>
      </div>

      {/* Sub-Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveSubTab('gateways')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'gateways'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Regional Payment Gateways (5 Countries)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('support_chat')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'support_chat'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>In-App Auto-Translating Chat & Voice Notes</span>
        </button>

        <button
          onClick={() => setActiveSubTab('diaspora_remittance')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'diaspora_remittance'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Diaspora Cross-Border Ride Remittance</span>
        </button>

        <button
          onClick={() => setActiveSubTab('emergency_sos')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'emergency_sos'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Emergency SOS & Incident Triage</span>
        </button>
      </div>

      {/* Sub-Tab 1: Regional Payment Gateways */}
      {activeSubTab === 'gateways' && (
        <div className="space-y-4">
          {/* Country Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {EXPANSION_GATEWAYS.map((g) => (
              <button
                key={g.country}
                onClick={() => setSelectedCountry(g.country)}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedCountry === g.country
                    ? 'bg-amber-400/10 border-amber-400 text-white shadow'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <div className="text-xl mb-1">{g.flag}</div>
                <div className="font-bold text-xs truncate text-white">{g.countryName.split(' ')[0]}</div>
                <div className="text-[10px] text-neutral-500 font-mono truncate">{g.currency}</div>
              </button>
            ))}
          </div>

          {/* Detailed Gateways for Selected Country */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <div>
                <span className="text-[11px] font-mono text-amber-400 font-bold uppercase">
                  Payment Rails Specification
                </span>
                <h2 className="text-lg font-black text-white mt-0.5">{countryData.countryName}</h2>
              </div>
              <span className="bg-neutral-800 text-neutral-300 px-3 py-1 rounded-full text-xs font-mono">
                Currency: {countryData.currency}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {countryData.localGateways.map((gw, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{gw.name}</span>
                      <span className="bg-amber-400/15 text-amber-300 text-[10px] px-2 py-0.5 rounded capitalize font-mono">
                        {gw.type.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-neutral-400 text-[11px] leading-relaxed">{gw.description}</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-900 space-y-1 text-[10px] font-mono">
                    <div className="text-emerald-400">Settlement: {gw.settlementTime}</div>
                    <div className="text-neutral-500 truncate" title={gw.integrationProtocol}>
                      Protocol: {gw.integrationProtocol}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PSP Abstraction Layer Info */}
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2 text-xs">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Unified PSP Abstraction Layer (Architecture Pattern)</span>
              </div>
              <p className="text-neutral-300 text-[11px] leading-relaxed">
                Wap utilizes a microservices-based Payment Orchestrator (<code className="text-amber-300">Wap-PayEngine</code>)
                that isolates frontend mobile clients from region-specific webhook signatures, QR string encoding, and currency conversion.
                Drivers and riders experience a unified checkout sheet regardless of whether paying via PIX in Brazil, MonCash in Haiti, or OXXO in Mexico.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: In-App Auto-Translating Chat & Voice Notes */}
      {activeSubTab === 'support_chat' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chat Instructions & Context */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-3 text-xs">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-amber-400" />
              <span>Multi-Channel Support Hub</span>
            </h2>
            <p className="text-neutral-300 text-[11px] leading-relaxed">
              In multicultural Caribbean borders (e.g. St. Laurent du Maroni & Albina), riders speak Sranan Tongo,
              drivers speak Kreyòl, and support agents speak French.
            </p>

            <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-2 text-[11px]">
              <div className="font-bold text-amber-400">Real-Time Translation Engine:</div>
              <div>• Seamless two-way audio & text translation.</div>
              <div>• Voice notes designed for drivers on motorcycles wearing helmets.</div>
              <div>• Offline queueing for intermittent cellular zones.</div>
            </div>

            <button
              onClick={handleSimulateVoiceNote}
              disabled={isRecordingVoice}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold p-2.5 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>{isRecordingVoice ? 'Sending Voice Note...' : 'Simulate Driver Voice Note'}</span>
            </button>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 text-xs min-h-[460px]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="font-bold text-white">Live In-Ride Channel #WP-8921</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                Real-Time Auto-Translation: Kreyòl ↔ Français
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {chatMessages.map((msg) => {
                const isCustomer = msg.senderRole === 'customer';
                const isDriver = msg.senderRole === 'driver';
                const isSupport = msg.senderRole === 'support_agent';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                      <span className="font-semibold text-neutral-300">{msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] p-3 rounded-2xl space-y-1 ${
                        isCustomer
                          ? 'bg-amber-400 text-neutral-950 font-medium rounded-tr-none'
                          : isSupport
                          ? 'bg-purple-950 text-purple-200 border border-purple-800 rounded-tl-none'
                          : 'bg-neutral-950 text-neutral-200 border border-neutral-800 rounded-tl-none'
                      }`}
                    >
                      <div className="text-xs">{msg.originalText}</div>
                      {msg.translatedText && (
                        <div
                          className={`text-[10px] pt-1 border-t ${
                            isCustomer
                              ? 'border-neutral-900/20 text-neutral-800 italic'
                              : 'border-neutral-800 text-neutral-400 italic'
                          }`}
                        >
                          {msg.translatedText}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-neutral-800">
              <input
                type="text"
                placeholder="Tapez votre message en Français ou Kreyòl..."
                value={newChatText}
                onChange={(e) => setNewChatText(e.target.value)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-amber-400 text-xs"
              />
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold px-4 py-2 rounded-xl transition shadow flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Diaspora Cross-Border Ride Remittance */}
      {activeSubTab === 'diaspora_remittance' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-amber-400" />
            <span>Diaspora Cross-Border Ride & Bundle Remittance Architecture</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="font-bold text-amber-400">1. Diaspora Senders (US / Canada / France)</div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Haitian, Guyanese, and Surinamese diaspora members in Miami, New York, Boston, Paris, or Montreal use credit cards
                or Apple Pay to purchase ride passes, grocery bundles, or pharmacy courier deliveries for family back home.
              </p>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="font-bold text-cyan-400">2. Real-Time Transparent FX Ledger</div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                USD/EUR payments are pegged and converted with transparent zero-hidden-fee exchange rates into recipient credits,
                preventing predatory traditional 10-15% remittance fees.
              </p>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="font-bold text-emerald-400">3. Direct SMS Dispatch to Relatives</div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                The grandmother or family member receives an SMS in Creole or English with a ride confirmation pin or prepaid voucher
                QR code ready to redeem instantly with any nearby Wap motorcycle driver.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Emergency SOS & Incident Triage */}
      {activeSubTab === 'emergency_sos' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>Emergency SOS Protocol & Offline Mesh Satellite Triage</span>
            </h2>
            <span className="bg-red-950 text-red-300 border border-red-800 px-2.5 py-0.5 rounded text-[10px] font-mono">
              Zero Latency Dispatch
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="font-bold text-red-400">Rapid Activation Mechanism</div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Pressing the SOS button for 3 seconds triggers an immediate silent beacon broadcast:
              </p>
              <div className="bg-neutral-900 p-3 rounded font-mono text-[11px] text-neutral-300 space-y-1">
                <div>• Automatic GPS tracking frequency increases to 1-second intervals</div>
                <div>• Covert 15-second audio snippet streamed to regional monitoring squad</div>
                <div>• Automated SMS broadcast to emergency contacts & motorcycle syndicate dispatch</div>
              </div>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="font-bold text-amber-400">Local Community Syndicate Dispatch Bridge</div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                In areas where official emergency response times are delayed, Wap alerts the 3 nearest vetted Tier-3 motorcycle drivers
                and syndicate station masters to respond immediately as civilian first-responders.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
