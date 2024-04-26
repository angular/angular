/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import {DOCUMENT, NgFor, NgIf, ViewportScroller} from '@angular/common';
import {MatTabGroup, MatTabsModule} from '@angular/material/tabs';
import {takeUntilDestroyed, toSignal} from '@angular/core/rxjs-interop';
import {distinctUntilChanged, filter, map, take} from 'rxjs/operators';
import {DocContent, DocViewer} from '@angular/docs';
import {ActivatedRoute, Router, RouterLink, Scroll} from '@angular/router';
import {ApiItemType} from './../interfaces/api-item-type';
import {ReferenceScrollHandler} from '../services/reference-scroll-handler.service';
import {
  API_REFERENCE_DETAILS_PAGE_HEADER_CLASS_NAME,
  API_REFERENCE_DETAILS_PAGE_MEMBERS_CLASS_NAME,
  API_REFERENCE_TAB_ATTRIBUTE,
  API_REFERENCE_TAB_QUERY_PARAM,
  API_REFERENCE_TAB_API_LABEL,
  API_TAB_CLASS_NAME,
  API_REFERENCE_TAB_BODY_CLASS_NAME,
  API_REFERENCE_TAB_URL_ATTRIBUTE,
} from '../constants/api-reference-prerender.constants';

@Component({
  selector: 'adev-reference-page',
  standalone: true,
  imports: [DocViewer, NgIf, NgFor, MatTabsModule, RouterLink],
  templateUrl: './api-reference-details-page.component.html',
  styleUrls: ['./api-reference-details-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ApiReferenceDetailsPage implements OnInit, AfterViewInit {
  @ViewChild(MatTabGroup, {static: true}) matTabGroup!: MatTabGroup;

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly scrollHandler = inject(ReferenceScrollHandler);
  private readonly scroller = inject(ViewportScroller);
  private scrollEvent = toSignal(
    this.router.events.pipe(
      filter((e): e is Scroll => e instanceof Scroll),
      take(1),
    ),
    {initialValue: null},
  );
  private cardsDisplayedOnInit = false;

  ApiItemType = ApiItemType;

  canDisplayCards = signal<boolean>(false);
  tabs = signal<{url: string; title: string; content: string}[]>([]);
  headerInnerHtml = signal<string | undefined>(undefined);
  membersInnerHtml = signal<string | undefined>(undefined);
  membersMarginTopInPx = this.scrollHandler.membersMarginTopInPx;
  selectedTabIndex = signal(0);

  ngOnInit(): void {
    this.setPageContent();
  }

  ngAfterViewInit(): void {
    this.setActiveTab();
    if (this.canDisplayCards()) {
      this.cardsDisplayedOnInit = true;
    }
    this.listenToTabChange();
  }

  membersCardsLoaded(): void {
    const event = this.scrollEvent();
    if (this.cardsDisplayedOnInit && event) {
      // Cards loaded after scroll event happened. We have to handle the scroll event manually
      if (event.position) {
        this.scroller.scrollToPosition(event.position);
      } else if (event.anchor) {
        this.scroller.scrollToAnchor(event.anchor);
      }
    }
    this.scrollHandler.setupListeners(API_TAB_CLASS_NAME);
  }

  // Fetch the content for API Reference page based on the active route.
  private setPageContent(): void {
    this.activatedRoute.data
      .pipe(
        map((data) => data['docContent']),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((doc: DocContent | undefined) => {
        this.setContentForPageSections(doc);
        this.setActiveTab();
      });
  }

  private listenToTabChange(): void {
    this.matTabGroup.selectedIndexChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((index) => {
        this.router.navigate([], {
          relativeTo: this.activatedRoute,
          queryParams: {tab: this.tabs()[index].url},
          queryParamsHandling: 'merge',
        });
      });
  }

  private setContentForPageSections(doc: DocContent | undefined): void {
    const element = this.document.createElement('div');
    element.innerHTML = doc?.contents!;

    // Get the innerHTML of the header element from received document.
    const header = element.querySelector(API_REFERENCE_DETAILS_PAGE_HEADER_CLASS_NAME);
    if (header) {
      this.headerInnerHtml.set(header.innerHTML);
    }

    // Get the innerHTML of the card elements from received document.
    const members = element.querySelector(API_REFERENCE_DETAILS_PAGE_MEMBERS_CLASS_NAME);
    if (members) {
      this.membersInnerHtml.set(members.innerHTML);
    }

    // Get the tab elements from received document.
    // We're expecting that tab element will contain `tab` attribute.
    const tabs = Array.from(element.querySelectorAll(`[${API_REFERENCE_TAB_ATTRIBUTE}]`));
    this.tabs.set(
      tabs.map((tab) => ({
        url: tab.getAttribute(API_REFERENCE_TAB_URL_ATTRIBUTE)!,
        title: tab.getAttribute(API_REFERENCE_TAB_ATTRIBUTE)!,
        content: tab.innerHTML,
      })),
    );

    element.remove();
  }

  private setActiveTab(): void {
    this.activatedRoute.queryParamMap
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((paramsMap) => {
        const selectedTabUrl = paramsMap.get(API_REFERENCE_TAB_QUERY_PARAM);
        const tabIndexToSelect = this.tabs().findIndex((tab) => tab.url === selectedTabUrl);
        this.selectedTabIndex.set(tabIndexToSelect < 0 ? 0 : tabIndexToSelect);

        this.scrollHandler.updateMembersMarginTop(API_REFERENCE_TAB_BODY_CLASS_NAME);

        const isApiTabActive =
          this.tabs()[this.selectedTabIndex()]?.title === API_REFERENCE_TAB_API_LABEL ||
          this.tabs()[this.selectedTabIndex()]?.title === 'CLI';
        this.canDisplayCards.set(isApiTabActive);
      });
  }
}
