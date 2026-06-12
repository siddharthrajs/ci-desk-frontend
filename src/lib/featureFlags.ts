import { NAV_TABS } from '../constants/mockData'

export function isTabEnabled(envKey: string): boolean {
  return (import.meta.env as Record<string, string>)[envKey] === 'true'
}

export const enabledTabs = NAV_TABS.filter(tab => isTabEnabled(tab.envKey))
