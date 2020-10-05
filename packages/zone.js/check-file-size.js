/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const fs = require('fs');
const {createGzip} = require('zlib');
const {pipeline} = require('stream');
const {promisify} = require('util');
const pipe = promisify(pipeline);
const remove = promisify(fs.unlink);

async function do_gzip(input, output) {
  const gzip = createGzip();
  const source = fs.createReadStream(input);
  const destination = fs.createWriteStream(output);
  await pipe(source, gzip, destination);
}

function checkSize(file, limit) {
  try {
    const stats = fs.statSync(file);
    if (stats.size > limit) {
      console.error(`file ${file} size over limit, limit is ${limit}, actual is ${stats.size}`);
      return false;
    }
  } catch (err) {
    console.error(`failed to get filesize: ${file}`);
    return false;
  }
  return true;
}

const checker = function(config) {
  let chkResult = true;
  config.targets.forEach(async target => {
    if (target.checkTarget) {
      if (target.gzipLimit) {
        // gzip target
        await do_gzip(target.path, `${target.path}.gz`);
      }
      chkResult =
          checkSize(target.path, target.limit) && checkSize(`${target.path}.gz`, target.gzipLimit);
      await remove(`${target.path}.gz`);
    }
  });
  return chkResult;
};

process.exitCode = checker(require('./file-size-limit.json')) ? 0 : 1;
