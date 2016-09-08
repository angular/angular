import {bindAction, profile} from '../../util';
import {TreeNode, buildTree, emptyTree} from '../util';
import {render} from './tree';
const {patch} = require('incremental-dom');

export function main() {
  var app: any;

  function destroyDom() { patch(app, () => render(emptyTree)); }

  function createDom() { patch(app, () => render(buildTree())); }

  function noop() {}

  function init() {
    app = document.querySelector('tree');

    bindAction('#destroyDom', destroyDom);
    bindAction('#createDom', createDom);

    bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
    bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
  }

  init();
}
