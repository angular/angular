/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {DOCUMENT, isPlatformBrowser, Location} from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  createComponent,
  DestroyRef,
  ElementRef,
  EnvironmentInjector,
  inject,
  Injector,
  PLATFORM_ID,
  ViewContainerRef,
  ViewEncapsulation,
  PendingTasks,
  output,
  input,
  effect,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {TOC_SKIP_CONTENT_MARKER, NavigationState} from '../../../services';
import {TableOfContents} from '../../table-of-contents/table-of-contents.component';
import {IconComponent} from '../../icon/icon.component';
import {handleHrefClickEventWithRouter} from '../../../utils';
import {Router} from '@angular/router';
import {fromEvent} from 'rxjs';
import {Breadcrumb} from '../../breadcrumb/breadcrumb.component';
import {CopySourceCodeButton} from '../../copy-source-code-button/copy-source-code-button.component';
import {ExampleViewer} from '../example-viewer/example-viewer.component';
import {DomSanitizer} from '@angular/platform-browser';
const TOC_HOST_ELEMENT_NAME = 'docs-table-of-contents';
export const ASSETS_EXAMPLES_PATH = 'assets/content/examples';
export const DOCS_VIEWER_SELECTOR = 'docs-viewer, main[docsViewer]';
export const DOCS_CODE_SELECTOR = '.docs-code';
export const DOCS_CODE_MUTLIFILE_SELECTOR = '.docs-code-multifile';
// TODO: Update the branch/sha
export const GITHUB_CONTENT_URL = 'https://github.com/angular/angular/blob/main/';
let DocViewer = (() => {
  let _classDecorators = [
    Component({
      selector: DOCS_VIEWER_SELECTOR,
      template: '',
      styleUrls: ['docs-viewer.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      host: {
        '[class.docs-animate-content]': 'animateContent',
        '[class.docs-with-TOC]': 'hasToc()',
      },
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var DocViewer = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      DocViewer = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    docContent = input();
    hasToc = input(false);
    contentLoaded = output();
    destroyRef = inject(DestroyRef);
    document = inject(DOCUMENT);
    elementRef = inject(ElementRef);
    location = inject(Location);
    navigationState = inject(NavigationState);
    router = inject(Router);
    viewContainer = inject(ViewContainerRef);
    environmentInjector = inject(EnvironmentInjector);
    injector = inject(Injector);
    appRef = inject(ApplicationRef);
    sanitizer = inject(DomSanitizer);
    animateContent = false;
    pendingTasks = inject(PendingTasks);
    isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    countOfExamples = 0;
    constructor() {
      effect(async () => {
        const removeTask = this.pendingTasks.add();
        await this.renderContentsAndRunClientSetup(this.docContent());
        removeTask();
      });
    }
    async renderContentsAndRunClientSetup(content) {
      const contentContainer = this.elementRef.nativeElement;
      if (content) {
        if (this.isBrowser && !this.document.startViewTransition) {
          // Apply a special class to the host node to trigger animation.
          // Note: when a page is hydrated, the `content` would be empty,
          // so we don't trigger an animation to avoid a content flickering
          // visual effect. In addition, if the browser supports view transitions (startViewTransition is present), the animation is handled by the native View Transition API so it does not need to be done here.
          this.animateContent = true;
        }
        contentContainer.innerHTML = content;
      }
      if (this.isBrowser) {
        // First we setup event listeners on the HTML we just loaded.
        // We want to do this before things like the example viewers are loaded.
        this.setupAnchorListeners(contentContainer);
        // Rewrite relative anchors (hrefs starting with `#`) because relative hrefs are relative to the base URL, which is '/'
        this.rewriteRelativeAnchors(contentContainer);
        // In case when content contains placeholders for executable examples, create ExampleViewer components.
        await this.loadExamples();
        // In case when content contains static code snippets, then create buttons
        // responsible for copy source code.
        this.loadCopySourceCodeButtons();
      }
      // Display Breadcrumb component if the `<docs-breadcrumb>` element exists
      this.loadBreadcrumb(contentContainer);
      // Display Icon component if the `<docs-icon>` element exists
      this.loadIcons(contentContainer);
      // Render ToC
      this.renderTableOfContents(contentContainer);
      this.contentLoaded.emit();
    }
    /**
     * Load ExampleViewer component when:
     * - exists docs-code-multifile element with multiple files OR
     * - exists docs-code element with single file AND
     *   - 'preview' attribute was provided OR
     *   - 'visibleLines' attribute was provided
     */
    async loadExamples() {
      const multifileCodeExamples = Array.from(
        this.elementRef.nativeElement.querySelectorAll(DOCS_CODE_MUTLIFILE_SELECTOR),
      );
      for (let placeholder of multifileCodeExamples) {
        const path = placeholder.getAttribute('path');
        const snippets = this.getCodeSnippetsFromMultifileWrapper(placeholder);
        await this.renderExampleViewerComponents(placeholder, snippets, path);
      }
      const docsCodeElements = this.elementRef.nativeElement.querySelectorAll(DOCS_CODE_SELECTOR);
      for (const placeholder of docsCodeElements) {
        const snippet = this.getStandaloneCodeSnippet(placeholder);
        if (snippet) {
          await this.renderExampleViewerComponents(placeholder, [snippet], snippet.name);
        }
      }
    }
    renderTableOfContents(element) {
      if (!this.hasToc()) {
        return;
      }
      const firstHeading = element.querySelector('h2,h3[id]');
      if (!firstHeading) {
        return;
      }
      // Since the content of the main area is dynamically created and there is
      // no host element for a ToC component, we create it manually.
      let tocHostElement = element.querySelector(TOC_HOST_ELEMENT_NAME);
      if (!tocHostElement) {
        tocHostElement = this.document.createElement(TOC_HOST_ELEMENT_NAME);
        tocHostElement.setAttribute(TOC_SKIP_CONTENT_MARKER, 'true');
        firstHeading?.parentNode?.insertBefore(tocHostElement, firstHeading);
      }
      this.renderComponent(TableOfContents, tocHostElement, {contentSourceElement: element});
    }
    async renderExampleViewerComponents(placeholder, snippets, path) {
      const preview = Boolean(placeholder.getAttribute('preview'));
      const hideCode = Boolean(placeholder.getAttribute('hideCode'));
      const title = placeholder.getAttribute('header') ?? undefined;
      const firstCodeSnippetTitle =
        snippets.length > 0 ? (snippets[0].title ?? snippets[0].name) : undefined;
      const exampleRef = this.viewContainer.createComponent(ExampleViewer);
      this.countOfExamples++;
      exampleRef.setInput('metadata', {
        title: title ?? firstCodeSnippetTitle,
        path,
        files: snippets,
        preview,
        hideCode,
        id: this.countOfExamples,
      });
      exampleRef.setInput('githubUrl', `${GITHUB_CONTENT_URL}/${snippets[0].name}`);
      // TODO: Re-add support for opening examples on StackBlitz
      exampleRef.setInput('stackblitzUrl', null); // `${ASSETS_EXAMPLES_PATH}/${snippets[0].name}.html`;
      placeholder.parentElement.replaceChild(exampleRef.location.nativeElement, placeholder);
      await exampleRef.instance.renderExample();
    }
    getCodeSnippetsFromMultifileWrapper(element) {
      const tabs = Array.from(element.querySelectorAll(DOCS_CODE_SELECTOR));
      return tabs.map((tab) => ({
        name: tab.getAttribute('path') ?? tab.getAttribute('header') ?? '',
        sanitizedContent: this.sanitizer.bypassSecurityTrustHtml(tab.innerHTML),
        visibleLinesRange: tab.getAttribute('visibleLines') ?? undefined,
      }));
    }
    getStandaloneCodeSnippet(element) {
      const visibleLines = element.getAttribute('visibleLines') ?? undefined;
      const preview = element.getAttribute('preview');
      if (!visibleLines && !preview) {
        return null;
      }
      const content = element.querySelector('pre');
      const path = element.getAttribute('path');
      const title = element.getAttribute('header') ?? undefined;
      return {
        title,
        name: path,
        sanitizedContent: content?.outerHTML
          ? this.sanitizer.bypassSecurityTrustHtml(content.outerHTML)
          : '',
        visibleLinesRange: visibleLines,
      };
    }
    // If the content contains static code snippets, we should add buttons to copy
    // the code
    loadCopySourceCodeButtons() {
      const staticCodeSnippets = Array.from(
        this.elementRef.nativeElement.querySelectorAll('.docs-code:not([mermaid])'),
      );
      for (let codeSnippet of staticCodeSnippets) {
        const copySourceCodeButton = this.viewContainer.createComponent(CopySourceCodeButton);
        codeSnippet.appendChild(copySourceCodeButton.location.nativeElement);
      }
    }
    loadBreadcrumb(element) {
      const breadcrumbPlaceholder = element.querySelector('docs-breadcrumb');
      const activeNavigationItem = this.navigationState.activeNavigationItem();
      if (breadcrumbPlaceholder && !!activeNavigationItem?.parent) {
        this.renderComponent(Breadcrumb, breadcrumbPlaceholder);
      }
    }
    loadIcons(element) {
      // We need to make sure that we don't reload the icons in loadCopySourceCodeButtons
      element
        .querySelectorAll('docs-icon:not([docs-copy-source-code] docs-icon)')
        .forEach((iconsPlaceholder) => {
          this.renderComponent(IconComponent, iconsPlaceholder);
        });
    }
    /**
     * Helper method to render a component dynamically in a context of this class.
     */
    renderComponent(type, hostElement, inputs) {
      const componentRef = createComponent(type, {
        hostElement,
        elementInjector: this.injector,
        environmentInjector: this.environmentInjector,
      });
      if (inputs) {
        for (const [name, value] of Object.entries(inputs)) {
          componentRef.setInput(name, value);
        }
      }
      // Attach a view to the ApplicationRef for change detection
      // purposes and for hydration serialization to pick it up
      // during SSG.
      this.appRef.attachView(componentRef.hostView);
      // This is wrapped with `isBrowser` in for hydration purposes.
      if (this.isBrowser) {
        // The `docs-viewer` may be rendered multiple times when navigating
        // between pages, which will create new components that need to be
        // destroyed for gradual cleanup.
        this.destroyRef.onDestroy(() => componentRef.destroy());
      }
      return componentRef;
    }
    setupAnchorListeners(element) {
      element.querySelectorAll(`a[href]`).forEach((anchor) => {
        // Get the target element's ID from the href attribute
        const url = new URL(anchor.href);
        const isExternalLink = url.origin !== this.document.location.origin;
        if (isExternalLink) {
          return;
        }
        fromEvent(anchor, 'click')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((e) => {
            const closestAnchor = e.target.closest('a');
            if (closestAnchor?.target && closestAnchor.target !== 'self') {
              return;
            }
            const hrefAttr = closestAnchor?.getAttribute?.('href');
            if (!hrefAttr) {
              return;
            }
            let relativeUrl;
            if (hrefAttr.startsWith('http')) {
              // Url is absolute but we're targeting the same domain
              const url = new URL(hrefAttr);
              relativeUrl = `${url.pathname}${url.hash}${url.search}`;
            } else {
              relativeUrl = hrefAttr;
            }
            // Unless this is a link to an element within the same page, use the Angular router.
            // https://github.com/angular/angular/issues/30139
            const scrollToElementExists = relativeUrl.startsWith(this.location.path() + '#');
            if (!scrollToElementExists) {
              handleHrefClickEventWithRouter(e, this.router, relativeUrl);
            }
          });
      });
    }
    rewriteRelativeAnchors(element) {
      for (const anchor of Array.from(element.querySelectorAll(`a[href^="#"]:not(a[download])`))) {
        const url = new URL(anchor.href);
        anchor.href = this.location.path() + url.hash;
      }
    }
  };
  return (DocViewer = _classThis);
})();
export {DocViewer};
//# sourceMappingURL=docs-viewer.component.js.map
