/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '@angular/core';
import {TestBed} from '@angular/core/testing';

import {$INJECTOR} from '../../../src/common/src/constants';
import {withEachNg1Version} from '../../../src/common/test/helpers/common_test_helpers';
import {createAngularTestingModule} from '../src/create_angular_testing_module';

import {AppModule, Inventory, defineAppModule, serverRequestInstance} from './mocks';

withEachNg1Version(() => {
  describe('Angular entry point', () => {
    it('should allow us to get an upgraded AngularJS service from an Angular service', () => {
      defineAppModule();
      // Configure an NgModule that has the Angular and AngularJS injectors wired up
      TestBed.configureTestingModule({imports: [createAngularTestingModule(['app']), AppModule]});
      const inventory = TestBed.get(Inventory) as Inventory;
      expect(inventory.serverRequest).toBe(serverRequestInstance);
    });

    it('should create new injectors when we re-use the helper', () => {
      defineAppModule();
      TestBed.configureTestingModule({imports: [createAngularTestingModule(['app']), AppModule]});
      // Check that the injectors are wired up correctly
      TestBed.get(Inventory) as Inventory;

      // Grab references to the current injectors
      const injector = TestBed.get(Injector);
      const $injector = TestBed.get($INJECTOR);

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({imports: [createAngularTestingModule(['app']), AppModule]});
      // Check that the injectors are wired up correctly
      TestBed.get(Inventory) as Inventory;

      // Check that the new injectors are different to the previous ones.
      expect(TestBed.get(Injector)).not.toBe(injector);
      expect(TestBed.get($INJECTOR)).not.toBe($injector);
    });
  });
});
