'use client'
import React, { useState, useRef, useEffect } from 'react';
import { User as UserIcon, Clock, Settings, CreditCard, LogOut, ChevronDown, Activity, Shield, Moon, Sun, Bell, HelpCircle, ExternalLink, X, FileText } from 'lucide-react';
import styles from './TopNav.module.css';
import { CompressionResult } from '@/lib/api';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface ChatTurn {
  originalText: string;
  result: CompressionResult;
}

interface TopNavProps {
  onReset?: () => void;
  chatHistory?: ChatTurn[];
  onSelectHistory?: (index: number) => void;
}

type SubPanel = 'history' | 'usage' | 'settings' | 'billing' | 'help' | null;

export default function TopNav({ onReset, chatHistory = [], onSelectHistory }: TopNavProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<SubPanel>(null);
  const [isDark, setIsDark] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ email?: string, name?: string } | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserData({
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
        });
      }
    }
    getUser();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current && !popupRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
        setActivePanel(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showToast) {
      const t = setTimeout(() => setShowToast(null), 2200);
      return () => clearTimeout(t);
    }
  }, [showToast]);

  const toast = (msg: string) => setShowToast(msg);

  const handleMenuClick = (panel: SubPanel) => {
    setActivePanel(activePanel === panel ? null : panel);
  };

  const handleLogout = async () => {
    setIsProfileOpen(false);
    setActivePanel(null);
    await supabase.auth.signOut();
    toast('Logged out successfully');
    onReset?.();
    router.push('/login');
  };

  const handleHistoryClick = (index: number) => {
    onSelectHistory?.(index);
    setIsProfileOpen(false);
    setActivePanel(null);
  };

  // Build history items from real chatHistory
  const historyItems = chatHistory.map((turn, i) => ({
    index: i,
    text: turn.originalText.slice(0, 40) + (turn.originalText.length > 40 ? '…' : ''),
    tokens: `${turn.result.raw_tokens.toLocaleString()} → ${turn.result.compressed_tokens.toLocaleString()}`,
    ratio: `${turn.result.compression_ratio}%`,
  }));

  return (
    <>
      <header className={styles.topNav}>
        {/* Left: Brand */}
        <div className={styles.brandPill} onClick={onReset} role="button" tabIndex={0}>
          <div className={styles.logoBox}>
            <img src="/logo/nucleus-white-bgr.png" alt="Nucleus Logo" className={styles.customLogo} />
          </div>
          <span className={styles.brandName} style={{ fontFamily: 'var(--font-codystar)' }}>NUCLEUS</span>
        </div>

        {/* Right: Profile */}
        <div className={styles.rightWrap}>
          <button
            ref={buttonRef}
            className={`${styles.profileBtn} ${isProfileOpen ? styles.profileBtnOpen : ''}`}
            onClick={() => { setIsProfileOpen(!isProfileOpen); setActivePanel(null); }}
          >
            <div className={styles.avatarCircle}>
              <UserIcon size={13} strokeWidth={2.5} />
            </div>
            <ChevronDown size={13} className={`${styles.chevron} ${isProfileOpen ? styles.chevronUp : ''}`} />
          </button>

          {isProfileOpen && (
            <div className={styles.popup} ref={popupRef}>
              {/* User card */}
              <div className={styles.userCard}>
                <div className={styles.userAvatar}>
                  <UserIcon size={18} strokeWidth={2} />
                </div>
                <div className={styles.userMeta}>
                  <span className={styles.userName}>{userData?.name || 'Guest User'}</span>
                  <span className={styles.userEmail}>{userData?.email || 'guest@nucleus.io'}</span>
                </div>
              </div>

              <div className={styles.sep} />

              {/* Menu */}
              <nav className={styles.menu}>
                <button className={`${styles.mi} ${activePanel === 'history' ? styles.miActive : ''}`} onClick={() => handleMenuClick('history')}>
                  <Clock size={15} strokeWidth={1.8} />
                  <span>History</span>
                  {chatHistory.length > 0 && <span className={styles.badge}>{chatHistory.length}</span>}
                </button>
                <button className={`${styles.mi} ${activePanel === 'usage' ? styles.miActive : ''}`} onClick={() => handleMenuClick('usage')}>
                  <Activity size={15} strokeWidth={1.8} />
                  <span>Usage</span>
                </button>
                <button className={`${styles.mi} ${activePanel === 'settings' ? styles.miActive : ''}`} onClick={() => handleMenuClick('settings')}>
                  <Settings size={15} strokeWidth={1.8} />
                  <span>Settings</span>
                </button>
                <button className={`${styles.mi} ${activePanel === 'billing' ? styles.miActive : ''}`} onClick={() => handleMenuClick('billing')}>
                  <CreditCard size={15} strokeWidth={1.8} />
                  <span>Billing</span>
                </button>
                <button className={`${styles.mi} ${activePanel === 'help' ? styles.miActive : ''}`} onClick={() => handleMenuClick('help')}>
                  <HelpCircle size={15} strokeWidth={1.8} />
                  <span>Help</span>
                </button>
              </nav>

              <div className={styles.sep} />

              <nav className={styles.menu}>
                <button className={`${styles.mi} ${styles.miDanger}`} onClick={handleLogout}>
                  <LogOut size={15} strokeWidth={1.8} />
                  <span>Log out</span>
                </button>
              </nav>

              {/* Sub-panels */}
              {activePanel === 'history' && (
                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <span>Recent</span>
                    <button className={styles.panelClose} onClick={() => setActivePanel(null)}><X size={13} /></button>
                  </div>
                  {historyItems.length === 0 ? (
                    <div className={styles.emptyState}>No compressions yet</div>
                  ) : (
                    historyItems.map(h => (
                      <div key={h.index} className={styles.historyRow} onClick={() => handleHistoryClick(h.index)}>
                        <FileText size={13} strokeWidth={1.8} />
                        <div className={styles.historyCol}>
                          <span className={styles.historyName}>{h.text}</span>
                          <span className={styles.historyDetail}>{h.tokens} · {h.ratio}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activePanel === 'usage' && (
                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <span>Usage</span>
                    <button className={styles.panelClose} onClick={() => setActivePanel(null)}><X size={13} /></button>
                  </div>
                  <div className={styles.usageRow}>
                    <span>API Calls</span>
                    <span>12 / 100</span>
                  </div>
                  <div className={styles.bar}><div className={styles.barFill} style={{ width: '12%' }} /></div>
                  <div className={styles.usageRow}>
                    <span>Tokens</span>
                    <span>8.2K / 50K</span>
                  </div>
                  <div className={styles.bar}><div className={styles.barFill} style={{ width: '16%' }} /></div>
                  <div className={styles.usageRow}>
                    <span>Saved</span>
                    <span className={styles.usageHighlight}>$0.0047</span>
                  </div>
                </div>
              )}

              {activePanel === 'settings' && (
                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <span>Settings</span>
                    <button className={styles.panelClose} onClick={() => setActivePanel(null)}><X size={13} /></button>
                  </div>
                  <div className={styles.settingRow}>
                    <span>{isDark ? <Moon size={14} strokeWidth={1.8} /> : <Sun size={14} strokeWidth={1.8} />} Dark Mode</span>
                    <button className={`${styles.toggle} ${isDark ? styles.toggleOn : ''}`} onClick={() => { setIsDark(!isDark); toast(isDark ? 'Light mode' : 'Dark mode'); }}>
                      <div className={styles.knob} />
                    </button>
                  </div>
                  <div className={styles.settingRow}>
                    <span><Bell size={14} strokeWidth={1.8} /> Notifications</span>
                    <button className={`${styles.toggle} ${notifications ? styles.toggleOn : ''}`} onClick={() => { setNotifications(!notifications); toast(notifications ? 'Notifications off' : 'Notifications on'); }}>
                      <div className={styles.knob} />
                    </button>
                  </div>
                  <div className={styles.settingRow}>
                    <span><Shield size={14} strokeWidth={1.8} /> PII Redaction</span>
                    <button className={`${styles.toggle} ${styles.toggleOn}`}>
                      <div className={styles.knob} />
                    </button>
                  </div>
                </div>
              )}

              {activePanel === 'billing' && (
                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <span>Billing</span>
                    <button className={styles.panelClose} onClick={() => setActivePanel(null)}><X size={13} /></button>
                  </div>
                  <div className={styles.planCard}>
                    <div className={styles.planRow}>
                      <span className={styles.planLabel}>Free Plan</span>
                      <span className={styles.planPrice}>$0<small>/mo</small></span>
                    </div>
                    <div className={styles.planFeatures}>
                      <span>✓ 100 calls/day</span>
                      <span>✓ 50K tokens/day</span>
                      <span>✓ Basic compression</span>
                    </div>
                    <button className={styles.upgradeBtn} onClick={() => toast('Upgrade coming soon')}>
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              )}

              {activePanel === 'help' && (
                <div className={styles.panel}>
                  <div className={styles.panelHead}>
                    <span>Help</span>
                    <button className={styles.panelClose} onClick={() => setActivePanel(null)}><X size={13} /></button>
                  </div>
                  <button className={styles.helpRow} onClick={() => toast('Opening docs...')}>
                    <FileText size={13} strokeWidth={1.8} />
                    <span>Documentation</span>
                    <ExternalLink size={11} />
                  </button>
                  <button className={styles.helpRow} onClick={() => toast('Opening support...')}>
                    <HelpCircle size={13} strokeWidth={1.8} />
                    <span>Contact Support</span>
                    <ExternalLink size={11} />
                  </button>
                  <div className={styles.versionText}>Nucleus v1.0.0</div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {showToast && (
        <div className={styles.toast}>{showToast}</div>
      )}
    </>
  );
}
