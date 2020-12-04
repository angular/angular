/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as childProcess from 'child_process';
import {EventEmitter} from 'events';
import {Readable} from 'stream';
import {BuiltPackage} from '../config/index';
import {buildReleaseOutput} from './build';


describe('release outputs building', () => {
  const npmPackages: BuiltPackage[] = [
    {name: '@angular/pkg1', outputPath: './'},
    {name: '@angular/pkg2', outputPath: './'},
  ];
  const mockChildProcess = buildMockChildProcess();

  beforeEach(() => {
    spyOn(childProcess, 'fork').and.returnValue(mockChildProcess);
  });

  it('should invoke configured build packages function and resolve to the BuildPackge list',
     async () => {
       const buildResultPromise = buildReleaseOutput();
       mockChildProcess.emit('message', npmPackages);
       mockChildProcess.emit('exit', 0);
       await expectAsync(buildResultPromise).toBeResolvedTo(npmPackages);
     });

  it('should invoke configured build packages function and resolve to null if not packages are built',
     async () => {
       const buildResultPromise = buildReleaseOutput();
       mockChildProcess.emit('exit', 0);
       await expectAsync(buildResultPromise).toBeResolvedTo(null);
     });

  it('should reject the generated promise if building packages fails', async () => {
    const buildResultPromise = buildReleaseOutput();
    mockChildProcess.emit('exit', 1);
    await expectAsync(buildResultPromise).toBeRejected();
  });
});


/**
 * Build an object which can act with the necessary API to mock a ChildProcess as returned by fork.
 */
function buildMockChildProcess() {
  const childProcess: any = new EventEmitter();
  const read = () => {};

  childProcess.stdout = new Readable({read});
  childProcess.stderr = new Readable({read});

  childProcess.exit = (code: number) => {
    childProcess.emit('exit', code);
  };

  return childProcess;
}
