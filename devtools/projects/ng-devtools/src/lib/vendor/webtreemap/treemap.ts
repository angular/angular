/**
 * Copyright 2019 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Node} from './tree';

const CSS_PREFIX = 'webtreemap-';
const NODE_CSS_CLASS = CSS_PREFIX + 'node';

const DEFAULT_CSS = `
 .webtreemap-node {
   cursor: pointer;
   position: absolute;
   border: solid 1px #666;
   box-sizing: border-box;
   overflow: hidden;
   background: white;
   transition: left .15s, top .15s, width .15s, height .15s;
 }
 
 .webtreemap-node:hover {
   background: #ddd;
 }
 
 .webtreemap-caption {
   font-size: 10px;
   text-align: center;
 }
 `;

function addCSS(parent: HTMLElement) {
  const style = document.createElement('style');
  style.innerText = DEFAULT_CSS;
  parent.appendChild(style);
}

export function isDOMNode(e: Element): boolean {
  return e.classList.contains(NODE_CSS_CLASS);
}

/**
 * Options is the set of user-provided webtreemap configuration.
 */
export interface Options {
  padding: [number, number, number, number];
  lowerBound: number;
  applyMutations(node: Node): void;
  caption(node: Node): string;
  showNode(node: Node, width: number, height: number): boolean;
  showChildren(node: Node, width: number, height: number): boolean;
}

/**
 * get the index of this node in its parent's children list.
 * O(n) but we expect n to be small.
 */
function getNodeIndex(target: Element): number {
  let index = 0;
  let node: Element|null = target;
  while ((node = node.previousElementSibling)) {
    if (isDOMNode(node)) index++;
  }
  return index;
}

/**
 * Given a DOM node, compute its address: an array of indexes
 * into the Node tree.  An address [a1,a2,...] refers to
 * tree.chldren[a1].children[a2].children[...].
 */
export function getAddress(el: Element): number[] {
  let address: number[] = [];
  let n: Element|null = el;
  while (n && isDOMNode(n)) {
    address.unshift(getNodeIndex(n));
    n = n.parentElement;
  }
  address.shift();  // The first element will be the root, index 0.
  return address;
}

/**
 * Converts a number to a CSS pixel string.
 */
function px(x: number): string {
  // Rounding when computing pixel coordinates makes the box edges touch
  // better than letting the browser do it, because the browser has lots of
  // heuristics around handling non-integer pixel coordinates.
  return Math.round(x) + 'px';
}

function defaultOptions(options: Partial<Options>): Options {
  const opts = {
    padding: options.padding || [14, 3, 3, 3],
    lowerBound: options.lowerBound === undefined ? 0.1 : options.lowerBound,
    applyMutations: options.applyMutations || (() => null),
    caption: options.caption || ((node: Node) => node.id || ''),
    showNode: options.showNode ||
        ((node: Node, width: number, height: number):
             boolean => {
               return width > 20 && height >= opts.padding[0];
             }),
    showChildren: options.showChildren ||
        ((node: Node, width: number, height: number):
             boolean => {
               return width > 40 && height > 40;
             }),
  };
  return opts;
}

export class TreeMap {
  readonly options: Options;
  constructor(public node: Node, options: Partial<Options>) {
    this.options = defaultOptions(options);
  }

  /** Creates the DOM for a single node if it doesn't have one already. */
  ensureDOM(node: Node): HTMLElement {
    if (node.dom) return node.dom;
    const dom = document.createElement('div');
    dom.className = NODE_CSS_CLASS;
    if (this.options.caption) {
      const caption = document.createElement('div');
      caption.className = CSS_PREFIX + 'caption';
      caption.innerText = this.options.caption(node);
      dom.appendChild(caption);
    }
    node.dom = dom;
    this.options.applyMutations(node);
    return dom;
  }

  /**
   * Given a list of sizes, the 1-d space available
   * |space|, and a starting rectangle index |start|, compute a span of
   * rectangles that optimizes a pleasant aspect ratio.
   *
   * Returns [end, sum], where end is one past the last rectangle and sum is the
   * 2-d sum of the rectangles' areas.
   */
  private selectSpan(children: Node[], space: number, start: number): {end: number; sum: number} {
    // Add rectangles one by one, stopping when aspect ratios begin to go
    // bad.  Result is [start,end) covering the best run for this span.
    // http://scholar.google.com/scholar?cluster=5972512107845615474
    let smin = children[start].size;  // Smallest seen child so far.
    let smax = smin;                  // Largest child.
    let sum = 0;                      // Sum of children in this span.
    let lastScore = 0;                // Best score yet found.
    let end = start;
    for (; end < children.length; end++) {
      const size = children[end].size;
      if (size < smin) smin = size;
      if (size > smax) smax = size;

      // Compute the relative squariness of the rectangles with this
      // additional rectangle included.
      const nextSum = sum + size;

      // Suppose you're laying out along the x axis, so "space"" is the
      // available width.  Then the height of the span of rectangles is
      //   height = sum/space
      //
      // The largest rectangle potentially will be too wide.
      // Its width and width/height ratio is:
      //   width = smax / height
      //   width/height = (smax / (sum/space)) / (sum/space)
      //                = (smax * space * space) / (sum * sum)
      //
      // The smallest rectangle potentially will be too narrow.
      // Its width and height/width ratio is:
      //   width = smin / height
      //   height/width = (sum/space) / (smin / (sum/space))
      //                = (sum * sum) / (smin * space * space)
      //
      // Take the larger of these two ratios as the measure of the
      // worst non-squarenesss.
      const score = Math.max(
          (smax * space * space) / (nextSum * nextSum),
          (nextSum * nextSum) / (smin * space * space));
      if (lastScore && score > lastScore) {
        // Including this additional rectangle produces worse squareness than
        // without it.  We're done.
        break;
      }
      lastScore = score;
      sum = nextSum;
    }
    return {end, sum};
  }

  /** Creates and positions child DOM for a node. */
  private layoutChildren(node: Node, level: number, width: number, height: number) {
    const total: number = node.size;
    const children = node.children;
    if (!children) return;
    // We use box-sizing: border-box so CSS 'width' etc include the border.
    // With 0 padding we want children to perfectly overlap their parent,
    // so we start with offsets of -1 (to start at the same point as the
    // parent) and create each box 1px larger than necessary (to make
    // adjoining borders overlap).

    let x1 = -1, y1 = -1, x2 = width - 1, y2 = height - 1;

    const spacing = 0;  // TODO: this.options.spacing;
    const padding = this.options.padding;
    y1 += padding[0];
    if (padding[1]) {
      // If there's any right-padding, subtract an extra pixel to allow for the
      // boxes being one pixel wider than necessary.
      x2 -= padding[1] + 1;
    }
    y2 -= padding[2];
    x1 += padding[3];

    let i: number = 0;
    if (this.options.showChildren(node, x2 - x1, y2 - y1)) {
      const scale = Math.sqrt(total / ((x2 - x1) * (y2 - y1)));
      var x = x1, y = y1;
      children: for (let start = 0; start < children.length;) {
        x = x1;
        const space = scale * (x2 - x1);
        const {end, sum} = this.selectSpan(children, space, start);
        if (sum / total < this.options.lowerBound) break;
        const height = sum / space;
        const heightPx = Math.round(height / scale) + 1;
        for (i = start; i < end; i++) {
          const child = children[i];
          const size = child.size;
          const width = size / height;
          const widthPx = Math.round(width / scale) + 1;
          if (!this.options.showNode(child, widthPx - spacing, heightPx - spacing)) {
            break children;
          }
          const needsAppend = child.dom == null;
          const dom = this.ensureDOM(child);
          const style = dom.style;
          style.left = px(x);
          style.width = px(widthPx - spacing);
          style.top = px(y);
          style.height = px(heightPx - spacing);
          if (needsAppend) {
            node.dom!.appendChild(dom);
          }

          this.layoutChildren(child, level + 1, widthPx, heightPx);

          // -1 so inner borders overlap.
          x += widthPx - 1;
        }
        // -1 so inner borders overlap.
        y += heightPx - 1;
        start = end;
      }
    }
    // Remove the DOM for any children we didn't visit.
    // These can be created if we zoomed in then out.
    for (; i < children.length; i++) {
      if (!children[i].dom) break;
      children[i].dom!.parentNode!.removeChild(children[i].dom!);
      children[i].dom = undefined;
    }
  }

  /**
   * Creates the full treemap in a container element.
   * The treemap is sized to the size of the container.
   */
  render(container: HTMLElement) {
    addCSS(container);
    const dom = this.ensureDOM(this.node);
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    dom.onclick = (e) => {
      let node: Element|null = e.target as Element;
      while (!isDOMNode(node)) {
        node = node.parentElement;
        if (!node) return;
      }
      let address = getAddress(node);
      this.zoom(address);
    };
    dom.style.width = width + 'px';
    dom.style.height = height + 'px';
    container.appendChild(dom);
    this.layoutChildren(this.node, 0, width, height);
  }

  /**
   * Zooms the treemap to display a specific node.
   * See getAddress() for a discussion of what address means.
   */
  zoom(address: number[]) {
    let node = this.node;
    const [padTop, padRight, padBottom, padLeft] = this.options.padding;

    let width = node.dom!.offsetWidth;
    let height = node.dom!.offsetHeight;
    for (const index of address) {
      width -= padLeft + padRight;
      height -= padTop + padBottom;

      if (!node.children) throw new Error('bad address');
      for (const c of node.children) {
        if (c.dom) c.dom.style.zIndex = '0';
      }
      node = node.children[index];
      const style = node.dom!.style;
      style.zIndex = '1';
      // See discussion in layout() about positioning.
      style.left = px(padLeft - 1);
      style.width = px(width);
      style.top = px(padTop - 1);
      style.height = px(height);
    }
    this.layoutChildren(node, 0, width, height);
  }
}

/** Main entry point; renders a tree into an HTML container. */
export function render(container: HTMLElement, node: Node, options: Partial<Options>) {
  new TreeMap(node, options).render(container);
}
