import { Component,  ElementRef, HostBinding, HostListener, OnInit } from '@angular/core';

import { TocItem, TocService } from 'app/shared/toc.service';

@Component({
  selector: 'aio-toc',
  templateUrl: 'toc.component.html',
  styles: []
})
export class TocComponent implements OnInit {

  hasSecondary = false;
  hasToc = true;
  isClosed = true;
  isEmbedded = false;
  private primaryMax = 4;
  tocList: TocItem[];

  @HostBinding('style.bottom') bottom: string;
  private elemTrackedForTop: Element;


  constructor(
    elementRef: ElementRef,
    private tocService: TocService) {
    const hostElement = elementRef.nativeElement;
    this.isEmbedded = hostElement.className.indexOf('embedded') !== -1;

    this.elemTrackedForTop = document.querySelector(hostElement.getAttribute('track-top'));
  }

  ngOnInit() {
    const tocList = this.tocList = this.tocService.tocList;
    const count = tocList.length;
    this.hasToc = count > 0;
    if (this.isEmbedded && this.hasToc) {
      // If TOC is embedded in doc, mark secondary (sometimes hidden) items
      this.hasSecondary = tocList.length > this.primaryMax;
      for (let i = this.primaryMax; i < count; i++) {
        tocList[i].isSecondary = true;
      }
    }
  }

  toggle() {
    this.isClosed = !this.isClosed;
  }

  @HostListener('window:scroll')
  private onScroll() {
    this.bottom = this.elemTrackedForTop && `calc(100vh - ${this.elemTrackedForTop.getBoundingClientRect().top}px)`;
  }
}
