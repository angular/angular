/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as crypto from 'crypto';
import * as stream from 'stream';
import * as Vinyl from 'vinyl';

export interface GulpAddStaticFileOptions { manifestKey?: string; }

export function gulpGenerateManifest() {
  let readable = new stream.Readable({objectMode: true});
  readable._read = () => {
    readable.push(new Vinyl({
      cwd: '/',
      base: '/',
      path: '/ngsw-manifest.json',
      contents: new Buffer('{}'),
    }));
    readable.push(null);
  };
  return readable;
}

export function gulpAddStaticFiles(files: any, options: GulpAddStaticFileOptions = {}) {
  let manifestTransform = new stream.Transform({objectMode: true});
  let singleFile = true;

  manifestTransform._transform = (manifestFile, _, callback) => {
    if (!singleFile) {
      throw new Error('Only one manifest allowed.');
    }
    let manifest = JSON.parse(manifestFile.contents.toString('utf8'));
    let staticConfig: {[key: string]: any} = {urls: {}};
    let property = options.manifestKey || 'static';
    manifest[property] = staticConfig;

    // Look for ignored patterns in the manifest.
    let ignored: RegExp[] = [];
    const ignoreKey = `${options.manifestKey}.ignore`;
    if (manifest.hasOwnProperty(ignoreKey)) {
      ignored.push(...(manifest[ignoreKey] as string[]).map(regex => new RegExp(regex)));
      delete manifest[ignoreKey];
    }

    files.on('data', (file: any) => {
      const url = '/' + file.relative;
      if (ignored.some(regex => regex.test(url))) {
        return;
      }
      staticConfig.urls['/' + file.relative] = sha1(file.contents);
    });
    files.on('end', () => {
      manifestFile.contents = new Buffer(JSON.stringify(manifest, null, 2));
      callback(null, manifestFile);
    });

    singleFile = false;
  };

  return manifestTransform;
}

function sha1(buffer: Buffer): string {
  const hash = crypto.createHash('sha1');
  hash.update(buffer);
  return hash.digest('hex');
}