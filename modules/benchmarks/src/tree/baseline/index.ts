import {bindAction, profile} from '../../util';
import {TreeNode, buildTree, emptyTree} from '../util';
import {BaseLineTreeComponent} from './tree';

export function main() {
  var app: BaseLineTreeComponent;

  function destroyDom() { app.update(emptyTree); }

  function createDom() { app.update(buildTree()); }

  function noop() {}

  function init() {
    const tree: any = document.querySelector('tree');
    app = new BaseLineTreeComponent(tree);

    bindAction('#destroyDom', destroyDom);
    bindAction('#createDom', createDom);

    bindAction('#updateDomProfile', profile(createDom, noop, 'baseline-update'));
    bindAction('#createDomProfile', profile(createDom, destroyDom, 'baseline-create'));
  }

  init();
}
