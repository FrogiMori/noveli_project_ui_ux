import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, UserCheck, Key, Lock, Sparkles, LogOut } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { user, switchDemoUser, register, logout } = useAuth();
  const [mode, setMode] = useState<'switch' | 'register'>('switch');

  // Register state
  const [newBiDanh, setNewBiDanh] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const demoAccounts = [
    { biDanh: 'sach_va_tra', role: 'Độc giả yêu trà & triết học', streak: 7, avatarSeed: 'tea' },
    { biDanh: 'ke_ngao_du', role: 'Thích phiêu lưu & khoa học', streak: 12, avatarSeed: 'wanderer' },
    { biDanh: 'dem_muon_doc_sach', role: 'Cú đêm đọc tiểu thuyết cảm động', streak: 3, avatarSeed: 'owl' },
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBiDanh.trim() || !newPassword || submitting) return;

    setSubmitting(true);
    try {
      const recKey = await register(newBiDanh.trim(), newPassword);
      setRecoveryKey(recKey);
    } catch (err) {
      alert((err as Error).message || 'Đăng ký không thành công');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(5, 8, 15, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: 520,
          backgroundColor: 'var(--bg-surface)',
          padding: 26,
          borderRadius: 22,
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            padding: 8,
            borderRadius: 10,
            background: 'var(--bg-surface-elevated)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div
            style={{
              padding: 8,
              borderRadius: 10,
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--indigo-400)',
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Tài Khoản & Quyền Riêng Tư</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Không cần Email, không theo dõi IP — Hoàn toàn ẩn danh
            </p>
          </div>
        </div>

        {/* Current User Info */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 12,
              borderRadius: 12,
              background: 'var(--bg-surface-elevated)',
              marginBottom: 18,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, var(--amber-500), #e11d48)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 16,
                }}
              >
                {user.biDanh[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>@{user.biDanh}</div>
                <div style={{ fontSize: 12, color: 'var(--amber-400)' }}>
                  Chuỗi đọc: {user.currentStreak} ngày liên tiếp 🔥
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--rose-400)' }}
            >
              <LogOut size={14} /> Đăng xuất
            </button>
          </div>
        )}

        {/* Tabs: Switch Demo vs Register New */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          <button
            onClick={() => { setMode('switch'); setRecoveryKey(null); }}
            className={`btn btn-sm ${mode === 'switch' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            <UserCheck size={14} /> Chuyển tài khoản Demo
          </button>
          <button
            onClick={() => setMode('register')}
            className={`btn btn-sm ${mode === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
          >
            <Sparkles size={14} /> Tạo Bí Danh Mới
          </button>
        </div>

        {mode === 'switch' ? (
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Chọn tài khoản đã nạp sẵn dữ liệu sách, chuỗi streak và lịch sử đọc:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {demoAccounts.map((acc) => {
                const isCurrent = user?.biDanh === acc.biDanh;
                return (
                  <div
                    key={acc.biDanh}
                    onClick={() => switchDemoUser(acc.biDanh)}
                    style={{
                      padding: 12,
                      borderRadius: 12,
                      background: isCurrent ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-surface-elevated)',
                      border: isCurrent ? '1px solid var(--amber-500)' : '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: isCurrent ? 'var(--amber-400)' : 'var(--text-primary)' }}>
                        @{acc.biDanh} {isCurrent && '✓ (Đang dùng)'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{acc.role}</div>
                    </div>
                    <span className="badge badge-amber" style={{ fontSize: 11 }}>
                      🔥 {acc.streak} ngày streak
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            {recoveryKey ? (
              <div
                style={{
                  padding: 16,
                  borderRadius: 14,
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid var(--emerald-500)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--emerald-400)', fontWeight: 700, marginBottom: 8 }}>
                  <Key size={16} /> Đăng ký bí danh thành công!
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                  Vì hệ thống <strong>không lưu email hay số điện thoại</strong> của bạn, đây là mã khôi phục duy nhất để lấy lại mật khẩu:
                </p>
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: 'var(--bg-surface)',
                    fontFamily: 'monospace',
                    fontSize: 13,
                    color: 'var(--amber-400)',
                    wordBreak: 'break-all',
                    userSelect: 'all',
                  }}
                >
                  {recoveryKey}
                </div>
                <button
                  onClick={onClose}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}
                >
                  Đã lưu mã & Bắt đầu đọc sách
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                    Bí danh hiển thị (Pseudonym):
                  </label>
                  <input
                    type="text"
                    placeholder="ví dụ: doc_sach_dem, mọt_sach_99"
                    className="input-field"
                    value={newBiDanh}
                    onChange={(e) => setNewBiDanh(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                    Mật khẩu:
                  </label>
                  <input
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    className="input-field"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !newBiDanh || !newPassword}
                  className="btn btn-primary"
                  style={{ marginTop: 8, justifyContent: 'center' }}
                >
                  <Lock size={15} />
                  {submitting ? 'Đang tạo...' : 'Tạo tài khoản bảo mật'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
