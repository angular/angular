import {sync as deleteEmpty} from 'delete-empty';
import {existsSync, unlinkSync} from 'fs';
import {join} from 'path';
import {AIO_DOWNLOADS_DIR} from '../common/constants';
import {computeShortSha} from '../common/utils';
import {SHA} from './constants';
import {helper} from './helper';

function checkFile(filePath: string, remove: boolean): boolean {
  const exists = existsSync(filePath);
  if (exists && remove) {
    // if we expected the file to exist then we remove it to prevent leftover file errors
    unlinkSync(filePath);
  }
  return exists;
}

function getArtifactPath(prNum: number, sha: string = SHA): string {
  return `${AIO_DOWNLOADS_DIR}/${prNum}-${computeShortSha(sha)}-aio-snapshot.tgz`;
}

function checkFiles(prNum: number, isPublic: boolean, sha: string, isLegacy: boolean, remove: boolean) {
  const files = ['/index.html', '/foo/bar.js'];
  const prPath = helper.getPrDir(prNum, isPublic);
  const shaPath = helper.getShaDir(prPath, sha, isLegacy);

  const existingFiles: string[] = [];
  const missingFiles: string[] = [];
  files
    .map(file => join(shaPath, file))
    .forEach(file => (checkFile(file, remove) ? existingFiles : missingFiles).push(file));

  deleteEmpty(prPath);

  return { existingFiles, missingFiles };
}

class ToExistAsAFile implements jasmine.CustomMatcher {
  public compare(actual: string, remove = true): jasmine.CustomMatcherResult {
    const pass = checkFile(actual, remove);
    return {
      message: `Expected file at "${actual}" ${pass ? 'not' : ''} to exist`,
      pass,
    };
  }
}

class ToExistAsAnArtifact implements jasmine.CustomMatcher {
  public compare(actual: {prNum: number, sha?: string}, remove = true): jasmine.CustomMatcherResult {
    const { prNum, sha = SHA } = actual;
    const filePath = getArtifactPath(prNum, sha);
    const pass = checkFile(filePath, remove);
    return {
      message: `Expected artifact "PR:${prNum}, SHA:${sha}, FILE:${filePath}" ${pass ? 'not' : '\b'} to exist`,
      pass,
    };
  }
}

class ToExistAsABuild implements jasmine.CustomMatcher {
  public compare(actual: {prNum: number, isPublic?: boolean, sha?: string, isLegacy?: boolean}, remove = true):
      jasmine.CustomMatcherResult  {
    const {prNum, isPublic = true, sha = SHA, isLegacy = false} = actual;
    const {missingFiles} = checkFiles(prNum, isPublic, sha, isLegacy, remove);
    return {
      message: `Expected files for build "PR:${prNum}, SHA:${sha}" to exist:\n` +
                missingFiles.map(file => ` - ${file}`).join('\n'),
      pass: missingFiles.length === 0,
    };
  }
  public negativeCompare(actual: {prNum: number, isPublic?: boolean, sha?: string, isLegacy?: boolean}):
      jasmine.CustomMatcherResult  {
    const {prNum, isPublic = true, sha = SHA, isLegacy = false} = actual;
    const { existingFiles } = checkFiles(prNum, isPublic, sha, isLegacy, false);
    return {
      message: `Expected files for build "PR:${prNum}, SHA:${sha}" not to exist:\n` +
                existingFiles.map(file => ` - ${file}`).join('\n'),
      pass: existingFiles.length === 0,
    };
  }

}

export const customMatchers = {
  toExistAsABuild: () => new ToExistAsABuild(),
  toExistAsAFile: () => new ToExistAsAFile(),
  toExistAsAnArtifact: () => new ToExistAsAnArtifact(),
};
