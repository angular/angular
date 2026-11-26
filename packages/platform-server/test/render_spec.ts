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
  it('should not serialize MathML script elements', async () => {
    @Component({
      selector: 'app',

      template: '<math><mtext><script>bad()</script></mtext></math>',
    })
    class SomeComponent {}

    const html = await ssr(SomeComponent, {enableHydration: false});

    expect(html).not.toContain('<script');
  });

  it('should prevent CSS property injection in single-property style bindings', async () => {
    @Component({
      selector: 'app',
      template: `
        <a id="badge" [style.color]="badgeColor"></a>
        <div id="meter" [style.width.px]="meterWidth"></div>
        <div id="theme" [style.--accent]="accent"></div>
        <div id="valid-data-uri" [style.background-image]="validDataUri"></div>
      `,
    })
    class SomeComponent {
      badgeColor =
        'red; position: fixed; z-index: 2147483647; ' +
        "background-image: url('https://attacker.example/p.png?data:')";
      meterWidth = '100px; position: fixed; --bypass: data:; --pad: 1';
      accent = 'blue; position: fixed; --bypass: data:';
      validDataUri = 'url(data:image/png;base64,iVBORw0KGgo=)';
    }

    const html = await ssr(SomeComponent);

    expect(html).not.toContain('position: fixed');
    expect(html).not.toContain('z-index: 2147483647');
    expect(html).not.toContain('attacker.example');
    expect(html).toContain('background-image: url(data:image/png;base64,iVBORw0KGgo=);');
  });
});
