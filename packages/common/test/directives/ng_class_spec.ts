/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';

{
  describe('binding to CSS class list', () => {
    let fixture: ComponentFixture<any>|null;

    function normalizeClassNames(classes: string) {
      return classes.trim().split(' ').sort().join(' ');
    }

    function detectChangesAndExpectClassName(classes: string): void {
      fixture!.detectChanges();
      let nonNormalizedClassName = fixture!.debugElement.children[0].nativeElement.className;
      expect(normalizeClassNames(nonNormalizedClassName)).toEqual(normalizeClassNames(classes));
    }

    function getComponent(): TestComponent {
      return fixture!.debugElement.componentInstance;
    }

    afterEach(() => {
      fixture = null;
    });

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
      });
    });

    it('should clean up when the directive is destroyed', waitForAsync(() => {
         fixture = createTestComponent('<div *ngFor="let item of items" [ngClass]="item"></div>');

         getComponent().items = [['0']];
         fixture.detectChanges();
         getComponent().items = [['1']];
         detectChangesAndExpectClassName('1');
       }));

    describe('expressions evaluating to objects', () => {
      it('should add classes specified in an object literal', waitForAsync(() => {
           fixture = createTestComponent('<div [ngClass]="{foo: true, bar: false}"></div>');

           detectChangesAndExpectClassName('foo');
         }));

      it('should add classes specified in an object literal without change in class names',
         waitForAsync(() => {
           fixture =
               createTestComponent(`<div [ngClass]="{'foo-bar': true, 'fooBar': true}"></div>`);

           detectChangesAndExpectClassName('foo-bar fooBar');
         }));

      it('should add and remove classes based on changes in object literal values',
         waitForAsync(() => {
           fixture =
               createTestComponent('<div [ngClass]="{foo: condition, bar: !condition}"></div>');

           detectChangesAndExpectClassName('foo');

           getComponent().condition = false;
           detectChangesAndExpectClassName('bar');
         }));

      it('should add and remove classes based on changes to the expression object',
         waitForAsync(() => {
           fixture = createTestComponent('<div [ngClass]="objExpr"></div>');
           const objExpr = getComponent().objExpr;

           detectChangesAndExpectClassName('foo');

           objExpr!['bar'] = true;
           detectChangesAndExpectClassName('foo bar');

           objExpr!['baz'] = true;
           detectChangesAndExpectClassName('foo bar baz');

           delete (objExpr!['bar']);
           detectChangesAndExpectClassName('foo baz');
         }));

      it('should add and remove classes based on reference changes to the expression object',
         waitForAsync(() => {
           fixture = createTestComponent('<div [ngClass]="objExpr"></div>');

           detectChangesAndExpectClassName('foo');

           getComponent().objExpr = {foo: true, bar: true};
           detectChangesAndExpectClassName('foo bar');

           getComponent().objExpr = {baz: true};
           detectChangesAndExpectClassName('baz');
         }));

      it('should remove active classes when expression evaluates to null', waitForAsync(() => {
           fixture = createTestComponent('<div [ngClass]="objExpr"></div>');

           detectChangesAndExpectClassName('foo');

           getComponent().objExpr = null;
           detectChangesAndExpectClassName('');

           getComponent().objExpr = {'foo': false, 'bar': true};
           detectChangesAndExpectClassName('bar');
         }));


      it('should allow multiple classes per expression', waitForAsync(() => {
           fixture = createTestComponent('<div [ngClass]="objExpr"></div>');

           getComponent().objExpr = {'bar baz': true, 'bar1 baz1': true};
           detectChangesAndExpectClassName('bar baz bar1 baz1');

           getComponent().objExpr = {'bar baz': false, 'bar1 baz1': true};
           detectChangesAndExpectClassName('bar1 baz1');
         }));

      it('should split by one or more spaces between classes', waitForAsync(() => {
           fixture = createTestComponent('<div [ngClass]="objExpr"></div>');

           getComponent().objExpr = {'foo bar     baz': true};
           detectChangesAndExpectClassName('foo bar baz');
         }));
    });

    describe('expressions evaluating to lists', () => {
      it('should add classes specified in a list literal', waitForAsync(() => {
           fixture =
               createTestComponent(`<div [ngClass]="['foo', 'bar', 'foo-bar', 'fooBar']"></div>`);

           detectChangesAndExpectClassName('foo bar foo-bar fooBar');
         }));

      it('should add and remove classes based on changes to the expression', waitForAsync(() => {
           fixture = createTestComponent('<div [ngClass]="arrExpr"></div>');
           const arrExpr = getComponent().arrExpr;
           detectChangesAndExpectClassName('foo');

           arrExpr.push('bar');
           detectChangesAndExpectClassName('foo bar');

           arrExpr[1] = 'baz';
           detectChangesAndExpectClassName('foo baz');

           getComponent().arrExpr = arrExpr.filter((v: string) => v !== 'baz');
           detectChangesAndExpectClassName('foo');
         }));

      it('should add and remove classes when a reference changes', waitForAsync(() => {
           fixture = createTestComponent('<div [ngClass]="arrExpr"></div>');
           detectChangesAndExpectClassName('foo');

           getComponent().arrExpr = ['bar'];
           detectChangesAndExpectClassName('bar');
         }));

      it('should take initial classes into account when a reference changes', waitForAsync(() => {
           fixture = createTestComponent('<div class="foo" [ngClass]="arrExpr"></div>');
           detectChangesAndExpectClassName('foo');

           getComponent().arrExpr = ['bar'];
           detectChangesAndExpectClassName('foo bar');
         }));

      it('should ignore empty or blank class names', waitForAsync(() => {
           fixture = createTestComponent('<div class="foo" [ngClass]="arrExpr"></div>');
           getComponent().arrExpr = ['', '  '];
           detectChangesAndExpectClassName('foo');
         }));

      it('should trim blanks from class names', waitForAsync(() => {
           fixture = createTestComponent('<div class="foo" [ngClass]="arrExpr"></div>');

           getComponent().arrExpr = [' bar  '];
           detectChangesAndExpectClassName('foo bar');
         }));


      it('should allow multiple classes per item in arrays', waitForAsync(() => {
           fixture = createTestComponent('<div [ngClass]="arrExpr"></div>');

           getComponent().arrExpr = ['foo bar baz', 'foo1 bar1   baz1'];
           detectChangesAndExpectClassName('foo bar baz foo1 bar1 baz1');

           getComponent().arrExpr = ['foo bar   baz foobar'];
           detectChangesAndExpectClassName('foo bar baz foobar');
         }));

      it('should throw with descriptive error message when CSS class is not a string', () => {
        fixture = createTestComponent(`<div [ngClass]="['foo', {}]"></div>`);
        expect(() => fixture!.detectChanges())
            .toThrowError(
                /NgClass can only toggle CSS classes expressed as strings, got \[object Object\]/);
      });
    });

    describe('expressions evaluating to sets', () => {
      it('should add and remove classes if the set instance changed', waitForAsync(() => {
           fixture = createTestComponent('<div [ngClass]="setExpr"></div>');
           let setExpr = new Set<string>();
           setExpr.add('bar');
           getComponent().setExpr = setExpr;
           detectChangesAndExpectClassName('bar');

           setExpr = new Set<string>();
           setExpr.add('baz');
           getComponent().setExpr = setExpr;
           detectChangesAndExpectClassName('baz');
         }));
    });

    describe('expressions evaluating to string', () => {
      it('should add classes specified in a string literal', waitForAsync(() => {
           fixture = createTestComponent(`<div [ngClass]="'foo bar foo-bar fooBar'"></div>`);
           detectChangesAndExpectClassName('foo bar foo-bar fooBar');
         }));

      it('should add and remove classes based on changes to the expression', waitForAsync(() => {
           fixture = createTestComponent('<div [ngClass]="strExpr"></div>');
           detectChangesAndExpectClassName('foo');

           getComponent().strExpr = 'foo bar';
           detectChangesAndExpectClassName('foo bar');


           getComponent().strExpr = 'baz';
           detectChangesAndExpectClassName('baz');
         }));

      it('should remove active classes when switching from string to null', waitForAsync(() => {
           fixture = createTestComponent(`<div [ngClass]="strExpr"></div>`);
           detectChangesAndExpectClassName('foo');

           getComponent().strExpr = null;
           detectChangesAndExpectClassName('');
         }));

      it('should take initial classes into account when switching from string to null',
         waitForAsync(() => {
           fixture = createTestComponent(`<div class="foo" [ngClass]="strExpr"></div>`);
           detectChangesAndExpectClassName('foo');

           getComponent().strExpr = null;
           detectChangesAndExpectClassName('foo');
         }));

      it('should ignore empty and blank strings', waitForAsync(() => {
           fixture = createTestComponent(`<div class="foo" [ngClass]="strExpr"></div>`);
           getComponent().strExpr = '';
           detectChangesAndExpectClassName('foo');
         }));
    });

    describe('cooperation with other class-changing constructs', () => {
      it('should co-operate with the class attribute', waitForAsync(() => {
           fixture = createTestComponent('<div [ngClass]="objExpr" class="init foo"></div>');
           const objExpr = getComponent().objExpr;

           objExpr!['bar'] = true;
           detectChangesAndExpectClassName('init foo bar');

           objExpr!['foo'] = false;
           detectChangesAndExpectClassName('init bar');

           getComponent().objExpr = null;
           detectChangesAndExpectClassName('init foo');
         }));

      it('should co-operate with the interpolated class attribute', waitForAsync(() => {
           fixture = createTestComponent(`<div [ngClass]="objExpr" class="{{'init foo'}}"></div>`);
           const objExpr = getComponent().objExpr;

           objExpr!['bar'] = true;
           detectChangesAndExpectClassName(`init foo bar`);

           objExpr!['foo'] = false;
           detectChangesAndExpectClassName(`init bar`);

           getComponent().objExpr = null;
           detectChangesAndExpectClassName(`init foo`);
         }));

      it('should co-operate with the interpolated class attribute when interpolation changes',
         waitForAsync(() => {
           fixture = createTestComponent(
               `<div [ngClass]="{large: false, small: true}" class="{{strExpr}}"></div>`);

           detectChangesAndExpectClassName(`foo small`);

           getComponent().strExpr = 'bar';
           detectChangesAndExpectClassName(`bar small`);
         }));

      it('should co-operate with the class attribute and binding to it', waitForAsync(() => {
           fixture =
               createTestComponent(`<div [ngClass]="objExpr" class="init" [class]="'foo'"></div>`);
           const objExpr = getComponent().objExpr;

           objExpr!['bar'] = true;
           detectChangesAndExpectClassName(`init foo bar`);

           objExpr!['foo'] = false;
           detectChangesAndExpectClassName(`init bar`);

           getComponent().objExpr = null;
           detectChangesAndExpectClassName(`init foo`);
         }));

      it('should co-operate with the class attribute and class.name binding', waitForAsync(() => {
           const template =
               '<div class="init foo" [ngClass]="objExpr" [class.baz]="condition"></div>';
           fixture = createTestComponent(template);
           const objExpr = getComponent().objExpr;

           detectChangesAndExpectClassName('init foo baz');

           objExpr!['bar'] = true;
           detectChangesAndExpectClassName('init foo baz bar');

           objExpr!['foo'] = false;
           detectChangesAndExpectClassName('init baz bar');

           getComponent().condition = false;
           detectChangesAndExpectClassName('init bar');
         }));

      it('should co-operate with initial class and class attribute binding when binding changes',
         waitForAsync(() => {
           const template = '<div class="init" [ngClass]="objExpr" [class]="strExpr"></div>';
           fixture = createTestComponent(template);
           const cmp = getComponent();

           detectChangesAndExpectClassName('init foo');

           cmp.objExpr!['bar'] = true;
           detectChangesAndExpectClassName('init foo bar');

           cmp.strExpr = 'baz';
           detectChangesAndExpectClassName('init bar baz foo');

           cmp.objExpr = null;
           detectChangesAndExpectClassName('init baz');
         }));
    });

    describe('prevent regressions', () => {
      // https://github.com/angular/angular/issues/34336
      it('should not write to the native node unless the bound expression has changed', () => {
        fixture = createTestComponent(`<div [ngClass]="{'color-red': condition}"></div>`);
        detectChangesAndExpectClassName('color-red');

        // Overwrite CSS classes so that we can check if ngClass performed DOM manipulation to
        // update it
        fixture.debugElement.children[0].nativeElement.className = '';
        // Assert that the DOM node still has the same value after change detection
        detectChangesAndExpectClassName('');

        fixture.componentInstance.condition = false;
        fixture.detectChanges();
        fixture.componentInstance.condition = true;
        detectChangesAndExpectClassName('color-red');
      });

      it('should allow classes with trailing and leading spaces in [ngClass]', () => {
        @Component({
          template: `
            <div leading-space [ngClass]="{' foo': applyClasses}"></div>
            <div trailing-space [ngClass]="{'foo ': applyClasses}"></div>
          `
        })
        class Cmp {
          applyClasses = true;
        }

        TestBed.configureTestingModule({declarations: [Cmp]});
        const fixture = TestBed.createComponent(Cmp);
        fixture.detectChanges();

        const leading = fixture.nativeElement.querySelector('[leading-space]');
        const trailing = fixture.nativeElement.querySelector('[trailing-space]');
        expect(leading.className).toBe('foo');
        expect(trailing.className).toBe('foo');
      });
    });
  });
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  condition: boolean = true;
  items: any[]|undefined;
  arrExpr: string[] = ['foo'];
  setExpr: Set<string> = new Set<string>();
  objExpr: {[klass: string]: any}|null = {'foo': true, 'bar': false};
  strExpr: string|null = 'foo';

  constructor() {
    this.setExpr.add('foo');
  }
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}
