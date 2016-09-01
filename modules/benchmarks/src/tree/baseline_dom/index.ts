import {bindAction, profile} from '../../util';
import {TreeNode, buildTree, emptyTree} from '../util';
import {createTreeTemplate, destroyTreeTemplate} from './tree';

export function main() {
  var app: any;

  function destroyDom() { destroyTreeTemplate(app); }

  function createDom() { createTreeTemplate(app, buildTree()); }

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
