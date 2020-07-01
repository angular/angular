const sh = require('shelljs');

const PATCH_LOCK = 'node_modules/@angular/cli/.patched';

sh.set('-e');
sh.cd(`${__dirname}/../../`);

if (!sh.test('-f', PATCH_LOCK)) {
  sh.ls('-l', __dirname)
      .filter(stat => stat.isFile() && /\.patch$/i.test(stat.name))
      .forEach(stat => sh.exec(`patch -p0 -i "${__dirname}/${stat.name}"`));

  sh.touch(PATCH_LOCK);
}
