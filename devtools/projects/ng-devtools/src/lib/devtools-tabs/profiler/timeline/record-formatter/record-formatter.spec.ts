/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ElementProfile, ProfilerFrame} from 'protocol';

import {RecordFormatter} from './record-formatter';

class MockFormatter extends RecordFormatter<any> {
  override addFrame(nodes: any[], elements: ElementProfile[]): void {
    return;
  }

  override formatFrame(frame: ProfilerFrame): any {
    return;
  }
}

const formatter = new MockFormatter();

describe('getValue cases', () => {
  let element: any;

  it('calculates value with  no lifecycle hooks', () => {
    element = {
      children: [],
      directives: [{
        changeDetection: 10,
        isElement: false,
        isComponent: true,
        lifecycle: {},
        name: 'AppComponent'
      }],
    };
    expect(formatter.getValue(element)).toBe(10);
  });

  it('calculates value with 0 change detection and existing lifecycle hooks', () => {
    element = {
      children: [],
      directives: [
        {
          isComponent: false,
          isElement: false,
          name: 'NgForOf',
          lifecycle: {ngDoCheck: 5},
          changeDetection: 0
        },
      ],
    };
    expect(formatter.getValue(element)).toBe(5);
  });

  it('calculates value with non 0 change detection and one lifecycle hook', () => {
    element = {
      children: [],
      directives: [
        {
          isComponent: false,
          isElement: false,
          name: 'NgForOf',
          lifecycle: {ngDoCheck: 5},
          changeDetection: 10
        },
      ],
    };
    expect(formatter.getValue(element)).toBe(15);
  });

  it('calculates value with non 0 change detection and multiple lifecycle hooks', () => {
    element = {
      children: [],
      directives: [
        {
          isComponent: false,
          isElement: false,
          name: 'NgForOf',
          lifecycle: {ngDoCheck: 5, ngAfterViewInit: 100},
          changeDetection: 10,
        },
      ],
    };
    expect(formatter.getValue(element)).toBe(115);
  });
});

describe('getLabel cases', () => {
  let element: ElementProfile;

  it('has only components', () => {
    element = {
      children: [],
      directives: [
        {
          changeDetection: 10,
          isElement: false,
          isComponent: true,
          lifecycle: {},
          outputs: {},
          name: 'AppComponent',
        },
      ],
    };
    expect(formatter.getLabel(element)).toBe('AppComponent');
  });

  it('has only directives', () => {
    element = {
      children: [],
      directives: [
        {
          isComponent: false,
          isElement: false,
          name: 'RouterOutlet',
          lifecycle: {},
          outputs: {},
          changeDetection: 0,
        },
      ],
    };
    expect(formatter.getLabel(element)).toBe('[RouterOutlet]');
  });

  it('has a component and a directive', () => {
    element = {
      children: [],
      directives: [
        {
          isComponent: false,
          isElement: false,
          name: 'TooltipDirective',
          lifecycle: {},
          outputs: {},
          changeDetection: 0,
        },
        {
          changeDetection: 0,
          isElement: false,
          isComponent: true,
          lifecycle: {},
          outputs: {},
          name: 'TodoComponent'
        },
      ],
    };
    expect(formatter.getLabel(element)).toBe('TodoComponent[TooltipDirective]');
  });

  it('has a component and multiple directives', () => {
    element = {
      children: [],
      directives: [
        {
          isComponent: false,
          isElement: false,
          name: 'TooltipDirective',
          lifecycle: {},
          outputs: {},
          changeDetection: 0,
        },
        {
          isComponent: false,
          isElement: false,
          name: 'RandomDirective',
          lifecycle: {},
          outputs: {},
          changeDetection: 0,
        },
        {
          changeDetection: 0,
          isElement: false,
          isComponent: true,
          lifecycle: {},
          outputs: {},
          name: 'TodoComponent'
        },
      ],
    };
    expect(formatter.getLabel(element)).toBe('TodoComponent[TooltipDirective, RandomDirective]');
  });
});

describe('getDirectiveValue cases', () => {
  let directive;

  it('calculates value with  no lifecycle hooks', () => {
    directive = {
      changeDetection: 10,
      isElement: false,
      isComponent: true,
      lifecycle: {},
      name: 'AppComponent'
    };
    expect(formatter.getDirectiveValue(directive)).toBe(10);
  });

  it('calculates value with 0 change detection and existing lifecycle hooks', () => {
    directive = {
      isComponent: false,
      isElement: false,
      name: 'NgForOf',
      lifecycle: {ngDoCheck: 5},
      changeDetection: 0,
    };
    expect(formatter.getDirectiveValue(directive)).toBe(5);
  });

  it('calculates value with non 0 change detection and one lifecycle hook', () => {
    directive = {
      isComponent: false,
      isElement: false,
      name: 'NgForOf',
      lifecycle: {ngDoCheck: 5},
      changeDetection: 10,
    };
    expect(formatter.getDirectiveValue(directive)).toBe(15);
  });

  it('calculates value with non 0 change detection and multiple lifecycle hooks', () => {
    directive = {
      isComponent: false,
      isElement: false,
      name: 'NgForOf',
      lifecycle: {ngDoCheck: 5, ngAfterViewInit: 100},
      changeDetection: 10,
    };
    expect(formatter.getDirectiveValue(directive)).toBe(115);
  });
});
