/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, Optional, SkipSelf} from '@angular/core';
import {Platform} from '@angular/cdk/platform';
import {addAriaReferencedId, getAriaReferenceIds, removeAriaReferencedId} from './aria-reference';

/**
 * Interface used to register message elements and keep a count of how many registrations have
 * the same message and the reference to the message element used for the aria-describedby.
 */
export interface RegisteredMessage {
  messageElement: Element;
  referenceCount: number;
}

/** ID used for the body container where all messages are appended. */
export const MESSAGES_CONTAINER_ID = 'cdk-describedby-message-container';

/** ID prefix used for each created message element. */
export const CDK_DESCRIBEDBY_ID_PREFIX = 'cdk-describedby-message';

/** Attribute given to each host element that is described by a message element. */
export const CDK_DESCRIBEDBY_HOST_ATTRIBUTE = 'cdk-describedby-host';

/** Global incremental identifier for each registered message element. */
let nextId = 0;

/** Global map of all registered message elements that have been placed into the document. */
const messageRegistry = new Map<string, RegisteredMessage>();

/** Container for all registered messages. */
let messagesContainer: HTMLElement | null = null;

/**
 * Utility that creates visually hidden elements with a message content. Useful for elements that
 * want to use aria-describedby to further describe themselves without adding additional visual
 * content.
 * @docs-private
 */
@Injectable()
export class AriaDescriber {
  constructor(private _platform: Platform) { }

  /**
   * Adds to the host element an aria-describedby reference to a hidden element that contains
   * the message. If the same message has already been registered, then it will reuse the created
   * message element.
   */
  describe(hostElement: Element, message: string) {
    if (!this._platform.isBrowser || !message.trim()) { return; }

    if (!messageRegistry.has(message)) {
      createMessageElement(message);
    }

    if (!isElementDescribedByMessage(hostElement, message)) {
      addMessageReference(hostElement, message);
    }
  }

  /** Removes the host element's aria-describedby reference to the message element. */
  removeDescription(hostElement: Element, message: string) {
    if (!this._platform.isBrowser || !message.trim()) {
      return;
    }

    if (isElementDescribedByMessage(hostElement, message)) {
      removeMessageReference(hostElement, message);
    }

    const registeredMessage = messageRegistry.get(message);
    if (registeredMessage && registeredMessage.referenceCount === 0) {
      deleteMessageElement(message);
    }

    if (messagesContainer && messagesContainer.childNodes.length === 0) {
      deleteMessagesContainer();
    }
  }

  /** Unregisters all created message elements and removes the message container. */
  ngOnDestroy() {
    if (!this._platform.isBrowser) { return; }

    const describedElements = document.querySelectorAll(`[${CDK_DESCRIBEDBY_HOST_ATTRIBUTE}]`);
    for (let i = 0; i < describedElements.length; i++) {
      removeCdkDescribedByReferenceIds(describedElements[i]);
      describedElements[i].removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
    }

    if (messagesContainer) {
      deleteMessagesContainer();
    }

    messageRegistry.clear();
  }
}

/**
 * Creates a new element in the visually hidden message container element with the message
 * as its content and adds it to the message registry.
 */
function createMessageElement(message: string) {
  const messageElement = document.createElement('div');
  messageElement.setAttribute('id', `${CDK_DESCRIBEDBY_ID_PREFIX}-${nextId++}`);
  messageElement.appendChild(document.createTextNode(message)!);

  if (!messagesContainer) { createMessagesContainer(); }
  messagesContainer!.appendChild(messageElement);

  messageRegistry.set(message, {messageElement, referenceCount: 0});
}

/** Deletes the message element from the global messages container. */
function deleteMessageElement(message: string) {
  const registeredMessage = messageRegistry.get(message);
  const messageElement = registeredMessage && registeredMessage.messageElement;
  if (messagesContainer && messageElement) {
    messagesContainer.removeChild(messageElement);
  }
  messageRegistry.delete(message);
}

/** Creates the global container for all aria-describedby messages. */
function createMessagesContainer() {
  messagesContainer = document.createElement('div');

  messagesContainer.setAttribute('id', MESSAGES_CONTAINER_ID);
  messagesContainer.setAttribute('aria-hidden', 'true');
  messagesContainer.style.display = 'none';
  document.body.appendChild(messagesContainer);
}

/** Deletes the global messages container. */
function deleteMessagesContainer() {
  document.body.removeChild(messagesContainer!);
  messagesContainer = null;
}

/** Removes all cdk-describedby messages that are hosted through the element. */
function removeCdkDescribedByReferenceIds(element: Element) {
  // Remove all aria-describedby reference IDs that are prefixed by CDK_DESCRIBEDBY_ID_PREFIX
  const originalReferenceIds = getAriaReferenceIds(element, 'aria-describedby')
      .filter(id => id.indexOf(CDK_DESCRIBEDBY_ID_PREFIX) != 0);
  element.setAttribute('aria-describedby', originalReferenceIds.join(' '));
}

/**
 * Adds a message reference to the element using aria-describedby and increments the registered
 * message's reference count.
 */
function addMessageReference(element: Element, message: string) {
  const registeredMessage = messageRegistry.get(message)!;

  // Add the aria-describedby reference and set the describedby_host attribute to mark the element.
  addAriaReferencedId(element, 'aria-describedby', registeredMessage.messageElement.id);
  element.setAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE, '');

  registeredMessage.referenceCount++;
}

/**
 * Removes a message reference from the element using aria-describedby and decrements the registered
 * message's reference count.
 */
function removeMessageReference(element: Element, message: string) {
  const registeredMessage = messageRegistry.get(message)!;
  registeredMessage.referenceCount--;

  removeAriaReferencedId(element, 'aria-describedby', registeredMessage.messageElement.id);
  element.removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
}

/** Returns true if the element has been described by the provided message ID. */
function isElementDescribedByMessage(element: Element, message: string): boolean {
  const referenceIds = getAriaReferenceIds(element, 'aria-describedby');
  const registeredMessage = messageRegistry.get(message);
  const messageId = registeredMessage && registeredMessage.messageElement.id;

  return !!messageId && referenceIds.indexOf(messageId) != -1;
}

/** @docs-private */
export function ARIA_DESCRIBER_PROVIDER_FACTORY(
    parentDispatcher: AriaDescriber, platform: Platform) {
  return parentDispatcher || new AriaDescriber(platform);
}

/** @docs-private */
export const ARIA_DESCRIBER_PROVIDER = {
  // If there is already an AriaDescriber available, use that. Otherwise, provide a new one.
  provide: AriaDescriber,
  deps: [
    [new Optional(), new SkipSelf(), AriaDescriber],
    Platform
  ],
  useFactory: ARIA_DESCRIBER_PROVIDER_FACTORY
};
