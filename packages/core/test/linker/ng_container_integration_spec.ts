/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Make the `$localize()` global function available to the compiled templates, and the direct calls
// below. This would normally be done inside the application `polyfills.ts` file.
import '@angular/localize/init';

import {AfterContentInit, AfterViewInit, Component, ContentChildren, Directive, Input, QueryList, ViewChildren} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {expect} from '@angular/platform-browser/testing/src/matchers';

describe('<ng-container>', function() {
  beforeEach(() => {
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

  it('should contain all child directives in a <ng-container> (view dom)', () => {
    const template = '<needs-view-children #q></needs-view-children>';
    TestBed.overrideComponent(MyComp, {set: {template}});
    const fixture = TestBed.createComponent(MyComp);

    fixture.detectChanges();
    const q = fixture.debugElement.children[0].references!['q'];
    fixture.detectChanges();

    expect(q.textDirChildren.length).toEqual(1);
    expect(q.numberOfChildrenAfterViewInit).toEqual(1);
  });
});

@Directive({selector: '[text]'})
class TextDirective {
  @Input() public text: string|null = null;
}

@Component({selector: 'needs-content-children', template: ''})
class NeedsContentChildren implements AfterContentInit {
  // TODO(issue/24571): remove '!'.
  @ContentChildren(TextDirective) textDirChildren!: QueryList<TextDirective>;
  // TODO(issue/24571): remove '!'.
  numberOfChildrenAfterContentInit!: number;

  ngAfterContentInit() {
    this.numberOfChildrenAfterContentInit = this.textDirChildren.length;
  }
}

@Component({selector: 'needs-view-children', template: '<div text></div>'})
class NeedsViewChildren implements AfterViewInit {
  // TODO(issue/24571): remove '!'.
  @ViewChildren(TextDirective) textDirChildren!: QueryList<TextDirective>;
  // TODO(issue/24571): remove '!'.
  numberOfChildrenAfterViewInit!: number;

  ngAfterViewInit() {
    this.numberOfChildrenAfterViewInit = this.textDirChildren.length;
  }
}

@Component({selector: 'simple', template: 'SIMPLE(<ng-content></ng-content>)'})
class Simple {
}

@Component({selector: 'my-comp', template: ''})
class MyComp {
  ctxBoolProp: boolean = false;
}
