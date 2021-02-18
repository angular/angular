/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ifEnvSupports} from '../test-util';
declare const global: any;

describe(
    'FileReader', ifEnvSupports('FileReader', function() {
      let fileReader: FileReader;
      let blob: Blob;
      const data = 'Hello, World!';
      const testZone = Zone.current.fork({name: 'TestZone'});

      // Android 4.3's native browser doesn't implement add/RemoveEventListener for FileReader
      function supportsEventTargetFns() {
        return FileReader.prototype.addEventListener && FileReader.prototype.removeEventListener;
      }
      (<any>supportsEventTargetFns).message =
          'FileReader#addEventListener and FileReader#removeEventListener';

      beforeEach(function() {
        fileReader = new FileReader();

        try {
          blob = new Blob([data]);
        } catch (e) {
          // For hosts that don't support the Blob ctor (e.g. Android 4.3's native browser)
          const blobBuilder = new global['WebKitBlobBuilder']();
          blobBuilder.append(data);

          blob = blobBuilder.getBlob();
        }
      });

      describe('EventTarget methods', ifEnvSupports(supportsEventTargetFns, function() {
                 it('should bind addEventListener listeners', function(done) {
                   testZone.run(function() {
                     fileReader.addEventListener('load', function() {
                       expect(Zone.current).toBe(testZone);
                       expect(fileReader.result).toEqual(data);
                       done();
                     });
                   });

                   fileReader.readAsText(blob);
                 });

                 it('should remove listeners via removeEventListener', function(done) {
                   const listenerSpy = jasmine.createSpy('listener');

                   testZone.run(function() {
                     fileReader.addEventListener('loadstart', listenerSpy);
                     fileReader.addEventListener('loadend', function() {
                       expect(listenerSpy).not.toHaveBeenCalled();
                       done();
                     });
                   });

                   fileReader.removeEventListener('loadstart', listenerSpy);
                   fileReader.readAsText(blob);
                 });
               }));

      it('should bind onEventType listeners', function(done) {
        let listenersCalled = 0;

        testZone.run(function() {
          fileReader.onloadstart = function() {
            listenersCalled++;
            expect(Zone.current.name).toBe(testZone.name);
          };

          fileReader.onload = function() {
            listenersCalled++;
            expect(Zone.current.name).toBe(testZone.name);
          };

          fileReader.onloadend = function() {
            listenersCalled++;

            expect(Zone.current.name).toBe(testZone.name);
            expect(fileReader.result).toEqual(data);
            expect(listenersCalled).toBe(3);
            done();
          };
        });

        fileReader.readAsText(blob);
      });

      it('should have correct readyState', function(done) {
        fileReader.onloadend = function() {
          expect(fileReader.readyState).toBe((<any>FileReader).DONE);
          done();
        };

        expect(fileReader.readyState).toBe((<any>FileReader).EMPTY);

        fileReader.readAsText(blob);
      });

      it('should intercept FileReader and treat them as MacroTasks', function(done) {
        let reader: FileReader;
        let onStable: any;
        const testZoneWithWtf = Zone.current.fork((Zone as any)['wtfZoneSpec']).fork({
          name: 'TestZone',
          onHasTask: (delegate: ZoneDelegate, curr: Zone, target: Zone, hasTask: HasTaskState) => {
            if (!hasTask.macroTask) {
              onStable && onStable();
            }
          }
        });

        ['readAsText', 'readAsArrayBuffer', 'readAsBinaryString', 'readAsDataURL'].forEach(m => {
          testZoneWithWtf.run(() => {
            reader = new FileReader();
            const logs: string[] = [];
            reader.onload = () => {
              logs.push('onload');
            };
            onStable = function() {
              expect(wtfMock.log[wtfMock.log.length - 2])
                  .toEqual(`> Zone:invokeTask:FileReader.${m}("<root>::ProxyZone::WTF::TestZone")`);
              expect(wtfMock.log[wtfMock.log.length - 1])
                  .toEqual(`< Zone:invokeTask:FileReader.${m}`);
              expect(wtfMock.log[wtfMock.log.length - 3])
                  .toMatch(/\< Zone\:invokeTask.*addEventListener\:load/);
              expect(wtfMock.log[wtfMock.log.length - 4])
                  .toMatch(/\> Zone\:invokeTask.*addEventListener\:load/);
              // if browser can patch onload
              expect(logs).toEqual(['onload']);
              done();
            };

            (reader as any)[m](blob);
            const lastScheduled = wtfMock.log[wtfMock.log.length - 1];
            expect(lastScheduled).toMatch(`# Zone:schedule:macroTask:FileReader.${m}`);
          }, null, undefined, 'unit-test');
        });
      });
    }));
