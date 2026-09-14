/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Highlight,
  HighlightLabelDefinition,
  HighlightLabelProps,
  HighlightTemplate,
  HighlightType,
} from './types';

/** A `Highlight` with all of its methods replaced by spies. */
export interface MockHighlight<
  T extends HighlightLabelDefinition = HighlightLabelDefinition,
> extends Highlight<T> {
  display: jasmine.Spy;
  hide: jasmine.Spy;
  updateLabel: jasmine.Spy;
  destroy: jasmine.Spy;
}

/** Returns an `InspectElement`-type highlight. */
export function createTemplate(
  overrides: Partial<HighlightTemplate<any>> = {},
): HighlightTemplate<any> {
  return {
    type: HighlightType.InspectElement,
    overlayColor: [10, 20, 30],
    labelsType: 'static',
    labels: {
      name: {
        x: 'left',
        offset: 'outset',
        content: (name: string) => `<${name}>`,
      },
    },
    ...overrides,
  };
}

export function createMockHighlight(
  template: HighlightTemplate<any> = createTemplate(),
  props: HighlightLabelProps<any> = {name: ['Foo']},
  target: Element = document.createElement('div'),
): MockHighlight {
  return {
    targetElement: new WeakRef(target),
    type: template.type,
    template,
    props,
    isDestroyed: false,
    isDisplayed: true,
    display: jasmine.createSpy('display'),
    hide: jasmine.createSpy('hide'),
    updateLabel: jasmine.createSpy('updateLabel'),
    destroy: jasmine.createSpy('destroy'),
  };
}
