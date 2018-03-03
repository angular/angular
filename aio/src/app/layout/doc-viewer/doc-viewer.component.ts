import { Component, ComponentRef, DoCheck, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { timer } from 'rxjs/observable/timer';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeUntil';

import { DocumentContents, FILE_NOT_FOUND_ID, FETCHING_ERROR_ID } from 'app/documents/document.service';
import { EmbedComponentsService } from 'app/embed-components/embed-components.service';
import { Logger } from 'app/shared/logger.service';
import { TocService } from 'app/shared/toc.service';


// Constants
export const NO_ANIMATIONS = 'no-animations';

// Initialization prevents flicker once pre-rendering is on
const initialDocViewerElement = document.querySelector('aio-doc-viewer');
const initialDocViewerContent = initialDocViewerElement ? initialDocViewerElement.innerHTML : '';

@Component({
  selector: 'aio-doc-viewer',
  template: ''
  // TODO(robwormald): shadow DOM and emulated don't work here (?!)
  // encapsulation: ViewEncapsulation.Native
})
export class DocViewerComponent implements DoCheck, OnDestroy {
  // Enable/Disable view transition animations.
  static animationsEnabled = true;

  private hostElement: HTMLElement;

  private void$ = of<void>(undefined);
  private onDestroy$ = new EventEmitter<void>();
  private docContents$ = new EventEmitter<DocumentContents>();

  protected embeddedComponentRefs: ComponentRef<any>[] = [];
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
    private embedComponentsService: EmbedComponentsService,
    private logger: Logger,
    private titleService: Title,
    private metaService: Meta,
    private tocService: TocService
    ) {
    this.hostElement = elementRef.nativeElement;
    // Security: the initialDocViewerContent comes from the prerendered DOM and is considered to be secure
    this.hostElement.innerHTML = initialDocViewerContent;

    if (this.hostElement.firstElementChild) {
      this.currViewContainer = this.hostElement.firstElementChild as HTMLElement;
    }

    this.onDestroy$.subscribe(() => this.destroyEmbeddedComponents());
    this.docContents$
        .switchMap(newDoc => this.render(newDoc))
        .takeUntil(this.onDestroy$)
        .subscribe();
  }

  ngDoCheck() {
    this.embeddedComponentRefs.forEach(comp => comp.changeDetectorRef.detectChanges());
  }

  ngOnDestroy() {
    this.onDestroy$.emit();
  }

  /**
   * Destroy the embedded components to avoid memory leaks.
   */
  protected destroyEmbeddedComponents(): void {
    this.embeddedComponentRefs.forEach(comp => comp.destroy());
    this.embeddedComponentRefs = [];
  }

  /**
   * Prepare for setting the window title and ToC.
   * Return a function to actually set them.
   */
  protected prepareTitleAndToc(targetElem: HTMLElement, docId: string): () => void {
    const titleEl = targetElem.querySelector('h1');
    const needsToc = !!titleEl && !/no-?toc/i.test(titleEl.className);
    const embeddedToc = targetElem.querySelector('aio-toc.embedded');

    if (needsToc && !embeddedToc) {
      // Add an embedded ToC if it's needed and there isn't one in the content already.
      titleEl!.insertAdjacentHTML('afterend', '<aio-toc class="embedded"></aio-toc>');
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

    return this.void$
        // Security: `doc.contents` is always authored by the documentation team
        //           and is considered to be safe.
        .do(() => this.nextViewContainer.innerHTML = doc.contents || '')
        .do(() => addTitleAndToc = this.prepareTitleAndToc(this.nextViewContainer, doc.id))
        .switchMap(() => this.embedComponentsService.embedInto(this.nextViewContainer))
        .do(() => this.docReady.emit())
        .do(() => this.destroyEmbeddedComponents())
        .do(componentRefs => this.embeddedComponentRefs = componentRefs)
        .switchMap(() => this.swapViews(addTitleAndToc))
        .do(() => this.docRendered.emit())
        .catch(err => {
          const errorMessage = (err instanceof Error) ? err.stack : err;
          this.logger.error(`[DocViewer] Error preparing document '${doc.id}': ${errorMessage}`);
          this.nextViewContainer.innerHTML = '';
          this.setNoIndex(true);
          return this.void$;
        });
  }

  /**
   * Tell search engine crawlers whether to index this page
   */
  private setNoIndex(val: boolean) {
    if (val) {
      this.metaService.addTag({ name: 'googlebot', content: 'noindex' });
      this.metaService.addTag({ name: 'robots', content: 'noindex' });
    } else {
      this.metaService.removeTag('name="googlebot"');
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
    const animateProp =
        (elem: HTMLElement, prop: keyof CSSStyleDeclaration, from: string, to: string, duration = 200) => {
          const animationsDisabled = !DocViewerComponent.animationsEnabled
                                     || this.hostElement.classList.contains(NO_ANIMATIONS);
          if (prop === 'length' || prop === 'parentRule') {
            // We cannot animate length or parentRule properties because they are readonly
            return this.void$;
          }
          elem.style.transition = '';
          return animationsDisabled
              ? this.void$.do(() => elem.style[prop] = to)
              : this.void$
                    // In order to ensure that the `from` value will be applied immediately (i.e.
                    // without transition) and that the `to` value will be affected by the
                    // `transition` style, we need to ensure an animation frame has passed between
                    // setting each style.
                    .switchMap(() => raf$).do(() => elem.style[prop] = from)
                    .switchMap(() => raf$).do(() => elem.style.transition = `all ${duration}ms ease-in-out`)
                    .switchMap(() => raf$).do(() => (elem.style as any)[prop] = to)
                    .switchMap(() => timer(getActualDuration(elem))).switchMap(() => this.void$);
        };

    const animateLeave = (elem: HTMLElement) => animateProp(elem, 'opacity', '1', '0.1');
    const animateEnter = (elem: HTMLElement) => animateProp(elem, 'opacity', '0.1', '1');

    let done$ = this.void$;

    if (this.currViewContainer.parentElement) {
      done$ = done$
          // Remove the current view from the viewer.
          .switchMap(() => animateLeave(this.currViewContainer))
          .do(() => this.currViewContainer.parentElement!.removeChild(this.currViewContainer))
          .do(() => this.docRemoved.emit());
    }

    return done$
        // Insert the next view into the viewer.
        .do(() => this.hostElement.appendChild(this.nextViewContainer))
        .do(() => onInsertedCb())
        .do(() => this.docInserted.emit())
        .switchMap(() => animateEnter(this.nextViewContainer))
        // Update the view references and clean up unused nodes.
        .do(() => {
          const prevViewContainer = this.currViewContainer;
          this.currViewContainer = this.nextViewContainer;
          this.nextViewContainer = prevViewContainer;
          this.nextViewContainer.innerHTML = '';  // Empty to release memory.
        });
  }
}
