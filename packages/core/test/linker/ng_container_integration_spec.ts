/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {AfterContentInit, AfterViewInit, Component, ContentChildren, Directive, Input, QueryList, ViewChildren} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {getDOM} from '@angular/platform-browser/src/dom/dom_adapter';
import {expect} from '@angular/platform-browser/testing/src/matchers';

export function main() {
  describe('jit', () => { declareTests({useJit: true}); });
  describe('no jit', () => { declareTests({useJit: false}); });
}

function declareTests({useJit}: {useJit: boolean}) {
  describe('<ng-container>', function() {

    beforeEach(() => {
      TestBed.configureCompiler({useJit: useJit});
      TestBed.configureTestingModule({
        declarations: [
          MyComp,
          NeedsContentChildren,
          NeedsViewChildren,
          TextDirective,
          Simple,
        ],
      });
    });

    it('should support the "i18n" attribute', () => {
      const template = '<ng-container i18n>foo</ng-container>';
      TestBed.overrideComponent(MyComp, {set: {template}});
      const fixture = TestBed.createComponent(MyComp);

      fixture.detectChanges();

      const el = fixture.nativeElement;
      expect(el).toHaveText('foo');
    });

    it('should be rendered as comment with children as siblings', () => {
      const template = '<ng-container><p></p></ng-container>';
      TestBed.overrideComponent(MyComp, {set: {template}});
      const fixture = TestBed.createComponent(MyComp);

      fixture.detectChanges();

      const el = fixture.nativeElement;
      const children = getDOM().childNodes(el);
      expect(children.length).toBe(2);
      expect(getDOM().isCommentNode(children[0])).toBe(true);
      expect(getDOM().tagName(children[1]).toUpperCase()).toEqual('P');
    });

    it('should support nesting', () => {
      const template =
          '<ng-container>1</ng-container><ng-container><ng-container>2</ng-container></ng-container>';
      TestBed.overrideComponent(MyComp, {set: {template}});
      const fixture = TestBed.createComponent(MyComp);

      fixture.detectChanges();

      const el = fixture.nativeElement;
      const children = getDOM().childNodes(el);
      expect(children.length).toBe(5);
      expect(getDOM().isCommentNode(children[0])).toBe(true);
      expect(children[1]).toHaveText('1');
      expect(getDOM().isCommentNode(children[2])).toBe(true);
      expect(getDOM().isCommentNode(children[3])).toBe(true);
      expect(children[4]).toHaveText('2');
    });

    it('should group inner nodes', () => {
      const template = '<ng-container *ngIf="ctxBoolProp"><p></p><b></b></ng-container>';
      TestBed.overrideComponent(MyComp, {set: {template}});
      const fixture = TestBed.createComponent(MyComp);

      fixture.componentInstance.ctxBoolProp = true;
      fixture.detectChanges();

      const el = fixture.nativeElement;
      const children = getDOM().childNodes(el);

      expect(children.length).toBe(4);
      // ngIf anchor
      expect(getDOM().isCommentNode(children[0])).toBe(true);
      // ng-container anchor
      expect(getDOM().isCommentNode(children[1])).toBe(true);
      expect(getDOM().tagName(children[2]).toUpperCase()).toEqual('P');
      expect(getDOM().tagName(children[3]).toUpperCase()).toEqual('B');

      fixture.componentInstance.ctxBoolProp = false;
      fixture.detectChanges();

      expect(children.length).toBe(1);
      expect(getDOM().isCommentNode(children[0])).toBe(true);
    });

    it('should work with static content projection', () => {
      const template = `<simple><ng-container><p>1</p><p>2</p></ng-container></simple>`;
      TestBed.overrideComponent(MyComp, {set: {template}});
      const fixture = TestBed.createComponent(MyComp);

      fixture.detectChanges();

      const el = fixture.nativeElement;
      expect(el).toHaveText('SIMPLE(12)');
    });

    it('should support injecting the container from children', () => {
      const template = `<ng-container [text]="'container'"><p></p></ng-container>`;
      TestBed.overrideComponent(MyComp, {set: {template}});
      const fixture = TestBed.createComponent(MyComp);

      fixture.detectChanges();

      const dir = fixture.debugElement.children[0].injector.get(TextDirective);
      expect(dir).toBeAnInstanceOf(TextDirective);
      expect(dir.text).toEqual('container');
    });

    it('should contain all direct child directives in a <ng-container> (content dom)', () => {
      const template =
          '<needs-content-children #q><ng-container><div text="foo"></div></ng-container></needs-content-children>';
      TestBed.overrideComponent(MyComp, {set: {template}});
      const fixture = TestBed.createComponent(MyComp);

      fixture.detectChanges();
      const q = fixture.debugElement.children[0].references !['q'];
      fixture.detectChanges();

      expect(q.textDirChildren.length).toEqual(1);
      expect(q.numberOfChildrenAfterContentInit).toEqual(1);
    });

    it('should contain all child directives in a <ng-container> (view dom)', () => {
      const template = '<needs-view-children #q></needs-view-children>';
      TestBed.overrideComponent(MyComp, {set: {template}});
      const fixture = TestBed.createComponent(MyComp);

      fixture.detectChanges();
      const q = fixture.debugElement.children[0].references !['q'];
      fixture.detectChanges();

      expect(q.textDirChildren.length).toEqual(1);
      expect(q.numberOfChildrenAfterViewInit).toEqual(1);
    });
  });
}

@Directive({selector: '[text]'})
class TextDirective {
  @Input() public text: string|null = null;
}

@Component({selector: 'needs-content-children', template: ''})
class NeedsContentChildren implements AfterContentInit {
  @ContentChildren(TextDirective) textDirChildren: QueryList<TextDirective>;
  numberOfChildrenAfterContentInit: number;

  ngAfterContentInit() { this.numberOfChildrenAfterContentInit = this.textDirChildren.length; }
}

@Component({selector: 'needs-view-children', template: '<div text></div>'})
class NeedsViewChildren implements AfterViewInit {
  @ViewChildren(TextDirective) textDirChildren: QueryList<TextDirective>;
  numberOfChildrenAfterViewInit: number;

  ngAfterViewInit() { this.numberOfChildrenAfterViewInit = this.textDirChildren.length; }
}

@Component({selector: 'simple', template: 'SIMPLE(<ng-content></ng-content>)'})
class Simple {
}

@Component({selector: 'my-comp', template: ''})
class MyComp {
  ctxBoolProp: boolean = false;
}
