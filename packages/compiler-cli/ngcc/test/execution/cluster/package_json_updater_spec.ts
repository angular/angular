/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import * as cluster from 'cluster';

import {absoluteFrom as _} from '../../../../src/ngtsc/file_system';
import {runInEachFileSystem} from '../../../../src/ngtsc/file_system/testing';
import {ClusterWorkerPackageJsonUpdater} from '../../../src/execution/cluster/package_json_updater';
import {JsonObject} from '../../../src/packages/entry_point';
import {PackageJsonPropertyPositioning, PackageJsonUpdate, PackageJsonUpdater} from '../../../src/writing/package_json_updater';
import {mockProperty} from '../../helpers/spy_utils';


runInEachFileSystem(() => {
  describe('ClusterPackageJsonUpdater', () => {
    const runAsClusterMaster = mockProperty(cluster, 'isMaster');
    const mockProcessSend = mockProperty(process, 'send');
    let processSendSpy: jasmine.Spy;

    beforeEach(() => {
      processSendSpy = jasmine.createSpy('process.send');
      mockProcessSend(processSendSpy);
    });

    describe('constructor()', () => {
      it('should throw an error if used on a cluster master', () => {
        runAsClusterMaster(true);
        expect(() => new ClusterWorkerPackageJsonUpdater())
            .toThrowError(
                'Tried to create cluster worker PackageJsonUpdater on the master process.');
      });
    });

    describe('createUpdate()', () => {
      let updater: ClusterWorkerPackageJsonUpdater;
      beforeEach(() => {
        runAsClusterMaster(false);
        updater = new ClusterWorkerPackageJsonUpdater();
      });

      it('should return a `PackageJsonUpdate` instance', () => {
        expect(updater.createUpdate()).toEqual(jasmine.any(PackageJsonUpdate));
      });

      it('should wire up the `PackageJsonUpdate` with its `writeChanges()` method', () => {
        const writeChangesSpy = spyOn(updater, 'writeChanges');
        const jsonPath = _('/foo/package.json');
        const update = updater.createUpdate();

        update.addChange(['foo'], 'updated');
        update.addChange(['baz'], 'updated 2', 'alphabetic');
        update.addChange(['bar'], 'updated 3', {before: 'bar'});
        update.writeChanges(jsonPath);

        expect(writeChangesSpy)
            .toHaveBeenCalledWith(
                [
                  [['foo'], 'updated', 'unimportant'],
                  [['baz'], 'updated 2', 'alphabetic'],
                  [['bar'], 'updated 3', {before: 'bar'}],
                ],
                jsonPath, undefined);
      });
    });

    describe('writeChanges()', () => {
      let updater: ClusterWorkerPackageJsonUpdater;
      beforeEach(() => {
        runAsClusterMaster(false);
        updater = new ClusterWorkerPackageJsonUpdater();
      });

      it('should send an `update-package-json` message to the master process', () => {
        const jsonPath = _('/foo/package.json');

        const writeToProp =
            (propPath: string[], positioning?: PackageJsonPropertyPositioning,
             parsed?: JsonObject) => updater.createUpdate()
                                         .addChange(propPath, 'updated', positioning)
                                         .writeChanges(jsonPath, parsed);

        writeToProp(['foo']);
        expect(processSendSpy)
            .toHaveBeenCalledWith(
                {
                  type: 'update-package-json',
                  packageJsonPath: jsonPath,
                  changes: [[['foo'], 'updated', 'unimportant']],
                },
                jasmine.any(Function));

        writeToProp(['bar'], {before: 'foo'});
        expect(processSendSpy)
            .toHaveBeenCalledWith(
                {
                  type: 'update-package-json',
                  packageJsonPath: jsonPath,
                  changes: [[['bar'], 'updated', {before: 'foo'}]],
                },
                jasmine.any(Function));

        writeToProp(['bar', 'baz', 'qux'], 'alphabetic', {});
        expect(processSendSpy)
            .toHaveBeenCalledWith(
                {
                  type: 'update-package-json',
                  packageJsonPath: jsonPath,
                  changes: [[['bar', 'baz', 'qux'], 'updated', 'alphabetic']],
                },
                jasmine.any(Function));
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
