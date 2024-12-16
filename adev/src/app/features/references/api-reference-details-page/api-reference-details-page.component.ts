/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, inject, input, computed} from '@angular/core';
import {DOCUMENT} from '@angular/common';
import {MatTabsModule} from '@angular/material/tabs';
import {DocContent, DocViewer} from '@angular/docs';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiItemType} from './../interfaces/api-item-type';
import {ReferenceScrollHandler} from '../services/reference-scroll-handler.service';
import {
  API_REFERENCE_DETAILS_PAGE_HEADER_CLASS_NAME,
  API_REFERENCE_DETAILS_PAGE_MEMBERS_CLASS_NAME,
  API_REFERENCE_TAB_ATTRIBUTE,
  API_REFERENCE_TAB_API_LABEL,
  API_TAB_CLASS_NAME,
  API_REFERENCE_TAB_URL_ATTRIBUTE,
} from '../constants/api-reference-prerender.constants';

@Component({
  selector: 'adev-reference-page',
  imports: [DocViewer, MatTabsModule],
  templateUrl: './api-reference-details-page.component.html',
  styleUrls: ['./api-reference-details-page.component.scss'],
  providers: [ReferenceScrollHandler],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ApiReferenceDetailsPage {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly scrollHandler = inject(ReferenceScrollHandler);

  docContent = input<DocContent | undefined>();
  tab = input<string | undefined>();

  // aliases
  ApiItemType = ApiItemType;

  // computed state
  parsedDocContent = computed(() => {
    // TODO: pull this logic outside of a computed where it can be tested etc.
    const docContent = this.docContent();

    if (docContent === undefined) {
      return {
        header: undefined,
        members: undefined,
        tabs: [],
      };
    }

    const element = this.document.createElement('div');
    element.innerHTML = docContent.contents;

    // Get the innerHTML of the header element from received document.
    const header = element.querySelector(API_REFERENCE_DETAILS_PAGE_HEADER_CLASS_NAME);
    // Get the innerHTML of the card elements from received document.
    const members = element.querySelector(API_REFERENCE_DETAILS_PAGE_MEMBERS_CLASS_NAME);

    // Get the tab elements from received document.
    // We're expecting that tab element will contain `tab` attribute.
    const tabs = Array.from(element.querySelectorAll(`[${API_REFERENCE_TAB_ATTRIBUTE}]`)).map(
      (tab) => ({
        url: tab.getAttribute(API_REFERENCE_TAB_URL_ATTRIBUTE)!,
        title: tab.getAttribute(API_REFERENCE_TAB_ATTRIBUTE)!,
        content: tab.innerHTML,
      }),
    );

    element.remove();

    return {
      header: header?.innerHTML,
      members: members?.innerHTML,
      tabs,
    };
  });

  tabs = () => this.parsedDocContent().tabs;

  selectedTabIndex = computed(() => {
    const existingTabIdx = this.tabs().findIndex((tab) => tab.url === this.tab());
    return Math.max(existingTabIdx, 0);
  });

  isApiTabActive = computed(() => {
    const activeTabTitle = this.tabs()[this.selectedTabIndex()]?.title;
    return activeTabTitle === API_REFERENCE_TAB_API_LABEL || activeTabTitle === 'CLI';
  });

  membersCardsLoaded(): void {
    this.scrollHandler.setupListeners(API_TAB_CLASS_NAME);
  }

  tabChange(tabIndex: number) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {tab: this.tabs()[tabIndex].url},
      queryParamsHandling: 'merge',
    });
  }
}
