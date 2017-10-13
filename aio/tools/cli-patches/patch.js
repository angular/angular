const fs = require('fs');
const sh = require('shelljs');

const PATCH_LOCK = 'node_modules/@angular/cli/models/webpack-configs/.patched';

if (!fs.existsSync(PATCH_LOCK)) {
  sh.exec('patch -p0 -i tools/cli-patches/rxjs-esm-aliases.patch');
  sh.touch(PATCH_LOCK);
}

