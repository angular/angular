import {TreeNode} from '../util';
const {elementOpen, elementClose, text} = require('incremental-dom');

// template:
// <span> {{data.value}} <span template='ngIf data.right != null'><tree
// [data]='data.right'></tree></span><span template='ngIf data.left != null'><tree
// [data]='data.left'></tree></span></span>
export function render(data: TreeNode) {
  elementOpen('span', '', null);
  text(` ${data.value} `);
  if (data.left) {
    elementOpen('span', '', null);
    elementOpen('tree', '', null);
    render(data.left);
    elementClose('tree');
    elementClose('span');
  }
  if (data.right) {
    elementOpen('span', '', null);
    elementOpen('tree', '', null);
    render(data.right);
    elementClose('tree');
    elementClose('span');
  }
  elementClose('span');
}
