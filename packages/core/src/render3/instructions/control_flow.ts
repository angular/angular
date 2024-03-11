/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {setActiveConsumer} from '@angular/core/primitives/signals';

import {TrackByFunction} from '../../change_detection';
import {DehydratedContainerView} from '../../hydration/interfaces';
import {findMatchingDehydratedView} from '../../hydration/views';
import {assertDefined, assertFunction} from '../../util/assert';
import {performanceMarkFeature} from '../../util/performance';
import {assertLContainer, assertLView, assertTNode} from '../assert';
import {bindingUpdated} from '../bindings';
import {CONTAINER_HEADER_OFFSET, LContainer} from '../interfaces/container';
import {ComponentTemplate} from '../interfaces/definition';
import {TNode} from '../interfaces/node';
import {CONTEXT, DECLARATION_COMPONENT_VIEW, HEADER_OFFSET, HYDRATION, LView, TVIEW, TView} from '../interfaces/view';
import {LiveCollection, reconcile} from '../list_reconciliation';
import {destroyLView, detachView} from '../node_manipulation';
import {getLView, getSelectedIndex, nextBindingIndex} from '../state';
import {getTNode} from '../util/view_utils';
import {addLViewToLContainer, createAndRenderEmbeddedLView, getLViewFromLContainer, removeLViewFromLContainer, shouldAddViewToDom} from '../view_manipulation';

import {ɵɵtemplate} from './template';

/**
 * The conditional instruction represents the basic building block on the runtime side to support
 * built-in "if" and "switch". On the high level this instruction is responsible for adding and
 * removing views selected by a conditional expression.
 *
 * @param containerIndex index of a container in a host view (indexed from HEADER_OFFSET) where
 *     conditional views should be inserted.
 * @param matchingTemplateIndex index of a template TNode representing a conditional view to be
 *     inserted; -1 represents a special case when there is no view to insert.
 * @codeGenApi
 */
export function ɵɵconditional<T>(containerIndex: number, matchingTemplateIndex: number, value?: T) {
  performanceMarkFeature('NgControlFlow');

  const hostLView = getLView();
  const bindingIndex = nextBindingIndex();
  const lContainer = getLContainer(hostLView, HEADER_OFFSET + containerIndex);
  const viewInContainerIdx = 0;

  if (bindingUpdated(hostLView, bindingIndex, matchingTemplateIndex)) {
    const prevConsumer = setActiveConsumer(null);
    try {
      // The index of the view to show changed - remove the previously displayed one
      // (it is a noop if there are no active views in a container).
      removeLViewFromLContainer(lContainer, viewInContainerIdx);

      // Index -1 is a special case where none of the conditions evaluates to
      // a truthy value and as the consequence we've got no view to show.
      if (matchingTemplateIndex !== -1) {
        const templateTNode =
            getExistingTNode(hostLView[TVIEW], HEADER_OFFSET + matchingTemplateIndex);

        const dehydratedView = findMatchingDehydratedView(lContainer, templateTNode.tView!.ssrId);
        const embeddedLView =
            createAndRenderEmbeddedLView(hostLView, templateTNode, value, {dehydratedView});

        addLViewToLContainer(
            lContainer, embeddedLView, viewInContainerIdx,
            shouldAddViewToDom(templateTNode, dehydratedView));
      }
    } finally {
      setActiveConsumer(prevConsumer);
    }
  } else {
    // We might keep displaying the same template but the actual value of the expression could have
    // changed - re-bind in context.
    const lView = getLViewFromLContainer<T|undefined>(lContainer, viewInContainerIdx);
    if (lView !== undefined) {
      lView[CONTEXT] = value;
    }
  }
}

export class RepeaterContext<T> {
  constructor(private lContainer: LContainer, public $implicit: T, public $index: number) {}

  get $count(): number {
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
export function ɵɵrepeaterTrackByIndex(index: number) {
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
export function ɵɵrepeaterTrackByIdentity<T>(_: number, value: T) {
  return value;
}

class RepeaterMetadata {
  constructor(
      public hasEmptyBlock: boolean, public trackByFn: TrackByFunction<unknown>,
      public liveCollection?: LiveCollectionLContainerImpl) {}
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
    index: number, templateFn: ComponentTemplate<unknown>, decls: number, vars: number,
    tagName: string|null, attrsIndex: number|null, trackByFn: TrackByFunction<unknown>,
    trackByUsesComponentInstance?: boolean, emptyTemplateFn?: ComponentTemplate<unknown>,
    emptyDecls?: number, emptyVars?: number, emptyTagName?: string|null,
    emptyAttrsIndex?: number|null): void {
  performanceMarkFeature('NgControlFlow');

  ngDevMode &&
      assertFunction(
          trackByFn, `A track expression must be a function, was ${typeof trackByFn} instead.`);

  const hasEmptyBlock = emptyTemplateFn !== undefined;
  const hostLView = getLView();
  const boundTrackBy = trackByUsesComponentInstance ?
      // We only want to bind when necessary, because it produces a
      // new function. For pure functions it's not necessary.
      trackByFn.bind(hostLView[DECLARATION_COMPONENT_VIEW][CONTEXT]) :
      trackByFn;
  const metadata = new RepeaterMetadata(hasEmptyBlock, boundTrackBy);
  hostLView[HEADER_OFFSET + index] = metadata;

  ɵɵtemplate(index + 1, templateFn, decls, vars, tagName, attrsIndex);

  if (hasEmptyBlock) {
    ngDevMode &&
        assertDefined(emptyDecls, 'Missing number of declarations for the empty repeater block.');
    ngDevMode &&
        assertDefined(emptyVars, 'Missing number of bindings for the empty repeater block.');

    ɵɵtemplate(index + 2, emptyTemplateFn, emptyDecls!, emptyVars!, emptyTagName, emptyAttrsIndex);
  }
}

class LiveCollectionLContainerImpl extends
    LiveCollection<LView<RepeaterContext<unknown>>, unknown> {
  /**
   Property indicating if indexes in the repeater context need to be updated following the live
   collection changes. Index updates are necessary if and only if views are inserted / removed in
   the middle of LContainer. Adds and removals at the end don't require index updates.
 */
  private needsIndexUpdate = false;
  constructor(
      private lContainer: LContainer, private hostLView: LView, private templateTNode: TNode) {
    super();
  }

  override get length(): number {
    return this.lContainer.length - CONTAINER_HEADER_OFFSET;
  }
  override at(index: number): unknown {
    return this.getLView(index)[CONTEXT].$implicit;
  }
  override attach(index: number, lView: LView<RepeaterContext<unknown>>): void {
    const dehydratedView = lView[HYDRATION] as DehydratedContainerView;
    this.needsIndexUpdate ||= index !== this.length;
    addLViewToLContainer(
        this.lContainer, lView, index, shouldAddViewToDom(this.templateTNode, dehydratedView));
  }
  override detach(index: number): LView<RepeaterContext<unknown>> {
    this.needsIndexUpdate ||= index !== this.length - 1;
    return detachExistingView<RepeaterContext<unknown>>(this.lContainer, index);
  }
  override create(index: number, value: unknown): LView<RepeaterContext<unknown>> {
    const dehydratedView =
        findMatchingDehydratedView(this.lContainer, this.templateTNode.tView!.ssrId);
    const embeddedLView = createAndRenderEmbeddedLView(
        this.hostLView, this.templateTNode, new RepeaterContext(this.lContainer, value, index),
        {dehydratedView});

    return embeddedLView;
  }
  override destroy(lView: LView<RepeaterContext<unknown>>): void {
    destroyLView(lView[TVIEW], lView);
  }
  override updateValue(index: number, value: unknown): void {
    this.getLView(index)[CONTEXT].$implicit = value;
  }

  reset() {
    this.needsIndexUpdate = false;
  }

  updateIndexes() {
    if (this.needsIndexUpdate) {
      for (let i = 0; i < this.length; i++) {
        this.getLView(i)[CONTEXT].$index = i;
      }
    }
  }

  private getLView(index: number): LView<RepeaterContext<unknown>> {
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
export function ɵɵrepeater(collection: Iterable<unknown>|undefined|null): void {
  const prevConsumer = setActiveConsumer(null);
  const metadataSlotIdx = getSelectedIndex();
  try {
    const hostLView = getLView();
    const hostTView = hostLView[TVIEW];
    const metadata = hostLView[metadataSlotIdx] as RepeaterMetadata;

    if (metadata.liveCollection === undefined) {
      const containerIndex = metadataSlotIdx + 1;
      const lContainer = getLContainer(hostLView, containerIndex);
      const itemTemplateTNode = getExistingTNode(hostTView, containerIndex);
      metadata.liveCollection =
          new LiveCollectionLContainerImpl(lContainer, hostLView, itemTemplateTNode);
    } else {
      metadata.liveCollection.reset();
    }

    const liveCollection = metadata.liveCollection;
    reconcile(liveCollection, collection, metadata.trackByFn);

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
          const dehydratedView =
              findMatchingDehydratedView(lContainerForEmpty, emptyTemplateTNode.tView!.ssrId);
          const embeddedLView = createAndRenderEmbeddedLView(
              hostLView, emptyTemplateTNode, undefined, {dehydratedView});
          addLViewToLContainer(
              lContainerForEmpty, embeddedLView, 0,
              shouldAddViewToDom(emptyTemplateTNode, dehydratedView));
        } else {
          removeLViewFromLContainer(lContainerForEmpty, 0);
        }
      }
    }
  } finally {
    setActiveConsumer(prevConsumer);
  }
}

function getLContainer(lView: LView, index: number): LContainer {
  const lContainer = lView[index];
  ngDevMode && assertLContainer(lContainer);

  return lContainer;
}

function detachExistingView<T>(lContainer: LContainer, index: number): LView<T> {
  const existingLView = detachView(lContainer, index);
  ngDevMode && assertLView(existingLView);

  return existingLView as LView<T>;
}

function getExistingLViewFromLContainer<T>(lContainer: LContainer, index: number): LView<T> {
  const existingLView = getLViewFromLContainer<T>(lContainer, index);
  ngDevMode && assertLView(existingLView);

  return existingLView!;
}

function getExistingTNode(tView: TView, index: number): TNode {
  const tNode = getTNode(tView, index);
  ngDevMode && assertTNode(tNode);

  return tNode;
}
