/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT_REF} from '@angular/common';
import {ElementRef, Inject, Injectable} from '@angular/core';

import {serializeDocument} from './domino_adapter';

/**
 * Representation of the current platform state.
 *
 * @publicApi
 */
@Injectable()
export class PlatformState {
  constructor(@Inject(DOCUMENT_REF) private _doc: ElementRef<Document>) {}

  /**
   * Renders the current state of the platform to string.
   */
  renderToString(): string {
    return serializeDocument(this._doc.nativeElement);
  }

  /**
   * Returns the current DOM state.
   *
   * @deprecated Use `getDocumentRef` instead.
   */
  getDocument(): any {
    return this._doc.nativeElement;
  }

  /**
   * Returns a reference to the current DOM Document.
   */
  getDocumentRef(): ElementRef<Document> {
    return this._doc;
  }
}
