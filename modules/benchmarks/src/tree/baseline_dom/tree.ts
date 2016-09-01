import {TreeNode} from '../util';

// template:
// <span> {{data.value}} <span template='ngIf data.right != null'><tree
// [data]='data.right'></tree></span><span template='ngIf data.left != null'><tree
// [data]='data.left'></tree></span></span>
export function createTreeTemplate(parentEl: any, data: TreeNode) {
  const rootSpan = document.createElement('span');
  parentEl.appendChild(rootSpan);
  rootSpan.appendChild(document.createTextNode(` ${data.value} `));

  if (data.left) {
    const leftTreeSpan = document.createElement('span');
    rootSpan.appendChild(leftTreeSpan);
    const leftTree = document.createElement('tree');
    leftTreeSpan.appendChild(leftTree);
    createTreeTemplate(leftTree, data.left);
  }
  if (data.right) {
    const rightTreeSpan = document.createElement('span');
    rootSpan.appendChild(rightTreeSpan);
    const rightTree = document.createElement('tree');
    rightTreeSpan.appendChild(rightTree);
    createTreeTemplate(rightTree, data.right);
  }
}

export function destroyTreeTemplate(el: any) {
  while (el.firstChild) el.removeChild(el.firstChild);
}
