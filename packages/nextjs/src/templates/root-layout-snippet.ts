/**
 * Inline script that reads the persisted theme from localStorage and applies
 * it to <html data-theme="…"> BEFORE React hydrates, preventing FOUC.
 *
 * Shared between the design-system layout template and the page-builder prompt
 * so the storage key ("ds-theme") stays in sync everywhere.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("ds-theme")||"light";if(t==="system")t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

/**
 * Dark-first variant: default to "dark" instead of "light" when no preference is stored.
 * Used for sites that are dark-first (no real light mode, e.g. Raycast, Vercel).
 */
export const THEME_INIT_SCRIPT_DARK = `(function(){try{var t=localStorage.getItem("ds-theme")||"dark";if(t==="system")t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
