/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ifEnvSupports, ifEnvSupportsWithDone} from '../test-util';

describe('AsyncTaggingConsoleTest', () => {
  const AsyncStackTaggingZoneSpec = (Zone as any)['AsyncStackTaggingZoneSpec'];

  describe('should call console async stack tagging API', () => {
    let idx = 1;
    const scheduleAsyncTaskSpy = jasmine.createSpy('scheduleAsyncTask').and.callFake(() => {
      return idx++;
    });
    const startAsyncTaskSpy = jasmine.createSpy('startAsyncTask');
    const finishAsyncTaskSpy = jasmine.createSpy('finishAsyncTask');
    const cancelAsyncTaskSpy = jasmine.createSpy('cancelAsyncTask');
    let asyncStackTaggingZone: Zone;

    beforeEach(() => {
      scheduleAsyncTaskSpy.calls.reset();
      startAsyncTaskSpy.calls.reset();
      finishAsyncTaskSpy.calls.reset();
      cancelAsyncTaskSpy.calls.reset();
      asyncStackTaggingZone = Zone.current.fork(new AsyncStackTaggingZoneSpec('test', {
        scheduleAsyncTask: scheduleAsyncTaskSpy,
        startAsyncTask: startAsyncTaskSpy,
        finishAsyncTask: finishAsyncTaskSpy,
        cancelAsyncTask: cancelAsyncTaskSpy,
      }));
    });
    it('setTimeout', (done: DoneFn) => {
      asyncStackTaggingZone.run(() => {
        setTimeout(() => {});
      });
      setTimeout(() => {
        expect(scheduleAsyncTaskSpy).toHaveBeenCalledWith('setTimeout', false);
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
        expect(scheduleAsyncTaskSpy).toHaveBeenCalledWith('setTimeout', false);
        expect(startAsyncTaskSpy).not.toHaveBeenCalled();
        expect(finishAsyncTaskSpy).not.toHaveBeenCalled();
        expect(cancelAsyncTaskSpy.calls.count()).toBe(1);
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
        expect(scheduleAsyncTaskSpy).toHaveBeenCalledWith('setInterval', true);
        expect(startAsyncTaskSpy.calls.count()).toBe(2);
        expect(finishAsyncTaskSpy.calls.count()).toBe(1);
        expect(cancelAsyncTaskSpy.calls.count()).toBe(1);
        done();
      }, 50);
    });
    it('Promise', (done: DoneFn) => {
      asyncStackTaggingZone.run(() => {
        Promise.resolve(1).then(() => {});
      });
      setTimeout(() => {
        expect(scheduleAsyncTaskSpy).toHaveBeenCalledWith('Promise.then', false);
        expect(startAsyncTaskSpy.calls.count()).toBe(1);
        expect(finishAsyncTaskSpy.calls.count()).toBe(1);
        done();
      });
    });

    it('XMLHttpRequest', ifEnvSupportsWithDone('XMLHttpRequest', (done: DoneFn) => {
         asyncStackTaggingZone.run(() => {
           const req = new XMLHttpRequest();
           req.onload = () => {
             Zone.root.run(() => {
               setTimeout(() => {
                 expect(scheduleAsyncTaskSpy.calls.all()[0].args).toEqual([
                   'XMLHttpRequest.addEventListener:load',
                   true,
                 ]);
                 expect(scheduleAsyncTaskSpy.calls.all()[1].args).toEqual([
                   'XMLHttpRequest.send',
                   false,
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
       }));

    it('button click', ifEnvSupports('document', () => {
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
               .toHaveBeenCalledWith('HTMLButtonElement.addEventListener:click', true);
           expect(startAsyncTaskSpy.calls.count()).toBe(2);
           expect(finishAsyncTaskSpy.calls.count()).toBe(2);
           expect(cancelAsyncTaskSpy.calls.count()).toBe(1);
         });
       }));
  });
});
