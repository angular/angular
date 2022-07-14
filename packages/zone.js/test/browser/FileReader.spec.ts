/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ifEnvSupports} from '../test-util';
declare const global: any;

describe('FileReader', ifEnvSupports('FileReader', function() {
           let fileReader: FileReader;
           let blob: Blob;
           const data = 'Hello, World!';

           // Android 4.3's native browser doesn't implement add/RemoveEventListener for FileReader
           function supportsEventTargetFns() {
             return !!FileReader.prototype.addEventListener &&
                 !!FileReader.prototype.removeEventListener;
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
                        const testZone = Zone.current.fork({name: 'TestZone'});

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
                        const testZone = Zone.current.fork({name: 'TestZone'});
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
             const testZone = Zone.current.fork({name: 'TestZone'});
             let listenersCalled = 0;

             testZone.run(function() {
               fileReader.onloadstart = function() {
                 listenersCalled++;
                 expect(Zone.current).toBe(testZone);
               };

               fileReader.onload = function() {
                 listenersCalled++;
                 expect(Zone.current).toBe(testZone);
               };

               fileReader.onloadend = function() {
                 listenersCalled++;

                 expect(Zone.current).toBe(testZone);
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
         }));
