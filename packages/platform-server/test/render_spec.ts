/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {ssr} from './hydration_utils';

describe('renderApplication', () => {
  it('should render ARIA attributes from attribute bindings', async () => {
    @Component({
      selector: 'app',
      standalone: true,
      template: '<div [attr.aria-label]="label"></div>',
    })
    class SomeComponent {
      label = 'some label';
    }

    const html = await ssr(SomeComponent);
    expect(html).toContain('aria-label="some label"');
  });

  it('should render ARIA attributes from their corresponding property bindings', async () => {
    @Component({
      selector: 'app',
      standalone: true,
      template: '<div [ariaLabel]="label"></div>',
    })
    class SomeComponent {
      label = 'some other label';
    }

    const html = await ssr(SomeComponent);
    expect(html).toContain('aria-label="some other label"');
  });

  it('should render ARIA attributes using property binding syntax', async () => {
    @Component({
      selector: 'app',
      standalone: true,
      template: '<div [aria-label]="label"></div>',
    })
    class SomeComponent {
      label = 'a third label';
    }

    const html = await ssr(SomeComponent);
    expect(html).toContain('aria-label="a third label"');
  });
});
