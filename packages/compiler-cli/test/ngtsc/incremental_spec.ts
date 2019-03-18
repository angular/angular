/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgtscTestEnvironment} from './env';

describe('ngtsc incremental compilation', () => {
  let env !: NgtscTestEnvironment;
  beforeEach(() => {
    env = NgtscTestEnvironment.setup();
    env.enableMultipleCompilations();
    env.tsconfig();
  });

  it('should compile incrementally', () => {
    env.write('service.ts', `
      import {Injectable} from '@angular/core';

      @Injectable()
      export class Service {}
    `);
    env.write('test.ts', `
      import {Component} from '@angular/core';
      import {Service} from './service';

      @Component({selector: 'cmp', template: 'cmp'})
      export class Cmp {
        constructor(service: Service) {}
      }
    `);
    env.driveMain();
    env.flushWrittenFileTracking();

    // Pretend a change was made to test.ts.
    env.invalidateCachedFile('test.ts');
    env.driveMain();
    const written = env.getFilesWrittenSinceLastFlush();

    // The component should be recompiled, but not the service.
    expect(written).toContain('/test.js');
    expect(written).not.toContain('/service.js');
  });
});