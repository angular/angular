/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component} from '@angular/core';
import {createApplication} from '@angular/platform-browser';

import {createCustomElement} from '../public_api';

describe('createCustomElement with env injector', () => {
  let testContainer: HTMLDivElement;

  beforeEach(() => {
    testContainer = document.createElement('div');
    document.body.appendChild(testContainer);
  });

  afterEach(() => {
    document.body.removeChild(testContainer);
    (testContainer as any) = null;
  });

  it('should use provided EnvironmentInjector to create a custom element', async () => {
    @Component({
      standalone: true,
      template: `Hello, standalone element!`,
    })
    class TestStandaloneCmp {
    }

    const appRef = await createApplication();

    try {
      const NgElementCtor = createCustomElement(TestStandaloneCmp, {injector: appRef.injector});

      customElements.define('test-standalone-cmp', NgElementCtor);
      const customEl = document.createElement('test-standalone-cmp');
      testContainer.appendChild(customEl);

      expect(testContainer.innerText).toBe('Hello, standalone element!');
    } finally {
      appRef.destroy();
    }
  });
});
