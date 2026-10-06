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
import {By} from '@angular/platform-browser';
import {expect} from '@angular/private/testing/matchers';
import {CommonModule, NgFor, NgForOf, NgIf} from '../../index';

let thisArg: any;

describe('ngFor', () => {
  let fixture: ComponentFixture<any>;

  function getComponent(): TestComponent {
    return fixture.componentInstance;
  }

  async function detectChangesAndExpectText(text: string): Promise<void> {
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(fixture.nativeElement).toHaveText(text);
  }

  afterEach(() => {
    fixture = null as any;
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
    });
  });

  it('should reflect initial elements', async () => {
    fixture = createTestComponent();

    await detectChangesAndExpectText('1;2;');
  });

  it('should reflect added elements', async () => {
    fixture = createTestComponent();
    await fixture.whenStable();
    getComponent().items.push(3);
    await detectChangesAndExpectText('1;2;3;');
  });

  it('should reflect removed elements', async () => {
    fixture = createTestComponent();
    await fixture.whenStable();
    getComponent().items.splice(1, 1);
    await detectChangesAndExpectText('1;');
  });

  it('should reflect moved elements', async () => {
    fixture = createTestComponent();
    await fixture.whenStable();
    getComponent().items.splice(0, 1);
    getComponent().items.push(1);
    await detectChangesAndExpectText('2;1;');
  });

  it('should reflect a mix of all changes (additions/removals/moves)', async () => {
    fixture = createTestComponent();

    getComponent().items = [0, 1, 2, 3, 4, 5];
    await fixture.whenStable();

    getComponent().items = [6, 2, 7, 0, 4, 8];

    await detectChangesAndExpectText('6;2;7;0;4;8;');
  });

  it('should iterate over an array of objects', async () => {
    const template = '<ul><li *ngFor="let item of items">{{item["name"]}};</li></ul>';
    fixture = createTestComponent(template);

    // INIT
    getComponent().items = [{'name': 'misko'}, {'name': 'shyam'}];
    await detectChangesAndExpectText('misko;shyam;');

    // GROW
    getComponent().items.push({'name': 'adam'});
    await detectChangesAndExpectText('misko;shyam;adam;');

    // SHRINK
    getComponent().items.splice(2, 1);
    getComponent().items.splice(0, 1);
    await detectChangesAndExpectText('shyam;');
  });

  it('should gracefully handle nulls', async () => {
    const template = '<ul><li *ngFor="let item of null">{{item}};</li></ul>';
    fixture = createTestComponent(template);

    await detectChangesAndExpectText('');
  });

  it('should gracefully handle ref changing to null and back', async () => {
    fixture = createTestComponent();

    await detectChangesAndExpectText('1;2;');

    getComponent().items = null!;
    await detectChangesAndExpectText('');

    getComponent().items = [1, 2, 3];
    await detectChangesAndExpectText('1;2;3;');
  });

  it('should throw on non-iterable ref', async () => {
    fixture = createTestComponent();

    getComponent().items = <any>'whaaa';
    expect(() => fixture.detectChanges()).toThrowError(
      /NG02200: Cannot find a differ supporting object 'whaaa' of type 'string'\. NgFor only supports binding to Iterables, such as Arrays\. Find more at https:\/\/(?:next\.)?angular\.dev\/errors\/NG02200/,
    );
  });

  it('should throw on non-iterable ref and suggest using an array ', () => {
    fixture = createTestComponent();

    getComponent().items = <any>{'stuff': 'whaaa'};
    expect(() => fixture.detectChanges()).toThrowError(
      /NG02200: Cannot find a differ supporting object '\[object Object\]' of type 'object'\. NgFor only supports binding to Iterables, such as Arrays\. Did you mean to use the keyvalue pipe\? Find more at https:\/\/(?:next\.)?angular\.dev\/errors\/NG02200/,
    );
  });

  it('should throw on ref changing to string', async () => {
    fixture = createTestComponent();

    await detectChangesAndExpectText('1;2;');

    getComponent().items = <any>'whaaa';
    expect(() => fixture.detectChanges()).toThrowError();
  });

  it('should works with duplicates', async () => {
    fixture = createTestComponent();

    const a = new Foo();
    getComponent().items = [a, a];
    await detectChangesAndExpectText('foo;foo;');
  });

  it('should repeat over nested arrays', async () => {
    const template =
      '<div *ngFor="let item of items">' +
      '<div *ngFor="let subitem of item">{{subitem}}-{{item.length}};</div>|' +
      '</div>';
    fixture = createTestComponent(template);

    getComponent().items = [['a', 'b'], ['c']];
    await detectChangesAndExpectText('a-2;b-2;|c-1;|');

    getComponent().items = [['e'], ['f', 'g']];
    await detectChangesAndExpectText('e-1;|f-2;g-2;|');
  });

  it('should repeat over nested arrays with no intermediate element', async () => {
    const template =
      '<div *ngFor="let item of items">' +
      '<div *ngFor="let subitem of item">{{subitem}}-{{item.length}};</div>' +
      '</div>';
    fixture = createTestComponent(template);

    getComponent().items = [['a', 'b'], ['c']];
    await detectChangesAndExpectText('a-2;b-2;c-1;');

    getComponent().items = [['e'], ['f', 'g']];
    await detectChangesAndExpectText('e-1;f-2;g-2;');
  });

  it('should repeat over nested ngIf that are the last node in the ngFor template', async () => {
    const template =
      `<div *ngFor="let item of items; let i=index">` +
      `<div>{{i}}|</div>` +
      `<div *ngIf="i % 2 == 0">even|</div>` +
      `</div>`;

    fixture = createTestComponent(template);

    const items = [1];
    getComponent().items = items;
    await detectChangesAndExpectText('0|even|');

    items.push(1);
    await detectChangesAndExpectText('0|even|1|');

    items.push(1);
    await detectChangesAndExpectText('0|even|1|2|even|');
  });

  it('should allow of saving the collection', async () => {
    const template =
      '<ul><li *ngFor="let item of items as collection; index as i">{{i}}/{{collection.length}} - {{item}};</li></ul>';
    fixture = createTestComponent(template);

    await detectChangesAndExpectText('0/2 - 1;1/2 - 2;');

    getComponent().items = [1, 2, 3];
    await detectChangesAndExpectText('0/3 - 1;1/3 - 2;2/3 - 3;');
  });

  it('should display indices correctly', async () => {
    const template = '<span *ngFor ="let item of items; let i=index">{{i.toString()}}</span>';
    fixture = createTestComponent(template);

    getComponent().items = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    await detectChangesAndExpectText('0123456789');

    getComponent().items = [1, 2, 6, 7, 4, 3, 5, 8, 9, 0];
    await detectChangesAndExpectText('0123456789');
  });

  it('should display count correctly', async () => {
    const template = '<span *ngFor="let item of items; let len=count">{{len}}</span>';
    fixture = createTestComponent(template);

    getComponent().items = [0, 1, 2];
    await detectChangesAndExpectText('333');

    getComponent().items = [4, 3, 2, 1, 0, -1];
    await detectChangesAndExpectText('666666');
  });

  it('should display first item correctly', async () => {
    const template =
      '<span *ngFor="let item of items; let isFirst=first">{{isFirst.toString()}}</span>';
    fixture = createTestComponent(template);

    getComponent().items = [0, 1, 2];
    await detectChangesAndExpectText('truefalsefalse');

    getComponent().items = [2, 1];
    await detectChangesAndExpectText('truefalse');
  });

  it('should display last item correctly', async () => {
    const template =
      '<span *ngFor="let item of items; let isLast=last">{{isLast.toString()}}</span>';
    fixture = createTestComponent(template);

    getComponent().items = [0, 1, 2];
    await detectChangesAndExpectText('falsefalsetrue');

    getComponent().items = [2, 1];
    await detectChangesAndExpectText('falsetrue');
  });

  it('should display even items correctly', async () => {
    const template =
      '<span *ngFor="let item of items; let isEven=even">{{isEven.toString()}}</span>';
    fixture = createTestComponent(template);

    getComponent().items = [0, 1, 2];
    await detectChangesAndExpectText('truefalsetrue');

    getComponent().items = [2, 1];
    await detectChangesAndExpectText('truefalse');
  });

  it('should display odd items correctly', async () => {
    const template = '<span *ngFor="let item of items; let isOdd=odd">{{isOdd.toString()}}</span>';
    fixture = createTestComponent(template);

    getComponent().items = [0, 1, 2, 3];
    await detectChangesAndExpectText('falsetruefalsetrue');

    getComponent().items = [2, 1];
    await detectChangesAndExpectText('falsetrue');
  });

  it('should allow to use a custom template', async () => {
    const template =
      '<ng-container *ngFor="let item of items; template: tpl"></ng-container>' +
      '<ng-template let-item let-i="index" #tpl><p>{{i}}: {{item}};</p></ng-template>';
    fixture = createTestComponent(template);
    getComponent().items = ['a', 'b', 'c'];
    await fixture.whenStable();
    await detectChangesAndExpectText('0: a;1: b;2: c;');
  });

  it('should use a default template if a custom one is null', async () => {
    const template = `<ul><ng-container *ngFor="let item of items; template: null; let i=index">{{i}}: {{item}};</ng-container></ul>`;
    fixture = createTestComponent(template);
    getComponent().items = ['a', 'b', 'c'];
    await fixture.whenStable();
    await detectChangesAndExpectText('0: a;1: b;2: c;');
  });

  it('should use a custom template when both default and a custom one are present', async () => {
    const template =
      '<ng-container *ngFor="let item of items; template: tpl">{{i}};</ng-container>' +
      '<ng-template let-item let-i="index" #tpl>{{i}}: {{item}};</ng-template>';
    fixture = createTestComponent(template);
    getComponent().items = ['a', 'b', 'c'];
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    await detectChangesAndExpectText('0: a;1: b;2: c;');
  });

  describe('track by', () => {
    it('should console.warn if trackBy is not a function', async () => {
      // TODO(vicb): expect a warning message when we have a proper log service
      const template = `<p *ngFor="let item of items; trackBy: value"></p>`;
      fixture = createTestComponent(template);
      fixture.componentInstance.value = 0;
      fixture.changeDetectorRef.markForCheck();
      await fixture.whenStable();
    });

    it('should track by identity when trackBy is to `null` or `undefined`', async () => {
      // TODO(vicb): expect no warning message when we have a proper log service
      const template = `<p *ngFor="let item of items; trackBy: value">{{ item }}</p>`;
      fixture = createTestComponent(template);
      fixture.componentInstance.items = ['a', 'b', 'c'];
      fixture.componentInstance.value = null;
      await detectChangesAndExpectText('abc');
      fixture.componentInstance.value = undefined;
      await detectChangesAndExpectText('abc');
    });

    it('should set the context to the component instance', async () => {
      const template = `<p *ngFor="let item of items; trackBy: trackByContext.bind(this)"></p>`;
      fixture = createTestComponent(template);

      thisArg = null;
      fixture.changeDetectorRef.markForCheck();
      await fixture.whenStable();
      expect(thisArg).toBe(getComponent());
    });

    it('should not replace tracked items', async () => {
      const template = `<p *ngFor="let item of items; trackBy: trackById; let i=index">{{items[i]}}</p>`;
      fixture = createTestComponent(template);

      const buildItemList = async () => {
        getComponent().items = [{'id': 'a'}];
        fixture.changeDetectorRef.markForCheck();
        await fixture.whenStable();
        return fixture.debugElement.queryAll(By.css('p'))[0];
      };

      const firstP = await buildItemList();
      const finalP = await buildItemList();
      expect(finalP.nativeElement).toBe(firstP.nativeElement);
    });

    it('should update implicit local variable on view', async () => {
      const template = `<div *ngFor="let item of items; trackBy: trackById">{{item['color']}}</div>`;
      fixture = createTestComponent(template);

      getComponent().items = [{'id': 'a', 'color': 'blue'}];
      await detectChangesAndExpectText('blue');

      getComponent().items = [{'id': 'a', 'color': 'red'}];
      await detectChangesAndExpectText('red');
    });

    it('should move items around and keep them updated ', async () => {
      const template = `<div *ngFor="let item of items; trackBy: trackById">{{item['color']}}</div>`;
      fixture = createTestComponent(template);

      getComponent().items = [
        {'id': 'a', 'color': 'blue'},
        {'id': 'b', 'color': 'yellow'},
      ];
      await detectChangesAndExpectText('blueyellow');

      getComponent().items = [
        {'id': 'b', 'color': 'orange'},
        {'id': 'a', 'color': 'red'},
      ];
      await detectChangesAndExpectText('orangered');
    });

    it('should handle added and removed items properly when tracking by index', async () => {
      const template = `<div *ngFor="let item of items; trackBy: trackByIndex">{{item}}</div>`;
      fixture = createTestComponent(template);

      getComponent().items = ['a', 'b', 'c', 'd'];
      fixture.changeDetectorRef.markForCheck();
      await fixture.whenStable();
      getComponent().items = ['e', 'f', 'g', 'h'];
      fixture.changeDetectorRef.markForCheck();
      await fixture.whenStable();
      getComponent().items = ['e', 'f', 'h'];
      await detectChangesAndExpectText('efh');
    });
  });

  it('should be available as a standalone directive', async () => {
    @Component({
      imports: [NgForOf],
      template: ` <ng-container *ngFor="let item of items">{{ item }}|</ng-container> `,
    })
    class TestComponent {
      items = [1, 2, 3];
    }

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('1|2|3|');
  });

  it('should be available as a standalone directive using an `NgFor` alias', async () => {
    @Component({
      imports: [NgFor],
      template: ` <ng-container *ngFor="let item of items">{{ item }}|</ng-container> `,
    })
    class TestComponent {
      items = [1, 2, 3];
    }

    const fixture = TestBed.createComponent(TestComponent);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('1|2|3|');
  });
});

class Foo {
  toString() {
    return 'foo';
  }
}

@Component({
  template: '',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [NgFor, NgForOf],
})
class TestComponent {
  value: any;
  items: any[] = [1, 2];
  trackById(index: number, item: any): string {
    return item['id'];
  }
  trackByIndex(index: number, item: any): number {
    return index;
  }
  trackByContext(): void {
    thisArg = this;
  }
}

const TEMPLATE = '<div><span *ngFor="let item of items">{{item.toString()}};</span></div>';

function createTestComponent(template: string = TEMPLATE): ComponentFixture<TestComponent> {
  return TestBed.overrideComponent(TestComponent, {
    set: {template: template, imports: [NgFor, NgForOf, NgIf]},
  }).createComponent(TestComponent);
}
