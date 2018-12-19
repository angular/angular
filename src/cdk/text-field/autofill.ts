/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform, normalizePassiveListenerOptions} from '@angular/cdk/platform';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Injectable,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {coerceElement} from '@angular/cdk/coercion';
import {EMPTY, Observable, Subject} from 'rxjs';


/** An event that is emitted when the autofill state of an input changes. */
export type AutofillEvent = {
  /** The element whose autofill state changes. */
  target: Element;
  /** Whether the element is currently autofilled. */
  isAutofilled: boolean;
};


/** Used to track info about currently monitored elements. */
type MonitoredElementInfo = {
  subject: Subject<AutofillEvent>;
  unlisten: () => void;
};


/** Options to pass to the animationstart listener. */
const listenerOptions = normalizePassiveListenerOptions({passive: true});


/**
 * An injectable service that can be used to monitor the autofill state of an input.
 * Based on the following blog post:
 * https://medium.com/@brunn/detecting-autofilled-fields-in-javascript-aed598d25da7
 */
@Injectable({providedIn: 'root'})
export class AutofillMonitor implements OnDestroy {
  private _monitoredElements = new Map<Element, MonitoredElementInfo>();

  constructor(private _platform: Platform, private _ngZone: NgZone) {}

  /**
   * Monitor for changes in the autofill state of the given input element.
   * @param element The element to monitor.
   * @return A stream of autofill state changes.
   */
  monitor(element: Element): Observable<AutofillEvent>;

  /**
   * Monitor for changes in the autofill state of the given input element.
   * @param element The element to monitor.
   * @return A stream of autofill state changes.
   */
  monitor(element: ElementRef<Element>): Observable<AutofillEvent>;

  monitor(elementOrRef: Element | ElementRef<Element>): Observable<AutofillEvent> {
    if (!this._platform.isBrowser) {
      return EMPTY;
    }

    const element = coerceElement(elementOrRef);
    const info = this._monitoredElements.get(element);

    if (info) {
      return info.subject.asObservable();
    }

    const result = new Subject<AutofillEvent>();
    const cssClass = 'cdk-text-field-autofilled';
    const listener = ((event: AnimationEvent) => {
      // Animation events fire on initial element render, we check for the presence of the autofill
      // CSS class to make sure this is a real change in state, not just the initial render before
      // we fire off events.
      if (event.animationName === 'cdk-text-field-autofill-start' &&
          !element.classList.contains(cssClass)) {
        element.classList.add(cssClass);
        this._ngZone.run(() => result.next({target: event.target as Element, isAutofilled: true}));
      } else if (event.animationName === 'cdk-text-field-autofill-end' &&
          element.classList.contains(cssClass)) {
        element.classList.remove(cssClass);
        this._ngZone.run(() => result.next({target: event.target as Element, isAutofilled: false}));
      }
    }) as EventListenerOrEventListenerObject;

    this._ngZone.runOutsideAngular(() => {
      element.addEventListener('animationstart', listener, listenerOptions);
      element.classList.add('cdk-text-field-autofill-monitored');
    });

    this._monitoredElements.set(element, {
      subject: result,
      unlisten: () => {
        element.removeEventListener('animationstart', listener, listenerOptions);
      }
    });

    return result.asObservable();
  }

  /**
   * Stop monitoring the autofill state of the given input element.
   * @param element The element to stop monitoring.
   */
  stopMonitoring(element: Element): void;

  /**
   * Stop monitoring the autofill state of the given input element.
   * @param element The element to stop monitoring.
   */
  stopMonitoring(element: ElementRef<Element>): void;

  stopMonitoring(elementOrRef: Element | ElementRef<Element>): void {
    const element = coerceElement(elementOrRef);
    const info = this._monitoredElements.get(element);

    if (info) {
      info.unlisten();
      info.subject.complete();
      element.classList.remove('cdk-text-field-autofill-monitored');
      element.classList.remove('cdk-text-field-autofilled');
      this._monitoredElements.delete(element);
    }
  }

  ngOnDestroy() {
    this._monitoredElements.forEach((_info, element) => this.stopMonitoring(element));
  }
}


/** A directive that can be used to monitor the autofill state of an input. */
@Directive({
  selector: '[cdkAutofill]',
})
export class CdkAutofill implements OnDestroy, OnInit {
  /** Emits when the autofill state of the element changes. */
  @Output() cdkAutofill: EventEmitter<AutofillEvent> = new EventEmitter<AutofillEvent>();

  constructor(private _elementRef: ElementRef<HTMLElement>,
              private _autofillMonitor: AutofillMonitor) {}

  ngOnInit() {
    this._autofillMonitor
      .monitor(this._elementRef)
      .subscribe(event => this.cdkAutofill.emit(event));
  }

  ngOnDestroy() {
    this._autofillMonitor.stopMonitoring(this._elementRef);
  }
}
