import {Injectable, ElementRef, Optional, SkipSelf} from '@angular/core';
import {Scrollable} from './scrollable';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/auditTime';


/** Time in ms to throttle the scrolling events by default. */
export const DEFAULT_SCROLL_TIME = 20;

/**
 * Service contained all registered Scrollable references and emits an event when any one of the
 * Scrollable references emit a scrolled event.
 */
@Injectable()
export class ScrollDispatcher {
  /** Subject for notifying that a registered scrollable reference element has been scrolled. */
  _scrolled: Subject<void> = new Subject<void>();

  /** Keeps track of the global `scroll` and `resize` subscriptions. */
  _globalSubscription: Subscription = null;

  /** Keeps track of the amount of subscriptions to `scrolled`. Used for cleaning up afterwards. */
  private _scrolledCount = 0;

  /**
   * Map of all the scrollable references that are registered with the service and their
   * scroll event subscriptions.
   */
  scrollableReferences: Map<Scrollable, Subscription> = new Map();

  /**
   * Registers a Scrollable with the service and listens for its scrolled events. When the
   * scrollable is scrolled, the service emits the event in its scrolled observable.
   * @param scrollable Scrollable instance to be registered.
   */
  register(scrollable: Scrollable): void {
    const scrollSubscription = scrollable.elementScrolled().subscribe(() => this._notify());

    this.scrollableReferences.set(scrollable, scrollSubscription);
  }

  /**
   * Deregisters a Scrollable reference and unsubscribes from its scroll event observable.
   * @param scrollable Scrollable instance to be deregistered.
   */
  deregister(scrollable: Scrollable): void {
    if (this.scrollableReferences.has(scrollable)) {
      this.scrollableReferences.get(scrollable).unsubscribe();
      this.scrollableReferences.delete(scrollable);
    }
  }

  /**
   * Subscribes to an observable that emits an event whenever any of the registered Scrollable
   * references (or window, document, or body) fire a scrolled event. Can provide a time in ms
   * to override the default "throttle" time.
   */
  scrolled(auditTimeInMs: number = DEFAULT_SCROLL_TIME, callback: () => any): Subscription {
    // In the case of a 0ms delay, use an observable without auditTime
    // since it does add a perceptible delay in processing overhead.
    let observable = auditTimeInMs > 0 ?
      this._scrolled.asObservable().auditTime(auditTimeInMs) :
      this._scrolled.asObservable();

    this._scrolledCount++;

    if (!this._globalSubscription) {
      this._globalSubscription = Observable.merge(
        Observable.fromEvent(window.document, 'scroll'),
        Observable.fromEvent(window, 'resize')
      ).subscribe(() => this._notify());
    }

    // Note that we need to do the subscribing from here, in order to be able to remove
    // the global event listeners once there are no more subscriptions.
    return observable.subscribe(callback).add(() => {
      this._scrolledCount--;

      if (this._globalSubscription && !this.scrollableReferences.size && !this._scrolledCount) {
        this._globalSubscription.unsubscribe();
        this._globalSubscription = null;
      }
    });
  }

  /** Returns all registered Scrollables that contain the provided element. */
  getScrollContainers(elementRef: ElementRef): Scrollable[] {
    const scrollingContainers: Scrollable[] = [];

    this.scrollableReferences.forEach((subscription: Subscription, scrollable: Scrollable) => {
      if (this.scrollableContainsElement(scrollable, elementRef)) {
        scrollingContainers.push(scrollable);
      }
    });

    return scrollingContainers;
  }

  /** Returns true if the element is contained within the provided Scrollable. */
  scrollableContainsElement(scrollable: Scrollable, elementRef: ElementRef): boolean {
    let element = elementRef.nativeElement;
    let scrollableElement = scrollable.getElementRef().nativeElement;

    // Traverse through the element parents until we reach null, checking if any of the elements
    // are the scrollable's element.
    do {
      if (element == scrollableElement) { return true; }
    } while (element = element.parentElement);
  }

  /** Sends a notification that a scroll event has been fired. */
  _notify() {
    this._scrolled.next();
  }
}

export function SCROLL_DISPATCHER_PROVIDER_FACTORY(parentDispatcher: ScrollDispatcher) {
  return parentDispatcher || new ScrollDispatcher();
}

export const SCROLL_DISPATCHER_PROVIDER = {
  // If there is already a ScrollDispatcher available, use that. Otherwise, provide a new one.
  provide: ScrollDispatcher,
  deps: [[new Optional(), new SkipSelf(), ScrollDispatcher]],
  useFactory: SCROLL_DISPATCHER_PROVIDER_FACTORY
};
