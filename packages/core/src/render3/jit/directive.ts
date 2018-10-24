/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Query} from '../../metadata/di';
import {Component, Directive} from '../../metadata/directives';
import {componentNeedsResolution, maybeQueueResolutionOfComponentResources} from '../../metadata/resource_loading';
import {ViewEncapsulation} from '../../metadata/view';
import {Type} from '../../type';
import {stringify} from '../../util';
import {EMPTY_ARRAY} from '../definition';
import {NG_COMPONENT_DEF, NG_DIRECTIVE_DEF} from '../fields';

import {R3DirectiveMetadataFacade, getCompilerFacade} from './compiler_facade';
import {R3ComponentMetadataFacade, R3QueryMetadataFacade} from './compiler_facade_interface';
import {angularCoreEnv} from './environment';
import {patchComponentDefWithScope, transitiveScopesFor} from './module';
import {getReflect, reflectDependencies} from './util';



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
      const compiler = getCompilerFacade();
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
        const meta: R3ComponentMetadataFacade = {
          ...directiveMetadata(type, metadata),
          template: metadata.template || '',
          preserveWhitespaces: metadata.preserveWhitespaces || false,
          styles: metadata.styles || EMPTY_ARRAY,
          animations: metadata.animations,
          viewQueries: extractQueriesMetadata(getReflect().propMetadata(type), isViewQuery),
          directives: new Map(),
          pipes: new Map(),
          encapsulation: metadata.encapsulation || ViewEncapsulation.Emulated,
          viewProviders: metadata.viewProviders || null,
        };
        ngComponentDef = compiler.compileComponent(
            angularCoreEnv, `ng://${stringify(type)}/template.html`, meta);

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
        const facade = directiveMetadata(type, directive);
        ngDirectiveDef = getCompilerFacade().compileDirective(
            angularCoreEnv, `ng://${type && type.name}/ngDirectiveDef.js`, facade);
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
function directiveMetadata(type: Type<any>, metadata: Directive): R3DirectiveMetadataFacade {
  // Reflect inputs and outputs.
  const propMetadata = getReflect().propMetadata(type);

  return {
    name: type.name,
    type: type,
    typeArgumentCount: 0,
    selector: metadata.selector !,
    deps: reflectDependencies(type),
    host: metadata.host || EMPTY_OBJ,
    propMetadata: propMetadata,
    inputs: metadata.inputs || EMPTY_ARRAY,
    outputs: metadata.outputs || EMPTY_ARRAY,
    queries: extractQueriesMetadata(propMetadata, isContentQuery),
    lifecycle: {
      usesOnChanges: type.prototype.ngOnChanges !== undefined,
    },
    typeSourceSpan: null !,
    usesInheritance: !extendsDirectlyFromObject(type),
    exportAs: metadata.exportAs || null,
    providers: metadata.providers || null,
  };
}

const EMPTY_OBJ = {};

function convertToR3QueryPredicate(selector: any): any|string[] {
  return typeof selector === 'string' ? splitByComma(selector) : selector;
}

export function convertToR3QueryMetadata(propertyName: string, ann: Query): R3QueryMetadataFacade {
  return {
    propertyName: propertyName,
    predicate: convertToR3QueryPredicate(ann.selector),
    descendants: ann.descendants,
    first: ann.first,
    read: ann.read ? ann.read : null
  };
}
function extractQueriesMetadata(
    propMetadata: {[key: string]: any[]},
    isQueryAnn: (ann: any) => ann is Query): R3QueryMetadataFacade[] {
  const queriesMeta: R3QueryMetadataFacade[] = [];
  for (const field in propMetadata) {
    if (propMetadata.hasOwnProperty(field)) {
      propMetadata[field].forEach(ann => {
        if (isQueryAnn(ann)) {
          queriesMeta.push(convertToR3QueryMetadata(field, ann));
        }
      });
    }
  }
  return queriesMeta;
}

function isContentQuery(value: any): value is Query {
  const name = value.ngMetadataName;
  return name === 'ContentChild' || name === 'ContentChildren';
}

function isViewQuery(value: any): value is Query {
  const name = value.ngMetadataName;
  return name === 'ViewChild' || name === 'ViewChildren';
}

function splitByComma(value: string): string[] {
  return value.split(',').map(piece => piece.trim());
}
