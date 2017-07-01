// Imports
import * as cp from 'child_process';
import {EventEmitter} from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';
import {HIDDEN_DIR_PREFIX, SHORT_SHA_LEN} from '../common/constants';
import {assertNotMissingOrEmpty} from '../common/utils';
import {ChangedPrVisibilityEvent, CreatedBuildEvent} from './build-events';
import {UploadError} from './upload-error';

// Classes
export class BuildCreator extends EventEmitter {
  // Constructor
  constructor(protected buildsDir: string) {
    super();
    assertNotMissingOrEmpty('buildsDir', buildsDir);
  }

  // Methods - Public
  public changePrVisibility(pr: string, makePublic: boolean): Promise<void> {
    const {oldPrDir, newPrDir} = this.getCandidatePrDirs(pr, makePublic);

    return Promise.
      all([this.exists(oldPrDir), this.exists(newPrDir)]).
      then(([oldPrDirExisted, newPrDirExisted]) => {
        if (!oldPrDirExisted) {
          throw new UploadError(404, `Request to move non-existing directory '${oldPrDir}' to '${newPrDir}'.`);
        } else if (newPrDirExisted) {
          throw new UploadError(409, `Request to move '${oldPrDir}' to existing directory '${newPrDir}'.`);
        }

        return Promise.resolve().
          then(() => shell.mv(oldPrDir, newPrDir)).
          then(() => this.listShasByDate(newPrDir)).
          then(shas => this.emit(ChangedPrVisibilityEvent.type, new ChangedPrVisibilityEvent(+pr, shas, makePublic))).
          then(() => undefined);
      }).
      catch(err => {
        if (!(err instanceof UploadError)) {
          err = new UploadError(500, `Error while making PR ${pr} ${makePublic ? 'public' : 'hidden'}.\n${err}`);
        }

        throw err;
      });
  }

  public create(pr: string, sha: string, archivePath: string, isPublic: boolean): Promise<void> {
    // Use only part of the SHA for more readable URLs.
    sha = sha.substr(0, SHORT_SHA_LEN);

    const {oldPrDir: otherVisPrDir, newPrDir: prDir} = this.getCandidatePrDirs(pr, isPublic);
    const shaDir = path.join(prDir, sha);
    let dirToRemoveOnError: string;

    return Promise.resolve().
      then(() => this.exists(otherVisPrDir)).
      // If the same PR exists with different visibility, update the visibility first.
      then(otherVisPrDirExisted => (otherVisPrDirExisted && this.changePrVisibility(pr, isPublic)) as any).
      then(() => Promise.all([this.exists(prDir), this.exists(shaDir)])).
      then(([prDirExisted, shaDirExisted]) => {
        if (shaDirExisted) {
          throw new UploadError(409, `Request to overwrite existing directory: ${shaDir}`);
        }

        dirToRemoveOnError = prDirExisted ? shaDir : prDir;

        return Promise.resolve().
          then(() => shell.mkdir('-p', shaDir)).
          then(() => this.extractArchive(archivePath, shaDir)).
          then(() => this.emit(CreatedBuildEvent.type, new CreatedBuildEvent(+pr, sha, isPublic))).
          then(() => undefined);
      }).
      catch(err => {
        if (dirToRemoveOnError) {
          shell.rm('-rf', dirToRemoveOnError);
        }

        if (!(err instanceof UploadError)) {
          err = new UploadError(500, `Error while uploading to directory: ${shaDir}\n${err}`);
        }

        throw err;
      });
  }

  // Methods - Protected
  protected exists(fileOrDir: string): Promise<boolean> {
    return new Promise(resolve => fs.access(fileOrDir, err => resolve(!err)));
  }

  protected extractArchive(inputFile: string, outputDir: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const cmd = `tar --extract --gzip --directory "${outputDir}" --file "${inputFile}"`;

      cp.exec(cmd, (err, _stdout, stderr) => {
        if (err) {
          return reject(err);
        }

        if (stderr) {
          console.warn(stderr);
        }

        try {
          // Undocumented signature (see https://github.com/shelljs/shelljs/pull/663).
          (shell as any).chmod('-R', 'a-w', outputDir);
          shell.rm('-f', inputFile);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  }

  protected getCandidatePrDirs(pr: string, isPublic: boolean) {
    const hiddenPrDir = path.join(this.buildsDir, HIDDEN_DIR_PREFIX + pr);
    const publicPrDir = path.join(this.buildsDir, pr);

    const oldPrDir = isPublic ? hiddenPrDir : publicPrDir;
    const newPrDir = isPublic ? publicPrDir : hiddenPrDir;

    return {oldPrDir, newPrDir};
  }

  protected listShasByDate(inputDir: string): Promise<string[]> {
    return Promise.resolve().
      then(() => shell.ls('-l', inputDir) as any as Promise<(fs.Stats & {name: string})[]>).
      // Keep directories only.
      // (Also, convert to standard Array - ShellJS provides custom `sort()` method for sorting file contents.)
      then(items => items.filter(item => item.isDirectory())).
      // Sort by modification date.
      then(items => items.sort((a, b) => a.mtime.getTime() - b.mtime.getTime())).
      // Return directory names.
      then(items => items.map(item => item.name));
  }
}
