import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ReplaySubject } from 'rxjs';
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
  private scrollSpyInfo: ScrollSpyInfo | null = null;

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
    const tocList = headings.map(heading => {
      const {title, content} = this.extractHeadingSafeHtml(heading);

      return {
        level: heading.tagName.toLowerCase(),
        href: `${docId}#${this.getId(heading, idMap)}`,
        title,
        content,
      };
    });

    this.tocList.next(tocList);

    this.scrollSpyInfo = this.scrollSpyService.spyOn(headings);
    this.scrollSpyInfo.active.subscribe(item => this.activeItemIndex.next(item && item.index));
  }

  reset() {
    this.resetScrollSpyInfo();
    this.tocList.next([]);
  }

  // Transform the HTML content to be safe to use in the ToC:
  //   - Strip off certain auto-generated elements (such as GitHub links and heading anchor links).
  //   - Strip off any anchor links (but keep their content)
  //   - Mark the HTML as trusted to be used with `[innerHTML]`.
  private extractHeadingSafeHtml(heading: HTMLHeadingElement) {
    const div: HTMLDivElement = this.document.createElement('div');
    div.innerHTML = heading.innerHTML;

    // Remove any `.github-links` or `.header-link` elements (along with their content).
    querySelectorAll(div, '.github-links, .header-link').forEach(removeNode);

    // Remove any remaining `a` elements (but keep their content).
    querySelectorAll(div, 'a').forEach(anchorLink => {
      // We want to keep the content of this anchor, so move it into its parent.
      const parent = anchorLink.parentNode as Node;
      while (anchorLink.childNodes.length) {
        parent.insertBefore(anchorLink.childNodes[0], anchorLink);
      }

      // Now, remove the anchor.
      removeNode(anchorLink);
    });

    return {
      // Security: The document element which provides this heading content is always authored by
      // the documentation team and is considered to be safe.
      content: this.domSanitizer.bypassSecurityTrustHtml(div.innerHTML.trim()),
      title: (div.textContent || '').trim(),
    };
  }

  private findTocHeadings(docElement: Element): HTMLHeadingElement[] {
    // const headings = querySelectorAll(docElement, 'h1,h2,h3');
    const headings = querySelectorAll<HTMLHeadingElement>(docElement, 'h1,h2,h3');
    const skipNoTocHeadings = (heading: HTMLHeadingElement) => !/(?:no-toc|notoc)/i.test(heading.className);

    return headings.filter(skipNoTocHeadings);
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
      id = (h.textContent || '').trim().toLowerCase().replace(/\W+/g, '-');
      id = addToMap(id);
      h.id = id;
    }
    return id;

    // Map guards against duplicate id creation.
    function addToMap(key: string) {
      const oldCount = idMap.get(key) || 0;
      const count = oldCount + 1;
      idMap.set(key, count);
      return count === 1 ? key : `${key}-${count}`;
    }
  }
}

// Helpers
function querySelectorAll<K extends keyof HTMLElementTagNameMap>(parent: Element, selector: K): HTMLElementTagNameMap[K][];
function querySelectorAll<K extends keyof SVGElementTagNameMap>(parent: Element, selector: K): SVGElementTagNameMap[K][];
function querySelectorAll<E extends Element = Element>(parent: Element, selector: string): E[];
function querySelectorAll(parent: Element, selector: string) {
  // Wrap the `NodeList` as a regular `Array` to have access to array methods.
  // NOTE: IE11 does not even support some methods of `NodeList`, such as
  //       [NodeList#forEach()](https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach).
  return Array.from(parent.querySelectorAll(selector));
}

function removeNode(node: Node): void {
  if (node.parentNode !== null) {
    // We cannot use `Node.remove()` because of IE11.
    node.parentNode.removeChild(node);
  }
}
