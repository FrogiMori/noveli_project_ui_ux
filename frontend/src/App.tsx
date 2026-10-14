import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar, TabType } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DiscoverView } from './views/DiscoverView';
import { ShelvesView } from './views/ShelvesView';
import { AnalyticsView } from './views/AnalyticsView';
import { ForumView } from './views/ForumView';
import { AIAdvisorView } from './views/AIAdvisorView';
import { BookDetailModal } from './components/BookDetailModal';
import { ReadingLogModal } from './components/ReadingLogModal';
import { AuthModal } from './components/AuthModal';
import { Book, ShelfType } from './types';
import { api } from './services/api';

function MainApp() {
  const [activeTab, setActiveTab] = useState<TabType>('discover');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [openLogModal, setOpenLogModal] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [userShelves, setUserShelves] = useState<Record<string, ShelfType>>({});

  const handleShelfChange = async (book: Book, type: ShelfType) => {
    try {
      await api.upsertShelf(book.id, type);
      setUserShelves((prev) => ({ ...prev, [book.id]: type }));
    } catch (err) {
      alert((err as Error).message || 'Không thể cập nhật kệ sách');
    }
  };

  const handleSearchBookFromAI = (query: string) => {
    setActiveTab('discover');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenLogModal={() => setOpenLogModal(true)}
        onOpenAuthModal={() => setOpenAuthModal(true)}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {activeTab === 'discover' && (
          <DiscoverView
            onSelectBook={(book) => setSelectedBook(book)}
            onOpenLogModal={() => setOpenLogModal(true)}
          />
        )}

        {activeTab === 'shelves' && (
          <ShelvesView
            onSelectBook={(book) => setSelectedBook(book)}
            onNavigateDiscover={() => setActiveTab('discover')}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView onOpenLogModal={() => setOpenLogModal(true)} />
        )}

        {activeTab === 'forum' && <ForumView />}

        {activeTab === 'ai' && (
          <AIAdvisorView onSearchBook={handleSearchBookFromAI} />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onShelfChange={handleShelfChange}
          currentShelfType={userShelves[selectedBook.id]}
        />
      )}

      {openLogModal && (
        <ReadingLogModal
          onClose={() => setOpenLogModal(false)}
        />
      )}

      {openAuthModal && (
        <AuthModal
          onClose={() => setOpenAuthModal(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
