/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DefaultIterableDiffer, IterableChangeRecord, TrackByFunction} from '../../change_detection';
import {findMatchingDehydratedView} from '../../hydration/views';
import {assertDefined} from '../../util/assert';
import {assertLContainer, assertLView, assertTNode} from '../assert';
import {bindingUpdated} from '../bindings';
import {CONTAINER_HEADER_OFFSET, LContainer} from '../interfaces/container';
import {ComponentTemplate} from '../interfaces/definition';
import {TNode} from '../interfaces/node';
import {CONTEXT, DECLARATION_COMPONENT_VIEW, HEADER_OFFSET, LView, TVIEW, TView} from '../interfaces/view';
import {detachView} from '../node_manipulation';
import {getLView, nextBindingIndex} from '../state';
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
  const hostLView = getLView();
  const bindingIndex = nextBindingIndex();
  const lContainer = getLContainer(hostLView, HEADER_OFFSET + containerIndex);
  const viewInContainerIdx = 0;

  if (bindingUpdated(hostLView, bindingIndex, matchingTemplateIndex)) {
    // The index of the view to show changed - remove the previously displayed one
    // (it is a noop if there are no active views in a container).
    removeLViewFromLContainer(lContainer, viewInContainerIdx);

    // Index -1 is a special case where none of the conditions evaluates to
    // a truthy value and as the consequence we've got no view to show.
    if (matchingTemplateIndex !== -1) {
      const templateTNode = getExistingTNode(hostLView[TVIEW], matchingTemplateIndex);

      const dehydratedView = findMatchingDehydratedView(lContainer, templateTNode.tView!.ssrId);
      const embeddedLView =
          createAndRenderEmbeddedLView(hostLView, templateTNode, value, {dehydratedView});

      addLViewToLContainer(
          lContainer, embeddedLView, viewInContainerIdx,
          shouldAddViewToDom(templateTNode, dehydratedView));
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
  constructor(public hasEmptyBlock: boolean, public differ: DefaultIterableDiffer<unknown>) {}
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
 * @param trackByFn Reference to the tracking function.
 * @param trackByUsesComponentInstance Whether the tracking function has any references to the
 *  component instance. If it doesn't, we can avoid rebinding it.
 * @param emptyTemplateFn Reference to the template function of the empty block.
 * @param emptyDecls The number of nodes, local refs, and pipes for the empty block.
 * @param emptyVars The number of bindings for the empty block.
 *
 * @codeGenApi
 */
export function ɵɵrepeaterCreate(
    index: number, templateFn: ComponentTemplate<unknown>, decls: number, vars: number,
    trackByFn: TrackByFunction<unknown>, trackByUsesComponentInstance?: boolean,
    emptyTemplateFn?: ComponentTemplate<unknown>, emptyDecls?: number, emptyVars?: number): void {
  const hasEmptyBlock = emptyTemplateFn !== undefined;
  const hostLView = getLView();
  const boundTrackBy = trackByUsesComponentInstance ?
      // We only want to bind when necessary, because it produces a
      // new function. For pure functions it's not necessary.
      trackByFn.bind(hostLView[DECLARATION_COMPONENT_VIEW][CONTEXT]) :
      trackByFn;
  const metadata = new RepeaterMetadata(hasEmptyBlock, new DefaultIterableDiffer(boundTrackBy));
  hostLView[HEADER_OFFSET + index] = metadata;

  ɵɵtemplate(index + 1, templateFn, decls, vars);

  if (hasEmptyBlock) {
    ngDevMode &&
        assertDefined(emptyDecls, 'Missing number of declarations for the empty repeater block.');
    ngDevMode &&
        assertDefined(emptyVars, 'Missing number of bindings for the empty repeater block.');

    ɵɵtemplate(index + 2, emptyTemplateFn, emptyDecls!, emptyVars!);
  }
}

/**
 * The repeater instruction does update-time diffing of a provided collection (against the
 * collection seen previously) and maps changes in the collection to views structure (by adding,
 * removing or moving views as needed).
 * @param metadataSlotIdx - index in data where we can find an instance of RepeaterMetadata with
 *     additional information (ex. differ) needed to process collection diffing and view
 *     manipulation
 * @param collection - the collection instance to be checked for changes
 * @codeGenApi
 */
export function ɵɵrepeater(
    metadataSlotIdx: number, collection: Iterable<unknown>|undefined|null): void {
  const hostLView = getLView();
  const hostTView = hostLView[TVIEW];
  const metadata = hostLView[HEADER_OFFSET + metadataSlotIdx] as RepeaterMetadata;

  const differ = metadata.differ;
  const changes = differ.diff(collection);

  // handle repeater changes
  if (changes !== null) {
    const containerIndex = metadataSlotIdx + 1;
    const itemTemplateTNode = getExistingTNode(hostTView, containerIndex);
    const lContainer = getLContainer(hostLView, HEADER_OFFSET + containerIndex);
    let needsIndexUpdate = false;
    changes.forEachOperation(
        (item: IterableChangeRecord<unknown>, adjustedPreviousIndex: number|null,
         currentIndex: number|null) => {
          if (item.previousIndex === null) {
            // add
            const newViewIdx = adjustToLastLContainerIndex(lContainer, currentIndex);
            const dehydratedView =
                findMatchingDehydratedView(lContainer, itemTemplateTNode.tView!.ssrId);
            const embeddedLView = createAndRenderEmbeddedLView(
                hostLView, itemTemplateTNode,
                new RepeaterContext(lContainer, item.item, newViewIdx), {dehydratedView});
            addLViewToLContainer(
                lContainer, embeddedLView, newViewIdx,
                shouldAddViewToDom(itemTemplateTNode, dehydratedView));
            needsIndexUpdate = true;
          } else if (currentIndex === null) {
            // remove
            adjustedPreviousIndex = adjustToLastLContainerIndex(lContainer, adjustedPreviousIndex);
            removeLViewFromLContainer(lContainer, adjustedPreviousIndex);
            needsIndexUpdate = true;
          } else if (adjustedPreviousIndex !== null) {
            // move
            const existingLView =
                detachExistingView<RepeaterContext<unknown>>(lContainer, adjustedPreviousIndex);
            addLViewToLContainer(lContainer, existingLView, currentIndex);
            needsIndexUpdate = true;
          }
        });

    // A trackBy function might return the same value even if the underlying item changed - re-bind
    // it in the context.
    changes.forEachIdentityChange((record: IterableChangeRecord<unknown>) => {
      const viewIdx = adjustToLastLContainerIndex(lContainer, record.currentIndex);
      const lView = getExistingLViewFromLContainer<RepeaterContext<unknown>>(lContainer, viewIdx);
      lView[CONTEXT].$implicit = record.item;
    });

    // moves in the container might caused context's index to get out of order, re-adjust
    if (needsIndexUpdate) {
      for (let i = 0; i < lContainer.length - CONTAINER_HEADER_OFFSET; i++) {
        const lView = getExistingLViewFromLContainer<RepeaterContext<unknown>>(lContainer, i);
        lView[CONTEXT].$index = i;
      }
    }
  }

  // handle empty blocks
  const bindingIndex = nextBindingIndex();
  if (metadata.hasEmptyBlock) {
    const hasItemsInCollection = differ.length > 0;
    if (bindingUpdated(hostLView, bindingIndex, hasItemsInCollection)) {
      const emptyTemplateIndex = metadataSlotIdx + 2;
      const lContainer = getLContainer(hostLView, HEADER_OFFSET + emptyTemplateIndex);
      if (hasItemsInCollection) {
        removeLViewFromLContainer(lContainer, 0);
      } else {
        const emptyTemplateTNode = getExistingTNode(hostTView, emptyTemplateIndex);
        const dehydratedView =
            findMatchingDehydratedView(lContainer, emptyTemplateTNode.tView!.ssrId);
        const embeddedLView = createAndRenderEmbeddedLView(
            hostLView, emptyTemplateTNode, undefined, {dehydratedView});
        addLViewToLContainer(
            lContainer, embeddedLView, 0, shouldAddViewToDom(emptyTemplateTNode, dehydratedView));
      }
    }
  }
}

function getLContainer(lView: LView, index: number): LContainer {
  const lContainer = lView[index];
  ngDevMode && assertLContainer(lContainer);

  return lContainer;
}

function adjustToLastLContainerIndex(lContainer: LContainer, index: number|null): number {
  return index !== null ? index : lContainer.length - CONTAINER_HEADER_OFFSET;
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
  const tNode = getTNode(tView, index + HEADER_OFFSET);
  ngDevMode && assertTNode(tNode);

  return tNode;
}
