import { Inject, Injectable } from '@angular/core';
import { DOCUMENT, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { ScrollSpyInfo, ScrollSpyService } from 'app/shared/scroll-spy.service';


export interface TocItem {
  content: SafeHtml;
  href: string;
  isSecondary?: boolean;
  level: string;
  title: string;
}

@Injectable()
export class TocService {
  tocList = new ReplaySubject<TocItem[]>(1);
  activeItemIndex = new ReplaySubject<number | null>(1);
  private scrollSpyInfo: ScrollSpyInfo | null;

  constructor(
      @Inject(DOCUMENT) private document: any,
      private domSanitizer: DomSanitizer,
      private scrollSpyService: ScrollSpyService) { }

  genToc(docElement?: Element, docId = '') {
    this.resetScrollSpyInfo();

    if (!docElement) {
      this.tocList.next([]);
      return;
    }

    const headings = this.findTocHeadings(docElement);
    const idMap = new Map<string, number>();
    const tocList = headings.map(heading => ({
      content: this.extractHeadingSafeHtml(heading),
      href: `${docId}#${this.getId(heading, idMap)}`,
      level: heading.tagName.toLowerCase(),
      title: heading.textContent.trim(),
    }));

    this.tocList.next(tocList);

    this.scrollSpyInfo = this.scrollSpyService.spyOn(headings);
    this.scrollSpyInfo.active.subscribe(item => this.activeItemIndex.next(item && item.index));
  }

  reset() {
    this.resetScrollSpyInfo();
    this.tocList.next([]);
  }

  // This bad boy exists only to strip off the anchor link attached to a heading
  private extractHeadingSafeHtml(heading: HTMLHeadingElement) {
    const a = this.document.createElement('a') as HTMLAnchorElement;
    a.innerHTML = heading.innerHTML;
    const anchorLink = a.querySelector('a');
    if (anchorLink) {
      a.removeChild(anchorLink);
    }
    // security: the document element which provides this heading content
    // is always authored by the documentation team and is considered to be safe
    return this.domSanitizer.bypassSecurityTrustHtml(a.innerHTML.trim());
  }

  private findTocHeadings(docElement: Element): HTMLHeadingElement[] {
    const headings = docElement.querySelectorAll('h1,h2,h3');
    const skipNoTocHeadings = (heading: HTMLHeadingElement) => !/(?:no-toc|notoc)/i.test(heading.className);

    return Array.prototype.filter.call(headings, skipNoTocHeadings);
  }

  private resetScrollSpyInfo() {
    if (this.scrollSpyInfo) {
      this.scrollSpyInfo.unspy();
      this.scrollSpyInfo = null;
    }

    this.activeItemIndex.next(null);
  }

  // Extract the id from the heading; create one if necessary
  // Is it possible for a heading to lack an id?
  private getId(h: HTMLHeadingElement, idMap: Map<string, number>) {
    let id = h.id;
    if (id) {
      addToMap(id);
    } else {
      id = h.textContent.trim().toLowerCase().replace(/\W+/g, '-');
      id = addToMap(id);
      h.id = id;
    }
    return id;

    // Map guards against duplicate id creation.
    function addToMap(key: string) {
      const count = idMap[key] = idMap[key] ? idMap[key] + 1 : 1;
      return count === 1 ? key : `${key}-${count}`;
    }
  }
}
