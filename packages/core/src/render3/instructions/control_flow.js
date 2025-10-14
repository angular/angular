/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {setActiveConsumer} from '../../../primitives/signals';
import {formatRuntimeError} from '../../errors';
import {
  findAndReconcileMatchingDehydratedViews,
  findMatchingDehydratedView,
} from '../../hydration/views';
import {assertDefined, assertFunction} from '../../util/assert';
import {performanceMarkFeature} from '../../util/performance';
import {assertLContainer, assertLView, assertTNode} from '../assert';
import {bindingUpdated} from '../bindings';
import {CONTAINER_HEADER_OFFSET} from '../interfaces/container';
import {
  ANIMATIONS,
  CONTEXT,
  DECLARATION_COMPONENT_VIEW,
  HEADER_OFFSET,
  HYDRATION,
  TVIEW,
} from '../interfaces/view';
import {LiveCollection, reconcile} from '../list_reconciliation';
import {destroyLView} from '../node_manipulation';
import {getLView, getSelectedIndex, getTView, nextBindingIndex} from '../state';
import {NO_CHANGE} from '../tokens';
import {getConstant, getTNode} from '../util/view_utils';
import {createAndRenderEmbeddedLView, shouldAddViewToDom} from '../view_manipulation';
import {declareNoDirectiveHostTemplate} from './template';
import {
  addLViewToLContainer,
  detachView,
  getLViewFromLContainer,
  removeLViewFromLContainer,
} from '../view/container';
import {removeDehydratedViews} from '../../hydration/cleanup';
/**
 * Creates an LContainer for an ng-template representing a root node
 * of control flow (@if, @switch). We use this to explicitly set
 * flags on the TNode created to identify which nodes are in control
 * flow or starting control flow for hydration identification and
 * cleanup timing.
 *
 * @param index The index of the container in the data array
 * @param templateFn Inline template
 * @param decls The number of nodes, local refs, and pipes for this template
 * @param vars The number of bindings for this template
 * @param tagName The name of the container element, if applicable
 * @param attrsIndex Index of template attributes in the `consts` array.
 * @param localRefs Index of the local references in the `consts` array.
 * @param localRefExtractor A function which extracts local-refs values from the template.
 *        Defaults to the current element associated with the local-ref.
 * @codeGenApi
 */
export function ɵɵconditionalCreate(
  index,
  templateFn,
  decls,
  vars,
  tagName,
  attrsIndex,
  localRefsIndex,
  localRefExtractor,
) {
  performanceMarkFeature('NgControlFlow');
  const lView = getLView();
  const tView = getTView();
  const attrs = getConstant(tView.consts, attrsIndex);
  declareNoDirectiveHostTemplate(
    lView,
    tView,
    index,
    templateFn,
    decls,
    vars,
    tagName,
    attrs,
    256 /* TNodeFlags.isControlFlowStart */,
    localRefsIndex,
    localRefExtractor,
  );
  return ɵɵconditionalBranchCreate;
}
/**
 * Creates an LContainer for an ng-template representing a branch
 * of control flow (@else, @case, @default). We use this to explicitly
 * set flags on the TNode created to identify which nodes are in
 * control flow or starting control flow for hydration identification
 * and cleanup timing.
 *
 * @param index The index of the container in the data array
 * @param templateFn Inline template
 * @param decls The number of nodes, local refs, and pipes for this template
 * @param vars The number of bindings for this template
 * @param tagName The name of the container element, if applicable
 * @param attrsIndex Index of template attributes in the `consts` array.
 * @param localRefs Index of the local references in the `consts` array.
 * @param localRefExtractor A function which extracts local-refs values from the template.
 *        Defaults to the current element associated with the local-ref.
 * @codeGenApi
 */
export function ɵɵconditionalBranchCreate(
  index,
  templateFn,
  decls,
  vars,
  tagName,
  attrsIndex,
  localRefsIndex,
  localRefExtractor,
) {
  performanceMarkFeature('NgControlFlow');
  const lView = getLView();
  const tView = getTView();
  const attrs = getConstant(tView.consts, attrsIndex);
  declareNoDirectiveHostTemplate(
    lView,
    tView,
    index,
    templateFn,
    decls,
    vars,
    tagName,
    attrs,
    512 /* TNodeFlags.isInControlFlow */,
    localRefsIndex,
    localRefExtractor,
  );
  return ɵɵconditionalBranchCreate;
}
/**
 * The conditional instruction represents the basic building block on the runtime side to support
 * built-in "if" and "switch". On the high level this instruction is responsible for adding and
 * removing views selected by a conditional expression.
 *
 * @param matchingTemplateIndex Index of a template TNode representing a conditional view to be
 *     inserted; -1 represents a special case when there is no view to insert.
 * @param contextValue Value that should be exposed as the context of the conditional.
 * @codeGenApi
 */
export function ɵɵconditional(matchingTemplateIndex, contextValue) {
  performanceMarkFeature('NgControlFlow');
  const hostLView = getLView();
  const bindingIndex = nextBindingIndex();
  const prevMatchingTemplateIndex =
    hostLView[bindingIndex] !== NO_CHANGE ? hostLView[bindingIndex] : -1;
  const prevContainer =
    prevMatchingTemplateIndex !== -1
      ? getLContainer(hostLView, HEADER_OFFSET + prevMatchingTemplateIndex)
      : undefined;
  const viewInContainerIdx = 0;
  if (bindingUpdated(hostLView, bindingIndex, matchingTemplateIndex)) {
    const prevConsumer = setActiveConsumer(null);
    try {
      // The index of the view to show changed - remove the previously displayed one
      // (it is a noop if there are no active views in a container).
      if (prevContainer !== undefined) {
        removeLViewFromLContainer(prevContainer, viewInContainerIdx);
      }
      // Index -1 is a special case where none of the conditions evaluates to
      // a truthy value and as the consequence we've got no view to show.
      if (matchingTemplateIndex !== -1) {
        const nextLContainerIndex = HEADER_OFFSET + matchingTemplateIndex;
        const nextContainer = getLContainer(hostLView, nextLContainerIndex);
        const templateTNode = getExistingTNode(hostLView[TVIEW], nextLContainerIndex);
        const dehydratedView = findAndReconcileMatchingDehydratedViews(
          nextContainer,
          templateTNode,
          hostLView,
        );
        const embeddedLView = createAndRenderEmbeddedLView(hostLView, templateTNode, contextValue, {
          dehydratedView,
        });
        addLViewToLContainer(
          nextContainer,
          embeddedLView,
          viewInContainerIdx,
          shouldAddViewToDom(templateTNode, dehydratedView),
        );
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  } else if (prevContainer !== undefined) {
    // We might keep displaying the same template but the actual value of the expression could have
    // changed - re-bind in context.
    const lView = getLViewFromLContainer(prevContainer, viewInContainerIdx);
    if (lView !== undefined) {
      lView[CONTEXT] = contextValue;
    }
  }
}
export class RepeaterContext {
  constructor(lContainer, $implicit, $index) {
    this.lContainer = lContainer;
    this.$implicit = $implicit;
    this.$index = $index;
  }
  get $count() {
    return this.lContainer.length - CONTAINER_HEADER_OFFSET;
  }
}
/**
 * A built-in trackBy function used for situations where users specified collection index as a
 * tracking expression. Having this function body in the runtime avoids unnecessary code generation.
 *
 * @param index
 * @returns
 */
export function ɵɵrepeaterTrackByIndex(index) {
  return index;
}
/**
 * A built-in trackBy function used for situations where users specified collection item reference
 * as a tracking expression. Having this function body in the runtime avoids unnecessary code
 * generation.
 *
 * @param index
 * @returns
 */
export function ɵɵrepeaterTrackByIdentity(_, value) {
  return value;
}
class RepeaterMetadata {
  constructor(hasEmptyBlock, trackByFn, liveCollection) {
    this.hasEmptyBlock = hasEmptyBlock;
    this.trackByFn = trackByFn;
    this.liveCollection = liveCollection;
  }
}
/**
 * The repeaterCreate instruction runs in the creation part of the template pass and initializes
 * internal data structures required by the update pass of the built-in repeater logic. Repeater
 * metadata are allocated in the data part of LView with the following layout:
 * - LView[HEADER_OFFSET + index] - metadata
 * - LView[HEADER_OFFSET + index + 1] - reference to a template function rendering an item
 * - LView[HEADER_OFFSET + index + 2] - optional reference to a template function rendering an empty
 * block
 *
 * @param index Index at which to store the metadata of the repeater.
 * @param templateFn Reference to the template of the main repeater block.
 * @param decls The number of nodes, local refs, and pipes for the main block.
 * @param vars The number of bindings for the main block.
 * @param tagName The name of the container element, if applicable
 * @param attrsIndex Index of template attributes in the `consts` array.
 * @param trackByFn Reference to the tracking function.
 * @param trackByUsesComponentInstance Whether the tracking function has any references to the
 *  component instance. If it doesn't, we can avoid rebinding it.
 * @param emptyTemplateFn Reference to the template function of the empty block.
 * @param emptyDecls The number of nodes, local refs, and pipes for the empty block.
 * @param emptyVars The number of bindings for the empty block.
 * @param emptyTagName The name of the empty block container element, if applicable
 * @param emptyAttrsIndex Index of the empty block template attributes in the `consts` array.
 *
 * @codeGenApi
 */
export function ɵɵrepeaterCreate(
  index,
  templateFn,
  decls,
  vars,
  tagName,
  attrsIndex,
  trackByFn,
  trackByUsesComponentInstance,
  emptyTemplateFn,
  emptyDecls,
  emptyVars,
  emptyTagName,
  emptyAttrsIndex,
) {
  performanceMarkFeature('NgControlFlow');
  ngDevMode &&
    assertFunction(
      trackByFn,
      `A track expression must be a function, was ${typeof trackByFn} instead.`,
    );
  const lView = getLView();
  const tView = getTView();
  const hasEmptyBlock = emptyTemplateFn !== undefined;
  const hostLView = getLView();
  const boundTrackBy = trackByUsesComponentInstance
    ? // We only want to bind when necessary, because it produces a
      // new function. For pure functions it's not necessary.
      trackByFn.bind(hostLView[DECLARATION_COMPONENT_VIEW][CONTEXT])
    : trackByFn;
  const metadata = new RepeaterMetadata(hasEmptyBlock, boundTrackBy);
  hostLView[HEADER_OFFSET + index] = metadata;
  declareNoDirectiveHostTemplate(
    lView,
    tView,
    index + 1,
    templateFn,
    decls,
    vars,
    tagName,
    getConstant(tView.consts, attrsIndex),
    256 /* TNodeFlags.isControlFlowStart */,
  );
  if (hasEmptyBlock) {
    ngDevMode &&
      assertDefined(emptyDecls, 'Missing number of declarations for the empty repeater block.');
    ngDevMode &&
      assertDefined(emptyVars, 'Missing number of bindings for the empty repeater block.');
    declareNoDirectiveHostTemplate(
      lView,
      tView,
      index + 2,
      emptyTemplateFn,
      emptyDecls,
      emptyVars,
      emptyTagName,
      getConstant(tView.consts, emptyAttrsIndex),
      512 /* TNodeFlags.isInControlFlow */,
    );
  }
}
function isViewExpensiveToRecreate(lView) {
  // assumption: anything more than a text node with a binding is considered "expensive"
  return lView.length - HEADER_OFFSET > 2;
}
class OperationsCounter {
  constructor() {
    this.created = 0;
    this.destroyed = 0;
  }
  reset() {
    this.created = 0;
    this.destroyed = 0;
  }
  recordCreate() {
    this.created++;
  }
  recordDestroy() {
    this.destroyed++;
  }
  /**
   * A method indicating if the entire collection was re-created as part of the reconciliation pass.
   * Used to warn developers about the usage of a tracking function that might result in excessive
   * amount of view creation / destroy operations.
   *
   * @returns boolean value indicating if a live collection was re-created
   */
  wasReCreated(collectionLen) {
    return collectionLen > 0 && this.created === this.destroyed && this.created === collectionLen;
  }
}
class LiveCollectionLContainerImpl extends LiveCollection {
  constructor(lContainer, hostLView, templateTNode) {
    super();
    this.lContainer = lContainer;
    this.hostLView = hostLView;
    this.templateTNode = templateTNode;
    this.operationsCounter = ngDevMode ? new OperationsCounter() : undefined;
    /**
         Property indicating if indexes in the repeater context need to be updated following the live
         collection changes. Index updates are necessary if and only if views are inserted / removed in
         the middle of LContainer. Adds and removals at the end don't require index updates.
       */
    this.needsIndexUpdate = false;
  }
  get length() {
    return this.lContainer.length - CONTAINER_HEADER_OFFSET;
  }
  at(index) {
    return this.getLView(index)[CONTEXT].$implicit;
  }
  attach(index, lView) {
    const dehydratedView = lView[HYDRATION];
    this.needsIndexUpdate || (this.needsIndexUpdate = index !== this.length);
    addLViewToLContainer(
      this.lContainer,
      lView,
      index,
      shouldAddViewToDom(this.templateTNode, dehydratedView),
    );
  }
  detach(index, skipLeaveAnimations) {
    this.needsIndexUpdate || (this.needsIndexUpdate = index !== this.length - 1);
    if (skipLeaveAnimations) setSkipLeaveAnimations(this.lContainer, index);
    return detachExistingView(this.lContainer, index);
  }
  create(index, value) {
    const dehydratedView = findMatchingDehydratedView(
      this.lContainer,
      this.templateTNode.tView.ssrId,
    );
    const embeddedLView = createAndRenderEmbeddedLView(
      this.hostLView,
      this.templateTNode,
      new RepeaterContext(this.lContainer, value, index),
      {dehydratedView},
    );
    this.operationsCounter?.recordCreate();
    return embeddedLView;
  }
  destroy(lView) {
    destroyLView(lView[TVIEW], lView);
    this.operationsCounter?.recordDestroy();
  }
  updateValue(index, value) {
    this.getLView(index)[CONTEXT].$implicit = value;
  }
  reset() {
    this.needsIndexUpdate = false;
    this.operationsCounter?.reset();
  }
  updateIndexes() {
    if (this.needsIndexUpdate) {
      for (let i = 0; i < this.length; i++) {
        this.getLView(i)[CONTEXT].$index = i;
      }
    }
  }
  getLView(index) {
    return getExistingLViewFromLContainer(this.lContainer, index);
  }
}
/**
 * The repeater instruction does update-time diffing of a provided collection (against the
 * collection seen previously) and maps changes in the collection to views structure (by adding,
 * removing or moving views as needed).
 * @param collection - the collection instance to be checked for changes
 * @codeGenApi
 */
export function ɵɵrepeater(collection) {
  const prevConsumer = setActiveConsumer(null);
  const metadataSlotIdx = getSelectedIndex();
  try {
    const hostLView = getLView();
    const hostTView = hostLView[TVIEW];
    const metadata = hostLView[metadataSlotIdx];
    const containerIndex = metadataSlotIdx + 1;
    const lContainer = getLContainer(hostLView, containerIndex);
    if (metadata.liveCollection === undefined) {
      const itemTemplateTNode = getExistingTNode(hostTView, containerIndex);
      metadata.liveCollection = new LiveCollectionLContainerImpl(
        lContainer,
        hostLView,
        itemTemplateTNode,
      );
    } else {
      metadata.liveCollection.reset();
    }
    const liveCollection = metadata.liveCollection;
    reconcile(liveCollection, collection, metadata.trackByFn);
    // Warn developers about situations where the entire collection was re-created as part of the
    // reconciliation pass. Note that this warning might be "overreacting" and report cases where
    // the collection re-creation is the intended behavior. Still, the assumption is that most of
    // the time it is undesired.
    if (
      ngDevMode &&
      metadata.trackByFn === ɵɵrepeaterTrackByIdentity &&
      liveCollection.operationsCounter?.wasReCreated(liveCollection.length) &&
      isViewExpensiveToRecreate(getExistingLViewFromLContainer(lContainer, 0))
    ) {
      const message = formatRuntimeError(
        -956 /* RuntimeErrorCode.LOOP_TRACK_RECREATE */,
        `The configured tracking expression (track by identity) caused re-creation of the entire collection of size ${liveCollection.length}. ` +
          'This is an expensive operation requiring destruction and subsequent creation of DOM nodes, directives, components etc. ' +
          'Please review the "track expression" and make sure that it uniquely identifies items in a collection.',
      );
      console.warn(message);
    }
    // moves in the container might caused context's index to get out of order, re-adjust if needed
    liveCollection.updateIndexes();
    // handle empty blocks
    if (metadata.hasEmptyBlock) {
      const bindingIndex = nextBindingIndex();
      const isCollectionEmpty = liveCollection.length === 0;
      if (bindingUpdated(hostLView, bindingIndex, isCollectionEmpty)) {
        const emptyTemplateIndex = metadataSlotIdx + 2;
        const lContainerForEmpty = getLContainer(hostLView, emptyTemplateIndex);
        if (isCollectionEmpty) {
          const emptyTemplateTNode = getExistingTNode(hostTView, emptyTemplateIndex);
          const dehydratedView = findAndReconcileMatchingDehydratedViews(
            lContainerForEmpty,
            emptyTemplateTNode,
            hostLView,
          );
          const embeddedLView = createAndRenderEmbeddedLView(
            hostLView,
            emptyTemplateTNode,
            undefined,
            {dehydratedView},
          );
          addLViewToLContainer(
            lContainerForEmpty,
            embeddedLView,
            0,
            shouldAddViewToDom(emptyTemplateTNode, dehydratedView),
          );
        } else {
          // we know that an ssrId was generated for the empty template, but
          // we were unable to match it to a dehydrated view earlier, which
          // means that we may have changed branches between server and client.
          // We'll need to find and remove the stale empty template view.
          if (hostTView.firstUpdatePass) {
            removeDehydratedViews(lContainerForEmpty);
          }
          removeLViewFromLContainer(lContainerForEmpty, 0);
        }
      }
    }
  } finally {
    setActiveConsumer(prevConsumer);
  }
}
function getLContainer(lView, index) {
  const lContainer = lView[index];
  ngDevMode && assertLContainer(lContainer);
  return lContainer;
}
function setSkipLeaveAnimations(lContainer, index) {
  if (lContainer.length <= CONTAINER_HEADER_OFFSET) return;
  const indexInContainer = CONTAINER_HEADER_OFFSET + index;
  const viewToDetach = lContainer[indexInContainer];
  if (viewToDetach && viewToDetach[ANIMATIONS]) {
    viewToDetach[ANIMATIONS].skipLeaveAnimations = true;
  }
}
function detachExistingView(lContainer, index) {
  const existingLView = detachView(lContainer, index);
  ngDevMode && assertLView(existingLView);
  return existingLView;
}
function getExistingLViewFromLContainer(lContainer, index) {
  const existingLView = getLViewFromLContainer(lContainer, index);
  ngDevMode && assertLView(existingLView);
  return existingLView;
}
function getExistingTNode(tView, index) {
  const tNode = getTNode(tView, index);
  ngDevMode && assertTNode(tNode);
  return tNode;
}
//# sourceMappingURL=control_flow.js.map
