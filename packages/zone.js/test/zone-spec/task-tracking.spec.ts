/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {supportPatchXHROnProperty} from '../test-util';

declare const global: any;

describe('TaskTrackingZone', function() {
  let _TaskTrackingZoneSpec: typeof TaskTrackingZoneSpec = (Zone as any)['TaskTrackingZoneSpec'];
  let taskTrackingZoneSpec: TaskTrackingZoneSpec|null = null;
  let taskTrackingZone: Zone;

  beforeEach(() => {
    taskTrackingZoneSpec = new _TaskTrackingZoneSpec();
    taskTrackingZone = Zone.current.fork(taskTrackingZoneSpec);
  });

  it('should track tasks', (done: Function) => {
    taskTrackingZone.run(() => {
      taskTrackingZone.scheduleMicroTask('test1', () => {});
      expect(taskTrackingZoneSpec!.microTasks.length).toBe(1);
      expect(taskTrackingZoneSpec!.microTasks[0].source).toBe('test1');

      setTimeout(() => {});
      expect(taskTrackingZoneSpec!.macroTasks.length).toBe(1);
      expect(taskTrackingZoneSpec!.macroTasks[0].source).toBe('setTimeout');
      taskTrackingZone.cancelTask(taskTrackingZoneSpec!.macroTasks[0]);
      expect(taskTrackingZoneSpec!.macroTasks.length).toBe(0);

      setTimeout(() => {
        // assert on execution it is null
        expect(taskTrackingZoneSpec!.macroTasks.length).toBe(0);
        expect(taskTrackingZoneSpec!.microTasks.length).toBe(0);

        // If a browser does not have XMLHttpRequest, then end test here.
        if (typeof global['XMLHttpRequest'] == 'undefined') return done();
        const xhr = new XMLHttpRequest();
        xhr.open('get', '/', true);
        xhr.onreadystatechange = () => {
          if (xhr.readyState == 4) {
            // clear current event tasks using setTimeout
            setTimeout(() => {
              expect(taskTrackingZoneSpec!.macroTasks.length).toBe(0);
              expect(taskTrackingZoneSpec!.microTasks.length).toBe(0);
              if (supportPatchXHROnProperty()) {
                expect(taskTrackingZoneSpec!.eventTasks.length).not.toBe(0);
              }
              taskTrackingZoneSpec!.clearEvents();
              expect(taskTrackingZoneSpec!.eventTasks.length).toBe(0);
              done();
            });
          }
        };
        xhr.send();
        expect(taskTrackingZoneSpec!.macroTasks.length).toBe(1);
        expect(taskTrackingZoneSpec!.macroTasks[0].source).toBe('XMLHttpRequest.send');
        if (supportPatchXHROnProperty()) {
          expect(taskTrackingZoneSpec!.eventTasks[0].source)
              .toMatch(/\.addEventListener:readystatechange/);
        }
      });
    });
  });

  it('should capture task creation stacktrace', (done) => {
    taskTrackingZone.run(() => {
      setTimeout(() => {
        done();
      });
      expect((taskTrackingZoneSpec!.macroTasks[0] as any)['creationLocation']).toBeTruthy();
    });
  });
});
