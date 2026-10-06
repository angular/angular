/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
// Make the `$localize()` global function available to the compiled templates, and the direct calls
// below. This would normally be done inside the application `polyfills.ts` file.
import '@angular/localize/init';

import {expect} from '@angular/private/testing/matchers';
import {AfterViewInit, Component, Directive, Input, QueryList, ViewChildren} from '../../src/core';
import {TestBed} from '../../testing';

describe('<ng-container>', function () {
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
    TestBed.overrideComponent(MyComp, {set: {template, imports: [Simple]}});
    const fixture = TestBed.createComponent(MyComp);

    fixture.detectChanges();

    const el = fixture.nativeElement;
    expect(el).toHaveText('SIMPLE(12)');
  });

  it('should support injecting the container from children', () => {
    const template = `<ng-container [text]="'container'"><p></p></ng-container>`;
    TestBed.overrideComponent(MyComp, {set: {template, imports: [TextDirective]}});
    const fixture = TestBed.createComponent(MyComp);

    fixture.detectChanges();

    const dir = fixture.debugElement.children[0].injector.get(TextDirective);
    expect(dir).toBeInstanceOf(TextDirective);
    expect(dir.text).toEqual('container');
  });

  it('should contain all child directives in a <ng-container> (view dom)', () => {
    const template = '<needs-view-children #q></needs-view-children>';
    TestBed.overrideComponent(MyComp, {
      set: {template, imports: [NeedsViewChildren, TextDirective]},
    });
    const fixture = TestBed.createComponent(MyComp);

    fixture.detectChanges();
    const q = fixture.debugElement.children[0].references['q'];
    fixture.detectChanges();

    expect(q.textDirChildren.length).toEqual(1);
    expect(q.numberOfChildrenAfterViewInit).toEqual(1);
  });
});

@Directive({
  selector: '[text]',
})
class TextDirective {
  @Input() public text: string | null = null;
}

@Component({
  selector: 'needs-view-children',
  template: '<div text></div>',
  imports: [TextDirective],
})
class NeedsViewChildren implements AfterViewInit {
  @ViewChildren(TextDirective) textDirChildren!: QueryList<TextDirective>;
  numberOfChildrenAfterViewInit: number | undefined;

  ngAfterViewInit() {
    this.numberOfChildrenAfterViewInit = this.textDirChildren.length;
  }
}

@Component({
  selector: 'simple',
  template: 'SIMPLE(<ng-content></ng-content>)',
})
class Simple {}

@Component({
  template: '',
})
class MyComp {
  ctxBoolProp: boolean = false;
}
