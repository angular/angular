import { Component, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

import { asapScheduler, Observable, of, timer } from 'rxjs';
import { catchError, observeOn, switchMap, takeUntil, tap } from 'rxjs/operators';

import { DocumentContents, FILE_NOT_FOUND_ID, FETCHING_ERROR_ID } from 'app/documents/document.service';
import { Logger } from 'app/shared/logger.service';
import { TocService } from 'app/shared/toc.service';
import { ElementsLoader } from 'app/custom-elements/elements-loader';


// Constants
export const NO_ANIMATIONS = 'no-animations';

// Initialization prevents flicker once pre-rendering is on
const initialDocViewerElement = document.querySelector('aio-doc-viewer');
const initialDocViewerContent = initialDocViewerElement ? initialDocViewerElement.innerHTML : '';

@Component({
  selector: 'aio-doc-viewer',
  template: ''
  // TODO(robwormald): shadow DOM and emulated don't work here (?!)
  // encapsulation: ViewEncapsulation.ShadowDom
})
export class DocViewerComponent implements OnDestroy {
  // Enable/Disable view transition animations.
  static animationsEnabled = true;

  private hostElement: HTMLElement;

  private void$ = of<void>(undefined);
  private onDestroy$ = new EventEmitter<void>();
  private docContents$ = new EventEmitter<DocumentContents>();

  protected currViewContainer: HTMLElement = document.createElement('div');
  protected nextViewContainer: HTMLElement = document.createElement('div');

  @Input()
  set doc(newDoc: DocumentContents) {
    // Ignore `undefined` values that could happen if the host component
    // does not initially specify a value for the `doc` input.
    if (newDoc) {
      this.docContents$.emit(newDoc);
    }
  }

  // The new document is ready to be inserted into the viewer.
  // (Embedded components have been loaded and instantiated, if necessary.)
  @Output() docReady = new EventEmitter<void>();

  // The previous document has been removed from the viewer.
  // (The leaving animation (if any) has been completed and the node has been removed from the DOM.)
  @Output() docRemoved = new EventEmitter<void>();

  // The new document has been inserted into the viewer.
  // (The node has been inserted into the DOM, but the entering animation may still be in progress.)
  @Output() docInserted = new EventEmitter<void>();

  // The new document has been fully rendered into the viewer.
  // (The entering animation has been completed.)
  @Output() docRendered = new EventEmitter<void>();

  constructor(
    elementRef: ElementRef,
    private logger: Logger,
    private titleService: Title,
    private metaService: Meta,
    private tocService: TocService,
    private elementsLoader: ElementsLoader) {
    this.hostElement = elementRef.nativeElement;
    // Security: the initialDocViewerContent comes from the prerendered DOM and is considered to be secure
    this.hostElement.innerHTML = initialDocViewerContent;

    if (this.hostElement.firstElementChild) {
      this.currViewContainer = this.hostElement.firstElementChild as HTMLElement;
    }

    this.docContents$
        .pipe(
            observeOn(asapScheduler),
            switchMap(newDoc => this.render(newDoc)),
            takeUntil(this.onDestroy$),
        )
        .subscribe();
  }

  ngOnDestroy() {
    this.onDestroy$.emit();
  }

  /**
   * Prepare for setting the window title and ToC.
   * Return a function to actually set them.
   */
  protected prepareTitleAndToc(targetElem: HTMLElement, docId: string): () => void {
    const titleEl = targetElem.querySelector('h1');
    const needsToc = !!titleEl && !/no-?toc/i.test(titleEl.className);
    const embeddedToc = targetElem.querySelector('aio-toc.embedded');

    if (titleEl && needsToc && !embeddedToc) {
      // Add an embedded ToC if it's needed and there isn't one in the content already.
      titleEl.insertAdjacentHTML('afterend', '<aio-toc class="embedded"></aio-toc>');
    } else if (!needsToc && embeddedToc && embeddedToc.parentNode !== null) {
      // Remove the embedded Toc if it's there and not needed.
      // We cannot use ChildNode.remove() because of IE11
      embeddedToc.parentNode.removeChild(embeddedToc);
    }

    return () => {
      this.tocService.reset();
      let title: string|null = '';

      // Only create ToC for docs with an `<h1>` heading.
      // If you don't want a ToC, add "no-toc" class to `<h1>`.
      if (titleEl) {
        title = (typeof titleEl.innerText === 'string') ? titleEl.innerText : titleEl.textContent;

        if (needsToc) {
          this.tocService.genToc(targetElem, docId);
        }
      }

      this.titleService.setTitle(title ? `Angular - ${title}` : 'Angular');
    };
  }

  /**
   * Add doc content to host element and build it out with embedded components.
   */
  protected render(doc: DocumentContents): Observable<void> {
    let addTitleAndToc: () => void;

    this.setNoIndex(doc.id === FILE_NOT_FOUND_ID || doc.id === FETCHING_ERROR_ID);

    return this.void$.pipe(
        // Security: `doc.contents` is always authored by the documentation team
        //           and is considered to be safe.
        tap(() => this.nextViewContainer.innerHTML = doc.contents || ''),
        tap(() => addTitleAndToc = this.prepareTitleAndToc(this.nextViewContainer, doc.id)),
        switchMap(() => this.elementsLoader.loadContainedCustomElements(this.nextViewContainer)),
        tap(() => this.docReady.emit()),
        switchMap(() => this.swapViews(addTitleAndToc)),
        tap(() => this.docRendered.emit()),
        catchError(err => {
          const errorMessage = `${(err instanceof Error) ? err.stack : err}`;
          this.logger.error(new Error(`[DocViewer] Error preparing document '${doc.id}': ${errorMessage}`));
          this.nextViewContainer.innerHTML = '';
          this.setNoIndex(true);

          // TODO(gkalpak): Remove this once gathering debug info is no longer needed.
          if (/loading chunk \S+ failed/i.test(errorMessage)) {
            // Print some info to help with debugging.
            // (There is no reason to wait for this async call to complete before continuing.)
            printSwDebugInfo();
          }

          return this.void$;
        }),
    );
  }

  /**
   * Tell search engine crawlers whether to index this page
   */
  private setNoIndex(val: boolean) {
    if (val) {
      this.metaService.addTag({ name: 'robots', content: 'noindex' });
    } else {
      this.metaService.removeTag('name="robots"');
    }
  }

  /**
   * Swap the views, removing `currViewContainer` and inserting `nextViewContainer`.
   * (At this point all content should be ready, including having loaded and instantiated embedded
   *  components.)
   *
   * Optionally, run a callback as soon as `nextViewContainer` has been inserted, but before the
   * entering animation has been completed. This is useful for work that needs to be done as soon as
   * the element has been attached to the DOM.
   */
  protected swapViews(onInsertedCb = () => {}): Observable<void> {
    const raf$ = new Observable<void>(subscriber => {
      const rafId = requestAnimationFrame(() => {
        subscriber.next();
        subscriber.complete();
      });
      return () => cancelAnimationFrame(rafId);
    });

    // Get the actual transition duration (taking global styles into account).
    // According to the [CSSOM spec](https://drafts.csswg.org/cssom/#serializing-css-values),
    // `time` values should be returned in seconds.
    const getActualDuration = (elem: HTMLElement) => {
      const cssValue = getComputedStyle(elem).transitionDuration || '';
      const seconds = Number(cssValue.replace(/s$/, ''));
      return 1000 * seconds;
    };

    // Some properties are not assignable and thus cannot be animated.
    // Example methods, readonly and CSS properties:
    // "length", "parentRule", "getPropertyPriority", "getPropertyValue", "item", "removeProperty", "setProperty"
    type StringValueCSSStyleDeclaration
      = Exclude<{ [K in keyof CSSStyleDeclaration]: CSSStyleDeclaration[K] extends string ? K : never }[keyof CSSStyleDeclaration], number>;
    const animateProp =
        (elem: HTMLElement, prop: StringValueCSSStyleDeclaration, from: string, to: string, duration = 200) => {
          const animationsDisabled = !DocViewerComponent.animationsEnabled
                                     || this.hostElement.classList.contains(NO_ANIMATIONS);
          elem.style.transition = '';
          return animationsDisabled
              ? this.void$.pipe(tap(() => elem.style[prop] = to))
              : this.void$.pipe(
                    // In order to ensure that the `from` value will be applied immediately (i.e.
                    // without transition) and that the `to` value will be affected by the
                    // `transition` style, we need to ensure an animation frame has passed between
                    // setting each style.
                    switchMap(() => raf$), tap(() => elem.style[prop] = from),
                    switchMap(() => raf$), tap(() => elem.style.transition = `all ${duration}ms ease-in-out`),
                    switchMap(() => raf$), tap(() => elem.style[prop] = to),
                    switchMap(() => timer(getActualDuration(elem))), switchMap(() => this.void$),
                );
        };

    const animateLeave = (elem: HTMLElement) => animateProp(elem, 'opacity', '1', '0.1');
    const animateEnter = (elem: HTMLElement) => animateProp(elem, 'opacity', '0.1', '1');

    let done$ = this.void$;

    if (this.currViewContainer.parentElement) {
      done$ = done$.pipe(
          // Remove the current view from the viewer.
          switchMap(() => animateLeave(this.currViewContainer)),
          tap(() => (this.currViewContainer.parentElement as HTMLElement).removeChild(this.currViewContainer)),
          tap(() => this.docRemoved.emit()),
      );
    }

    return done$.pipe(
        // Insert the next view into the viewer.
        tap(() => this.hostElement.appendChild(this.nextViewContainer)),
        tap(() => onInsertedCb()),
        tap(() => this.docInserted.emit()),
        switchMap(() => animateEnter(this.nextViewContainer)),
        // Update the view references and clean up unused nodes.
        tap(() => {
          const prevViewContainer = this.currViewContainer;
          this.currViewContainer = this.nextViewContainer;
          this.nextViewContainer = prevViewContainer;
          this.nextViewContainer.innerHTML = '';  // Empty to release memory.
        }),
    );
  }
}

// Helpers
/**
 * Print some info regarding the ServiceWorker and the caches contents to help debugging potential
 * issues with failing to find resources in the cache.
 * (See https://github.com/angular/angular/issues/28114.)
 */
async function printSwDebugInfo(): Promise<void> {
  const sep = '\n----------';
  const swState = navigator.serviceWorker?.controller?.state ?? 'N/A';

  console.log(`\nServiceWorker: ${swState}`);

  if (typeof caches === 'undefined') {
    console.log(`${sep}\nCaches: N/A`);
  } else {
    const allCacheNames = await caches.keys();
    const swCacheNames = allCacheNames.filter(name => name.startsWith('ngsw:/:'));

    await findCachesAndPrintEntries(swCacheNames, 'db:control', true, ['manifests']);
    await findCachesAndPrintEntries(swCacheNames, 'assets:app-shell:cache', false);
    await findCachesAndPrintEntries(swCacheNames, 'assets:app-shell:meta', true);
  }

  if (swState === 'activated') {
    console.log(sep);
    await fetchAndPrintSwInternalDebugInfo();
  }

  console.warn(
      `${sep}\nIf you see this error, please report an issue at ` +
      'https://github.com/angular/angular/issues/new?template=3-docs-bug.md including the above logs.');

  // Internal helpers
  async function fetchAndPrintSwInternalDebugInfo() {
    try {
      const res = await fetch('/ngsw/state');
      if (!res.ok) {
        throw new Error(`Response ${res.status} ${res.statusText}`);
      }
      console.log(await res.text());
    } catch (err) {
      console.log(`Failed to retrieve debug info from '/ngsw/state': ${err.message || err}`);
    }
  }

  async function findCachesAndPrintEntries(
      swCacheNames: string[], nameSuffix: string, includeValues: boolean,
      ignoredKeys: string[] = []): Promise<void> {
    const cacheNames = swCacheNames.filter(name => name.endsWith(nameSuffix));

    for (const cacheName of cacheNames) {
      const cacheEntries = await getCacheEntries(cacheName, includeValues, ignoredKeys);
      await printCacheEntries(cacheName, cacheEntries);
    }
  }

  async function getCacheEntries(
      name: string, includeValues: boolean,
      ignoredKeys: string[] = []): Promise<{key: string, value?: unknown}[]> {
    const ignoredUrls = new Set(ignoredKeys.map(key => new Request(key).url));

    const cache = await caches.open(name);
    const keys = (await cache.keys()).map(req => req.url).filter(url => !ignoredUrls.has(url));
    const entries = await Promise.all(keys.map(async key => ({
      key,
      value: !includeValues ? undefined : await (await cache.match(key))?.json(),
    })));

    return entries;
  }

  function printCacheEntries(name: string, entries: {key: string, value?: unknown}[]): void {
    const entriesStr = entries
        .map(({key, value}) => `  - ${key}${!value ? '' : `: ${JSON.stringify(value)}`}`)
        .join('\n');

    console.log(`\nCache: ${name} (${entries.length} entries)\n${entriesStr}`);
  }
}
