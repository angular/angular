import {Component, ElementRef, EventEmitter, Input, OnDestroy, Output} from '@angular/core';
import {Meta, Title} from '@angular/platform-browser';
import {ElementsLoader} from 'app/custom-elements/elements-loader';
import {DocumentContents, FETCHING_ERROR_ID, FILE_NOT_FOUND_ID} from 'app/documents/document.service';
import {Logger} from 'app/shared/logger.service';
import {fromInnerHTML} from 'app/shared/security';
import {TocService} from 'app/shared/toc.service';
import {asapScheduler, Observable, of, timer} from 'rxjs';
import {catchError, observeOn, switchMap, takeUntil, tap} from 'rxjs/operators';
import {EMPTY_HTML, unwrapHtml} from 'safevalues';


// Constants
export const NO_ANIMATIONS = 'no-animations';

// Initialization prevents flicker once pre-rendering is on
const initialDocViewerElement = document.querySelector('aio-doc-viewer');
const initialDocViewerContent =
    initialDocViewerElement ? fromInnerHTML(initialDocViewerElement) : EMPTY_HTML;

@Component({
  selector: 'aio-doc-viewer',
  template: ''
  // TODO(robwormald): shadow DOM and emulated don't work here (?!)
  // encapsulation: ViewEncapsulation.ShadowDom
})
export class DocViewerComponent implements OnDestroy {
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
      elementRef: ElementRef, private logger: Logger, private titleService: Title,
      private metaService: Meta, private tocService: TocService,
      private elementsLoader: ElementsLoader) {
    this.hostElement = elementRef.nativeElement;

    // Security: the initialDocViewerContent comes from the prerendered DOM and is
    // considered to be secure
    this.hostElement.innerHTML = unwrapHtml(initialDocViewerContent) as string;

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
    const needsTitle = !!titleEl && !/no-?title/i.test(titleEl.className);
    const needsToc = !!titleEl && !/no-?toc/i.test(titleEl.className);
    const embeddedToc = targetElem.querySelector('aio-toc.embedded');

    if (titleEl && titleEl.parentNode && needsToc && !embeddedToc) {
      // Add an embedded ToC if it's needed and there isn't one in the content already.
      const toc = document.createElement('aio-toc');
      toc.className = 'embedded';
      titleEl.parentNode.insertBefore(toc, titleEl.nextSibling);
    } else if (!needsToc && embeddedToc) {
      // Remove the embedded Toc if it's there and not needed.
      embeddedToc.remove();
    }

    return () => {
      this.tocService.reset();
      let title: string|null = '';

      // Only create ToC for docs with an `<h1>` heading.
      // If you don't want a ToC, add "no-toc" class to `<h1>`.
      if (titleEl) {
        if (needsTitle) {
          title = (typeof titleEl.innerText === 'string') ? titleEl.innerText : titleEl.textContent;
        }

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
        tap(() => {
          if (doc.contents === null) {
            this.nextViewContainer.textContent = '';
          } else {
            // Security: `doc.contents` is always authored by the documentation team
            //           and is considered to be safe.
            this.nextViewContainer.innerHTML = unwrapHtml(doc.contents) as string;
          }
        }),
        tap(() => addTitleAndToc = this.prepareTitleAndToc(this.nextViewContainer, doc.id)),
        switchMap(() => this.elementsLoader.loadContainedCustomElements(this.nextViewContainer)),
        tap(() => this.docReady.emit()),
        switchMap(() => this.swapViews(addTitleAndToc)),
        tap(() => this.docRendered.emit()),
        catchError(err => {
          const errorMessage = `${(err instanceof Error) ? err.stack : err}`;
          this.logger.error(
              new Error(`[DocViewer] Error preparing document '${doc.id}': ${errorMessage}`));
          this.nextViewContainer.textContent = '';
          this.setNoIndex(true);

          return this.void$;
        }),
    );
  }

  /**
   * Tell search engine crawlers whether to index this page
   */
  private setNoIndex(val: boolean) {
    if (val) {
      this.metaService.addTag({name: 'robots', content: 'noindex'});
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
    // "length", "parentRule", "getPropertyPriority", "getPropertyValue", "item", "removeProperty",
    // "setProperty"
    type StringValueCSSStyleDeclaration = Exclude<
        {[K in keyof CSSStyleDeclaration]:
             CSSStyleDeclaration[K] extends string ? K : never;}[keyof CSSStyleDeclaration],
        number>;
    const animateProp =
        (elem: HTMLElement, prop: StringValueCSSStyleDeclaration, from: string, to: string,
         duration = 200) => {
          const animationsDisabled = this.hostElement.classList.contains(NO_ANIMATIONS);
          elem.style.transition = '';
          return animationsDisabled ?
              this.void$.pipe(tap(() => elem.style[prop] = to)) :
              this.void$.pipe(
                  // In order to ensure that the `from` value will be applied immediately (i.e.
                  // without transition) and that the `to` value will be affected by the
                  // `transition` style, we need to ensure an animation frame has passed between
                  // setting each style.
                  switchMap(() => raf$),
                  tap(() => elem.style[prop] = from),
                  switchMap(() => raf$),
                  tap(() => elem.style.transition = `all ${duration}ms ease-in-out`),
                  switchMap(() => raf$),
                  tap(() => elem.style[prop] = to),
                  switchMap(() => timer(getActualDuration(elem))),
                  switchMap(() => this.void$),
              );
        };

    const animateLeave = (elem: HTMLElement) => animateProp(elem, 'opacity', '1', '0.1');
    const animateEnter = (elem: HTMLElement) => animateProp(elem, 'opacity', '0.1', '1');

    let done$ = this.void$;

    if (this.currViewContainer.parentElement) {
      done$ = done$.pipe(
          // Remove the current view from the viewer.
          switchMap(() => animateLeave(this.currViewContainer)),
          tap(() => (this.currViewContainer.parentElement as HTMLElement)
                        .removeChild(this.currViewContainer)),
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
          this.nextViewContainer.textContent = '';  // Empty to release memory.
        }),
    );
  }
}
