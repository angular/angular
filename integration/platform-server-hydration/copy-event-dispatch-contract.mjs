import {copyFileSync} from 'node:fs';
copyFileSync(
  './node_modules/@angular/core/event-dispatch-contract.min.js',
  'public/event-dispatch-contract.min.js',
);
