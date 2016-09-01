/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgClass, NgFor} from '@angular/common';
import {Component} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {beforeEach, ddescribe, describe, expect, iit, inject, it, xdescribe, xit} from '@angular/core/testing/testing_internal';

import {ListWrapper, StringMapWrapper} from '../../src/facade/collection';

function detectChangesAndCheck(fixture: ComponentFixture<any>, classes: string) {
  fixture.detectChanges();
  expect(fixture.debugElement.children[0].nativeElement.className).toEqual(classes);
}

export function main() {
  describe('binding to CSS class list', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
      });
    });

    it('should clean up when the directive is destroyed', async(() => {
         let template = '<div *ngFor="let item of items" [ngClass]="item"></div>';
         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);

         fixture.debugElement.componentInstance.items = [['0']];
         fixture.detectChanges();
         fixture.debugElement.componentInstance.items = [['1']];

         detectChangesAndCheck(fixture, '1');
       }));

    describe('expressions evaluating to objects', () => {

      it('should add classes specified in an object literal', async(() => {
           let template = '<div [ngClass]="{foo: true, bar: false}"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           detectChangesAndCheck(fixture, 'foo');
         }));


      it('should add classes specified in an object literal without change in class names',
         async(() => {
           let template = `<div [ngClass]="{'foo-bar': true, 'fooBar': true}"></div>`;
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           detectChangesAndCheck(fixture, 'foo-bar fooBar');
         }));

      it('should add and remove classes based on changes in object literal values', async(() => {
           let template = '<div [ngClass]="{foo: condition, bar: !condition}"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           detectChangesAndCheck(fixture, 'foo');

           fixture.debugElement.componentInstance.condition = false;
           detectChangesAndCheck(fixture, 'bar');
         }));

      it('should add and remove classes based on changes to the expression object', async(() => {
           let template = '<div [ngClass]="objExpr"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           detectChangesAndCheck(fixture, 'foo');

           StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
           detectChangesAndCheck(fixture, 'foo bar');

           StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'baz', true);
           detectChangesAndCheck(fixture, 'foo bar baz');

           StringMapWrapper.delete(fixture.debugElement.componentInstance.objExpr, 'bar');
           detectChangesAndCheck(fixture, 'foo baz');
         }));

      it('should add and remove classes based on reference changes to the expression object',
         async(() => {
           let template = '<div [ngClass]="objExpr"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           detectChangesAndCheck(fixture, 'foo');

           fixture.debugElement.componentInstance.objExpr = {foo: true, bar: true};
           detectChangesAndCheck(fixture, 'foo bar');

           fixture.debugElement.componentInstance.objExpr = {baz: true};
           detectChangesAndCheck(fixture, 'baz');
         }));

      it('should remove active classes when expression evaluates to null', async(() => {
           let template = '<div [ngClass]="objExpr"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           detectChangesAndCheck(fixture, 'foo');

           fixture.debugElement.componentInstance.objExpr = null;
           detectChangesAndCheck(fixture, '');

           fixture.debugElement.componentInstance.objExpr = {'foo': false, 'bar': true};
           detectChangesAndCheck(fixture, 'bar');
         }));


      it('should allow multiple classes per expression', async(() => {
           let template = '<div [ngClass]="objExpr"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           fixture.debugElement.componentInstance.objExpr = {'bar baz': true, 'bar1 baz1': true};
           detectChangesAndCheck(fixture, 'bar baz bar1 baz1');

           fixture.debugElement.componentInstance.objExpr = {'bar baz': false, 'bar1 baz1': true};
           detectChangesAndCheck(fixture, 'bar1 baz1');
         }));

      it('should split by one or more spaces between classes', async(() => {
           let template = '<div [ngClass]="objExpr"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           fixture.debugElement.componentInstance.objExpr = {'foo bar     baz': true};
           detectChangesAndCheck(fixture, 'foo bar baz');
         }));

    });

    describe('expressions evaluating to lists', () => {

      it('should add classes specified in a list literal', async(() => {
           let template = `<div [ngClass]="['foo', 'bar', 'foo-bar', 'fooBar']"></div>`;
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           detectChangesAndCheck(fixture, 'foo bar foo-bar fooBar');
         }));

      it('should add and remove classes based on changes to the expression', async(() => {
           let template = '<div [ngClass]="arrExpr"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           var arrExpr: string[] = fixture.debugElement.componentInstance.arrExpr;
           detectChangesAndCheck(fixture, 'foo');

           arrExpr.push('bar');
           detectChangesAndCheck(fixture, 'foo bar');

           arrExpr[1] = 'baz';
           detectChangesAndCheck(fixture, 'foo baz');

           ListWrapper.remove(fixture.debugElement.componentInstance.arrExpr, 'baz');
           detectChangesAndCheck(fixture, 'foo');
         }));

      it('should add and remove classes when a reference changes', async(() => {
           let template = '<div [ngClass]="arrExpr"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           detectChangesAndCheck(fixture, 'foo');

           fixture.debugElement.componentInstance.arrExpr = ['bar'];
           detectChangesAndCheck(fixture, 'bar');
         }));

      it('should take initial classes into account when a reference changes', async(() => {
           let template = '<div class="foo" [ngClass]="arrExpr"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           detectChangesAndCheck(fixture, 'foo');

           fixture.debugElement.componentInstance.arrExpr = ['bar'];
           detectChangesAndCheck(fixture, 'foo bar');
         }));

      it('should ignore empty or blank class names', async(() => {
           let template = '<div class="foo" [ngClass]="arrExpr"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           fixture.debugElement.componentInstance.arrExpr = ['', '  '];
           detectChangesAndCheck(fixture, 'foo');
         }));

      it('should trim blanks from class names', async(() => {
           var template = '<div class="foo" [ngClass]="arrExpr"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           fixture.debugElement.componentInstance.arrExpr = [' bar  '];
           detectChangesAndCheck(fixture, 'foo bar');
         }));


      it('should allow multiple classes per item in arrays', async(() => {
           var template = '<div [ngClass]="arrExpr"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           fixture.debugElement.componentInstance.arrExpr = ['foo bar baz', 'foo1 bar1   baz1'];
           detectChangesAndCheck(fixture, 'foo bar baz foo1 bar1 baz1');

           fixture.debugElement.componentInstance.arrExpr = ['foo bar   baz foobar'];
           detectChangesAndCheck(fixture, 'foo bar baz foobar');
         }));
    });

    describe('expressions evaluating to sets', () => {

      it('should add and remove classes if the set instance changed', async(() => {
           var template = '<div [ngClass]="setExpr"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           var setExpr = new Set<string>();
           setExpr.add('bar');
           fixture.debugElement.componentInstance.setExpr = setExpr;
           detectChangesAndCheck(fixture, 'bar');

           setExpr = new Set<string>();
           setExpr.add('baz');
           fixture.debugElement.componentInstance.setExpr = setExpr;
           detectChangesAndCheck(fixture, 'baz');
         }));
    });

    describe('expressions evaluating to string', () => {

      it('should add classes specified in a string literal', async(() => {
           var template = `<div [ngClass]="'foo bar foo-bar fooBar'"></div>`;
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           detectChangesAndCheck(fixture, 'foo bar foo-bar fooBar');
         }));

      it('should add and remove classes based on changes to the expression', async(() => {
           var template = '<div [ngClass]="strExpr"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           detectChangesAndCheck(fixture, 'foo');

           fixture.debugElement.componentInstance.strExpr = 'foo bar';
           detectChangesAndCheck(fixture, 'foo bar');


           fixture.debugElement.componentInstance.strExpr = 'baz';
           detectChangesAndCheck(fixture, 'baz');

         }));

      it('should remove active classes when switching from string to null', async(() => {
           var template = `<div [ngClass]="strExpr"></div>`;
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           detectChangesAndCheck(fixture, 'foo');

           fixture.debugElement.componentInstance.strExpr = null;
           detectChangesAndCheck(fixture, '');

         }));

      it('should take initial classes into account when switching from string to null',
         async(() => {
           var template = `<div class="foo" [ngClass]="strExpr"></div>`;
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           detectChangesAndCheck(fixture, 'foo');

           fixture.debugElement.componentInstance.strExpr = null;
           detectChangesAndCheck(fixture, 'foo');

         }));

      it('should ignore empty and blank strings', async(() => {
           var template = `<div class="foo" [ngClass]="strExpr"></div>`;
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           fixture.debugElement.componentInstance.strExpr = '';
           detectChangesAndCheck(fixture, 'foo');

         }));

    });

    describe('cooperation with other class-changing constructs', () => {

      it('should co-operate with the class attribute', async(() => {
           var template = '<div [ngClass]="objExpr" class="init foo"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
           detectChangesAndCheck(fixture, 'init foo bar');

           StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'foo', false);
           detectChangesAndCheck(fixture, 'init bar');

           fixture.debugElement.componentInstance.objExpr = null;
           detectChangesAndCheck(fixture, 'init foo');

         }));

      it('should co-operate with the interpolated class attribute', async(() => {
           var template = `<div [ngClass]="objExpr" class="{{'init foo'}}"></div>`;
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
           detectChangesAndCheck(fixture, `init foo bar`);

           StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'foo', false);
           detectChangesAndCheck(fixture, `init bar`);

           fixture.debugElement.componentInstance.objExpr = null;
           detectChangesAndCheck(fixture, `init foo`);

         }));

      it('should co-operate with the class attribute and binding to it', async(() => {
           var template = `<div [ngClass]="objExpr" class="init" [class]="'foo'"></div>`;
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
           detectChangesAndCheck(fixture, `init foo bar`);

           StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'foo', false);
           detectChangesAndCheck(fixture, `init bar`);

           fixture.debugElement.componentInstance.objExpr = null;
           detectChangesAndCheck(fixture, `init foo`);

         }));

      it('should co-operate with the class attribute and class.name binding', async(() => {
           var template =
               '<div class="init foo" [ngClass]="objExpr" [class.baz]="condition"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           detectChangesAndCheck(fixture, 'init foo baz');

           StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
           detectChangesAndCheck(fixture, 'init foo baz bar');

           StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'foo', false);
           detectChangesAndCheck(fixture, 'init baz bar');

           fixture.debugElement.componentInstance.condition = false;
           detectChangesAndCheck(fixture, 'init bar');

         }));

      it('should co-operate with initial class and class attribute binding when binding changes',
         async(() => {
           var template = '<div class="init" [ngClass]="objExpr" [class]="strExpr"></div>';
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);
           detectChangesAndCheck(fixture, 'init foo');

           StringMapWrapper.set(fixture.debugElement.componentInstance.objExpr, 'bar', true);
           detectChangesAndCheck(fixture, 'init foo bar');

           fixture.debugElement.componentInstance.strExpr = 'baz';
           detectChangesAndCheck(fixture, 'init bar baz foo');

           fixture.debugElement.componentInstance.objExpr = null;
           detectChangesAndCheck(fixture, 'init baz');
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
  objExpr = {'foo': true, 'bar': false};
  strExpr = 'foo';

  constructor() { this.setExpr.add('foo'); }
}
