/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

'use strict';

describe(
    'IndexedDB', ifEnvSupports('IDBDatabase', function() {
      var testZone = zone.fork();
      var db;

      beforeEach(function(done) {
        var openRequest = indexedDB.open('_zone_testdb');
        openRequest.onupgradeneeded = function(event) {
          db = event.target.result;
          var objectStore = db.createObjectStore('test-object-store', {keyPath: 'key'});
          objectStore.createIndex('key', 'key', {unique: true});
          objectStore.createIndex('data', 'data', {unique: false});

          objectStore.transaction.oncomplete = function() {
            var testStore =
                db.transaction('test-object-store', 'readwrite').objectStore('test-object-store');
            testStore.add({key: 1, data: 'Test data'});
            testStore.transaction.oncomplete = function() {
              done();
            }
          };
        };
      });

      afterEach(function(done) {
        db.close();

        var openRequest = indexedDB.deleteDatabase('_zone_testdb');
        openRequest.onsuccess = function(event) {
          done();
        };
      });

      describe('IDBRequest', function() {
        it('should bind EventTarget.addEventListener', function(done) {
          testZone.run(function() {
            db.transaction('test-object-store')
                .objectStore('test-object-store')
                .get(1)
                .addEventListener('success', function(event) {
                  expect(zone).toBeDirectChildOf(testZone);
                  expect(event.target.result.data).toBe('Test data');
                  done();
                });
          });
        });

        it('should bind onEventType listeners', function(done) {
          testZone.run(function() {
            db.transaction('test-object-store').objectStore('test-object-store').get(1).onsuccess =
                function(event) {
              expect(zone).toBeDirectChildOf(testZone);
              expect(event.target.result.data).toBe('Test data');
              done();
            };
          });
        });
      });

      describe('IDBCursor', function() {
        it('should bind EventTarget.addEventListener', function(done) {
          testZone.run(function() {
            db.transaction('test-object-store')
                .objectStore('test-object-store')
                .openCursor()
                .addEventListener('success', function(event) {
                  var cursor = event.target.result;
                  if (cursor) {
                    expect(zone).toBeDirectChildOf(testZone);
                    expect(cursor.value.data).toBe('Test data');
                    done();
                  } else {
                    throw 'Error while reading cursor!';
                  }
                });
          });
        });

        it('should bind onEventType listeners', function(done) {
          testZone.run(function() {
            db.transaction('test-object-store')
                .objectStore('test-object-store')
                .openCursor()
                .onsuccess = function(event) {
              var cursor = event.target.result;
              if (cursor) {
                expect(zone).toBeDirectChildOf(testZone);
                expect(cursor.value.data).toBe('Test data');
                done();
              } else {
                throw 'Error while reading cursor!';
              }
            };
          });
        });
      });

      describe('IDBIndex', function() {
        it('should bind EventTarget.addEventListener', function(done) {
          testZone.run(function() {
            db.transaction('test-object-store')
                .objectStore('test-object-store')
                .index('data')
                .get('Test data')
                .addEventListener('success', function(event) {
                  expect(zone).toBeDirectChildOf(testZone);
                  expect(event.target.result.key).toBe(1);
                  done();
                });
          });
        });

        it('should bind onEventType listeners', function(done) {
          testZone.run(function() {
            db.transaction('test-object-store')
                .objectStore('test-object-store')
                .index('data')
                .get('Test data')
                .onsuccess = function(event) {
              expect(zone).toBeDirectChildOf(testZone);
              expect(event.target.result.key).toBe(1);
              done();
            };
          });
        });
      });
    }));
