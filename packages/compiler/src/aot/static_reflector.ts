/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CompileSummaryKind} from '../compile_metadata';
import {CompileReflector} from '../compile_reflector';
import {createAttribute, createComponent, createContentChild, createContentChildren, createDirective, createHost, createHostBinding, createHostListener, createInject, createInjectable, createInput, createNgModule, createOptional, createOutput, createPipe, createSelf, createSkipSelf, createViewChild, createViewChildren, MetadataFactory} from '../core';
import * as o from '../output/output_ast';
import {SummaryResolver} from '../summary_resolver';
import {syntaxError} from '../util';

import {formattedError, FormattedMessageChain} from './formatted_error';
import {StaticSymbol} from './static_symbol';
import {StaticSymbolResolver} from './static_symbol_resolver';

const ANGULAR_CORE = '@angular/core';
const ANGULAR_ROUTER = '@angular/router';

const HIDDEN_KEY = /^\$.*\$$/;

const IGNORE = {
  __symbolic: 'ignore'
};

const USE_VALUE = 'useValue';
const PROVIDE = 'provide';
const REFERENCE_SET = new Set([USE_VALUE, 'useFactory', 'data', 'id', 'loadChildren']);
const TYPEGUARD_POSTFIX = 'TypeGuard';
const USE_IF = 'UseIf';

function shouldIgnore(value: any): boolean {
  return value && value.__symbolic == 'ignore';
}

/**
 * A static reflector implements enough of the Reflector API that is necessary to compile
 * templates statically.
 */
export class StaticReflector implements CompileReflector {
  private annotationCache = new Map<StaticSymbol, any[]>();
  private shallowAnnotationCache = new Map<StaticSymbol, any[]>();
  private propertyCache = new Map<StaticSymbol, {[key: string]: any[]}>();
  private parameterCache = new Map<StaticSymbol, any[]>();
  private methodCache = new Map<StaticSymbol, {[key: string]: boolean}>();
  private staticCache = new Map<StaticSymbol, string[]>();
  private conversionMap = new Map<StaticSymbol, (context: StaticSymbol, args: any[]) => any>();
  private resolvedExternalReferences = new Map<string, StaticSymbol>();
  // TODO(issue/24571): remove '!'.
  private injectionToken!: StaticSymbol;
  // TODO(issue/24571): remove '!'.
  private opaqueToken!: StaticSymbol;
  // TODO(issue/24571): remove '!'.
  ROUTES!: StaticSymbol;
  // TODO(issue/24571): remove '!'.
  private ANALYZE_FOR_ENTRY_COMPONENTS!: StaticSymbol;
  private annotationForParentClassWithSummaryKind =
      new Map<CompileSummaryKind, MetadataFactory<any>[]>();

  constructor(
      private summaryResolver: SummaryResolver<StaticSymbol>,
      private symbolResolver: StaticSymbolResolver,
      knownMetadataClasses: {name: string, filePath: string, ctor: any}[] = [],
      knownMetadataFunctions: {name: string, filePath: string, fn: any}[] = [],
      private errorRecorder?: (error: any, fileName?: string) => void) {
    this.initializeConversionMap();
    knownMetadataClasses.forEach(
        (kc) => this._registerDecoratorOrConstructor(
            this.getStaticSymbol(kc.filePath, kc.name), kc.ctor));
    knownMetadataFunctions.forEach(
        (kf) => this._registerFunction(this.getStaticSymbol(kf.filePath, kf.name), kf.fn));
    this.annotationForParentClassWithSummaryKind.set(
        CompileSummaryKind.Directive, [createDirective, createComponent]);
    this.annotationForParentClassWithSummaryKind.set(CompileSummaryKind.Pipe, [createPipe]);
    this.annotationForParentClassWithSummaryKind.set(CompileSummaryKind.NgModule, [createNgModule]);
    this.annotationForParentClassWithSummaryKind.set(
        CompileSummaryKind.Injectable,
        [createInjectable, createPipe, createDirective, createComponent, createNgModule]);
  }

  componentModuleUrl(typeOrFunc: StaticSymbol): string {
    const staticSymbol = this.findSymbolDeclaration(typeOrFunc);
    return this.symbolResolver.getResourcePath(staticSymbol);
  }

  /**
   * Invalidate the specified `symbols` on program change.
   * @param symbols
   */
  invalidateSymbols(symbols: StaticSymbol[]) {
    for (const symbol of symbols) {
      this.annotationCache.delete(symbol);
      this.shallowAnnotationCache.delete(symbol);
      this.propertyCache.delete(symbol);
      this.parameterCache.delete(symbol);
      this.methodCache.delete(symbol);
      this.staticCache.delete(symbol);
      this.conversionMap.delete(symbol);
    }
  }

  resolveExternalReference(ref: o.ExternalReference, containingFile?: string): StaticSymbol {
    let key: string|undefined = undefined;
    if (!containingFile) {
      key = `${ref.moduleName}:${ref.name}`;
      const declarationSymbol = this.resolvedExternalReferences.get(key);
      if (declarationSymbol) return declarationSymbol;
    }
    const refSymbol =
        this.symbolResolver.getSymbolByModule(ref.moduleName!, ref.name!, containingFile);
    const declarationSymbol = this.findSymbolDeclaration(refSymbol);
    if (!containingFile) {
      this.symbolResolver.recordModuleNameForFileName(refSymbol.filePath, ref.moduleName!);
      this.symbolResolver.recordImportAs(declarationSymbol, refSymbol);
    }
    if (key) {
      this.resolvedExternalReferences.set(key, declarationSymbol);
    }
    return declarationSymbol;
  }

  findDeclaration(moduleUrl: string, name: string, containingFile?: string): StaticSymbol {
    return this.findSymbolDeclaration(
        this.symbolResolver.getSymbolByModule(moduleUrl, name, containingFile));
  }

  tryFindDeclaration(moduleUrl: string, name: string, containingFile?: string): StaticSymbol {
    return this.symbolResolver.ignoreErrorsFor(
        () => this.findDeclaration(moduleUrl, name, containingFile));
  }

  findSymbolDeclaration(symbol: StaticSymbol): StaticSymbol {
    const resolvedSymbol = this.symbolResolver.resolveSymbol(symbol);
    if (resolvedSymbol) {
      let resolvedMetadata = resolvedSymbol.metadata;
      if (resolvedMetadata && resolvedMetadata.__symbolic === 'resolved') {
        resolvedMetadata = resolvedMetadata.symbol;
      }
      if (resolvedMetadata instanceof StaticSymbol) {
        return this.findSymbolDeclaration(resolvedSymbol.metadata);
      }
    }
    return symbol;
  }

  public tryAnnotations(type: StaticSymbol): any[] {
    const originalRecorder = this.errorRecorder;
    this.errorRecorder = (error: any, fileName?: string) => {};
    try {
      return this.annotations(type);
    } finally {
      this.errorRecorder = originalRecorder;
    }
  }

  public annotations(type: StaticSymbol): any[] {
    return this._annotations(
        type, (type: StaticSymbol, decorators: any) => this.simplify(type, decorators),
        this.annotationCache);
  }

  public shallowAnnotations(type: StaticSymbol): any[] {
    return this._annotations(
        type, (type: StaticSymbol, decorators: any) => this.simplify(type, decorators, true),
        this.shallowAnnotationCache);
  }

  private _annotations(
      type: StaticSymbol, simplify: (type: StaticSymbol, decorators: any) => any,
      annotationCache: Map<StaticSymbol, any[]>): any[] {
    let annotations = annotationCache.get(type);
    if (!annotations) {
      annotations = [];
      const classMetadata = this.getTypeMetadata(type);
      const parentType = this.findParentType(type, classMetadata);
      if (parentType) {
        const parentAnnotations = this.annotations(parentType);
        annotations.push(...parentAnnotations);
      }
      let ownAnnotations: any[] = [];
      if (classMetadata['decorators']) {
        ownAnnotations = simplify(type, classMetadata['decorators']);
        if (ownAnnotations) {
          annotations.push(...ownAnnotations);
        }
      }
      if (parentType && !this.summaryResolver.isLibraryFile(type.filePath) &&
          this.summaryResolver.isLibraryFile(parentType.filePath)) {
        const summary = this.summaryResolver.resolveSummary(parentType);
        if (summary && summary.type) {
          const requiredAnnotationTypes =
              this.annotationForParentClassWithSummaryKind.get(summary.type.summaryKind!)!;
          const typeHasRequiredAnnotation = requiredAnnotationTypes.some(
              (requiredType) => ownAnnotations.some(ann => requiredType.isTypeOf(ann)));
          if (!typeHasRequiredAnnotation) {
            this.reportError(
                formatMetadataError(
                    metadataError(
                        `Class ${type.name} in ${type.filePath} extends from a ${
                            CompileSummaryKind[summary.type.summaryKind!
            ]} in another compilation unit without duplicating the decorator`,
                        /* summary */ undefined,
                        `Please add a ${
                            requiredAnnotationTypes.map((type) => type.ngMetadataName)
                                .join(' or ')} decorator to the class`),
                    type),
                type);
          }
        }
      }
      annotationCache.set(type, annotations.filter(ann => !!ann));
    }
    return annotations;
  }

  public propMetadata(type: StaticSymbol): {[key: string]: any[]} {
    let propMetadata = this.propertyCache.get(type);
    if (!propMetadata) {
      const classMetadata = this.getTypeMetadata(type);
      propMetadata = {};
      const parentType = this.findParentType(type, classMetadata);
      if (parentType) {
        const parentPropMetadata = this.propMetadata(parentType);
        Object.keys(parentPropMetadata).forEach((parentProp) => {
          propMetadata![parentProp] = parentPropMetadata[parentProp];
        });
      }

      const members = classMetadata['members'] || {};
      Object.keys(members).forEach((propName) => {
        const propData = members[propName];
        const prop = (<any[]>propData)
                         .find(a => a['__symbolic'] == 'property' || a['__symbolic'] == 'method');
        const decorators: any[] = [];
        // hasOwnProperty() is used here to make sure we do not look up methods
        // on `Object.prototype`.
        if (propMetadata?.hasOwnProperty(propName)) {
          decorators.push(...propMetadata![propName]);
        }
        propMetadata![propName] = decorators;
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
        const parentType = this.findParentType(type, classMetadata);
        const members = classMetadata ? classMetadata['members'] : null;
        const ctorData = members ? members['__ctor__'] : null;
        if (ctorData) {
          const ctor = (<any[]>ctorData).find(a => a['__symbolic'] == 'constructor');
          const rawParameterTypes = <any[]>ctor['parameters'] || [];
          const parameterDecorators = <any[]>this.simplify(type, ctor['parameterDecorators'] || []);
          parameters = [];
          rawParameterTypes.forEach((rawParamType, index) => {
            const nestedResult: any[] = [];
            const paramType = this.trySimplify(type, rawParamType);
            if (paramType) nestedResult.push(paramType);
            const decorators = parameterDecorators ? parameterDecorators[index] : null;
            if (decorators) {
              nestedResult.push(...decorators);
            }
            parameters!.push(nestedResult);
          });
        } else if (parentType) {
          parameters = this.parameters(parentType);
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
      const classMetadata = this.getTypeMetadata(type);
      methodNames = {};
      const parentType = this.findParentType(type, classMetadata);
      if (parentType) {
        const parentMethodNames = this._methodNames(parentType);
        Object.keys(parentMethodNames).forEach((parentProp) => {
          methodNames![parentProp] = parentMethodNames[parentProp];
        });
      }

      const members = classMetadata['members'] || {};
      Object.keys(members).forEach((propName) => {
        const propData = members[propName];
        const isMethod = (<any[]>propData).some(a => a['__symbolic'] == 'method');
        methodNames![propName] = methodNames![propName] || isMethod;
      });
      this.methodCache.set(type, methodNames);
    }
    return methodNames;
  }

  private _staticMembers(type: StaticSymbol): string[] {
    let staticMembers = this.staticCache.get(type);
    if (!staticMembers) {
      const classMetadata = this.getTypeMetadata(type);
      const staticMemberData = classMetadata['statics'] || {};
      staticMembers = Object.keys(staticMemberData);
      this.staticCache.set(type, staticMembers);
    }
    return staticMembers;
  }


  private findParentType(type: StaticSymbol, classMetadata: any): StaticSymbol|undefined {
    const parentType = this.trySimplify(type, classMetadata['extends']);
    if (parentType instanceof StaticSymbol) {
      return parentType;
    }
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

  guards(type: any): {[key: string]: StaticSymbol} {
    if (!(type instanceof StaticSymbol)) {
      this.reportError(
          new Error(`guards received ${JSON.stringify(type)} which is not a StaticSymbol`), type);
      return {};
    }
    const staticMembers = this._staticMembers(type);
    const result: {[key: string]: StaticSymbol} = {};
    for (let name of staticMembers) {
      if (name.endsWith(TYPEGUARD_POSTFIX)) {
        let property = name.substr(0, name.length - TYPEGUARD_POSTFIX.length);
        let value: any;
        if (property.endsWith(USE_IF)) {
          property = name.substr(0, property.length - USE_IF.length);
          value = USE_IF;
        } else {
          value = this.getStaticSymbol(type.filePath, type.name, [name]);
        }
        result[property] = value;
      }
    }
    return result;
  }

  private _registerDecoratorOrConstructor(type: StaticSymbol, ctor: any): void {
    this.conversionMap.set(type, (context: StaticSymbol, args: any[]) => new ctor(...args));
  }

  private _registerFunction(type: StaticSymbol, fn: any): void {
    this.conversionMap.set(type, (context: StaticSymbol, args: any[]) => fn.apply(undefined, args));
  }

  private initializeConversionMap(): void {
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'Injectable'), createInjectable);
    this.injectionToken = this.findDeclaration(ANGULAR_CORE, 'InjectionToken');
    this.opaqueToken = this.findDeclaration(ANGULAR_CORE, 'OpaqueToken');
    this.ROUTES = this.tryFindDeclaration(ANGULAR_ROUTER, 'ROUTES');
    this.ANALYZE_FOR_ENTRY_COMPONENTS =
        this.findDeclaration(ANGULAR_CORE, 'ANALYZE_FOR_ENTRY_COMPONENTS');

    this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Host'), createHost);
    this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Self'), createSelf);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'SkipSelf'), createSkipSelf);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'Inject'), createInject);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'Optional'), createOptional);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'Attribute'), createAttribute);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'ContentChild'), createContentChild);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'ContentChildren'), createContentChildren);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'ViewChild'), createViewChild);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'ViewChildren'), createViewChildren);
    this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Input'), createInput);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'Output'), createOutput);
    this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Pipe'), createPipe);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'HostBinding'), createHostBinding);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'HostListener'), createHostListener);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'Directive'), createDirective);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'Component'), createComponent);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'NgModule'), createNgModule);

    // Note: Some metadata classes can be used directly with Provider.deps.
    this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Host'), createHost);
    this._registerDecoratorOrConstructor(this.findDeclaration(ANGULAR_CORE, 'Self'), createSelf);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'SkipSelf'), createSkipSelf);
    this._registerDecoratorOrConstructor(
        this.findDeclaration(ANGULAR_CORE, 'Optional'), createOptional);
  }

  /**
   * getStaticSymbol produces a Type whose metadata is known but whose implementation is not loaded.
   * All types passed to the StaticResolver should be pseudo-types returned by this method.
   *
   * @param declarationFile the absolute path of the file where the symbol is declared
   * @param name the name of the type.
   */
  getStaticSymbol(declarationFile: string, name: string, members?: string[]): StaticSymbol {
    return this.symbolResolver.getStaticSymbol(declarationFile, name, members);
  }

  /**
   * Simplify but discard any errors
   */
  private trySimplify(context: StaticSymbol, value: any): any {
    const originalRecorder = this.errorRecorder;
    this.errorRecorder = (error: any, fileName?: string) => {};
    const result = this.simplify(context, value);
    this.errorRecorder = originalRecorder;
    return result;
  }

  /** @internal */
  public simplify(context: StaticSymbol, value: any, lazy: boolean = false): any {
    const self = this;
    let scope = BindingScope.empty;
    const calling = new Map<StaticSymbol, boolean>();
    const rootContext = context;

    function simplifyInContext(
        context: StaticSymbol, value: any, depth: number, references: number): any {
      function resolveReferenceValue(staticSymbol: StaticSymbol): any {
        const resolvedSymbol = self.symbolResolver.resolveSymbol(staticSymbol);
        return resolvedSymbol ? resolvedSymbol.metadata : null;
      }

      function simplifyEagerly(value: any): any {
        return simplifyInContext(context, value, depth, 0);
      }

      function simplifyLazily(value: any): any {
        return simplifyInContext(context, value, depth, references + 1);
      }

      function simplifyNested(nestedContext: StaticSymbol, value: any): any {
        if (nestedContext === context) {
          // If the context hasn't changed let the exception propagate unmodified.
          return simplifyInContext(nestedContext, value, depth + 1, references);
        }
        try {
          return simplifyInContext(nestedContext, value, depth + 1, references);
        } catch (e) {
          if (isMetadataError(e)) {
            // Propagate the message text up but add a message to the chain that explains how we got
            // here.
            // e.chain implies e.symbol
            const summaryMsg = e.chain ? 'references \'' + e.symbol!.name + '\'' : errorSummary(e);
            const summary = `'${nestedContext.name}' ${summaryMsg}`;
            const chain = {message: summary, position: e.position, next: e.chain};
            // TODO(chuckj): retrieve the position information indirectly from the collectors node
            // map if the metadata is from a .ts file.
            self.error(
                {
                  message: e.message,
                  advise: e.advise,
                  context: e.context,
                  chain,
                  symbol: nestedContext
                },
                context);
          } else {
            // It is probably an internal error.
            throw e;
          }
        }
      }

      function simplifyCall(
          functionSymbol: StaticSymbol, targetFunction: any, args: any[], targetExpression: any) {
        if (targetFunction && targetFunction['__symbolic'] == 'function') {
          if (calling.get(functionSymbol)) {
            self.error(
                {
                  message: 'Recursion is not supported',
                  summary: `called '${functionSymbol.name}' recursively`,
                  value: targetFunction
                },
                functionSymbol);
          }
          try {
            const value = targetFunction['value'];
            if (value && (depth != 0 || value.__symbolic != 'error')) {
              const parameters: string[] = targetFunction['parameters'];
              const defaults: any[] = targetFunction.defaults;
              args = args.map(arg => simplifyNested(context, arg))
                         .map(arg => shouldIgnore(arg) ? undefined : arg);
              if (defaults && defaults.length > args.length) {
                args.push(...defaults.slice(args.length).map((value: any) => simplify(value)));
              }
              calling.set(functionSymbol, true);
              const functionScope = BindingScope.build();
              for (let i = 0; i < parameters.length; i++) {
                functionScope.define(parameters[i], args[i]);
              }
              const oldScope = scope;
              let result: any;
              try {
                scope = functionScope.done();
                result = simplifyNested(functionSymbol, value);
              } finally {
                scope = oldScope;
              }
              return result;
            }
          } finally {
            calling.delete(functionSymbol);
          }
        }

        if (depth === 0) {
          // If depth is 0 we are evaluating the top level expression that is describing element
          // decorator. In this case, it is a decorator we don't understand, such as a custom
          // non-angular decorator, and we should just ignore it.
          return IGNORE;
        }
        let position: Position|undefined = undefined;
        if (targetExpression && targetExpression.__symbolic == 'resolved') {
          const line = targetExpression.line;
          const character = targetExpression.character;
          const fileName = targetExpression.fileName;
          if (fileName != null && line != null && character != null) {
            position = {fileName, line, column: character};
          }
        }
        self.error(
            {
              message: FUNCTION_CALL_NOT_SUPPORTED,
              context: functionSymbol,
              value: targetFunction,
              position
            },
            context);
      }

      function simplify(expression: any): any {
        if (isPrimitive(expression)) {
          return expression;
        }
        if (Array.isArray(expression)) {
          const result: any[] = [];
          for (const item of (<any>expression)) {
            // Check for a spread expression
            if (item && item.__symbolic === 'spread') {
              // We call with references as 0 because we require the actual value and cannot
              // tolerate a reference here.
              const spreadArray = simplifyEagerly(item.expression);
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
          // Stop simplification at builtin symbols or if we are in a reference context and
          // the symbol doesn't have members.
          if (expression === self.injectionToken || self.conversionMap.has(expression) ||
              (references > 0 && !expression.members.length)) {
            return expression;
          } else {
            const staticSymbol = expression;
            const declarationValue = resolveReferenceValue(staticSymbol);
            if (declarationValue != null) {
              return simplifyNested(staticSymbol, declarationValue);
            } else {
              return staticSymbol;
            }
          }
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
                  case '??':
                    return left ?? right;
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
                let indexTarget = simplifyEagerly(expression['expression']);
                let index = simplifyEagerly(expression['index']);
                if (indexTarget && isPrimitive(index)) return indexTarget[index];
                return null;
              case 'select':
                const member = expression['member'];
                let selectContext = context;
                let selectTarget = simplify(expression['expression']);
                if (selectTarget instanceof StaticSymbol) {
                  const members = selectTarget.members.concat(member);
                  selectContext =
                      self.getStaticSymbol(selectTarget.filePath, selectTarget.name, members);
                  const declarationValue = resolveReferenceValue(selectContext);
                  if (declarationValue != null) {
                    return simplifyNested(selectContext, declarationValue);
                  } else {
                    return selectContext;
                  }
                }
                if (selectTarget && isPrimitive(member))
                  return simplifyNested(selectContext, selectTarget[member]);
                return null;
              case 'reference':
                // Note: This only has to deal with variable references, as symbol references have
                // been converted into 'resolved'
                // in the StaticSymbolResolver.
                const name: string = expression['name'];
                const localValue = scope.resolve(name);
                if (localValue != BindingScope.missing) {
                  return localValue;
                }
                break;
              case 'resolved':
                try {
                  return simplify(expression.symbol);
                } catch (e) {
                  // If an error is reported evaluating the symbol record the position of the
                  // reference in the error so it can
                  // be reported in the error message generated from the exception.
                  if (isMetadataError(e) && expression.fileName != null &&
                      expression.line != null && expression.character != null) {
                    e.position = {
                      fileName: expression.fileName,
                      line: expression.line,
                      column: expression.character
                    };
                  }
                  throw e;
                }
              case 'class':
                return context;
              case 'function':
                return context;
              case 'new':
              case 'call':
                // Determine if the function is a built-in conversion
                staticSymbol = simplifyInContext(
                    context, expression['expression'], depth + 1, /* references */ 0);
                if (staticSymbol instanceof StaticSymbol) {
                  if (staticSymbol === self.injectionToken || staticSymbol === self.opaqueToken) {
                    // if somebody calls new InjectionToken, don't create an InjectionToken,
                    // but rather return the symbol to which the InjectionToken is assigned to.

                    // OpaqueToken is supported too as it is required by the language service to
                    // support v4 and prior versions of Angular.
                    return context;
                  }
                  const argExpressions: any[] = expression['arguments'] || [];
                  let converter = self.conversionMap.get(staticSymbol);
                  if (converter) {
                    const args = argExpressions.map(arg => simplifyNested(context, arg))
                                     .map(arg => shouldIgnore(arg) ? undefined : arg);
                    return converter(context, args);
                  } else {
                    // Determine if the function is one we can simplify.
                    const targetFunction = resolveReferenceValue(staticSymbol);
                    return simplifyCall(
                        staticSymbol, targetFunction, argExpressions, expression['expression']);
                  }
                }
                return IGNORE;
              case 'error':
                let message = expression.message;
                if (expression['line'] != null) {
                  self.error(
                      {
                        message,
                        context: expression.context,
                        value: expression,
                        position: {
                          fileName: expression['fileName'],
                          line: expression['line'],
                          column: expression['character']
                        }
                      },
                      context);
                } else {
                  self.error({message, context: expression.context}, context);
                }
                return IGNORE;
              case 'ignore':
                return expression;
            }
            return null;
          }
          return mapStringMap(expression, (value, name) => {
            if (REFERENCE_SET.has(name)) {
              if (name === USE_VALUE && PROVIDE in expression) {
                // If this is a provider expression, check for special tokens that need the value
                // during analysis.
                const provide = simplify(expression.provide);
                if (provide === self.ROUTES || provide == self.ANALYZE_FOR_ENTRY_COMPONENTS) {
                  return simplify(value);
                }
              }
              return simplifyLazily(value);
            }
            return simplify(value);
          });
        }
        return IGNORE;
      }

      return simplify(value);
    }

    let result: any;
    try {
      result = simplifyInContext(context, value, 0, lazy ? 1 : 0);
    } catch (e) {
      if (this.errorRecorder) {
        this.reportError(e, context);
      } else {
        throw formatMetadataError(e, context);
      }
    }
    if (shouldIgnore(result)) {
      return undefined;
    }
    return result;
  }

  private getTypeMetadata(type: StaticSymbol): {[key: string]: any} {
    const resolvedSymbol = this.symbolResolver.resolveSymbol(type);
    return resolvedSymbol && resolvedSymbol.metadata ? resolvedSymbol.metadata :
                                                       {__symbolic: 'class'};
  }

  private reportError(error: Error, context: StaticSymbol, path?: string) {
    if (this.errorRecorder) {
      this.errorRecorder(
          formatMetadataError(error, context), (context && context.filePath) || path);
    } else {
      throw error;
    }
  }

  private error(
      {message, summary, advise, position, context, value, symbol, chain}: {
        message: string,
        summary?: string,
        advise?: string,
        position?: Position,
        context?: any,
        value?: any,
        symbol?: StaticSymbol,
        chain?: MetadataMessageChain
      },
      reportingContext: StaticSymbol) {
    this.reportError(
        metadataError(message, summary, advise, position, symbol, context, chain),
        reportingContext);
  }
}

interface Position {
  fileName: string;
  line: number;
  column: number;
}

interface MetadataMessageChain {
  message: string;
  summary?: string;
  position?: Position;
  context?: any;
  symbol?: StaticSymbol;
  next?: MetadataMessageChain;
}

type MetadataError = Error&{
  position?: Position;
  advise?: string;
  summary?: string;
  context?: any;
  symbol?: StaticSymbol;
  chain?: MetadataMessageChain;
};

const METADATA_ERROR = 'ngMetadataError';

function metadataError(
    message: string, summary?: string, advise?: string, position?: Position, symbol?: StaticSymbol,
    context?: any, chain?: MetadataMessageChain): MetadataError {
  const error = syntaxError(message) as MetadataError;
  (error as any)[METADATA_ERROR] = true;
  if (advise) error.advise = advise;
  if (position) error.position = position;
  if (summary) error.summary = summary;
  if (context) error.context = context;
  if (chain) error.chain = chain;
  if (symbol) error.symbol = symbol;
  return error;
}

function isMetadataError(error: Error): error is MetadataError {
  return !!(error as any)[METADATA_ERROR];
}

const REFERENCE_TO_NONEXPORTED_CLASS = 'Reference to non-exported class';
const VARIABLE_NOT_INITIALIZED = 'Variable not initialized';
const DESTRUCTURE_NOT_SUPPORTED = 'Destructuring not supported';
const COULD_NOT_RESOLVE_TYPE = 'Could not resolve type';
const FUNCTION_CALL_NOT_SUPPORTED = 'Function call not supported';
const REFERENCE_TO_LOCAL_SYMBOL = 'Reference to a local symbol';
const LAMBDA_NOT_SUPPORTED = 'Lambda not supported';

function expandedMessage(message: string, context: any): string {
  switch (message) {
    case REFERENCE_TO_NONEXPORTED_CLASS:
      if (context && context.className) {
        return `References to a non-exported class are not supported in decorators but ${
            context.className} was referenced.`;
      }
      break;
    case VARIABLE_NOT_INITIALIZED:
      return 'Only initialized variables and constants can be referenced in decorators because the value of this variable is needed by the template compiler';
    case DESTRUCTURE_NOT_SUPPORTED:
      return 'Referencing an exported destructured variable or constant is not supported in decorators and this value is needed by the template compiler';
    case COULD_NOT_RESOLVE_TYPE:
      if (context && context.typeName) {
        return `Could not resolve type ${context.typeName}`;
      }
      break;
    case FUNCTION_CALL_NOT_SUPPORTED:
      if (context && context.name) {
        return `Function calls are not supported in decorators but '${context.name}' was called`;
      }
      return 'Function calls are not supported in decorators';
    case REFERENCE_TO_LOCAL_SYMBOL:
      if (context && context.name) {
        return `Reference to a local (non-exported) symbols are not supported in decorators but '${
            context.name}' was referenced`;
      }
      break;
    case LAMBDA_NOT_SUPPORTED:
      return `Function expressions are not supported in decorators`;
  }
  return message;
}

function messageAdvise(message: string, context: any): string|undefined {
  switch (message) {
    case REFERENCE_TO_NONEXPORTED_CLASS:
      if (context && context.className) {
        return `Consider exporting '${context.className}'`;
      }
      break;
    case DESTRUCTURE_NOT_SUPPORTED:
      return 'Consider simplifying to avoid destructuring';
    case REFERENCE_TO_LOCAL_SYMBOL:
      if (context && context.name) {
        return `Consider exporting '${context.name}'`;
      }
      break;
    case LAMBDA_NOT_SUPPORTED:
      return `Consider changing the function expression into an exported function`;
  }
  return undefined;
}

function errorSummary(error: MetadataError): string {
  if (error.summary) {
    return error.summary;
  }
  switch (error.message) {
    case REFERENCE_TO_NONEXPORTED_CLASS:
      if (error.context && error.context.className) {
        return `references non-exported class ${error.context.className}`;
      }
      break;
    case VARIABLE_NOT_INITIALIZED:
      return 'is not initialized';
    case DESTRUCTURE_NOT_SUPPORTED:
      return 'is a destructured variable';
    case COULD_NOT_RESOLVE_TYPE:
      return 'could not be resolved';
    case FUNCTION_CALL_NOT_SUPPORTED:
      if (error.context && error.context.name) {
        return `calls '${error.context.name}'`;
      }
      return `calls a function`;
    case REFERENCE_TO_LOCAL_SYMBOL:
      if (error.context && error.context.name) {
        return `references local variable ${error.context.name}`;
      }
      return `references a local variable`;
  }
  return 'contains the error';
}

function mapStringMap(input: {[key: string]: any}, transform: (value: any, key: string) => any):
    {[key: string]: any} {
  if (!input) return {};
  const result: {[key: string]: any} = {};
  Object.keys(input).forEach((key) => {
    const value = transform(input[key], key);
    if (!shouldIgnore(value)) {
      if (HIDDEN_KEY.test(key)) {
        Object.defineProperty(result, key, {enumerable: false, configurable: true, value: value});
      } else {
        result[key] = value;
      }
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
  constructor(private bindings: Map<string, any>) {
    super();
  }

  override resolve(name: string): any {
    return this.bindings.has(name) ? this.bindings.get(name) : BindingScope.missing;
  }
}

function formatMetadataMessageChain(
    chain: MetadataMessageChain, advise: string|undefined): FormattedMessageChain {
  const expanded = expandedMessage(chain.message, chain.context);
  const nesting = chain.symbol ? ` in '${chain.symbol.name}'` : '';
  const message = `${expanded}${nesting}`;
  const position = chain.position;
  const next: FormattedMessageChain|undefined = chain.next ?
      formatMetadataMessageChain(chain.next, advise) :
      advise ? {message: advise} : undefined;
  return {message, position, next: next ? [next] : undefined};
}

function formatMetadataError(e: Error, context: StaticSymbol): Error {
  if (isMetadataError(e)) {
    // Produce a formatted version of the and leaving enough information in the original error
    // to recover the formatting information to eventually produce a diagnostic error message.
    const position = e.position;
    const chain: MetadataMessageChain = {
      message: `Error during template compile of '${context.name}'`,
      position: position,
      next: {message: e.message, next: e.chain, context: e.context, symbol: e.symbol}
    };
    const advise = e.advise || messageAdvise(e.message, e.context);
    return formattedError(formatMetadataMessageChain(chain, advise));
  }
  return e;
}
