/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Platform, supportsPassiveEventListeners} from '@angular/cdk/platform';
import {
  Directive,
  ElementRef,
  EventEmitter,
  Injectable,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {empty as observableEmpty} from 'rxjs/observable/empty';
import {Subject} from 'rxjs/Subject';


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
const listenerOptions: any = supportsPassiveEventListeners() ? {passive: true} : false;


/**
 * An injectable service that can be used to monitor the autofill state of an input.
 * Based on the following blog post:
 * https://medium.com/@brunn/detecting-autofilled-fields-in-javascript-aed598d25da7
 */
@Injectable()
export class AutofillMonitor implements OnDestroy {
  private _monitoredElements = new Map<Element, MonitoredElementInfo>();

  constructor(private _platform: Platform) {}

  /**
   * Monitor for changes in the autofill state of the given input element.
   * @param element The element to monitor.
   * @return A stream of autofill state changes.
   */
  monitor(element: Element): Observable<AutofillEvent> {
    if (!this._platform.isBrowser) {
      return observableEmpty();
    }

    const info = this._monitoredElements.get(element);
    if (info) {
      return info.subject.asObservable();
    }

    const result = new Subject<AutofillEvent>();
    const listener = (event: AnimationEvent) => {
      if (event.animationName === 'mat-input-autofill-start') {
        element.classList.add('mat-input-autofilled');
        result.next({target: event.target as Element, isAutofilled: true});
      } else if (event.animationName === 'mat-input-autofill-end') {
        element.classList.remove('mat-input-autofilled');
        result.next({target: event.target as Element, isAutofilled: false});
      }
    };

    element.addEventListener('animationstart', listener, listenerOptions);
    element.classList.add('mat-input-autofill-monitored');

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
  stopMonitoring(element: Element) {
    const info = this._monitoredElements.get(element);
    if (info) {
      info.unlisten();
      element.classList.remove('mat-input-autofill-monitored');
      element.classList.remove('mat-input-autofilled');
      this._monitoredElements.delete(element);
    }
  }

  ngOnDestroy() {
    this._monitoredElements.forEach(info => {
      info.unlisten();
      info.subject.complete();
    });
  }
}


/** A directive that can be used to monitor the autofill state of an input. */
@Directive({
  selector: '[matAutofill]',
})
export class MatAutofill implements OnDestroy, OnInit {
  @Output() matAutofill = new EventEmitter<AutofillEvent>();

  constructor(private _elementRef: ElementRef, private _autofillMonitor: AutofillMonitor) {}

  ngOnInit() {
    this._autofillMonitor.monitor(this._elementRef.nativeElement)
        .subscribe(event => this.matAutofill.emit(event));
  }

  ngOnDestroy() {
    this._autofillMonitor.stopMonitoring(this._elementRef.nativeElement);
  }
}
