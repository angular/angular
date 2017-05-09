import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';

import { ScrollService } from 'app/shared/scroll.service';
import { TocItem, TocService } from 'app/shared/toc.service';

@Component({
  selector: 'aio-toc',
  templateUrl: 'toc.component.html',
  styles: []
})
export class TocComponent implements OnInit, OnDestroy {

  hasSecondary = false;
  hasToc = false;
  hostElement: HTMLElement;
  isClosed = true;
  isEmbedded = false;
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
        .subscribe((tocList: TocItem[]) => {
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

  ngOnDestroy() {
    this.onDestroy.next();
  }

  toggle(canScroll = true) {
    this.isClosed = !this.isClosed;
    if (canScroll && this.isClosed) { this.scrollService.scrollToTop(); }
  }
}
