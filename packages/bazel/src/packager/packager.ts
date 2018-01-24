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
  const [out, srcdir, packageJson, readmeMd, /*esm2015src,*/ fesms2015asString, fesms5asString] = args;
  const fesms2015 = fesms2015asString.split(',');
  const fesms5 = fesms5asString.split(',').filter(s => !!s);

  shx.mkdir("-p", out);
  shx.cp(packageJson, path.join(out, 'package.json'));
  shx.cp(readmeMd, path.join(out, 'README.md'));

  const allsrcs = shx.find("-R", srcdir);
  allsrcs.filter(filter(".d.ts")).forEach((f: string) => {
    const outputPath = path.join(out, path.relative(srcdir, f));
    shx.mkdir("-p", path.dirname(outputPath));
    shx.cp(f, outputPath);
  });
  allsrcs.filter(filter(".metadata.json")).forEach((f: string) => {
    // Leave /foo.metadata.json in place
    // Hoist /testing/testing.metadata.json to /testing.metadata.json
    // Hoist /subpkg/testing/testing.metadata to /subpkg/testing.metadata.json
    const intermediatePaths = path.relative(srcdir, path.dirname(f)).split("/");
    let metadataDir = "";
    if (intermediatePaths.length > 1) {
      metadataDir = path.join(...intermediatePaths.slice(0, -1));
    }
    const outputPath = path.join(out, metadataDir, path.basename(f));
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
  fesms2015.forEach(fesm2015 =>
    shx.cp("-R", `${fesm2015}/*`, esm2015Dir)
  );

  const esm5Dir = path.join(out, 'esm5');
  shx.mkdir("-p", esm5Dir);
  console.error(fesms5);
  fesms5.forEach(fesm5 => {
    shx.cp("-R", `${fesm5}/*`, esm5Dir);
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