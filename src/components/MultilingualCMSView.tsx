import React, { useState } from 'react';
import {
  Globe,
  Languages,
  Volume2,
  Database,
  Code2,
  CheckCircle,
  FileAudio,
  Sparkles,
  Server,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { CMS_LOCALES, SAMPLE_CMS_KEYS, CMS_DATABASE_SCHEMA_SQL } from '../data/extendedArchitectureData';
import { CMSLocale, CMSTranslationKey } from '../types/architecture';

export const MultilingualCMSView: React.FC = () => {
  const [selectedLocale, setSelectedLocale] = useState<string>('ht');
  const [selectedKey, setSelectedKey] = useState<CMSTranslationKey>(SAMPLE_CMS_KEYS[0]);
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'editor' | 'schema' | 'api' | 'strategy'>('editor');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleCopySchema = () => {
    navigator.clipboard.writeText(CMS_DATABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePlayVoice = (text: string) => {
    setIsPlayingAudio(true);
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = selectedLocale === 'fr' ? 'fr-FR' : selectedLocale === 'nl' ? 'nl-NL' : 'en-US';
        utterance.rate = 0.92;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } catch {
        setTimeout(() => setIsPlayingAudio(false), 2500);
      }
    } else {
      setTimeout(() => setIsPlayingAudio(false), 2500);
    }
  };

  const currentTranslation = selectedKey.translations[selectedLocale] || {
    text: '[Translation missing - falls back to French/English]',
    status: 'draft',
    updatedBy: 'System Fallback',
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Overview Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-1">
          <Languages className="w-5 h-5" />
          <span>LOCALIZATION & MULTILINGUAL CONTENT MANAGEMENT SYSTEM (CMS)</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white">
          Wap Multilingual CMS Architecture for Caribbean & South American Diaspora
        </h1>
        <p className="text-xs sm:text-sm text-neutral-300 mt-2 leading-relaxed">
          Engineered for Haitian Creole (<em className="text-amber-300 font-semibold not-italic">Kreyòl Ayisyen</em>),
          French, Dutch, English, and Sranan Tongo, with voice prompt generation for low-literacy users,
          dynamic edge CDN distribution, and fallback resolution chains.
        </p>
      </div>

      {/* Sub-Navigation Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
        <button
          onClick={() => setActiveSubTab('editor')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'editor'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Languages className="w-3.5 h-3.5" />
          <span>Interactive Translation & Voice Studio</span>
        </button>

        <button
          onClick={() => setActiveSubTab('schema')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'schema'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>PostgreSQL CMS Relational Schema</span>
        </button>

        <button
          onClick={() => setActiveSubTab('api')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'api'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Dynamic Delivery API & Edge Bundling</span>
        </button>

        <button
          onClick={() => setActiveSubTab('strategy')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
            activeSubTab === 'strategy'
              ? 'bg-amber-400 text-neutral-950 shadow'
              : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Language Detection & SIM Telemetry</span>
        </button>
      </div>

      {/* Sub-Tab 1: Interactive Translation & Voice Studio */}
      {activeSubTab === 'editor' && (
        <div className="space-y-4">
          {/* Locales Matrix */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h2 className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Supported Regional Locales & Completion Metrics</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {CMS_LOCALES.map((loc) => (
                <button
                  key={loc.code}
                  onClick={() => setSelectedLocale(loc.code)}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedLocale === loc.code
                      ? 'bg-amber-400/10 border-amber-400 text-white shadow'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-base mb-1">
                    <span>{loc.flag}</span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">{loc.completionPercentage}%</span>
                  </div>
                  <div className="font-bold text-xs truncate text-white">{loc.name}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{loc.nativeName}</div>
                  <div className="text-[9px] text-neutral-500 mt-1 font-mono">Fallback: {loc.fallbackLocale}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Key Selection & Editor Workstation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Key List */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl space-y-2">
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Translation Keys ({SAMPLE_CMS_KEYS.length})
              </div>
              <div className="space-y-1.5">
                {SAMPLE_CMS_KEYS.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => setSelectedKey(k)}
                    className={`w-full text-left p-2.5 rounded-xl border transition text-xs ${
                      selectedKey.id === k.id
                        ? 'bg-amber-400 text-neutral-950 font-bold border-amber-400'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] truncate">{k.keyName}</span>
                      {k.audioPromptRequired && <Volume2 className="w-3 h-3 shrink-0 ml-1" />}
                    </div>
                    <div className="text-[10px] opacity-80 truncate mt-0.5">{k.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Editor Detail View */}
            <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div>
                  <div className="text-xs text-neutral-400">Target Translation Key:</div>
                  <div className="text-sm font-mono font-bold text-amber-400">{selectedKey.keyName}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-neutral-800 text-neutral-300 text-[11px] px-2.5 py-1 rounded-full border border-neutral-700 font-mono">
                    Namespace: {selectedKey.namespace}
                  </span>
                  <span
                    className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                      currentTranslation.status === 'approved'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    Status: {currentTranslation.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Translation Display */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>
                    Localized String in <strong className="text-white">{CMS_LOCALES.find((l) => l.code === selectedLocale)?.name}</strong>:
                  </span>
                  <span className="text-[11px] text-neutral-500">Verified by: {currentTranslation.updatedBy}</span>
                </div>

                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-sm text-neutral-100 font-medium leading-relaxed">
                  "{currentTranslation.text}"
                </div>
              </div>

              {/* Voice Prompt & Literacy Support Player */}
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Native Audio Prompt (Literacy Accessibility)</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono">48kbps Opus / Pre-recorded</span>
                </div>

                <p className="text-xs text-neutral-400">
                  Essential for riders and motorcycle drivers who communicate orally in Kreyòl or Sranan Tongo and
                  cannot read long textual disclaimer paragraphs while operating two-wheelers.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePlayVoice(currentTranslation.text)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition shadow ${
                      isPlayingAudio
                        ? 'bg-amber-500 text-neutral-950 animate-pulse'
                        : 'bg-amber-400 hover:bg-amber-300 text-neutral-950'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>{isPlayingAudio ? 'Playing Audio Stream...' : 'Preview Voice Prompt'}</span>
                  </button>

                  <span className="text-[11px] text-neutral-500">
                    Auto-plays in Bluetooth helmet headsets on arrival
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 2: PostgreSQL Schema */}
      {activeSubTab === 'schema' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span>Multilingual CMS Database DDL (PostgreSQL 16)</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Normalizes translation keys, locale fallback parentage, audio prompt binary URLs, and transport glossaries.
              </p>
            </div>

            <button
              onClick={handleCopySchema}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium border border-neutral-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SQL' : 'Copy DDL'}</span>
            </button>
          </div>

          <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 overflow-x-auto max-h-[460px]">
            <pre className="text-xs font-mono text-emerald-300 leading-relaxed">
              <code>{CMS_DATABASE_SCHEMA_SQL.trim()}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Dynamic Delivery API */}
      {activeSubTab === 'api' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-amber-400" />
            <span>Dynamic Content Delivery API Specification (REST + CDN Edge)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="text-emerald-400 font-bold">GET /api/v1/cms/bundles/:locale</span>
                <span className="text-neutral-500">200 OK</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Fetches bundled namespace translations compiled into a compressed JSON object. Cached on Cloudflare CDN Edge
                with <code className="text-amber-300">Cache-Control: public, max-age=86400, stale-while-revalidate=3600</code>.
              </p>
              <div className="bg-neutral-900 p-2.5 rounded font-mono text-[11px] text-neutral-300">
                Headers: ETag: "w/cms-ht-v20260918-a89f"<br />
                Query Params: ?namespaces=rides,safety&version=2
              </div>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="text-emerald-400 font-bold">GET /api/v1/cms/delta-sync</span>
                <span className="text-neutral-500">200 OK</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Low-bandwidth delta synchronization for mobile clients on 2G connections. Sends only changed keys since client's
                last synced timestamp.
              </p>
              <div className="bg-neutral-900 p-2.5 rounded font-mono text-[11px] text-neutral-300">
                Headers: If-Modified-Since: 2026-09-10T00:00:00Z<br />
                Payload Size: &lt; 2.5 KB payload
              </div>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="text-amber-400 font-bold">POST /api/v1/cms/translations</span>
                <span className="text-neutral-500">Editor Auth</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Content editors submit new translation text or audio WAV/MP3 uploads. Triggers automatic cache invalidation
                on CDN edge points in Miami, San Juan, and Fortaleza.
              </p>
            </div>

            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
              <div className="flex items-center justify-between font-mono">
                <span className="text-cyan-400 font-bold">POST /api/v1/cms/ai-translate</span>
                <span className="text-neutral-500">Gemini 2.5 Flash</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Assists human linguists by generating culturally natural drafts for Haitian Creole and Sranan Tongo, preserving
                hyperlocal transportation terminology (e.g. avoiding literal French translations that confuse local riders).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Language Detection Strategy */}
      {activeSubTab === 'strategy' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>5-Stage Language Resolution & Telemetry Cascade</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1.5">
              <div className="font-bold text-amber-400">1. User Preference</div>
              <p className="text-neutral-400 text-[11px]">
                Explicit toggle selected in app header or profile. Stored permanently in SQLite / IndexedDB and synced to user profile.
              </p>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1.5">
              <div className="font-bold text-emerald-400">2. SIM MCC/MNC</div>
              <p className="text-neutral-400 text-[11px]">
                Reads SIM card carrier. MCC 372 (Digicel/Natcom Haiti) defaults to <strong className="text-white">Kreyòl</strong>; MCC 740 (French Guiana) to <strong className="text-white">Français</strong>.
              </p>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1.5">
              <div className="font-bold text-cyan-400">3. System Locale</div>
              <p className="text-neutral-400 text-[11px]">
                Inspects <code className="text-neutral-300">navigator.languages</code> and HTTP <code className="text-neutral-300">Accept-Language</code> headers.
              </p>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1.5">
              <div className="font-bold text-purple-400">4. GeoIP Polygon</div>
              <p className="text-neutral-400 text-[11px]">
                Reverse geocodes GPS coordinates or IP ingress node into regional territory bounding box.
              </p>
            </div>

            <div className="bg-neutral-950 p-3.5 rounded-xl border border-neutral-800 space-y-1.5">
              <div className="font-bold text-amber-300">5. Fallback Chain</div>
              <p className="text-neutral-400 text-[11px]">
                If a key is missing in Sranan Tongo, cascades to Dutch, then English. If missing in Kreyòl, cascades to French.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
