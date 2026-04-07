/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// #docregion angular-setup
import {TestBed} from '@angular/core/testing';
import {
  createAngularJSTestingModule,
  createAngularTestingModule,
} from '@angular/upgrade/static/testing';

import {HeroesService, ng1AppModule, Ng2AppModule} from './module';

const {module, inject} = (window as any).angular.mock;

// #enddocregion angular-setup
describe('HeroesService (from Angular)', () => {
  // #docregion angular-setup
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [createAngularTestingModule([ng1AppModule.name]), Ng2AppModule],
    });
  });
  // #enddocregion angular-setup

  // #docregion angular-spec
  it('should have access to the HeroesService', () => {
    const heroesService = TestBed.inject(HeroesService);
    expect(heroesService).toBeDefined();
  });
  // #enddocregion angular-spec
});

describe('HeroesService (from AngularJS)', () => {
  // #docregion angularjs-setup
  beforeEach(module(createAngularJSTestingModule([Ng2AppModule])));
  beforeEach(module(ng1AppModule.name));
  // #enddocregion angularjs-setup

  // #docregion angularjs-spec
  it('should have access to the HeroesService', inject((heroesService: HeroesService) => {
    expect(heroesService).toBeDefined();
  }));
  // #enddocregion angularjs-spec
});
