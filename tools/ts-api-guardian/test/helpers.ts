import * as chai from 'chai';
import * as fs from 'fs';
import * as path from 'path';

export function unlinkRecursively(file: string) {
  if (fs.statSync(file).isDirectory()) {
    for (const f of fs.readdirSync(file)) {
      unlinkRecursively(path.join(file, f));
    }
    fs.rmdirSync(file);
  } else {
    fs.unlinkSync(file);
  }
}

export function assertFileEqual(actualFile: string, expectedFile: string) {
  chai.assert.equal(
      fs.readFileSync(actualFile).toString(), fs.readFileSync(expectedFile).toString());
}
