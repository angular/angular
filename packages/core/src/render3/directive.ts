/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';

import {extractDirectiveDef} from './definition';
import {DirectiveDef} from './interfaces/definition';
import {CssSelector} from './interfaces/projection';

/**
 * An interface that describes the subset of directive metadata
 * that can be retrieved using the `reflectDirectiveType` function.
 *
 * @publicApi
 */
export interface DirectiveMirror<C> {
  /**
   * The directive's HTML selector.
   */
  get selector(): CssSelector[] | string;
  /**
   * The type of componrnt/directive the factory will create.
   */
  get type(): Type<C>;
  /**
   * The inputs of the component/directive.
   */
  get inputs(): ReadonlyArray<{
    readonly propName: string;
    readonly templateName: string;
    readonly transform?: (value: any) => any;
  }>;
  /**
   * The outputs of the component/directive.
   */
  get outputs(): ReadonlyArray<{readonly propName: unknown; readonly templateName: string}>;
  /**
   * Whether this component/directive is marked as standalone.
   */
  get isStandalone(): boolean;
  /**
   * // TODO(signals): Remove internal and add public documentation
   * @internal
   */
  get isSignal(): boolean;
}

/**
 * Creates an object that allows to retrieve directive metadata.
 *
 * @usageNotes
 *
 * The example below demonstrates how to use the function and how the fields
 * of the returned object map to the directive metadata.
 *
 * ```typescript
 * @Directive({
 *   standalone: true,
 *   selector: 'foo-directive',
 * })
 * class FooDirective {
 *   @Input('inputName') inputPropName: string;
 *   @Output('outputName') outputPropName = new EventEmitter<void>();
 * }
 *
 * const mirror = reflectDirectiveType(FooDirective);
 * expect(mirror.type).toBe(FooDirective);
 * expect(mirror.selector).toBe([['foo-directive']]);
 * expect(mirror.isStandalone).toBe(true);
 * expect(mirror.inputs).toEqual([{propName: 'inputName', templateName: 'inputPropName'}]);
 * expect(mirror.outputs).toEqual([{propName: 'outputName', templateName: 'outputPropName'}]);
 * ```
 *
 * @param directive Directive class reference.
 * @returns An object that allows to retrieve directive metadata.
 *
 * @publicApi
 */
export function reflectDirectiveType<C>(directive: Type<C>): DirectiveMirror<C> | null {
  const directiveDef = extractDirectiveDef(directive);

  if (!directiveDef) return null;

  return extractReflectionMeta(directiveDef);
}
/**
 *
 * @param factory Definition of component/directive retreived from its type
 * @returns An object with directive metadata
 */
export function extractReflectionMeta<C>(factory: DirectiveDef<C>): DirectiveMirror<C> {
  return {
    get selector(): CssSelector[] | string {
      return factory.selectors;
    },
    get type(): Type<C> {
      return factory.type;
    },
    get inputs(): ReadonlyArray<{
      propName: string;
      templateName: string;
      transform?: (value: any) => any;
    }> {
      return Object.entries(factory.inputConfig).map(([propName, templateName]) => {
        if (Array.isArray(templateName)) {
          return {
            propName,
            templateName: templateName[1],
            ...(templateName[3] && {transform: templateName[3]}),
          };
        } else {
          return {
            propName,
            templateName,
          };
        }
      });
    },
    get outputs(): ReadonlyArray<{propName: unknown; templateName: string}> {
      return Object.entries(factory.outputs).map(([templateName, propName]) => {
        return {
          propName,
          templateName,
        };
      });
    },
    get isStandalone(): boolean {
      return factory.standalone;
    },
    get isSignal(): boolean {
      return factory.signals;
    },
  };
}
