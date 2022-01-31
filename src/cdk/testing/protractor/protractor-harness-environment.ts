/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessEnvironment, HarnessLoader, TestElement} from '@angular/cdk/testing';
import {by, element as protractorElement, ElementArrayFinder, ElementFinder} from 'protractor';
import {ProtractorElement} from './protractor-element';

/**
 * Options to configure the environment.
 * @deprecated
 * @breaking-change 13.0.0
 */
export interface ProtractorHarnessEnvironmentOptions {
  /** The query function used to find DOM elements. */
  queryFn: (selector: string, root: ElementFinder) => ElementArrayFinder;
}

/** The default environment options. */
const defaultEnvironmentOptions: ProtractorHarnessEnvironmentOptions = {
  queryFn: (selector: string, root: ElementFinder) => root.all(by.css(selector)),
};

/**
 * A `HarnessEnvironment` implementation for Protractor.
 * @deprecated As of v13.0.0, this environment no longer works, as it is not
 * compatible with the new [Angular Package Format](https://angular.io/guide/angular-package-format).
 * @breaking-change 13.0.0
 */
export class ProtractorHarnessEnvironment extends HarnessEnvironment<ElementFinder> {
  /** The options for this environment. */
  private _options: ProtractorHarnessEnvironmentOptions;

  protected constructor(
    rawRootElement: ElementFinder,
    options?: ProtractorHarnessEnvironmentOptions,
  ) {
    super(rawRootElement);
    this._options = {...defaultEnvironmentOptions, ...options};
  }

  /** Creates a `HarnessLoader` rooted at the document root. */
  static loader(options?: ProtractorHarnessEnvironmentOptions): HarnessLoader {
    return new ProtractorHarnessEnvironment(protractorElement(by.css('body')), options);
  }

  /** Gets the ElementFinder corresponding to the given TestElement. */
  static getNativeElement(el: TestElement): ElementFinder {
    if (el instanceof ProtractorElement) {
      return el.element;
    }
    throw Error('This TestElement was not created by the ProtractorHarnessEnvironment');
  }

  /**
   * Flushes change detection and async tasks captured in the Angular zone.
   * In most cases it should not be necessary to call this manually. However, there may be some edge
   * cases where it is needed to fully flush animation events.
   */
  async forceStabilize(): Promise<void> {}

  /** @docs-private */
  async waitForTasksOutsideAngular(): Promise<void> {
    // TODO: figure out how we can do this for the protractor environment.
    // https://github.com/angular/components/issues/17412
  }

  /** Gets the root element for the document. */
  protected getDocumentRoot(): ElementFinder {
    return protractorElement(by.css('body'));
  }

  /** Creates a `TestElement` from a raw element. */
  protected createTestElement(element: ElementFinder): TestElement {
    return new ProtractorElement(element);
  }

  /** Creates a `HarnessLoader` rooted at the given raw element. */
  protected createEnvironment(element: ElementFinder): HarnessEnvironment<ElementFinder> {
    return new ProtractorHarnessEnvironment(element, this._options);
  }

  /**
   * Gets a list of all elements matching the given selector under this environment's root element.
   */
  protected async getAllRawElements(selector: string): Promise<ElementFinder[]> {
    const elementArrayFinder = this._options.queryFn(selector, this.rawRootElement);
    const length = await elementArrayFinder.count();
    const elements: ElementFinder[] = [];
    for (let i = 0; i < length; i++) {
      elements.push(elementArrayFinder.get(i));
    }
    return elements;
  }
}
