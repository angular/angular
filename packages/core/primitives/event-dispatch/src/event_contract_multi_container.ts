/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventContractContainer, EventContractContainerManager} from './event_contract_container';

/**
 * An `EventContractContainerManager` that supports multiple containers.
 */
export class EventContractMultiContainer implements EventContractContainerManager {
  /** The list of containers. */
  private containers: EventContractContainer[] = [];
  /** The list of nested containers. */
  private nestedContainers: EventContractContainer[] = [];
  /** The list of event handler installers. */
  private eventHandlerInstallers: Array<(container: EventContractContainer) => void> = [];

  /**
   * @param stopPropagation Controls whether events can bubble between
   *    containers or not.
   */
  constructor(private readonly stopPropagation = false) {}

  /**
   * Installs the provided installer on the element owned by this container,
   * and maintains a reference to resulting handler in order to remove it
   * later if desired.
   */
  addEventListener(eventType: string, getHandler: (element: Element) => (event: Event) => void) {
    const eventHandlerInstaller = (container: EventContractContainer) => {
      container.addEventListener(eventType, getHandler);
    };
    for (let i = 0; i < this.containers.length; i++) {
      eventHandlerInstaller(this.containers[i]);
    }
    this.eventHandlerInstallers.push(eventHandlerInstaller);
  }

  /**
   * Removes all the handlers installed on all containers.
   */
  cleanUp() {
    const allContainers = [...this.containers, ...this.nestedContainers];
    for (let i = 0; i < allContainers.length; i++) {
      allContainers[i].cleanUp();
    }
    this.containers = [];
    this.nestedContainers = [];
    this.eventHandlerInstallers = [];
  }

  /**
   * Adds a container to the `MultiEventContractContainer`.
   * Signs the event contract for a new container. All registered events
   * are enabled for this container too. Containers have to be kept disjoint,
   * so if the newly added container is a parent/child of existing containers,
   * they will be merged. If the container is already tracked by this
   * `EventContract`, then the previously registered `EventContractContainer`
   * will be returned.
   */
  addContainer(element: Element): EventContractContainer {
    // If the container is already registered, return.
    for (let i = 0; i < this.containers.length; i++) {
      if (element === this.containers[i].element) {
        return this.containers[i];
      }
    }
    const container = new EventContractContainer(element);
    if (this.stopPropagation) {
      // Events are not propagated, so containers can be considered independent.
      this.setUpContainer(container);
      this.containers.push(container);
    } else {
      if (this.isNestedContainer(container)) {
        // This container has an ancestor that is already a contract container.
        // Don't install event listeners on it in order to prevent an event from
        // being handled multiple times.
        this.nestedContainers.push(container);
        return container;
      }
      this.setUpContainer(container);
      this.containers.push(container);
      this.updateNestedContainers();
    }
    return container;
  }

  /**
   * Removes an already-added container from the contract.
   */
  removeContainer(container: EventContractContainer) {
    container.cleanUp();
    let removed = false;
    for (let i = 0; i < this.containers.length; ++i) {
      if (this.containers[i] === container) {
        this.containers.splice(i, 1);
        removed = true;
        break;
      }
    }

    if (!removed) {
      for (let i = 0; i < this.nestedContainers.length; ++i) {
        if (this.nestedContainers[i] === container) {
          this.nestedContainers.splice(i, 1);
          break;
        }
      }
    }

    if (this.stopPropagation) {
      return;
    }
    this.updateNestedContainers();
  }

  /**
   * Tested whether any current container is a parent of the new container.
   */
  private isNestedContainer(container: EventContractContainer): boolean {
    for (let i = 0; i < this.containers.length; i++) {
      if (containsNode(this.containers[i].element, container.element)) {
        return true;
      }
    }
    return false;
  }

  /** Installs all existing event handlers on a new container. */
  private setUpContainer(container: EventContractContainer) {
    for (let i = 0; i < this.eventHandlerInstallers.length; i++) {
      this.eventHandlerInstallers[i](container);
    }
  }

  /**
   * Updates the list of nested containers after an add/remove operation. Only
   * containers that are not children of other containers are placed in the
   * containers list (and have event listeners on them). This is done in order
   * to prevent events from being handled multiple times when `stopPropagation`
   * is false.
   */
  private updateNestedContainers() {
    const allContainers = [...this.nestedContainers, ...this.containers];
    const newNestedContainers = [];
    const newContainers = [];

    for (let i = 0; i < this.containers.length; ++i) {
      const container = this.containers[i];
      if (isNested(container, allContainers)) {
        newNestedContainers.push(container);
        // Remove the event listeners from the nested container.
        container.cleanUp();
      } else {
        newContainers.push(container);
      }
    }

    for (let i = 0; i < this.nestedContainers.length; ++i) {
      const container = this.nestedContainers[i];
      if (isNested(container, allContainers)) {
        newNestedContainers.push(container);
      } else {
        newContainers.push(container);
        // The container is no longer nested, add event listeners on it.
        this.setUpContainer(container);
      }
    }

    this.containers = newContainers;
    this.nestedContainers = newNestedContainers;
  }
}

/**
 * Checks whether the container is a child of any of the containers.
 */
function isNested(
  container: EventContractContainer,
  containers: EventContractContainer[],
): boolean {
  for (let i = 0; i < containers.length; ++i) {
    if (containsNode(containers[i].element, container.element)) {
      return true;
    }
  }

  return false;
}

/**
 * Checks whether parent contains child.
 * IE11 only supports the native `Node.contains` for HTMLElement.
 */
function containsNode(parent: Node, child: Node): boolean {
  if (parent === child) {
    return false;
  }
  while (parent !== child && child.parentNode) {
    child = child.parentNode;
  }
  return parent === child;
}
