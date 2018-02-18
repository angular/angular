/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {Inject, Injectable} from '@angular/core';

import {EventManagerPlugin} from './event_manager';

@Injectable()
export class CompositionEventsPlugin extends EventManagerPlugin {
  constructor(@Inject(DOCUMENT) doc: any) { super(doc); }

  supports(eventName: string): boolean { return eventName.indexOf(',') >= 0; }

  addEventListener(element: HTMLElement, rawEventName: string, handler: Function): Function {
    const eventNames = this.parseEventNames(rawEventName);
    return this.dispatchEvents(
        eventNames, eventName => this.manager.addEventListener(element, eventName, handler));
  }

  addGlobalEventListener(target: string, rawEventName: string, handler: Function): Function {
    const eventNames = this.parseEventNames(rawEventName);
    return this.dispatchEvents(
        eventNames, eventName => this.manager.addGlobalEventListener(target, eventName, handler));
  }

  private dispatchEvents(eventNames: string[], handleEvent: (eventName: string) => Function):
      Function {
    const disposers: Function[] = [];
    for (let i = 0; i < eventNames.length; i++) {
      const eventName = eventNames[i];
      const disposer = handleEvent(eventName);
      disposers.push(disposer);
    }

    return () => {
      for (let i = 0; i < disposers.length; i++) {
        disposers[i]();
      }
    };
  }

  private parseEventNames(rawEventName: string): string[] {
    return rawEventName.split(',').filter(str => str.length > 0);
  }
}
