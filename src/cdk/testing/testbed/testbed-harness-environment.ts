/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {HarnessEnvironment} from '@angular/cdk/testing';
import {ComponentFixture} from '@angular/core/testing';
import {ComponentHarness, ComponentHarnessConstructor, HarnessLoader} from '../component-harness';
import {TestElement} from '../test-element';
import {UnitTestElement} from './unit-test-element';

/** A `HarnessEnvironment` implementation for Angular's Testbed. */
export class TestbedHarnessEnvironment extends HarnessEnvironment<Element> {
  private _destroyed = false;

  protected constructor(rawRootElement: Element, private _fixture: ComponentFixture<unknown>) {
    super(rawRootElement);
    _fixture.componentRef.onDestroy(() => this._destroyed = true);
  }

  /** Creates a `HarnessLoader` rooted at the given fixture's root element. */
  static loader(fixture: ComponentFixture<unknown>): HarnessLoader {
    return new TestbedHarnessEnvironment(fixture.nativeElement, fixture);
  }

  /**
   * Creates a `HarnessLoader` at the document root. This can be used if harnesses are
   * located outside of a fixture (e.g. overlays appended to the document body).
   */
  static documentRootLoader(fixture: ComponentFixture<unknown>): HarnessLoader {
    return new TestbedHarnessEnvironment(document.body, fixture);
  }

  /**
   * Creates an instance of the given harness type, using the fixture's root element as the
   * harness's host element. This method should be used when creating a harness for the root element
   * of a fixture, as components do not have the correct selector when they are created as the root
   * of the fixture.
   */
  static async harnessForFixture<T extends ComponentHarness>(
      fixture: ComponentFixture<unknown>, harnessType: ComponentHarnessConstructor<T>): Promise<T> {
    const environment = new TestbedHarnessEnvironment(fixture.nativeElement, fixture);
    await environment.forceStabilize();
    return environment.createComponentHarness(harnessType, fixture.nativeElement);
  }

  async forceStabilize(): Promise<void> {
    if (this._destroyed) {
      throw Error('Harness is attempting to use a fixture that has already been destroyed.');
    }

    this._fixture.detectChanges();
    await this._fixture.whenStable();
  }

  protected getDocumentRoot(): Element {
    return document.body;
  }

  protected createTestElement(element: Element): TestElement {
    return new UnitTestElement(element, () => this.forceStabilize());
  }

  protected createEnvironment(element: Element): HarnessEnvironment<Element> {
    return new TestbedHarnessEnvironment(element, this._fixture);
  }

  protected async getAllRawElements(selector: string): Promise<Element[]> {
    await this.forceStabilize();
    return Array.from(this.rawRootElement.querySelectorAll(selector));
  }
}
