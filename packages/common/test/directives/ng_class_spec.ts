/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy} from '@angular/compiler';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NgClass, NgFor} from '../../index';

describe('binding to CSS class list', () => {
  let fixture: ComponentFixture<any> | null;

  function normalizeClassNames(classes: string) {
    return classes.trim().split(' ').sort().join(' ');
  }

  async function waitForStableAndExpectClassName(classes: string): Promise<void> {
    fixture?.changeDetectorRef.markForCheck();
    await fixture!.whenStable();
    let nonNormalizedClassName = fixture!.debugElement.children[0].nativeElement.className;
    expect(normalizeClassNames(nonNormalizedClassName)).toEqual(normalizeClassNames(classes));
  }

  function getComponent(): TestComponent {
    return fixture!.debugElement.componentInstance;
  }

  afterEach(() => {
    fixture = null;
  });

  it('should clean up when the directive is destroyed', async () => {
    fixture = createTestComponent('<div *ngFor="let item of items" [ngClass]="item"></div>');

    getComponent().items = [['0']];
    await fixture.whenStable();
    getComponent().items = [['1']];
    await waitForStableAndExpectClassName('1');
  });

  describe('expressions evaluating to objects', () => {
    it('should add classes specified in an object literal', async () => {
      fixture = createTestComponent('<div [ngClass]="{foo: true, bar: false}"></div>');

      await waitForStableAndExpectClassName('foo');
    });

    it('should add classes specified in an object literal without change in class names', async () => {
      fixture = createTestComponent(`<div [ngClass]="{'foo-bar': true, 'fooBar': true}"></div>`);

      await waitForStableAndExpectClassName('foo-bar fooBar');
    });

    it('should add and remove classes based on changes in object literal values', async () => {
      fixture = createTestComponent('<div [ngClass]="{foo: condition, bar: !condition}"></div>');

      await waitForStableAndExpectClassName('foo');

      getComponent().condition = false;
      await waitForStableAndExpectClassName('bar');
    });

    it('should add and remove classes based on changes to the expression object', async () => {
      fixture = createTestComponent('<div [ngClass]="objExpr"></div>');
      const objExpr = getComponent().objExpr;

      await waitForStableAndExpectClassName('foo');

      objExpr!['bar'] = true;
      await waitForStableAndExpectClassName('foo bar');

      objExpr!['baz'] = true;
      await waitForStableAndExpectClassName('foo bar baz');

      delete objExpr!['bar'];
      await waitForStableAndExpectClassName('foo baz');
    });

    it('should add and remove classes based on reference changes to the expression object', async () => {
      fixture = createTestComponent('<div [ngClass]="objExpr"></div>');

      await waitForStableAndExpectClassName('foo');

      getComponent().objExpr = {foo: true, bar: true};
      await waitForStableAndExpectClassName('foo bar');

      getComponent().objExpr = {baz: true};
      await waitForStableAndExpectClassName('baz');
    });

    it('should remove active classes when expression evaluates to null', async () => {
      fixture = createTestComponent('<div [ngClass]="objExpr"></div>');

      await waitForStableAndExpectClassName('foo');

      getComponent().objExpr = null;
      await waitForStableAndExpectClassName('');

      getComponent().objExpr = {'foo': false, 'bar': true};
      await waitForStableAndExpectClassName('bar');
    });

    it('should remove active classes when expression evaluates to undefined', async () => {
      fixture = createTestComponent('<div [ngClass]="objExpr"></div>');

      await waitForStableAndExpectClassName('foo');

      getComponent().objExpr = undefined;
      await waitForStableAndExpectClassName('');

      getComponent().objExpr = {'foo': false, 'bar': true};
      await waitForStableAndExpectClassName('bar');
    });

    it('should allow multiple classes per expression', async () => {
      fixture = createTestComponent('<div [ngClass]="objExpr"></div>');

      getComponent().objExpr = {'bar baz': true, 'bar1 baz1': true};
      await waitForStableAndExpectClassName('bar baz bar1 baz1');

      getComponent().objExpr = {'bar baz': false, 'bar1 baz1': true};
      await waitForStableAndExpectClassName('bar1 baz1');
    });

    it('should split by one or more spaces between classes', async () => {
      fixture = createTestComponent('<div [ngClass]="objExpr"></div>');

      getComponent().objExpr = {'foo bar     baz': true};
      await waitForStableAndExpectClassName('foo bar baz');
    });
  });

  describe('expressions evaluating to lists', () => {
    it('should add classes specified in a list literal', async () => {
      fixture = createTestComponent(`<div [ngClass]="['foo', 'bar', 'foo-bar', 'fooBar']"></div>`);

      await waitForStableAndExpectClassName('foo bar foo-bar fooBar');
    });

    it('should add and remove classes based on changes to the expression', async () => {
      fixture = createTestComponent('<div [ngClass]="arrExpr"></div>');
      const arrExpr = getComponent().arrExpr;
      await waitForStableAndExpectClassName('foo');

      arrExpr.push('bar');
      await waitForStableAndExpectClassName('foo bar');

      arrExpr[1] = 'baz';
      await waitForStableAndExpectClassName('foo baz');

      getComponent().arrExpr = arrExpr.filter((v: string) => v !== 'baz');
      await waitForStableAndExpectClassName('foo');
    });

    it('should add and remove classes when a reference changes', async () => {
      fixture = createTestComponent('<div [ngClass]="arrExpr"></div>');
      await waitForStableAndExpectClassName('foo');

      getComponent().arrExpr = ['bar'];
      await waitForStableAndExpectClassName('bar');
    });

    it('should take initial classes into account when a reference changes', async () => {
      fixture = createTestComponent('<div class="foo" [ngClass]="arrExpr"></div>');
      await waitForStableAndExpectClassName('foo');

      getComponent().arrExpr = ['bar'];
      await waitForStableAndExpectClassName('foo bar');
    });

    it('should ignore empty or blank class names', async () => {
      fixture = createTestComponent('<div class="foo" [ngClass]="arrExpr"></div>');
      getComponent().arrExpr = ['', '  '];
      await waitForStableAndExpectClassName('foo');
    });

    it('should trim blanks from class names', async () => {
      fixture = createTestComponent('<div class="foo" [ngClass]="arrExpr"></div>');

      getComponent().arrExpr = [' bar  '];
      await waitForStableAndExpectClassName('foo bar');
    });

    it('should allow multiple classes per item in arrays', async () => {
      fixture = createTestComponent('<div [ngClass]="arrExpr"></div>');

      getComponent().arrExpr = ['foo bar baz', 'foo1 bar1   baz1'];
      await waitForStableAndExpectClassName('foo bar baz foo1 bar1 baz1');

      getComponent().arrExpr = ['foo bar   baz foobar'];
      await waitForStableAndExpectClassName('foo bar baz foobar');
    });

    it('should throw with descriptive error message when CSS class is not a string', async () => {
      fixture = createTestComponent(`<div [ngClass]="['foo', {}]"></div>`);
      await expectAsync(fixture.whenStable()).toBeRejectedWithError(
        /NgClass can only toggle CSS classes expressed as strings, got \[object Object\]/,
      );
    });
  });

  describe('expressions evaluating to sets', () => {
    it('should add and remove classes if the set instance changed', async () => {
      fixture = createTestComponent('<div [ngClass]="setExpr"></div>');
      let setExpr = new Set<string>();
      setExpr.add('bar');
      getComponent().setExpr = setExpr;
      await waitForStableAndExpectClassName('bar');

      setExpr = new Set<string>();
      setExpr.add('baz');
      getComponent().setExpr = setExpr;
      await waitForStableAndExpectClassName('baz');
    });
  });

  describe('expressions evaluating to string', () => {
    it('should add classes specified in a string literal', async () => {
      fixture = createTestComponent(`<div [ngClass]="'foo bar foo-bar fooBar'"></div>`);
      await waitForStableAndExpectClassName('foo bar foo-bar fooBar');
    });

    it('should add and remove classes based on changes to the expression', async () => {
      fixture = createTestComponent('<div [ngClass]="strExpr"></div>');
      await waitForStableAndExpectClassName('foo');

      getComponent().strExpr = 'foo bar';
      await waitForStableAndExpectClassName('foo bar');

      getComponent().strExpr = 'baz';
      await waitForStableAndExpectClassName('baz');
    });

    it('should remove active classes when switching from string to null', async () => {
      fixture = createTestComponent(`<div [ngClass]="strExpr"></div>`);
      await waitForStableAndExpectClassName('foo');

      getComponent().strExpr = null;
      await waitForStableAndExpectClassName('');
    });

    it('should remove active classes when switching from string to undefined', async () => {
      fixture = createTestComponent(`<div [ngClass]="strExpr"></div>`);
      await waitForStableAndExpectClassName('foo');

      getComponent().strExpr = undefined;
      await waitForStableAndExpectClassName('');
    });

    it('should take initial classes into account when switching from string to null', async () => {
      fixture = createTestComponent(`<div class="foo" [ngClass]="strExpr"></div>`);
      await waitForStableAndExpectClassName('foo');

      getComponent().strExpr = null;
      await waitForStableAndExpectClassName('foo');
    });

    it('should take initial classes into account when switching from string to undefined', async () => {
      fixture = createTestComponent(`<div class="foo" [ngClass]="strExpr"></div>`);
      await waitForStableAndExpectClassName('foo');

      getComponent().strExpr = undefined;
      await waitForStableAndExpectClassName('foo');
    });

    it('should ignore empty and blank strings', async () => {
      fixture = createTestComponent(`<div class="foo" [ngClass]="strExpr"></div>`);
      getComponent().strExpr = '';
      await waitForStableAndExpectClassName('foo');
    });
  });

  describe('cooperation with other class-changing constructs', () => {
    it('should co-operate with the class attribute', async () => {
      fixture = createTestComponent('<div [ngClass]="objExpr" class="init foo"></div>');
      const objExpr = getComponent().objExpr;

      objExpr!['bar'] = true;
      await waitForStableAndExpectClassName('init foo bar');

      objExpr!['foo'] = false;
      await waitForStableAndExpectClassName('init bar');

      getComponent().objExpr = null;
      await waitForStableAndExpectClassName('init foo');

      getComponent().objExpr = undefined;
      await waitForStableAndExpectClassName('init foo');
    });

    it('should co-operate with the interpolated class attribute', async () => {
      fixture = createTestComponent(`<div [ngClass]="objExpr" class="{{'init foo'}}"></div>`);
      const objExpr = getComponent().objExpr;

      objExpr!['bar'] = true;
      await waitForStableAndExpectClassName(`init foo bar`);

      objExpr!['foo'] = false;
      await waitForStableAndExpectClassName(`init bar`);

      getComponent().objExpr = null;
      await waitForStableAndExpectClassName(`init foo`);

      getComponent().objExpr = undefined;
      await waitForStableAndExpectClassName(`init foo`);
    });

    it('should co-operate with the interpolated class attribute when interpolation changes', async () => {
      fixture = createTestComponent(
        `<div [ngClass]="{large: false, small: true}" class="{{strExpr}}"></div>`,
      );

      await waitForStableAndExpectClassName(`foo small`);

      getComponent().strExpr = 'bar';
      await waitForStableAndExpectClassName(`bar small`);

      getComponent().strExpr = undefined;
      await waitForStableAndExpectClassName(`small`);
    });

    it('should co-operate with the class attribute and binding to it', async () => {
      fixture = createTestComponent(`<div [ngClass]="objExpr" class="init" [class]="'foo'"></div>`);
      const objExpr = getComponent().objExpr;

      objExpr!['bar'] = true;
      await waitForStableAndExpectClassName(`init foo bar`);

      objExpr!['foo'] = false;
      await waitForStableAndExpectClassName(`init bar`);

      getComponent().objExpr = null;
      await waitForStableAndExpectClassName(`init foo`);

      getComponent().objExpr = undefined;
      await waitForStableAndExpectClassName(`init foo`);
    });

    it('should co-operate with the class attribute and class.name binding', async () => {
      const template = '<div class="init foo" [ngClass]="objExpr" [class.baz]="condition"></div>';
      fixture = createTestComponent(template);
      const objExpr = getComponent().objExpr;

      await waitForStableAndExpectClassName('init foo baz');

      objExpr!['bar'] = true;
      await waitForStableAndExpectClassName('init foo baz bar');

      objExpr!['foo'] = false;
      await waitForStableAndExpectClassName('init baz bar');

      getComponent().condition = false;
      await waitForStableAndExpectClassName('init bar');
    });

    it('should co-operate with initial class and class attribute binding when binding changes', async () => {
      const template = '<div class="init" [ngClass]="objExpr" [class]="strExpr"></div>';
      fixture = createTestComponent(template);
      const cmp = getComponent();

      await waitForStableAndExpectClassName('init foo');

      cmp.objExpr!['bar'] = true;
      await waitForStableAndExpectClassName('init foo bar');

      cmp.strExpr = 'baz';
      await waitForStableAndExpectClassName('init bar baz foo');

      cmp.objExpr = null;
      await waitForStableAndExpectClassName('init baz');

      cmp.objExpr = undefined;
      await waitForStableAndExpectClassName('init baz');
    });
  });

  describe('prevent regressions', () => {
    // https://github.com/angular/angular/issues/34336
    it('should not write to the native node unless the bound expression has changed', async () => {
      fixture = createTestComponent(`<div [ngClass]="{'color-red': condition}"></div>`);
      await waitForStableAndExpectClassName('color-red');

      // Overwrite CSS classes so that we can check if ngClass performed DOM manipulation to
      // update it
      fixture.debugElement.children[0].nativeElement.className = '';
      // Assert that the DOM node still has the same value after change detection
      await waitForStableAndExpectClassName('');

      fixture.componentInstance.condition = false;
      fixture.changeDetectorRef.markForCheck();
      await fixture.whenStable();
      fixture.componentInstance.condition = true;
      fixture.changeDetectorRef.markForCheck();
      await waitForStableAndExpectClassName('color-red');
    });

    it('should not write to the native node when values are the same (obj reference change)', async () => {
      fixture = createTestComponent(`<div [ngClass]="objExpr"></div>`);
      await waitForStableAndExpectClassName('foo');

      // Overwrite CSS classes so that we can check if ngClass performed DOM manipulation to
      // update it
      fixture.debugElement.children[0].nativeElement.className = '';
      // Assert that the DOM node still has the same value after change detection
      await waitForStableAndExpectClassName('');

      // change the object reference (without changing values)
      fixture.componentInstance.objExp = {...fixture.componentInstance.objExp};
      await waitForStableAndExpectClassName('');
    });

    it('should not write to the native node when values are the same (array reference change)', async () => {
      fixture = createTestComponent(`<div [ngClass]="arrExpr"></div>`);
      await waitForStableAndExpectClassName('foo');

      // Overwrite CSS classes so that we can check if ngClass performed DOM manipulation to
      // update it
      fixture.debugElement.children[0].nativeElement.className = '';
      // Assert that the DOM node still has the same value after change detection
      await waitForStableAndExpectClassName('');

      // change the object reference (without changing values)
      fixture.componentInstance.arrExpr = [...fixture.componentInstance.arrExpr];
      await waitForStableAndExpectClassName('');
    });

    it('should not add css class when bound initial class is removed by ngClass binding', async () => {
      fixture = createTestComponent(`<div [class]="'bar'" [ngClass]="objExpr"></div>`);
      await waitForStableAndExpectClassName('foo');
    });

    it('should not add css class when static initial class is removed by ngClass binding', async () => {
      fixture = createTestComponent(`<div class="bar" [ngClass]="objExpr"></div>`);
      await waitForStableAndExpectClassName('foo');
    });

    it('should allow classes with trailing and leading spaces in [ngClass]', async () => {
      @Component({
        template: `
          <div leading-space [ngClass]="{' foo': applyClasses}"></div>
          <div trailing-space [ngClass]="{'foo ': applyClasses}"></div>
        `,
        imports: [NgClass],
        changeDetection: ChangeDetectionStrategy.Eager,
      })
      class Cmp {
        applyClasses = true;
      }

      const fixture = TestBed.createComponent(Cmp);
      await fixture.whenStable();

      const leading = fixture.nativeElement.querySelector('[leading-space]');
      const trailing = fixture.nativeElement.querySelector('[trailing-space]');
      expect(leading.className).toBe('foo');
      expect(trailing.className).toBe('foo');
    });

    it('should mix class and ngClass bindings with the same value', async () => {
      @Component({
        selector: 'test-component',
        imports: [NgClass],
        template: `<div class="{{ 'option-' + level }}" [ngClass]="'option-' + level"></div>`,
        changeDetection: ChangeDetectionStrategy.Eager,
      })
      class TestComponent {
        level = 1;
      }

      const fixture = TestBed.createComponent(TestComponent);
      await fixture.whenStable();

      expect(fixture.nativeElement.firstChild.className).toBe('option-1');

      fixture.componentInstance.level = 5;
      fixture.changeDetectorRef.markForCheck();
      await fixture.whenStable();
      expect(fixture.nativeElement.firstChild.className).toBe('option-5');
    });

    it('should be available as a standalone directive', async () => {
      @Component({
        selector: 'test-component',
        imports: [NgClass],
        template: `<div trailing-space [ngClass]="{foo: applyClasses}"></div>`,
      })
      class TestComponent {
        applyClasses = true;
      }

      const fixture = TestBed.createComponent(TestComponent);
      await fixture.whenStable();

      expect(fixture.nativeElement.firstChild.className).toBe('foo');
    });
  });
});

@Component({
  selector: 'test-cmp',
  template: '',
  imports: [NgClass, NgFor],
  changeDetection: ChangeDetectionStrategy.Eager,
})
class TestComponent {
  condition: boolean = true;
  items: any[] | undefined;
  arrExpr: string[] = ['foo'];
  setExpr: Set<string> = new Set<string>();
  objExpr: {[klass: string]: any} | null | undefined = {'foo': true, 'bar': false};
  strExpr: string | null | undefined = 'foo';

  constructor() {
    this.setExpr.add('foo');
  }
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}}).createComponent(
    TestComponent,
  );
}
