import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, ShieldCheck, UserCheck, Key, Lock, Sparkles, LogOut, LogIn, KeyRound, Check, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

type TabMode = 'login' | 'register' | 'recover' | 'switch';

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { user, login, register, switchDemoUser, logout, logoutAll, changePassword, recoverPassword } = useAuth();
  const [mode, setMode] = useState<TabMode>(user ? 'switch' : 'login');

  // Login form state
  const [loginBiDanh, setLoginBiDanh] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regBiDanh, setRegBiDanh] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [recoveryKey, setRecoveryKey] = useState<string | null>(null);

  // Recovery form state
  const [recBiDanh, setRecBiDanh] = useState('');
  const [recKeyInput, setRecKeyInput] = useState('');
  const [recNewPassword, setRecNewPassword] = useState('');

  // Change password state (for logged-in user)
  const [showChangePass, setShowChangePass] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');

  // Status/feedback
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const demoAccounts = [
    { biDanh: 'sach_va_tra', role: 'Độc giả yêu trà & triết học', streak: 7, avatarSeed: 'tea' },
    { biDanh: 'ke_ngao_du', role: 'Thích phiêu lưu & khoa học', streak: 12, avatarSeed: 'wanderer' },
    { biDanh: 'dem_muon_doc_sach', role: 'Cú đêm đọc tiểu thuyết cảm động', streak: 3, avatarSeed: 'owl' },
  ];

  const clearFeedback = () => {
    setError(null);
    setSuccessMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    if (!loginBiDanh.trim() || !loginPassword) return;

    setSubmitting(true);
    try {
      await login(loginBiDanh.trim(), loginPassword);
      setSuccessMsg('Đăng nhập thành công!');
      setTimeout(() => onClose(), 600);
    } catch (err) {
      setError((err as Error).message || 'Sai bí danh hoặc mật khẩu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    if (!regBiDanh.trim() || !regPassword) return;

    if (regPassword.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Mật khẩu nhập lại không khớp');
      return;
    }

    setSubmitting(true);
    try {
      const recKey = await register(regBiDanh.trim(), regPassword);
      setRecoveryKey(recKey);
    } catch (err) {
      setError((err as Error).message || 'Đăng ký không thành công');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    if (!recBiDanh.trim() || !recKeyInput.trim() || !recNewPassword) return;

    if (recNewPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }

    setSubmitting(true);
    try {
      await recoverPassword(recBiDanh.trim(), recKeyInput.trim(), recNewPassword);
      setSuccessMsg('Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.');
      setMode('login');
      setLoginBiDanh(recBiDanh.trim());
      setLoginPassword('');
    } catch (err) {
      setError((err as Error).message || 'Mã khôi phục hoặc bí danh không đúng');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();
    if (!currentPass || !newPass) return;

    if (newPass.length < 8) {
      setError('Mật khẩu mới phải từ 8 ký tự trở lên');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(currentPass, newPass);
      setSuccessMsg('Đổi mật khẩu thành công!');
      setShowChangePass(false);
      setCurrentPass('');
      setNewPass('');
    } catch (err) {
      setError((err as Error).message || 'Đổi mật khẩu thất bại');
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
          maxWidth: 540,
          maxHeight: '90vh',
          overflowY: 'auto',
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
            border: 'none',
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
            <ShieldCheck size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800 }}>Tài Khoản & Quyền Riêng Tư</h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Không email, không số điện thoại, không thu thập địa chỉ IP
            </p>
          </div>
        </div>

        {/* Error / Success Feedback */}
        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--rose-500)',
              color: 'var(--rose-400)',
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 14px',
              borderRadius: 10,
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid var(--emerald-500)',
              color: 'var(--emerald-400)',
              fontSize: 13,
              marginBottom: 14,
            }}
          >
            <Check size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Current User Info Card */}
        {user && (
          <div
            style={{
              padding: 14,
              borderRadius: 14,
              background: 'var(--bg-surface-elevated)',
              marginBottom: 18,
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--amber-500), #e11d48)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 18,
                  }}
                >
                  {user.biDanh[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>@{user.biDanh}</div>
                  <div style={{ fontSize: 12, color: 'var(--amber-400)' }}>
                    Chuỗi đọc: {user.currentStreak} ngày liên tiếp 🔥
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setShowChangePass(!showChangePass)}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 12 }}
                  title="Đổi mật khẩu"
                >
                  <KeyRound size={13} /> Đổi pass
                </button>
                <button
                  onClick={logout}
                  className="btn btn-ghost btn-sm"
                  style={{ color: 'var(--rose-400)', fontSize: 12 }}
                  title="Đăng xuất thiết bị này"
                >
                  <LogOut size={13} /> Thoát
                </button>
              </div>
            </div>

            {/* Logout all sessions option */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={logoutAll}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: 11, color: 'var(--text-muted)' }}
              >
                Đăng xuất khỏi tất cả thiết bị
              </button>
            </div>

            {/* Change password sub-form */}
            {showChangePass && (
              <form onSubmit={handleChangePassword} style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input
                  type="password"
                  placeholder="Mật khẩu hiện tại"
                  className="input-field"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Mật khẩu mới (tối thiểu 8 ký tự)"
                  className="input-field"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="submit" disabled={submitting} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    {submitting ? 'Đang lưu...' : 'Xác nhận đổi'}
                  </button>
                  <button type="button" onClick={() => setShowChangePass(false)} className="btn btn-secondary btn-sm">
                    Hủy
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 18, background: 'var(--bg-surface-elevated)', padding: 4, borderRadius: 12 }}>
          <button
            onClick={() => { setMode('login'); clearFeedback(); }}
            className={`btn btn-sm ${mode === 'login' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
          >
            <LogIn size={13} /> Đăng nhập
          </button>
          <button
            onClick={() => { setMode('register'); clearFeedback(); }}
            className={`btn btn-sm ${mode === 'register' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
          >
            <Sparkles size={13} /> Đăng ký
          </button>
          <button
            onClick={() => { setMode('recover'); clearFeedback(); }}
            className={`btn btn-sm ${mode === 'recover' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
          >
            <KeyRound size={13} /> Khôi phục
          </button>
          <button
            onClick={() => { setMode('switch'); clearFeedback(); }}
            className={`btn btn-sm ${mode === 'switch' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}
          >
            <UserCheck size={13} /> Demo
          </button>
        </div>

        {/* ── Mode 1: Login ── */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                Bí danh (Username):
              </label>
              <input
                type="text"
                placeholder="ví dụ: sach_va_tra"
                className="input-field"
                value={loginBiDanh}
                onChange={(e) => setLoginBiDanh(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Mật khẩu:
                </label>
                <button
                  type="button"
                  onClick={() => { setMode('recover'); clearFeedback(); }}
                  style={{ background: 'none', border: 'none', color: 'var(--amber-400)', fontSize: 11, cursor: 'pointer', padding: 0 }}
                >
                  Quên mật khẩu?
                </button>
              </div>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                className="input-field"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !loginBiDanh.trim() || !loginPassword}
              className="btn btn-primary"
              style={{ marginTop: 8, justifyContent: 'center' }}
            >
              <LogIn size={15} />
              {submitting ? 'Đang đăng nhập...' : 'Đăng nhập vào Bookaholic'}
            </button>
          </form>
        )}

        {/* ── Mode 2: Register ── */}
        {mode === 'register' && (
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
                  Vì hệ thống <strong>không lưu email hay số điện thoại</strong> của bạn, đây là mã khôi phục bí mật (160-bit) duy nhất để lấy lại tài khoản nếu bạn quên mật khẩu:
                </p>
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'var(--bg-surface)',
                    fontFamily: 'monospace',
                    fontSize: 13,
                    color: 'var(--amber-400)',
                    wordBreak: 'break-all',
                    userSelect: 'all',
                    border: '1px dashed var(--amber-500)',
                    marginBottom: 10,
                  }}
                >
                  {recoveryKey}
                </div>
                <p style={{ fontSize: 11, color: 'var(--rose-400)', fontStyle: 'italic', marginBottom: 14 }}>
                  ⚠️ Hãy sao chép và lưu trữ mã này ở nơi an toàn. Bạn sẽ không thể xem lại mã này sau khi đóng bảng!
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(recoveryKey);
                    onClose();
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Sao chép mã & Bắt đầu đọc sách
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                    Bí danh hiển thị (3 - 30 ký tự):
                  </label>
                  <input
                    type="text"
                    placeholder="ví dụ: doc_sach_dem, mot_sach_99"
                    className="input-field"
                    value={regBiDanh}
                    onChange={(e) => setRegBiDanh(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                    Mật khẩu (Tối thiểu 8 ký tự):
                  </label>
                  <input
                    type="password"
                    placeholder="Tối thiểu 8 ký tự"
                    className="input-field"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                    Xác nhận mật khẩu:
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu"
                    className="input-field"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !regBiDanh || !regPassword}
                  className="btn btn-primary"
                  style={{ marginTop: 8, justifyContent: 'center' }}
                >
                  <Lock size={15} />
                  {submitting ? 'Đang tạo bí danh...' : 'Tạo tài khoản bảo mật'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Mode 3: Password Recovery ── */}
        {mode === 'recover' && (
          <form onSubmit={handleRecover} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Nhập bí danh và mã khôi phục định dạng <code>BKHL-XXXXXXXX-...</code> để đặt mật khẩu mới:
            </p>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                Bí danh của bạn:
              </label>
              <input
                type="text"
                placeholder="Nhập bí danh đã đăng ký"
                className="input-field"
                value={recBiDanh}
                onChange={(e) => setRecBiDanh(e.target.value)}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                Mã khôi phục (Recovery Key):
              </label>
              <input
                type="text"
                placeholder="BKHL-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX"
                className="input-field"
                value={recKeyInput}
                onChange={(e) => setRecKeyInput(e.target.value.trim())}
                style={{ fontFamily: 'monospace', fontSize: 12 }}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>
                Mật khẩu mới (Tối thiểu 8 ký tự):
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                className="input-field"
                value={recNewPassword}
                onChange={(e) => setRecNewPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting || !recBiDanh || !recKeyInput || !recNewPassword}
              className="btn btn-primary"
              style={{ marginTop: 8, justifyContent: 'center' }}
            >
              <KeyRound size={15} />
              {submitting ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
            </button>
          </form>
        )}

        {/* ── Mode 4: Demo accounts ── */}
        {mode === 'switch' && (
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>
              Chọn tài khoản trải nghiệm đã nạp sẵn tủ sách, chuỗi streak và lịch sử đọc:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {demoAccounts.map((acc) => {
                const isCurrent = user?.biDanh === acc.biDanh;
                return (
                  <div
                    key={acc.biDanh}
                    onClick={() => {
                      switchDemoUser(acc.biDanh);
                      onClose();
                    }}
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
        )}
      </div>
    </div>
  );
};
