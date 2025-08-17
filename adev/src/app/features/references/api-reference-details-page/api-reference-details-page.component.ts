/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, effect, inject, input, Renderer2} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {DocContent, DocViewer} from '@angular/docs';
import {ActivatedRoute} from '@angular/router';
import {DOCUMENT} from '@angular/common';
import {ReferenceScrollHandler} from '../services/reference-scroll-handler.service';
import {API_SECTION_CLASS_NAME} from '../constants/api-reference-prerender.constants';

const HIGHLIGHTED_CARD_CLASS = 'docs-highlighted-card';

@Component({
  selector: 'adev-reference-page',
  imports: [DocViewer],
  templateUrl: './api-reference-details-page.component.html',
  styleUrls: ['./api-reference-details-page.component.scss'],
  providers: [ReferenceScrollHandler],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ApiReferenceDetailsPage {
  private readonly referenceScrollHandler = inject(ReferenceScrollHandler);
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);

  private highlightedElement: HTMLElement | null = null;

  readonly docContent = input<DocContent | undefined>();
  readonly urlFragment = toSignal(this.route.fragment);

  constructor() {
    effect(() => this.highlightCard());
  }

  onContentLoaded() {
    this.referenceScrollHandler.setupListeners(API_SECTION_CLASS_NAME);
    this.scrollToSectionLegacy();
    this.highlightCard();
  }

  /** Handle legacy URLs with a `tab` query param from the old tab layout  */
  private scrollToSectionLegacy() {
    const params = this.route.snapshot.queryParams;
    const tab = params['tab'] as string | undefined;

    if (tab) {
      const section = this.document.getElementById(tab);

      if (section) {
        // `scrollIntoView` is ignored even, if the element exists.
        // It seems that it's related to: https://issues.chromium.org/issues/40715316
        // Hence, the usage of `setTimeout`.
        setTimeout(() => {
          section.scrollIntoView({behavior: 'smooth'});
        }, 100);
      }
    }
  }

  /** Highlight the member card that corresponds to the URL fragment.  */
  private highlightCard() {
    if (this.highlightedElement) {
      this.renderer.removeClass(this.highlightedElement, HIGHLIGHTED_CARD_CLASS);
      this.highlightedElement = null;
    }

    const fragment = this.urlFragment();

    if (fragment) {
      const element = this.document.getElementById(fragment);

      if (element) {
        this.renderer.addClass(element, HIGHLIGHTED_CARD_CLASS);
      }
      this.highlightedElement = element;
    }
  }
}
