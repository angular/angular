/**
 * Custom Elements polyfills for browsers that natively support Custom Elements but not ES2015
 * modules.
 *
 * NOTE:
 * Chrome, Firefox and Safari should not need these, because they added support for ES2015 modules
 * before Custom Elements. It is still required for some other (less common) browsers:
 *   - UC browser for android 11.8 (~3.5% global usage)
 *   - Samsung browser 5.0-8.1 (~0.43% global usage)
 *   - Opera 41-47 (~0.02% global usage)
 */
// @ts-nocheck

require('core-js/modules/es.reflect.construct');  // Required by `native-shim.js`.
require('@webcomponents/custom-elements/src/native-shim');
