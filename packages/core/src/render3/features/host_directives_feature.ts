/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {resolveForwardRef} from '../../di';
import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {assertEqual} from '../../util/assert';
import {EMPTY_OBJ} from '../../util/empty';
import {getComponentDef, getDirectiveDef} from '../def_getters';
import {isComponentDef} from '../interfaces/type_checks';
import type {
  DirectiveDef,
  DirectiveDefFeature,
  HostDirectiveBindingMap,
  HostDirectiveConfig,
  HostDirectiveDef,
  HostDirectiveDefs,
  HostDirectiveRanges,
  HostDirectiveResolution,
} from '../interfaces/definition';

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
export function ɵɵHostDirectivesFeature(
  rawHostDirectives: HostDirectiveConfig[] | (() => HostDirectiveConfig[]),
) {
  const feature: DirectiveDefFeature = (definition: DirectiveDef<unknown>) => {
    const isEager = Array.isArray(rawHostDirectives);

    if (definition.hostDirectives === null) {
      definition.resolveHostDirectives = resolveHostDirectives;
      definition.hostDirectives = isEager
        ? rawHostDirectives.map(createHostDirectiveDef)
        : [rawHostDirectives];
    } else if (isEager) {
      definition.hostDirectives.unshift(...rawHostDirectives.map(createHostDirectiveDef));
    } else {
      definition.hostDirectives.unshift(rawHostDirectives);
    }
  };
  feature.ngInherit = true;
  return feature;
}

/**
 * Function that will be patched onto a definition to enable host directives. It is intended to
 * be called once during directive matching and is the same for all definitions.
 * @param matches Directives resolved through selector matching.
 */
function resolveHostDirectives(matches: DirectiveDef<unknown>[]): HostDirectiveResolution {
  const allDirectiveDefs: DirectiveDef<unknown>[] = [];
  let hasComponent = false;
  let hostDirectiveDefs: HostDirectiveDefs | null = null;
  let hostDirectiveRanges: HostDirectiveRanges | null = null;

  // Components are inserted at the front of the matches array so that their lifecycle
  // hooks run before any directive lifecycle hooks. This appears to be for ViewEngine
  // compatibility. This logic doesn't make sense with host directives, because it
  // would allow the host directives to undo any overrides the host may have made.
  // To handle this case, the host directives of components are inserted at the beginning
  // of the array, followed by the component. As such, the insertion order is as follows:
  // 1. Host directives belonging to the selector-matched component.
  // 2. Selector-matched component.
  // 3. Host directives belonging to selector-matched directives.
  // 4. Selector-matched dir
  for (let i = 0; i < matches.length; i++) {
    const def = matches[i];

    if (def.hostDirectives !== null) {
      const start = allDirectiveDefs.length;

      hostDirectiveDefs ??= new Map();
      hostDirectiveRanges ??= new Map();

      // TODO(pk): probably could return matches instead of taking in an array to fill in?
      findHostDirectiveDefs(def, allDirectiveDefs, hostDirectiveDefs);

      // Note that these indexes are within the offset by `directiveStart`. We can't do the
      // offsetting here, because `directiveStart` hasn't been initialized on the TNode yet.
      hostDirectiveRanges.set(def, [start, allDirectiveDefs.length - 1]);
    }

    // Component definition is always first and needs to be
    // pushed early to maintain the correct ordering.
    if (i === 0 && isComponentDef(def)) {
      hasComponent = true;
      allDirectiveDefs.push(def);
    }
  }

  for (let i = hasComponent ? 1 : 0; i < matches.length; i++) {
    allDirectiveDefs.push(matches[i]);
  }

  return [allDirectiveDefs, hostDirectiveDefs, hostDirectiveRanges];
}

function findHostDirectiveDefs(
  currentDef: DirectiveDef<unknown>,
  matchedDefs: DirectiveDef<unknown>[],
  hostDirectiveDefs: HostDirectiveDefs,
): void {
  if (currentDef.hostDirectives !== null) {
    for (const configOrFn of currentDef.hostDirectives) {
      if (typeof configOrFn === 'function') {
        const resolved = configOrFn();
        for (const config of resolved) {
          trackHostDirectiveDef(createHostDirectiveDef(config), matchedDefs, hostDirectiveDefs);
        }
      } else {
        trackHostDirectiveDef(configOrFn, matchedDefs, hostDirectiveDefs);
      }
    }
  }
}

/** Tracks a single host directive during directive matching. */
function trackHostDirectiveDef(
  def: HostDirectiveDef,
  matchedDefs: DirectiveDef<unknown>[],
  hostDirectiveDefs: HostDirectiveDefs,
) {
  const hostDirectiveDef = getDirectiveDef(def.directive)!;

  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    validateHostDirective(def, hostDirectiveDef);
  }

  // We need to patch the `declaredInputs` so that
  // `ngOnChanges` can map the properties correctly.
  patchDeclaredInputs(hostDirectiveDef.declaredInputs, def.inputs);

  // Host directives execute before the host so that its host bindings can be overwritten.
  findHostDirectiveDefs(hostDirectiveDef, matchedDefs, hostDirectiveDefs);
  hostDirectiveDefs.set(hostDirectiveDef, def);
  matchedDefs.push(hostDirectiveDef);
}

/** Creates a `HostDirectiveDef` from a used-defined host directive configuration. */
function createHostDirectiveDef(config: HostDirectiveConfig): HostDirectiveDef {
  return typeof config === 'function'
    ? {directive: resolveForwardRef(config), inputs: EMPTY_OBJ, outputs: EMPTY_OBJ}
    : {
        directive: resolveForwardRef(config.directive),
        inputs: bindingArrayToMap(config.inputs),
        outputs: bindingArrayToMap(config.outputs),
      };
}

/**
 * Converts an array in the form of `['publicName', 'alias', 'otherPublicName', 'otherAlias']` into
 * a map in the form of `{publicName: 'alias', otherPublicName: 'otherAlias'}`.
 */
function bindingArrayToMap(bindings: string[] | undefined): HostDirectiveBindingMap {
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
  declaredInputs: Record<string, string>,
  exposedInputs: HostDirectiveBindingMap,
): void {
  for (const publicName in exposedInputs) {
    if (exposedInputs.hasOwnProperty(publicName)) {
      const remappedPublicName = exposedInputs[publicName];
      const privateName = declaredInputs[publicName];

      // We *technically* shouldn't be able to hit this case because we can't have multiple
      // inputs on the same property and we have validations against conflicting aliases in
      // `validateMappings`. If we somehow did, it would lead to `ngOnChanges` being invoked
      // with the wrong name so we have a non-user-friendly assertion here just in case.
      if (
        (typeof ngDevMode === 'undefined' || ngDevMode) &&
        declaredInputs.hasOwnProperty(remappedPublicName)
      ) {
        assertEqual(
          declaredInputs[remappedPublicName],
          declaredInputs[publicName],
          `Conflicting host directive input alias ${publicName}.`,
        );
      }

      declaredInputs[remappedPublicName] = privateName;
    }
  }
}

/**
 * Verifies that the host directive has been configured correctly.
 * @param hostDirectiveConfig Host directive configuration object.
 * @param directiveDef Directive definition of the host directive.
 */
function validateHostDirective(
  hostDirectiveConfig: HostDirectiveDef<unknown>,
  directiveDef: DirectiveDef<any> | null,
): asserts directiveDef is DirectiveDef<unknown> {
  const type = hostDirectiveConfig.directive;

  if (directiveDef === null) {
    if (getComponentDef(type) !== null) {
      throw new RuntimeError(
        RuntimeErrorCode.HOST_DIRECTIVE_COMPONENT,
        `Host directive ${type.name} cannot be a component.`,
      );
    }

    throw new RuntimeError(
      RuntimeErrorCode.HOST_DIRECTIVE_UNRESOLVABLE,
      `Could not resolve metadata for host directive ${type.name}. ` +
        `Make sure that the ${type.name} class is annotated with an @Directive decorator.`,
    );
  }

  if (!directiveDef.standalone) {
    throw new RuntimeError(
      RuntimeErrorCode.HOST_DIRECTIVE_NOT_STANDALONE,
      `Host directive ${directiveDef.type.name} must be standalone.`,
    );
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
function validateMappings<T>(
  bindingType: 'input' | 'output',
  def: DirectiveDef<T>,
  hostDirectiveBindings: HostDirectiveBindingMap,
) {
  const className = def.type.name;
  const bindings = bindingType === 'input' ? def.inputs : def.outputs;

  for (const publicName in hostDirectiveBindings) {
    if (hostDirectiveBindings.hasOwnProperty(publicName)) {
      if (!bindings.hasOwnProperty(publicName)) {
        throw new RuntimeError(
          RuntimeErrorCode.HOST_DIRECTIVE_UNDEFINED_BINDING,
          `Directive ${className} does not have an ${bindingType} with a public name of ${publicName}.`,
        );
      }

      const remappedPublicName = hostDirectiveBindings[publicName];

      if (bindings.hasOwnProperty(remappedPublicName) && remappedPublicName !== publicName) {
        throw new RuntimeError(
          RuntimeErrorCode.HOST_DIRECTIVE_CONFLICTING_ALIAS,
          `Cannot alias ${bindingType} ${publicName} of host directive ${className} to ${remappedPublicName}, because it already has a different ${bindingType} with the same public name.`,
        );
      }
    }
  }
}
