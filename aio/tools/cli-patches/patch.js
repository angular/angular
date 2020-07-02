const fs = require('fs');
const sh = require('shelljs');

const PATCH_LOCK = 'node_modules/@angular/cli/.patched';

if (!fs.existsSync(PATCH_LOCK)) {
  sh.touch(PATCH_LOCK);
}

