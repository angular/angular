/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {signal} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {FlatTreeControl} from '@angular/cdk/tree';

import {NodeTextMatch, TreeNodeComponent} from './tree-node.component';
import {FlatNode} from '../component-data-source';
import {APP_DATA, AppData} from '../../../../application-providers/app_data';
import {ChangeDetection} from '../../../../../../../protocol';

type DeepPartial<T> = T extends object ? {[P in keyof T]?: DeepPartial<T[P]>} : T;

const srcNode = {
  id: 'node',
  original: {
    component: {
      id: 1337,
    },
  },
} as DeepPartial<FlatNode>;

async function configureTestingModule(appData?: Partial<AppData>) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      {
        provide: APP_DATA,
        useValue: signal<AppData>({
          devMode: true,
          ivy: true,
          hydration: false,
          fullVersion: '0.0.0',
          majorVersion: 0,
          minorVersion: 0,
          patchVersion: 0,
          ...appData,
        }),
      },
    ],
  });

  const fixture = TestBed.createComponent(TreeNodeComponent);
  const component = fixture.componentInstance;
  fixture.componentRef.setInput('node', srcNode);
  fixture.componentRef.setInput('selectedNode', null);
  fixture.componentRef.setInput('highlightedId', 0);
  fixture.componentRef.setInput(
    'treeControl',
    new FlatTreeControl<FlatNode>(
      (node) => node!.level,
      (node) => node.expandable,
    ),
  );

  await fixture.whenStable();

  return {fixture, component};
}

describe('TreeNodeComponent', () => {
  let component: TreeNodeComponent;
  let fixture: ComponentFixture<TreeNodeComponent>;

  beforeEach(async () => {
    const module = await configureTestingModule();
    component = module.component;
    fixture = module.fixture;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render node name', async () => {
    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'app-test',
    });
    await fixture.whenStable();

    const name = fixture.debugElement.query(By.css('.node-name'));

    expect(name.nativeElement.innerText).toEqual('app-test');
  });

  it('should include directive name, if any', async () => {
    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'app-test',
      directives: ['TooltipDirective'],
    });
    await fixture.whenStable();

    const name = fixture.debugElement.query(By.css('.node-name'));

    expect(name.nativeElement.innerText).toEqual('app-test[TooltipDirective]');
  });

  it('should include directive names (multiple), if any', async () => {
    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'app-test',
      directives: ['TooltipDirective', 'CtxMenuDirective'],
    });
    await fixture.whenStable();

    const name = fixture.debugElement.query(By.css('.node-name'));

    expect(name.nativeElement.innerText).toEqual('app-test[TooltipDirective][CtxMenuDirective]');
  });

  it('should handle selection', async () => {
    const consoleRef = fixture.debugElement.query(By.css('.console-reference'));
    expect(getComputedStyle(consoleRef.nativeElement).display).toEqual('none');

    fixture.componentRef.setInput('selectedNode', {id: 'node'});
    await fixture.whenStable();

    expect(getComputedStyle(consoleRef.nativeElement).display).toEqual('block');
    expect(fixture.debugElement.nativeElement.classList.contains('selected')).toBeTrue();
  });

  it('should handle highlighting', async () => {
    fixture.componentRef.setInput('highlightedId', 1337);
    await fixture.whenStable();

    const classList = fixture.debugElement.nativeElement.classList;
    expect(classList.contains('highlighted')).toBeTrue();
  });

  it('should add respective class, if a new node', async () => {
    fixture.componentRef.setInput('node', {
      ...srcNode,
      newItem: true,
    });
    await fixture.whenStable();

    const classList = fixture.debugElement.nativeElement.classList;
    expect(classList.contains('new-node')).toBeTrue();
  });

  it('should mark the text that matches the filter', async () => {
    fixture.componentRef.setInput('textMatches', [{startIdx: 3, endIdx: 27}]);
    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'my-long-component-name[WithADirective]',
    });
    await fixture.whenStable();

    const marked = fixture.debugElement.query(By.css('mark'));
    expect(marked.nativeElement.innerText).toEqual('long-component-name[With');
  });

  it('should mark the text that matches the filter (beginning of the string)', async () => {
    fixture.componentRef.setInput('textMatches', [{startIdx: 0, endIdx: 9}]);
    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'app-large-component',
    });
    await fixture.whenStable();

    const marked = fixture.debugElement.query(By.css('mark'));
    expect(marked.nativeElement.innerText).toEqual('app-large');
  });

  it('should mark the text that matches the filter (end of the string)', async () => {
    fixture.componentRef.setInput('textMatches', [{startIdx: 10, endIdx: 19}]);
    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'app-large-component',
    });
    await fixture.whenStable();

    const marked = fixture.debugElement.query(By.css('mark'));
    expect(marked.nativeElement.innerText).toEqual('component');
  });

  it('should mark the whole text, if it matches completely the filter', async () => {
    fixture.componentRef.setInput('textMatches', [{startIdx: 0, endIdx: 8}]);
    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'app-test',
    });
    await fixture.whenStable();

    const marked = fixture.debugElement.query(By.css('mark'));
    expect(marked.nativeElement.innerText).toEqual('app-test');
  });

  it('should mark a sequence of matches', async () => {
    const matches: NodeTextMatch[] = [
      {startIdx: 0, endIdx: 8}, // app-test
      {startIdx: 13, endIdx: 16}, // Foo
      {startIdx: 24, endIdx: 26}, // az
    ];
    fixture.componentRef.setInput('textMatches', matches);
    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'app-test-cmp[Foo][Bar][Baz]',
    });
    await fixture.whenStable();

    const marked = fixture.debugElement.queryAll(By.css('mark'));

    const [appTest, foo, az] = marked;
    expect(appTest.nativeElement.innerText).toEqual('app-test');
    expect(foo.nativeElement.innerText).toEqual('Foo');
    expect(az.nativeElement.innerText).toEqual('az');
  });

  describe('Change Detection labels', () => {
    async function getCdLabel(cdStrategy: ChangeDetection, majorVersion: number) {
      let onPush = fixture.debugElement.query(By.css('.change-detection'));
      expect(onPush).toBeFalsy();

      const module = await configureTestingModule({majorVersion});
      fixture = module.fixture;

      fixture.componentRef.setInput('node', {
        ...srcNode,
        name: 'app-test',
        changeDetection: cdStrategy,
      });
      await fixture.whenStable();

      onPush = fixture.debugElement.query(By.css('.change-detection'));

      return onPush ? onPush.nativeElement.textContent : null;
    }

    it('should render "OnPush" label, if ACX', async () => {
      expect(await getCdLabel('acx-on-push', 0)).toBe('OnPush');
    });

    it('should NOT render "Default" label, if ACX', async () => {
      expect(await getCdLabel('acx-default', 0)).toBe(null);
    });

    it('should render "OnPush" label, if Angular pre-v22', async () => {
      expect(await getCdLabel('ng-on-push', 21)).toBe('OnPush');
    });

    it('should NOT render "Default"/"Eager" label, if Angular pre-v22', async () => {
      expect(await getCdLabel('ng-eager', 21)).toBe(null);
    });

    it('should render "Eager" label, if Angular v22+ or v0 (dev)', async () => {
      expect(await getCdLabel('ng-eager', 22)).toBe('Eager');
    });

    it('should NOT render "OnPush" label, if Angular v22+', async () => {
      expect(await getCdLabel('ng-on-push', 22)).toBe(null);
    });

    it('should render "Eager" label, if Angular v0 (dev)', async () => {
      expect(await getCdLabel('ng-eager', 0)).toBe('Eager');
    });
  });
});
