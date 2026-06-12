import { NavLink } from 'react-router-dom'
import { APP_META } from '../constants/mockData'
import { enabledTabs } from '../lib/featureFlags'

export function Navbar() {
  return (
    <div style={{
      position: 'fixed',
      top: 36,
      left: 0,
      right: 0,
      zIndex: 40,
      height: 48,
      background: 'var(--color-bg-base)',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      paddingInline: 14,
      gap: 0,
    }}>
      {/* Logo block */}
      <div style={{
        border: '1px solid var(--color-border-muted)',
        padding: '5px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        flexShrink: 0,
        marginRight: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.04em',
          }}>
            {APP_META.name}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            letterSpacing: '0.06em',
          }}>
            / {APP_META.subtitle}
          </span>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          letterSpacing: '0.06em',
          marginTop: 1,
        }}>
          {APP_META.version}
        </div>
      </div>

      {/* Tab nav — centered */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'flex',
          gap: 4,
          border: '1px solid var(--color-border)',
          padding: 3,
          borderRadius: 999,
        }}>
          {enabledTabs.map(tab => (
            <NavLink
              key={tab.id}
              to={tab.path}
              style={({ isActive }) => ({
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.09em',
                textDecoration: 'none',
                padding: '4px 16px',
                borderRadius: 999,
                color: isActive ? '#000' : 'var(--color-text-secondary)',
                background: isActive ? 'var(--color-amber)' : 'transparent',
                transition: 'color 0.15s, background 0.15s',
              })}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <button
          type="button"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.06em',
            color: 'var(--color-text-secondary)',
            background: 'transparent',
            border: '1px solid var(--color-border-muted)',
            borderRadius: 999,
            padding: '4px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-text-tertiary)'; e.currentTarget.style.color = 'var(--color-text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border-muted)'; e.currentTarget.style.color = 'var(--color-text-secondary)' }}
        >
          <span style={{ fontSize: 11, opacity: 0.7 }}>⌘K</span>
          <span>SEARCH</span>
        </button>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.06em',
          color: 'var(--color-text-tertiary)',
          border: '1px solid var(--color-border)',
          borderRadius: 999,
          padding: '4px 12px',
        }}>
          WORKSPACE: {APP_META.workspace}
        </div>
      </div>
    </div>
  )
}
