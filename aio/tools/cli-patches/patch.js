const sh = require('shelljs');

const PATCH_LOCK = 'node_modules/@angular/cli/.patched';

sh.set('-e');
sh.cd(`${__dirname}/../../`);

if (!sh.test('-f', PATCH_LOCK)) {
  sh.ls(`${__dirname}/*.patch`).forEach(patchFile => sh.exec(`patch -p0 -i "${patchFile}"`));
  sh.touch(PATCH_LOCK);
}
