/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getIntParameter} from '../util';

export class TreeNode {
  transitiveChildCount: number;
  children: TreeNode[];

  constructor(
      public value: string, public depth: number, public maxDepth: number,
      public left: TreeNode|null, public right: TreeNode|null) {
    this.transitiveChildCount = Math.pow(2, (this.maxDepth - this.depth + 1)) - 1;
    this.children = this.left ? [this.left, this.right!] : [];
  }

  // Needed for Polymer as it does not support ternary nor modulo operator
  // in expressions
  get style(): string {
    return this.depth % 2 === 0 ? 'background-color: grey' : '';
  }
}

let treeCreateCount: number;
let maxDepth: number;
let numberData: TreeNode;
let charData: TreeNode;

export function getMaxDepth() {
  return maxDepth;
}

export function initTreeUtils() {
  maxDepth = getIntParameter('depth');
  treeCreateCount = 0;
  numberData = _buildTree(0, numberValues);
  charData = _buildTree(0, charValues);
}

function _buildTree(currDepth: number, valueFn: (depth: number) => string): TreeNode {
  const children = currDepth < maxDepth ? _buildTree(currDepth + 1, valueFn) : null;
  return new TreeNode(valueFn(currDepth), currDepth, maxDepth, children, children);
}

export const emptyTree = new TreeNode('', 0, 0, null, null);

export function buildTree(): TreeNode {
  treeCreateCount++;
  return treeCreateCount % 2 ? numberData : charData;
}

function numberValues(depth: number): string {
  return depth.toString();
}

function charValues(depth: number): string {
  return String.fromCharCode('A'.charCodeAt(0) + (depth % 26));
}

export function flattenTree(node: TreeNode, target: TreeNode[] = []): TreeNode[] {
  target.push(node);
  if (node.left) {
    flattenTree(node.left, target);
  }
  if (node.right) {
    flattenTree(node.right, target);
  }
  return target;
}

export function newArray<T = any>(size: number): T[];
export function newArray<T>(size: number, value: T): T[];
export function newArray<T>(size: number, value?: T): T[] {
  const list: T[] = [];
  for (let i = 0; i < size; i++) {
    list.push(value!);
  }
  return list;
}
