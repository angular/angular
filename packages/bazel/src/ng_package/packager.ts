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
  const
      [out, srcDir, binDir, readmeMd, fesms2015Arg, fesms5Arg, bundlesArg, srcsArg, stampData,
       licenseFile] = args;
  const fesms2015 = fesms2015Arg.split(',').filter(s => !!s);
  const fesms5 = fesms5Arg.split(',').filter(s => !!s);
  const bundles = bundlesArg.split(',').filter(s => !!s);
  const srcs = srcsArg.split(',').filter(s => !!s);

  shx.mkdir('-p', out);

  let primaryEntryPoint: string|null = null;
  const secondaryEntryPoints = new Set<string>();

  function replaceVersionPlaceholders(filePath: string) {
    if (stampData) {
      const version = shx.grep('BUILD_SCM_VERSION', stampData).split(' ')[1].trim();
      return shx.sed(/0.0.0-PLACEHOLDER/, version, filePath);
    }
    return shx.cat(filePath);
  }

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
    shx.mkdir('-p', dir);
    shx.cp(file, dir);
    shx.mv(path.join(dir, path.basename(file)), path.join(dir, filename));
  }

  function moveBundleIndex(f: string) {
    let ext: string;

    if (f.endsWith('.d.ts'))
      ext = '.d.ts';
    else if (f.endsWith('.metadata.json'))
      ext = '.metadata.json';
    else
      throw new Error('Bundle index files should be .d.ts or .metadata.json');

    const relative = path.relative(binDir, f);
    let outputPath: string|undefined = undefined;
    for (const secondary of secondaryEntryPoints.values()) {
      if (relative.startsWith(secondary)) {
        const filename = secondary.split('/').pop();
        outputPath = path.join(out, secondary, filename + ext);
      }
    }
    if (!outputPath) {
      outputPath = path.join(out, primaryEntryPoint + ext);
    }
    return outputPath;
  }

  if (readmeMd) {
    shx.cp(readmeMd, path.join(out, 'README.md'));
  }

  fesms2015.forEach(fesm2015 => writeFesm(fesm2015, path.join(out, 'esm2015')));
  fesms5.forEach(fesm5 => writeFesm(fesm5, path.join(out, 'esm5')));

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

  for (const src of srcs) {
    replaceVersionPlaceholders(src).to(path.join(out, path.relative(srcDir, src)));
  }

  allsrcs.filter(filter('.bundle_index.metadata.json')).forEach((f: string) => {
    replaceVersionPlaceholders(f).to(moveBundleIndex(f));
  });

  const licenseBanner = licenseFile ? fs.readFileSync(licenseFile, {encoding: 'utf-8'}) : '';

  for (const secondaryEntryPoint of secondaryEntryPoints.values()) {
    const baseName = secondaryEntryPoint.split('/').pop();
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
