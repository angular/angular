/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types='node'/>
import {spawn, spawnSync} from 'child_process';
import {join} from 'path';
import {Observable, Subject} from 'rxjs';

export type Executable = 'bazel' | 'ibazel';
export type Command = 'build' | 'test' | 'run' | 'coverage' | 'query';

export function runBazel(
    projectDir: string, executable: Executable, command: Command, workspaceTarget: string,
    flags: string[]): Observable<void> {
  const doneSubject = new Subject<void>();
  const bin = join(projectDir, 'node_modules', '.bin', executable);
  const buildProcess = spawn(bin, [command, workspaceTarget, ...flags], {
    cwd: projectDir,
    stdio: 'inherit',
    shell: false,
  });

  buildProcess.once('close', (code: number) => {
    if (code === 0) {
      doneSubject.next();
    } else {
      doneSubject.error(`${executable} failed with code ${code}.`);
    }
  });

  return doneSubject.asObservable();
}

export function checkInstallation(executable: Executable, projectDir: string) {
  const bin = join(projectDir, 'node_modules', '.bin', executable);
  const child = spawnSync(bin, ['version'], {
    cwd: projectDir,
    shell: false,
  });
  return child.status === 0;
}
