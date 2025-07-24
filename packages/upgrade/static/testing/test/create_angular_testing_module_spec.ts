/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {$INJECTOR} from '../../../src/common/src/constants';
import {withEachNg1Version} from '../../../src/common/test/helpers/common_test_helpers';
import {createAngularTestingModule} from '../src/create_angular_testing_module';

import {AppModule, defineAppModule, Inventory, serverRequestInstance} from './mocks';

withEachNg1Version(() => {
  describe('Angular entry point', () => {
    it('should allow us to get an upgraded AngularJS service from an Angular service', () => {
      defineAppModule();
      // Configure an NgModule that has the Angular and AngularJS injectors wired up
      TestBed.configureTestingModule({imports: [createAngularTestingModule(['app']), AppModule]});
      const inventory = TestBed.inject(Inventory);
      expect(inventory.serverRequest).toBe(serverRequestInstance);
    });

    it('should create new injectors when we re-use the helper', () => {
      defineAppModule();
      TestBed.configureTestingModule({imports: [createAngularTestingModule(['app']), AppModule]});
      // Check that the injectors are wired up correctly
      TestBed.inject(Inventory);

      // Grab references to the current injectors
      const injector = TestBed.inject(Injector);
      const $injector = TestBed.inject($INJECTOR as any);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({imports: [createAngularTestingModule(['app']), AppModule]});
      // Check that the injectors are wired up correctly
      TestBed.inject(Inventory);

      // Check that the new injectors are different to the previous ones.
      expect(TestBed.inject(Injector)).not.toBe(injector);
      expect(TestBed.inject($INJECTOR as any)).not.toBe($injector);
    });
  });
});
