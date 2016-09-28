import {bindAction, profile} from '../../util';
import {buildTree, emptyTree} from '../util';
import {TreeComponent} from './tree';

export function main() {
  var tree: TreeComponent;

  function destroyDom() { tree.data = emptyTree; }

  function createDom() { tree.data = buildTree(); }

  function noop() {}

  function init() {
    tree = new TreeComponent(document.querySelector('tree'));

    bindAction('#destroyDom', destroyDom);
    bindAction('#createDom', createDom);

    bindAction('#updateDomProfile', profile(createDom, noop, 'update'));
    bindAction('#createDomProfile', profile(createDom, destroyDom, 'create'));
  }

  init();
}
