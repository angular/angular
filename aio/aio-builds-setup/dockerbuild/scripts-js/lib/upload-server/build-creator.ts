// Imports
import * as cp from 'child_process';
import {EventEmitter} from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as shell from 'shelljs';
import {assertNotMissingOrEmpty} from '../common/utils';
import {CreatedBuildEvent} from './build-events';
import {UploadError} from './upload-error';

// Classes
export class BuildCreator extends EventEmitter {
  // Constructor
  constructor(protected buildsDir: string) {
    super();
    assertNotMissingOrEmpty('buildsDir', buildsDir);
  }

  // Methods - Public
  public create(pr: string, sha: string, archivePath: string): Promise<any> {
    const prDir = path.join(this.buildsDir, pr);
    const shaDir = path.join(prDir, sha);
    let dirToRemoveOnError: string;

    return Promise.
      all([this.exists(prDir), this.exists(shaDir)]).
      then(([prDirExisted, shaDirExisted]) => {
        if (shaDirExisted) {
          throw new UploadError(409, `Request to overwrite existing directory: ${shaDir}`);
        }

        dirToRemoveOnError = prDirExisted ? shaDir : prDir;

        return Promise.resolve().
          then(() => shell.mkdir('-p', shaDir)).
          then(() => this.extractArchive(archivePath, shaDir)).
          then(() => this.emit(CreatedBuildEvent.type, new CreatedBuildEvent(+pr, sha)));
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
}
