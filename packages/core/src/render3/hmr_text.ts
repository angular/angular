/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {updateTextNode} from './dom_node_manipulation';
import {ComponentDef, ComponentTemplate, HmrTextView} from './interfaces/definition';
import {getHmrLViews} from './interfaces/lview_tracking';
import {isTNodeShape, TNode, TNodeType} from './interfaces/node';
import {RText} from './interfaces/renderer_dom';
import {isDestroyed} from './interfaces/type_checks';
import {HEADER_OFFSET, LView, RENDERER, TView} from './interfaces/view';
import {getNativeByIndex} from './util/view_utils';

interface TextUpdate {
  tNode: TNode;
  value: string;
  nodes: [LView, RText][];
}

interface ViewUpdate {
  view: TView;
  template: ComponentTemplate<any>;
}

/** Prepares a text-only update without mutating the old view tree. */
export function prepareHmrTextUpdate(
  oldDef: ComponentDef<unknown>,
  newDef: ComponentDef<unknown>,
): ((definition: ComponentDef<unknown>) => void) | null {
  const tView = oldDef.tView;
  const before = oldDef.hmrText;
  const after = newDef.hmrText;
  if (
    tView === null ||
    tView.firstCreatePass ||
    tView.template !== oldDef.template ||
    before === undefined ||
    after === undefined ||
    before[1] !== after[1] ||
    before[2] !== after[2] ||
    !metadataEqual(before[0], after[0])
  ) {
    return null;
  }
  try {
    if (!definitionsMatch(oldDef, newDef) || !metadataEqual(before[4](), after[4]())) {
      return null;
    }
  } catch {
    // Custom metadata can be opaque at runtime. Let ordinary HMR handle it.
    return null;
  }

  const textUpdates: TextUpdate[] = [];
  const viewUpdates: ViewUpdate[] = [];
  const changes = {hasTextChange: false};
  if (
    !collectUpdates(
      tView,
      newDef.template,
      before[3],
      after[3],
      textUpdates,
      viewUpdates,
      changes,
    ) ||
    !changes.hasTextChange
  ) {
    return null;
  }

  return (definition) => {
    definition.tView = tView;
    for (const {view, template} of viewUpdates) {
      view.template = template;
    }
    for (const {tNode, value, nodes} of textUpdates) {
      tNode.value = value;
      for (const [view, node] of nodes) {
        updateTextNode(view[RENDERER], node, value);
      }
    }
  };
}

function collectUpdates(
  tView: TView | null,
  template: ComponentTemplate<any>,
  before: HmrTextView,
  after: HmrTextView,
  textUpdates: TextUpdate[],
  viewUpdates: ViewUpdate[],
  changes: {hasTextChange: boolean},
): boolean {
  const [oldDecls, oldVars, oldText, oldChildren] = before;
  const [decls, vars, text, children] = after;
  if (
    tView?.incompleteFirstPass ||
    oldDecls !== decls ||
    oldVars !== vars ||
    oldText.length !== text.length ||
    oldChildren.length !== children.length
  ) {
    return false;
  }

  const liveViews =
    tView !== null && !tView.firstCreatePass
      ? [...getHmrLViews(tView)].filter((v) => !isDestroyed(v))
      : [];
  for (let i = 0; i < text.length; i++) {
    const [index, value] = text[i];
    const [oldIndex, oldValue] = oldText[i];
    if (index !== oldIndex) {
      return false;
    }
    if (value === oldValue) {
      continue;
    }
    changes.hasTextChange = true;
    if (tView === null || tView.firstCreatePass) {
      continue;
    }

    const slot = index + HEADER_OFFSET;
    const tNode = tView.data[slot];
    if (!isTNodeShape(tNode) || tNode.type !== TNodeType.Text || tNode.value !== oldValue) {
      return false;
    }
    const nodes: TextUpdate['nodes'] = [];
    for (const view of liveViews) {
      const node = getNativeByIndex(slot, view);
      if ((node as unknown as Node | null)?.nodeType !== 3 /* TEXT_NODE */) {
        return false;
      }
      nodes.push([view, node as RText]);
    }
    textUpdates.push({tNode, value, nodes});
  }

  for (let i = 0; i < children.length; i++) {
    const [index, childTemplate, child] = children[i];
    const [oldIndex, oldTemplate, oldChild] = oldChildren[i];
    if (index !== oldIndex) {
      return false;
    }
    let childTView: TView | null = null;
    if (tView !== null && !tView.firstCreatePass) {
      const declaration = tView.data[index + HEADER_OFFSET];
      if (
        !isTNodeShape(declaration) ||
        declaration.type !== TNodeType.Container ||
        declaration.tView?.template !== oldTemplate
      ) {
        return false;
      }
      childTView = declaration.tView;
    }
    if (
      !collectUpdates(childTView, childTemplate, oldChild, child, textUpdates, viewUpdates, changes)
    ) {
      return false;
    }
  }
  if (tView !== null) {
    viewUpdates.push({view: tView, template});
  }
  return true;
}

// These fields either hold instance state or are accounted for by the compiler metadata above.
const HMR_TEXT_FIELDS = new Set<keyof ComponentDef<unknown>>([
  'tView',
  'template',
  'hmrText',
  'viewQuery',
  'factory',
  'getStandaloneInjector',
  'debugInfo',
]);

function definitionsMatch(before: ComponentDef<unknown>, after: ComponentDef<unknown>): boolean {
  const keys = new Set([
    ...Object.keys(before),
    ...Object.keys(after),
  ] as (keyof ComponentDef<unknown>)[]);
  for (const key of keys) {
    if (!HMR_TEXT_FIELDS.has(key) && !metadataEqual(before[key], after[key])) {
      return false;
    }
  }
  return true;
}

function metadataEqual(a: unknown, b: unknown, ancestors = new Set<object>()): boolean {
  if (Object.is(a, b)) {
    return true;
  }
  if (
    a === null ||
    b === null ||
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    ancestors.has(a)
  ) {
    return false;
  }
  const prototype = Object.getPrototypeOf(a);
  if (
    prototype !== Object.getPrototypeOf(b) ||
    (prototype !== null && prototype !== Object.prototype && prototype !== Array.prototype)
  ) {
    return false;
  }
  const keys = Reflect.ownKeys(a);
  if (keys.length !== Reflect.ownKeys(b).length) {
    return false;
  }
  ancestors.add(a);
  const equal = keys.every((key) => {
    const previous = Object.getOwnPropertyDescriptor(a, key)!;
    const next = Object.getOwnPropertyDescriptor(b, key);
    return (
      next !== undefined &&
      'value' in previous &&
      'value' in next &&
      metadataEqual(previous.value, next.value, ancestors)
    );
  });
  ancestors.delete(a);
  return equal;
}
