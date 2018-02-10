/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

// tslint:disable-next-line:no-require-imports
require('source-map-support').install();

const fs = require('fs');
const shx = require('shelljs');
import * as path from 'path';

function filter(ext: string): (path: string) => boolean {
  return f => f.endsWith(ext) && !f.endsWith(`.ngfactory${ext}`) && !f.endsWith(`.ngsummary${ext}`);
}

function main(args: string[]): number {
  shx.set("-e");
  const [out, srcdir, packageJson, readmeMd, /*esm2015src,*/ fesms2015asString, fesms5asString, bundlesasString, stampData] = args;
  const fesms2015 = fesms2015asString.split(',');
  const fesms5 = fesms5asString.split(',').filter(s => !!s);
  const bundles = bundlesasString.split(',').filter(s => !!s);

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

  let primaryEntryPoint: string|null = null;
  const secondaryEntryPoints = new Set<string>();

  function writeFesm(file: string, baseDir: string) {
    const parts = path.basename(file).split('__');
    const entryPointName = parts.join('/').replace(/\..*/, '');
    if (primaryEntryPoint === null || primaryEntryPoint === entryPointName) {
      primaryEntryPoint = entryPointName;
    } else {
      secondaryEntryPoints.add(entryPointName);
    }
    const filename = parts.splice(-1)[0];
    const dir = path.join(baseDir, ...parts);
    shx.mkdir("-p", dir);
    shx.cp(file, dir);
    shx.mv(path.join(dir, path.basename(file)), path.join(dir, filename));
  }

  fesms2015.forEach(fesm2015 => writeFesm(fesm2015, path.join(out, 'esm2015')));
  fesms5.forEach(fesm5 => writeFesm(fesm5, path.join(out, 'esm5')));

  const bundlesDir = path.join(out, 'bundles');
  shx.mkdir("-p", bundlesDir);
  bundles.forEach(bundle => {
    shx.cp(bundle, bundlesDir);
  });

  // TODO(i): avoid cast to any
  for (const secondaryEntryPoint of secondaryEntryPoints.values() as any) {
    const baseName = secondaryEntryPoint.split('/').pop();
    const dirName = path.join(...secondaryEntryPoint.split('/').slice(0, -1));

    fs.writeFileSync(path.join(out, dirName, `${baseName}.metadata.json`),
        JSON.stringify({
          "__symbolic":"module",
          "version":3,
          "metadata":{},
          "exports":[{"from":`./${baseName}/${baseName}`}],
          "flatModuleIndexRedirect":true
        }));

    fs.writeFileSync(path.join(out, dirName, `${baseName}.d.ts`),
        // TODO(i): add license file
        `export * from './${baseName}/${baseName}'`
        );
  }

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

/* /testing/package.json
{
  "name": "@angular/core/testing",
  "typings": "./testing.d.ts",
  "main": "../bundles/core-testing.umd.js",
  "module": "../esm5/testing.js",
  "es2015": "../esm2015/testing.js"
}
 */