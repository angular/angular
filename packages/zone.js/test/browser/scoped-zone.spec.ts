/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

describe('Scoped Zone in browser', () => {
  const tests = [
    {
      name: 'setTimeout should support scoped zone',
      scheduler: (callback: Function) => {
        setTimeout(callback);
      },
      getAPIObject: () => window,
      getAPIName: () => 'setTimeout',
      getResults: (idx: number) => {
        return idx === 0 ?
            [
              'scheduleTask macroTask',
              'scheduleTask macroTask',
              'custom implementation',
            ] :
            [
              'scheduleTask macroTask',
              'scheduleTask macroTask',
              'custom implementation',
              'custom implementation',
              'zone',
              '<root>',
              'zone',
              '<root>',
            ];
      }
    },
    {
      name: 'Promise.prototype.then should support scoped zone',
      scheduler: (callback: Function) => {
        Promise.resolve(1).then(callback as any);
      },
      getAPIObject: () => 'Promise',
      getAPIName: () => 'then',
      getResults: (idx: number) => {
        return idx === 0 ?
            [
              'scheduleTask microTask',
              'scheduleTask microTask',
            ] :
            [
              'scheduleTask microTask',
              'scheduleTask microTask',
              'zone',
              'zone',
              '<root>',
            ];
      }
    },
  ];
  tests.forEach(test => {
    it(test.name, (done: DoneFn) => {
      const obj: any = test.getAPIObject();
      const api: any = test.getAPIName();

      const logs: string[] = [];
      const zone = Zone.current.fork({
        name: 'zone',
        onScheduleTask(delegate, curr, target, task) {
          logs.push(`scheduleTask ${task.type}`);
          return delegate.scheduleTask(target, task);
        },
      });
      zone.run(() => {
        test.scheduler(() => {
          logs.push(Zone.current.name);
        });
      });
      Zone.disablePatch();
      zone.run(() => {
        if (obj === 'Promise') {
          expect(window['Promise']).toEqual((window as any)[Zone.__symbol__('Promise')]);
        } else {
          expect(obj[api]).toEqual(obj[Zone.__symbol__(api)]);
        }
        test.scheduler(() => {
          logs.push(Zone.current.name);
        });
      });
      Zone.enablePatch();
      zone.run(() => {
        test.scheduler(() => {
          logs.push(Zone.current.name);
        });
      });

      const patched = obj[api];
      if (obj !== 'Promise') {
        const nonPatched = obj[Zone.__symbol__(api)];
        obj[api] = function() {
          logs.push('custom implementation');
          return nonPatched.apply(this, arguments);
        };
        obj[api](() => {
          logs.push(Zone.current.name);
        });
      }

      expect(logs).toEqual(test.getResults(0));
      setTimeout(() => {
        expect(logs).toEqual(test.getResults(1));
        if (obj !== 'Promise') {
          obj[api] = patched;
        }
        done();
      });
    });
  });
});
