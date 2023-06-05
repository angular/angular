/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵɵdefineComponent as defineComponent, ɵɵelement as element, ɵɵpropertyCreate as propertyCreate} from '@angular/core';
import {TestBed} from '@angular/core/testing';


describe('virtual instructions', () => {
  it('should work', () => {
    class TestCmp {
      value = 'hello';

      static ɵfac = () => new TestCmp();
      static ɵcmp = defineComponent({
        type: TestCmp,
        template:
            function TestCmp_Template(rf, ctx) {
              if (rf & 1) {
                element(0, 'input');
                propertyCreate(1, 'value', () => ctx.value);
              }
            },
        decls: 2,
        vars: 1,
        standalone: true,
        selectors: [['test-cmp']],
      });
    }

    const fixture = TestBed.createComponent(TestCmp);
    const el = fixture.nativeElement.firstChild as HTMLInputElement;
    fixture.detectChanges();

    expect(el.value).toEqual('hello');

    fixture.componentInstance.value = 'bye';
    fixture.detectChanges();
    expect(el.value).toEqual('bye');
  });
});
