/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {Type} from '../../interface/type';
import {EMPTY_OBJ} from '../../util/empty';
import {DirectiveDef} from '../interfaces/definition';
import {TContainerNode, TElementContainerNode, TElementNode} from '../interfaces/node';
import {LView, TView} from '../interfaces/view';

/** Values that can be used to define a host directive through the `HostDirectivesFeature`. */
type HostDirectiveDefiniton = Type<unknown>|{
  directive: Type<unknown>;
  inputs?: string[];
  outputs?: string[];
};

/**
 * This feature add the host directives behavior to a directive definition by patching a
 * function onto it. The expectation is that the runtime will invoke the function during
 * directive matching.
 *
 * For example:
 * ```ts
 * class ComponentWithHostDirective {
 *   static ɵcmp = defineComponent({
 *    type: ComponentWithHostDirective,
 *    features: [ɵɵHostDirectivesFeature([
 *      SimpleHostDirective,
 *      {directive: AdvancedHostDirective, inputs: ['foo: alias'], outputs: ['bar']},
 *    ])]
 *  });
 * }
 * ```
 *
 * @codeGenApi
 */
export function ɵɵHostDirectivesFeature(rawHostDirectives: HostDirectiveDefiniton[]|
                                        (() => HostDirectiveDefiniton[])) {
  const unwrappedHostDirectives =
      Array.isArray(rawHostDirectives) ? rawHostDirectives : rawHostDirectives();
  const hostDirectives = unwrappedHostDirectives.map(
      dir => typeof dir === 'function' ? {directive: dir, inputs: EMPTY_OBJ, outputs: EMPTY_OBJ} : {
        directive: dir.directive,
        inputs: bindingArrayToMap(dir.inputs),
        outputs: bindingArrayToMap(dir.outputs)
      });

  return (definition: DirectiveDef<unknown>) => {
    // TODO(crisbeto): implement host directive matching logic.
    definition.applyHostDirectives =
        (tView: TView, viewData: LView, tNode: TElementNode|TContainerNode|TElementContainerNode,
         matches: any[]) => {};
  };
}

/**
 * Converts an array in the form of `['publicName', 'alias', 'otherPublicName', 'otherAlias']` into
 * a map in the form of `{publicName: 'alias', otherPublicName: 'otherAlias'}`.
 */
function bindingArrayToMap(bindings: string[]|undefined) {
  if (!bindings || bindings.length === 0) {
    return EMPTY_OBJ;
  }

  const result: {[publicName: string]: string} = {};

  for (let i = 1; i < bindings.length; i += 2) {
    result[bindings[i - 1]] = bindings[i];
  }

  return result;
}
