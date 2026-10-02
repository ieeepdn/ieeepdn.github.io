export type Theme = 'light' | 'dark'
export const THEME_KEY = 'theme'

/** Inline <head> script: applies the saved (or OS) theme before first paint, so there is no flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){document.documentElement.setAttribute('data-theme','light')}})()`
