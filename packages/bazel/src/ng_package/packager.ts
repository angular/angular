/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as shx from 'shelljs';

function filter(ext: string): (path: string) => boolean {
  return f => f.endsWith(ext) && !f.endsWith(`.ngfactory${ext}`) && !f.endsWith(`.ngsummary${ext}`);
}

function main(args: string[]): number {
  shx.set('-e');

  args = fs.readFileSync(args[0], {encoding: 'utf-8'}).split('\n').map(s => s === '\'\'' ? '' : s);
  const
      [out, srcDir, primaryEntryPoint, secondaryEntryPointsArg, binDir, readmeMd, esm2015Arg,
       esm5Arg, bundlesArg, srcsArg, licenseFile] = args;
  const esm2015 = esm2015Arg.split(',').filter(s => !!s);
  const esm5 = esm5Arg.split(',').filter(s => !!s);
  const bundles = bundlesArg.split(',').filter(s => !!s);
  const srcs = srcsArg.split(',').filter(s => !!s);
  const secondaryEntryPoints = secondaryEntryPointsArg.split(',').filter(s => !!s);

  shx.mkdir('-p', out);

  /**
   * Inserts properties into the package.json file(s) in the package so that
   * they point to all the right generated artifacts.
   *
   * @param filePath file being copied
   * @param content current file content
   */
  function amendPackageJson(filePath: string, content: string) {
    const parsedPackage = JSON.parse(content);
    let nameParts = parsedPackage['name'].split('/');
    // for scoped packages, we don't care about the scope segment of the path
    if (nameParts[0].startsWith('@')) nameParts = nameParts.splice(1);
    let rel = Array(nameParts.length - 1).fill('..').join('/');
    if (!rel) {
      rel = '.';
    }
    const basename = nameParts[nameParts.length - 1];
    const indexName = [...nameParts, `${basename}.js`].splice(1).join('/');
    parsedPackage['main'] = `${rel}/bundles/${nameParts.join('-')}.umd.js`;
    parsedPackage['module'] = `${rel}/esm5/${indexName}`;
    parsedPackage['es2015'] = `${rel}/esm2015/${indexName}`;
    parsedPackage['typings'] = `./${basename}.d.ts`;
    return JSON.stringify(parsedPackage, null, 2);
  }

  function writeFesm(file: string, baseDir: string) {
    const parts = path.basename(file).split('__');
    const entryPointName = parts.join('/').replace(/\..*/, '');
    const filename = parts.splice(-1)[0];
    const dir = path.join(baseDir, ...parts);
    shx.mkdir('-p', dir);
    shx.cp(file, dir);
    shx.mv(path.join(dir, path.basename(file)), path.join(dir, filename));
  }

  function writeFile(file: string, relative: string, baseDir: string) {
    const dir = path.join(baseDir, path.dirname(relative));
    shx.mkdir('-p', dir);
    shx.cp(file, dir);
  }

  // Copy these bundle_index outputs from the ng_module rules in the deps
  // Mapping looks like:
  //  $bin/_core.bundle_index.d.ts
  //    -> $out/core.d.ts
  //  $bin/testing/_testing.bundle_index.d.ts
  //    -> $out/testing/testing.d.ts
  //  $bin/_core.bundle_index.metadata.json
  //    -> $out/core.metadata.json
  //  $bin/testing/_testing.bundle_index.metadata.json
  //    -> $out/testing/testing.metadata.json
  // JS is a little different, as controlled by the `dir` parameter
  //  $bin/_core.bundle_index.js
  //    -> $out/esm5/core.js
  //  $bin/testing/_testing.bundle_index.js
  //    -> $out/esm5/testing.js
  function moveBundleIndex(f: string, dir = '.') {
    const relative = path.relative(binDir, f);
    return path.join(out, dir, relative.replace(/_(.*)\.bundle_index/, '$1'));
  }

  if (readmeMd) {
    shx.cp(readmeMd, path.join(out, 'README.md'));
  }

  function writeEsmFile(file, suffix, outDir) {
    const root = file.substr(0, file.lastIndexOf(suffix + path.sep) + suffix.length + 1);
    const rel = path.relative(path.join(root, srcDir), file);
    if (!rel.startsWith('..')) {
      writeFile(file, rel, path.join(out, outDir));
    }
  }
  esm2015.forEach(file => writeEsmFile(file, '.es6', 'esm2015'));
  esm5.forEach(file => writeEsmFile(file, '.esm5', 'esm5'));

  const bundlesDir = path.join(out, 'bundles');
  shx.mkdir('-p', bundlesDir);
  bundles.forEach(bundle => { shx.cp(bundle, bundlesDir); });

  const allsrcs = shx.find('-R', binDir);
  allsrcs.filter(filter('.d.ts')).forEach((f: string) => {
    const content = fs.readFileSync(f, {encoding: 'utf-8'})
                        // Strip the named AMD module for compatibility with non-bazel users
                        .replace(/^\/\/\/ <amd-module name=.*\/>\n/, '');
    let outputPath: string;
    if (f.endsWith('.bundle_index.d.ts')) {
      outputPath = moveBundleIndex(f);
    } else {
      outputPath = path.join(out, path.relative(binDir, f));
    }
    shx.mkdir('-p', path.dirname(outputPath));
    fs.writeFileSync(outputPath, content);
  });
  allsrcs.filter(filter('.bundle_index.js')).forEach((f: string) => {
    const content = fs.readFileSync(f, {encoding: 'utf-8'});
    fs.writeFileSync(moveBundleIndex(f, 'esm5'), content);
    fs.writeFileSync(moveBundleIndex(f, 'esm2015'), content);
  });

  for (const src of srcs) {
    let content = fs.readFileSync(src, {encoding: 'utf-8'});
    if (path.basename(src) === 'package.json') {
      content = amendPackageJson(src, content);
    }
    const outputPath = path.join(out, path.relative(srcDir, src));
    shx.mkdir('-p', path.dirname(outputPath));
    fs.writeFileSync(outputPath, content);
  }

  allsrcs.filter(filter('.bundle_index.metadata.json')).forEach((f: string) => {
    fs.writeFileSync(moveBundleIndex(f), fs.readFileSync(f, {encoding: 'utf-8'}));
  });

  const licenseBanner = licenseFile ? fs.readFileSync(licenseFile, {encoding: 'utf-8'}) : '';

  for (const secondaryEntryPoint of secondaryEntryPoints) {
    const baseName = secondaryEntryPoint.split('/').pop();
    if (!baseName) throw new Error('secondaryEntryPoint has no slash');
    const dirName = path.join(...secondaryEntryPoint.split('/').slice(0, -1));

    fs.writeFileSync(path.join(out, dirName, `${baseName}.metadata.json`), JSON.stringify({
      '__symbolic': 'module',
      'version': 3,
      'metadata': {},
      'exports': [{'from': `./${baseName}/${baseName}`}],
      'flatModuleIndexRedirect': true
    }) + '\n');

    fs.writeFileSync(
        path.join(out, dirName, `${baseName}.d.ts`),
        // Format carefully to match existing build.sh output
        licenseBanner + ' ' +
            `
 export * from './${baseName}/${baseName}'
`);
  }

  return 0;
}

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
