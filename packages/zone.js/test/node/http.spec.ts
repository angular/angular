/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import http from 'http';

describe('http test', () => {
  it('http.request should be patched as eventTask', (done) => {
    const server = http.createServer((req: any, res: any) => {
      res.end();
    });
    server.listen(9999, () => {
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
        const req = http.request(
          {hostname: 'localhost', port: '9999', method: 'GET'},
          (res: any) => {
            expect(Zone.current.name).toEqual('A');
            expect(zoneASpec.onScheduleTask).toHaveBeenCalled();
            server.close(() => {
              done();
            });
          },
        );
        req.end();
      });
    });
  });
});
