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

import {TreeNodeComponent} from './tree-node.component';
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
    await TestBed.configureTestingModule({
      imports: [TreeNodeComponent],
    }).compileComponents();

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render node name', () => {
    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'app-test',
    } as FlatNode);
    fixture.detectChanges();

    const name = fixture.debugElement.query(By.css('.node-name'));

    expect(name.nativeElement.innerText).toEqual('app-test');
  });

  it('should include directive name, if any', () => {
    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'app-test',
      directives: ['TooltipDirective'],
    } as FlatNode);
    fixture.detectChanges();

    const name = fixture.debugElement.query(By.css('.node-name'));

    expect(name.nativeElement.innerText).toEqual('app-test[TooltipDirective]');
  });

  it('should include directive names (multiple), if any', () => {
    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'app-test',
      directives: ['TooltipDirective', 'CtxMenuDirective'],
    } as FlatNode);
    fixture.detectChanges();

    const name = fixture.debugElement.query(By.css('.node-name'));

    expect(name.nativeElement.innerText).toEqual('app-test[TooltipDirective][CtxMenuDirective]');
  });

  it('should render "OnPush" label, if OnPush', () => {
    let onPush = fixture.debugElement.query(By.css('.on-push'));
    expect(onPush).toBeFalsy();

    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'app-test',
      onPush: true,
    } as FlatNode);
    fixture.detectChanges();

    onPush = fixture.debugElement.query(By.css('.on-push'));

    expect(onPush).toBeTruthy();
  });

  it('should handle selection', () => {
    const consoleRef = fixture.debugElement.query(By.css('.console-reference'));
    expect(getComputedStyle(consoleRef.nativeElement).display).toEqual('none');

    fixture.componentRef.setInput('selectedNode', {id: 'node'});
    fixture.detectChanges();

    expect(getComputedStyle(consoleRef.nativeElement).display).toEqual('block');
    expect(fixture.debugElement.nativeElement.classList.contains('selected')).toBeTrue();
  });

  it('should handle highlighting', () => {
    fixture.componentRef.setInput('highlightedId', 1337);
    fixture.detectChanges();

    const classList = fixture.debugElement.nativeElement.classList;
    expect(classList.contains('highlighted')).toBeTrue();
  });

  it('should add respective class, if a new node', () => {
    fixture.componentRef.setInput('node', {
      ...srcNode,
      newItem: true,
    } as FlatNode);
    fixture.detectChanges();

    const classList = fixture.debugElement.nativeElement.classList;
    expect(classList.contains('new-node')).toBeTrue();
  });

  it('should mark the text that matches the filter', () => {
    fixture.componentRef.setInput('textMatch', {startIdx: 3, endIdx: 27});
    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'my-long-component-name[WithADirective]',
    } as FlatNode);
    fixture.detectChanges();

    const marked = fixture.debugElement.query(By.css('mark'));
    expect(marked.nativeElement.innerText).toEqual('long-component-name[With');
  });

  it('should mark the text that matches the filter (beginning of the string)', () => {
    fixture.componentRef.setInput('textMatch', {startIdx: 0, endIdx: 9});
    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'app-large-component',
    } as FlatNode);
    fixture.detectChanges();

    const marked = fixture.debugElement.query(By.css('mark'));
    expect(marked.nativeElement.innerText).toEqual('app-large');
  });

  it('should mark the text that matches the filter (end of the string)', () => {
    fixture.componentRef.setInput('textMatch', {startIdx: 10, endIdx: 19});
    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'app-large-component',
    } as FlatNode);
    fixture.detectChanges();

    const marked = fixture.debugElement.query(By.css('mark'));
    expect(marked.nativeElement.innerText).toEqual('component');
  });

  it('should mark the whole text, if it matches completely the filter', () => {
    fixture.componentRef.setInput('textMatch', {startIdx: 0, endIdx: 8});
    fixture.componentRef.setInput('node', {
      ...srcNode,
      name: 'app-test',
    } as FlatNode);
    fixture.detectChanges();

    const marked = fixture.debugElement.query(By.css('mark'));
    expect(marked.nativeElement.innerText).toEqual('app-test');
  });
});
