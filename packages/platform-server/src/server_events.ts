/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT_REF, ɵgetDOM as getDOM} from '@angular/common';
import {ElementRef, Inject, Injectable} from '@angular/core';
import {EventManagerPlugin} from '@angular/platform-browser';

@Injectable()
export class ServerEventManagerPlugin extends EventManagerPlugin {
  constructor(@Inject(DOCUMENT_REF) private doc: ElementRef<Document>) {
    super(doc.nativeElement);
  }

  // Handle all events on the server.
  override supports(eventName: string) {
    return true;
  }

  override addEventListener(element: HTMLElement, eventName: string, handler: Function): Function {
    return getDOM().onAndCancel(element, eventName, handler);
  }
}
