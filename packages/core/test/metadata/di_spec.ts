/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, Directive, ElementRef, Input, NO_ERRORS_SCHEMA, QueryList, ViewChild, ViewChildren} from '@angular/core';
import {TestBed} from '@angular/core/testing';

{
  describe('ViewChild', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [ViewChildTypeSelectorComponent, ViewChildStringSelectorComponent, Simple],
        schemas: [NO_ERRORS_SCHEMA],
      });
    });

    it('should support type selector', () => {
      TestBed.overrideComponent(
          ViewChildTypeSelectorComponent,
          {set: {template: `<simple [marker]="'1'"></simple><simple [marker]="'2'"></simple>`}});
      const view = TestBed.createComponent(ViewChildTypeSelectorComponent);

      view.detectChanges();
      expect(view.componentInstance.child).toBeDefined();
      expect(view.componentInstance.child.marker).toBe('1');
    });

    it('should support string selector', () => {
      TestBed.overrideComponent(
          ViewChildStringSelectorComponent, {set: {template: `<simple #child></simple>`}});
      const view = TestBed.createComponent(ViewChildStringSelectorComponent);

      view.detectChanges();
      expect(view.componentInstance.child).toBeDefined();
    });
  });

  describe('ViewChildren', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations:
            [ViewChildrenTypeSelectorComponent, ViewChildrenStringSelectorComponent, Simple],
        schemas: [NO_ERRORS_SCHEMA],
      });
    });

    it('should support type selector', () => {
      TestBed.overrideComponent(
          ViewChildrenTypeSelectorComponent,
          {set: {template: `<simple></simple><simple></simple>`}});

      const view = TestBed.createComponent(ViewChildrenTypeSelectorComponent);
      view.detectChanges();
      expect(view.componentInstance.children).toBeDefined();
      expect(view.componentInstance.children.length).toBe(2);
    });

    it('should support string selector', () => {
      TestBed.overrideComponent(
          ViewChildrenStringSelectorComponent,
          {set: {template: `<simple #child1></simple><simple #child2></simple>`}});
      const view = TestBed.configureTestingModule({schemas: [NO_ERRORS_SCHEMA]})
                       .createComponent(ViewChildrenStringSelectorComponent);
      view.detectChanges();
      expect(view.componentInstance.children).toBeDefined();
      expect(view.componentInstance.children.length).toBe(2);
    });
  });
}


@Directive({selector: 'simple'})
class Simple {
  // TODO(issue/24571): remove '!'.
  @Input() marker!: string;
}

@Component({selector: 'view-child-type-selector', template: ''})
class ViewChildTypeSelectorComponent {
  // TODO(issue/24571): remove '!'.
  @ViewChild(Simple) child!: Simple;
}

@Component({selector: 'view-child-string-selector', template: ''})
class ViewChildStringSelectorComponent {
  // TODO(issue/24571): remove '!'.
  @ViewChild('child') child!: ElementRef;
}

@Component({selector: 'view-children-type-selector', template: ''})
class ViewChildrenTypeSelectorComponent {
  // TODO(issue/24571): remove '!'.
  @ViewChildren(Simple) children!: QueryList<Simple>;
}

@Component({selector: 'view-child-string-selector', template: ''})
class ViewChildrenStringSelectorComponent {
  // Allow comma separated selector (with spaces).
  // TODO(issue/24571): remove '!'.
  @ViewChildren('child1 , child2') children!: QueryList<ElementRef>;
}
