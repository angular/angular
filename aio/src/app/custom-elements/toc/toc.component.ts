import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { asapScheduler as asap, combineLatest, Subject } from 'rxjs';
import { startWith, subscribeOn, takeUntil } from 'rxjs/operators';

import { ScrollService } from 'app/shared/scroll.service';
import { TocItem, TocService } from 'app/shared/toc.service';

type TocType = 'None' | 'Floating' | 'EmbeddedSimple' | 'EmbeddedExpandable';

@Component({
  selector: 'aio-toc',
  templateUrl: 'toc.component.html',
  styles: []
})
export class TocComponent implements OnInit, AfterViewInit, OnDestroy {

  activeIndex: number | null = null;
  type: TocType = 'None';
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
    this.isEmbedded = elementRef.nativeElement.className.indexOf('embedded') !== -1;
  }

  ngOnInit() {
    this.tocService.tocList
        .pipe(takeUntil(this.onDestroy))
        .subscribe(tocList => {
          this.tocList = tocList;
          const itemCount = count(this.tocList, item => item.level !== 'h1');

          this.type = (itemCount > 0) ?
                        this.isEmbedded ?
                          (itemCount > this.primaryMax) ?
                            'EmbeddedExpandable' :
                          'EmbeddedSimple' :
                        'Floating' :
                      'None';
        });
  }

  ngAfterViewInit() {
    if (!this.isEmbedded) {
      // We use the `asap` scheduler because updates to `activeItemIndex` are triggered by DOM changes,
      // which, in turn, are caused by the rendering that happened due to a ChangeDetection.
      // Without asap, we would be updating the model while still in a ChangeDetection handler, which is disallowed by Angular.
      combineLatest(this.tocService.activeItemIndex.pipe(subscribeOn(asap)), this.items.changes.pipe(startWith(this.items)))
          .pipe(takeUntil(this.onDestroy))
          .subscribe(([index, items]) => {
            this.activeIndex = index;
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

function count<T>(array: T[], fn: (item: T) => boolean) {
  return array.reduce((result, item) => fn(item) ? result + 1 : result, 0);
}
