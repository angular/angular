/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  Directive,
  ElementRef,
  Input,
  NO_ERRORS_SCHEMA,
  QueryList,
  ViewChild,
  ViewChildren,
} from '../../src/core';
import {TestBed} from '../../testing';

describe('ViewChild', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  it('should support type selector', () => {
    TestBed.overrideComponent(ViewChildTypeSelectorComponent, {
      set: {
        template: `<simple [marker]="'1'"></simple><simple [marker]="'2'"></simple>`,
        imports: [Simple],
      },
    });
    const view = TestBed.createComponent(ViewChildTypeSelectorComponent);

    view.detectChanges();
    expect(view.componentInstance.child).toBeDefined();
    expect(view.componentInstance.child.marker).toBe('1');
  });

  it('should support string selector', () => {
    TestBed.overrideComponent(ViewChildStringSelectorComponent, {
      set: {template: `<simple #child></simple>`, imports: [Simple]},
    });
    const view = TestBed.createComponent(ViewChildStringSelectorComponent);

    view.detectChanges();
    expect(view.componentInstance.child).toBeDefined();
  });
});

describe('ViewChildren', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  it('should support type selector', () => {
    TestBed.overrideComponent(ViewChildrenTypeSelectorComponent, {
      set: {template: `<simple></simple><simple></simple>`, imports: [Simple]},
    });

    const view = TestBed.createComponent(ViewChildrenTypeSelectorComponent);
    view.detectChanges();
    expect(view.componentInstance.children).toBeDefined();
    expect(view.componentInstance.children.length).toBe(2);
  });

  it('should support string selector', () => {
    TestBed.overrideComponent(ViewChildrenStringSelectorComponent, {
      set: {template: `<simple #child1></simple><simple #child2></simple>`, imports: [Simple]},
    });
    const view = TestBed.createComponent(ViewChildrenStringSelectorComponent);
    view.detectChanges();
    expect(view.componentInstance.children).toBeDefined();
    expect(view.componentInstance.children.length).toBe(2);
  });
});

@Directive({
  selector: 'simple',
})
class Simple {
  @Input() marker: string | undefined;
}

@Component({
  template: '',
})
class ViewChildTypeSelectorComponent {
  @ViewChild(Simple) child!: Simple;
}

@Component({
  template: '',
})
class ViewChildStringSelectorComponent {
  @ViewChild('child') child!: ElementRef;
}

@Component({
  template: '',
})
class ViewChildrenTypeSelectorComponent {
  @ViewChildren(Simple) children!: QueryList<Simple>;
}

@Component({
  template: '',
})
class ViewChildrenStringSelectorComponent {
  // Allow comma separated selector (with spaces).
  @ViewChildren('child1 , child2') children!: QueryList<ElementRef>;
}
