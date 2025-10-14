/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * An `EventContractContainerManager` provides the common interface for managing
 * containers.
 */
export interface EventContractContainerManager {
    addEventListener(eventType: string, getHandler: (element: Element) => (event: Event) => void, passive?: boolean): void;
    cleanUp(): void;
}
/**
 * A class representing a container node and all the event handlers
 * installed on it. Used so that handlers can be cleaned up if the
 * container is removed from the contract.
 */
export declare class EventContractContainer implements EventContractContainerManager {
    readonly element: Element;
    /**
     * Array of event handlers and their corresponding event types that are
     * installed on this container.
     *
     */
    private handlerInfos;
    /**
     * @param element The container Element.
     */
    constructor(element: Element);
    /**
     * Installs the provided installer on the element owned by this container,
     * and maintains a reference to resulting handler in order to remove it
     * later if desired.
     */
    addEventListener(eventType: string, getHandler: (element: Element) => (event: Event) => void, passive?: boolean): void;
    /**
     * Removes all the handlers installed on this container.
     */
    cleanUp(): void;
}
