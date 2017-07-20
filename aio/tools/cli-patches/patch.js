const fs = require('fs');
const sh = require('shelljs');

PATCH_LOCK = 'node_modules/@angular/cli/models/webpack-configs/.patched';

if (!fs.existsSync(PATCH_LOCK)) {
  sh.exec('patch -p0 -i tools/cli-patches/ngo.patch');
  sh.exec('patch -p0 -i tools/cli-patches/purify.patch');
  sh.exec('patch -p0 -i tools/cli-patches/scope-hoisting.patch');
  sh.exec('patch -p0 -i tools/cli-patches/uglify-config.patch');
  sh.touch(PATCH_LOCK);
}
