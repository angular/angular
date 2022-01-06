/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ComponentHarness,
  ComponentHarnessConstructor,
  handleAutoChangeDetectionStatus,
  HarnessEnvironment,
  HarnessLoader,
  stopHandlingAutoChangeDetectionStatus,
  TestElement,
} from '@angular/cdk/testing';
import {ComponentFixture, flush} from '@angular/core/testing';
import {Observable} from 'rxjs';
import {takeWhile} from 'rxjs/operators';
import {TaskState, TaskStateZoneInterceptor} from './task-state-zone-interceptor';
import {UnitTestElement} from './unit-test-element';

/** Options to configure the environment. */
export interface TestbedHarnessEnvironmentOptions {
  /** The query function used to find DOM elements. */
  queryFn: (selector: string, root: Element) => Iterable<Element> | ArrayLike<Element>;
}

/** The default environment options. */
const defaultEnvironmentOptions: TestbedHarnessEnvironmentOptions = {
  queryFn: (selector: string, root: Element) => root.querySelectorAll(selector),
};

/** Whether auto change detection is currently disabled. */
let disableAutoChangeDetection = false;

/**
 * The set of non-destroyed fixtures currently being used by `TestbedHarnessEnvironment` instances.
 */
const activeFixtures = new Set<ComponentFixture<unknown>>();

/**
 * Installs a handler for change detection batching status changes for a specific fixture.
 * @param fixture The fixture to handle change detection batching for.
 */
function installAutoChangeDetectionStatusHandler(fixture: ComponentFixture<unknown>) {
  if (!activeFixtures.size) {
    handleAutoChangeDetectionStatus(({isDisabled, onDetectChangesNow}) => {
      disableAutoChangeDetection = isDisabled;
      if (onDetectChangesNow) {
        Promise.all(Array.from(activeFixtures).map(detectChanges)).then(onDetectChangesNow);
      }
    });
  }
  activeFixtures.add(fixture);
}

/**
 * Uninstalls a handler for change detection batching status changes for a specific fixture.
 * @param fixture The fixture to stop handling change detection batching for.
 */
function uninstallAutoChangeDetectionStatusHandler(fixture: ComponentFixture<unknown>) {
  activeFixtures.delete(fixture);
  if (!activeFixtures.size) {
    stopHandlingAutoChangeDetectionStatus();
  }
}

/** Whether we are currently in the fake async zone. */
function isInFakeAsyncZone() {
  return Zone!.current.get('FakeAsyncTestZoneSpec') != null;
}

/**
 * Triggers change detection for a specific fixture.
 * @param fixture The fixture to trigger change detection for.
 */
async function detectChanges(fixture: ComponentFixture<unknown>) {
  fixture.detectChanges();
  if (isInFakeAsyncZone()) {
    flush();
  } else {
    await fixture.whenStable();
  }
}

/** A `HarnessEnvironment` implementation for Angular's Testbed. */
export class TestbedHarnessEnvironment extends HarnessEnvironment<Element> {
  /** Whether the environment has been destroyed. */
  private _destroyed = false;

  /** Observable that emits whenever the test task state changes. */
  private _taskState: Observable<TaskState>;

  /** The options for this environment. */
  private _options: TestbedHarnessEnvironmentOptions;

  /** Environment stabilization callback passed to the created test elements. */
  private _stabilizeCallback: () => Promise<void>;

  protected constructor(
    rawRootElement: Element,
    private _fixture: ComponentFixture<unknown>,
    options?: TestbedHarnessEnvironmentOptions,
  ) {
    super(rawRootElement);
    this._options = {...defaultEnvironmentOptions, ...options};
    this._taskState = TaskStateZoneInterceptor.setup();
    this._stabilizeCallback = () => this.forceStabilize();
    installAutoChangeDetectionStatusHandler(_fixture);
    _fixture.componentRef.onDestroy(() => {
      uninstallAutoChangeDetectionStatusHandler(_fixture);
      this._destroyed = true;
    });
  }

  /** Creates a `HarnessLoader` rooted at the given fixture's root element. */
  static loader(
    fixture: ComponentFixture<unknown>,
    options?: TestbedHarnessEnvironmentOptions,
  ): HarnessLoader {
    return new TestbedHarnessEnvironment(fixture.nativeElement, fixture, options);
  }

  /**
   * Creates a `HarnessLoader` at the document root. This can be used if harnesses are
   * located outside of a fixture (e.g. overlays appended to the document body).
   */
  static documentRootLoader(
    fixture: ComponentFixture<unknown>,
    options?: TestbedHarnessEnvironmentOptions,
  ): HarnessLoader {
    return new TestbedHarnessEnvironment(document.body, fixture, options);
  }

  /** Gets the native DOM element corresponding to the given TestElement. */
  static getNativeElement(el: TestElement): Element {
    if (el instanceof UnitTestElement) {
      return el.element;
    }
    throw Error('This TestElement was not created by the TestbedHarnessEnvironment');
  }

  /**
   * Creates an instance of the given harness type, using the fixture's root element as the
   * harness's host element. This method should be used when creating a harness for the root element
   * of a fixture, as components do not have the correct selector when they are created as the root
   * of the fixture.
   */
  static async harnessForFixture<T extends ComponentHarness>(
    fixture: ComponentFixture<unknown>,
    harnessType: ComponentHarnessConstructor<T>,
    options?: TestbedHarnessEnvironmentOptions,
  ): Promise<T> {
    const environment = new TestbedHarnessEnvironment(fixture.nativeElement, fixture, options);
    await environment.forceStabilize();
    return environment.createComponentHarness(harnessType, fixture.nativeElement);
  }

  /**
   * Flushes change detection and async tasks captured in the Angular zone.
   * In most cases it should not be necessary to call this manually. However, there may be some edge
   * cases where it is needed to fully flush animation events.
   */
  async forceStabilize(): Promise<void> {
    if (!disableAutoChangeDetection) {
      if (this._destroyed) {
        throw Error('Harness is attempting to use a fixture that has already been destroyed.');
      }

      await detectChanges(this._fixture);
    }
  }

  /**
   * Waits for all scheduled or running async tasks to complete. This allows harness
   * authors to wait for async tasks outside of the Angular zone.
   */
  async waitForTasksOutsideAngular(): Promise<void> {
    // If we run in the fake async zone, we run "flush" to run any scheduled tasks. This
    // ensures that the harnesses behave inside of the FakeAsyncTestZone similar to the
    // "AsyncTestZone" and the root zone (i.e. neither fakeAsync or async). Note that we
    // cannot just rely on the task state observable to become stable because the state will
    // never change. This is because the task queue will be only drained if the fake async
    // zone is being flushed.
    if (isInFakeAsyncZone()) {
      flush();
    }

    // Wait until the task queue has been drained and the zone is stable. Note that
    // we cannot rely on "fixture.whenStable" since it does not catch tasks scheduled
    // outside of the Angular zone. For test harnesses, we want to ensure that the
    // app is fully stabilized and therefore need to use our own zone interceptor.
    await this._taskState.pipe(takeWhile(state => !state.stable)).toPromise();
  }

  /** Gets the root element for the document. */
  protected getDocumentRoot(): Element {
    return document.body;
  }

  /** Creates a `TestElement` from a raw element. */
  protected createTestElement(element: Element): TestElement {
    return new UnitTestElement(element, this._stabilizeCallback);
  }

  /** Creates a `HarnessLoader` rooted at the given raw element. */
  protected createEnvironment(element: Element): HarnessEnvironment<Element> {
    return new TestbedHarnessEnvironment(element, this._fixture, this._options);
  }

  /**
   * Gets a list of all elements matching the given selector under this environment's root element.
   */
  protected async getAllRawElements(selector: string): Promise<Element[]> {
    await this.forceStabilize();
    return Array.from(this._options.queryFn(selector, this.rawRootElement));
  }
}
