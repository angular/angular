/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TestBed} from '../../testing';
import {
  RenderFlags,
  ɵɵadvance,
  ɵɵattachSourceLocations,
  ɵɵconditional,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵtemplate,
  ɵɵtext,
} from '../../src/render3';
import {Directive} from '../../src/core';

// The `ɵɵattachSourceLocation` calls are produced only in
// AoT so these tests need to "be compiled manually".
describe('attaching source locations', () => {
  it('should attach the source location to DOM nodes', () => {
    // @Component({
    //   selector: 'comp',
    //   template: \`
    //     <div>
    //       <span>
    //         @if (true) {
    //           <strong>Hello</strong>
    //         }
    //       </span>
    //     </div>
    //   \`,
    // })
    // class Comp {}
    function conditionalTemplate(rf: number) {
      if (rf & RenderFlags.Create) {
        ɵɵelementStart(0, 'strong');
        ɵɵtext(1, 'Hello');
        ɵɵelementEnd();
        ɵɵattachSourceLocations('test.ts', [[0, 240, 9, 22]]);
      }
    }

    class Comp {
      static ɵfac = () => new Comp();
      static ɵcmp = ɵɵdefineComponent({
        type: Comp,
        selectors: [['comp']],
        decls: 3,
        vars: 1,
        template: (rf) => {
          if (rf & RenderFlags.Create) {
            ɵɵelementStart(0, 'div')(1, 'span');
            ɵɵtemplate(2, conditionalTemplate, 2, 0, 'strong');
            ɵɵelementEnd()();
            ɵɵattachSourceLocations('test.ts', [
              [0, 154, 6, 16],
              [1, 178, 7, 18],
            ]);
          }
          if (rf & 2) {
            ɵɵadvance(2);
            ɵɵconditional(true ? 2 : -1);
          }
        },
        encapsulation: 2,
      });
    }

    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();
    const content = fixture.nativeElement.innerHTML;
    expect(content).toContain('<div data-ng-source-location="test.ts@o:154,l:6,c:16">');
    expect(content).toContain('<span data-ng-source-location="test.ts@o:178,l:7,c:18">');
    expect(content).toContain('<strong data-ng-source-location="test.ts@o:240,l:9,c:22">');
  });

  it('should not match directives on the data-ng-source-location attribute', () => {
    let isUsed = false;

    @Directive({selector: '[data-ng-source-location]'})
    class Dir {
      constructor() {
        isUsed = true;
      }
    }

    // @Component({
    //   selector: 'comp',
    //   template: '<div></div>',
    //   imports: [Dir],
    // })
    // class Comp {}
    class Comp {
      static ɵfac = () => new Comp();
      static ɵcmp = ɵɵdefineComponent({
        type: Comp,
        selectors: [['comp']],
        dependencies: [Dir],
        decls: 1,
        vars: 0,
        template: (rf) => {
          if (rf & 1) {
            ɵɵelement(0, 'div');
            ɵɵattachSourceLocations('test.ts', [[0, 231, 8, 23]]);
          }
        },
        encapsulation: 2,
      });
    }

    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div data-ng-source-location="test.ts@o:231,l:8,c:23">',
    );
    expect(isUsed).toBe(false);
  });

  it('should not overwrite a pre-existing data-ng-source-location attribute', () => {
    // @Component({
    //   selector: 'comp',
    //   template: '<div data-ng-source-location="pre-existing"></div>',
    // })
    // class Comp {}
    class Comp {
      static ɵfac = () => new Comp();
      static ɵcmp = ɵɵdefineComponent({
        type: Comp,
        selectors: [['comp']],
        decls: 1,
        vars: 0,
        consts: [['data-ng-source-location', 'pre-existing']],
        template: (rf) => {
          if (rf & 1) {
            ɵɵelement(0, 'div', 0);
            ɵɵattachSourceLocations('test.ts', [[0, 140, 5, 23]]);
          }
        },
        encapsulation: 2,
      });
    }

    const fixture = TestBed.createComponent(Comp);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain(
      '<div data-ng-source-location="pre-existing">',
    );
  });
});
