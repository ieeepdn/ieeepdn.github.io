export type Theme = 'light' | 'dark'
export const THEME_KEY = 'theme'

/**
 * Inline <head> script: applies the saved theme before first paint, so there is no flash. Without a saved choice it
 * uses the site default from Pages CMS → Theme & colours ('system' follows the visitor's device).
 */
export const themeScript = (fallback: 'system' | 'light' | 'dark' = 'system') =>
  `(function(){document.documentElement.setAttribute('data-theme-default','${fallback}');try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark'){t=${fallback === 'system' ? "matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'" : `'${fallback}'`}}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','${fallback === 'dark' ? 'dark' : 'light'}')}})()`
