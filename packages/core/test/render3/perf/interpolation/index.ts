import {ɵɵelementEnd, ɵɵelementStart} from '../../../../src/render3/instructions/element';
import {ɵɵselect} from '../../../../src/render3/instructions/select';
import {addToViewTree, createLContainer, createLView, createTNode, createTView, getOrCreateTNode, refreshView, renderView} from '../../../../src/render3/instructions/shared';
import {ɵɵtext} from '../../../../src/render3/instructions/text';
import {ɵɵtextInterpolate} from '../../../../src/render3/instructions/text_interpolation';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TNodeType, TViewNode} from '../../../../src/render3/interfaces/node';
import {ProceduralRenderer3, RComment, RElement, RNode, RText, Renderer3, RendererFactory3, RendererStyleFlags3} from '../../../../src/render3/interfaces/renderer';
import {LViewFlags, TView} from '../../../../src/render3/interfaces/view';
import {insertView} from '../../../../src/render3/node_manipulation';

class WebWorkerRenderNode implements RNode, RComment, RText {
  textContent: string|null = null;
  parentNode: RNode|null = null;
  parentElement: RElement|null = null;
  nextSibling: RNode|null = null;
  removeChild(oldChild: RNode): RNode { return oldChild; }
  insertBefore(newChild: RNode, refChild: RNode|null, isViewRoot: boolean): void {}
  appendChild(newChild: RNode): RNode { return newChild; }
}

class NoopRenderer implements ProceduralRenderer3 {
  destroy(): void { throw new Error('Method not implemented.'); }
  createComment(value: string): RComment { return new WebWorkerRenderNode(); }
  createElement(name: string, namespace?: string|null|undefined): RElement {
    return new WebWorkerRenderNode() as any as RElement;
  }
  createText(value: string): RText { return new WebWorkerRenderNode(); }
  destroyNode?: ((node: RNode) => void)|null|undefined;
  appendChild(parent: RElement, newChild: RNode): void {}
  insertBefore(parent: RNode, newChild: RNode, refChild: RNode|null): void {}
  removeChild(parent: RElement, oldChild: RNode, isHostElement?: boolean|undefined): void {}
  selectRootElement(selectorOrNode: any): RElement { throw new Error('Method not implemented.'); }
  parentNode(node: RNode): RElement|null { throw new Error('Method not implemented.'); }
  nextSibling(node: RNode): RNode|null { throw new Error('Method not implemented.'); }
  setAttribute(el: RElement, name: string, value: string, namespace?: string|null|undefined): void {
    throw new Error('Method not implemented.');
  }
  removeAttribute(el: RElement, name: string, namespace?: string|null|undefined): void {
    throw new Error('Method not implemented.');
  }
  addClass(el: RElement, name: string): void { throw new Error('Method not implemented.'); }
  removeClass(el: RElement, name: string): void { throw new Error('Method not implemented.'); }
  setStyle(el: RElement, style: string, value: any, flags?: RendererStyleFlags3|undefined): void {
    throw new Error('Method not implemented.');
  }
  removeStyle(el: RElement, style: string, flags?: RendererStyleFlags3|undefined): void {
    throw new Error('Method not implemented.');
  }
  setProperty(el: RElement, name: string, value: any): void {
    throw new Error('Method not implemented.');
  }
  setValue(node: RComment|RText, value: string): void { node.textContent = value; }
  listen(
      target: RNode|'document'|'window'|'body', eventName: string,
      callback: (event: any) => boolean | void): () => void {
    throw new Error('Method not implemented.');
  }
}

class NoopRendererFactory implements RendererFactory3 {
  createRenderer(hostElement: RElement|null, rendererType: null): Renderer3 {
    return new NoopRenderer();
  }
}

/* @Component({
  selector: 'test',
  template: `
    <ng-template>
      <div>
        <button>{{'0'}}</button>
        <button>{{'1'}}</button>
        <button>{{'2'}}</button>
        <button>{{'3'}}</button>
        <button>{{'4'}}</button>
        <button>{{'5'}}</button>
        <button>{{'6'}}</button>
        <button>{{'7'}}</button>
        <button>{{'8'}}</button>
        <button>{{'9'}}</button>
      </div>
    </ng-template>`
})
class TestComponent {
} */



function TestInterpolationComponent_ng_template_0_Template(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelementStart(0, 'div');
    ɵɵelementStart(1, 'button');
    ɵɵtext(2);
    ɵɵelementEnd();
    ɵɵelementStart(3, 'button');
    ɵɵtext(4);
    ɵɵelementEnd();
    ɵɵelementStart(5, 'button');
    ɵɵtext(6);
    ɵɵelementEnd();
    ɵɵelementStart(7, 'button');
    ɵɵtext(8);
    ɵɵelementEnd();
    ɵɵelementStart(9, 'button');
    ɵɵtext(10);
    ɵɵelementEnd();
    ɵɵelementStart(11, 'button');
    ɵɵtext(12);
    ɵɵelementEnd();
    ɵɵelementStart(13, 'button');
    ɵɵtext(14);
    ɵɵelementEnd();
    ɵɵelementStart(15, 'button');
    ɵɵtext(16);
    ɵɵelementEnd();
    ɵɵelementStart(17, 'button');
    ɵɵtext(18);
    ɵɵelementEnd();
    ɵɵelementStart(19, 'button');
    ɵɵtext(20);
    ɵɵelementEnd();
    ɵɵelementEnd();
  }
  if (rf & 2) {
    ɵɵselect(2);
    ɵɵtextInterpolate('0');
    ɵɵselect(4);
    ɵɵtextInterpolate('1');
    ɵɵselect(6);
    ɵɵtextInterpolate('2');
    ɵɵselect(8);
    ɵɵtextInterpolate('3');
    ɵɵselect(10);
    ɵɵtextInterpolate('4');
    ɵɵselect(12);
    ɵɵtextInterpolate('5');
    ɵɵselect(14);
    ɵɵtextInterpolate('6');
    ɵɵselect(16);
    ɵɵtextInterpolate('7');
    ɵɵselect(18);
    ɵɵtextInterpolate('8');
    ɵɵselect(20);
    ɵɵtextInterpolate('9');
  }
}


const mockRNode = new WebWorkerRenderNode();

// Create a root view
const rootTView = createTView(-1, null, 1, 0, null, null, null, null);
const tContainerNode = getOrCreateTNode(rootTView, null, 0, TNodeType.Container, null, null);
const rootLView = createLView(
    null, rootTView, {}, LViewFlags.CheckAlways | LViewFlags.IsRoot, null, null,
    new NoopRendererFactory(), new NoopRenderer());
const lContainer =
    createLContainer(mockRNode as RComment, rootLView, mockRNode as RComment, tContainerNode, true);
addToViewTree(rootLView, lContainer);

const embeddedTView = createTView(
    -1, TestInterpolationComponent_ng_template_0_Template, 21, 10, null, null, null, null);

function createAndInsertEmbeddedView(tView: TView, index: number) {
  const viewTNode = createTNode(rootTView, null, TNodeType.View, -1, null, null) as TViewNode;
  const embeddedLView = createLView(
      rootLView, tView, {}, LViewFlags.CheckAlways, null, viewTNode, new NoopRendererFactory(),
      new NoopRenderer());
  renderView(embeddedLView, embeddedTView, null);
  insertView(embeddedLView, lContainer, index);
}

// create embedded views and add them to the container
for (let i = 0; i < 1000; i++) {
  createAndInsertEmbeddedView(embeddedTView, i);
}
// run in the creation mode to set flags etc.
renderView(rootLView, rootTView, null);

// run change detection in the update mode
console.profile('update');
for (let i = 0; i < 5000; i++) {
  refreshView(rootLView, rootTView, null, null);
}
console.profileEnd();