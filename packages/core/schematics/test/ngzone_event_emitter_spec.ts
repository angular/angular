/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getSystemPath, normalize, virtualFs} from '@angular-devkit/core';
import {TempScopedNodeJsSyncHost} from '@angular-devkit/core/node/testing';
import {HostTree} from '@angular-devkit/schematics';
import {SchematicTestRunner, UnitTestTree} from '@angular-devkit/schematics/testing/index.js';
import {resolve} from 'node:path';
import shx from 'shelljs';

describe('NgZone EventEventEmitter migration', () => {
  let runner: SchematicTestRunner;
  let host: TempScopedNodeJsSyncHost;
  let tree: UnitTestTree;
  let tmpDirPath: string;

  function writeFile(filePath: string, contents: string) {
    host.sync.write(normalize(filePath), virtualFs.stringToFileBuffer(contents));
  }

  function runMigration() {
    return runner.runSchematic('ngzone-event-emitter', {}, tree);
  }

  const migrationsJsonPath = resolve('../migrations.json');
  beforeEach(() => {
    runner = new SchematicTestRunner('test', migrationsJsonPath);
    host = new TempScopedNodeJsSyncHost();
    tree = new UnitTestTree(new HostTree(host));
    tmpDirPath = getSystemPath(host.root);

    writeFile('/tsconfig.json', '{}');
    writeFile(
      '/angular.json',
      JSON.stringify({
        version: 1,
        projects: {t: {root: '', architect: {build: {options: {tsConfig: './tsconfig.json'}}}}},
      }),
    );

    writeFile(
      '/node_modules/@angular/core/index.d.ts',
      `
      export declare class EventEmitter<T> {
        emit(value: any): void;
      }

      export declare class NgZone {
        onMicrotaskEmpty: EventEmitter<any>;
        onStable: EventEmitter<any>;
        onUnstable: EventEmitter<any>;
        onError: EventEmitter<any>; 
      }
    `,
    );

    shx.cd(tmpDirPath);
  });

  it('should migrate NgZone EventEmitter.emit() to Subject.next()', async () => {
    writeFile(
      '/dir.ts',
      `
        import { NgZone } from '@angular/core';

        class Test {
          constructor(private ngZone: NgZone) {}

          test(eventEmitter: EventEmitter<string>) {
              this.ngZone.onMicrotaskEmpty.emit('test');
              this.ngZone.onStable.emit('test');
              this.ngZone.onUnstable.emit('test');
              this.ngZone.onError.emit(new Error('test'));
          }
        `,
    );

    await runMigration();
    const content = tree.readContent('/dir.ts');
    expect(content).toContain(`onMicrotaskEmpty.next('test');`);
    expect(content).toContain(`onStable.next('test');`);
    expect(content).toContain(`onUnstable.next('test');`);
    expect(content).toContain(`onError.next(new Error('test'));`);
  });

  it('should not change other EventEmitter.emit() calls', async () => {
    writeFile(
      '/dir.ts',
      `
        import { NgZone, EventEmitter } from '@angular/core';

        class Test {
          constructor(private ngZone: NgZone) {}

          test(eventEmitter: EventEmitter<string>) {
              eventEmitter.emit('test');
          }
        `,
    );

    await runMigration();
    const content = tree.readContent('/dir.ts');
    expect(content).toContain(`eventEmitter.emit('test');`);
  });

  it('should change emit() calls in NgZone subclasses', async () => {
    writeFile(
      '/dir.ts',
      `
        import { NgZone } from '@angular/core';

        class MyZone extends NgZone {
          test() {
            this.onMicrotaskEmpty.emit('test');
            this.onStable.emit('test');
            this.onUnstable.emit('test');
            this.onError.emit(new Error('test'));
          }
        }
        `,
    );

    await runMigration();
    const content = tree.readContent('/dir.ts');
    expect(content).toContain(`this.onMicrotaskEmpty.next('test');`);
    expect(content).toContain(`this.onStable.next('test');`);
    expect(content).toContain(`this.onUnstable.next('test');`);
    expect(content).toContain(`this.onError.next(new Error('test'));`);
  });
});
