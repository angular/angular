/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  Component,
  CSP_NONCE,
  destroyPlatform,
  ElementRef,
  inject,
  ViewEncapsulation,
} from '../../src/core';
import {bootstrapApplication} from '@angular/platform-browser';
import {withBody} from '@angular/private/testing';

describe('CSP integration', () => {
  beforeEach(destroyPlatform);
  afterEach(destroyPlatform);

  const testStyles = '.a { color: var(--csp-test-var, hotpink); }';

  function findTestNonces(rootNode: ParentNode): string[] {
    const styles = rootNode.querySelectorAll('style');
    const nonces: string[] = [];

    for (let i = 0; i < styles.length; i++) {
      const style = styles[i];
      const nonce = style.getAttribute('nonce');
      if (nonce && style.textContent?.includes('--csp-test-var')) {
        nonces.push(nonce);
      }
    }

    return nonces;
  }

  it(
    'should use the predefined ngCspNonce when inserting styles with emulated encapsulation',
    withBody('<app ngCspNonce="emulated-nonce"></app>', async () => {
      @Component({
        selector: 'uses-styles',
        template: '',
        styles: [testStyles],
        encapsulation: ViewEncapsulation.Emulated,
      })
      class UsesStyles {}

      @Component({
        selector: 'app',
        template: '<uses-styles></uses-styles>',
        imports: [UsesStyles],
      })
      class App {}

      const appRef = await bootstrapApplication(App);

      expect(findTestNonces(document)).toEqual(['emulated-nonce']);

      appRef.destroy();
    }),
  );

  it(
    'should use the predefined ngCspNonce when inserting styles with no encapsulation',
    withBody('<app ngCspNonce="disabled-nonce"></app>', async () => {
      @Component({
        selector: 'uses-styles',
        template: '',
        styles: [testStyles],
        encapsulation: ViewEncapsulation.None,
      })
      class UsesStyles {}

      @Component({
        selector: 'app',
        template: '<uses-styles></uses-styles>',
        imports: [UsesStyles],
      })
      class App {}

      const appRef = await bootstrapApplication(App);

      expect(findTestNonces(document)).toEqual(['disabled-nonce']);

      appRef.destroy();
    }),
  );

  it(
    'should use the predefined ngCspNonce when inserting styles with shadow DOM encapsulation',
    withBody('<app ngCspNonce="shadow-nonce"></app>', async () => {
      if (!document.body.attachShadow) {
        return;
      }

      let usesStylesRootNode!: HTMLElement;

      @Component({
        selector: 'uses-styles',
        template: '',
        styles: [testStyles],
        encapsulation: ViewEncapsulation.ShadowDom,
      })
      class UsesStyles {
        constructor() {
          usesStylesRootNode = inject(ElementRef).nativeElement;
        }
      }

      @Component({
        selector: 'app',
        template: '<uses-styles></uses-styles>',
        imports: [UsesStyles],
      })
      class App {}

      const appRef = await bootstrapApplication(App);

      expect(findTestNonces(usesStylesRootNode.shadowRoot!)).toEqual(['shadow-nonce']);

      appRef.destroy();
    }),
  );

  it(
    'should prefer nonce provided through DI over one provided in the DOM',
    withBody('<app ngCspNonce="dom-nonce"></app>', async () => {
      @Component({selector: 'uses-styles', template: '', styles: [testStyles]})
      class UsesStyles {}

      @Component({
        selector: 'app',
        template: '<uses-styles></uses-styles>',
        imports: [UsesStyles],
      })
      class App {}

      const appRef = await bootstrapApplication(App, {
        providers: [{provide: CSP_NONCE, useValue: 'di-nonce'}],
      });

      expect(findTestNonces(document)).toEqual(['di-nonce']);

      appRef.destroy();
    }),
  );
});
