/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {DocContent, DocViewer} from '@angular/docs';
import {ActivatedRoute} from '@angular/router';
import {map} from 'rxjs/operators';
import {ReferenceScrollHandler} from '../services/reference-scroll-handler.service';
import {API_REFERENCE_DETAILS_PAGE_MEMBERS_CLASS_NAME} from '../constants/api-reference-prerender.constants';

export const CLI_MAIN_CONTENT_SELECTOR = '.docs-reference-cli-content';
export const CLI_TOC = '.adev-reference-cli-toc';

@Component({
  selector: 'adev-cli-reference-page',
  imports: [DocViewer],
  templateUrl: './cli-reference-details-page.component.html',
  styleUrls: [
    './cli-reference-details-page.component.scss',
    '../api-reference-details-page/api-reference-details-page.component.scss',
  ],
  providers: [ReferenceScrollHandler],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CliReferenceDetailsPage implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly scrollHandler = inject(ReferenceScrollHandler);

  cardsInnerHtml = signal<string>('');
  mainContentInnerHtml = signal<string>('');
  membersMarginTopInPx = this.scrollHandler.membersMarginTopInPx;

  ngOnInit(): void {
    this.setPageContent();
  }

  contentLoaded(): void {
    this.scrollHandler.setupListeners(CLI_TOC);
    this.scrollHandler.updateMembersMarginTop(CLI_TOC);
  }

  // Fetch the content for CLI Reference page based on the active route.
  private setPageContent(): void {
    this.activatedRoute.data
      .pipe(
        map((data) => data['docContent']),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((doc: DocContent | undefined) => {
        this.setContentForPageSections(doc);
      });
  }

  private setContentForPageSections(doc: DocContent | undefined) {
    const element = this.document.createElement('div');
    element.innerHTML = doc?.contents!;

    // Get the innerHTML of the main content from received document.
    const mainContent = element.querySelector(CLI_MAIN_CONTENT_SELECTOR);
    if (mainContent) {
      this.mainContentInnerHtml.set(mainContent.innerHTML);
    }

    // Get the innerHTML of the cards from received document.
    const cards = element.querySelector(API_REFERENCE_DETAILS_PAGE_MEMBERS_CLASS_NAME);
    if (cards) {
      this.cardsInnerHtml.set(cards.innerHTML);
    }

    element.remove();
  }
}
