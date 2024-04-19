/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, forwardRef, Host, Inject, ViewChild} from '@angular/core';
import {TestBed} from '@angular/core/testing';

// **NOTE**: More details on why tests relying on `forwardRef` are put into this
// file can be found in the `BUILD.bazel` file declaring the forward ref test target.

describe('di with forwardRef', () => {
  describe('directive injection', () => {
    it('should throw if directives try to inject each other', () => {
      @Directive({selector: '[dirB]'})
      class DirectiveB {
        constructor(@Inject(forwardRef(() => DirectiveA)) siblingDir: DirectiveA) {}
      }

      @Directive({selector: '[dirA]'})
      class DirectiveA {
        constructor(siblingDir: DirectiveB) {}
      }

      @Component({template: '<div dirA dirB></div>'})
      class MyComp {
      }

      TestBed.configureTestingModule({declarations: [DirectiveA, DirectiveB, MyComp]});
      expect(() => TestBed.createComponent(MyComp))
          .toThrowError(
              'NG0200: Circular dependency in DI detected for DirectiveA. Find more at https://angular.io/errors/NG0200');
    });

    describe('flags', () => {
      describe('@Host', () => {
        it('should find host component on the host itself', () => {
          @Directive({selector: '[dirComp]'})
          class DirectiveComp {
            constructor(@Inject(forwardRef(() => MyComp)) @Host() public comp: MyComp) {}
          }

          @Component({selector: 'my-comp', template: '<div dirComp></div>'})
          class MyComp {
            @ViewChild(DirectiveComp) dirComp!: DirectiveComp;
          }

          @Component({template: '<my-comp></my-comp>', jit: true})
          class MyApp {
            @ViewChild(MyComp) myComp!: MyComp;
          }

          TestBed.configureTestingModule({declarations: [DirectiveComp, MyComp, MyApp]});
          const fixture = TestBed.createComponent(MyApp);
          fixture.detectChanges();

          const myComp = fixture.componentInstance.myComp;
          const dirComp = myComp.dirComp;
          expect(dirComp.comp).toBe(myComp);
        });
      });
    });
  });
});
