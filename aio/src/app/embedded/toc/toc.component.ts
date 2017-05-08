import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/combineLatest';
import 'rxjs/add/operator/takeUntil';

import { ScrollService } from 'app/shared/scroll.service';
import { TocItem, TocService } from 'app/shared/toc.service';

@Component({
  selector: 'aio-toc',
  templateUrl: 'toc.component.html',
  styles: []
})
export class TocComponent implements OnInit, AfterViewInit, OnDestroy {

  activeIndex: number | null = null;
  hasSecondary = false;
  hasToc = false;
  hostElement: HTMLElement;
  isCollapsed = true;
  isEmbedded = false;
  @ViewChildren('tocItem') private items: QueryList<ElementRef>;
  private onDestroy = new Subject();
  private primaryMax = 4;
  tocList: TocItem[];

  constructor(
    private scrollService: ScrollService,
    elementRef: ElementRef,
    private tocService: TocService) {
    this.hostElement = elementRef.nativeElement;
    this.isEmbedded = this.hostElement.className.indexOf('embedded') !== -1;
  }

  ngOnInit() {
    this.tocService.tocList
        .takeUntil(this.onDestroy)
        .subscribe(tocList => {
          const count = tocList.length;

          this.hasToc = count > 0;
          this.hasSecondary = this.isEmbedded && this.hasToc && (count > this.primaryMax);
          this.tocList = tocList;

          if (this.hasSecondary) {
            for (let i = this.primaryMax; i < count; i++) {
              tocList[i].isSecondary = true;
            }
          }
        });
  }

  ngAfterViewInit() {
    if (!this.isEmbedded) {
      this.tocService.activeItemIndex
          .takeUntil(this.onDestroy)
          .subscribe(index => this.activeIndex = index);

      Observable.combineLatest(this.tocService.activeItemIndex, this.items.changes.startWith(this.items))
          .takeUntil(this.onDestroy)
          .subscribe(([index, items]) => {
            if (index === null || index >= items.length) {
              return;
            }

            const e = items.toArray()[index].nativeElement;
            const p = e.offsetParent;

            const eRect = e.getBoundingClientRect();
            const pRect = p.getBoundingClientRect();

            const isInViewport = (eRect.top >= pRect.top) && (eRect.bottom <= pRect.bottom);

            if (!isInViewport) {
              p.scrollTop += (eRect.top - pRect.top) - (p.clientHeight / 2);
            }
          });
    }
  }

  ngOnDestroy() {
    this.onDestroy.next();
  }

  toggle(canScroll = true) {
    this.isCollapsed = !this.isCollapsed;
    if (canScroll && this.isCollapsed) { this.toTop(); }
  }

  toTop() {
    this.scrollService.scrollToTop();
  }
}
