/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AsyncStackTaggingZoneSpec} from '../../src/zone/async-stack-tagging';

describe('AsyncTaggingConsoleTest', () => {
  describe('should call console async stack tagging API', () => {
    const startAsyncTaskSpy = jasmine.createSpy('startAsyncTask');
    const finishAsyncTaskSpy = jasmine.createSpy('finishAsyncTask');
    const scheduleAsyncTaskSpy = jasmine.createSpy('scheduleAsyncTask').and.callFake(() => {
      return {
        run: (f: () => unknown) => {
          startAsyncTaskSpy();
          const retval = f();
          finishAsyncTaskSpy();
          return retval;
        },
      };
    });

    let asyncStackTaggingZone: Zone;

    beforeEach(() => {
      scheduleAsyncTaskSpy.calls.reset();
      startAsyncTaskSpy.calls.reset();
      finishAsyncTaskSpy.calls.reset();
      asyncStackTaggingZone = Zone.current.fork(new AsyncStackTaggingZoneSpec('test', {
        createTask: scheduleAsyncTaskSpy,
      }));
    });

    it('setTimeout', (done: DoneFn) => {
      asyncStackTaggingZone.run(() => {
        setTimeout(() => {});
      });
      setTimeout(() => {
        expect(scheduleAsyncTaskSpy).toHaveBeenCalledWith('Zone - setTimeout');
        expect(startAsyncTaskSpy.calls.count()).toBe(1);
        expect(finishAsyncTaskSpy.calls.count()).toBe(1);
        done();
      });
    });

    it('clearTimeout', (done: DoneFn) => {
      asyncStackTaggingZone.run(() => {
        const id = setTimeout(() => {});
        clearTimeout(id);
      });
      setTimeout(() => {
        expect(scheduleAsyncTaskSpy).toHaveBeenCalledWith('Zone - setTimeout');
        expect(startAsyncTaskSpy).not.toHaveBeenCalled();
        expect(finishAsyncTaskSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('setInterval', (done: DoneFn) => {
      asyncStackTaggingZone.run(() => {
        let count = 0;
        const id = setInterval(() => {
          count++;
          if (count === 2) {
            clearInterval(id);
          }
        }, 10);
      });
      setTimeout(() => {
        expect(scheduleAsyncTaskSpy).toHaveBeenCalledWith('Zone - setInterval');
        expect(startAsyncTaskSpy.calls.count()).toBe(2);
        expect(finishAsyncTaskSpy.calls.count()).toBe(2);
        done();
      }, 50);
    });

    it('Promise', (done: DoneFn) => {
      asyncStackTaggingZone.run(() => {
        Promise.resolve(1).then(() => {});
      });
      setTimeout(() => {
        expect(scheduleAsyncTaskSpy).toHaveBeenCalledWith('Zone - Promise.then');
        expect(startAsyncTaskSpy.calls.count()).toBe(1);
        expect(finishAsyncTaskSpy.calls.count()).toBe(1);
        done();
      });
    });

    if (global.XMLHttpRequest) {
      it('XMLHttpRequest', (done: DoneFn) => {
        asyncStackTaggingZone.run(() => {
          const req = new XMLHttpRequest();
          req.onload = () => {
            Zone.root.run(() => {
              setTimeout(() => {
                expect(scheduleAsyncTaskSpy.calls.all()[0].args).toEqual([
                  'Zone - XMLHttpRequest.addEventListener:load',
                ]);
                expect(scheduleAsyncTaskSpy.calls.all()[1].args).toEqual([
                  'Zone - XMLHttpRequest.send',
                ]);
                expect(startAsyncTaskSpy.calls.count()).toBe(2);
                expect(finishAsyncTaskSpy.calls.count()).toBe(2);
                done();
              });
            });
          };
          req.open('get', '/', true);
          req.send();
        });
      });
    }

    // Only run test when addEventListener is patched by zone.js
    if (document && document.addEventListener &&
        (document.addEventListener as any)[Zone.__symbol__('OriginalDelegate')]) {
      it('button click', () => {
        asyncStackTaggingZone.run(() => {
          const button = document.createElement('button');
          const clickEvent = document.createEvent('Event');
          clickEvent.initEvent('click', true, true);
          document.body.appendChild(button);
          const handler = () => {};
          button.addEventListener('click', handler);
          button.dispatchEvent(clickEvent);
          button.dispatchEvent(clickEvent);
          button.removeEventListener('click', handler);
          expect(scheduleAsyncTaskSpy)
              .toHaveBeenCalledWith('Zone - HTMLButtonElement.addEventListener:click');
          expect(startAsyncTaskSpy.calls.count()).toBe(2);
          expect(finishAsyncTaskSpy.calls.count()).toBe(2);
        });
      });
    }
  });
});
