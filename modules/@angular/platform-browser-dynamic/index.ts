export {bootstrap, CACHED_TEMPLATE_PROVIDER} from '@angular/platform-browser';

import {BROWSER_APP_PROVIDERS, BROWSER_APP_COMPILER_PROVIDERS} from '@angular/platform-browser';

/* @deprecated the platform-browser-dynamic module is deprecated. */
export const BROWSER_APP_DYNAMIC_PROVIDERS: Array<any /*Type | Provider | any[]*/> = [
  BROWSER_APP_PROVIDERS,
  BROWSER_APP_COMPILER_PROVIDERS
];

console.log(`platform-browser-dynamic is deprecated, use platform-browser instead`);

