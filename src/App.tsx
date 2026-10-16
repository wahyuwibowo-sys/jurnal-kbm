import React, { useState, useEffect } from 'react';
import { GuruUser, JurnalEntry } from './types';
import { storageService } from './services/storageService';
import { Navbar } from './components/Navbar';
import { BottomNav, NavTab } from './components/BottomNav';
import { LoginView } from './components/LoginView';
import { HomeView } from './components/HomeView';
import { JurnalForm } from './components/JurnalForm';
import { RiwayatView } from './components/RiwayatView';
import { DashboardView } from './components/DashboardView';
import { ProfileView } from './components/ProfileView';
import { GasCodeModal } from './components/GasCodeModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<GuruUser | null>(() => storageService.getCurrentUser());
  const [currentTab, setCurrentTab] = useState<NavTab>('beranda');
  const [entries, setEntries] = useState<JurnalEntry[]>(() => storageService.getJurnalEntries());
  const [isGasModalOpen, setIsGasModalOpen] = useState(false);

  const refreshEntries = () => {
    setEntries(storageService.getJurnalEntries());
  };

  const handleLoginSuccess = (user: GuruUser) => {
    setCurrentUser(user);
    setCurrentTab('beranda');
    refreshEntries();
  };

  const handleLogout = () => {
    storageService.setCurrentUser(null);
    setCurrentUser(null);
  };

  const handleSuccessSave = () => {
    refreshEntries();
    setCurrentTab('riwayat');
  };

  const handleSwitchUser = (user: GuruUser) => {
    storageService.setCurrentUser(user);
    setCurrentUser(user);
  };

  // If user is not logged in, render the Login View
  if (!currentUser) {
    return (
      <>
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onOpenGasGuide={() => setIsGasModalOpen(true)}
        />
        <GasCodeModal
          isOpen={isGasModalOpen}
          onClose={() => setIsGasModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800">
      {/* Top Header Navbar */}
      <Navbar
        currentUser={currentUser}
        onOpenGasModal={() => setIsGasModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-3xl mx-auto">
        {currentTab === 'beranda' && (
          <HomeView
            currentUser={currentUser}
            onGoToIsiJurnal={() => setCurrentTab('isi-jurnal')}
            onGoToRiwayat={() => setCurrentTab('riwayat')}
            onGoToDashboard={() => setCurrentTab('dashboard')}
            recentEntries={entries}
          />
        )}

        {currentTab === 'isi-jurnal' && (
          <JurnalForm
            currentUser={currentUser}
            onSuccessSave={handleSuccessSave}
          />
        )}

        {currentTab === 'riwayat' && (
          <RiwayatView
            currentUser={currentUser}
            entries={entries}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
          />
        )}

        {currentTab === 'profil' && (
          <ProfileView
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            onOpenGasModal={() => setIsGasModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Navigation for HP Android */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        userRole={currentUser.role}
      />

      {/* Google Apps Script Modal */}
      <GasCodeModal
        isOpen={isGasModalOpen}
        onClose={() => setIsGasModalOpen(false)}
      />
    </div>
  );
}
