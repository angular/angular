/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component} from '@angular/core';
import {ssr, ssrParts} from './hydration_utils';

describe('renderApplication', () => {
  it('should render ARIA attributes from attribute bindings', async () => {
    @Component({
      selector: 'app',
      template: '<div [attr.aria-label]="label"></div>',
    })
    class SomeComponent {
      label = 'some label';
    }

    const html = await ssr(SomeComponent);
    expect(html).toContain('aria-label="some label"');
  });

  it('should render ARIA attributes using property binding syntax', async () => {
    @Component({
      selector: 'app',
      template: '<div [aria-label]="label"></div>',
    })
    class SomeComponent {
      label = 'a third label';
    }

    const html = await ssr(SomeComponent);
    expect(html).toContain('aria-label="a third label"');
  });
});

describe('renderApplicationParts', () => {
  it('should render head and body separately', async () => {
    @Component({
      selector: 'app',
      template: '<div>hello parts</div>',
    })
    class SomeComponent {}

    const parts = await ssrParts(SomeComponent, {
      doc: '<html><head><title>Test Parts Title</title></head><body><app></app></body></html>',
    });

    expect(parts.head).toContain('<title>Test Parts Title</title>');
    expect(parts.head).not.toContain('<div>hello parts</div>');
    expect(parts.body).toContain('<app ng-version=');
    expect(parts.body).toContain('<div>hello parts</div>');
    expect(parts.body).not.toContain('<title>Test Parts Title</title>');
  });
});
