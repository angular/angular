/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Helper function that wraps setTimeout in a promise, to make
 * using async/await easier.
 */
export async function nextTick(delay = 1) {
  return new Promise((res, rej) => { setTimeout(() => { res(); }, delay); });
}

export async function execTimed(description: string, func: () => Promise<void>) {
  if (description.indexOf('-') >= 0) {
    throw new Error('Use "_" instead of "-". Need underscores for perfgate');
  }

  console.time(description);
  await func();
  // Wait an arbitrary amount of time after each step, to allow any debounced
  // async tasks to finish.
  await nextTick(200);
  console.timeEnd(description);
}

// Waits for Angular's testability.whenStable()
export async function waitForStable() {
  return new Promise((resolve: Function) => {
    (window as any).getAllAngularTestabilities()[0].whenStable(resolve);
  });
}

// Deprecated: Use nextTick instead.
export async function onNextTick(callback: Function, delay = 1) {
  return new Promise((resolve: Function) => {
    setTimeout(() => {
      callback();
      resolve();
    }, delay);
  });
}

/**
 * Mock out the AngularJS injector with a fake that throws an error if anyone
 * tries to inject an upgraded dependency. If you see these errors, mock out the
 * upgraded service.
 */
export const mockInjector = {
  provide: '$injector',
  useValue: {
    get(injectableName: {}) {
      // tslint:disable:no-string-throw this is just for debugging
      return new Proxy({}, {
        get: (target: string, name: string) => {
          throw `Trying to get the property: ${name} ` +
              `of stubbed ${injectableName}`;
        },
        set: (target: string, name: string, value: {}) => {
          throw `Trying to set the property: ${name} ` +
              `of stubbed ${injectableName} to value: ${value}`;
        }
      });
      // tslint:enable:no-string-throw
    }
  },
};

/**
 * Helper function used to resize a target element in benchmark tests.
 */
export async function doResize(
    initialSize: number, endSize: number,
    target = document.querySelector('benchmark-area') as HTMLElement,
    widthOrHeight: 'width' | 'height' = 'width') {
  if (!target) {
    throw new Error('Could not find the element to resize.');
  }

  const resizeType = initialSize > endSize ? 'shrink' : 'extend';

  await execTimed(`resize ${widthOrHeight} ${resizeType}`, async() => {
    const numSteps = 10;
    const incrementSize = Math.floor((endSize - initialSize) / numSteps);
    let newSize = initialSize;
    for (let i = 0; i < numSteps; i++) {
      newSize += incrementSize;

      if (widthOrHeight === 'width') {
        target.style.width = `${newSize}px`;
      } else {
        target.style.height = `${newSize}px`;
      }
      // Simulate 60 fps resizing.
      await nextTick(16);
    }
  });
}

export async function doScroll(finalX: number, finalY: number, elm: HTMLElement) {
  if (!elm) {
    throw new Error('Could not find the element to scroll.');
  }
  const initialY = elm.scrollTop;
  const initialX = elm.scrollLeft;

  await execTimed(`scroll`, async() => {
    const numSteps = 10;
    const xIncrementSize = Math.floor((finalX - initialX) / numSteps);
    const yIncrementSize = Math.floor((finalY - initialY) / numSteps);
    let curX = initialX;
    let curY = initialY;
    for (let i = 0; i < numSteps; i++) {
      curX += xIncrementSize;
      curY += yIncrementSize;

      elm.scrollTo(curX, curY);

      // Simulate 60 fps scrolling.
      await nextTick(16);
    }
  });
}

/**
 * Wait until the given condition function returns true. Waiting like this
 * is fine, since for benchmarks we don't measure wall clock time, we use
 * Chrome's instrumentation to measure JS execution and rendering.
 */
export async function waitForCondition(condition: () => boolean) {
  // Wait up to 5 seconds, then abort.
  const MAX_WAIT_SECONDS = 5;
  const WAIT_PERIOD_MS = 100;
  const MAX_RETRIES = MAX_WAIT_SECONDS * 1000 / WAIT_PERIOD_MS;

  for (let i = 0; i < MAX_RETRIES; i++) {
    if (condition()) {
      return;
    }
    await nextTick(100);
  }

  throw new Error(`Timed out waiting for condition to be true: '${condition}`);
}

/**
 * A specialized waitForCondition helper that waits for the given selector
 * to match any number of elements. If the component you're testing does async
 * work or has animations, sometimes you'll need to wait for it to finish by
 * inspecting the DOM.
 */
export async function waitForSelector(selector: string) {
  try {
    return waitForCondition(() => { return document.querySelectorAll(selector).length > 0; });
  } catch (e) {
    throw new Error(`Timed out waiting for selector '${selector}`);
  }
}
