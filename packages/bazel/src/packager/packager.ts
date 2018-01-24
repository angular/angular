/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// tslint:disable-next-line:no-require-imports
require('source-map-support').install();

import './shelljs';
import * as shx from 'shelljs';
import * as path from 'path';

function filter(ext: string): (path: string) => boolean {
  return f => f.endsWith(ext) && !f.endsWith(`.ngfactory${ext}`) && !f.endsWith(`.ngsummary${ext}`);
}

function main(args: string[]): number {
  shx.set("-e");
  const [out, srcdir, packageJson, readmeMd, /*esm2015src,*/ fesms2015asString, fesms5asString, umdsasString, stampData] = args;
  const fesms2015 = fesms2015asString.split(',');
  const fesms5 = fesms5asString.split(',').filter(s => !!s);
  const umds = umdsasString.split(',').filter(s => !!s);

  shx.mkdir("-p", out);
  const version = shx.grep('BUILD_SCM_VERSION', stampData).split(' ')[1].trim();
  shx.sed(/0.0.0-PLACEHOLDER/, version, packageJson).to(path.join(out, 'package.json'));
  shx.cp(readmeMd, path.join(out, 'README.md'));

  const allsrcs = shx.find("-R", srcdir);
  allsrcs.filter(filter(".d.ts")).forEach((f: string) => {
    const outputPath = path.join(out, path.relative(srcdir, f));
    shx.mkdir("-p", path.dirname(outputPath));
    shx.cp(f, outputPath);
  });
  allsrcs.filter(filter(".metadata.json")).forEach((f: string) => {
    const outputPath = path.join(out, path.relative(srcdir, f));
    shx.cp(f, outputPath);
  });

  // TODO(i): we currently don't publish individual files, so let's disable this feature for in
  //   order to create a distribution that matches what build.sh builds today
  //
  // const esm2015 = shx.find("-R", esm2015src);
  // esm2015.filter(filter(".js")).forEach(f => {
  //   const outputPath = path.join(out, "esm2015", path.relative(esm2015src, f));
  //   shx.mkdir("-p", path.dirname(outputPath));
  //   shx.cp(f, outputPath);
  // });
  //
  // shx.cp("-R", fesm2015, out);

  const esm2015Dir = path.join(out, 'esm2015');
  shx.mkdir("-p", esm2015Dir);
  fesms2015.forEach(fesm2015 => {
      // TODO(alexeagle): the "packages" here doesn't port to user's projects
      shx.cp("-R", `${fesm2015}/packages/*`, esm2015Dir);
    }
  );

  const esm5Dir = path.join(out, 'esm5');
  shx.mkdir("-p", esm5Dir);
  fesms5.forEach(fesm5 => {
    shx.cp("-R", `${fesm5}/packages/*`, esm5Dir);
  });

  const umdDir = path.join(out, 'bundles');
  shx.mkdir("-p", umdDir);
  umds.forEach(umd => {
    shx.cp("-R", `${umd}/packages/*`, umdDir);
  });

  return 0;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}

/* /testing.d.ts
echo "$(cat ${LICENSE_BANNER}) ${N} export * from './${package_name}/${package_name}'" > ${2}/../${package_name}.d.ts
//LICENSE
export * from './testing/testing'
*/

/* /testing.metadata.json
{"__symbolic":"module","version":3,"metadata":{},"exports":[{"from":"./testing/testing"}],"flatModuleIndexRedirect":true}
 */

/* /testing/package.json
{
  "name": "@angular/core/testing",
  "typings": "./testing.d.ts",
  "main": "../bundles/core-testing.umd.js",
  "module": "../esm5/testing.js",
  "es2015": "../esm2015/testing.js"
}
 */