/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ProceduralRenderer3} from '@angular/core/src/render3/interfaces/renderer';

import {MicroBenchmarkRendererFactory, MicroBenchmarkRenderNode} from './noop_renderer';

describe('MicroBenchmarkRenderNode', () => {
  const renderer =
      new MicroBenchmarkRendererFactory().createRenderer(null, null) as ProceduralRenderer3;
  describe('className', () => {
    it('should be available in global space', () => {
      expect(Node).toBeDefined();
      const node: any = new MicroBenchmarkRenderNode();
      expect(node instanceof Node).toBeTruthy();
    });

    it('should emulate className', () => {
      const node: any = new MicroBenchmarkRenderNode();
      expect(node.className).toBe('');
      renderer.setAttribute(node, 'foo', 'A AA BBB');
      expect(node.className).toBe('');
      renderer.setAttribute(node, 'class', 'A AA BBB');
      expect(node.className).toBe('A AA BBB');
      renderer.addClass(node, 'A');
      expect(node.className).toBe('AA BBB A');
      renderer.addClass(node, 'C');
      expect(node.className).toBe('AA BBB A C');
      renderer.removeClass(node, 'A');
      expect(node.className).toBe('AA BBB C');
    });
  });
});
