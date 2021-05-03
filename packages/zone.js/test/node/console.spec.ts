/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
describe('node console', () => {
  const log: string[] = [];
  const zone = Zone.current.fork({
    name: 'console',
    onScheduleTask: function(
        delegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task) {
      log.push(task.source);
      return delegate.scheduleTask(targetZone, task);
    }
  });

  beforeEach(() => {
    log.length = 0;
  });

  it('console methods should run in root zone', () => {
    zone.run(() => {
      console.log('test');
      console.warn('test');
      console.error('test');
      console.info('test');
      console.trace('test');
      try {
        console.assert(false, 'test');
      } catch (error) {
      }
      console.dir('.');
      console.time('start');
      console.timeEnd('start');
      console.debug && console.debug('test');
    });
    expect(log).toEqual([]);
  });
});
