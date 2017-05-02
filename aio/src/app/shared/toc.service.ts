import { Inject, Injectable } from '@angular/core';
import { DOCUMENT, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ReplaySubject } from 'rxjs/ReplaySubject';

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

  constructor(@Inject(DOCUMENT) private document: any, private domSanitizer: DomSanitizer) { }

  genToc(docElement: Element, docId = '') {
    const tocList = [];

    if (docElement) {
      const headings = docElement.querySelectorAll('h2,h3');
      const idMap = new Map<string, number>();

      for (let i = 0; i < headings.length; i++) {
        const heading = headings[i] as HTMLHeadingElement;

        // skip if heading class is 'no-toc'
        if (/(no-toc|notoc)/i.test(heading.className)) { continue; }

        const id = this.getId(heading, idMap);
        const toc: TocItem = {
          content: this.extractHeadingSafeHtml(heading),
          href: `${docId}#${id}`,
          level: heading.tagName.toLowerCase(),
          title: heading.innerText.trim(),
        };

        tocList.push(toc);
      }
    }

    this.tocList.next(tocList);
  }

  reset() {
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

  // Extract the id from the heading; create one if necessary
  // Is it possible for a heading to lack an id?
  private getId(h: HTMLHeadingElement, idMap: Map<string, number>) {
    let id = h.id;
    if (id) {
      addToMap(id);
    } else {
      id = h.innerText.toLowerCase().replace(/\W+/g, '-');
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
