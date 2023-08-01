/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {ɵɵconditional, ɵɵdefineComponent, ɵɵtemplate, ɵɵtext, ɵɵtextInterpolate} from '@angular/core';
import {TestBed} from '@angular/core/testing';

describe('control flow', () => {
  describe('if', () => {
    function App_ng_template_0_Template(rf: number, ctx: unknown) {
      if (rf & 1) {
        ɵɵtext(0, 'Something');
      }
    }
    function App_ng_template_1_Template(rf: number, ctx: unknown) {
      if (rf & 1) {
        ɵɵtext(0, 'Nothing');
      }
    }

    it('should add and remove views based on conditions change', () => {
      class TestComponent {
        show = true;
        static ɵcmp = ɵɵdefineComponent({
          type: TestComponent,
          selectors: [['some-cmp']],
          decls: 2,
          vars: 1,
          template:
              function TestComponent_Template(rf: number, ctx: any) {
                if (rf & 1) {
                  ɵɵtemplate(0, App_ng_template_0_Template, 1, 0);
                  ɵɵtemplate(1, App_ng_template_1_Template, 1, 0);
                }
                if (rf & 2) {
                  ɵɵconditional(0, ctx.show ? 0 : 1);
                }
              },
          encapsulation: 2
        });
        static ɵfac = function TestComponent_Factory(t: any) {
          return new (t || TestComponent)();
        };
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('Something');

      fixture.componentInstance.show = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Nothing');
    });

    it('should expose expression value in context', () => {
      function App_ng_template_0_Template(rf: number, ctx: any) {
        if (rf & 1) {
          ɵɵtext(0, 'Something');
        }
        if (rf & 2) {
          ɵɵtextInterpolate(ctx);
        }
      }

      class TestComponent {
        show: any = true;
        static ɵcmp = ɵɵdefineComponent({
          type: TestComponent,
          selectors: [['some-cmp']],
          decls: 2,
          vars: 1,
          template:
              function TestComponent_Template(rf: number, ctx: any) {
                if (rf & 1) {
                  ɵɵtemplate(0, App_ng_template_0_Template, 1, 1);
                }
                if (rf & 2) {
                  let temp: any;
                  ɵɵconditional(0, (temp = ctx.show) ? 0 : -1, temp);
                }
              },
          encapsulation: 2
        });
        static ɵfac = function TestComponent_Factory(t: any) {
          return new (t || TestComponent)();
        };
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('true');

      fixture.componentInstance.show = 1;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1');
    });

    it('should destroy all views if there is nothing to display', () => {
      class TestComponent {
        show = true;
        static ɵcmp = ɵɵdefineComponent({
          type: TestComponent,
          selectors: [['some-cmp']],
          decls: 1,
          vars: 1,
          template:
              function TestComponent_Template(rf: number, ctx: any) {
                if (rf & 1) {
                  // QUESTION: fundamental mismatch between the "template" and "container" concepts
                  // those 2 calls to the ɵɵtemplate instruction will generate comment nodes and
                  // LContainer
                  ɵɵtemplate(0, App_ng_template_0_Template, 1, 0);
                }
                if (rf & 2) {
                  ɵɵconditional(0, ctx.show ? 0 : -1);
                }
              },
          encapsulation: 2
        });
        static ɵfac = function TestComponent_Factory(t: any) {
          return new (t || TestComponent)();
        };
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('Something');

      fixture.componentInstance.show = false;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('');
    });
  });

  describe('switch', () => {
    function App_ng_template_0_Template(rf: number, ctx: unknown) {
      if (rf & 1) {
        ɵɵtext(0, 'case 0');
      }
    }

    function App_ng_template_1_Template(rf: number, ctx: unknown) {
      if (rf & 1) {
        ɵɵtext(0, 'case 1');
      }
    }

    function App_ng_template_default_Template(rf: number, ctx: unknown) {
      if (rf & 1) {
        ɵɵtext(0, 'default');
      }
    }

    it('should show a template based on a matching case', () => {
      class TestComponent {
        case = 0;
        static ɵcmp = ɵɵdefineComponent({
          type: TestComponent,
          selectors: [['some-cmp']],
          decls: 3,
          vars: 1,
          template:
              function TestComponent_Template(rf: number, ctx: any) {
                if (rf & 1) {
                  ɵɵtemplate(0, App_ng_template_0_Template, 1, 0);
                  ɵɵtemplate(1, App_ng_template_1_Template, 1, 0);
                  ɵɵtemplate(2, App_ng_template_default_Template, 1, 0);
                }
                if (rf & 2) {
                  const expValue = ctx.case;
                  // Open question: == vs. === for comparison
                  // == is the current Angular implementation
                  // === is used by JavaScript semantics
                  ɵɵconditional(0, expValue === 0 ? 0 : expValue === 1 ? 1 : 2);
                }
              },
          encapsulation: 2
        });
        static ɵfac = function TestComponent_Factory(t: any) {
          return new (t || TestComponent)();
        };
      }

      const fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toBe('case 0');

      fixture.componentInstance.case = 1;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('case 1');

      fixture.componentInstance.case = 5;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('default');
    });
  });
});
