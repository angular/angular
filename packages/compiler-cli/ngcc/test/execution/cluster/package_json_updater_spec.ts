/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import * as cluster from 'cluster';

import {absoluteFrom as _} from '../../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../../src/ngtsc/file_system/testing';
import {ClusterPackageJsonUpdater} from '../../../src/execution/cluster/package_json_updater';
import {JsonObject} from '../../../src/packages/entry_point';
import {PackageJsonUpdate, PackageJsonUpdater} from '../../../src/writing/package_json_updater';
import {mockProperty} from '../../helpers/spy_utils';


runInEachFileSystem(() => {
  describe('ClusterPackageJsonUpdater', () => {
    const setMockClusterIsMasterValue = mockProperty(cluster, 'isMaster');
    const setMockProcessSendValue = mockProperty(process, 'send');
    let processSendSpy: jasmine.Spy;
    let delegate: PackageJsonUpdater;
    let updater: ClusterPackageJsonUpdater;

    beforeEach(() => {
      processSendSpy = jasmine.createSpy('process.send');
      setMockProcessSendValue(processSendSpy);

      delegate = new MockPackageJsonUpdater();
      updater = new ClusterPackageJsonUpdater(delegate);
    });

    describe('createUpdate()', () => {
      [true, false].forEach(
          isMaster => describe(`(on cluster ${isMaster ? 'master' : 'worker'})`, () => {
            beforeEach(() => setMockClusterIsMasterValue(isMaster));

            it('should return a `PackageJsonUpdate` instance',
               () => { expect(updater.createUpdate()).toEqual(jasmine.any(PackageJsonUpdate)); });

            it('should wire up the `PackageJsonUpdate` with its `writeChanges()` method', () => {
              const writeChangesSpy = spyOn(updater, 'writeChanges');
              const jsonPath = _('/foo/package.json');
              const update = updater.createUpdate();

              update.addChange(['foo'], 'updated');
              update.writeChanges(jsonPath);

              expect(writeChangesSpy)
                  .toHaveBeenCalledWith([[['foo'], 'updated']], jsonPath, undefined);
            });
          }));
    });

    describe('writeChanges()', () => {
      describe('(on cluster master)', () => {
        beforeEach(() => setMockClusterIsMasterValue(true));
        afterEach(() => expect(processSendSpy).not.toHaveBeenCalled());

        it('should forward the call to the delegate `PackageJsonUpdater`', () => {
          const jsonPath = _('/foo/package.json');
          const parsedJson = {foo: 'bar'};

          updater.createUpdate().addChange(['foo'], 'updated').writeChanges(jsonPath, parsedJson);

          expect(delegate.writeChanges)
              .toHaveBeenCalledWith([[['foo'], 'updated']], jsonPath, parsedJson);
        });

        it('should throw, if trying to re-apply an already applied update', () => {
          const update = updater.createUpdate().addChange(['foo'], 'updated');

          expect(() => update.writeChanges(_('/foo/package.json'))).not.toThrow();
          expect(() => update.writeChanges(_('/foo/package.json')))
              .toThrowError('Trying to apply a `PackageJsonUpdate` that has already been applied.');
          expect(() => update.writeChanges(_('/bar/package.json')))
              .toThrowError('Trying to apply a `PackageJsonUpdate` that has already been applied.');
        });
      });

      describe('(on cluster worker)', () => {
        beforeEach(() => setMockClusterIsMasterValue(false));

        it('should send an `update-package-json` message to the master process', () => {
          const jsonPath = _('/foo/package.json');

          const writeToProp = (propPath: string[], parsed?: JsonObject) =>
              updater.createUpdate().addChange(propPath, 'updated').writeChanges(jsonPath, parsed);

          writeToProp(['foo']);
          expect(processSendSpy).toHaveBeenCalledWith({
            type: 'update-package-json',
            packageJsonPath: jsonPath,
            changes: [[['foo'], 'updated']],
          });

          writeToProp(['bar', 'baz', 'qux'], {});
          expect(processSendSpy).toHaveBeenCalledWith({
            type: 'update-package-json',
            packageJsonPath: jsonPath,
            changes: [[['bar', 'baz', 'qux'], 'updated']],
          });
        });

        it('should update an in-memory representation (if provided)', () => {
          const jsonPath = _('/foo/package.json');
          const parsedJson: JsonObject = {
            foo: true,
            bar: {baz: 'OK'},
          };

          const update =
              updater.createUpdate().addChange(['foo'], false).addChange(['bar', 'baz'], 42);

          // Not updated yet.
          expect(parsedJson).toEqual({
            foo: true,
            bar: {baz: 'OK'},
          });

          update.writeChanges(jsonPath, parsedJson);

          // Updated now.
          expect(parsedJson).toEqual({
            foo: false,
            bar: {baz: 42},
          });
        });

        it('should create any missing ancestor objects', () => {
          const jsonPath = _('/foo/package.json');
          const parsedJson: JsonObject = {foo: {}};

          updater.createUpdate()
              .addChange(['foo', 'bar', 'baz', 'qux'], 'updated')
              .writeChanges(jsonPath, parsedJson);

          expect(parsedJson).toEqual({
            foo: {
              bar: {
                baz: {
                  qux: 'updated',
                },
              },
            },
          });
        });

        it('should throw, if a property-path is empty', () => {
          const jsonPath = _('/foo/package.json');

          expect(() => updater.createUpdate().addChange([], 'missing').writeChanges(jsonPath, {}))
              .toThrowError(`Missing property path for writing value to '${jsonPath}'.`);
        });

        it('should throw, if a property-path points to a non-object intermediate value', () => {
          const jsonPath = _('/foo/package.json');
          const parsedJson = {foo: null, bar: 42, baz: {qux: []}};

          const writeToProp = (propPath: string[], parsed?: JsonObject) =>
              updater.createUpdate().addChange(propPath, 'updated').writeChanges(jsonPath, parsed);

          expect(() => writeToProp(['foo', 'child'], parsedJson))
              .toThrowError('Property path \'foo.child\' does not point to an object.');
          expect(() => writeToProp(['bar', 'child'], parsedJson))
              .toThrowError('Property path \'bar.child\' does not point to an object.');
          expect(() => writeToProp(['baz', 'qux', 'child'], parsedJson))
              .toThrowError('Property path \'baz.qux.child\' does not point to an object.');

          // It should not throw, if no parsed representation is provided.
          // (The error will still be thrown on the master process, but that is out of scope for
          // this test.)
          expect(() => writeToProp(['foo', 'child'])).not.toThrow();
        });

        it('should throw, if trying to re-apply an already applied update', () => {
          const update = updater.createUpdate().addChange(['foo'], 'updated');

          expect(() => update.writeChanges(_('/foo/package.json'))).not.toThrow();
          expect(() => update.writeChanges(_('/foo/package.json')))
              .toThrowError('Trying to apply a `PackageJsonUpdate` that has already been applied.');
          expect(() => update.writeChanges(_('/bar/package.json')))
              .toThrowError('Trying to apply a `PackageJsonUpdate` that has already been applied.');
        });
      });
    });

    // Helpers
    class MockPackageJsonUpdater implements PackageJsonUpdater {
      createUpdate = jasmine.createSpy('MockPackageJsonUpdater#createUpdate');
      writeChanges = jasmine.createSpy('MockPackageJsonUpdater#writeChanges');
    }
  });
});
