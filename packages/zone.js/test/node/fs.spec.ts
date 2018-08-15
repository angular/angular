/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {closeSync, exists, fstatSync, openSync, read, unlink, unlinkSync, unwatchFile, watch, watchFile, write, writeFile} from 'fs';
import * as util from 'util';

describe('nodejs file system', () => {
  describe('async method patch test', () => {
    it('has patched exists()', (done) => {
      const zoneA = Zone.current.fork({name: 'A'});
      zoneA.run(() => {
        exists('testfile', (_) => {
          expect(Zone.current.name).toBe(zoneA.name);
          done();
        });
      });
    });

    it('has patched exists as macroTask', (done) => {
      const zoneASpec = {
        name: 'A',
        onScheduleTask: (delegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task):
            Task => {
              return delegate.scheduleTask(targetZone, task);
            }
      };
      const zoneA = Zone.current.fork(zoneASpec);
      spyOn(zoneASpec, 'onScheduleTask').and.callThrough();
      zoneA.run(() => {
        exists('testfile', (_) => {
          expect(zoneASpec.onScheduleTask).toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('watcher related methods test', () => {
    const zoneASpec = {
      name: 'A',
      onScheduleTask: (delegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task):
          Task => {
            return delegate.scheduleTask(targetZone, task);
          }
    };

    it('fs.watch has been patched as eventTask', (done) => {
      spyOn(zoneASpec, 'onScheduleTask').and.callThrough();
      const zoneA = Zone.current.fork(zoneASpec);
      zoneA.run(() => {
        writeFile('testfile', 'test content', () => {
          const watcher = watch('testfile', (eventType, filename) => {
            expect(filename).toEqual('testfile');
            expect(eventType).toEqual('change');
            expect(zoneASpec.onScheduleTask).toHaveBeenCalled();
            expect(Zone.current.name).toBe('A');
            watcher.close();
            unlink('testfile', () => {
              done();
            });
          });
          writeFile('testfile', 'test new content', () => {});
        });
      });
    });

    it('fs.watchFile has been patched as eventTask', (done) => {
      spyOn(zoneASpec, 'onScheduleTask').and.callThrough();
      const zoneA = Zone.current.fork(zoneASpec);
      zoneA.run(() => {
        writeFile('testfile', 'test content', () => {
          watchFile('testfile', {persistent: false, interval: 1000}, (curr, prev) => {
            expect(curr.size).toBe(16);
            expect(prev.size).toBe(12);
            expect(zoneASpec.onScheduleTask).toHaveBeenCalled();
            expect(Zone.current.name).toBe('A');
            unwatchFile('testfile');
            unlink('testfile', () => {
              done();
            });
          });
          writeFile('testfile', 'test new content', () => {});
        });
      });
    });
  });
});

describe('util.promisify', () => {
  it('fs.exists should work with util.promisify', (done: DoneFn) => {
    const promisifyExists = util.promisify(exists);
    promisifyExists(__filename)
        .then(
            r => {
              expect(r).toBe(true);
              done();
            },
            err => {
              fail(`should not be here with error: ${err}`);
            });
  });

  it('fs.read should work with util.promisify', (done: DoneFn) => {
    const promisifyRead = util.promisify(read);
    const fd = openSync(__filename, 'r');
    const stats = fstatSync(fd);
    const bufferSize = stats.size;
    const chunkSize = 512;
    const buffer = new Buffer(bufferSize);
    let bytesRead = 0;
    // fd, buffer, offset, length, position, callback
    promisifyRead(fd, buffer, bytesRead, chunkSize, bytesRead)
        .then(
            (value) => {
              expect(value.bytesRead).toBe(chunkSize);
              closeSync(fd);
              done();
            },
            err => {
              closeSync(fd);
              fail(`should not be here with error: ${error}.`);
            });
  });

  it('fs.write should work with util.promisify', (done: DoneFn) => {
    const promisifyWrite = util.promisify(write);
    const dest = __filename + 'write';
    const fd = openSync(dest, 'a');
    const stats = fstatSync(fd);
    const chunkSize = 512;
    const buffer = new Buffer(chunkSize);
    for (let i = 0; i < chunkSize; i++) {
      buffer[i] = 0;
    }
    // fd, buffer, offset, length, position, callback
    promisifyWrite(fd, buffer, 0, chunkSize, 0)
        .then(
            (value) => {
              expect(value.bytesWritten).toBe(chunkSize);
              closeSync(fd);
              unlinkSync(dest);
              done();
            },
            err => {
              closeSync(fd);
              unlinkSync(dest);
              fail(`should not be here with error: ${error}.`);
            });
  });
});
