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
import {
  AriaLivePoliteness,
  LiveAnnouncerDefaultOptions,
  LIVE_ANNOUNCER_ELEMENT_TOKEN,
  LIVE_ANNOUNCER_DEFAULT_OPTIONS,
} from './live-announcer-tokens';


@Injectable({providedIn: 'root'})
export class LiveAnnouncer implements OnDestroy {
  private _liveElement: HTMLElement;
  private _document: Document;
  private _previousTimeout?: number;

  constructor(
      @Optional() @Inject(LIVE_ANNOUNCER_ELEMENT_TOKEN) elementToken: any,
      private _ngZone: NgZone,
      @Inject(DOCUMENT) _document: any,
      @Optional() @Inject(LIVE_ANNOUNCER_DEFAULT_OPTIONS)
      private _defaultOptions?: LiveAnnouncerDefaultOptions) {

    // We inject the live element and document as `any` because the constructor signature cannot
    // reference browser globals (HTMLElement, Document) on non-browser environments, since having
    // a class decorator causes TypeScript to preserve the constructor signature types.
    this._document = _document;
    this._liveElement = elementToken || this._createLiveElement();
  }

  /**
   * Announces a message to screenreaders.
   * @param message Message to be announced to the screenreader.
   * @returns Promise that will be resolved when the message is added to the DOM.
   */
  announce(message: string): Promise<void>;

  /**
   * Announces a message to screenreaders.
   * @param message Message to be announced to the screenreader.
   * @param politeness The politeness of the announcer element.
   * @returns Promise that will be resolved when the message is added to the DOM.
   */
  announce(message: string, politeness?: AriaLivePoliteness): Promise<void>;

  /**
   * Announces a message to screenreaders.
   * @param message Message to be announced to the screenreader.
   * @param duration Time in milliseconds after which to clear out the announcer element. Note
   *   that this takes effect after the message has been added to the DOM, which can be up to
   *   100ms after `announce` has been called.
   * @returns Promise that will be resolved when the message is added to the DOM.
   */
  announce(message: string, duration?: number): Promise<void>;

  /**
   * Announces a message to screenreaders.
   * @param message Message to be announced to the screenreader.
   * @param politeness The politeness of the announcer element.
   * @param duration Time in milliseconds after which to clear out the announcer element. Note
   *   that this takes effect after the message has been added to the DOM, which can be up to
   *   100ms after `announce` has been called.
   * @returns Promise that will be resolved when the message is added to the DOM.
   */
  announce(message: string, politeness?: AriaLivePoliteness, duration?: number): Promise<void>;

  announce(message: string, ...args: any[]): Promise<void> {
    const defaultOptions = this._defaultOptions;
    let politeness: AriaLivePoliteness | undefined;
    let duration: number | undefined;

    if (args.length === 1 && typeof args[0] === 'number') {
      duration = args[0];
    } else {
      [politeness, duration] = args;
    }

    this.clear();
    clearTimeout(this._previousTimeout);

    if (!politeness) {
      politeness =
          (defaultOptions && defaultOptions.politeness) ? defaultOptions.politeness : 'polite';
    }

    if (duration == null && defaultOptions) {
      duration = defaultOptions.duration;
    }

    // TODO: ensure changing the politeness works on all environments we support.
    this._liveElement.setAttribute('aria-live', politeness);

    // This 100ms timeout is necessary for some browser + screen-reader combinations:
    // - Both JAWS and NVDA over IE11 will not announce anything without a non-zero timeout.
    // - With Chrome and IE11 with NVDA or JAWS, a repeated (identical) message won't be read a
    //   second time without clearing and then using a non-zero delay.
    // (using JAWS 17 at time of this writing).
    return this._ngZone.runOutsideAngular(() => {
      return new Promise(resolve => {
        clearTimeout(this._previousTimeout);
        this._previousTimeout = setTimeout(() => {
          this._liveElement.textContent = message;
          resolve();

          if (typeof duration === 'number') {
            this._previousTimeout = setTimeout(() => this.clear(), duration);
          }
        }, 100);
      });
    });
  }

  /**
   * Clears the current text from the announcer element. Can be used to prevent
   * screen readers from reading the text out again while the user is going
   * through the page landmarks.
   */
  clear() {
    if (this._liveElement) {
      this._liveElement.textContent = '';
    }
  }

  ngOnDestroy() {
    clearTimeout(this._previousTimeout);

    if (this._liveElement && this._liveElement.parentNode) {
      this._liveElement.parentNode.removeChild(this._liveElement);
      this._liveElement = null!;
    }
  }

  private _createLiveElement(): HTMLElement {
    const elementClass = 'cdk-live-announcer-element';
    const previousElements = this._document.getElementsByClassName(elementClass);
    const liveEl = this._document.createElement('div');

    // Remove any old containers. This can happen when coming in from a server-side-rendered page.
    for (let i = 0; i < previousElements.length; i++) {
      previousElements[i].parentNode!.removeChild(previousElements[i]);
    }

    liveEl.classList.add(elementClass);
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
    } else if (!this._subscription) {
      this._subscription = this._ngZone.runOutsideAngular(() => {
        return this._contentObserver
          .observe(this._elementRef)
          .subscribe(() => {
            // Note that we use textContent here, rather than innerText, in order to avoid a reflow.
            const elementText = this._elementRef.nativeElement.textContent;

            // The `MutationObserver` fires also for attribute
            // changes which we don't want to announce.
            if (elementText !== this._previousAnnouncedText) {
              this._liveAnnouncer.announce(elementText, this._politeness);
              this._previousAnnouncedText = elementText;
            }
          });
      });
    }
  }
  private _politeness: AriaLivePoliteness = 'off';

  private _previousAnnouncedText?: string;
  private _subscription: Subscription | null;

  constructor(private _elementRef: ElementRef, private _liveAnnouncer: LiveAnnouncer,
              private _contentObserver: ContentObserver, private _ngZone: NgZone) {}

  ngOnDestroy() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
  }
}


/** @docs-private @deprecated @breaking-change 8.0.0 */
export function LIVE_ANNOUNCER_PROVIDER_FACTORY(
    parentAnnouncer: LiveAnnouncer, liveElement: any, _document: any, ngZone: NgZone) {
  return parentAnnouncer || new LiveAnnouncer(liveElement, ngZone, _document);
}


/** @docs-private @deprecated @breaking-change 8.0.0 */
export const LIVE_ANNOUNCER_PROVIDER: Provider = {
  // If there is already a LiveAnnouncer available, use that. Otherwise, provide a new one.
  provide: LiveAnnouncer,
  deps: [
    [new Optional(), new SkipSelf(), LiveAnnouncer],
    [new Optional(), new Inject(LIVE_ANNOUNCER_ELEMENT_TOKEN)],
    DOCUMENT,
    NgZone,
  ],
  useFactory: LIVE_ANNOUNCER_PROVIDER_FACTORY
};
