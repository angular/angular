/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// #docplaster
// #docregion hash_location_strategy
import {HashLocationStrategy, LocationStrategy} from '@angular/common';
import {NgModule} from '@angular/core';

// #enddocregion hash_location_strategy
import {TestBed} from '@angular/core/testing';

// #docregion hash_location_strategy
@NgModule({providers: [{provide: LocationStrategy, useClass: HashLocationStrategy}]})
class AppModule {
}
// #enddocregion hash_location_strategy
export function main() {
  describe('hash_location_strategy examples', () => {
    let locationStrategy: HashLocationStrategy;

    beforeEach(() => {
      locationStrategy =
          TestBed.configureTestingModule({imports: [AppModule]}).get(LocationStrategy);
    });

    it('hash_location_strategy example works',
       () => { expect(locationStrategy.prepareExternalUrl('app/foo')).toBe('#app/foo'); });
  });
}
