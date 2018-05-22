/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ContentObserver} from '@angular/cdk/observers';
import {DOCUMENT} from '@angular/common';
import {
  Directive,
  ElementRef,
  Inject,
  Injectable,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  Provider,
  SkipSelf,
} from '@angular/core';
import {Subscription} from 'rxjs';
import {LIVE_ANNOUNCER_ELEMENT_TOKEN} from './live-announcer-token';


/** Possible politeness levels. */
export type AriaLivePoliteness = 'off' | 'polite' | 'assertive';

@Injectable({providedIn: 'root'})
export class LiveAnnouncer implements OnDestroy {
  private readonly _liveElement: Element;

  constructor(
      @Optional() @Inject(LIVE_ANNOUNCER_ELEMENT_TOKEN) elementToken: any,
      @Inject(DOCUMENT) private _document: any) {

    // We inject the live element as `any` because the constructor signature cannot reference
    // browser globals (HTMLElement) on non-browser environments, since having a class decorator
    // causes TypeScript to preserve the constructor signature types.
    this._liveElement = elementToken || this._createLiveElement();
  }

  /**
   * Announces a message to screenreaders.
   * @param message Message to be announced to the screenreader
   * @param politeness The politeness of the announcer element
   * @returns Promise that will be resolved when the message is added to the DOM.
   */
  announce(message: string, politeness: AriaLivePoliteness = 'polite'): Promise<void> {
    this._liveElement.textContent = '';

    // TODO: ensure changing the politeness works on all environments we support.
    this._liveElement.setAttribute('aria-live', politeness);

    // This 100ms timeout is necessary for some browser + screen-reader combinations:
    // - Both JAWS and NVDA over IE11 will not announce anything without a non-zero timeout.
    // - With Chrome and IE11 with NVDA or JAWS, a repeated (identical) message won't be read a
    //   second time without clearing and then using a non-zero delay.
    // (using JAWS 17 at time of this writing).
    return new Promise(resolve => {
      setTimeout(() => {
        this._liveElement.textContent = message;
        resolve();
      }, 100);
    });
  }

  ngOnDestroy() {
    if (this._liveElement && this._liveElement.parentNode) {
      this._liveElement.parentNode.removeChild(this._liveElement);
    }
  }

  private _createLiveElement(): Element {
    let liveEl = this._document.createElement('div');

    liveEl.classList.add('cdk-visually-hidden');
    liveEl.setAttribute('aria-atomic', 'true');
    liveEl.setAttribute('aria-live', 'polite');

    this._document.body.appendChild(liveEl);

    return liveEl;
  }

}


/**
 * A directive that works similarly to aria-live, but uses the LiveAnnouncer to ensure compatibility
 * with a wider range of browsers and screen readers.
 */
@Directive({
  selector: '[cdkAriaLive]',
  exportAs: 'cdkAriaLive',
})
export class CdkAriaLive implements OnDestroy {
  /** The aria-live politeness level to use when announcing messages. */
  @Input('cdkAriaLive')
  get politeness(): AriaLivePoliteness { return this._politeness; }
  set politeness(value: AriaLivePoliteness) {
    this._politeness = value === 'polite' || value === 'assertive' ? value : 'off';
    if (this._politeness === 'off') {
      if (this._subscription) {
        this._subscription.unsubscribe();
        this._subscription = null;
      }
    } else {
      if (!this._subscription) {
        this._subscription = this._ngZone.runOutsideAngular(
            () => this._contentObserver.observe(this._elementRef.nativeElement).subscribe(
                () => this._liveAnnouncer.announce(
                    this._elementRef.nativeElement.innerText, this._politeness)));
      }
    }
  }
  private _politeness: AriaLivePoliteness = 'off';

  private _subscription: Subscription | null;

  constructor(private _elementRef: ElementRef, private _liveAnnouncer: LiveAnnouncer,
              private _contentObserver: ContentObserver, private _ngZone: NgZone) {}

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}


/** @docs-private @deprecated @deletion-target 7.0.0 */
export function LIVE_ANNOUNCER_PROVIDER_FACTORY(
    parentDispatcher: LiveAnnouncer, liveElement: any, _document: any) {
  return parentDispatcher || new LiveAnnouncer(liveElement, _document);
}


/** @docs-private @deprecated @deletion-target 7.0.0 */
export const LIVE_ANNOUNCER_PROVIDER: Provider = {
  // If there is already a LiveAnnouncer available, use that. Otherwise, provide a new one.
  provide: LiveAnnouncer,
  deps: [
    [new Optional(), new SkipSelf(), LiveAnnouncer],
    [new Optional(), new Inject(LIVE_ANNOUNCER_ELEMENT_TOKEN)],
    DOCUMENT,
  ],
  useFactory: LIVE_ANNOUNCER_PROVIDER_FACTORY
};
