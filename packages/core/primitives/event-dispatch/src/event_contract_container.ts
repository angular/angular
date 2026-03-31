/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as eventLib from './event';
import {EventHandlerInfo} from './event_handler';

/**
 * An `EventContractContainerManager` provides the common interface for managing
 * containers.
 */
export interface EventContractContainerManager {
  addEventListener(
    eventType: string,
    getHandler: (element: Element) => (event: Event) => void,
    passive?: boolean,
  ): void;

  cleanUp(): void;
}

/**
 * A class representing a container node and all the event handlers
 * installed on it. Used so that handlers can be cleaned up if the
 * container is removed from the contract.
 */
export class EventContractContainer implements EventContractContainerManager {
  /**
   * Array of event handlers and their corresponding event types that are
   * installed on this container.
   *
   */
  private handlerInfos: EventHandlerInfo[] = [];

  /**
   * @param element The container Element.
   */
  constructor(readonly element: Element) {}

  /**
   * Installs the provided installer on the element owned by this container,
   * and maintains a reference to resulting handler in order to remove it
   * later if desired.
   */
  addEventListener(
    eventType: string,
    getHandler: (element: Element) => (event: Event) => void,
    passive?: boolean,
  ) {
    this.handlerInfos.push(
      eventLib.addEventListener(this.element, eventType, getHandler(this.element), passive),
    );
  }

  /**
   * Removes all the handlers installed on this container.
   */
  cleanUp() {
    for (let i = 0; i < this.handlerInfos.length; i++) {
      eventLib.removeEventListener(this.element, this.handlerInfos[i]);
    }

    this.handlerInfos = [];
  }
}
