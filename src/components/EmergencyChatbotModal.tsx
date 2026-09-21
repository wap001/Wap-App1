import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Send,
  ShieldAlert,
  PhoneCall,
  UserCheck,
  AlertTriangle,
  X,
  Bot,
  User,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { RegionId, LanguageCode } from '../types/architecture';
import { REGIONS } from '../data/mockData';

interface EmergencyChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'agent';
  senderName: string;
  text: string;
  timestamp: string;
  urgencyLevel?: 'routine' | 'urgent' | 'critical';
  quickActions?: { label: string; action: string }[];
}

interface EmergencyChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
  userName?: string;
  region?: RegionId;
  language?: LanguageCode;
  onTriggerSOSBeacon?: () => void;
}

export const EmergencyChatbotModal: React.FC<EmergencyChatbotModalProps> = ({
  isOpen,
  onClose,
  userRole = 'customer',
  userName = 'Valued User',
  region = 'haiti',
  language = 'en',
  onTriggerSOSBeacon
}) => {
  const currentRegion = REGIONS[region];
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<EmergencyChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      senderName: 'Wap Emergency AI Dispatcher',
      text: `Hello ${userName}. This is Wap's 24/7 Priority Emergency & Support Assistant for ${currentRegion.name}. Are you currently safe, or do you require immediate dispatch assistance?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      urgencyLevel: 'urgent',
      quickActions: [
        { label: '🚨 Passenger/Driver Assault', action: 'assault' },
        { label: '💰 Customer Refused Payment', action: 'non_payment' },
        { label: '📍 Accident or Road Breakdown', action: 'accident' },
        { label: '❓ General Trip Help', action: 'general' }
      ]
    }
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg: EmergencyChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      senderName: userName,
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setIsTyping(true);

    // AI Emergency Response Logic
    setTimeout(() => {
      let botResponse = '';
      let quickActs: { label: string; action: string }[] | undefined;
      const lower = textToSend.toLowerCase();

      if (lower.includes('assault') || lower.includes('hurt') || lower.includes('hit') || lower.includes('threat') || lower.includes('attack') || lower.includes('crime')) {
        botResponse = `⚠️ CRITICAL SAFETY ALERT: We are locking incident telemetry and alerting our 24/7 Security Ops. Under Wap's Zero-Tolerance Policy, the aggressor is subject to an IMMEDIATE LIFETIME PASSPORT BAN and local police filing. If you are in immediate danger, tap 'Activate SOS' below to stream live GPS to police and local fleet responders.`;
        quickActs = [
          { label: '🚨 Activate Instant SOS GPS Beacon', action: 'trigger_sos' },
          { label: '📞 Call Police Immediately', action: 'call_police' }
        ];
      } else if (lower.includes('pay') || lower.includes('refuse') || lower.includes('non_payment') || lower.includes('money') || lower.includes('cash')) {
        botResponse = `🛡️ CASH ESCROW GUARANTEE: If the customer ran away or refused to pay, DO NOT engage in physical confrontation. The platform covers 100% of your earnings immediately through our Escrow Guarantee Pool. The passenger's passport/ID is permanently blacklisted, and civil recovery proceedings are initiated. Your payout has been logged for instant reimbursement.`;
        quickActs = [
          { label: '✅ Claim Escrow Reimbursement', action: 'claim_escrow' },
          { label: '📋 File Formal Non-Payment Incident', action: 'file_police_report' }
        ];
      } else if (lower.includes('accident') || lower.includes('breakdown') || lower.includes('tire') || lower.includes('fall')) {
        botResponse = `🚨 ROADSIDE ASSISTANCE: Our operations center has tagged your approximate location in ${currentRegion.name}. Nearby registered fleet drivers and our local mobile mechanics are being alerted. Please confirm if any party needs an ambulance.`;
        quickActs = [
          { label: '🚑 Call Ambulance / Emergency EMS', action: 'call_ambulance' },
          { label: '🔧 Dispatch Wap Roadside Mechanic', action: 'dispatch_mechanic' }
        ];
      } else {
        botResponse = `Thank you for reaching out. We have logged your request: "${textToSend}". Our 24/7 Support Agent on duty is reviewing your case. How else can we assist your trip?`;
        quickActs = [
          { label: '📄 View Driver Legal Contract', action: 'view_contract' },
          { label: '💡 Learn About Liberté Cash (LBC)', action: 'liberte_cash' }
        ];
      }

      const botMsg: EmergencyChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        senderName: 'Wap Emergency AI Dispatcher',
        text: botResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        urgencyLevel: lower.includes('assault') ? 'critical' : 'urgent',
        quickActions: quickActs
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 900);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'trigger_sos') {
      if (onTriggerSOSBeacon) onTriggerSOSBeacon();
      onClose();
    } else if (action === 'call_police') {
      window.location.href = 'tel:114';
    } else if (action === 'call_ambulance') {
      window.location.href = 'tel:116';
    } else if (action === 'non_payment') {
      handleSendMessage('A customer took a trip and refused to pay the cash fare.');
    } else if (action === 'assault') {
      handleSendMessage('Urgent: An assault/battery or physical threat has occurred.');
    } else if (action === 'accident') {
      handleSendMessage('There has been an accident or vehicle breakdown on the road.');
    } else if (action === 'general') {
      handleSendMessage('I need support with my current trip and account.');
    } else if (action === 'claim_escrow') {
      handleSendMessage('Please credit my driver wallet under the Cash Escrow Non-Payment Guarantee.');
    } else {
      handleSendMessage(`Help with ${action}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-xl w-full h-[650px] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800/80 bg-neutral-950/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                <Bot className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-neutral-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Wap Emergency AI Assistant</h3>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">
                  Live 24/7
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Instant incident triage, non-payment protection &amp; distress coordination
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition cursor-pointer"
            title="Close Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-neutral-950/40 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-neutral-500">
                <span>{msg.senderName}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-amber-400 text-neutral-950 font-medium rounded-tr-sm shadow-md'
                    : msg.urgencyLevel === 'critical'
                    ? 'bg-red-950/70 border border-red-500/50 text-neutral-200 rounded-tl-sm shadow-lg'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-tl-sm shadow-md'
                }`}
              >
                <p className="whitespace-pre-line text-xs">{msg.text}</p>

                {/* Quick action buttons if provided */}
                {msg.quickActions && msg.quickActions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                    {msg.quickActions.map((qa, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuickAction(qa.action)}
                        className="px-2.5 py-1.5 rounded-lg bg-neutral-950/80 hover:bg-neutral-800 text-amber-300 border border-neutral-700 font-semibold text-[11px] transition cursor-pointer"
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-neutral-400 text-xs p-2">
              <Bot className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>Emergency Dispatcher is analyzing incident...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Field */}
        <div className="p-3 sm:p-4 border-t border-neutral-800 bg-neutral-950/90 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Describe your situation (e.g. non-payment, assault, accident)..."
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400 transition"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition shadow cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
