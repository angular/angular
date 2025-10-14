import type { DirectiveDefFeature, HostDirectiveConfig } from '../interfaces/definition';
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
export declare function ɵɵHostDirectivesFeature(rawHostDirectives: HostDirectiveConfig[] | (() => HostDirectiveConfig[])): DirectiveDefFeature;
