/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessEnvironment, HarnessLoader, TestElement} from '@angular/cdk/testing';
import * as webdriver from 'selenium-webdriver';
import {SeleniumWebDriverElement} from './selenium-web-driver-element';

/**
 * An Angular framework stabilizer function that takes a callback and calls it when the application
 * is stable, passing a boolean indicating if any work was done.
 */
declare interface FrameworkStabilizer {
  (callback: (didWork: boolean) => void): void;
}

declare global {
  interface Window {
    /**
     * These hooks are exposed by Angular to register a callback for when the application is stable
     * (no more pending tasks).
     *
     * For the implementation, see: https://github.com/
     *  angular/angular/blob/main/packages/platform-browser/src/browser/testability.ts#L30-L49
     */
    frameworkStabilizers: FrameworkStabilizer[];
  }
}

/** Options to configure the environment. */
export interface WebDriverHarnessEnvironmentOptions {
  /** The query function used to find DOM elements. */
  queryFn: (selector: string, root: () => webdriver.WebElement) => Promise<webdriver.WebElement[]>;
}

/** The default environment options. */
const defaultEnvironmentOptions: WebDriverHarnessEnvironmentOptions = {
  queryFn: async (selector: string, root: () => webdriver.WebElement) =>
    root().findElements(webdriver.By.css(selector)),
};

/**
 * This function is meant to be executed in the browser. It taps into the hooks exposed by Angular
 * and invokes the specified `callback` when the application is stable (no more pending tasks).
 */
function whenStable(callback: (didWork: boolean[]) => void): void {
  Promise.all(window.frameworkStabilizers.map(stabilizer => new Promise(stabilizer))).then(
    callback,
  );
}

/**
 * This function is meant to be executed in the browser. It checks whether the Angular framework has
 * bootstrapped yet.
 */
function isBootstrapped() {
  return !!window.frameworkStabilizers;
}

/** Waits for angular to be ready after the page load. */
export async function waitForAngularReady(wd: webdriver.WebDriver) {
  await wd.wait(() => wd.executeScript(isBootstrapped));
  await wd.executeAsyncScript(whenStable);
}

/** A `HarnessEnvironment` implementation for WebDriver. */
export class SeleniumWebDriverHarnessEnvironment extends HarnessEnvironment<
  () => webdriver.WebElement
> {
  /** The options for this environment. */
  private _options: WebDriverHarnessEnvironmentOptions;

  /** Environment stabilization callback passed to the created test elements. */
  private _stabilizeCallback: () => Promise<void>;

  protected constructor(
    rawRootElement: () => webdriver.WebElement,
    options?: WebDriverHarnessEnvironmentOptions,
  ) {
    super(rawRootElement);
    this._options = {...defaultEnvironmentOptions, ...options};
    this._stabilizeCallback = () => this.forceStabilize();
  }

  /** Gets the ElementFinder corresponding to the given TestElement. */
  static getNativeElement(el: TestElement): webdriver.WebElement {
    if (el instanceof SeleniumWebDriverElement) {
      return el.element();
    }
    throw Error('This TestElement was not created by the WebDriverHarnessEnvironment');
  }

  /** Creates a `HarnessLoader` rooted at the document root. */
  static loader(
    driver: webdriver.WebDriver,
    options?: WebDriverHarnessEnvironmentOptions,
  ): HarnessLoader {
    return new SeleniumWebDriverHarnessEnvironment(
      () => driver.findElement(webdriver.By.css('body')),
      options,
    );
  }

  /**
   * Flushes change detection and async tasks captured in the Angular zone.
   * In most cases it should not be necessary to call this manually. However, there may be some edge
   * cases where it is needed to fully flush animation events.
   */
  async forceStabilize(): Promise<void> {
    await this.rawRootElement().getDriver().executeAsyncScript(whenStable);
  }

  /** @docs-private */
  async waitForTasksOutsideAngular(): Promise<void> {
    // TODO: figure out how we can do this for the webdriver environment.
    //  https://github.com/angular/components/issues/17412
  }

  /** Gets the root element for the document. */
  protected getDocumentRoot(): () => webdriver.WebElement {
    return () => this.rawRootElement().getDriver().findElement(webdriver.By.css('body'));
  }

  /** Creates a `TestElement` from a raw element. */
  protected createTestElement(element: () => webdriver.WebElement): TestElement {
    return new SeleniumWebDriverElement(element, this._stabilizeCallback);
  }

  /** Creates a `HarnessLoader` rooted at the given raw element. */
  protected createEnvironment(
    element: () => webdriver.WebElement,
  ): HarnessEnvironment<() => webdriver.WebElement> {
    return new SeleniumWebDriverHarnessEnvironment(element, this._options);
  }

  // Note: This seems to be working, though we may need to re-evaluate if we encounter issues with
  // stale element references. `() => Promise<webdriver.WebElement[]>` seems like a more correct
  // return type, though supporting it would require changes to the public harness API.
  /**
   * Gets a list of all elements matching the given selector under this environment's root element.
   */
  protected async getAllRawElements(selector: string): Promise<(() => webdriver.WebElement)[]> {
    const els = await this._options.queryFn(selector, this.rawRootElement);
    return els.map((x: webdriver.WebElement) => () => x);
  }
}
