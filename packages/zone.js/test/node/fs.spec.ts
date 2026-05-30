/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  closeSync,
  exists,
  fstatSync,
  openSync,
  read,
  realpath,
  unlink,
  unlinkSync,
  unwatchFile,
  watch,
  watchFile,
  write,
  writeFile,
  writeFileSync,
  rmSync,
  mkdtempSync,
} from 'fs';
import {join} from 'path';
import {tmpdir} from 'os';
import util from 'util';

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
        onScheduleTask: (
          delegate: ZoneDelegate,
          currentZone: Zone,
          targetZone: Zone,
          task: Task,
        ): Task => {
          return delegate.scheduleTask(targetZone, task);
        },
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

    it('has patched realpath as macroTask', (done) => {
      const testZoneSpec = {
        name: 'test',
        onScheduleTask: (
          delegate: ZoneDelegate,
          currentZone: Zone,
          targetZone: Zone,
          task: Task,
        ): Task => {
          return delegate.scheduleTask(targetZone, task);
        },
      };
      const testZone = Zone.current.fork(testZoneSpec);
      spyOn(testZoneSpec, 'onScheduleTask').and.callThrough();
      testZone.run(() => {
        realpath('testfile', () => {
          expect(Zone.current).toBe(testZone);
          expect(testZoneSpec.onScheduleTask).toHaveBeenCalled();
          done();
        });
      });
    });

    // https://github.com/angular/angular/issues/45546
    // Note that this is intentionally marked with `xit` because `realpath.native`
    // is patched by Bazel's `node_patches.js` and doesn't allow further patching
    // of `realpath.native` in unit tests. Essentially, there's no original delegate
    // for `realpath` because it's also patched. The code below functions correctly
    // in the actual production environment.
    xit('has patched realpath.native as macroTask', (done) => {
      const testZoneSpec = {
        name: 'test',
        onScheduleTask: (
          delegate: ZoneDelegate,
          currentZone: Zone,
          targetZone: Zone,
          task: Task,
        ): Task => {
          return delegate.scheduleTask(targetZone, task);
        },
      };
      const testZone = Zone.current.fork(testZoneSpec);
      spyOn(testZoneSpec, 'onScheduleTask').and.callThrough();
      testZone.run(() => {
        realpath.native('testfile', () => {
          expect(Zone.current).toBe(testZone);
          expect(testZoneSpec.onScheduleTask).toHaveBeenCalled();
          done();
        });
      });
    });
  });

  describe('watcher related methods test', () => {
    const zoneASpec = {
      name: 'A',
      onScheduleTask: (
        delegate: ZoneDelegate,
        currentZone: Zone,
        targetZone: Zone,
        task: Task,
      ): Task => {
        return delegate.scheduleTask(targetZone, task);
      },
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
  let tmpDir: string;
  beforeAll(() => {
    tmpDir = mkdtempSync(join(process.env['TEST_TMPDIR']!, 'zone-fs-test-'));
  });

  it('fs.exists should work with util.promisify', (done: DoneFn) => {
    const promisifyExists = util.promisify(exists);
    promisifyExists(tmpDir).then(
      (r) => {
        expect(r).toBe(true);
        done();
      },
      (err) => {
        fail(`should not be here with error: ${err}`);
      },
    );
  });

  it('fs.realpath should work with util.promisify', (done: DoneFn) => {
    const promisifyRealpath = util.promisify(realpath);
    promisifyRealpath(tmpDir).then(
      (r) => {
        expect(r).toBeDefined();
        done();
      },
      (err) => {
        fail(`should not be here with error: ${err}`);
      },
    );
  });

  it('fs.realpath.native should work with util.promisify', (done: DoneFn) => {
    const promisifyRealpathNative = util.promisify(realpath.native);
    promisifyRealpathNative(tmpDir).then(
      (r) => {
        expect(r).toBeDefined();
        done();
      },
      (err) => {
        fail(`should not be here with error: ${err}`);
      },
    );
  });

  it('fs.read should work with util.promisify', (done: DoneFn) => {
    const readFilePath = join(tmpDir, 'readCheckFile');
    const promisifyRead = util.promisify(read);
    writeFileSync(
      readFilePath,
      `This is a file that was placed for a test, it's file size is 63`,
      'utf-8',
    );
    const fd = openSync(readFilePath, 'r');
    const stats = fstatSync(fd);
    const bufferSize = stats.size;
    // We read a chunk that we know is smaller than the file size.
    const chunkSize = 60;
    const buffer = new Buffer(bufferSize);
    let bytesRead = 0;
    // fd, buffer, offset, length, position, callback
    promisifyRead(fd, buffer, bytesRead, chunkSize, bytesRead).then(
      (value) => {
        expect(value.bytesRead).toBe(chunkSize);
        closeSync(fd);
        done();
      },
      (err) => {
        closeSync(fd);
        fail(`should not be here with error: ${err}.`);
      },
    );
  });

  it('fs.write should work with util.promisify', (done: DoneFn) => {
    const promisifyWrite = util.promisify(write);
    const dest = join(tmpDir, 'write');
    const fd = openSync(dest, 'a');
    const stats = fstatSync(fd);
    const chunkSize = 512;
    const buffer = new Buffer(chunkSize);
    for (let i = 0; i < chunkSize; i++) {
      buffer[i] = 0;
    }
    // fd, buffer, offset, length, position, callback
    promisifyWrite(fd, buffer, 0, chunkSize, 0).then(
      (value) => {
        expect(value.bytesWritten).toBe(chunkSize);
        closeSync(fd);
        unlinkSync(dest);
        done();
      },
      (err) => {
        closeSync(fd);
        unlinkSync(dest);
        fail(`should not be here with error: ${err}.`);
      },
    );
  });
});
