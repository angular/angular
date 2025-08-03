/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {DOCUMENT, isPlatformBrowser, Location} from '@angular/common';
import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  createComponent,
  DestroyRef,
  ElementRef,
  EnvironmentInjector,
  inject,
  Injector,
  PLATFORM_ID,
  Type,
  ViewContainerRef,
  ViewEncapsulation,
  PendingTasks,
  output,
  input,
  effect,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {TOC_SKIP_CONTENT_MARKER, NavigationState} from '../../../services/index';
import {TableOfContents} from '../../table-of-contents/table-of-contents.component';
import {IconComponent} from '../../icon/icon.component';
import {handleHrefClickEventWithRouter} from '../../../utils/index';
import {Snippet} from '../../../interfaces/index';
import {Router} from '@angular/router';
import {fromEvent} from 'rxjs';

import {Breadcrumb} from '../../breadcrumb/breadcrumb.component';
import {CopySourceCodeButton} from '../../copy-source-code-button/copy-source-code-button.component';
import {ExampleViewer} from '../example-viewer/example-viewer.component';

const TOC_HOST_ELEMENT_NAME = 'docs-table-of-contents';
export const ASSETS_EXAMPLES_PATH = 'assets/content/examples';
export const DOCS_VIEWER_SELECTOR = 'docs-viewer';
export const DOCS_CODE_SELECTOR = '.docs-code';
export const DOCS_CODE_MUTLIFILE_SELECTOR = '.docs-code-multifile';
// TODO: Update the branch/sha
export const GITHUB_CONTENT_URL = 'https://github.com/angular/angular/blob/main/';

@Component({
  selector: DOCS_VIEWER_SELECTOR,
  template: '',
  styleUrls: ['docs-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.docs-animate-content]': 'animateContent',
    '[class.docs-with-TOC]': 'hasToc()',
  },
})
export class DocViewer {
  docContent = input<string | undefined>();
  hasToc = input(false);
  readonly contentLoaded = output<void>();

  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly elementRef = inject(ElementRef);
  private readonly location = inject(Location);
  private readonly navigationState = inject(NavigationState);
  private readonly router = inject(Router);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly injector = inject(Injector);
  private readonly appRef = inject(ApplicationRef);

  protected animateContent = false;
  private readonly pendingTasks = inject(PendingTasks);

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private countOfExamples = 0;

  constructor() {
    effect(async () => {
      const removeTask = this.pendingTasks.add();
      await this.renderContentsAndRunClientSetup(this.docContent());
      removeTask();
    });
  }

  async renderContentsAndRunClientSetup(content?: string): Promise<void> {
    const contentContainer = this.elementRef.nativeElement;

    if (content) {
      if (this.isBrowser && !(this.document as any).startViewTransition) {
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
  private async loadExamples(): Promise<void> {
    const multifileCodeExamples = <HTMLElement[]>(
      Array.from(this.elementRef.nativeElement.querySelectorAll(DOCS_CODE_MUTLIFILE_SELECTOR))
    );

    for (let placeholder of multifileCodeExamples) {
      const path = placeholder.getAttribute('path')!;
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

  private renderTableOfContents(element: HTMLElement): void {
    if (!this.hasToc()) {
      return;
    }

    const firstHeading = element.querySelector<HTMLHeadingElement>('h2,h3[id]');
    if (!firstHeading) {
      return;
    }

    // Since the content of the main area is dynamically created and there is
    // no host element for a ToC component, we create it manually.
    let tocHostElement: HTMLElement | null = element.querySelector(TOC_HOST_ELEMENT_NAME);
    if (!tocHostElement) {
      tocHostElement = this.document.createElement(TOC_HOST_ELEMENT_NAME);
      tocHostElement.setAttribute(TOC_SKIP_CONTENT_MARKER, 'true');
      firstHeading?.parentNode?.insertBefore(tocHostElement, firstHeading);
    }

    this.renderComponent(TableOfContents, tocHostElement, {contentSourceElement: element});
  }

  private async renderExampleViewerComponents(
    placeholder: HTMLElement,
    snippets: Snippet[],
    path: string,
  ): Promise<void> {
    const preview = Boolean(placeholder.getAttribute('preview'));
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
      id: this.countOfExamples,
    });

    exampleRef.instance.githubUrl = `${GITHUB_CONTENT_URL}/${snippets[0].name}`;

    // TODO: Re-add support for opening examples on StackBlitz
    exampleRef.instance.stackblitzUrl = null; // `${ASSETS_EXAMPLES_PATH}/${snippets[0].name}.html`;

    placeholder.parentElement!.replaceChild(exampleRef.location.nativeElement, placeholder);

    await exampleRef.instance.renderExample();
  }

  private getCodeSnippetsFromMultifileWrapper(element: HTMLElement): Snippet[] {
    const tabs = <Element[]>Array.from(element.querySelectorAll(DOCS_CODE_SELECTOR));

    return tabs.map((tab) => ({
      name: tab.getAttribute('path') ?? tab.getAttribute('header') ?? '',
      content: tab.innerHTML,
      visibleLinesRange: tab.getAttribute('visibleLines') ?? undefined,
    }));
  }

  private getStandaloneCodeSnippet(element: HTMLElement): Snippet | null {
    const visibleLines = element.getAttribute('visibleLines') ?? undefined;
    const preview = element.getAttribute('preview');

    if (!visibleLines && !preview) {
      return null;
    }

    const content = element.querySelector('pre')!;
    const path = element.getAttribute('path')!;
    const title = element.getAttribute('header') ?? undefined;

    return {
      title,
      name: path,
      content: content?.outerHTML,
      visibleLinesRange: visibleLines,
    };
  }

  // If the content contains static code snippets, we should add buttons to copy
  // the code
  private loadCopySourceCodeButtons(): void {
    const staticCodeSnippets = <Element[]>(
      Array.from(this.elementRef.nativeElement.querySelectorAll('.docs-code:not([mermaid])'))
    );

    for (let codeSnippet of staticCodeSnippets) {
      const copySourceCodeButton = this.viewContainer.createComponent(CopySourceCodeButton);
      codeSnippet.appendChild(copySourceCodeButton.location.nativeElement);
    }
  }

  private loadBreadcrumb(element: HTMLElement): void {
    const breadcrumbPlaceholder = element.querySelector('docs-breadcrumb') as HTMLElement;
    const activeNavigationItem = this.navigationState.activeNavigationItem();

    if (breadcrumbPlaceholder && !!activeNavigationItem?.parent) {
      this.renderComponent(Breadcrumb, breadcrumbPlaceholder);
    }
  }

  private loadIcons(element: HTMLElement): void {
    // We need to make sure that we don't reload the icons in loadCopySourceCodeButtons
    element
      .querySelectorAll('docs-icon:not([docs-copy-source-code] docs-icon)')
      .forEach((iconsPlaceholder) => {
        this.renderComponent(IconComponent, iconsPlaceholder as HTMLElement);
      });
  }

  /**
   * Helper method to render a component dynamically in a context of this class.
   */
  private renderComponent<T>(
    type: Type<T>,
    hostElement: HTMLElement,
    inputs?: {[key: string]: unknown},
  ): ComponentRef<T> {
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

  private setupAnchorListeners(element: HTMLElement): void {
    element.querySelectorAll(`a[href]`).forEach((anchor) => {
      // Get the target element's ID from the href attribute
      const url = new URL((anchor as HTMLAnchorElement).href);
      const isExternalLink = url.origin !== this.document.location.origin;
      if (isExternalLink) {
        return;
      }

      fromEvent(anchor, 'click')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((e) => {
          const closestAnchor = (e.target as Element).closest('a');
          if (closestAnchor?.target && closestAnchor.target !== 'self') {
            return;
          }

          const hrefAttr = closestAnchor?.getAttribute?.('href');
          if (!hrefAttr) {
            return;
          }

          let relativeUrl: string;
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

  private rewriteRelativeAnchors(element: HTMLElement) {
    for (const anchor of Array.from(element.querySelectorAll(`a[href^="#"]:not(a[download])`))) {
      const url = new URL((anchor as HTMLAnchorElement).href);
      (anchor as HTMLAnchorElement).href = this.location.path() + url.hash;
    }
  }
}
