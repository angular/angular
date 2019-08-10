import {addToViewTree, createLContainer, createLView, createTView, getOrCreateTNode, refreshView, renderView} from '../../../../src/render3/instructions/shared';
import {TNodeType} from '../../../../src/render3/interfaces/node';
import {RComment, Renderer3, RendererFactory3} from '../../../../src/render3/interfaces/renderer';
import {LViewFlags, TView} from '../../../../src/render3/interfaces/view';
import {insertView} from '../../../../src/render3/node_manipulation';

class WebWorkerRenderNode {}

const mockRNode = new WebWorkerRenderNode();

// Create a root view
const rootTView = createTView(-1, null, 1, 0, null, null, null, null);
const tContainerNode = getOrCreateTNode(rootTView, null, 0, TNodeType.Container, null, null);
const rootLView = createLView(
    null, rootTView, {}, LViewFlags.CheckAlways, null, null, {} as RendererFactory3,
    {} as Renderer3);
const lContainer =
    createLContainer(mockRNode as RComment, rootLView, mockRNode as RComment, tContainerNode, true);
addToViewTree(rootLView, lContainer);

// Create 10 different embedded view types
const embeddedTView = createTView(-1, function() {}, 0, 0, null, null, null, null);

function createAndInsertEmbeddedView(tView: TView, index: number) {
  const lView = createLView(
      rootLView, tView, {}, LViewFlags.CheckAlways, null, null, {} as RendererFactory3,
      {} as Renderer3);
  insertView(lView, lContainer, index);
}

// create 1000 embedded views and add them to the container
for (let i = 0; i < 1000; i++) {
  createAndInsertEmbeddedView(embeddedTView, i);
}

// run in the creation mode to set flags etc.
renderView(rootLView, rootTView, null);

// run change detection in the update mode
console.profile('update');
for (let i = 0; i < 20000; i++) {
  refreshView(rootLView, rootTView, rootTView.template, null);
}
console.profileEnd();