/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {FlatTreeControl} from '@angular/cdk/tree';

import {NodeTextMatch, TreeNodeComponent} from './tree-node.component';
import {FlatNode} from '../component-data-source';

type DeepPartial<T> = T extends object ? {[P in keyof T]?: DeepPartial<T[P]>} : T;

const srcNode = {
  id: 'node',
  original: {
    component: {
      id: 1337,
    },
  },
} as DeepPartial<FlatNode>;

describe('TreeNodeComponent', () => {
  let component: TreeNodeComponent;
  let fixture: ComponentFixture<TreeNodeComponent>;

  beforeEach(async () => {
    fixture = TestBed.createComponent(TreeNodeComponent);
    component = fixture.componentInstance;
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

  it('should render "OnPush" label, if OnPush', async () => {
    let onPush = fixture.debugElement.query(By.css('.on-push'));
    expect(onPush).toBeFalsy();

    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'app-test',
      onPush: true,
    });
    await fixture.whenStable();

    onPush = fixture.debugElement.query(By.css('.trait'));

    expect(onPush.nativeElement.textContent).toEqual('OnPush');
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
});
