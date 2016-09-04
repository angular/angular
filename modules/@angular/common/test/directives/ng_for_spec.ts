/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, ContentChild, TemplateRef} from '@angular/core';
import {TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {expect} from '@angular/platform-browser/testing/matchers';

import {ListWrapper} from '../../src/facade/collection';

let thisArg: any;

export function main() {
  describe('ngFor', () => {
    const TEMPLATE =
        '<div><span template="ngFor let item of items">{{item.toString()}};</span></div>';

    beforeEach(() => {
      TestBed.configureTestingModule(
          {declarations: [TestComponent, ComponentUsingTestComponent], imports: [CommonModule]});
    });

    it('should reflect initial elements', async(() => {
         TestBed.overrideComponent(TestComponent, {set: {template: TEMPLATE}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('1;2;');
       }));

    it('should reflect added elements', async(() => {
         TestBed.overrideComponent(TestComponent, {set: {template: TEMPLATE}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();

         (<number[]>fixture.debugElement.componentInstance.items).push(3);
         fixture.detectChanges();

         expect(fixture.debugElement.nativeElement).toHaveText('1;2;3;');
       }));

    it('should reflect removed elements', async(() => {
         TestBed.overrideComponent(TestComponent, {set: {template: TEMPLATE}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();

         ListWrapper.removeAt(fixture.debugElement.componentInstance.items, 1);
         fixture.detectChanges();

         expect(fixture.debugElement.nativeElement).toHaveText('1;');
       }));

    it('should reflect moved elements', async(() => {
         TestBed.overrideComponent(TestComponent, {set: {template: TEMPLATE}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();

         ListWrapper.removeAt(fixture.debugElement.componentInstance.items, 0);
         (<number[]>fixture.debugElement.componentInstance.items).push(1);
         fixture.detectChanges();

         expect(fixture.debugElement.nativeElement).toHaveText('2;1;');
       }));

    it('should reflect a mix of all changes (additions/removals/moves)', async(() => {
         TestBed.overrideComponent(TestComponent, {set: {template: TEMPLATE}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.debugElement.componentInstance.items = [0, 1, 2, 3, 4, 5];
         fixture.detectChanges();

         fixture.debugElement.componentInstance.items = [6, 2, 7, 0, 4, 8];
         fixture.detectChanges();

         expect(fixture.debugElement.nativeElement).toHaveText('6;2;7;0;4;8;');
       }));

    it('should iterate over an array of objects', async(() => {
         const template = '<ul><li template="ngFor let item of items">{{item["name"]}};</li></ul>';
         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);

         // INIT
         fixture.debugElement.componentInstance.items = [{'name': 'misko'}, {'name': 'shyam'}];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('misko;shyam;');

         // GROW
         (<any[]>fixture.debugElement.componentInstance.items).push({'name': 'adam'});
         fixture.detectChanges();

         expect(fixture.debugElement.nativeElement).toHaveText('misko;shyam;adam;');

         // SHRINK
         ListWrapper.removeAt(fixture.debugElement.componentInstance.items, 2);
         ListWrapper.removeAt(fixture.debugElement.componentInstance.items, 0);
         fixture.detectChanges();

         expect(fixture.debugElement.nativeElement).toHaveText('shyam;');
       }));

    it('should gracefully handle nulls', async(() => {
         const template = '<ul><li template="ngFor let item of null">{{item}};</li></ul>';
         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('');
       }));

    it('should gracefully handle ref changing to null and back', async(() => {
         TestBed.overrideComponent(TestComponent, {set: {template: TEMPLATE}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('1;2;');

         fixture.debugElement.componentInstance.items = null;
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('');

         fixture.debugElement.componentInstance.items = [1, 2, 3];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('1;2;3;');
       }));

    it('should throw on non-iterable ref and suggest using an array', async(() => {
         TestBed.overrideComponent(TestComponent, {set: {template: TEMPLATE}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.debugElement.componentInstance.items = 'whaaa';
         expect(() => fixture.detectChanges())
             .toThrowError(
                 /Cannot find a differ supporting object 'whaaa' of type 'string'. NgFor only supports binding to Iterables such as Arrays/);
       }));

    it('should throw on ref changing to string', async(() => {
         TestBed.overrideComponent(TestComponent, {set: {template: TEMPLATE}});
         let fixture = TestBed.createComponent(TestComponent);
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('1;2;');

         fixture.debugElement.componentInstance.items = 'whaaa';
         expect(() => fixture.detectChanges()).toThrowError();
       }));

    it('should works with duplicates', async(() => {
         TestBed.overrideComponent(TestComponent, {set: {template: TEMPLATE}});
         let fixture = TestBed.createComponent(TestComponent);
         var a = new Foo();
         fixture.debugElement.componentInstance.items = [a, a];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('foo;foo;');
       }));

    it('should repeat over nested arrays', async(() => {
         const template = '<div>' +
             '<div template="ngFor let item of items">' +
             '<div template="ngFor let subitem of item">' +
             '{{subitem}}-{{item.length}};' +
             '</div>|' +
             '</div>' +
             '</div>';
         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);

         fixture.debugElement.componentInstance.items = [['a', 'b'], ['c']];
         fixture.detectChanges();
         fixture.detectChanges();
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('a-2;b-2;|c-1;|');

         fixture.debugElement.componentInstance.items = [['e'], ['f', 'g']];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('e-1;|f-2;g-2;|');
       }));

    it('should repeat over nested arrays with no intermediate element', async(() => {
         const template = '<div><template ngFor let-item [ngForOf]="items">' +
             '<div template="ngFor let subitem of item">' +
             '{{subitem}}-{{item.length}};' +
             '</div></template></div>';
         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);

         fixture.debugElement.componentInstance.items = [['a', 'b'], ['c']];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('a-2;b-2;c-1;');

         fixture.debugElement.componentInstance.items = [['e'], ['f', 'g']];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('e-1;f-2;g-2;');
       }));

    it('should repeat over nested ngIf that are the last node in the ngFor temlate', async(() => {
         const template =
             `<div><template ngFor let-item [ngForOf]="items" let-i="index"><div>{{i}}|</div>` +
             `<div *ngIf="i % 2 == 0">even|</div></template></div>`;

         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);

         const el = fixture.debugElement.nativeElement;
         const items = [1];
         fixture.debugElement.componentInstance.items = items;
         fixture.detectChanges();
         expect(el).toHaveText('0|even|');

         items.push(1);
         fixture.detectChanges();
         expect(el).toHaveText('0|even|1|');

         items.push(1);
         fixture.detectChanges();
         expect(el).toHaveText('0|even|1|2|even|');
       }));

    it('should display indices correctly', async(() => {
         const template =
             '<div><span template="ngFor: let item of items; let i=index">{{i.toString()}}</span></div>';
         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);

         fixture.debugElement.componentInstance.items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('0123456789');

         fixture.debugElement.componentInstance.items = [1, 2, 6, 7, 4, 3, 5, 8, 9, 0];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('0123456789');
       }));

    it('should display first item correctly', async(() => {
         const template =
             '<div><span template="ngFor: let item of items; let isFirst=first">{{isFirst.toString()}}</span></div>';
         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);

         fixture.debugElement.componentInstance.items = [0, 1, 2];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('truefalsefalse');

         fixture.debugElement.componentInstance.items = [2, 1];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('truefalse');
       }));

    it('should display last item correctly', async(() => {
         const template =
             '<div><span template="ngFor: let item of items; let isLast=last">{{isLast.toString()}}</span></div>';
         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);

         fixture.debugElement.componentInstance.items = [0, 1, 2];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('falsefalsetrue');

         fixture.debugElement.componentInstance.items = [2, 1];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('falsetrue');
       }));

    it('should display even items correctly', async(() => {
         const template =
             '<div><span template="ngFor: let item of items; let isEven=even">{{isEven.toString()}}</span></div>';
         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);

         fixture.debugElement.componentInstance.items = [0, 1, 2];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('truefalsetrue');

         fixture.debugElement.componentInstance.items = [2, 1];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('truefalse');
       }));

    it('should display odd items correctly', async(() => {
         const template =
             '<div><span template="ngFor: let item of items; let isOdd=odd">{{isOdd.toString()}}</span></div>';
         TestBed.overrideComponent(TestComponent, {set: {template: template}});
         let fixture = TestBed.createComponent(TestComponent);

         fixture.debugElement.componentInstance.items = [0, 1, 2, 3];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('falsetruefalsetrue');

         fixture.debugElement.componentInstance.items = [2, 1];
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement).toHaveText('falsetrue');
       }));

    it('should allow to use a custom template', async(() => {
         const tcTemplate =
             '<ul><template ngFor [ngForOf]="items" [ngForTemplate]="contentTpl"></template></ul>';
         TestBed.overrideComponent(TestComponent, {set: {template: tcTemplate}});
         const cutTemplate =
             '<test-cmp><li template="let item; let i=index">{{i}}: {{item}};</li></test-cmp>';
         TestBed.overrideComponent(ComponentUsingTestComponent, {set: {template: cutTemplate}});
         let fixture = TestBed.createComponent(ComponentUsingTestComponent);

         const testComponent = fixture.debugElement.children[0];
         testComponent.componentInstance.items = ['a', 'b', 'c'];
         fixture.detectChanges();
         expect(testComponent.nativeElement).toHaveText('0: a;1: b;2: c;');
       }));

    it('should use a default template if a custom one is null', async(() => {
         const testTemplate = `<ul><template ngFor let-item [ngForOf]="items" 
            [ngForTemplate]="contentTpl" let-i="index">{{i}}: {{item}};</template></ul>`;
         TestBed.overrideComponent(TestComponent, {set: {template: testTemplate}});
         const cutTemplate =
             '<test-cmp><li template="let item; let i=index">{{i}}: {{item}};</li></test-cmp>';
         TestBed.overrideComponent(ComponentUsingTestComponent, {set: {template: cutTemplate}});
         let fixture = TestBed.createComponent(ComponentUsingTestComponent);

         const testComponent = fixture.debugElement.children[0];
         testComponent.componentInstance.items = ['a', 'b', 'c'];
         fixture.detectChanges();
         expect(testComponent.nativeElement).toHaveText('0: a;1: b;2: c;');
       }));

    it('should use a custom template when both default and a custom one are present', async(() => {
         const testTemplate = `<ul><template ngFor let-item [ngForOf]="items"
         [ngForTemplate]="contentTpl" let-i="index">{{i}}=> {{item}};</template></ul>`;
         TestBed.overrideComponent(TestComponent, {set: {template: testTemplate}});
         const cutTemplate =
             '<test-cmp><li template="let item; let i=index">{{i}}: {{item}};</li></test-cmp>';
         TestBed.overrideComponent(ComponentUsingTestComponent, {set: {template: cutTemplate}});
         let fixture = TestBed.createComponent(ComponentUsingTestComponent);

         const testComponent = fixture.debugElement.children[0];
         testComponent.componentInstance.items = ['a', 'b', 'c'];
         fixture.detectChanges();
         expect(testComponent.nativeElement).toHaveText('0: a;1: b;2: c;');
       }));

    describe('track by', () => {
      it('should set the context to the component instance', async(() => {
           const template =
               `<template ngFor let-item [ngForOf]="items" [ngForTrackBy]="trackByContext.bind(this)"></template>`;
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           thisArg = null;
           fixture.detectChanges();
           expect(thisArg).toBe(fixture.debugElement.componentInstance);
         }));

      it('should not replace tracked items', async(() => {
           const template =
               `<template ngFor let-item [ngForOf]="items" [ngForTrackBy]="trackById" let-i="index">
               <p>{{items[i]}}</p>
              </template>`;
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           var buildItemList = () => {
             fixture.debugElement.componentInstance.items = [{'id': 'a'}];
             fixture.detectChanges();
             return fixture.debugElement.queryAll(By.css('p'))[0];
           };

           var firstP = buildItemList();
           var finalP = buildItemList();
           expect(finalP.nativeElement).toBe(firstP.nativeElement);
         }));

      it('should update implicit local variable on view', async(() => {
           const template =
               `<div><template ngFor let-item [ngForOf]="items" [ngForTrackBy]="trackById">{{item['color']}}</template></div>`;
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           fixture.debugElement.componentInstance.items = [{'id': 'a', 'color': 'blue'}];
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('blue');
           fixture.debugElement.componentInstance.items = [{'id': 'a', 'color': 'red'}];
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('red');
         }));
      it('should move items around and keep them updated ', async(() => {
           const template =
               `<div><template ngFor let-item [ngForOf]="items" [ngForTrackBy]="trackById">{{item['color']}}</template></div>`;
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           fixture.debugElement.componentInstance.items =
               [{'id': 'a', 'color': 'blue'}, {'id': 'b', 'color': 'yellow'}];
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('blueyellow');
           fixture.debugElement.componentInstance.items =
               [{'id': 'b', 'color': 'orange'}, {'id': 'a', 'color': 'red'}];
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('orangered');
         }));

      it('should handle added and removed items properly when tracking by index', async(() => {
           const template =
               `<div><template ngFor let-item [ngForOf]="items" [ngForTrackBy]="trackByIndex">{{item}}</template></div>`;
           TestBed.overrideComponent(TestComponent, {set: {template: template}});
           let fixture = TestBed.createComponent(TestComponent);

           fixture.debugElement.componentInstance.items = ['a', 'b', 'c', 'd'];
           fixture.detectChanges();
           fixture.debugElement.componentInstance.items = ['e', 'f', 'g', 'h'];
           fixture.detectChanges();
           fixture.debugElement.componentInstance.items = ['e', 'f', 'h'];
           fixture.detectChanges();
           expect(fixture.debugElement.nativeElement).toHaveText('efh');
         }));
    });
  });
}

class Foo {
  toString() { return 'foo'; }
}

@Component({selector: 'test-cmp', template: ''})
class TestComponent {
  @ContentChild(TemplateRef) contentTpl: TemplateRef<Object>;
  items: any;
  constructor() { this.items = [1, 2]; }
  trackById(index: number, item: any): string { return item['id']; }
  trackByIndex(index: number, item: any): number { return index; }
  trackByContext(): void { thisArg = this; }
}

@Component({selector: 'outer-cmp', template: ''})
class ComponentUsingTestComponent {
  items: any;
  constructor() { this.items = [1, 2]; }
}
