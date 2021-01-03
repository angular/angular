/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TestBed} from '@angular/core/testing';

import {RouterTestingModule} from '../../testing';

import {AotRouterModule, ROUTES} from './aot_router_module';
import {AotRouterModuleNgSummary} from './aot_router_module.ngsummary';

describe('The Aot Routing Component', () => {
  it('should be able to compile the components while using aotSummaries', () => {
    TestBed
        .configureTestingModule({
          imports: [
            AotRouterModule,
            RouterTestingModule.withRoutes(ROUTES),
          ],
          aotSummaries: () => [AotRouterModuleNgSummary],
        })
        .compileComponents();
  });
});
