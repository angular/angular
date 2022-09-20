/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {resolveForwardRef} from '../../di';
import {Type} from '../../interface/type';
import {EMPTY_OBJ} from '../../util/empty';
import {getDirectiveDef} from '../definition';
import {DirectiveDef} from '../interfaces/definition';
import {TContainerNode, TElementContainerNode, TElementNode} from '../interfaces/node';
import {LView, TView} from '../interfaces/view';

/** Values that can be used to define a host directive through the `HostDirectivesFeature`. */
type HostDirectiveConfig = Type<unknown>|{
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
export function ɵɵHostDirectivesFeature(rawHostDirectives: HostDirectiveConfig[]|
                                        (() => HostDirectiveConfig[])) {
  return (definition: DirectiveDef<unknown>) => {
    definition.findHostDirectiveDefs = findHostDirectiveDefs;
    definition.hostDirectives =
        (Array.isArray(rawHostDirectives) ? rawHostDirectives : rawHostDirectives()).map(dir => {
          return typeof dir === 'function' ?
              {directive: resolveForwardRef(dir), inputs: EMPTY_OBJ, outputs: EMPTY_OBJ} :
              {
                directive: resolveForwardRef(dir.directive),
                inputs: bindingArrayToMap(dir.inputs),
                outputs: bindingArrayToMap(dir.outputs)
              };
        });
  };
}

function findHostDirectiveDefs(
    matches: DirectiveDef<unknown>[], def: DirectiveDef<unknown>, tView: TView, lView: LView,
    tNode: TElementNode|TContainerNode|TElementContainerNode): void {
  if (def.hostDirectives !== null) {
    // Iterate in reverse so the directive that declares
    // the host directives preserves its original order.
    for (let i = def.hostDirectives.length - 1; i > -1; i--) {
      const hostDirectiveConfig = def.hostDirectives[i];
      const hostDirectiveDef = getDirectiveDef(hostDirectiveConfig.directive)!;

      // Host directives execute before the host so that its host bindings can be overwritten.
      matches.unshift(hostDirectiveDef);
      findHostDirectiveDefs(matches, hostDirectiveDef, tView, lView, tNode);
    }
  }
}

/**
 * Converts an array in the form of `['publicName', 'alias', 'otherPublicName', 'otherAlias']` into
 * a map in the form of `{publicName: 'alias', otherPublicName: 'otherAlias'}`.
 */
function bindingArrayToMap(bindings: string[]|undefined) {
  if (bindings === undefined || bindings.length === 0) {
    return EMPTY_OBJ;
  }

  const result: {[publicName: string]: string} = {};

  for (let i = 0; i < bindings.length; i += 2) {
    result[bindings[i]] = bindings[i + 1];
  }

  return result;
}
