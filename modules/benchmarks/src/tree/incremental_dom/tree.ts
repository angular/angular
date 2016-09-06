import {TreeNode} from '../util';
const {patch, elementOpen, elementClose, elementOpenStart, elementOpenEnd, text, attr} =
    require('incremental-dom');

export class TreeComponent {
  constructor(private _rootEl: any) {}

  set data(data: TreeNode) { patch(this._rootEl, () => this._render(data)); }

  private _render(data: TreeNode) {
    elementOpenStart('span', '', null);
    if (data.depth % 2 === 0) {
      attr('style', 'background-color: grey');
    }
    elementOpenEnd();
    text(` ${data.value} `);
    elementClose('span');
    if (data.left) {
      elementOpen('tree', '', null);
      this._render(data.left);
      elementClose('tree');
    }
    if (data.right) {
      elementOpen('tree', '', null);
      this._render(data.right);
      elementClose('tree');
    }
  }
}
