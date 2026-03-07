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
import {listenToDirectiveOutput} from '../view/directive_outputs';
import {listenToDomEvent, wrapListener} from '../view/listeners';
import {setAllInputsForProperty, setDirectiveInput} from './shared';

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
    const directiveDef = this.tView.data[this.tNode.customControlIndex] as DirectiveDef<unknown>;
    listenToDirectiveOutput(
      this.tNode,
      this.lView,
      directiveDef,
      outputName,
      wrapListener(this.tNode, this.lView, callback),
    );
  }

  listenToCustomControlModel(listener: (value: unknown) => void): void {
    const modelName =
      this.tNode.flags & TNodeFlags.isFormValueControl ? 'valueChange' : 'checkedChange';
    const directiveDef = this.tView.data[this.tNode.customControlIndex] as DirectiveDef<unknown>;
    listenToDirectiveOutput(
      this.tNode,
      this.lView,
      directiveDef,
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
    return setAllInputsForProperty(
      this.tNode,
      this.tView,
      this.lView,
      inputName,
      value,
      // Might be -1, but that's fine to pass for exclusion.
      this.tNode.controlDirectiveIndex,
    );
  }

  setCustomControlModelInput(value: unknown): void {
    const directiveDef = this.tView.data[this.tNode.customControlIndex] as DirectiveDef<{}>;
    const modelName = this.tNode.flags & TNodeFlags.isFormValueControl ? 'value' : 'checked';
    setDirectiveInput(this.tNode, this.tView, this.lView, directiveDef, modelName, value);
  }

  private _hasInputCache: {[key: string]: boolean} | undefined;

  customControlHasInput(inputName: string): boolean {
    this._hasInputCache ??= this._buildCustomControlInputCache();
    return this._hasInputCache[inputName] === true;
  }

  private _buildCustomControlInputCache(): {[key: string]: boolean} {
    const cache: {[key: string]: boolean} = {};
    if (this.tNode.customControlIndex === -1) {
      return cache;
    }
    const directiveDef = this.tView.data[this.tNode.customControlIndex] as DirectiveDef<unknown>;

    // First, add all inputs defined directly on the custom control directive.
    for (const key in directiveDef.inputs) {
      cache[key] = true;
    }

    // Next, gather inputs exposed by host directives recursively.
    if (directiveDef.hostDirectives !== null) {
      const queue = [...directiveDef.hostDirectives];
      while (queue.length > 0) {
        const hostDir = queue.shift()!;
        if (typeof hostDir === 'function') {
          // Factory function returning HostDirectiveConfig[]
          for (const config of hostDir()) {
            if (typeof config !== 'function') {
              if (config.inputs) {
                for (let i = 0; i < config.inputs.length; i += 2) {
                  const exposedName = config.inputs[i + 1] || config.inputs[i];
                  cache[exposedName] = true;
                }
              }
              const innerDef =
                typeof config.directive === 'function' && 'ɵdir' in config.directive
                  ? ((config.directive as any).ɵdir as DirectiveDef<unknown>)
                  : null;
              if (innerDef?.hostDirectives) {
                queue.push(...innerDef.hostDirectives);
              }
            }
          }
        } else {
          // HostDirectiveDef object
          for (const key in hostDir.inputs) {
            cache[hostDir.inputs[key]] = true;
          }
          const innerDef =
            typeof hostDir.directive === 'function' && 'ɵdir' in hostDir.directive
              ? ((hostDir.directive as any).ɵdir as DirectiveDef<unknown>)
              : null;
          if (innerDef?.hostDirectives) {
            queue.push(...innerDef.hostDirectives);
          }
        }
      }
    }

    return cache;
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
    // Host directives shouldn't be matched directly since their types are not in
    // `directiveToIndex`. We match them through their host component's `hostDirectiveInputs` instead.
    if (tNode.directiveToIndex && !tNode.directiveToIndex.has(directiveDef.type)) {
      continue;
    }
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

  if (
    tNode.hostDirectiveInputs !== null &&
    tNode.hostDirectiveOutputs !== null &&
    tNode.directiveToIndex !== null
  ) {
    const checkModel = (modelName: string, flag: TNodeFlags) => {
      const inputs = tNode.hostDirectiveInputs![modelName];
      const outputs = tNode.hostDirectiveOutputs![modelName + 'Change'];
      if (!inputs || !outputs) {
        return false;
      }

      for (let i = 0; i < inputs.length; i += 2) {
        const inputIndex = inputs[i] as number;
        for (let j = 0; j < outputs.length; j += 2) {
          const outputIndex = outputs[j] as number;
          if (inputIndex === outputIndex) {
            for (const data of tNode.directiveToIndex!.values()) {
              if (Array.isArray(data)) {
                const [hostIndex, start, end] = data;
                if (inputIndex >= start && inputIndex <= end) {
                  tNode.flags |= flag;
                  tNode.customControlIndex = hostIndex;
                  return true;
                }
              }
            }
          }
        }
      }
      return false;
    };

    if (checkModel('value', TNodeFlags.isFormValueControl)) {
      return;
    }
    if (checkModel('checked', TNodeFlags.isFormCheckboxControl)) {
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
