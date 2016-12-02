/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute, Component, ContentChild, ContentChildren, Directive, Host, HostBinding, HostListener, Inject, Injectable, Input, NgModule, Optional, Output, Pipe, Self, SkipSelf, ViewChild, ViewChildren, animate, group, keyframes, sequence, state, style, transition, trigger} from '@angular/core';
import {ReflectorReader} from '../private_import_core';
import {StaticSymbol} from './static_symbol';

const SUPPORTED_SCHEMA_VERSION = 2;
const ANGULAR_IMPORT_LOCATIONS = {
  coreDecorators: '@angular/core/src/metadata',
  diDecorators: '@angular/core/src/di/metadata',
  diMetadata: '@angular/core/src/di/metadata',
  diOpaqueToken: '@angular/core/src/di/opaque_token',
  animationMetadata: '@angular/core/src/animation/metadata',
  provider: '@angular/core/src/di/provider'
};

/**
 * The host of the StaticReflector disconnects the implementation from TypeScript / other language
 * services and from underlying file systems.
 */
export interface StaticReflectorHost {
  /**
   * Return a ModuleMetadata for the given module.
   * Angular 2 CLI will produce this metadata for a module whenever a .d.ts files is
   * produced and the module has exported variables or classes with decorators. Module metadata can
   * also be produced directly from TypeScript sources by using MetadataCollector in tools/metadata.
   *
   * @param modulePath is a string identifier for a module as an absolute path.
   * @returns the metadata for the given module.
   */
  getMetadataFor(modulePath: string): {[key: string]: any}[];

  /**
   * Converts a module name that is used in an `import` to a file path.
   * I.e.
   * `path/to/containingFile.ts` containing `import {...} from 'module-name'`.
   */
  moduleNameToFileName(moduleName: string, containingFile: string): string;
}

/**
 * A cache of static symbol used by the StaticReflector to return the same symbol for the
 * same symbol values.
 */
export class StaticSymbolCache {
  private cache = new Map<string, StaticSymbol>();

  get(declarationFile: string, name: string, members?: string[]): StaticSymbol {
    const memberSuffix = members ? `.${ members.join('.')}` : '';
    const key = `"${declarationFile}".${name}${memberSuffix}`;
    let result = this.cache.get(key);
    if (!result) {
      result = new StaticSymbol(declarationFile, name, members);
      this.cache.set(key, result);
    }
    return result;
  }
}

/**
 * A static reflector implements enough of the Reflector API that is necessary to compile
 * templates statically.
 */
export class StaticReflector implements ReflectorReader {
  private declarationCache = new Map<string, StaticSymbol>();
  private annotationCache = new Map<StaticSymbol, any[]>();
  private propertyCache = new Map<StaticSymbol, {[key: string]: any[]}>();
  private parameterCache = new Map<StaticSymbol, any[]>();
  private methodCache = new Map<StaticSymbol, {[key: string]: boolean}>();
  private metadataCache = new Map<string, {[key: string]: any}>();
  private conversionMap = new Map<StaticSymbol, (context: StaticSymbol, args: any[]) => any>();
  private opaqueToken: StaticSymbol;

  constructor(
      private host: StaticReflectorHost,
      private staticSymbolCache: StaticSymbolCache = new StaticSymbolCache(),
      knownMetadataClasses: {name: string, filePath: string, ctor: any}[] = [],
      knownMetadataFunctions: {name: string, filePath: string, fn: any}[] = [],
      private errorRecorder?: (error: any, fileName: string) => void) {
    this.initializeConversionMap();
    knownMetadataClasses.forEach(
        (kc) => this._registerDecoratorOrConstructor(
            this.getStaticSymbol(kc.filePath, kc.name), kc.ctor));
    knownMetadataFunctions.forEach(
        (kf) => this._registerFunction(this.getStaticSymbol(kf.filePath, kf.name), kf.fn));
  }

  importUri(typeOrFunc: StaticSymbol): string {
    const staticSymbol = this.findDeclaration(typeOrFunc.filePath, typeOrFunc.name, '');
    return staticSymbol ? staticSymbol.filePath : null;
  }

  resolveIdentifier(name: string, moduleUrl: string, runtime: any): any {
    return this.findDeclaration(moduleUrl, name, '');
  }

  resolveEnum(enumIdentifier: any, name: string): any {
    const staticSymbol: StaticSymbol = enumIdentifier;
    return this.getStaticSymbol(staticSymbol.filePath, staticSymbol.name, [name]);
  }

  public annotations(type: StaticSymbol): any[] {
    let annotations = this.annotationCache.get(type);
    if (!annotations) {
      annotations = [];
      const classMetadata = this.getTypeMetadata(type);
      if (classMetadata['extends']) {
        const parentAnnotations = this.annotations(this.simplify(type, classMetadata['extends']));
        annotations.push(...parentAnnotations);
      }
      if (classMetadata['decorators']) {
        const ownAnnotations: any[] = this.simplify(type, classMetadata['decorators']);
        annotations.push(...ownAnnotations);
      }
      this.annotationCache.set(type, annotations.filter(ann => !!ann));
    }
    return annotations;
  }

  public propMetadata(type: StaticSymbol): {[key: string]: any[]} {
    let propMetadata = this.propertyCache.get(type);
    if (!propMetadata) {
      const classMetadata = this.getTypeMetadata(type) || {};
      propMetadata = {};
      if (classMetadata['extends']) {
        const parentPropMetadata = this.propMetadata(this.simplify(type, classMetadata['extends']));
        Object.keys(parentPropMetadata).forEach((parentProp) => {
          propMetadata[parentProp] = parentPropMetadata[parentProp];
        });
      }

      const members = classMetadata['members'] || {};
      Object.keys(members).forEach((propName) => {
        const propData = members[propName];
        const prop = (<any[]>propData)
                         .find(a => a['__symbolic'] == 'property' || a['__symbolic'] == 'method');
        const decorators: any[] = [];
        if (propMetadata[propName]) {
          decorators.push(...propMetadata[propName]);
        }
        propMetadata[propName] = decorators;
        if (prop && prop['decorators']) {
          decorators.push(...this.simplify(type, prop['decorators']));
        }
      });
      this.propertyCache.set(type, propMetadata);
    }
    return propMetadata;
  }

  public parameters(type: StaticSymbol): any[] {
    if (!(type instanceof StaticSymbol)) {
      this.reportError(
          new Error(`parameters received ${JSON.stringify(type)} which is not a StaticSymbol`),
          type);
      return [];
    }
    try {
      let parameters = this.parameterCache.get(type);
      if (!parameters) {
        const classMetadata = this.getTypeMetadata(type);
        const members = classMetadata ? classMetadata['members'] : null;
        const ctorData = members ? members['__ctor__'] : null;
        if (ctorData) {
          const ctor = (<any[]>ctorData).find(a => a['__symbolic'] == 'constructor');
          const parameterTypes = <any[]>this.simplify(type, ctor['parameters'] || []);
          const parameterDecorators = <any[]>this.simplify(type, ctor['parameterDecorators'] || []);
          parameters = [];
          parameterTypes.forEach((paramType, index) => {
            const nestedResult: any[] = [];
            if (paramType) {
              nestedResult.push(paramType);
            }
            const decorators = parameterDecorators ? parameterDecorators[index] : null;
            if (decorators) {
              nestedResult.push(...decorators);
            }
            parameters.push(nestedResult);
          });
        } else if (classMetadata['extends']) {
          parameters = this.parameters(this.simplify(type, classMetadata['extends']));
        }
        if (!parameters) {
          parameters = [];
        }
        this.parameterCache.set(type, parameters);
      }
      return parameters;
    } catch (e) {
      console.error(`Failed on type ${JSON.stringify(type)} with error ${e}`);
      throw e;
    }
  }

  private _methodNames(type: any): {[key: string]: boolean} {
    let methodNames = this.methodCache.get(type);
    if (!methodNames) {
      const classMetadata = this.getTypeMetadata(type) || {};
      methodNames = {};
      if (classMetadata['extends']) {
        const parentMethodNames = this._methodNames(this.simplify(type, classMetadata['extends']));
        Object.keys(parentMethodNames).forEach((parentProp) => {
          methodNames[parentProp] = parentMethodNames[parentProp];
        });
      }

      const members = classMetadata['members'] || {};
      Object.keys(members).forEach((propName) => {
        const propData = members[propName];
        const isMethod = (<any[]>propData).some(a => a['__symbolic'] == 'method');
        methodNames[propName] = methodNames[propName] || isMethod;
      });
      this.methodCache.set(type, methodNames);
    }
    return methodNames;
  }

  hasLifecycleHook(type: any, lcProperty: string): boolean {
    if (!(type instanceof StaticSymbol)) {
      this.reportError(
          new Error(
              `hasLifecycleHook received ${JSON.stringify(type)} which is not a StaticSymbol`),
          type);
    }
    try {
      return !!this._methodNames(type)[lcProperty];
    } catch (e) {
      console.error(`Failed on type ${JSON.stringify(type)} with error ${e}`);
      throw e;
    }
  }

  private _registerDecoratorOrConstructor(type: StaticSymbol, ctor: any): void {
    this.conversionMap.set(type, (context: StaticSymbol, args: any[]) => new ctor(...args));
  }

  private _registerFunction(type: StaticSymbol, fn: any): void {
    this.conversionMap.set(type, (context: StaticSymbol, args: any[]) => fn.apply(undefined, args));
  }

  private initializeConversionMap(): void {
    const {coreDecorators, diDecorators, diMetadata, diOpaqueToken, animationMetadata, provider} =
        ANGULAR_IMPORT_LOCATIONS;
    this.opaqueToken = this.findDeclaration(diOpaqueToken, 'OpaqueToken');

    this._registerDecoratorOrConstructor(this.findDeclaration(diDecorators, 'Host'), Host);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(diDecorators, 'Injectable'), Injectable);
    this._registerDecoratorOrConstructor(this.findDeclaration(diDecorators, 'Self'), Self);
    this._registerDecoratorOrConstructor(this.findDeclaration(diDecorators, 'SkipSelf'), SkipSelf);
    this._registerDecoratorOrConstructor(this.findDeclaration(diDecorators, 'Inject'), Inject);
    this._registerDecoratorOrConstructor(this.findDeclaration(diDecorators, 'Optional'), Optional);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(coreDecorators, 'Attribute'), Attribute);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(coreDecorators, 'ContentChild'), ContentChild);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(coreDecorators, 'ContentChildren'), ContentChildren);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(coreDecorators, 'ViewChild'), ViewChild);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(coreDecorators, 'ViewChildren'), ViewChildren);
    this._registerDecoratorOrConstructor(this.findDeclaration(coreDecorators, 'Input'), Input);
    this._registerDecoratorOrConstructor(this.findDeclaration(coreDecorators, 'Output'), Output);
    this._registerDecoratorOrConstructor(this.findDeclaration(coreDecorators, 'Pipe'), Pipe);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(coreDecorators, 'HostBinding'), HostBinding);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(coreDecorators, 'HostListener'), HostListener);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(coreDecorators, 'Directive'), Directive);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(coreDecorators, 'Component'), Component);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(coreDecorators, 'NgModule'), NgModule);

    // Note: Some metadata classes can be used directly with Provider.deps.
    this._registerDecoratorOrConstructor(this.findDeclaration(diMetadata, 'Host'), Host);
    this._registerDecoratorOrConstructor(this.findDeclaration(diMetadata, 'Self'), Self);
    this._registerDecoratorOrConstructor(this.findDeclaration(diMetadata, 'SkipSelf'), SkipSelf);
    this._registerDecoratorOrConstructor(this.findDeclaration(diMetadata, 'Optional'), Optional);

    this._registerFunction(this.findDeclaration(animationMetadata, 'trigger'), trigger);
    this._registerFunction(this.findDeclaration(animationMetadata, 'state'), state);
    this._registerFunction(this.findDeclaration(animationMetadata, 'transition'), transition);
    this._registerFunction(this.findDeclaration(animationMetadata, 'style'), style);
    this._registerFunction(this.findDeclaration(animationMetadata, 'animate'), animate);
    this._registerFunction(this.findDeclaration(animationMetadata, 'keyframes'), keyframes);
    this._registerFunction(this.findDeclaration(animationMetadata, 'sequence'), sequence);
    this._registerFunction(this.findDeclaration(animationMetadata, 'group'), group);
  }

  /**
   * getStaticSymbol produces a Type whose metadata is known but whose implementation is not loaded.
   * All types passed to the StaticResolver should be pseudo-types returned by this method.
   *
   * @param declarationFile the absolute path of the file where the symbol is declared
   * @param name the name of the type.
   */
  getStaticSymbol(declarationFile: string, name: string, members?: string[]): StaticSymbol {
    return this.staticSymbolCache.get(declarationFile, name, members);
  }

  private reportError(error: Error, context: StaticSymbol, path?: string) {
    if (this.errorRecorder) {
      this.errorRecorder(error, (context && context.filePath) || path);
    } else {
      throw error;
    }
  }

  private resolveExportedSymbol(filePath: string, symbolName: string): StaticSymbol {
    const resolveModule = (moduleName: string): string => {
      const resolvedModulePath = this.host.moduleNameToFileName(moduleName, filePath);
      if (!resolvedModulePath) {
        this.reportError(
            new Error(`Could not resolve module '${moduleName}' relative to file ${filePath}`),
            null, filePath);
      }
      return resolvedModulePath;
    };
    const cacheKey = `${filePath}|${symbolName}`;
    let staticSymbol = this.declarationCache.get(cacheKey);
    if (staticSymbol) {
      return staticSymbol;
    }
    const metadata = this.getModuleMetadata(filePath);
    if (metadata) {
      // If we have metadata for the symbol, this is the original exporting location.
      if (metadata['metadata'][symbolName]) {
        staticSymbol = this.getStaticSymbol(filePath, symbolName);
      }

      // If no, try to find the symbol in one of the re-export location
      if (!staticSymbol && metadata['exports']) {
        // Try and find the symbol in the list of explicitly re-exported symbols.
        for (const moduleExport of metadata['exports']) {
          if (moduleExport.export) {
            const exportSymbol = moduleExport.export.find((symbol: any) => {
              if (typeof symbol === 'string') {
                return symbol == symbolName;
              } else {
                return symbol.as == symbolName;
              }
            });
            if (exportSymbol) {
              let symName = symbolName;
              if (typeof exportSymbol !== 'string') {
                symName = exportSymbol.name;
              }
              const resolvedModule = resolveModule(moduleExport.from);
              if (resolvedModule) {
                staticSymbol =
                    this.resolveExportedSymbol(resolveModule(moduleExport.from), symName);
                break;
              }
            }
          }
        }

        if (!staticSymbol) {
          // Try to find the symbol via export * directives.
          for (const moduleExport of metadata['exports']) {
            if (!moduleExport.export) {
              const resolvedModule = resolveModule(moduleExport.from);
              if (resolvedModule) {
                const candidateSymbol = this.resolveExportedSymbol(resolvedModule, symbolName);
                if (candidateSymbol) {
                  staticSymbol = candidateSymbol;
                  break;
                }
              }
            }
          }
        }
      }
    }
    this.declarationCache.set(cacheKey, staticSymbol);
    return staticSymbol;
  }

  findDeclaration(module: string, symbolName: string, containingFile?: string): StaticSymbol {
    try {
      const filePath = this.host.moduleNameToFileName(module, containingFile);
      let symbol: StaticSymbol;
      if (!filePath) {
        // If the file cannot be found the module is probably referencing a declared module
        // for which there is no disambiguating file and we also don't need to track
        // re-exports. Just use the module name.
        symbol = this.getStaticSymbol(module, symbolName);
      } else {
        symbol = this.resolveExportedSymbol(filePath, symbolName) ||
            this.getStaticSymbol(filePath, symbolName);
      }
      return symbol;
    } catch (e) {
      console.error(`can't resolve module ${module} from ${containingFile}`);
      throw e;
    }
  }

  /** @internal */
  public simplify(context: StaticSymbol, value: any): any {
    const self = this;
    let scope = BindingScope.empty;
    const calling = new Map<StaticSymbol, boolean>();

    function simplifyInContext(context: StaticSymbol, value: any, depth: number): any {
      function resolveReference(context: StaticSymbol, expression: any): StaticSymbol {
        let staticSymbol: StaticSymbol;
        if (expression['module']) {
          staticSymbol =
              self.findDeclaration(expression['module'], expression['name'], context.filePath);
        } else {
          staticSymbol = self.getStaticSymbol(context.filePath, expression['name']);
        }
        return staticSymbol;
      }

      function resolveReferenceValue(staticSymbol: StaticSymbol): any {
        const moduleMetadata = self.getModuleMetadata(staticSymbol.filePath);
        const declarationValue =
            moduleMetadata ? moduleMetadata['metadata'][staticSymbol.name] : null;
        return declarationValue;
      }

      function isOpaqueToken(context: StaticSymbol, value: any): boolean {
        if (value && value.__symbolic === 'new' && value.expression) {
          const target = value.expression;
          if (target.__symbolic == 'reference') {
            return sameSymbol(resolveReference(context, target), self.opaqueToken);
          }
        }
        return false;
      }

      function simplifyCall(expression: any) {
        let callContext: {[name: string]: string}|undefined = undefined;
        if (expression['__symbolic'] == 'call') {
          const target = expression['expression'];
          let functionSymbol: StaticSymbol;
          let targetFunction: any;
          if (target) {
            switch (target.__symbolic) {
              case 'reference':
                // Find the function to call.
                callContext = {name: target.name};
                functionSymbol = resolveReference(context, target);
                targetFunction = resolveReferenceValue(functionSymbol);
                break;
              case 'select':
                // Find the static method to call
                if (target.expression.__symbolic == 'reference') {
                  functionSymbol = resolveReference(context, target.expression);
                  const classData = resolveReferenceValue(functionSymbol);
                  if (classData && classData.statics) {
                    targetFunction = classData.statics[target.member];
                  }
                }
                break;
            }
          }
          if (targetFunction && targetFunction['__symbolic'] == 'function') {
            if (calling.get(functionSymbol)) {
              throw new Error('Recursion not supported');
            }
            calling.set(functionSymbol, true);
            try {
              const value = targetFunction['value'];
              if (value && (depth != 0 || value.__symbolic != 'error')) {
                // Determine the arguments
                const args: any[] =
                    (expression['arguments'] || []).map((arg: any) => simplify(arg));
                const parameters: string[] = targetFunction['parameters'];
                const defaults: any[] = targetFunction.defaults;
                if (defaults && defaults.length > args.length) {
                  args.push(...defaults.slice(args.length).map((value: any) => simplify(value)));
                }
                const functionScope = BindingScope.build();
                for (let i = 0; i < parameters.length; i++) {
                  functionScope.define(parameters[i], args[i]);
                }
                const oldScope = scope;
                let result: any;
                try {
                  scope = functionScope.done();
                  result = simplifyInContext(functionSymbol, value, depth + 1);
                } finally {
                  scope = oldScope;
                }
                return result;
              }
            } finally {
              calling.delete(functionSymbol);
            }
          }
        }

        if (depth === 0) {
          // If depth is 0 we are evaluating the top level expression that is describing element
          // decorator. In this case, it is a decorator we don't understand, such as a custom
          // non-angular decorator, and we should just ignore it.
          return {__symbolic: 'ignore'};
        }
        return simplify(
            {__symbolic: 'error', message: 'Function call not supported', context: callContext});
      }

      function simplify(expression: any): any {
        if (isPrimitive(expression)) {
          return expression;
        }
        if (expression instanceof Array) {
          const result: any[] = [];
          for (const item of (<any>expression)) {
            // Check for a spread expression
            if (item && item.__symbolic === 'spread') {
              const spreadArray = simplify(item.expression);
              if (Array.isArray(spreadArray)) {
                for (const spreadItem of spreadArray) {
                  result.push(spreadItem);
                }
                continue;
              }
            }
            const value = simplify(item);
            if (shouldIgnore(value)) {
              continue;
            }
            result.push(value);
          }
          return result;
        }
        if (expression instanceof StaticSymbol) {
          return expression;
        }
        if (expression) {
          if (expression['__symbolic']) {
            let staticSymbol: StaticSymbol;
            switch (expression['__symbolic']) {
              case 'binop':
                let left = simplify(expression['left']);
                if (shouldIgnore(left)) return left;
                let right = simplify(expression['right']);
                if (shouldIgnore(right)) return right;
                switch (expression['operator']) {
                  case '&&':
                    return left && right;
                  case '||':
                    return left || right;
                  case '|':
                    return left | right;
                  case '^':
                    return left ^ right;
                  case '&':
                    return left & right;
                  case '==':
                    return left == right;
                  case '!=':
                    return left != right;
                  case '===':
                    return left === right;
                  case '!==':
                    return left !== right;
                  case '<':
                    return left < right;
                  case '>':
                    return left > right;
                  case '<=':
                    return left <= right;
                  case '>=':
                    return left >= right;
                  case '<<':
                    return left << right;
                  case '>>':
                    return left >> right;
                  case '+':
                    return left + right;
                  case '-':
                    return left - right;
                  case '*':
                    return left * right;
                  case '/':
                    return left / right;
                  case '%':
                    return left % right;
                }
                return null;
              case 'if':
                let condition = simplify(expression['condition']);
                return condition ? simplify(expression['thenExpression']) :
                                   simplify(expression['elseExpression']);
              case 'pre':
                let operand = simplify(expression['operand']);
                if (shouldIgnore(operand)) return operand;
                switch (expression['operator']) {
                  case '+':
                    return operand;
                  case '-':
                    return -operand;
                  case '!':
                    return !operand;
                  case '~':
                    return ~operand;
                }
                return null;
              case 'index':
                let indexTarget = simplify(expression['expression']);
                let index = simplify(expression['index']);
                if (indexTarget && isPrimitive(index)) return indexTarget[index];
                return null;
              case 'select':
                let selectContext = context;
                let selectTarget = simplify(expression['expression']);
                if (selectTarget instanceof StaticSymbol) {
                  // Access to a static instance variable
                  const member: string = expression['member'];
                  const members = selectTarget.members ?
                      (selectTarget.members as string[]).concat(member) :
                      [member];
                  const declarationValue = resolveReferenceValue(selectTarget);
                  selectContext =
                      self.getStaticSymbol(selectTarget.filePath, selectTarget.name, members);
                  if (declarationValue && declarationValue.statics) {
                    selectTarget = declarationValue.statics;
                  } else {
                    return selectContext;
                  }
                }
                const member = simplifyInContext(selectContext, expression['member'], depth + 1);
                if (selectTarget && isPrimitive(member))
                  return simplifyInContext(selectContext, selectTarget[member], depth + 1);
                return null;
              case 'reference':
                if (!expression.module) {
                  const name: string = expression['name'];
                  const localValue = scope.resolve(name);
                  if (localValue != BindingScope.missing) {
                    return localValue;
                  }
                }
                staticSymbol = resolveReference(context, expression);
                let result: any = staticSymbol;
                let declarationValue = resolveReferenceValue(result);
                if (declarationValue) {
                  if (isOpaqueToken(staticSymbol, declarationValue)) {
                    // If the referenced symbol is initalized by a new OpaqueToken we can keep the
                    // reference to the symbol.
                    return staticSymbol;
                  }
                  result = simplifyInContext(staticSymbol, declarationValue, depth + 1);
                }
                return result;
              case 'class':
                return context;
              case 'function':
                return context;
              case 'new':
              case 'call':
                // Determine if the function is a built-in conversion
                let target = expression['expression'];
                if (target['module']) {
                  staticSymbol =
                      self.findDeclaration(target['module'], target['name'], context.filePath);
                } else {
                  staticSymbol = self.getStaticSymbol(context.filePath, target['name']);
                }
                let converter = self.conversionMap.get(staticSymbol);
                if (converter) {
                  let args: any[] = expression['arguments'];
                  if (!args) {
                    args = [];
                  }
                  return converter(
                      context, args.map(arg => simplifyInContext(context, arg, depth + 1)));
                }

                // Determine if the function is one we can simplify.
                return simplifyCall(expression);

              case 'error':
                let message = produceErrorMessage(expression);
                if (expression['line']) {
                  message =
                      `${message} (position ${expression['line']+1}:${expression['character']+1} in the original .ts file)`;
                  throw positionalError(
                      message, context.filePath, expression['line'], expression['character']);
                }
                throw new Error(message);
            }
            return null;
          }
          return mapStringMap(expression, (value, name) => simplify(value));
        }
        return null;
      }

      try {
        return simplify(value);
      } catch (e) {
        const message = `${e.message}, resolving symbol ${context.name} in ${context.filePath}`;
        if (e.fileName) {
          throw positionalError(message, e.fileName, e.line, e.column);
        }
        throw new Error(message);
      }
    }

    const recordedSimplifyInContext = (context: StaticSymbol, value: any, depth: number) => {
      try {
        return simplifyInContext(context, value, depth);
      } catch (e) {
        this.reportError(e, context);
      }
    };

    const result = this.errorRecorder ? recordedSimplifyInContext(context, value, 0) :
                                        simplifyInContext(context, value, 0);
    if (shouldIgnore(result)) {
      return undefined;
    }
    return result;
  }

  /**
   * @param module an absolute path to a module file.
   */
  public getModuleMetadata(module: string): {[key: string]: any} {
    let moduleMetadata = this.metadataCache.get(module);
    if (!moduleMetadata) {
      const moduleMetadatas = this.host.getMetadataFor(module);
      if (moduleMetadatas) {
        let maxVersion = -1;
        moduleMetadatas.forEach((md) => {
          if (md['version'] > maxVersion) {
            maxVersion = md['version'];
            moduleMetadata = md;
          }
        });
      }
      if (!moduleMetadata) {
        moduleMetadata =
            {__symbolic: 'module', version: SUPPORTED_SCHEMA_VERSION, module: module, metadata: {}};
      }
      if (moduleMetadata['version'] != SUPPORTED_SCHEMA_VERSION) {
        this.reportError(
            new Error(
                `Metadata version mismatch for module ${module}, found version ${moduleMetadata['version']}, expected ${SUPPORTED_SCHEMA_VERSION}`),
            null);
      }
      this.metadataCache.set(module, moduleMetadata);
    }
    return moduleMetadata;
  }

  private getTypeMetadata(type: StaticSymbol): {[key: string]: any} {
    const moduleMetadata = this.getModuleMetadata(type.filePath);
    return moduleMetadata['metadata'][type.name] || {__symbolic: 'class'};
  }
}

function expandedMessage(error: any): string {
  switch (error.message) {
    case 'Reference to non-exported class':
      if (error.context && error.context.className) {
        return `Reference to a non-exported class ${error.context.className}. Consider exporting the class`;
      }
      break;
    case 'Variable not initialized':
      return 'Only initialized variables and constants can be referenced because the value of this variable is needed by the template compiler';
    case 'Destructuring not supported':
      return 'Referencing an exported destructured variable or constant is not supported by the template compiler. Consider simplifying this to avoid destructuring';
    case 'Could not resolve type':
      if (error.context && error.context.typeName) {
        return `Could not resolve type ${error.context.typeName}`;
      }
      break;
    case 'Function call not supported':
      let prefix =
          error.context && error.context.name ? `Calling function '${error.context.name}', f` : 'F';
      return prefix +
          'unction calls are not supported. Consider replacing the function or lambda with a reference to an exported function';
    case 'Reference to a local symbol':
      if (error.context && error.context.name) {
        return `Reference to a local (non-exported) symbol '${error.context.name}'. Consider exporting the symbol`;
      }
      break;
  }
  return error.message;
}

function produceErrorMessage(error: any): string {
  return `Error encountered resolving symbol values statically. ${expandedMessage(error)}`;
}

function mapStringMap(input: {[key: string]: any}, transform: (value: any, key: string) => any):
    {[key: string]: any} {
  if (!input) return {};
  const result: {[key: string]: any} = {};
  Object.keys(input).forEach((key) => {
    const value = transform(input[key], key);
    if (!shouldIgnore(value)) {
      result[key] = value;
    }
  });
  return result;
}

function isPrimitive(o: any): boolean {
  return o === null || (typeof o !== 'function' && typeof o !== 'object');
}

interface BindingScopeBuilder {
  define(name: string, value: any): BindingScopeBuilder;
  done(): BindingScope;
}

abstract class BindingScope {
  abstract resolve(name: string): any;
  public static missing = {};
  public static empty: BindingScope = {resolve: name => BindingScope.missing};

  public static build(): BindingScopeBuilder {
    const current = new Map<string, any>();
    return {
      define: function(name, value) {
        current.set(name, value);
        return this;
      },
      done: function() {
        return current.size > 0 ? new PopulatedScope(current) : BindingScope.empty;
      }
    };
  }
}

class PopulatedScope extends BindingScope {
  constructor(private bindings: Map<string, any>) { super(); }

  resolve(name: string): any {
    return this.bindings.has(name) ? this.bindings.get(name) : BindingScope.missing;
  }
}

function sameSymbol(a: StaticSymbol, b: StaticSymbol): boolean {
  return a === b || (a.name == b.name && a.filePath == b.filePath);
}

function shouldIgnore(value: any): boolean {
  return value && value.__symbolic == 'ignore';
}

function positionalError(message: string, fileName: string, line: number, column: number): Error {
  const result = new Error(message);
  (result as any).fileName = fileName;
  (result as any).line = line;
  (result as any).column = column;
  return result;
}