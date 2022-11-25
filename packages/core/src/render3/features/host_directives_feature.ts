/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {resolveForwardRef} from '../../di';
import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {Type} from '../../interface/type';
import {assertEqual} from '../../util/assert';
import {EMPTY_OBJ} from '../../util/empty';
import {getComponentDef, getDirectiveDef} from '../definition';
import {DirectiveDef, HostDirectiveBindingMap, HostDirectiveDef, HostDirectiveDefs} from '../interfaces/definition';

/** Values that can be used to define a host directive through the `HostDirectivesFeature`. */
type HostDirectiveConfig = Type<unknown>|{
  directive: Type<unknown>;
  inputs?: string[];
  outputs?: string[];
};

/**
 * This feature adds the host directives behavior to a directive definition by patching a
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
    currentDef: DirectiveDef<unknown>, matchedDefs: DirectiveDef<unknown>[],
    hostDirectiveDefs: HostDirectiveDefs): void {
  if (currentDef.hostDirectives !== null) {
    for (const hostDirectiveConfig of currentDef.hostDirectives) {
      const hostDirectiveDef = getDirectiveDef(hostDirectiveConfig.directive)!;

      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        validateHostDirective(hostDirectiveConfig, hostDirectiveDef, matchedDefs);
      }

      // We need to patch the `declaredInputs` so that
      // `ngOnChanges` can map the properties correctly.
      patchDeclaredInputs(hostDirectiveDef.declaredInputs, hostDirectiveConfig.inputs);

      // Host directives execute before the host so that its host bindings can be overwritten.
      findHostDirectiveDefs(hostDirectiveDef, matchedDefs, hostDirectiveDefs);
      hostDirectiveDefs.set(hostDirectiveDef, hostDirectiveConfig);
      matchedDefs.push(hostDirectiveDef);
    }
  }
}

/**
 * Converts an array in the form of `['publicName', 'alias', 'otherPublicName', 'otherAlias']` into
 * a map in the form of `{publicName: 'alias', otherPublicName: 'otherAlias'}`.
 */
function bindingArrayToMap(bindings: string[]|undefined): HostDirectiveBindingMap {
  if (bindings === undefined || bindings.length === 0) {
    return EMPTY_OBJ;
  }

  const result: HostDirectiveBindingMap = {};

  for (let i = 0; i < bindings.length; i += 2) {
    result[bindings[i]] = bindings[i + 1];
  }

  return result;
}

/**
 * `ngOnChanges` has some leftover legacy ViewEngine behavior where the keys inside the
 * `SimpleChanges` event refer to the *declared* name of the input, not its public name or its
 * minified name. E.g. in `@Input('alias') foo: string`, the name in the `SimpleChanges` object
 * will always be `foo`, and not `alias` or the minified name of `foo` in apps using property
 * minification.
 *
 * This is achieved through the `DirectiveDef.declaredInputs` map that is constructed when the
 * definition is declared. When a property is written to the directive instance, the
 * `NgOnChangesFeature` will try to remap the property name being written to using the
 * `declaredInputs`.
 *
 * Since the host directive input remapping happens during directive matching, `declaredInputs`
 * won't contain the new alias that the input is available under. This function addresses the
 * issue by patching the host directive aliases to the `declaredInputs`. There is *not* a risk of
 * this patching accidentally introducing new inputs to the host directive, because `declaredInputs`
 * is used *only* by the `NgOnChangesFeature` when determining what name is used in the
 * `SimpleChanges` object which won't be reached if an input doesn't exist.
 */
function patchDeclaredInputs(
    declaredInputs: Record<string, string>, exposedInputs: HostDirectiveBindingMap): void {
  for (const publicName in exposedInputs) {
    if (exposedInputs.hasOwnProperty(publicName)) {
      const remappedPublicName = exposedInputs[publicName];
      const privateName = declaredInputs[publicName];

      // We *technically* shouldn't be able to hit this case because we can't have multiple
      // inputs on the same property and we have validations against conflicting aliases in
      // `validateMappings`. If we somehow did, it would lead to `ngOnChanges` being invoked
      // with the wrong name so we have a non-user-friendly assertion here just in case.
      if ((typeof ngDevMode === 'undefined' || ngDevMode) &&
          declaredInputs.hasOwnProperty(remappedPublicName)) {
        assertEqual(
            declaredInputs[remappedPublicName], declaredInputs[publicName],
            `Conflicting host directive input alias ${publicName}.`);
      }

      declaredInputs[remappedPublicName] = privateName;
    }
  }
}

/**
 * Verifies that the host directive has been configured correctly.
 * @param hostDirectiveConfig Host directive configuration object.
 * @param directiveDef Directive definition of the host directive.
 * @param matchedDefs Directives that have been matched so far.
 */
function validateHostDirective(
    hostDirectiveConfig: HostDirectiveDef<unknown>, directiveDef: DirectiveDef<any>|null,
    matchedDefs: DirectiveDef<unknown>[]): asserts directiveDef is DirectiveDef<unknown> {
  const type = hostDirectiveConfig.directive;

  if (directiveDef === null) {
    if (getComponentDef(type) !== null) {
      throw new RuntimeError(
          RuntimeErrorCode.HOST_DIRECTIVE_COMPONENT,
          `Host directive ${type.name} cannot be a component.`);
    }

    throw new RuntimeError(
        RuntimeErrorCode.HOST_DIRECTIVE_UNRESOLVABLE,
        `Could not resolve metadata for host directive ${type.name}. ` +
            `Make sure that the ${type.name} class is annotated with an @Directive decorator.`);
  }

  if (!directiveDef.standalone) {
    throw new RuntimeError(
        RuntimeErrorCode.HOST_DIRECTIVE_NOT_STANDALONE,
        `Host directive ${directiveDef.type.name} must be standalone.`);
  }

  if (matchedDefs.indexOf(directiveDef) > -1) {
    throw new RuntimeError(
        RuntimeErrorCode.DUPLICATE_DIRECTITVE,
        `Directive ${directiveDef.type.name} matches multiple times on the same element. ` +
            `Directives can only match an element once.`);
  }

  validateMappings('input', directiveDef, hostDirectiveConfig.inputs);
  validateMappings('output', directiveDef, hostDirectiveConfig.outputs);
}

/**
 * Checks that the host directive inputs/outputs configuration is valid.
 * @param bindingType Kind of binding that is being validated. Used in the error message.
 * @param def Definition of the host directive that is being validated against.
 * @param hostDirectiveBindings Host directive mapping object that shold be validated.
 */
function validateMappings(
    bindingType: 'input'|'output', def: DirectiveDef<unknown>,
    hostDirectiveBindings: HostDirectiveBindingMap) {
  const className = def.type.name;
  const bindings: Record<string, string> = bindingType === 'input' ? def.inputs : def.outputs;

  for (const publicName in hostDirectiveBindings) {
    if (hostDirectiveBindings.hasOwnProperty(publicName)) {
      if (!bindings.hasOwnProperty(publicName)) {
        throw new RuntimeError(
            RuntimeErrorCode.HOST_DIRECTIVE_UNDEFINED_BINDING,
            `Directive ${className} does not have an ${bindingType} with a public name of ${
                publicName}.`);
      }

      const remappedPublicName = hostDirectiveBindings[publicName];

      if (bindings.hasOwnProperty(remappedPublicName) &&
          bindings[remappedPublicName] !== publicName) {
        throw new RuntimeError(
            RuntimeErrorCode.HOST_DIRECTIVE_CONFLICTING_ALIAS,
            `Cannot alias ${bindingType} ${publicName} of host directive ${className} to ${
                remappedPublicName}, because it already has a different ${
                bindingType} with the same public name.`);
      }
    }
  }
}
