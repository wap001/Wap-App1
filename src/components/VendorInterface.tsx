import React, { useState } from 'react';
import {
  Store,
  Bike,
  Clock,
  Plus,
  CheckCircle,
  Package,
  DollarSign,
  MapPin,
  Phone,
  AlertCircle
} from 'lucide-react';
import { RegionId, LanguageCode, VendorProfile } from '../types/architecture';
import { REGIONS, MOCK_VENDORS } from '../data/mockData';
import { translations } from '../data/translations';

interface VendorInterfaceProps {
  region: RegionId;
  language: LanguageCode;
  onPlaySpeech: (text: string) => void;
}

export const VendorInterface: React.FC<VendorInterfaceProps> = ({
  region,
  language,
  onPlaySpeech,
}) => {
  const t = translations[language] || translations.en;
  const currentRegion = REGIONS[region];
  const vendor = MOCK_VENDORS.find((v) => v.region === region) || MOCK_VENDORS[0];

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'dispatch'>('orders');
  const [items, setItems] = useState(vendor.menuItems);
  const [dispatchedOrder, setDispatchedOrder] = useState(false);

  const toggleItemAvailability = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item))
    );
  };

  const handleDispatchMoto = () => {
    setDispatchedOrder(true);
    onPlaySpeech(
      language === 'ht'
        ? 'Motosiklis Wap la an wout pou vin pran kòmand la nan boutik la.'
        : 'Coursier moto Wap en route vers votre commerce pour le retrait.'
    );
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 shadow-xl max-w-2xl mx-auto">
      {/* Vendor Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{vendor.name}</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-semibold">
                Verifié Wap
              </span>
            </h2>
            <div className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
              <span className="truncate max-w-[280px]">{vendor.addressLandmark}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[11px] text-neutral-400">{t.dailyRevenue}</div>
          <div className="text-base font-bold text-amber-400">
            8,450 {currentRegion.currency}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-950 rounded-xl mb-4 border border-neutral-800">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'orders' ? 'bg-amber-400 text-neutral-950 shadow' : 'text-neutral-400 hover:text-white'
          }`}
        >
          {t.openOrders} (2)
        </button>
        <button
          onClick={() => setActiveTab('menu')}
          className={`py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'menu' ? 'bg-amber-400 text-neutral-950 shadow' : 'text-neutral-400 hover:text-white'
          }`}
        >
          {t.menuInventory}
        </button>
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`py-2 text-xs font-semibold rounded-lg transition ${
            activeTab === 'dispatch' ? 'bg-amber-400 text-neutral-950 shadow' : 'text-neutral-400 hover:text-white'
          }`}
        >
          {t.dispatchMoto}
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-3">
          <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Kòmand #WAP-ORD-402</span>
              <span className="bg-amber-400/20 text-amber-300 font-mono px-2 py-0.5 rounded text-[11px]">
                {dispatchedOrder ? 'Chofè Moto Sou Wout' : t.preparingOrder}
              </span>
            </div>

            <div className="text-xs text-neutral-300 space-y-1 bg-neutral-900 p-3 rounded-lg border border-neutral-800/80">
              <div className="flex justify-between">
                <span>1x {items[0]?.name || 'Plat Griyo ak Bannann'}</span>
                <span className="font-bold text-white">450 {currentRegion.currency}</span>
              </div>
              <div className="flex justify-between">
                <span>1x {items[2]?.name || 'Ji Kowosòl Fre'}</span>
                <span className="font-bold text-white">150 {currentRegion.currency}</span>
              </div>
              <div className="text-[11px] text-neutral-400 pt-1">
                Kliyan: Jean Marc (Livrezon nan Delmas 75)
              </div>
            </div>

            {!dispatchedOrder ? (
              <button
                onClick={handleDispatchMoto}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg text-xs transition shadow flex items-center justify-center gap-2"
              >
                <Bike className="w-4 h-4" />
                <span>Kòmand lan pare: {t.dispatchMoto}</span>
              </button>
            ) : (
              <div className="bg-emerald-950/40 border border-emerald-800/70 rounded-lg p-2.5 text-xs text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Motosiklis Jean-Baptiste Voltaire rive nan 4 minit</span>
                </div>
                <span className="font-mono font-bold">MC-89421-HT</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Menu / Inventory Tab */}
      {activeTab === 'menu' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <span>Pwodwi ak Pri nan Boutik la</span>
            <span className="text-amber-400">Total: {items.length} pwodwi</span>
          </div>

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{item.name}</div>
                  <div className="text-neutral-400 text-[11px]">{item.description}</div>
                  <div className="text-amber-400 font-bold mt-1">
                    {item.price} {currentRegion.currency}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleItemAvailability(item.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                      item.isAvailable
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : 'bg-red-950 text-red-300 border-red-800'
                    }`}
                  >
                    {item.isAvailable ? 'Disponib' : 'Fini (Epuisé)'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dispatch On-Demand Moto Tab */}
      {activeTab === 'dispatch' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3 text-xs">
          <div className="font-bold text-white flex items-center gap-2">
            <Bike className="w-4 h-4 text-amber-400" />
            <span>Kourye Moto Sou Kòmand pou Kliyan Deyò</span>
          </div>
          <p className="text-neutral-400 text-[11px]">
            Ou ka voye pakè, pyès detache, oswa medikaman bay kliyan ki kòmande sou WhatsApp oswa telefòn san pase nan aplikasyon an.
          </p>

          <div className="space-y-2 pt-2">
            <input
              type="text"
              placeholder="Non kliyan an ak Nimewo Telefòn..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
            <input
              type="text"
              placeholder="Kote pou livre pakè a (Repè / Landmark)..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleDispatchMoto}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-bold rounded-lg text-xs transition mt-2 shadow"
            >
              🚀 Mande Motosiklis Wap Pou Vin Pran Pakè a
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
