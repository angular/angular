/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ConstantPool, R3DirectiveMetadata, WrappedNodeExpr, compileComponentFromMetadata as compileR3Component, compileDirectiveFromMetadata as compileR3Directive, jitExpression, makeBindingParser, parseHostBindings, parseTemplate} from '@angular/compiler';

import {Component, Directive, HostBinding, HostListener, Input, Output} from '../../metadata/directives';
import {componentNeedsResolution, maybeQueueResolutionOfComponentResources} from '../../metadata/resource_loading';
import {ViewEncapsulation} from '../../metadata/view';
import {Type} from '../../type';
import {stringify} from '../../util';

import {angularCoreEnv} from './environment';
import {NG_COMPONENT_DEF, NG_DIRECTIVE_DEF} from './fields';
import {patchComponentDefWithScope, transitiveScopesFor} from './module';
import {getReflect, reflectDependencies} from './util';

type StringMap = {
  [key: string]: string
};

/**
 * Compile an Angular component according to its decorator metadata, and patch the resulting
 * ngComponentDef onto the component type.
 *
 * Compilation may be asynchronous (due to the need to resolve URLs for the component template or
 * other resources, for example). In the event that compilation is not immediate, `compileComponent`
 * will enqueue resource resolution into a global queue and will fail to return the `ngComponentDef`
 * until the global queue has been resolved with a call to `resolveComponentResources`.
 */
export function compileComponent(type: Type<any>, metadata: Component): void {
  let ngComponentDef: any = null;
  // Metadata may have resources which need to be resolved.
  maybeQueueResolutionOfComponentResources(metadata);
  Object.defineProperty(type, NG_COMPONENT_DEF, {
    get: () => {
      if (ngComponentDef === null) {
        if (componentNeedsResolution(metadata)) {
          const error = [`Component '${stringify(type)}' is not resolved:`];
          if (metadata.templateUrl) {
            error.push(` - templateUrl: ${stringify(metadata.templateUrl)}`);
          }
          if (metadata.styleUrls && metadata.styleUrls.length) {
            error.push(` - styleUrls: ${JSON.stringify(metadata.styleUrls)}`);
          }
          error.push(`Did you run and wait for 'resolveComponentResources()'?`);
          throw new Error(error.join('\n'));
        }
        // The ConstantPool is a requirement of the JIT'er.
        const constantPool = new ConstantPool();

        // Parse the template and check for errors.
        const template =
            parseTemplate(metadata.template !, `ng://${stringify(type)}/template.html`, {
              preserveWhitespaces: metadata.preserveWhitespaces || false,
            });
        if (template.errors !== undefined) {
          const errors = template.errors.map(err => err.toString()).join(', ');
          throw new Error(
              `Errors during JIT compilation of template for ${stringify(type)}: ${errors}`);
        }

        // Compile the component metadata, including template, into an expression.
        // TODO(alxhub): implement inputs, outputs, queries, etc.
        const res = compileR3Component(
            {
              ...directiveMetadata(type, metadata),
              template,
              directives: new Map(),
              pipes: new Map(),
              viewQueries: [],
              wrapDirectivesInClosure: false,
              styles: metadata.styles || [],
              encapsulation: metadata.encapsulation || ViewEncapsulation.Emulated
            },
            constantPool, makeBindingParser());
        const preStatements = [...constantPool.statements, ...res.statements];

        ngComponentDef = jitExpression(
            res.expression, angularCoreEnv, `ng://${type.name}/ngComponentDef.js`, preStatements);

        // If component compilation is async, then the @NgModule annotation which declares the
        // component may execute and set an ngSelectorScope property on the component type. This
        // allows the component to patch itself with directiveDefs from the module after it
        // finishes compiling.
        if (hasSelectorScope(type)) {
          const scopes = transitiveScopesFor(type.ngSelectorScope);
          patchComponentDefWithScope(ngComponentDef, scopes);
        }
      }
      return ngComponentDef;
    },
    // Make the property configurable in dev mode to allow overriding in tests
    configurable: !!ngDevMode,
  });
}

function hasSelectorScope<T>(component: Type<T>): component is Type<T>&
    {ngSelectorScope: Type<any>} {
  return (component as{ngSelectorScope?: any}).ngSelectorScope !== undefined;
}

/**
 * Compile an Angular directive according to its decorator metadata, and patch the resulting
 * ngDirectiveDef onto the component type.
 *
 * In the event that compilation is not immediate, `compileDirective` will return a `Promise` which
 * will resolve when compilation completes and the directive becomes usable.
 */
export function compileDirective(type: Type<any>, directive: Directive): void {
  let ngDirectiveDef: any = null;
  Object.defineProperty(type, NG_DIRECTIVE_DEF, {
    get: () => {
      if (ngDirectiveDef === null) {
        const constantPool = new ConstantPool();
        const sourceMapUrl = `ng://${type && type.name}/ngDirectiveDef.js`;
        const res = compileR3Directive(
            directiveMetadata(type, directive), constantPool, makeBindingParser());
        const preStatements = [...constantPool.statements, ...res.statements];
        ngDirectiveDef = jitExpression(res.expression, angularCoreEnv, sourceMapUrl, preStatements);
      }
      return ngDirectiveDef;
    },
    // Make the property configurable in dev mode to allow overriding in tests
    configurable: !!ngDevMode,
  });
}

export function extendsDirectlyFromObject(type: Type<any>): boolean {
  return Object.getPrototypeOf(type.prototype) === Object.prototype;
}

/**
 * Extract the `R3DirectiveMetadata` for a particular directive (either a `Directive` or a
 * `Component`).
 */
function directiveMetadata(type: Type<any>, metadata: Directive): R3DirectiveMetadata {
  // Reflect inputs and outputs.
  const propMetadata = getReflect().propMetadata(type);

  const host = extractHostBindings(metadata, propMetadata);

  const inputsFromMetadata = parseInputOutputs(metadata.inputs || []);
  const outputsFromMetadata = parseInputOutputs(metadata.outputs || []);

  const inputsFromType: StringMap = {};
  const outputsFromType: StringMap = {};
  for (const field in propMetadata) {
    if (propMetadata.hasOwnProperty(field)) {
      propMetadata[field].forEach(ann => {
        if (isInput(ann)) {
          inputsFromType[field] = ann.bindingPropertyName || field;
        } else if (isOutput(ann)) {
          outputsFromType[field] = ann.bindingPropertyName || field;
        }
      });
    }
  }

  return {
    name: type.name,
    type: new WrappedNodeExpr(type),
    typeArgumentCount: 0,
    selector: metadata.selector !,
    deps: reflectDependencies(type), host,
    inputs: {...inputsFromMetadata, ...inputsFromType},
    outputs: {...outputsFromMetadata, ...outputsFromType},
    queries: [],
    lifecycle: {
      usesOnChanges: type.prototype.ngOnChanges !== undefined,
    },
    typeSourceSpan: null !,
    usesInheritance: !extendsDirectlyFromObject(type),
    exportAs: metadata.exportAs || null,
  };
}

function extractHostBindings(metadata: Directive, propMetadata: {[key: string]: any[]}): {
  attributes: StringMap,
  listeners: StringMap,
  properties: StringMap,
} {
  // First parse the declarations from the metadata.
  const {attributes, listeners, properties, animations} = parseHostBindings(metadata.host || {});

  if (Object.keys(animations).length > 0) {
    throw new Error(`Animation bindings are as-of-yet unsupported in Ivy`);
  }

  // Next, loop over the properties of the object, looking for @HostBinding and @HostListener.
  for (const field in propMetadata) {
    if (propMetadata.hasOwnProperty(field)) {
      propMetadata[field].forEach(ann => {
        if (isHostBinding(ann)) {
          properties[ann.hostPropertyName || field] = field;
        } else if (isHostListener(ann)) {
          listeners[ann.eventName || field] = `${field}(${(ann.args || []).join(',')})`;
        }
      });
    }
  }

  return {attributes, listeners, properties};
}

function isInput(value: any): value is Input {
  return value.ngMetadataName === 'Input';
}

function isOutput(value: any): value is Output {
  return value.ngMetadataName === 'Output';
}

function isHostBinding(value: any): value is HostBinding {
  return value.ngMetadataName === 'HostBinding';
}

function isHostListener(value: any): value is HostListener {
  return value.ngMetadataName === 'HostListener';
}

function parseInputOutputs(values: string[]): StringMap {
  return values.reduce(
      (map, value) => {
        const [field, property] = value.split(',').map(piece => piece.trim());
        map[field] = property || field;
        return map;
      },
      {} as StringMap);
}
