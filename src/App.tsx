import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { LegalModal } from './components/LegalModal';
import { HomeView } from './views/HomeView';
import { ChannelDetailsView } from './views/ChannelDetailsView';
import { OrderDetailsView } from './views/OrderDetailsView';
import { SellerDashboardView } from './views/SellerDashboardView';
import { BuyerDashboardView } from './views/BuyerDashboardView';
import { AdminDashboardView } from './views/AdminDashboardView';

function MainApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'channel-details' | 'order-details' | 'seller-dashboard' | 'buyer-dashboard' | 'admin-dashboard'>('home');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [sellerDashboardTab, setSellerDashboardTab] = useState<'listings' | 'create' | 'sales'>('listings');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  // Legal Modal State
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalInitialTab, setLegalInitialTab] = useState<'tos' | 'privacy' | 'refund' | 'safety'>('tos');

  const handleOpenLegal = (tab: 'tos' | 'privacy' | 'refund' | 'safety') => {
    setLegalInitialTab(tab);
    setLegalModalOpen(true);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    if (currentView !== 'home') {
      setCurrentView('home');
      setSelectedChannelId(null);
      setSelectedOrderId(null);
    }
  };

  const handleSelectPlatform = (platform: string) => {
    setSelectedPlatform(platform);
    if (currentView !== 'home') {
      setCurrentView('home');
      setSelectedChannelId(null);
      setSelectedOrderId(null);
    }
  };

  const handleNavigate = (view: string, params?: any) => {
    if (view === 'home') {
      setSelectedChannelId(null);
      setSelectedOrderId(null);
      setCurrentView('home');
    } else if (view === 'channel-details' && params?.id) {
      setSelectedChannelId(params.id);
      setCurrentView('channel-details');
    } else if (view === 'order-details' && params?.id) {
      setSelectedOrderId(params.id);
      setCurrentView('order-details');
    } else if (view === 'seller-dashboard') {
      if (params?.tab) setSellerDashboardTab(params.tab);
      setCurrentView('seller-dashboard');
    } else if (view === 'buyer-dashboard') {
      setCurrentView('buyer-dashboard');
    } else if (view === 'admin-dashboard') {
      setCurrentView('admin-dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-red-600 selection:text-white w-full max-w-full overflow-x-hidden">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenLegal={handleOpenLegal}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedPlatform={selectedPlatform}
        onSelectPlatform={handleSelectPlatform}
      />

      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onSelectChannel={(id) => handleNavigate('channel-details', { id })}
            onNavigate={handleNavigate}
            onOpenLegal={handleOpenLegal}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={handleSelectPlatform}
          />
        )}

        {currentView === 'channel-details' && selectedChannelId && (
          <ChannelDetailsView
            channelId={selectedChannelId}
            onBack={() => handleNavigate('home')}
            onOrderCreated={(orderId) => handleNavigate('order-details', { id: orderId })}
            onOpenLegal={handleOpenLegal}
          />
        )}

        {currentView === 'order-details' && selectedOrderId && (
          <OrderDetailsView
            orderId={selectedOrderId}
            onBack={() => handleNavigate('buyer-dashboard')}
            onOpenLegal={handleOpenLegal}
          />
        )}

        {currentView === 'seller-dashboard' && (
          <SellerDashboardView
            initialTab={sellerDashboardTab}
            onSelectOrder={(orderId) => handleNavigate('order-details', { id: orderId })}
            onSelectChannel={(channelId) => handleNavigate('channel-details', { id: channelId })}
            onOpenLegal={handleOpenLegal}
          />
        )}

        {currentView === 'buyer-dashboard' && (
          <BuyerDashboardView
            onSelectOrder={(orderId) => handleNavigate('order-details', { id: orderId })}
            onBrowseChannels={() => handleNavigate('home')}
            onOpenLegal={handleOpenLegal}
          />
        )}

        {currentView === 'admin-dashboard' && (
          user?.email?.toLowerCase() === 'alifsheenshopping@gmail.com' ? (
            <AdminDashboardView
              onSelectOrder={(orderId) => handleNavigate('order-details', { id: orderId })}
              onSelectChannel={(channelId) => handleNavigate('channel-details', { id: channelId })}
            />
          ) : (
            <div className="max-w-lg mx-auto my-20 p-8 bg-white border border-rose-200 rounded-3xl shadow-2xl text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-3xl font-black shadow-inner">
                🔒
              </div>
              <h3 className="text-xl font-black text-slate-900">
                অননুমোদিত প্রবেশাধিকার (Access Denied)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                অ্যাডমিন প্যানেল শুধুমাত্র অফিশিয়াল সুপার এডমিন <span className="font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">alifsheenshopping@gmail.com</span> এর জন্য সংরক্ষিত। অন্য কোনো জিমেইল বা অ্যাকাউন্ট দিয়ে অ্যাডমিন এক্সেস গ্রহণযোগ্য নয়।
              </p>
              <button
                onClick={() => handleNavigate('home')}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md transition"
              >
                হোম পেজে ফিরে যান
              </button>
            </div>
          )
        )}
      </main>

      <Footer onOpenLegal={handleOpenLegal} onNavigate={handleNavigate} />

      {/* Global Modals */}
      <AuthModal onLoginSuccess={(targetView) => handleNavigate(targetView)} />
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalInitialTab}
      />
    </div>
  );
}

export default function App() {
  return (
    <CurrencyProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </CurrencyProvider>
  );
}
