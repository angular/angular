import {getIntParameter} from '../util';

export class TreeNode {
  constructor(public value: string, public left: TreeNode, public right: TreeNode) {}
}

let treeCreateCount: number;
export let maxDepth: number;
let numberData: string[];
let charData: string[];

init();

function init() {
  maxDepth = getIntParameter('depth');
  treeCreateCount = 0;
  numberData = [];
  charData = [];
  for (let i = 0; i < maxDepth; i++) {
    numberData.push(i.toString());
    charData.push(String.fromCharCode('A'.charCodeAt(0) + i));
  }
}

function _buildTree(values: string[], curDepth: number = 0): TreeNode {
  if (maxDepth === curDepth) return new TreeNode('', null, null);
  return new TreeNode(
      values[curDepth], _buildTree(values, curDepth + 1), _buildTree(values, curDepth + 1));
}

export const emptyTree = new TreeNode('', null, null);

export function buildTree(): TreeNode {
  treeCreateCount++;
  return _buildTree(treeCreateCount % 2 ? numberData : charData);
}
