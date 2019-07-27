/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../../src/ngtsc/file_system';
import {ClassDeclaration, ClassMember, ClassMemberKind, ClassSymbol, CtorParameter, Declaration, Decorator, TypeScriptReflectionHost, isDecoratorIdentifier, reflectObjectLiteral} from '../../../src/ngtsc/reflection';
import {Logger} from '../logging/logger';
import {BundleProgram} from '../packages/bundle_program';
import {findAll, getNameText, hasNameIdentifier, isDefined, stripDollarSuffix} from '../utils';

import {ModuleWithProvidersFunction, NgccReflectionHost, PRE_R3_MARKER, SwitchableVariableDeclaration, isSwitchableVariableDeclaration} from './ngcc_host';

export const DECORATORS = 'decorators' as ts.__String;
export const PROP_DECORATORS = 'propDecorators' as ts.__String;
export const CONSTRUCTOR = '__constructor' as ts.__String;
export const CONSTRUCTOR_PARAMS = 'ctorParameters' as ts.__String;

/**
 * Esm2015 packages contain ECMAScript 2015 classes, etc.
 * Decorators are defined via static properties on the class. For example:
 *
 * ```
 * class SomeDirective {
 * }
 * SomeDirective.decorators = [
 *   { type: Directive, args: [{ selector: '[someDirective]' },] }
 * ];
 * SomeDirective.ctorParameters = () => [
 *   { type: ViewContainerRef, },
 *   { type: TemplateRef, },
 *   { type: undefined, decorators: [{ type: Inject, args: [INJECTED_TOKEN,] },] },
 * ];
 * SomeDirective.propDecorators = {
 *   "input1": [{ type: Input },],
 *   "input2": [{ type: Input },],
 * };
 * ```
 *
 * * Classes are decorated if they have a static property called `decorators`.
 * * Members are decorated if there is a matching key on a static property
 *   called `propDecorators`.
 * * Constructor parameters decorators are found on an object returned from
 *   a static method called `ctorParameters`.
 */
export class Esm2015ReflectionHost extends TypeScriptReflectionHost implements NgccReflectionHost {
  protected dtsDeclarationMap: Map<string, ts.Declaration>|null;

  /**
   * The set of source files that have already been preprocessed.
   */
  protected preprocessedSourceFiles = new Set<ts.SourceFile>();

  /**
   * In ES2015, class declarations may have been down-leveled into variable declarations,
   * initialized using a class expression. In certain scenarios, an additional variable
   * is introduced that represents the class so that results in code such as:
   *
   * ```
   * let MyClass_1; let MyClass = MyClass_1 = class MyClass {};
   * ```
   *
   * This map tracks those aliased variables to their original identifier, i.e. the key
   * corresponds with the declaration of `MyClass_1` and its value becomes the `MyClass` identifier
   * of the variable declaration.
   *
   * This map is populated during the preprocessing of each source file.
   */
  protected aliasedClassDeclarations = new Map<ts.Declaration, ts.Identifier>();

  /**
   * Caches the information of the decorators on a class, as the work involved with extracting
   * decorators is complex and frequently used.
   *
   * This map is lazily populated during the first call to `acquireDecoratorInfo` for a given class.
   */
  protected decoratorCache = new Map<ClassDeclaration, DecoratorInfo>();

  constructor(
      protected logger: Logger, protected isCore: boolean, checker: ts.TypeChecker,
      dts?: BundleProgram|null) {
    super(checker);
    this.dtsDeclarationMap = dts && this.computeDtsDeclarationMap(dts.path, dts.program) || null;
  }

  /**
   * Find the declaration of a node that we think is a class.
   * Classes should have a `name` identifier, because they may need to be referenced in other parts
   * of the program.
   *
   * In ES2015, a class may be declared using a variable declaration of the following structure:
   *
   * ```
   * var MyClass = MyClass_1 = class MyClass {};
   * ```
   *
   * Here, the intermediate `MyClass_1` assignment is optional. In the above example, the
   * `class MyClass {}` node is returned as declaration of `MyClass`.
   *
   * @param node the node that represents the class whose declaration we are finding.
   * @returns the declaration of the class or `undefined` if it is not a "class".
   */
  getClassDeclaration(node: ts.Node): ClassDeclaration|undefined {
    return getInnerClassDeclaration(node) || undefined;
  }

  /**
   * Find a symbol for a node that we think is a class.
   * @param node the node whose symbol we are finding.
   * @returns the symbol for the node or `undefined` if it is not a "class" or has no symbol.
   */
  getClassSymbol(declaration: ts.Node): ClassSymbol|undefined {
    const classDeclaration = this.getClassDeclaration(declaration);
    return classDeclaration &&
        this.checker.getSymbolAtLocation(classDeclaration.name) as ClassSymbol;
  }

  /**
   * Examine a declaration (for example, of a class or function) and return metadata about any
   * decorators present on the declaration.
   *
   * @param declaration a TypeScript `ts.Declaration` node representing the class or function over
   * which to reflect. For example, if the intent is to reflect the decorators of a class and the
   * source is in ES6 format, this will be a `ts.ClassDeclaration` node. If the source is in ES5
   * format, this might be a `ts.VariableDeclaration` as classes in ES5 are represented as the
   * result of an IIFE execution.
   *
   * @returns an array of `Decorator` metadata if decorators are present on the declaration, or
   * `null` if either no decorators were present or if the declaration is not of a decoratable type.
   */
  getDecoratorsOfDeclaration(declaration: ts.Declaration): Decorator[]|null {
    const symbol = this.getClassSymbol(declaration);
    if (!symbol) {
      return null;
    }
    return this.getDecoratorsOfSymbol(symbol);
  }

  /**
   * Examine a declaration which should be of a class, and return metadata about the members of the
   * class.
   *
   * @param clazz a `ClassDeclaration` representing the class over which to reflect.
   *
   * @returns an array of `ClassMember` metadata representing the members of the class.
   *
   * @throws if `declaration` does not resolve to a class declaration.
   */
  getMembersOfClass(clazz: ClassDeclaration): ClassMember[] {
    const classSymbol = this.getClassSymbol(clazz);
    if (!classSymbol) {
      throw new Error(`Attempted to get members of a non-class: "${clazz.getText()}"`);
    }

    return this.getMembersOfSymbol(classSymbol);
  }

  /**
   * Reflect over the constructor of a class and return metadata about its parameters.
   *
   * This method only looks at the constructor of a class directly and not at any inherited
   * constructors.
   *
   * @param clazz a `ClassDeclaration` representing the class over which to reflect.
   *
   * @returns an array of `Parameter` metadata representing the parameters of the constructor, if
   * a constructor exists. If the constructor exists and has 0 parameters, this array will be empty.
   * If the class has no constructor, this method returns `null`.
   *
   * @throws if `declaration` does not resolve to a class declaration.
   */
  getConstructorParameters(clazz: ClassDeclaration): CtorParameter[]|null {
    const classSymbol = this.getClassSymbol(clazz);
    if (!classSymbol) {
      throw new Error(
          `Attempted to get constructor parameters of a non-class: "${clazz.getText()}"`);
    }
    const parameterNodes = this.getConstructorParameterDeclarations(classSymbol);
    if (parameterNodes) {
      return this.getConstructorParamInfo(classSymbol, parameterNodes);
    }
    return null;
  }

  hasBaseClass(clazz: ClassDeclaration): boolean {
    const superHasBaseClass = super.hasBaseClass(clazz);
    if (superHasBaseClass) {
      return superHasBaseClass;
    }

    const innerClassDeclaration = getInnerClassDeclaration(clazz);
    if (innerClassDeclaration === null) {
      return false;
    }

    return super.hasBaseClass(innerClassDeclaration);
  }

  getBaseClassExpression(clazz: ClassDeclaration): ts.Expression|null {
    // First try getting the base class from the "outer" declaration
    const superBaseClassIdentifier = super.getBaseClassExpression(clazz);
    if (superBaseClassIdentifier) {
      return superBaseClassIdentifier;
    }
    // That didn't work so now try getting it from the "inner" declaration.
    const innerClassDeclaration = getInnerClassDeclaration(clazz);
    if (innerClassDeclaration === null) {
      return null;
    }
    return super.getBaseClassExpression(innerClassDeclaration);
  }

  /**
   * Check whether the given node actually represents a class.
   */
  isClass(node: ts.Node): node is ClassDeclaration {
    return super.isClass(node) || !!this.getClassDeclaration(node);
  }

  /**
   * Trace an identifier to its declaration, if possible.
   *
   * This method attempts to resolve the declaration of the given identifier, tracing back through
   * imports and re-exports until the original declaration statement is found. A `Declaration`
   * object is returned if the original declaration is found, or `null` is returned otherwise.
   *
   * In ES2015, we need to account for identifiers that refer to aliased class declarations such as
   * `MyClass_1`. Since such declarations are only available within the module itself, we need to
   * find the original class declaration, e.g. `MyClass`, that is associated with the aliased one.
   *
   * @param id a TypeScript `ts.Identifier` to trace back to a declaration.
   *
   * @returns metadata about the `Declaration` if the original declaration is found, or `null`
   * otherwise.
   */
  getDeclarationOfIdentifier(id: ts.Identifier): Declaration|null {
    const superDeclaration = super.getDeclarationOfIdentifier(id);

    // The identifier may have been of an additional class assignment such as `MyClass_1` that was
    // present as alias for `MyClass`. If so, resolve such aliases to their original declaration.
    if (superDeclaration !== null) {
      const aliasedIdentifier = this.resolveAliasedClassIdentifier(superDeclaration.node);
      if (aliasedIdentifier !== null) {
        return this.getDeclarationOfIdentifier(aliasedIdentifier);
      }
    }

    return superDeclaration;
  }

  /** Gets all decorators of the given class symbol. */
  getDecoratorsOfSymbol(symbol: ClassSymbol): Decorator[]|null {
    const {classDecorators} = this.acquireDecoratorInfo(symbol);
    return classDecorators;
  }

  /**
   * Search the given module for variable declarations in which the initializer
   * is an identifier marked with the `PRE_R3_MARKER`.
   * @param module the module in which to search for switchable declarations.
   * @returns an array of variable declarations that match.
   */
  getSwitchableDeclarations(module: ts.Node): SwitchableVariableDeclaration[] {
    // Don't bother to walk the AST if the marker is not found in the text
    return module.getText().indexOf(PRE_R3_MARKER) >= 0 ?
        findAll(module, isSwitchableVariableDeclaration) :
        [];
  }

  getVariableValue(declaration: ts.VariableDeclaration): ts.Expression|null {
    const value = super.getVariableValue(declaration);
    if (value) {
      return value;
    }

    // We have a variable declaration that has no initializer. For example:
    //
    // ```
    // var HttpClientXsrfModule_1;
    // ```
    //
    // So look for the special scenario where the variable is being assigned in
    // a nearby statement to the return value of a call to `__decorate`.
    // Then find the 2nd argument of that call, the "target", which will be the
    // actual class identifier. For example:
    //
    // ```
    // HttpClientXsrfModule = HttpClientXsrfModule_1 = tslib_1.__decorate([
    //   NgModule({
    //     providers: [],
    //   })
    // ], HttpClientXsrfModule);
    // ```
    //
    // And finally, find the declaration of the identifier in that argument.
    // Note also that the assignment can occur within another assignment.
    //
    const block = declaration.parent.parent.parent;
    const symbol = this.checker.getSymbolAtLocation(declaration.name);
    if (symbol && (ts.isBlock(block) || ts.isSourceFile(block))) {
      const decorateCall = this.findDecoratedVariableValue(block, symbol);
      const target = decorateCall && decorateCall.arguments[1];
      if (target && ts.isIdentifier(target)) {
        const targetSymbol = this.checker.getSymbolAtLocation(target);
        const targetDeclaration = targetSymbol && targetSymbol.valueDeclaration;
        if (targetDeclaration) {
          if (ts.isClassDeclaration(targetDeclaration) ||
              ts.isFunctionDeclaration(targetDeclaration)) {
            // The target is just a function or class declaration
            // so return its identifier as the variable value.
            return targetDeclaration.name || null;
          } else if (ts.isVariableDeclaration(targetDeclaration)) {
            // The target is a variable declaration, so find the far right expression,
            // in the case of multiple assignments (e.g. `var1 = var2 = value`).
            let targetValue = targetDeclaration.initializer;
            while (targetValue && isAssignment(targetValue)) {
              targetValue = targetValue.right;
            }
            if (targetValue) {
              return targetValue;
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * Find all top-level class symbols in the given file.
   * @param sourceFile The source file to search for classes.
   * @returns An array of class symbols.
   */
  findClassSymbols(sourceFile: ts.SourceFile): ClassSymbol[] {
    const classes: ClassSymbol[] = [];
    this.getModuleStatements(sourceFile).forEach(statement => {
      if (ts.isVariableStatement(statement)) {
        statement.declarationList.declarations.forEach(declaration => {
          const classSymbol = this.getClassSymbol(declaration);
          if (classSymbol) {
            classes.push(classSymbol);
          }
        });
      } else if (ts.isClassDeclaration(statement)) {
        const classSymbol = this.getClassSymbol(statement);
        if (classSymbol) {
          classes.push(classSymbol);
        }
      }
    });
    return classes;
  }

  /**
   * Get the number of generic type parameters of a given class.
   *
   * @param clazz a `ClassDeclaration` representing the class over which to reflect.
   *
   * @returns the number of type parameters of the class, if known, or `null` if the declaration
   * is not a class or has an unknown number of type parameters.
   */
  getGenericArityOfClass(clazz: ClassDeclaration): number|null {
    const dtsDeclaration = this.getDtsDeclaration(clazz);
    if (dtsDeclaration && ts.isClassDeclaration(dtsDeclaration)) {
      return dtsDeclaration.typeParameters ? dtsDeclaration.typeParameters.length : 0;
    }
    return null;
  }

  /**
   * Take an exported declaration of a class (maybe down-leveled to a variable) and look up the
   * declaration of its type in a separate .d.ts tree.
   *
   * This function is allowed to return `null` if the current compilation unit does not have a
   * separate .d.ts tree. When compiling TypeScript code this is always the case, since .d.ts files
   * are produced only during the emit of such a compilation. When compiling .js code, however,
   * there is frequently a parallel .d.ts tree which this method exposes.
   *
   * Note that the `ts.ClassDeclaration` returned from this function may not be from the same
   * `ts.Program` as the input declaration.
   */
  getDtsDeclaration(declaration: ts.Declaration): ts.Declaration|null {
    if (!this.dtsDeclarationMap) {
      return null;
    }
    if (!isNamedDeclaration(declaration)) {
      throw new Error(
          `Cannot get the dts file for a declaration that has no name: ${declaration.getText()} in ${declaration.getSourceFile().fileName}`);
    }
    return this.dtsDeclarationMap.has(declaration.name.text) ?
        this.dtsDeclarationMap.get(declaration.name.text) ! :
        null;
  }

  /**
   * Search the given source file for exported functions and static class methods that return
   * ModuleWithProviders objects.
   * @param f The source file to search for these functions
   * @returns An array of function declarations that look like they return ModuleWithProviders
   * objects.
   */
  getModuleWithProvidersFunctions(f: ts.SourceFile): ModuleWithProvidersFunction[] {
    const exports = this.getExportsOfModule(f);
    if (!exports) return [];
    const infos: ModuleWithProvidersFunction[] = [];
    exports.forEach((declaration, name) => {
      if (this.isClass(declaration.node)) {
        this.getMembersOfClass(declaration.node).forEach(member => {
          if (member.isStatic) {
            const info = this.parseForModuleWithProviders(
                member.name, member.node, member.implementation, declaration.node);
            if (info) {
              infos.push(info);
            }
          }
        });
      } else {
        if (isNamedDeclaration(declaration.node)) {
          const info =
              this.parseForModuleWithProviders(declaration.node.name.text, declaration.node);
          if (info) {
            infos.push(info);
          }
        }
      }
    });
    return infos;
  }

  ///////////// Protected Helpers /////////////

  /**
   * Finds the identifier of the actual class declaration for a potentially aliased declaration of a
   * class.
   *
   * If the given declaration is for an alias of a class, this function will determine an identifier
   * to the original declaration that represents this class.
   *
   * @param declaration The declaration to resolve.
   * @returns The original identifier that the given class declaration resolves to, or `undefined`
   * if the declaration does not represent an aliased class.
   */
  protected resolveAliasedClassIdentifier(declaration: ts.Declaration): ts.Identifier|null {
    this.ensurePreprocessed(declaration.getSourceFile());
    return this.aliasedClassDeclarations.has(declaration) ?
        this.aliasedClassDeclarations.get(declaration) ! :
        null;
  }

  /**
   * Ensures that the source file that `node` is part of has been preprocessed.
   *
   * During preprocessing, all statements in the source file will be visited such that certain
   * processing steps can be done up-front and cached for subsequent usages.
   *
   * @param sourceFile The source file that needs to have gone through preprocessing.
   */
  protected ensurePreprocessed(sourceFile: ts.SourceFile): void {
    if (!this.preprocessedSourceFiles.has(sourceFile)) {
      this.preprocessedSourceFiles.add(sourceFile);

      for (const statement of sourceFile.statements) {
        this.preprocessStatement(statement);
      }
    }
  }

  /**
   * Analyzes the given statement to see if it corresponds with a variable declaration like
   * `let MyClass = MyClass_1 = class MyClass {};`. If so, the declaration of `MyClass_1`
   * is associated with the `MyClass` identifier.
   *
   * @param statement The statement that needs to be preprocessed.
   */
  protected preprocessStatement(statement: ts.Statement): void {
    if (!ts.isVariableStatement(statement)) {
      return;
    }

    const declarations = statement.declarationList.declarations;
    if (declarations.length !== 1) {
      return;
    }

    const declaration = declarations[0];
    const initializer = declaration.initializer;
    if (!ts.isIdentifier(declaration.name) || !initializer || !isAssignment(initializer) ||
        !ts.isIdentifier(initializer.left) || !ts.isClassExpression(initializer.right)) {
      return;
    }

    const aliasedIdentifier = initializer.left;

    const aliasedDeclaration = this.getDeclarationOfIdentifier(aliasedIdentifier);
    if (aliasedDeclaration === null) {
      throw new Error(
          `Unable to locate declaration of ${aliasedIdentifier.text} in "${statement.getText()}"`);
    }
    this.aliasedClassDeclarations.set(aliasedDeclaration.node, declaration.name);
  }

  /** Get the top level statements for a module.
   *
   * In ES5 and ES2015 this is just the top level statements of the file.
   * @param sourceFile The module whose statements we want.
   * @returns An array of top level statements for the given module.
   */
  protected getModuleStatements(sourceFile: ts.SourceFile): ts.Statement[] {
    return Array.from(sourceFile.statements);
  }

  /**
   * Walk the AST looking for an assignment to the specified symbol.
   * @param node The current node we are searching.
   * @returns an expression that represents the value of the variable, or undefined if none can be
   * found.
   */
  protected findDecoratedVariableValue(node: ts.Node|undefined, symbol: ts.Symbol):
      ts.CallExpression|null {
    if (!node) {
      return null;
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
      const left = node.left;
      const right = node.right;
      if (ts.isIdentifier(left) && this.checker.getSymbolAtLocation(left) === symbol) {
        return (ts.isCallExpression(right) && getCalleeName(right) === '__decorate') ? right : null;
      }
      return this.findDecoratedVariableValue(right, symbol);
    }
    return node.forEachChild(node => this.findDecoratedVariableValue(node, symbol)) || null;
  }

  /**
   * Try to retrieve the symbol of a static property on a class.
   * @param symbol the class whose property we are interested in.
   * @param propertyName the name of static property.
   * @returns the symbol if it is found or `undefined` if not.
   */
  protected getStaticProperty(symbol: ClassSymbol, propertyName: ts.__String): ts.Symbol|undefined {
    return symbol.exports && symbol.exports.get(propertyName);
  }

  /**
   * This is the main entry-point for obtaining information on the decorators of a given class. This
   * information is computed either from static properties if present, or using `tslib.__decorate`
   * helper calls otherwise. The computed result is cached per class.
   *
   * @param classSymbol the class for which decorators should be acquired.
   * @returns all information of the decorators on the class.
   */
  protected acquireDecoratorInfo(classSymbol: ClassSymbol): DecoratorInfo {
    if (this.decoratorCache.has(classSymbol.valueDeclaration)) {
      return this.decoratorCache.get(classSymbol.valueDeclaration) !;
    }

    // First attempt extracting decorators from static properties.
    let decoratorInfo = this.computeDecoratorInfoFromStaticProperties(classSymbol);
    if (decoratorInfo === null) {
      // If none were present, use the `__decorate` helper calls instead.
      decoratorInfo = this.computeDecoratorInfoFromHelperCalls(classSymbol);
    }

    this.decoratorCache.set(classSymbol.valueDeclaration, decoratorInfo);
    return decoratorInfo;
  }

  /**
   * Attempts to compute decorator information from static properties "decorators", "propDecorators"
   * and "ctorParameters" on the class. If neither of these static properties is present the
   * library is likely not compiled using tsickle for usage with Closure compiler, in which case
   * `null` is returned.
   *
   * @param classSymbol The class symbol to compute the decorators information for.
   * @returns All information on the decorators as extracted from static properties, or `null` if
   * none of the static properties exist.
   */
  protected computeDecoratorInfoFromStaticProperties(classSymbol: ClassSymbol): DecoratorInfo|null {
    let classDecorators: Decorator[]|null = null;
    let memberDecorators: Map<string, Decorator[]>|null = null;
    let constructorParamInfo: ParamInfo[]|null = null;

    const decoratorsProperty = this.getStaticProperty(classSymbol, DECORATORS);
    if (decoratorsProperty !== undefined) {
      classDecorators = this.getClassDecoratorsFromStaticProperty(decoratorsProperty);
    }

    const propDecoratorsProperty = this.getStaticProperty(classSymbol, PROP_DECORATORS);
    if (propDecoratorsProperty !== undefined) {
      memberDecorators = this.getMemberDecoratorsFromStaticProperty(propDecoratorsProperty);
    }

    const constructorParamsProperty = this.getStaticProperty(classSymbol, CONSTRUCTOR_PARAMS);
    if (constructorParamsProperty !== undefined) {
      constructorParamInfo = this.getParamInfoFromStaticProperty(constructorParamsProperty);
    }

    // If none of the static properties were present, no decorator info could be computed.
    if (classDecorators === null && memberDecorators === null && constructorParamInfo === null) {
      return null;
    }

    return {
      classDecorators,
      memberDecorators: memberDecorators || new Map<string, Decorator[]>(),
      constructorParamInfo: constructorParamInfo || [],
    };
  }

  /**
   * Get all class decorators for the given class, where the decorators are declared
   * via a static property. For example:
   *
   * ```
   * class SomeDirective {}
   * SomeDirective.decorators = [
   *   { type: Directive, args: [{ selector: '[someDirective]' },] }
   * ];
   * ```
   *
   * @param decoratorsSymbol the property containing the decorators we want to get.
   * @returns an array of decorators or null if none where found.
   */
  protected getClassDecoratorsFromStaticProperty(decoratorsSymbol: ts.Symbol): Decorator[]|null {
    const decoratorsIdentifier = decoratorsSymbol.valueDeclaration;
    if (decoratorsIdentifier && decoratorsIdentifier.parent) {
      if (ts.isBinaryExpression(decoratorsIdentifier.parent) &&
          decoratorsIdentifier.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
        // AST of the array of decorator values
        const decoratorsArray = decoratorsIdentifier.parent.right;
        return this.reflectDecorators(decoratorsArray)
            .filter(decorator => this.isFromCore(decorator));
      }
    }
    return null;
  }

  /**
   * Examine a symbol which should be of a class, and return metadata about its members.
   *
   * @param symbol the `ClassSymbol` representing the class over which to reflect.
   * @returns an array of `ClassMember` metadata representing the members of the class.
   */
  protected getMembersOfSymbol(symbol: ClassSymbol): ClassMember[] {
    const members: ClassMember[] = [];

    // The decorators map contains all the properties that are decorated
    const {memberDecorators} = this.acquireDecoratorInfo(symbol);

    // Make a copy of the decorators as successfully reflected members delete themselves from the
    // map, so that any leftovers can be easily dealt with.
    const decoratorsMap = new Map(memberDecorators);

    // The member map contains all the method (instance and static); and any instance properties
    // that are initialized in the class.
    if (symbol.members) {
      symbol.members.forEach((value, key) => {
        const decorators = decoratorsMap.get(key as string);
        const reflectedMembers = this.reflectMembers(value, decorators);
        if (reflectedMembers) {
          decoratorsMap.delete(key as string);
          members.push(...reflectedMembers);
        }
      });
    }

    // The static property map contains all the static properties
    if (symbol.exports) {
      symbol.exports.forEach((value, key) => {
        const decorators = decoratorsMap.get(key as string);
        const reflectedMembers = this.reflectMembers(value, decorators, true);
        if (reflectedMembers) {
          decoratorsMap.delete(key as string);
          members.push(...reflectedMembers);
        }
      });
    }

    // If this class was declared as a VariableDeclaration then it may have static properties
    // attached to the variable rather than the class itself
    // For example:
    // ```
    // let MyClass = class MyClass {
    //   // no static properties here!
    // }
    // MyClass.staticProperty = ...;
    // ```
    const variableDeclaration = getVariableDeclarationOfDeclaration(symbol.valueDeclaration);
    if (variableDeclaration !== undefined) {
      const variableSymbol = this.checker.getSymbolAtLocation(variableDeclaration.name);
      if (variableSymbol && variableSymbol.exports) {
        variableSymbol.exports.forEach((value, key) => {
          const decorators = decoratorsMap.get(key as string);
          const reflectedMembers = this.reflectMembers(value, decorators, true);
          if (reflectedMembers) {
            decoratorsMap.delete(key as string);
            members.push(...reflectedMembers);
          }
        });
      }
    }

    // Deal with any decorated properties that were not initialized in the class
    decoratorsMap.forEach((value, key) => {
      members.push({
        implementation: null,
        decorators: value,
        isStatic: false,
        kind: ClassMemberKind.Property,
        name: key,
        nameNode: null,
        node: null,
        type: null,
        value: null
      });
    });

    return members;
  }

  /**
   * Member decorators may be declared as static properties of the class:
   *
   * ```
   * SomeDirective.propDecorators = {
   *   "ngForOf": [{ type: Input },],
   *   "ngForTrackBy": [{ type: Input },],
   *   "ngForTemplate": [{ type: Input },],
   * };
   * ```
   *
   * @param decoratorsProperty the class whose member decorators we are interested in.
   * @returns a map whose keys are the name of the members and whose values are collections of
   * decorators for the given member.
   */
  protected getMemberDecoratorsFromStaticProperty(decoratorsProperty: ts.Symbol):
      Map<string, Decorator[]> {
    const memberDecorators = new Map<string, Decorator[]>();
    // Symbol of the identifier for `SomeDirective.propDecorators`.
    const propDecoratorsMap = getPropertyValueFromSymbol(decoratorsProperty);
    if (propDecoratorsMap && ts.isObjectLiteralExpression(propDecoratorsMap)) {
      const propertiesMap = reflectObjectLiteral(propDecoratorsMap);
      propertiesMap.forEach((value, name) => {
        const decorators =
            this.reflectDecorators(value).filter(decorator => this.isFromCore(decorator));
        if (decorators.length) {
          memberDecorators.set(name, decorators);
        }
      });
    }
    return memberDecorators;
  }

  /**
   * For a given class symbol, collects all decorator information from tslib helper methods, as
   * generated by TypeScript into emitted JavaScript files.
   *
   * Class decorators are extracted from calls to `tslib.__decorate` that look as follows:
   *
   * ```
   * let SomeDirective = class SomeDirective {}
   * SomeDirective = __decorate([
   *   Directive({ selector: '[someDirective]' }),
   * ], SomeDirective);
   * ```
   *
   * The extraction of member decorators is similar, with the distinction that its 2nd and 3rd
   * argument correspond with a "prototype" target and the name of the member to which the
   * decorators apply.
   *
   * ```
   * __decorate([
   *     Input(),
   *     __metadata("design:type", String)
   * ], SomeDirective.prototype, "input1", void 0);
   * ```
   *
   * @param classSymbol The class symbol for which decorators should be extracted.
   * @returns All information on the decorators of the class.
   */
  protected computeDecoratorInfoFromHelperCalls(classSymbol: ClassSymbol): DecoratorInfo {
    let classDecorators: Decorator[]|null = null;
    const memberDecorators = new Map<string, Decorator[]>();
    const constructorParamInfo: ParamInfo[] = [];

    const getConstructorParamInfo = (index: number) => {
      let param = constructorParamInfo[index];
      if (param === undefined) {
        param = constructorParamInfo[index] = {decorators: null, typeExpression: null};
      }
      return param;
    };

    // All relevant information can be extracted from calls to `__decorate`, obtain these first.
    // Note that although the helper calls are retrieved using the class symbol, the result may
    // contain helper calls corresponding with unrelated classes. Therefore, each helper call still
    // has to be checked to actually correspond with the class symbol.
    const helperCalls = this.getHelperCallsForClass(classSymbol, '__decorate');

    for (const helperCall of helperCalls) {
      if (isClassDecorateCall(helperCall, classSymbol.name)) {
        // This `__decorate` call is targeting the class itself.
        const helperArgs = helperCall.arguments[0];

        for (const element of helperArgs.elements) {
          const entry = this.reflectDecorateHelperEntry(element);
          if (entry === null) {
            continue;
          }

          if (entry.type === 'decorator') {
            // The helper arg was reflected to represent an actual decorator
            if (this.isFromCore(entry.decorator)) {
              (classDecorators || (classDecorators = [])).push(entry.decorator);
            }
          } else if (entry.type === 'param:decorators') {
            // The helper arg represents a decorator for a parameter. Since it's applied to the
            // class, it corresponds with a constructor parameter of the class.
            const param = getConstructorParamInfo(entry.index);
            (param.decorators || (param.decorators = [])).push(entry.decorator);
          } else if (entry.type === 'params') {
            // The helper arg represents the types of the parameters. Since it's applied to the
            // class, it corresponds with the constructor parameters of the class.
            entry.types.forEach(
                (type, index) => getConstructorParamInfo(index).typeExpression = type);
          }
        }
      } else if (isMemberDecorateCall(helperCall, classSymbol.name)) {
        // The `__decorate` call is targeting a member of the class
        const helperArgs = helperCall.arguments[0];
        const memberName = helperCall.arguments[2].text;

        for (const element of helperArgs.elements) {
          const entry = this.reflectDecorateHelperEntry(element);
          if (entry === null) {
            continue;
          }

          if (entry.type === 'decorator') {
            // The helper arg was reflected to represent an actual decorator.
            if (this.isFromCore(entry.decorator)) {
              const decorators =
                  memberDecorators.has(memberName) ? memberDecorators.get(memberName) ! : [];
              decorators.push(entry.decorator);
              memberDecorators.set(memberName, decorators);
            }
          } else {
            // Information on decorated parameters is not interesting for ngcc, so it's ignored.
          }
        }
      }
    }

    return {classDecorators, memberDecorators, constructorParamInfo};
  }

  /**
   * Extract the details of an entry within a `__decorate` helper call. For example, given the
   * following code:
   *
   * ```
   * __decorate([
   *   Directive({ selector: '[someDirective]' }),
   *   tslib_1.__param(2, Inject(INJECTED_TOKEN)),
   *   tslib_1.__metadata("design:paramtypes", [ViewContainerRef, TemplateRef, String])
   * ], SomeDirective);
   * ```
   *
   * it can be seen that there are calls to regular decorators (the `Directive`) and calls into
   * `tslib` functions which have been inserted by TypeScript. Therefore, this function classifies
   * a call to correspond with
   *   1. a real decorator like `Directive` above, or
   *   2. a decorated parameter, corresponding with `__param` calls from `tslib`, or
   *   3. the type information of parameters, corresponding with `__metadata` call from `tslib`
   *
   * @param expression the expression that needs to be reflected into a `DecorateHelperEntry`
   * @returns an object that indicates which of the three categories the call represents, together
   * with the reflected information of the call, or null if the call is not a valid decorate call.
   */
  protected reflectDecorateHelperEntry(expression: ts.Expression): DecorateHelperEntry|null {
    // We only care about those elements that are actual calls
    if (!ts.isCallExpression(expression)) {
      return null;
    }
    const call = expression;

    const helperName = getCalleeName(call);
    if (helperName === '__metadata') {
      // This is a `tslib.__metadata` call, reflect to arguments into a `ParameterTypes` object
      // if the metadata key is "design:paramtypes".
      const key = call.arguments[0];
      if (key === undefined || !ts.isStringLiteral(key) || key.text !== 'design:paramtypes') {
        return null;
      }

      const value = call.arguments[1];
      if (value === undefined || !ts.isArrayLiteralExpression(value)) {
        return null;
      }

      return {
        type: 'params',
        types: Array.from(value.elements),
      };
    }

    if (helperName === '__param') {
      // This is a `tslib.__param` call that is reflected into a `ParameterDecorators` object.
      const indexArg = call.arguments[0];
      const index = indexArg && ts.isNumericLiteral(indexArg) ? parseInt(indexArg.text, 10) : NaN;
      if (isNaN(index)) {
        return null;
      }

      const decoratorCall = call.arguments[1];
      if (decoratorCall === undefined || !ts.isCallExpression(decoratorCall)) {
        return null;
      }

      const decorator = this.reflectDecoratorCall(decoratorCall);
      if (decorator === null) {
        return null;
      }

      return {
        type: 'param:decorators',
        index,
        decorator,
      };
    }

    // Otherwise attempt to reflect it as a regular decorator.
    const decorator = this.reflectDecoratorCall(call);
    if (decorator === null) {
      return null;
    }
    return {
      type: 'decorator',
      decorator,
    };
  }

  protected reflectDecoratorCall(call: ts.CallExpression): Decorator|null {
    const decoratorExpression = call.expression;
    if (!isDecoratorIdentifier(decoratorExpression)) {
      return null;
    }

    // We found a decorator!
    const decoratorIdentifier =
        ts.isIdentifier(decoratorExpression) ? decoratorExpression : decoratorExpression.name;

    return {
      name: decoratorIdentifier.text,
      identifier: decoratorExpression,
      import: this.getImportOfIdentifier(decoratorIdentifier),
      node: call,
      args: Array.from(call.arguments),
    };
  }

  /**
   * Check the given statement to see if it is a call to the specified helper function or null if
   * not found.
   *
   * Matching statements will look like:  `tslib_1.__decorate(...);`.
   * @param statement the statement that may contain the call.
   * @param helperName the name of the helper we are looking for.
   * @returns the node that corresponds to the `__decorate(...)` call or null if the statement
   * does not match.
   */
  protected getHelperCall(statement: ts.Statement, helperName: string): ts.CallExpression|null {
    if (ts.isExpressionStatement(statement)) {
      let expression = statement.expression;
      while (isAssignment(expression)) {
        expression = expression.right;
      }
      if (ts.isCallExpression(expression) && getCalleeName(expression) === helperName) {
        return expression;
      }
    }
    return null;
  }


  /**
   * Reflect over the given array node and extract decorator information from each element.
   *
   * This is used for decorators that are defined in static properties. For example:
   *
   * ```
   * SomeDirective.decorators = [
   *   { type: Directive, args: [{ selector: '[someDirective]' },] }
   * ];
   * ```
   *
   * @param decoratorsArray an expression that contains decorator information.
   * @returns an array of decorator info that was reflected from the array node.
   */
  protected reflectDecorators(decoratorsArray: ts.Expression): Decorator[] {
    const decorators: Decorator[] = [];

    if (ts.isArrayLiteralExpression(decoratorsArray)) {
      // Add each decorator that is imported from `@angular/core` into the `decorators` array
      decoratorsArray.elements.forEach(node => {

        // If the decorator is not an object literal expression then we are not interested
        if (ts.isObjectLiteralExpression(node)) {
          // We are only interested in objects of the form: `{ type: DecoratorType, args: [...] }`
          const decorator = reflectObjectLiteral(node);

          // Is the value of the `type` property an identifier?
          if (decorator.has('type')) {
            let decoratorType = decorator.get('type') !;
            if (isDecoratorIdentifier(decoratorType)) {
              const decoratorIdentifier =
                  ts.isIdentifier(decoratorType) ? decoratorType : decoratorType.name;
              decorators.push({
                name: decoratorIdentifier.text,
                identifier: decoratorType,
                import: this.getImportOfIdentifier(decoratorIdentifier), node,
                args: getDecoratorArgs(node),
              });
            }
          }
        }
      });
    }
    return decorators;
  }

  /**
   * Reflect over a symbol and extract the member information, combining it with the
   * provided decorator information, and whether it is a static member.
   *
   * A single symbol may represent multiple class members in the case of accessors;
   * an equally named getter/setter accessor pair is combined into a single symbol.
   * When the symbol is recognized as representing an accessor, its declarations are
   * analyzed such that both the setter and getter accessor are returned as separate
   * class members.
   *
   * One difference wrt the TypeScript host is that in ES2015, we cannot see which
   * accessor originally had any decorators applied to them, as decorators are applied
   * to the property descriptor in general, not a specific accessor. If an accessor
   * has both a setter and getter, any decorators are only attached to the setter member.
   *
   * @param symbol the symbol for the member to reflect over.
   * @param decorators an array of decorators associated with the member.
   * @param isStatic true if this member is static, false if it is an instance property.
   * @returns the reflected member information, or null if the symbol is not a member.
   */
  protected reflectMembers(symbol: ts.Symbol, decorators?: Decorator[], isStatic?: boolean):
      ClassMember[]|null {
    if (symbol.flags & ts.SymbolFlags.Accessor) {
      const members: ClassMember[] = [];
      const setter = symbol.declarations && symbol.declarations.find(ts.isSetAccessor);
      const getter = symbol.declarations && symbol.declarations.find(ts.isGetAccessor);

      const setterMember =
          setter && this.reflectMember(setter, ClassMemberKind.Setter, decorators, isStatic);
      if (setterMember) {
        members.push(setterMember);

        // Prevent attaching the decorators to a potential getter. In ES2015, we can't tell where
        // the decorators were originally attached to, however we only want to attach them to a
        // single `ClassMember` as otherwise ngtsc would handle the same decorators twice.
        decorators = undefined;
      }

      const getterMember =
          getter && this.reflectMember(getter, ClassMemberKind.Getter, decorators, isStatic);
      if (getterMember) {
        members.push(getterMember);
      }

      return members;
    }

    let kind: ClassMemberKind|null = null;
    if (symbol.flags & ts.SymbolFlags.Method) {
      kind = ClassMemberKind.Method;
    } else if (symbol.flags & ts.SymbolFlags.Property) {
      kind = ClassMemberKind.Property;
    }

    const node = symbol.valueDeclaration || symbol.declarations && symbol.declarations[0];
    if (!node) {
      // If the symbol has been imported from a TypeScript typings file then the compiler
      // may pass the `prototype` symbol as an export of the class.
      // But this has no declaration. In this case we just quietly ignore it.
      return null;
    }

    const member = this.reflectMember(node, kind, decorators, isStatic);
    if (!member) {
      return null;
    }

    return [member];
  }

  /**
   * Reflect over a symbol and extract the member information, combining it with the
   * provided decorator information, and whether it is a static member.
   * @param node the declaration node for the member to reflect over.
   * @param kind the assumed kind of the member, may become more accurate during reflection.
   * @param decorators an array of decorators associated with the member.
   * @param isStatic true if this member is static, false if it is an instance property.
   * @returns the reflected member information, or null if the symbol is not a member.
   */
  protected reflectMember(
      node: ts.Declaration, kind: ClassMemberKind|null, decorators?: Decorator[],
      isStatic?: boolean): ClassMember|null {
    let value: ts.Expression|null = null;
    let name: string|null = null;
    let nameNode: ts.Identifier|null = null;

    if (!isClassMemberType(node)) {
      return null;
    }

    if (isStatic && isPropertyAccess(node)) {
      name = node.name.text;
      value = kind === ClassMemberKind.Property ? node.parent.right : null;
    } else if (isThisAssignment(node)) {
      kind = ClassMemberKind.Property;
      name = node.left.name.text;
      value = node.right;
      isStatic = false;
    } else if (ts.isConstructorDeclaration(node)) {
      kind = ClassMemberKind.Constructor;
      name = 'constructor';
      isStatic = false;
    }

    if (kind === null) {
      this.logger.warn(`Unknown member type: "${node.getText()}`);
      return null;
    }

    if (!name) {
      if (isNamedDeclaration(node)) {
        name = node.name.text;
        nameNode = node.name;
      } else {
        return null;
      }
    }

    // If we have still not determined if this is a static or instance member then
    // look for the `static` keyword on the declaration
    if (isStatic === undefined) {
      isStatic = node.modifiers !== undefined &&
          node.modifiers.some(mod => mod.kind === ts.SyntaxKind.StaticKeyword);
    }

    const type: ts.TypeNode = (node as any).type || null;
    return {
      node,
      implementation: node, kind, type, name, nameNode, value, isStatic,
      decorators: decorators || []
    };
  }

  /**
   * Find the declarations of the constructor parameters of a class identified by its symbol.
   * @param classSymbol the class whose parameters we want to find.
   * @returns an array of `ts.ParameterDeclaration` objects representing each of the parameters in
   * the class's constructor or null if there is no constructor.
   */
  protected getConstructorParameterDeclarations(classSymbol: ClassSymbol):
      ts.ParameterDeclaration[]|null {
    if (classSymbol.members && classSymbol.members.has(CONSTRUCTOR)) {
      const constructorSymbol = classSymbol.members.get(CONSTRUCTOR) !;
      // For some reason the constructor does not have a `valueDeclaration` ?!?
      const constructor = constructorSymbol.declarations &&
          constructorSymbol.declarations[0] as ts.ConstructorDeclaration | undefined;
      if (!constructor) {
        return [];
      }
      if (constructor.parameters.length > 0) {
        return Array.from(constructor.parameters);
      }
      if (isSynthesizedConstructor(constructor)) {
        return null;
      }
      return [];
    }
    return null;
  }

  /**
   * Get the parameter decorators of a class constructor.
   *
   * @param classSymbol the class whose parameter info we want to get.
   * @param parameterNodes the array of TypeScript parameter nodes for this class's constructor.
   * @returns an array of constructor parameter info objects.
   */
  protected getConstructorParamInfo(
      classSymbol: ClassSymbol, parameterNodes: ts.ParameterDeclaration[]): CtorParameter[] {
    const {constructorParamInfo} = this.acquireDecoratorInfo(classSymbol);

    return parameterNodes.map((node, index) => {
      const {decorators, typeExpression} = constructorParamInfo[index] ?
          constructorParamInfo[index] :
          {decorators: null, typeExpression: null};
      const nameNode = node.name;
      return {
        name: getNameText(nameNode),
        nameNode,
        typeValueReference: typeExpression !== null ?
            {local: true as true, expression: typeExpression, defaultImportStatement: null} :
            null,
        typeNode: null, decorators
      };
    });
  }

  /**
   * Get the parameter type and decorators for the constructor of a class,
   * where the information is stored on a static property of the class.
   *
   * Note that in ESM2015, the property is defined an array, or by an arrow function that returns an
   * array, of decorator and type information.
   *
   * For example,
   *
   * ```
   * SomeDirective.ctorParameters = () => [
   *   {type: ViewContainerRef},
   *   {type: TemplateRef},
   *   {type: undefined, decorators: [{ type: Inject, args: [INJECTED_TOKEN]}]},
   * ];
   * ```
   *
   * or
   *
   * ```
   * SomeDirective.ctorParameters = [
   *   {type: ViewContainerRef},
   *   {type: TemplateRef},
   *   {type: undefined, decorators: [{type: Inject, args: [INJECTED_TOKEN]}]},
   * ];
   * ```
   *
   * @param paramDecoratorsProperty the property that holds the parameter info we want to get.
   * @returns an array of objects containing the type and decorators for each parameter.
   */
  protected getParamInfoFromStaticProperty(paramDecoratorsProperty: ts.Symbol): ParamInfo[]|null {
    const paramDecorators = getPropertyValueFromSymbol(paramDecoratorsProperty);
    if (paramDecorators) {
      // The decorators array may be wrapped in an arrow function. If so unwrap it.
      const container =
          ts.isArrowFunction(paramDecorators) ? paramDecorators.body : paramDecorators;
      if (ts.isArrayLiteralExpression(container)) {
        const elements = container.elements;
        return elements
            .map(
                element =>
                    ts.isObjectLiteralExpression(element) ? reflectObjectLiteral(element) : null)
            .map(paramInfo => {
              const typeExpression =
                  paramInfo && paramInfo.has('type') ? paramInfo.get('type') ! : null;
              const decoratorInfo =
                  paramInfo && paramInfo.has('decorators') ? paramInfo.get('decorators') ! : null;
              const decorators = decoratorInfo &&
                  this.reflectDecorators(decoratorInfo)
                      .filter(decorator => this.isFromCore(decorator));
              return {typeExpression, decorators};
            });
      } else if (paramDecorators !== undefined) {
        this.logger.warn(
            'Invalid constructor parameter decorator in ' +
                paramDecorators.getSourceFile().fileName + ':\n',
            paramDecorators.getText());
      }
    }
    return null;
  }

  /**
   * Search statements related to the given class for calls to the specified helper.
   * @param classSymbol the class whose helper calls we are interested in.
   * @param helperName the name of the helper (e.g. `__decorate`) whose calls we are interested
   * in.
   * @returns an array of CallExpression nodes for each matching helper call.
   */
  protected getHelperCallsForClass(classSymbol: ClassSymbol, helperName: string):
      ts.CallExpression[] {
    return this.getStatementsForClass(classSymbol)
        .map(statement => this.getHelperCall(statement, helperName))
        .filter(isDefined);
  }

  /**
   * Find statements related to the given class that may contain calls to a helper.
   *
   * In ESM2015 code the helper calls are in the top level module, so we have to consider
   * all the statements in the module.
   *
   * @param classSymbol the class whose helper calls we are interested in.
   * @returns an array of statements that may contain helper calls.
   */
  protected getStatementsForClass(classSymbol: ClassSymbol): ts.Statement[] {
    return Array.from(classSymbol.valueDeclaration.getSourceFile().statements);
  }

  /**
   * Test whether a decorator was imported from `@angular/core`.
   *
   * Is the decorator:
   * * externally imported from `@angular/core`?
   * * the current hosted program is actually `@angular/core` and
   *   - relatively internally imported; or
   *   - not imported, from the current file.
   *
   * @param decorator the decorator to test.
   */
  protected isFromCore(decorator: Decorator): boolean {
    if (this.isCore) {
      return !decorator.import || /^\./.test(decorator.import.from);
    } else {
      return !!decorator.import && decorator.import.from === '@angular/core';
    }
  }

  /**
   * Extract all the class declarations from the dtsTypings program, storing them in a map
   * where the key is the declared name of the class and the value is the declaration itself.
   *
   * It is possible for there to be multiple class declarations with the same local name.
   * Only the first declaration with a given name is added to the map; subsequent classes will be
   * ignored.
   *
   * We are most interested in classes that are publicly exported from the entry point, so these
   * are added to the map first, to ensure that they are not ignored.
   *
   * @param dtsRootFileName The filename of the entry-point to the `dtsTypings` program.
   * @param dtsProgram The program containing all the typings files.
   * @returns a map of class names to class declarations.
   */
  protected computeDtsDeclarationMap(dtsRootFileName: AbsoluteFsPath, dtsProgram: ts.Program):
      Map<string, ts.Declaration> {
    const dtsDeclarationMap = new Map<string, ts.Declaration>();
    const checker = dtsProgram.getTypeChecker();

    // First add all the classes that are publicly exported from the entry-point
    const rootFile = dtsProgram.getSourceFile(dtsRootFileName);
    if (!rootFile) {
      throw new Error(`The given file ${dtsRootFileName} is not part of the typings program.`);
    }
    collectExportedDeclarations(checker, dtsDeclarationMap, rootFile);

    // Now add any additional classes that are exported from individual  dts files,
    // but are not publicly exported from the entry-point.
    dtsProgram.getSourceFiles().forEach(
        sourceFile => { collectExportedDeclarations(checker, dtsDeclarationMap, sourceFile); });
    return dtsDeclarationMap;
  }

  /**
   * Parse a function/method node (or its implementation), to see if it returns a
   * `ModuleWithProviders` object.
   * @param name The name of the function.
   * @param node the node to check - this could be a function, a method or a variable declaration.
   * @param implementation the actual function expression if `node` is a variable declaration.
   * @param container the class that contains the function, if it is a method.
   * @returns info about the function if it does return a `ModuleWithProviders` object; `null`
   * otherwise.
   */
  protected parseForModuleWithProviders(
      name: string, node: ts.Node|null, implementation: ts.Node|null = node,
      container: ts.Declaration|null = null): ModuleWithProvidersFunction|null {
    if (implementation === null ||
        (!ts.isFunctionDeclaration(implementation) && !ts.isMethodDeclaration(implementation) &&
         !ts.isFunctionExpression(implementation))) {
      return null;
    }
    const declaration = implementation;
    const definition = this.getDefinitionOfFunction(declaration);
    if (definition === null) {
      return null;
    }
    const body = definition.body;
    const lastStatement = body && body[body.length - 1];
    const returnExpression =
        lastStatement && ts.isReturnStatement(lastStatement) && lastStatement.expression || null;
    const ngModuleProperty = returnExpression && ts.isObjectLiteralExpression(returnExpression) &&
            returnExpression.properties.find(
                prop =>
                    !!prop.name && ts.isIdentifier(prop.name) && prop.name.text === 'ngModule') ||
        null;

    if (!ngModuleProperty || !ts.isPropertyAssignment(ngModuleProperty)) {
      return null;
    }

    // The ngModuleValue could be of the form `SomeModule` or `namespace_1.SomeModule`
    const ngModuleValue = ngModuleProperty.initializer;
    if (!ts.isIdentifier(ngModuleValue) && !ts.isPropertyAccessExpression(ngModuleValue)) {
      return null;
    }

    const ngModuleDeclaration = this.getDeclarationOfExpression(ngModuleValue);
    if (!ngModuleDeclaration) {
      throw new Error(
          `Cannot find a declaration for NgModule ${ngModuleValue.getText()} referenced in "${declaration!.getText()}"`);
    }
    if (!hasNameIdentifier(ngModuleDeclaration.node)) {
      return null;
    }
    return {
      name,
      ngModule: ngModuleDeclaration as Declaration<ClassDeclaration>, declaration, container
    };
  }

  protected getDeclarationOfExpression(expression: ts.Expression): Declaration|null {
    if (ts.isIdentifier(expression)) {
      return this.getDeclarationOfIdentifier(expression);
    }

    if (!ts.isPropertyAccessExpression(expression) || !ts.isIdentifier(expression.expression)) {
      return null;
    }

    const namespaceDecl = this.getDeclarationOfIdentifier(expression.expression);
    if (!namespaceDecl || !ts.isSourceFile(namespaceDecl.node)) {
      return null;
    }

    const namespaceExports = this.getExportsOfModule(namespaceDecl.node);
    if (namespaceExports === null) {
      return null;
    }

    if (!namespaceExports.has(expression.name.text)) {
      return null;
    }

    const exportDecl = namespaceExports.get(expression.name.text) !;
    return {...exportDecl, viaModule: namespaceDecl.viaModule};
  }
}

///////////// Exported Helpers /////////////

export type ParamInfo = {
  decorators: Decorator[] | null,
  typeExpression: ts.Expression | null
};

/**
 * Represents a call to `tslib.__metadata` as present in `tslib.__decorate` calls. This is a
 * synthetic decorator inserted by TypeScript that contains reflection information about the
 * target of the decorator, i.e. the class or property.
 */
export interface ParameterTypes {
  type: 'params';
  types: ts.Expression[];
}

/**
 * Represents a call to `tslib.__param` as present in `tslib.__decorate` calls. This contains
 * information on any decorators were applied to a certain parameter.
 */
export interface ParameterDecorators {
  type: 'param:decorators';
  index: number;
  decorator: Decorator;
}

/**
 * Represents a call to a decorator as it was present in the original source code, as present in
 * `tslib.__decorate` calls.
 */
export interface DecoratorCall {
  type: 'decorator';
  decorator: Decorator;
}

/**
 * Represents the different kinds of decorate helpers that may be present as first argument to
 * `tslib.__decorate`, as follows:
 *
 * ```
 * __decorate([
 *   Directive({ selector: '[someDirective]' }),
 *   tslib_1.__param(2, Inject(INJECTED_TOKEN)),
 *   tslib_1.__metadata("design:paramtypes", [ViewContainerRef, TemplateRef, String])
 * ], SomeDirective);
 * ```
 */
export type DecorateHelperEntry = ParameterTypes | ParameterDecorators | DecoratorCall;

/**
 * The recorded decorator information of a single class. This information is cached in the host.
 */
interface DecoratorInfo {
  /**
   * All decorators that were present on the class. If no decorators were present, this is `null`
   */
  classDecorators: Decorator[]|null;

  /**
   * All decorators per member of the class they were present on.
   */
  memberDecorators: Map<string, Decorator[]>;

  /**
   * Represents the constructor parameter information, such as the type of a parameter and all
   * decorators for a certain parameter. Indices in this array correspond with the parameter's index
   * in the constructor. Note that this array may be sparse, i.e. certain constructor parameters may
   * not have any info recorded.
   */
  constructorParamInfo: ParamInfo[];
}

/**
 * A statement node that represents an assignment.
 */
export type AssignmentStatement =
    ts.ExpressionStatement & {expression: {left: ts.Identifier, right: ts.Expression}};

/**
 * Test whether a statement node is an assignment statement.
 * @param statement the statement to test.
 */
export function isAssignmentStatement(statement: ts.Statement): statement is AssignmentStatement {
  return ts.isExpressionStatement(statement) && isAssignment(statement.expression) &&
      ts.isIdentifier(statement.expression.left);
}

export function isAssignment(node: ts.Node): node is ts.AssignmentExpression<ts.EqualsToken> {
  return ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken;
}

/**
 * Tests whether the provided call expression targets a class, by verifying its arguments are
 * according to the following form:
 *
 * ```
 * __decorate([], SomeDirective);
 * ```
 *
 * @param call the call expression that is tested to represent a class decorator call.
 * @param className the name of the class that the call needs to correspond with.
 */
export function isClassDecorateCall(call: ts.CallExpression, className: string):
    call is ts.CallExpression&{arguments: [ts.ArrayLiteralExpression, ts.Expression]} {
  const helperArgs = call.arguments[0];
  if (helperArgs === undefined || !ts.isArrayLiteralExpression(helperArgs)) {
    return false;
  }

  const target = call.arguments[1];
  return target !== undefined && ts.isIdentifier(target) && target.text === className;
}

/**
 * Tests whether the provided call expression targets a member of the class, by verifying its
 * arguments are according to the following form:
 *
 * ```
 * __decorate([], SomeDirective.prototype, "member", void 0);
 * ```
 *
 * @param call the call expression that is tested to represent a member decorator call.
 * @param className the name of the class that the call needs to correspond with.
 */
export function isMemberDecorateCall(call: ts.CallExpression, className: string):
    call is ts.CallExpression&
    {arguments: [ts.ArrayLiteralExpression, ts.StringLiteral, ts.StringLiteral]} {
  const helperArgs = call.arguments[0];
  if (helperArgs === undefined || !ts.isArrayLiteralExpression(helperArgs)) {
    return false;
  }

  const target = call.arguments[1];
  if (target === undefined || !ts.isPropertyAccessExpression(target) ||
      !ts.isIdentifier(target.expression) || target.expression.text !== className ||
      target.name.text !== 'prototype') {
    return false;
  }

  const memberName = call.arguments[2];
  return memberName !== undefined && ts.isStringLiteral(memberName);
}

/**
 * Helper method to extract the value of a property given the property's "symbol",
 * which is actually the symbol of the identifier of the property.
 */
export function getPropertyValueFromSymbol(propSymbol: ts.Symbol): ts.Expression|undefined {
  const propIdentifier = propSymbol.valueDeclaration;
  const parent = propIdentifier && propIdentifier.parent;
  return parent && ts.isBinaryExpression(parent) ? parent.right : undefined;
}

/**
 * A callee could be one of: `__decorate(...)` or `tslib_1.__decorate`.
 */
function getCalleeName(call: ts.CallExpression): string|null {
  if (ts.isIdentifier(call.expression)) {
    return stripDollarSuffix(call.expression.text);
  }
  if (ts.isPropertyAccessExpression(call.expression)) {
    return stripDollarSuffix(call.expression.name.text);
  }
  return null;
}

///////////// Internal Helpers /////////////

/**
 * In ES2015, a class may be declared using a variable declaration of the following structure:
 *
 * ```
 * var MyClass = MyClass_1 = class MyClass {};
 * ```
 *
 * Here, the intermediate `MyClass_1` assignment is optional. In the above example, the
 * `class MyClass {}` expression is returned as declaration of `MyClass`. Note that if `node`
 * represents a regular class declaration, it will be returned as-is.
 *
 * @param node the node that represents the class whose declaration we are finding.
 * @returns the declaration of the class or `null` if it is not a "class".
 */
function getInnerClassDeclaration(node: ts.Node):
    ClassDeclaration<ts.ClassDeclaration|ts.ClassExpression>|null {
  // Recognize a variable declaration of the form `var MyClass = class MyClass {}` or
  // `var MyClass = MyClass_1 = class MyClass {};`
  if (ts.isVariableDeclaration(node) && node.initializer !== undefined) {
    node = node.initializer;
    while (isAssignment(node)) {
      node = node.right;
    }
  }

  if (!ts.isClassDeclaration(node) && !ts.isClassExpression(node)) {
    return null;
  }

  return hasNameIdentifier(node) ? node : null;
}

function getDecoratorArgs(node: ts.ObjectLiteralExpression): ts.Expression[] {
  // The arguments of a decorator are held in the `args` property of its declaration object.
  const argsProperty = node.properties.filter(ts.isPropertyAssignment)
                           .find(property => getNameText(property.name) === 'args');
  const argsExpression = argsProperty && argsProperty.initializer;
  return argsExpression && ts.isArrayLiteralExpression(argsExpression) ?
      Array.from(argsExpression.elements) :
      [];
}

function isPropertyAccess(node: ts.Node): node is ts.PropertyAccessExpression&
    {parent: ts.BinaryExpression} {
  return !!node.parent && ts.isBinaryExpression(node.parent) && ts.isPropertyAccessExpression(node);
}

function isThisAssignment(node: ts.Declaration): node is ts.BinaryExpression&
    {left: ts.PropertyAccessExpression} {
  return ts.isBinaryExpression(node) && ts.isPropertyAccessExpression(node.left) &&
      node.left.expression.kind === ts.SyntaxKind.ThisKeyword;
}

function isNamedDeclaration(node: ts.Declaration): node is ts.NamedDeclaration&
    {name: ts.Identifier} {
  const anyNode: any = node;
  return !!anyNode.name && ts.isIdentifier(anyNode.name);
}


function isClassMemberType(node: ts.Declaration): node is ts.ClassElement|
    ts.PropertyAccessExpression|ts.BinaryExpression {
  return ts.isClassElement(node) || isPropertyAccess(node) || ts.isBinaryExpression(node);
}

/**
 * Collect mappings between exported declarations in a source file and its associated
 * declaration in the typings program.
 */
function collectExportedDeclarations(
    checker: ts.TypeChecker, dtsDeclarationMap: Map<string, ts.Declaration>,
    srcFile: ts.SourceFile): void {
  const srcModule = srcFile && checker.getSymbolAtLocation(srcFile);
  const moduleExports = srcModule && checker.getExportsOfModule(srcModule);
  if (moduleExports) {
    moduleExports.forEach(exportedSymbol => {
      if (exportedSymbol.flags & ts.SymbolFlags.Alias) {
        exportedSymbol = checker.getAliasedSymbol(exportedSymbol);
      }
      const declaration = exportedSymbol.valueDeclaration;
      const name = exportedSymbol.name;
      if (declaration && !dtsDeclarationMap.has(name)) {
        dtsDeclarationMap.set(name, declaration);
      }
    });
  }
}

/**
 * Attempt to resolve the variable declaration that the given declaration is assigned to.
 * For example, for the following code:
 *
 * ```
 * var MyClass = MyClass_1 = class MyClass {};
 * ```
 *
 * and the provided declaration being `class MyClass {}`, this will return the `var MyClass`
 * declaration.
 *
 * @param declaration The declaration for which any variable declaration should be obtained.
 * @returns the outer variable declaration if found, undefined otherwise.
 */
function getVariableDeclarationOfDeclaration(declaration: ts.Declaration): ts.VariableDeclaration|
    undefined {
  let node = declaration.parent;

  // Detect an intermediary variable assignment and skip over it.
  if (isAssignment(node) && ts.isIdentifier(node.left)) {
    node = node.parent;
  }

  return ts.isVariableDeclaration(node) ? node : undefined;
}

/**
 * A constructor function may have been "synthesized" by TypeScript during JavaScript emit,
 * in the case no user-defined constructor exists and e.g. property initializers are used.
 * Those initializers need to be emitted into a constructor in JavaScript, so the TypeScript
 * compiler generates a synthetic constructor.
 *
 * We need to identify such constructors as ngcc needs to be able to tell if a class did
 * originally have a constructor in the TypeScript source. When a class has a superclass,
 * a synthesized constructor must not be considered as a user-defined constructor as that
 * prevents a base factory call from being created by ngtsc, resulting in a factory function
 * that does not inject the dependencies of the superclass. Hence, we identify a default
 * synthesized super call in the constructor body, according to the structure that TypeScript
 * emits during JavaScript emit:
 * https://github.com/Microsoft/TypeScript/blob/v3.2.2/src/compiler/transformers/ts.ts#L1068-L1082
 *
 * @param constructor a constructor function to test
 * @returns true if the constructor appears to have been synthesized
 */
function isSynthesizedConstructor(constructor: ts.ConstructorDeclaration): boolean {
  if (!constructor.body) return false;

  const firstStatement = constructor.body.statements[0];
  if (!firstStatement || !ts.isExpressionStatement(firstStatement)) return false;

  return isSynthesizedSuperCall(firstStatement.expression);
}

/**
 * Tests whether the expression appears to have been synthesized by TypeScript, i.e. whether
 * it is of the following form:
 *
 * ```
 * super(...arguments);
 * ```
 *
 * @param expression the expression that is to be tested
 * @returns true if the expression appears to be a synthesized super call
 */
function isSynthesizedSuperCall(expression: ts.Expression): boolean {
  if (!ts.isCallExpression(expression)) return false;
  if (expression.expression.kind !== ts.SyntaxKind.SuperKeyword) return false;
  if (expression.arguments.length !== 1) return false;

  const argument = expression.arguments[0];
  return ts.isSpreadElement(argument) && ts.isIdentifier(argument.expression) &&
      argument.expression.text === 'arguments';
}
