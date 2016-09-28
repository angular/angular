/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';

export function main() {
  describe('binding to CSS class list', () => {
    let fixture: ComponentFixture<any>;

    function detectChangesAndExpectClassName(classes: string): void {
      fixture.detectChanges();
      expect(fixture.debugElement.children[0].nativeElement.className).toEqual(classes);
    }

    function getComponent(): TestComponent { return fixture.debugElement.componentInstance; }

    afterEach(() => { fixture = null; });

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
      });
    });

    it('should clean up when the directive is destroyed', async(() => {
         fixture = createTestComponent('<div *ngFor="let item of items" [ngClass]="item"></div>');

         getComponent().items = [['0']];
         fixture.detectChanges();
         getComponent().items = [['1']];
         detectChangesAndExpectClassName('1');
       }));

    describe('expressions evaluating to objects', () => {

      it('should add classes specified in an object literal', async(() => {
           fixture = createTestComponent('<div [ngClass]="{foo: true, bar: false}"></div>');

           detectChangesAndExpectClassName('foo');
         }));

      it('should add classes specified in an object literal without change in class names',
         async(() => {
           fixture =
               createTestComponent(`<div [ngClass]="{'foo-bar': true, 'fooBar': true}"></div>`);

           detectChangesAndExpectClassName('foo-bar fooBar');
         }));

      it('should add and remove classes based on changes in object literal values', async(() => {
           fixture =
               createTestComponent('<div [ngClass]="{foo: condition, bar: !condition}"></div>');

           detectChangesAndExpectClassName('foo');

           getComponent().condition = false;
           detectChangesAndExpectClassName('bar');
         }));

      it('should add and remove classes based on changes to the expression object', async(() => {
           fixture = createTestComponent('<div [ngClass]="objExpr"></div>');
           let objExpr = getComponent().objExpr;

           detectChangesAndExpectClassName('foo');

           objExpr['bar'] = true;
           detectChangesAndExpectClassName('foo bar');

           objExpr['baz'] = true;
           detectChangesAndExpectClassName('foo bar baz');

           delete (objExpr['bar']);
           detectChangesAndExpectClassName('foo baz');
         }));

      it('should add and remove classes based on reference changes to the expression object',
         async(() => {
           fixture = createTestComponent('<div [ngClass]="objExpr"></div>');

           detectChangesAndExpectClassName('foo');

           getComponent().objExpr = {foo: true, bar: true};
           detectChangesAndExpectClassName('foo bar');

           getComponent().objExpr = {baz: true};
           detectChangesAndExpectClassName('baz');
         }));

      it('should remove active classes when expression evaluates to null', async(() => {
           fixture = createTestComponent('<div [ngClass]="objExpr"></div>');

           detectChangesAndExpectClassName('foo');

           getComponent().objExpr = null;
           detectChangesAndExpectClassName('');

           getComponent().objExpr = {'foo': false, 'bar': true};
           detectChangesAndExpectClassName('bar');
         }));


      it('should allow multiple classes per expression', async(() => {
           fixture = createTestComponent('<div [ngClass]="objExpr"></div>');

           getComponent().objExpr = {'bar baz': true, 'bar1 baz1': true};
           detectChangesAndExpectClassName('bar baz bar1 baz1');

           getComponent().objExpr = {'bar baz': false, 'bar1 baz1': true};
           detectChangesAndExpectClassName('bar1 baz1');
         }));

      it('should split by one or more spaces between classes', async(() => {
           fixture = createTestComponent('<div [ngClass]="objExpr"></div>');

           getComponent().objExpr = {'foo bar     baz': true};
           detectChangesAndExpectClassName('foo bar baz');
         }));
    });

    describe('expressions evaluating to lists', () => {

      it('should add classes specified in a list literal', async(() => {
           fixture =
               createTestComponent(`<div [ngClass]="['foo', 'bar', 'foo-bar', 'fooBar']"></div>`);

           detectChangesAndExpectClassName('foo bar foo-bar fooBar');
         }));

      it('should add and remove classes based on changes to the expression', async(() => {
           fixture = createTestComponent('<div [ngClass]="arrExpr"></div>');
           let arrExpr = getComponent().arrExpr;
           detectChangesAndExpectClassName('foo');

           arrExpr.push('bar');
           detectChangesAndExpectClassName('foo bar');

           arrExpr[1] = 'baz';
           detectChangesAndExpectClassName('foo baz');

           getComponent().arrExpr = arrExpr.filter((v: string) => v !== 'baz');
           detectChangesAndExpectClassName('foo');
         }));

      it('should add and remove classes when a reference changes', async(() => {
           fixture = createTestComponent('<div [ngClass]="arrExpr"></div>');
           detectChangesAndExpectClassName('foo');

           getComponent().arrExpr = ['bar'];
           detectChangesAndExpectClassName('bar');
         }));

      it('should take initial classes into account when a reference changes', async(() => {
           fixture = createTestComponent('<div class="foo" [ngClass]="arrExpr"></div>');
           detectChangesAndExpectClassName('foo');

           getComponent().arrExpr = ['bar'];
           detectChangesAndExpectClassName('foo bar');
         }));

      it('should ignore empty or blank class names', async(() => {
           fixture = createTestComponent('<div class="foo" [ngClass]="arrExpr"></div>');
           getComponent().arrExpr = ['', '  '];
           detectChangesAndExpectClassName('foo');
         }));

      it('should trim blanks from class names', async(() => {
           fixture = createTestComponent('<div class="foo" [ngClass]="arrExpr"></div>');

           getComponent().arrExpr = [' bar  '];
           detectChangesAndExpectClassName('foo bar');
         }));


      it('should allow multiple classes per item in arrays', async(() => {
           fixture = createTestComponent('<div [ngClass]="arrExpr"></div>');

           getComponent().arrExpr = ['foo bar baz', 'foo1 bar1   baz1'];
           detectChangesAndExpectClassName('foo bar baz foo1 bar1 baz1');

           getComponent().arrExpr = ['foo bar   baz foobar'];
           detectChangesAndExpectClassName('foo bar baz foobar');
         }));
    });

    describe('expressions evaluating to sets', () => {

      it('should add and remove classes if the set instance changed', async(() => {
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

      it('should add classes specified in a string literal', async(() => {
           fixture = createTestComponent(`<div [ngClass]="'foo bar foo-bar fooBar'"></div>`);
           detectChangesAndExpectClassName('foo bar foo-bar fooBar');
         }));

      it('should add and remove classes based on changes to the expression', async(() => {
           fixture = createTestComponent('<div [ngClass]="strExpr"></div>');
           detectChangesAndExpectClassName('foo');

           getComponent().strExpr = 'foo bar';
           detectChangesAndExpectClassName('foo bar');


           getComponent().strExpr = 'baz';
           detectChangesAndExpectClassName('baz');
         }));

      it('should remove active classes when switching from string to null', async(() => {
           fixture = createTestComponent(`<div [ngClass]="strExpr"></div>`);
           detectChangesAndExpectClassName('foo');

           getComponent().strExpr = null;
           detectChangesAndExpectClassName('');
         }));

      it('should take initial classes into account when switching from string to null',
         async(() => {
           fixture = createTestComponent(`<div class="foo" [ngClass]="strExpr"></div>`);
           detectChangesAndExpectClassName('foo');

           getComponent().strExpr = null;
           detectChangesAndExpectClassName('foo');
         }));

      it('should ignore empty and blank strings', async(() => {
           fixture = createTestComponent(`<div class="foo" [ngClass]="strExpr"></div>`);
           getComponent().strExpr = '';
           detectChangesAndExpectClassName('foo');
         }));

    });

    describe('cooperation with other class-changing constructs', () => {

      it('should co-operate with the class attribute', async(() => {
           fixture = createTestComponent('<div [ngClass]="objExpr" class="init foo"></div>');
           let objExpr = getComponent().objExpr;

           objExpr['bar'] = true;
           detectChangesAndExpectClassName('init foo bar');

           objExpr['foo'] = false;
           detectChangesAndExpectClassName('init bar');

           getComponent().objExpr = null;
           detectChangesAndExpectClassName('init foo');
         }));

      it('should co-operate with the interpolated class attribute', async(() => {
           fixture = createTestComponent(`<div [ngClass]="objExpr" class="{{'init foo'}}"></div>`);
           let objExpr = getComponent().objExpr;

           objExpr['bar'] = true;
           detectChangesAndExpectClassName(`init foo bar`);

           objExpr['foo'] = false;
           detectChangesAndExpectClassName(`init bar`);

           getComponent().objExpr = null;
           detectChangesAndExpectClassName(`init foo`);
         }));

      it('should co-operate with the class attribute and binding to it', async(() => {
           fixture =
               createTestComponent(`<div [ngClass]="objExpr" class="init" [class]="'foo'"></div>`);
           let objExpr = getComponent().objExpr;

           objExpr['bar'] = true;
           detectChangesAndExpectClassName(`init foo bar`);

           objExpr['foo'] = false;
           detectChangesAndExpectClassName(`init bar`);

           getComponent().objExpr = null;
           detectChangesAndExpectClassName(`init foo`);
         }));

      it('should co-operate with the class attribute and class.name binding', async(() => {
           const template =
               '<div class="init foo" [ngClass]="objExpr" [class.baz]="condition"></div>';
           fixture = createTestComponent(template);
           let objExpr = getComponent().objExpr;

           detectChangesAndExpectClassName('init foo baz');

           objExpr['bar'] = true;
           detectChangesAndExpectClassName('init foo baz bar');

           objExpr['foo'] = false;
           detectChangesAndExpectClassName('init baz bar');

           getComponent().condition = false;
           detectChangesAndExpectClassName('init bar');
         }));

      it('should co-operate with initial class and class attribute binding when binding changes',
         async(() => {
           const template = '<div class="init" [ngClass]="objExpr" [class]="strExpr"></div>';
           fixture = createTestComponent(template);
           let cmp = getComponent();

           detectChangesAndExpectClassName('init foo');

           cmp.objExpr['bar'] = true;
           detectChangesAndExpectClassName('init foo bar');

           cmp.strExpr = 'baz';
           detectChangesAndExpectClassName('init bar baz foo');

           cmp.objExpr = null;
           detectChangesAndExpectClassName('init baz');
         }));
    });
  });
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  condition: boolean = true;
  items: any[];
  arrExpr: string[] = ['foo'];
  setExpr: Set<string> = new Set<string>();
  objExpr: {[klass: string]: any} = {'foo': true, 'bar': false};
  strExpr = 'foo';

  constructor() { this.setExpr.add('foo'); }
}

function createTestComponent(template: string): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {set: {template: template}})
      .createComponent(TestComponent);
}