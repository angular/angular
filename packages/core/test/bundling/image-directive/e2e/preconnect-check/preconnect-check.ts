/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, IMAGE_LOADER, NgOptimizedImage} from '@angular/common';
import {Component, Inject} from '../../../../../src/core';

@Component({
  selector: 'preconnect-check',
  standalone: true,
  imports: [NgOptimizedImage],
  template: `
    <img ngSrc="/e2e/a.png" width="50" height="50" priority>
    <img ngSrc="/e2e/b.png" width="50" height="50" priority>
    <img ngSrc="/e2e/c.png" width="50" height="50">
  `,
  providers: [
    {
      provide: IMAGE_LOADER,
      useValue: (config: {src: string}) => `https://angular.io/assets/images/${config.src}`,
    },
  ],
})
export class PreconnectCheckComponent {
  constructor(@Inject(DOCUMENT) private doc: Document) {
    this.createRequestedLinkElements();
  }

  /**
   * Setup an environment required for e2e testing: create the necessary `<link>` elements in the
   * `document.head`, so that the `NgOptimizedImage` logic can be verified in various scenarios.
   */
  private createRequestedLinkElements() {
    const win = this.doc.defaultView;
    if (!win) return;
    const url = new URL(win.location.href).searchParams;
    const preconnect = url.get('preconnect');
    if (preconnect !== null) {
      const link = this.createLinkElement('preconnect', 'https://angular.io');
      this.doc.head.appendChild(link);
    }
  }

  /**
   * Helper method to create a simple `<link>` element based on inputs.
   */
  private createLinkElement(rel: string, href: string, as?: string): HTMLLinkElement {
    const link = this.doc.createElement('link');
    link.rel = rel;
    link.href = href;
    if (as) link.as = as;
    return link;
  }
}
