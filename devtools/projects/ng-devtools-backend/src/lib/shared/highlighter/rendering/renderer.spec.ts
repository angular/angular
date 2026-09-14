/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {createMockHighlight, createTemplate} from '../spec-utils';
import {CANVAS_ID, Renderer} from './renderer';
import {Coor} from './utils';

const DEF_TARGET_RECT = new DOMRect(10, 10, 200, 200);
const INSIDE_DEF_RECT_PX: Coor = {x: 50, y: 50};
const OUTSIDE_DEF_RECT_PX: Coor = {x: 5, y: 5};

function canvasEl(): HTMLCanvasElement | null {
  return document.getElementById(CANVAS_ID) as HTMLCanvasElement | null;
}

/**
 * Check whether there is something rendered
 * at the given pixel/point.
 */
function isPixelRenderedAt({x, y}: Coor): boolean {
  const ctx = canvasEl()!.getContext('2d')!;

  // `a` and `d` represent the X and Y scale that we
  // apply when scaling the canvas based on the DPR in
  // `renderer.updateCanvasSize`.
  // We need them for scaling back the provided pixel/point
  // coordinates since `getImageData` work with device pixels.
  // We check the alpha channel.
  const {a, d} = ctx.getTransform();
  return ctx.getImageData(Math.round(x * a), Math.round(y * d), 1, 1).data[3] > 0;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitFor(predicate: () => boolean): Promise<void> {
  const start = performance.now();
  // Giving super tight timeout since rAF is not mocked.
  // Adjust the tests so that they fit within it.
  const timeout = 30;

  while (!predicate()) {
    if (performance.now() - start > timeout) {
      throw new Error('Timed out while waiting for the expected render state.');
    }
    await nextFrame();
  }
}

describe('Renderer', () => {
  let renderer: Renderer;

  function createTarget(rect = DEF_TARGET_RECT): HTMLElement {
    const el = document.createElement('div');
    el.style.position = 'absolute';
    el.style.top = '0';
    el.style.left = '0';

    document.body.appendChild(el);
    spyOn(el, 'getBoundingClientRect').and.returnValue(rect);

    return el;
  }

  beforeEach(() => {
    renderer = new Renderer();
  });

  afterEach(() => {
    renderer.destroy();
  });

  it('should append a transparent canvas to the body', () => {
    const canvas = canvasEl()!;

    expect(canvas.parentElement).toBe(document.body);
    expect(canvas.width).toBeGreaterThan(0);
    expect(canvas.height).toBeGreaterThan(0);
  });

  it('should remove the canvas on destroy', () => {
    renderer.destroy();

    expect(canvasEl()).toBe(null);
  });

  it('should draw a highlight on the canvas', async () => {
    const highlight = createMockHighlight(createTemplate(), {name: ['Foo']}, createTarget());

    renderer.renderHighlight(highlight);
    await nextFrame();

    expect(isPixelRenderedAt(INSIDE_DEF_RECT_PX)).toBeTrue();
    expect(isPixelRenderedAt(OUTSIDE_DEF_RECT_PX)).toBeFalse();
  });

  it('should clear a removed highlight from the canvas', async () => {
    const highlight = createMockHighlight(createTemplate(), {name: ['Foo']}, createTarget());

    renderer.renderHighlight(highlight);
    await nextFrame();

    expect(isPixelRenderedAt(INSIDE_DEF_RECT_PX)).toBeTrue();

    renderer.removeHighlight(highlight);
    await nextFrame();

    expect(isPixelRenderedAt(INSIDE_DEF_RECT_PX)).toBeFalse();
  });

  it('should clear only the removed highlight', async () => {
    const template = createTemplate();
    const targetFoo = createTarget(new DOMRect(0, 0, 10, 10));
    const targetBar = createTarget(new DOMRect(20, 20, 10, 10));
    const foo = createMockHighlight(template, {name: ['Foo']}, targetFoo);
    const bar = createMockHighlight(template, {name: ['Bar']}, targetBar);

    const fooPixel: Coor = {x: 15, y: 15};
    const barPixel: Coor = {x: 25, y: 25};

    // 1st: The two highlights must be visible
    renderer.renderHighlight(foo);
    renderer.renderHighlight(bar);
    await nextFrame();

    expect(isPixelRenderedAt(fooPixel)).toBeTrue();
    expect(isPixelRenderedAt(barPixel)).toBeTrue();

    // 2nd. Foo removed. Only bar should be visible
    renderer.removeHighlight(foo);

    // TODO(hawkgs): Figure out why we need to wait 2 frames.
    await nextFrame();
    await nextFrame();

    expect(isPixelRenderedAt(fooPixel)).toBeFalse();
    expect(isPixelRenderedAt(barPixel)).toBeTrue();
  });

  it('should remove a TTL-bound highlight once it has faded out', async () => {
    const highlight = createMockHighlight(
      createTemplate({ttl: 10}),
      {name: ['Foo']},
      createTarget(),
    );

    renderer.renderHighlight(highlight);
    await nextFrame();

    expect(isPixelRenderedAt(INSIDE_DEF_RECT_PX)).toBeTrue();
    expect(highlight.destroy).not.toHaveBeenCalled();

    await waitFor(() => highlight.destroy.calls.any());

    expect(isPixelRenderedAt(INSIDE_DEF_RECT_PX)).toBeFalse();
  });
});
