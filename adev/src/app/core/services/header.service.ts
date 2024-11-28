/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {Injectable, inject} from '@angular/core';

const ANGULAR_DEV = 'https://angular.dev';

/**
 * Information about the deployment of this application.
 */
@Injectable({providedIn: 'root'})
export class HeaderService {
  private readonly document = inject(DOCUMENT);

  /**
   * Sets the canonical link in the header.
   * It supposes the header link is already present in the index.html
   *
   * The function behave invariably and will always point to angular.dev,
   * no matter if it's a specific version build
   */
  setCanonical(absolutePath: string): void {
    const pathWithoutFragment = this.normalizePath(absolutePath).split('#')[0];
    const fullPath = `${ANGULAR_DEV}/${pathWithoutFragment}`;
    this.document.querySelector('link[rel=canonical]')?.setAttribute('href', fullPath);
  }

  private normalizePath(path: string): string {
    if (path[0] === '/') {
      return path.substring(1);
    }
    return path;
  }
}
