/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

fdescribe('Scoped Zone in browser', () => {
  it('setTimeout should support scoped zone', (done: DoneFn) => {
    const logs: string[] = [];
    const zone = Zone.current.fork({
      name: 'zone',
      onScheduleTask(delegate, curr, target, task) {
        logs.push(`scheduleTask ${task.type}`);
        return delegate.scheduleTask(target, task);
      }
    })
    zone.run(() => {
      setTimeout(() => {
        logs.push(Zone.current.name);
      });
    });
    Zone.disablePatch();
    zone.run(() => {
      expect(setTimeout).toEqual((window as any)[Zone.__symbol__('setTimeout')]);
      setTimeout(() => {
        logs.push(Zone.current.name);
      });
    });
    Zone.enablePatch();
    zone.run(() => {
      setTimeout(() => {
        logs.push(Zone.current.name);
      });
    });

    const patchedTimeout = setTimeout;
    const nonPatchedTimeout = (window as any)[Zone.__symbol__('setTimeout')];
    (window as any).setTimeout = function(callback: Function) {
      logs.push('custom implementation timeout');
      return nonPatchedTimeout.call(window, callback);
    };
    setTimeout(() => {
      logs.push(Zone.current.name);
    });

    expect(logs).toEqual([]);
    setTimeout(() => {
      expect(logs).toEqual(
          ['scheduleTask macroTask', 'zone', '<root>', 'scheduleTask macroTask', 'zone']);
      done();
    });
  });
});
