/**
 * This script copies '@angular/core/event-dispatch-contract.min.js' to the 'public' directory, ensuring it's available as an asset.
 * This is necessary to perform size checks on the distributed script.
 */

import {copyFileSync} from 'node:fs';

copyFileSync(
  './node_modules/@angular/core/event-dispatch-contract.min.js',
  'public/event-dispatch-contract.min.js',
);
