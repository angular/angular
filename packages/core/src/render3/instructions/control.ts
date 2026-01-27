/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {performanceMarkFeature} from '../../util/performance';
import {assertFirstCreatePass} from '../assert';
import type {ControlDirectiveHost} from '../interfaces/control';
import type {DirectiveDef} from '../interfaces/definition';
import {type TNode, TNodeFlags} from '../interfaces/node';
import {isComponentHost} from '../interfaces/type_checks';
import {type LView, RENDERER, type TView} from '../interfaces/view';
import {
  getCurrentTNode,
  getLView,
  getSelectedTNode,
  getTView,
  isInCheckNoChangesMode,
} from '../state';
import {debugStringifyTypeForError} from '../util/stringify_utils';
import {listenToOutput} from '../view/directive_outputs';
import {listenToDomEvent, wrapListener} from '../view/listeners';
import {writeToDirectiveInput} from './write_to_directive_input';

/**
 * Possibly sets up a {@link ɵFormFieldDirective} to manage a native or custom form control.
 *
 * Setup occurs if a `field` input is bound to a {@link ɵFormFieldDirective} on the current node,
 * but not to a component. If a `field` input is bound to a component, we assume the component
 * will manage the field in its own template.
 *
 * @codeGenApi
 */
export function ɵɵcontrolCreate(): void {
  controlCreateInternal();
}

export function controlCreateInternal(): void {
  const lView = getLView();
  const tView = getTView();
  const tNode = getCurrentTNode()!;

  if (tView.firstCreatePass) {
    initializeControlFirstCreatePass(tView, tNode, lView);
  }

  if (tNode.controlDirectiveIndex === -1) {
    return;
  }
  performanceMarkFeature('NgSignalForms');

  const instance = lView[tNode.controlDirectiveIndex];
  const controlDef = (tView.data[tNode.controlDirectiveIndex] as DirectiveDef<unknown>).controlDef!;
  controlDef.create(instance, new ControlDirectiveHostImpl(lView, tView, tNode));
}

/**
 * Calls the update function of the control directive at the given index.
 *
 * @codeGenApi
 */
export function ɵɵcontrol(): void {
  controlUpdateInternal();
}

export function controlUpdateInternal(): void {
  if (ngDevMode && isInCheckNoChangesMode()) {
    return;
  }

  const lView = getLView();
  const tView = getTView();
  const tNode = getSelectedTNode();

  if (tNode.controlDirectiveIndex === -1) {
    return;
  }

  const controlDef = (tView.data[tNode.controlDirectiveIndex] as DirectiveDef<unknown>).controlDef!;
  const instance = lView[tNode.controlDirectiveIndex];
  controlDef.update(instance, new ControlDirectiveHostImpl(lView, tView, tNode));
}

class ControlDirectiveHostImpl implements ControlDirectiveHost {
  private readonly lView: LView;
  private readonly tView: TView;
  private readonly tNode: TNode;

  readonly hasPassThrough: boolean;

  constructor(lView: LView, tView: TView, tNode: TNode) {
    this.lView = lView;
    this.tView = tView;
    this.tNode = tNode;
    this.hasPassThrough = !!(tNode.flags & TNodeFlags.isPassThroughControl);
  }

  get customControl(): unknown {
    return this.tNode.customControlIndex !== -1
      ? this.lView[this.tNode.customControlIndex]
      : undefined;
  }

  get descriptor(): string {
    if (ngDevMode && isComponentHost(this.tNode)) {
      const componentIndex = this.tNode.directiveStart + this.tNode.componentOffset;
      const componentDef = this.tView.data[componentIndex] as DirectiveDef<unknown>;
      return `Component ${debugStringifyTypeForError(componentDef.type)}`;
    }
    return `<${this.tNode.value}>`;
  }

  listenToCustomControlOutput(outputName: string, callback: (event: Event) => void): void {
    if (
      !hasOutput(
        this.tView.data[this.tNode.customControlIndex] as DirectiveDef<unknown>,
        outputName,
      )
    ) {
      return;
    }

    listenToOutput(
      this.tNode,
      this.lView,
      this.tNode.customControlIndex,
      outputName,
      outputName,
      wrapListener(this.tNode, this.lView, callback),
    );
  }

  listenToCustomControlModel(listener: (value: unknown) => void): void {
    const modelName =
      this.tNode.flags & TNodeFlags.isFormValueControl ? 'valueChange' : 'checkedChange';
    listenToOutput(
      this.tNode,
      this.lView,
      this.tNode.customControlIndex,
      modelName,
      modelName,
      wrapListener(this.tNode, this.lView, listener),
    );
  }

  listenToDom(eventName: string, listener: (event: Event) => void): void {
    listenToDomEvent(
      this.tNode,
      this.tView,
      this.lView as LView<{} | null>,
      undefined,
      this.lView[RENDERER],
      eventName,
      listener,
      wrapListener(this.tNode, this.lView, listener),
    );
  }

  setInputOnDirectives(inputName: string, value: unknown): boolean {
    const directiveIndices = this.tNode.inputs?.[inputName];
    if (!directiveIndices) {
      return false;
    }
    for (const index of directiveIndices) {
      const directiveDef = this.tView.data[index] as DirectiveDef<unknown>;
      const directive = this.lView[index];
      writeToDirectiveInput(directiveDef, directive, inputName, value);
    }
    return true;
  }

  setCustomControlModelInput(value: unknown): void {
    const directive = this.lView[this.tNode.customControlIndex];
    const directiveDef = this.tView.data[this.tNode.customControlIndex] as DirectiveDef<{}>;
    const modelName = this.tNode.flags & TNodeFlags.isFormValueControl ? 'value' : 'checked';
    writeToDirectiveInput(directiveDef, directive, modelName, value);
  }

  customControlHasInput(inputName: string): boolean {
    if (this.tNode.customControlIndex === -1) {
      return false;
    }
    const directiveDef = this.tView.data[this.tNode.customControlIndex] as DirectiveDef<unknown>;
    return directiveDef.inputs[inputName] != undefined;
  }
}

function initializeControlFirstCreatePass(tView: TView, tNode: TNode, lView: LView): void {
  ngDevMode && assertFirstCreatePass(tView);

  for (let i = tNode.directiveStart; i < tNode.directiveEnd; i++) {
    const directiveDef = tView.data[i] as DirectiveDef<unknown>;
    if (directiveDef.controlDef) {
      tNode.controlDirectiveIndex = i;
      break;
    }
  }

  if (tNode.controlDirectiveIndex === -1) {
    // No control directive found on this element.
    return;
  }

  const controlDef = (tView.data[tNode.controlDirectiveIndex] as DirectiveDef<unknown>).controlDef!;
  if (controlDef.passThroughInput) {
    // This control directive has a `passThroughInput` property binding.
    if ((tNode.inputs?.[controlDef.passThroughInput]?.length ?? 0) > 1) {
      // Another directive has bound `controlDef.passThroughInput`.
      tNode.flags |= TNodeFlags.isPassThroughControl;
      return;
    }
  }

  initializeCustomControlStatus(tView, tNode);
}

/**
 * Determines whether a custom form control (with a `value` or `checked` model input) is present
 * on the current `TNode` during the first creation pass.
 *
 * If a custom control is found, the function sets the appropriate `TNodeFlags` and stores its
 * index.
 *
 * @param tView The `TView` of the current view.
 * @param tNode The `TNode` to inspect for a custom control.
 * @returns `true` if a custom control is found, `false` otherwise.
 */
function initializeCustomControlStatus(tView: TView, tNode: TNode): void {
  for (let i = tNode.directiveStart; i < tNode.directiveEnd; i++) {
    const directiveDef = tView.data[i] as DirectiveDef<unknown>;
    if (hasModelInput(directiveDef, 'value')) {
      tNode.flags |= TNodeFlags.isFormValueControl;
      tNode.customControlIndex = i;
      return;
    }
    if (hasModelInput(directiveDef, 'checked')) {
      tNode.flags |= TNodeFlags.isFormCheckboxControl;
      tNode.customControlIndex = i;
      return;
    }
  }
}

/**
 * Returns whether the specified `directiveDef` has a model-like input named `name`.
 *
 * A model-like input is an input-output pair where the input is named `name` and the output is
 * named `name + 'Change'`.
 */
function hasModelInput(directiveDef: DirectiveDef<unknown>, name: string): boolean {
  return hasInput(directiveDef, name) && hasOutput(directiveDef, name + 'Change');
}

/** Returns whether the specified `directiveDef` has an input named `name`.*/
function hasInput(directiveDef: DirectiveDef<unknown>, name: string): boolean {
  return name in directiveDef.inputs;
}

/** Returns whether the specified `directiveDef` has an output named `name`. */
function hasOutput(directiveDef: DirectiveDef<unknown>, name: string): boolean {
  return name in directiveDef.outputs;
}
