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

  protected async getAllRawElements(selector: string): Promise<ElementFinder[]> {
    const elementFinderArray = this.rawRootElement.all(by.css(selector));
    const length = await elementFinderArray.count();
    const elements: ElementFinder[] = [];
    for (let i = 0; i < length; i++) {
      elements.push(elementFinderArray.get(i));
    }
    return elements;
  }
}
