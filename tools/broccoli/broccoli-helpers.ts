import crypto = require('crypto');
import fs = require('fs');
import path = require('path');

export default {lstatSync, statSync, copySync, hashTree, hashStrings};

export function lstatSync(p: string) {
  try {
    return fs.lstatSync(p);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  return null;
}

export function statSync(p: string) {
  try {
    return fs.statSync(p);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }
  return null;
}

export function copySync(src: string, dst: string) {
  let stat = lstatSync(src);
  if (stat && stat.isSymbolicLink()) {
    stat = statSync(src);
    if (!stat) throw new Error(`[copySync()] Dead symlink '${src}'`);
  }
  if (stat.isDirectory()) {
    fs.mkdirSync(dst);
    for (let entry of fs.readdirSync(src).sort()) {
      copySync(`${src}${path.sep}${entry}`, `${dst}${path.sep}${entry}`);
    }
  } else if (stat.isFile()) {
    let contents = fs.readFileSync(src);
    fs.writeFileSync(dst, contents, {flag: 'wx', mode: stat.mode});
  }
}

export function hashTree(fullPath: string) {
  return hashStrings(keysForTree(fullPath));

  function keysForTree(fullPath: string, relativePath: string = '.'): string[] {
    let stats = statSync(fullPath);
    if (!stats) return ['path', relativePath, 'stat failed'];
    if (stats.isFile()) {
      return [
        'path',
        relativePath,
        'stats',
        '' + stats.mode,
        '' + stats.mtime.getTime(),
        '' + stats.size
      ];
    } else if (stats.isDirectory()) {
      let entries = readdirForKeys(fullPath);
      let childKeys = entries === undefined ? ['readdir failed'] : [];
      if (entries !== undefined) {
        for (let entry of entries) {
          childKeys = childKeys.concat(
              keysForTree(path.join(fullPath, entry), path.join(relativePath, entry)));
        }
      }
      return ['path', relativePath].concat(childKeys);
    }

    throw new Error('UNREACHABLE');

    function readdirForKeys(fullPath: string) {
      try {
        return fs.readdirSync(fullPath).sort();
      } catch (e) {
        console.warn(`[hashTree()]\n  Warning: Failed to read directory ${fullPath}`);
        console.warn(e.stack);
      }
    }
  }
}

export function hashStrings(strings: string[]) {
  var joinedStrings = strings.join('\x00');
  return crypto.createHash('md5').update(joinedStrings).digest('hex');
}
