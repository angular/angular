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

/** Options to configure the environment. */
export interface ProtractorHarnessEnvironmentOptions {
  /** The query function used to find DOM elements. */
  queryFn: (selector: string, root: ElementFinder) => ElementArrayFinder;
}

/** The default environment options. */
const defaultEnvironmentOptions: ProtractorHarnessEnvironmentOptions = {
  queryFn: (selector: string, root: ElementFinder) => root.all(by.css(selector))
};

/** A `HarnessEnvironment` implementation for Protractor. */
export class ProtractorHarnessEnvironment extends HarnessEnvironment<ElementFinder> {
  /** The options for this environment. */
  private _options: ProtractorHarnessEnvironmentOptions;

  protected constructor(
      rawRootElement: ElementFinder, options?: ProtractorHarnessEnvironmentOptions) {
    super(rawRootElement);
    this._options = {...defaultEnvironmentOptions, ...options};
  }

  /** Creates a `HarnessLoader` rooted at the document root. */
  static loader(options?: ProtractorHarnessEnvironmentOptions): HarnessLoader {
    return new ProtractorHarnessEnvironment(protractorElement(by.css('body')), options);
  }

  async forceStabilize(): Promise<void> {}

  async waitForTasksOutsideAngular(): Promise<void> {
    // TODO: figure out how we can do this for the protractor environment.
    // https://github.com/angular/components/issues/17412
  }

  protected getDocumentRoot(): ElementFinder {
    return protractorElement(by.css('body'));
  }

  protected createTestElement(element: ElementFinder): TestElement {
    return new ProtractorElement(element);
  }

  protected createEnvironment(element: ElementFinder): HarnessEnvironment<ElementFinder> {
    return new ProtractorHarnessEnvironment(element, this._options);
  }

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
