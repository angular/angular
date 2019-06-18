/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {by, element as protractorElement, ElementFinder} from 'protractor';
import {HarnessLoader} from '../component-harness';
import {HarnessEnvironment} from '../harness-environment';
import {TestElement} from '../test-element';
import {ProtractorElement} from './protractor-element';

/** A `HarnessEnvironment` implementation for Protractor. */
export class ProtractorHarnessEnvironment extends HarnessEnvironment<ElementFinder> {
  protected constructor(rawRootElement: ElementFinder) {
    super(rawRootElement);
  }

  /** Creates a `HarnessLoader` rooted at the document root. */
  static loader(): HarnessLoader {
    return new ProtractorHarnessEnvironment(protractorElement(by.css('body')));
  }

  protected getDocumentRoot(): ElementFinder {
    return protractorElement(by.css('body'));
  }

  protected createTestElement(element: ElementFinder): TestElement {
    return new ProtractorElement(element);
  }

  protected createEnvironment(element: ElementFinder): HarnessEnvironment<ElementFinder> {
    return new ProtractorHarnessEnvironment(element);
  }

  protected async getRawElement(selector: string): Promise<ElementFinder | null> {
    const element = this.rawRootElement.element(by.css(selector));
    return await element.isPresent() ? element : null;
  }

  protected async getAllRawElements(selector: string): Promise<ElementFinder[]> {
    const elements = this.rawRootElement.all(by.css(selector));
    return elements.reduce(
        (result: ElementFinder[], el: ElementFinder) => el ? result.concat([el]) : result, []);
  }
}
