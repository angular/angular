import {Injectable} from '@angular/core';
import {GestureConfig, HammerManager} from '../core';

/**
 * An extension of GestureConfig that exposes the underlying HammerManager instances.
 * Tests can use these instances to emit fake gesture events.
 */
@Injectable()
export class TestGestureConfig extends GestureConfig {
  /**
   * A map of Hammer instances to element.
   * Used to emit events over instances for an element.
   */
  hammerInstances: Map<HTMLElement, HammerManager[]> = new Map<HTMLElement, HammerManager[]>();

  /**
   * Create a mapping of Hammer instances to element so that events can be emitted during testing.
   */
  buildHammer(element: HTMLElement) {
    let mc = super.buildHammer(element) as HammerManager;

    if (this.hammerInstances.get(element)) {
      this.hammerInstances.get(element).push(mc);
    } else {
      this.hammerInstances.set(element, [mc]);
    }

    return mc;
  }

  /**
   * The Angular event plugin for Hammer creates a new HammerManager instance for each listener,
   * so we need to apply our event on all instances to hit the correct listener.
   */
  emitEventForElement(eventType: string, element: HTMLElement, eventData = {}) {
    let instances = this.hammerInstances.get(element);
    instances.forEach(instance => instance.emit(eventType, eventData));
  }
}
