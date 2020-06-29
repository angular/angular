/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getAngularJSGlobal} from '../../../src/common/src/angular1';
import {withEachNg1Version} from '../../../src/common/test/helpers/common_test_helpers';
import {createAngularJSTestingModule} from '../src/create_angularjs_testing_module';

import {AppModule, defineAppModule, Inventory} from './mocks';


withEachNg1Version(() => {
  describe('AngularJS entry point', () => {
    it('should allow us to get a downgraded Angular service from an AngularJS service', () => {
      defineAppModule();
      // We have to get the `mock` object from the global `angular` variable, rather than trying to
      // import it from `@angular/upgrade/src/common/angular1`, because that file doesn't export
      // `ngMock` helpers.
      const {inject, module} = getAngularJSGlobal().mock;
      // Load the AngularJS bits of the application
      module('app');
      // Configure an AngularJS module that has the AngularJS and Angular injector wired up
      module(createAngularJSTestingModule([AppModule]));
      let inventory: any = undefined;
      inject(function(shoppingCart: any) {
        inventory = shoppingCart.inventory;
      });
      expect(inventory).toEqual(jasmine.any(Inventory));
    });
  });
});
