/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject, input} from '@angular/core';
import {DocContent, DocViewer} from '@angular/docs';
import {ActivatedRoute} from '@angular/router';
import {DOCUMENT} from '@angular/common';
import {ReferenceScrollHandler} from '../services/reference-scroll-handler.service';
import {API_SECTION_CLASS_NAME} from '../constants/api-reference-prerender.constants';

@Component({
  selector: 'adev-reference-page',
  standalone: true,
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

  docContent = input<DocContent | undefined>();

  onContentLoaded() {
    this.referenceScrollHandler.setupListeners(API_SECTION_CLASS_NAME);
    this.scrollToSectionLegacy();
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
}
