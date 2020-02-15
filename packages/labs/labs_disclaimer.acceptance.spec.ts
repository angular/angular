/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {iWantToUseExperimentalAPIs} from '@angular/labs';

describe('acceptance test support', () => {
  beforeEach(() => {
    // reset acceptance
    expect(() => iWantToUseExperimentalAPIs(null as any)).toThrow();
  });
  it('should demonstrate that acceptance test works', () => {
    @Component({template: `agreement: {{accepted ? 'accepted': 'rejected'}}`})
    class MyComponent {
      constructor() {
        iWantToUseExperimentalAPIs({iUnderstand: ['not ready for production', 'unstable API']});
      }
      get accepted() { return (global as any).__ng_core_labs_agreement__; }
    }
    TestBed.configureTestingModule({declarations: [MyComponent]});
    const fixture = TestBed.createComponent(MyComponent);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).innerHTML).toEqual('agreement: accepted');
  });

});