/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, Inject, InjectionToken, Optional, SkipSelf} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {addAriaReferencedId, getAriaReferenceIds, removeAriaReferencedId} from './aria-reference';

/**
 * Interface used to register message elements and keep a count of how many registrations have
 * the same message and the reference to the message element used for the `aria-describedby`.
 */
export interface RegisteredMessage {
  /** The element containing the message. */
  messageElement: Element;

  /** The number of elements that reference this message element via `aria-describedby`. */
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
  private _document: Document;

  constructor(@Inject(DOCUMENT) _document: any) {
    this._document = _document;
  }

  /**
   * Adds to the host element an aria-describedby reference to a hidden element that contains
   * the message. If the same message has already been registered, then it will reuse the created
   * message element.
   */
  describe(hostElement: Element, message: string) {
    if (!message.trim()) {
      return;
    }

    if (!messageRegistry.has(message)) {
      this._createMessageElement(message);
    }

    if (!this._isElementDescribedByMessage(hostElement, message)) {
      this._addMessageReference(hostElement, message);
    }
  }

  /** Removes the host element's aria-describedby reference to the message element. */
  removeDescription(hostElement: Element, message: string) {
    if (!message.trim()) {
      return;
    }

    if (this._isElementDescribedByMessage(hostElement, message)) {
      this._removeMessageReference(hostElement, message);
    }

    const registeredMessage = messageRegistry.get(message);
    if (registeredMessage && registeredMessage.referenceCount === 0) {
      this._deleteMessageElement(message);
    }

    if (messagesContainer && messagesContainer.childNodes.length === 0) {
      this._deleteMessagesContainer();
    }
  }

  /** Unregisters all created message elements and removes the message container. */
  ngOnDestroy() {
    const describedElements =
        this._document.querySelectorAll(`[${CDK_DESCRIBEDBY_HOST_ATTRIBUTE}]`);

    for (let i = 0; i < describedElements.length; i++) {
      this._removeCdkDescribedByReferenceIds(describedElements[i]);
      describedElements[i].removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
    }

    if (messagesContainer) {
      this._deleteMessagesContainer();
    }

    messageRegistry.clear();
  }

  /**
   * Creates a new element in the visually hidden message container element with the message
   * as its content and adds it to the message registry.
   */
  private _createMessageElement(message: string) {
    const messageElement = this._document.createElement('div');
    messageElement.setAttribute('id', `${CDK_DESCRIBEDBY_ID_PREFIX}-${nextId++}`);
    messageElement.appendChild(this._document.createTextNode(message)!);

    if (!messagesContainer) { this._createMessagesContainer(); }
    messagesContainer!.appendChild(messageElement);

    messageRegistry.set(message, {messageElement, referenceCount: 0});
  }

  /** Deletes the message element from the global messages container. */
  private _deleteMessageElement(message: string) {
    const registeredMessage = messageRegistry.get(message);
    const messageElement = registeredMessage && registeredMessage.messageElement;
    if (messagesContainer && messageElement) {
      messagesContainer.removeChild(messageElement);
    }
    messageRegistry.delete(message);
  }

  /** Creates the global container for all aria-describedby messages. */
  private _createMessagesContainer() {
    messagesContainer = this._document.createElement('div');

    messagesContainer.setAttribute('id', MESSAGES_CONTAINER_ID);
    messagesContainer.setAttribute('aria-hidden', 'true');
    messagesContainer.style.display = 'none';
    this._document.body.appendChild(messagesContainer);
  }

  /** Deletes the global messages container. */
  private _deleteMessagesContainer() {
    this._document.body.removeChild(messagesContainer!);
    messagesContainer = null;
  }

  /** Removes all cdk-describedby messages that are hosted through the element. */
  private _removeCdkDescribedByReferenceIds(element: Element) {
    // Remove all aria-describedby reference IDs that are prefixed by CDK_DESCRIBEDBY_ID_PREFIX
    const originalReferenceIds = getAriaReferenceIds(element, 'aria-describedby')
        .filter(id => id.indexOf(CDK_DESCRIBEDBY_ID_PREFIX) != 0);
    element.setAttribute('aria-describedby', originalReferenceIds.join(' '));
  }

  /**
   * Adds a message reference to the element using aria-describedby and increments the registered
   * message's reference count.
   */
  private _addMessageReference(element: Element, message: string) {
    const registeredMessage = messageRegistry.get(message)!;

    // Add the aria-describedby reference and set the
    // describedby_host attribute to mark the element.
    addAriaReferencedId(element, 'aria-describedby', registeredMessage.messageElement.id);
    element.setAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE, '');

    registeredMessage.referenceCount++;
  }

  /**
   * Removes a message reference from the element using aria-describedby
   * and decrements the registered message's reference count.
   */
  private _removeMessageReference(element: Element, message: string) {
    const registeredMessage = messageRegistry.get(message)!;
    registeredMessage.referenceCount--;

    removeAriaReferencedId(element, 'aria-describedby', registeredMessage.messageElement.id);
    element.removeAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
  }

  /** Returns true if the element has been described by the provided message ID. */
  private _isElementDescribedByMessage(element: Element, message: string): boolean {
    const referenceIds = getAriaReferenceIds(element, 'aria-describedby');
    const registeredMessage = messageRegistry.get(message);
    const messageId = registeredMessage && registeredMessage.messageElement.id;

    return !!messageId && referenceIds.indexOf(messageId) != -1;
  }

}

/** @docs-private */
export function ARIA_DESCRIBER_PROVIDER_FACTORY(parentDispatcher: AriaDescriber, _document: any) {
  return parentDispatcher || new AriaDescriber(_document);
}

/** @docs-private */
export const ARIA_DESCRIBER_PROVIDER = {
  // If there is already an AriaDescriber available, use that. Otherwise, provide a new one.
  provide: AriaDescriber,
  deps: [
    [new Optional(), new SkipSelf(), AriaDescriber],
    DOCUMENT as InjectionToken<any>
  ],
  useFactory: ARIA_DESCRIBER_PROVIDER_FACTORY
};
