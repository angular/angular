/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventContract} from '@angular/core/primitives/event-dispatch';
import {Injectable} from '../di';

@Injectable({providedIn: 'root'})
export class GlobalEventDelegation {
  eventContract!: EventContract;
  addEvent(el: Element, eventName: string) {
    return false;
  }
}
