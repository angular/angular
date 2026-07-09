/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '../../di/injector';
import {InternalInjectFlags} from '../../di/interface/injector';
import {
  CONTENT_ADAPTER,
  ForeignComponent,
  GET_CONTEXT,
  ON_DESTROY,
  RENDER,
} from '../../interface/foreign_component';
import {assertDefined, assertNotSame} from '../../util/assert';
import {assertLContainer} from '../assert';
import {collectNativeNodes} from '../collect_native_nodes';
import {attachPatchData} from '../context_discovery';
import {getOrCreateInjectable} from '../di';
import {nativeInsertBefore} from '../dom_node_manipulation';
import {FOREIGN_CONTEXT} from '../foreign_context';
import {createForeignView} from '../foreign_view';
import {CONTAINER_HEADER_OFFSET, LContainer, LContainerFlags} from '../interfaces/container';
import {TContainerNode, TNodeType} from '../interfaces/node';
import {Renderer} from '../interfaces/renderer';
import {RNode} from '../interfaces/renderer_dom';
import {isDestroyed} from '../interfaces/type_checks';
import {FLAGS, HEADER_OFFSET, LView, RENDERER, TVIEW} from '../interfaces/view';
import {appendChild} from '../node_manipulation';
import {getLView, getTView, setCurrentTNode, setCurrentTNodeAsNotParent} from '../state';
import {getOrCreateTNode} from '../tnode_manipulation';
import {getConstant} from '../util/view_utils';
import {addToEndOfViewTree} from '../view/construction';
import {addLViewToLContainer, createLContainer, removeLViewFromLContainer} from '../view/container';
import {createAndRenderEmbeddedLView} from '../view_manipulation';

/**
 * Creation phase instruction to render a foreign component.
 *
 * @param index The index of the container in the data array.
 * @param foreignComponentIndex The index of the matched foreign component in the constant pool.
 * @param props Aggregate properties and static attributes.
 * @codeGenApi
 */
export function ɵɵforeignComponent(
  index: number,
  foreignComponentIndex: number,
  props?: any,
): void {
  const lView = getLView();
  const tView = getTView();
  const adjustedIndex = index + HEADER_OFFSET;
  const foreignComponent = getConstant<ForeignComponent<any, any>>(
    tView.consts,
    foreignComponentIndex,
  )!;

  // 1. Get or create TNode for this container slot
  let tNode: TContainerNode;
  if (tView.firstCreatePass) {
    tNode = getOrCreateTNode(tView, adjustedIndex, TNodeType.Container, null, null);
    // `getOrCreateTNode` unconditionally sets the current node as a parent node, which it is not.
    setCurrentTNodeAsNotParent();
  } else {
    tNode = tView.data[adjustedIndex] as TContainerNode;
    setCurrentTNode(tNode, false);
  }

  // 2. Create the anchor node in the DOM
  const renderer = lView[RENDERER] as Renderer;
  const comment = renderer.createComment(ngDevMode ? 'foreign-component' : '');
  appendChild(tView, lView, comment, tNode);
  attachPatchData(comment, lView);

  // 3. Create the hosting LContainer
  const lContainer = createLContainer(comment, lView, comment, tNode);
  lView[adjustedIndex] = lContainer;
  addToEndOfViewTree(lView, lContainer);

  // 4. Create the Foreign View and insert it at index 0 of the container
  const viewRef = createForeignView(lContainer, 0);

  // 5. Resolve context and call the RENDER function to get the nodes and DisposeFn
  // Context is optional because foreign components may not require context or a FOREIGN_CONTEXT
  // provider might not be configured in the component/element injector hierarchy.
  const context = getOrCreateInjectable(
    tNode,
    lView,
    FOREIGN_CONTEXT,
    InternalInjectFlags.Optional,
  );
  const [nodes, dispose] = foreignComponent[RENDER](props, context ?? undefined);

  // 6. Insert the returned nodes into the foreign view, between its head and tail comment anchors.
  const tail = viewRef.tail as RNode;
  const parent = tail.parentNode;
  if (parent) {
    for (let i = 0; i < nodes.length; i++) {
      nativeInsertBefore(renderer, parent, nodes[i], tail, false);
    }
  }

  // 7. Register the DisposeFn in the foreign view's LView destroy hooks.
  if (dispose) {
    viewRef.onDestroy(dispose);
  }
}

/**
 * Reusable injector class that intercepts requests for {@link FOREIGN_CONTEXT} during
 * embedded view creation and returns the captured runtime context.
 */
class ForeignContextInjector implements Injector {
  constructor(private context: unknown) {}

  get(token: any, notFoundValue?: any): any {
    return token === FOREIGN_CONTEXT ? this.context : notFoundValue;
  }
}

/**
 * Resolves container and foreign component metadata for foreign content projection instructions.
 */
function resolveForeignContentContainer(
  index: number,
  foreignComponentConstIndex: number,
): [LView, LContainer, TContainerNode, ForeignComponent<any, any>] {
  const lView = getLView();
  const adjustedIndex = index + HEADER_OFFSET;

  // The template is already declared at adjustedIndex, so lContainer must exist.
  const lContainer = lView[adjustedIndex] as LContainer;
  ngDevMode && assertLContainer(lContainer);
  lContainer[FLAGS] |= LContainerFlags.LogicalOnly;

  const tView = getTView();
  const tNode = tView.data[adjustedIndex] as TContainerNode;
  const foreignComponent = getConstant<ForeignComponent<any, any>>(
    tView.consts,
    foreignComponentConstIndex,
  )!;
  ngDevMode &&
    assertDefined(foreignComponent, 'Foreign component must be defined in constant pool.');

  return [lView, lContainer, tNode, foreignComponent];
}

/**
 * Creation phase instruction to render foreign content (children of a foreign component)
 * and extract its root DOM nodes.
 *
 * @param index The index of the container in the data array.
 * @param foreignComponentConstIndex The index of the matched foreign component in the constant pool.
 * @codeGenApi
 */
export function ɵɵforeignContent(index: number, foreignComponentConstIndex: number): any {
  const [lView, lContainer, tNode, foreignComponent] = resolveForeignContentContainer(
    index,
    foreignComponentConstIndex,
  );
  const adapter = foreignComponent[CONTENT_ADAPTER];
  const onDestroy = foreignComponent[ON_DESTROY];
  const getContext = foreignComponent[GET_CONTEXT];

  const producer = () => {
    const options = getContext
      ? {embeddedViewInjector: new ForeignContextInjector(getContext())}
      : undefined;

    // Instantiate and render the embedded view inside the container, but do not add its elements to
    // the DOM at the container anchor since the nodes will be projected into a foreign view.
    const embeddedLView = createAndRenderEmbeddedLView(lView, tNode, null, options);
    addLViewToLContainer(
      lContainer,
      embeddedLView,
      lContainer.length - CONTAINER_HEADER_OFFSET,
      /* addToDOM */ false,
    );

    onDestroy(() => {
      if (!isDestroyed(embeddedLView)) {
        const embeddedLViewIndex = lContainer.indexOf(embeddedLView, CONTAINER_HEADER_OFFSET);
        ngDevMode && assertNotSame(embeddedLViewIndex, -1, 'Embedded view not found in container');
        removeLViewFromLContainer(lContainer, embeddedLViewIndex - CONTAINER_HEADER_OFFSET);
      }
    });

    // Extract and return the root nodes of the created view
    const embeddedTView = embeddedLView[TVIEW];
    return collectNativeNodes(embeddedTView, embeddedLView, embeddedTView.firstChild, []);
  };

  return adapter(producer);
}

/**
 * Creation phase instruction to return a function for rendering foreign content dynamically
 * with arguments.
 *
 * @param index The index of the container in the data array.
 * @param foreignComponentConstIndex The index of the matched foreign component in the constant pool.
 * @codeGenApi
 */
export function ɵɵforeignContentFn(
  index: number,
  foreignComponentConstIndex: number,
): (...args: any[]) => any {
  const [lView, lContainer, tNode, foreignComponent] = resolveForeignContentContainer(
    index,
    foreignComponentConstIndex,
  );
  const adapter = foreignComponent[CONTENT_ADAPTER];
  const onDestroy = foreignComponent[ON_DESTROY];
  const getContext = foreignComponent[GET_CONTEXT];

  return (...args: any[]) => {
    const producer = () => {
      const options = getContext
        ? {embeddedViewInjector: new ForeignContextInjector(getContext())}
        : undefined;

      // When the function is called, instantiate and render a new embedded view inside the container.
      // The arguments are passed directly as the context of the view.
      const embeddedLView = createAndRenderEmbeddedLView(lView, tNode, args, options);

      addLViewToLContainer(
        lContainer,
        embeddedLView,
        lContainer.length - CONTAINER_HEADER_OFFSET,
        /* addToDOM */ false,
      );

      onDestroy(() => {
        if (!isDestroyed(embeddedLView)) {
          const embeddedLViewIndex = lContainer.indexOf(embeddedLView, CONTAINER_HEADER_OFFSET);
          ngDevMode &&
            assertNotSame(embeddedLViewIndex, -1, 'Embedded view not found in container');
          removeLViewFromLContainer(lContainer, embeddedLViewIndex - CONTAINER_HEADER_OFFSET);
        }
      });

      const embeddedTView = embeddedLView[TVIEW];
      return collectNativeNodes(embeddedTView, embeddedLView, embeddedTView.firstChild, []);
    };

    return adapter(producer);
  };
}
