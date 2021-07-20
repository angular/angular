/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFromSourceFile} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {ClassDeclaration, ClassMember, ClassMemberKind, CtorParameter, Declaration, DeclarationNode, Decorator, EnumMember, Import, isConcreteDeclaration, isDecoratorIdentifier, isNamedClassDeclaration, isNamedFunctionDeclaration, isNamedVariableDeclaration, KnownDeclaration, reflectObjectLiteral, SpecialDeclarationKind, TypeScriptReflectionHost, TypeValueReference, TypeValueReferenceKind, ValueUnavailableKind} from '../../../src/ngtsc/reflection';
import {isSymbolWithValueDeclaration, SymbolWithValueDeclaration} from '../../../src/ngtsc/util/src/typescript';
import {isWithinPackage} from '../analysis/util';
import {BundleProgram} from '../packages/bundle_program';
import {findAll, getNameText, hasNameIdentifier, isDefined, stripDollarSuffix} from '../utils';

import {ClassSymbol, isSwitchableVariableDeclaration, NgccClassSymbol, NgccReflectionHost, PRE_R3_MARKER, SwitchableVariableDeclaration} from './ngcc_host';
import {stripParentheses} from './utils';

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
  /**
   * A mapping from source declarations to typings declarations, which are both publicly exported.
   *
   * There should be one entry for every public export visible from the root file of the source
   * tree. Note that by definition the key and value declarations will not be in the same TS
   * program.
   */
  protected publicDtsDeclarationMap: Map<DeclarationNode, ts.Declaration>|null = null;
  /**
   * A mapping from source declarations to typings declarations, which are not publicly exported.
   *
   * This mapping is a best guess between declarations that happen to be exported from their file by
   * the same name in both the source and the dts file. Note that by definition the key and value
   * declarations will not be in the same TS program.
   */
  protected privateDtsDeclarationMap: Map<DeclarationNode, ts.Declaration>|null = null;

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
  protected aliasedClassDeclarations = new Map<DeclarationNode, ts.Identifier>();

  /**
   * Caches the information of the decorators on a class, as the work involved with extracting
   * decorators is complex and frequently used.
   *
   * This map is lazily populated during the first call to `acquireDecoratorInfo` for a given class.
   */
  protected decoratorCache = new Map<ClassDeclaration, DecoratorInfo>();

  constructor(
      protected logger: Logger, protected isCore: boolean, protected src: BundleProgram,
      protected dts: BundleProgram|null = null) {
    super(src.program.getTypeChecker());
  }

  /**
   * Find a symbol for a node that we think is a class.
   * Classes should have a `name` identifier, because they may need to be referenced in other parts
   * of the program.
   *
   * In ES2015, a class may be declared using a variable declaration of the following structures:
   *
   * ```
   * var MyClass = MyClass_1 = class MyClass {};
   * ```
   *
   * or
   *
   * ```
   * var MyClass = MyClass_1 = (() => { class MyClass {} ... return MyClass; })()
   * ```
   *
   * Here, the intermediate `MyClass_1` assignment is optional. In the above example, the
   * `class MyClass {}` node is returned as declaration of `MyClass`.
   *
   * @param declaration the declaration node whose symbol we are finding.
   * @returns the symbol for the node or `undefined` if it is not a "class" or has no symbol.
   */
  getClassSymbol(declaration: ts.Node): NgccClassSymbol|undefined {
    const symbol = this.getClassSymbolFromOuterDeclaration(declaration);
    if (symbol !== undefined) {
      return symbol;
    }
    const innerDeclaration = this.getInnerDeclarationFromAliasOrInner(declaration);
    return this.getClassSymbolFromInnerDeclaration(innerDeclaration);
  }

  /**
   * Examine a declaration (for example, of a class or function) and return metadata about any
   * decorators present on the declaration.
   *
   * @param declaration a TypeScript node representing the class or function over which to reflect.
   *     For example, if the intent is to reflect the decorators of a class and the source is in ES6
   *     format, this will be a `ts.ClassDeclaration` node. If the source is in ES5 format, this
   *     might be a `ts.VariableDeclaration` as classes in ES5 are represented as the result of an
   *     IIFE execution.
   *
   * @returns an array of `Decorator` metadata if decorators are present on the declaration, or
   *     `null` if either no decorators were present or if the declaration is not of a decoratable
   *     type.
   */
  override getDecoratorsOfDeclaration(declaration: DeclarationNode): Decorator[]|null {
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
  override getMembersOfClass(clazz: ClassDeclaration): ClassMember[] {
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
  override getConstructorParameters(clazz: ClassDeclaration): CtorParameter[]|null {
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

  override getBaseClassExpression(clazz: ClassDeclaration): ts.Expression|null {
    // First try getting the base class from an ES2015 class declaration
    const superBaseClassIdentifier = super.getBaseClassExpression(clazz);
    if (superBaseClassIdentifier) {
      return superBaseClassIdentifier;
    }

    // That didn't work so now try getting it from the "inner" declaration.
    const classSymbol = this.getClassSymbol(clazz);
    if (classSymbol?.implementation.valueDeclaration === undefined ||
        !isNamedDeclaration(classSymbol.implementation.valueDeclaration)) {
      return null;
    }
    return super.getBaseClassExpression(classSymbol.implementation.valueDeclaration);
  }

  override getInternalNameOfClass(clazz: ClassDeclaration): ts.Identifier {
    const classSymbol = this.getClassSymbol(clazz);
    if (classSymbol === undefined) {
      throw new Error(`getInternalNameOfClass() called on a non-class: expected ${
          clazz.name.text} to be a class declaration.`);
    }
    return this.getNameFromClassSymbolDeclaration(
        classSymbol, classSymbol.implementation.valueDeclaration);
  }

  override getAdjacentNameOfClass(clazz: ClassDeclaration): ts.Identifier {
    const classSymbol = this.getClassSymbol(clazz);
    if (classSymbol === undefined) {
      throw new Error(`getAdjacentNameOfClass() called on a non-class: expected ${
          clazz.name.text} to be a class declaration.`);
    }

    return this.getAdjacentNameOfClassSymbol(classSymbol);
  }

  private getNameFromClassSymbolDeclaration(
      classSymbol: NgccClassSymbol, declaration: ts.Declaration|undefined): ts.Identifier {
    if (declaration === undefined) {
      throw new Error(
          `getInternalNameOfClass() called on a class with an undefined internal declaration. External class name: ${
              classSymbol.name}; internal class name: ${classSymbol.implementation.name}.`);
    }
    if (!isNamedDeclaration(declaration)) {
      throw new Error(
          `getInternalNameOfClass() called on a class with an anonymous inner declaration: expected a name on:\n${
              declaration.getText()}`);
    }
    return declaration.name;
  }

  /**
   * Check whether the given node actually represents a class.
   */
  override isClass(node: ts.Node): node is ClassDeclaration {
    return super.isClass(node) || this.getClassSymbol(node) !== undefined;
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
  override getDeclarationOfIdentifier(id: ts.Identifier): Declaration|null {
    const superDeclaration = super.getDeclarationOfIdentifier(id);

    // If no declaration was found, return.
    if (superDeclaration === null) {
      return superDeclaration;
    }

    // If the declaration already has traits assigned to it, return as is.
    if (superDeclaration.known !== null ||
        isConcreteDeclaration(superDeclaration) && superDeclaration.identity !== null) {
      return superDeclaration;
    }

    let declarationNode: ts.Node = superDeclaration.node;
    if (isNamedVariableDeclaration(superDeclaration.node) && !isTopLevel(superDeclaration.node)) {
      const variableValue = this.getVariableValue(superDeclaration.node);
      if (variableValue !== null && ts.isClassExpression(variableValue)) {
        declarationNode = getContainingStatement(variableValue);
      }
    }

    const outerNode = getOuterNodeFromInnerDeclaration(declarationNode);
    const declaration = outerNode !== null && isNamedVariableDeclaration(outerNode) ?
        this.getDeclarationOfIdentifier(outerNode.name) :
        superDeclaration;
    if (declaration === null || declaration.known !== null ||
        isConcreteDeclaration(declaration) && declaration.identity !== null) {
      return declaration;
    }

    // The identifier may have been of an additional class assignment such as `MyClass_1` that was
    // present as alias for `MyClass`. If so, resolve such aliases to their original declaration.
    const aliasedIdentifier = this.resolveAliasedClassIdentifier(declaration.node);
    if (aliasedIdentifier !== null) {
      return this.getDeclarationOfIdentifier(aliasedIdentifier);
    }

    // Variable declarations may represent an enum declaration, so attempt to resolve its members.
    if (isConcreteDeclaration(declaration) && ts.isVariableDeclaration(declaration.node)) {
      const enumMembers = this.resolveEnumMembers(declaration.node);
      if (enumMembers !== null) {
        declaration.identity = {kind: SpecialDeclarationKind.DownleveledEnum, enumMembers};
      }
    }

    return declaration;
  }

  /**
   * Gets all decorators of the given class symbol. Any decorator that have been synthetically
   * injected by a migration will not be present in the returned collection.
   */
  getDecoratorsOfSymbol(symbol: NgccClassSymbol): Decorator[]|null {
    const {classDecorators} = this.acquireDecoratorInfo(symbol);
    if (classDecorators === null) {
      return null;
    }

    // Return a clone of the array to prevent consumers from mutating the cache.
    return Array.from(classDecorators);
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

  override getVariableValue(declaration: ts.VariableDeclaration): ts.Expression|null {
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
  findClassSymbols(sourceFile: ts.SourceFile): NgccClassSymbol[] {
    const classes = new Map<ts.Symbol, NgccClassSymbol>();
    this.getModuleStatements(sourceFile)
        .forEach(statement => this.addClassSymbolsFromStatement(classes, statement));
    return Array.from(classes.values());
  }

  /**
   * Get the number of generic type parameters of a given class.
   *
   * @param clazz a `ClassDeclaration` representing the class over which to reflect.
   *
   * @returns the number of type parameters of the class, if known, or `null` if the declaration
   * is not a class or has an unknown number of type parameters.
   */
  override getGenericArityOfClass(clazz: ClassDeclaration): number|null {
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
  override getDtsDeclaration(declaration: DeclarationNode): ts.Declaration|null {
    if (this.dts === null) {
      return null;
    }
    if (!isNamedDeclaration(declaration)) {
      throw new Error(`Cannot get the dts file for a declaration that has no name: ${
          declaration.getText()} in ${declaration.getSourceFile().fileName}`);
    }

    const decl = this.getDeclarationOfIdentifier(declaration.name);
    if (decl === null) {
      throw new Error(
          `Cannot get the dts file for a node that cannot be associated with a declaration ${
              declaration.getText()} in ${declaration.getSourceFile().fileName}`);
    }

    // Try to retrieve the dts declaration from the public map
    if (this.publicDtsDeclarationMap === null) {
      this.publicDtsDeclarationMap = this.computePublicDtsDeclarationMap(this.src, this.dts);
    }
    if (this.publicDtsDeclarationMap.has(decl.node)) {
      return this.publicDtsDeclarationMap.get(decl.node)!;
    }

    // No public export, try the private map
    if (this.privateDtsDeclarationMap === null) {
      this.privateDtsDeclarationMap = this.computePrivateDtsDeclarationMap(this.src, this.dts);
    }
    if (this.privateDtsDeclarationMap.has(decl.node)) {
      return this.privateDtsDeclarationMap.get(decl.node)!;
    }

    // No declaration found at all
    return null;
  }

  getEndOfClass(classSymbol: NgccClassSymbol): ts.Node {
    const implementation = classSymbol.implementation;
    let last: ts.Node = implementation.valueDeclaration;
    const implementationStatement = getContainingStatement(last);
    if (implementationStatement === null) return last;

    const container = implementationStatement.parent;
    if (ts.isBlock(container)) {
      // Assume that the implementation is inside an IIFE
      const returnStatementIndex = container.statements.findIndex(ts.isReturnStatement);
      if (returnStatementIndex === -1) {
        throw new Error(
            `Compiled class wrapper IIFE does not have a return statement: ${classSymbol.name} in ${
                classSymbol.declaration.valueDeclaration.getSourceFile().fileName}`);
      }

      // Return the statement before the IIFE return statement
      last = container.statements[returnStatementIndex - 1];
    } else if (ts.isSourceFile(container)) {
      // If there are static members on this class then find the last one
      if (implementation.exports !== undefined) {
        implementation.exports.forEach(exportSymbol => {
          if (exportSymbol.valueDeclaration === undefined) {
            return;
          }
          const exportStatement = getContainingStatement(exportSymbol.valueDeclaration);
          if (exportStatement !== null && last.getEnd() < exportStatement.getEnd()) {
            last = exportStatement;
          }
        });
      }

      // If there are helper calls for this class then find the last one
      const helpers = this.getHelperCallsForClass(
          classSymbol, ['__decorate', '__extends', '__param', '__metadata']);
      helpers.forEach(helper => {
        const helperStatement = getContainingStatement(helper);
        if (helperStatement !== null && last.getEnd() < helperStatement.getEnd()) {
          last = helperStatement;
        }
      });
    }
    return last;
  }

  /**
   * Check whether a `Declaration` corresponds with a known declaration, such as `Object`, and set
   * its `known` property to the appropriate `KnownDeclaration`.
   *
   * @param decl The `Declaration` to check.
   * @return The passed in `Declaration` (potentially enhanced with a `KnownDeclaration`).
   */
  detectKnownDeclaration<T extends Declaration>(decl: T): T {
    if (decl.known === null && this.isJavaScriptObjectDeclaration(decl)) {
      // If the identifier resolves to the global JavaScript `Object`, update the declaration to
      // denote it as the known `JsGlobalObject` declaration.
      decl.known = KnownDeclaration.JsGlobalObject;
    }
    return decl;
  }


  ///////////// Protected Helpers /////////////

  /**
   * Extract all the "classes" from the `statement` and add them to the `classes` map.
   */
  protected addClassSymbolsFromStatement(
      classes: Map<ts.Symbol, NgccClassSymbol>, statement: ts.Statement): void {
    if (ts.isVariableStatement(statement)) {
      statement.declarationList.declarations.forEach(declaration => {
        const classSymbol = this.getClassSymbol(declaration);
        if (classSymbol) {
          classes.set(classSymbol.implementation, classSymbol);
        }
      });
    } else if (ts.isClassDeclaration(statement)) {
      const classSymbol = this.getClassSymbol(statement);
      if (classSymbol) {
        classes.set(classSymbol.implementation, classSymbol);
      }
    }
  }

  /**
   * Compute the inner declaration node of a "class" from the given `declaration` node.
   *
   * @param declaration a node that is either an inner declaration or an alias of a class.
   */
  protected getInnerDeclarationFromAliasOrInner(declaration: ts.Node): ts.Node {
    if (declaration.parent !== undefined && isNamedVariableDeclaration(declaration.parent)) {
      const variableValue = this.getVariableValue(declaration.parent);
      if (variableValue !== null) {
        declaration = variableValue;
      }
    }
    return declaration;
  }

  /**
   * A class may be declared as a top level class declaration:
   *
   * ```
   * class OuterClass { ... }
   * ```
   *
   * or in a variable declaration to a class expression:
   *
   * ```
   * var OuterClass = ClassAlias = class InnerClass {};
   * ```
   *
   * or in a variable declaration to an IIFE containing a class declaration
   *
   * ```
   * var OuterClass = ClassAlias = (() => {
   *   class InnerClass {}
   *   ...
   *   return InnerClass;
   * })()
   * ```
   *
   * or in a variable declaration to an IIFE containing a function declaration
   *
   * ```
   * var OuterClass = ClassAlias = (() => {
   *   function InnerClass() {}
   *   ...
   *   return InnerClass;
   * })()
   * ```
   *
   * This method returns an `NgccClassSymbol` when provided with one of these cases.
   *
   * @param declaration the declaration whose symbol we are finding.
   * @returns the symbol for the class or `undefined` if `declaration` does not represent an outer
   *     declaration of a class.
   */
  protected getClassSymbolFromOuterDeclaration(declaration: ts.Node): NgccClassSymbol|undefined {
    // Return a class symbol without an inner declaration if it is a regular "top level" class
    if (isNamedClassDeclaration(declaration) && isTopLevel(declaration)) {
      return this.createClassSymbol(declaration.name, null);
    }

    // Otherwise, an outer class declaration must be an initialized variable declaration:
    if (!isInitializedVariableClassDeclaration(declaration)) {
      return undefined;
    }

    const innerDeclaration = getInnerClassDeclaration(skipClassAliases(declaration));
    if (innerDeclaration === null) {
      return undefined;
    }

    return this.createClassSymbol(declaration.name, innerDeclaration);
  }

  /**
   * In ES2015, a class may be declared using a variable declaration of the following structures:
   *
   * ```
   * let MyClass = MyClass_1 = class MyClass {};
   * ```
   *
   * or
   *
   * ```
   * let MyClass = MyClass_1 = (() => { class MyClass {} ... return MyClass; })()
   * ```
   *
   * or
   *
   * ```
   * let MyClass = MyClass_1 = (() => { let MyClass = class MyClass {}; ... return MyClass; })()
   * ```
   *
   * This method extracts the `NgccClassSymbol` for `MyClass` when provided with the
   * `class MyClass {}` declaration node. When the `var MyClass` node or any other node is given,
   * this method will return undefined instead.
   *
   * @param declaration the declaration whose symbol we are finding.
   * @returns the symbol for the node or `undefined` if it does not represent an inner declaration
   * of a class.
   */
  protected getClassSymbolFromInnerDeclaration(declaration: ts.Node): NgccClassSymbol|undefined {
    let outerDeclaration: ts.ClassDeclaration|ts.VariableDeclaration|undefined = undefined;

    if (ts.isClassExpression(declaration) && hasNameIdentifier(declaration)) {
      // Handle `let MyClass = MyClass_1 = class MyClass {};`
      outerDeclaration = getFarLeftHandSideOfAssignment(declaration);

      // Handle this being in an IIFE
      if (outerDeclaration !== undefined && !isTopLevel(outerDeclaration)) {
        outerDeclaration = getContainingVariableDeclaration(outerDeclaration);
      }
    } else if (isNamedClassDeclaration(declaration)) {
      // Handle `class MyClass {}` statement
      if (isTopLevel(declaration)) {
        // At the top level
        outerDeclaration = declaration;
      } else {
        // Or inside an IIFE
        outerDeclaration = getContainingVariableDeclaration(declaration);
      }
    }

    if (outerDeclaration === undefined || !hasNameIdentifier(outerDeclaration)) {
      return undefined;
    }

    return this.createClassSymbol(outerDeclaration.name, declaration);
  }

  /**
   * Creates an `NgccClassSymbol` from an outer and inner declaration. If a class only has an outer
   * declaration, the "implementation" symbol of the created `NgccClassSymbol` will be set equal to
   * the "declaration" symbol.
   *
   * @param outerDeclaration The outer declaration node of the class.
   * @param innerDeclaration The inner declaration node of the class, or undefined if no inner
   * declaration is present.
   * @returns the `NgccClassSymbol` representing the class, or undefined if a `ts.Symbol` for any of
   * the declarations could not be resolved.
   */
  protected createClassSymbol(outerDeclaration: ts.Identifier, innerDeclaration: ts.Node|null):
      NgccClassSymbol|undefined {
    const declarationSymbol =
        this.checker.getSymbolAtLocation(outerDeclaration) as ClassSymbol | undefined;
    if (declarationSymbol === undefined) {
      return undefined;
    }

    let implementationSymbol: ts.Symbol|undefined = declarationSymbol;
    if (innerDeclaration !== null && isNamedDeclaration(innerDeclaration)) {
      implementationSymbol = this.checker.getSymbolAtLocation(innerDeclaration.name);
    }

    if (!isSymbolWithValueDeclaration(implementationSymbol)) {
      return undefined;
    }

    const classSymbol: NgccClassSymbol = {
      name: declarationSymbol.name,
      declaration: declarationSymbol,
      implementation: implementationSymbol,
      adjacent: this.getAdjacentSymbol(declarationSymbol, implementationSymbol),
    };

    return classSymbol;
  }

  private getAdjacentSymbol(
      declarationSymbol: ClassSymbol,
      implementationSymbol: SymbolWithValueDeclaration): SymbolWithValueDeclaration|undefined {
    if (declarationSymbol === implementationSymbol) {
      return undefined;
    }
    const innerDeclaration = implementationSymbol.valueDeclaration;
    if (!ts.isClassExpression(innerDeclaration) && !ts.isFunctionExpression(innerDeclaration)) {
      return undefined;
    }
    // Deal with the inner class looking like this inside an IIFE:
    // `let MyClass = class MyClass {};` or `var MyClass = function MyClass() {};`
    const adjacentDeclaration = getFarLeftHandSideOfAssignment(innerDeclaration);
    if (adjacentDeclaration === undefined || !isNamedVariableDeclaration(adjacentDeclaration)) {
      return undefined;
    }
    const adjacentSymbol = this.checker.getSymbolAtLocation(adjacentDeclaration.name);
    if (adjacentSymbol === declarationSymbol || adjacentSymbol === implementationSymbol ||
        !isSymbolWithValueDeclaration(adjacentSymbol)) {
      return undefined;
    }
    return adjacentSymbol;
  }

  /**
   * Resolve a `ts.Symbol` to its declaration and detect whether it corresponds with a known
   * declaration.
   */
  protected override getDeclarationOfSymbol(symbol: ts.Symbol, originalId: ts.Identifier|null):
      Declaration|null {
    const declaration = super.getDeclarationOfSymbol(symbol, originalId);
    if (declaration === null) {
      return null;
    }
    return this.detectKnownDeclaration(declaration);
  }

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
  protected resolveAliasedClassIdentifier(declaration: DeclarationNode): ts.Identifier|null {
    this.ensurePreprocessed(declaration.getSourceFile());
    return this.aliasedClassDeclarations.has(declaration) ?
        this.aliasedClassDeclarations.get(declaration)! :
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

      for (const statement of this.getModuleStatements(sourceFile)) {
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
        !ts.isIdentifier(initializer.left) || !this.isClass(declaration)) {
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

  /**
   * Get the top level statements for a module.
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
   *
   * In some cases, a static property can either be set on the inner (implementation or adjacent)
   * declaration inside the class' IIFE, or it can be set on the outer variable declaration.
   * Therefore, the host checks all places, first looking up the property on the inner symbols, and
   * if the property is not found it will fall back to looking up the property on the outer symbol.
   *
   * @param symbol the class whose property we are interested in.
   * @param propertyName the name of static property.
   * @returns the symbol if it is found or `undefined` if not.
   */
  protected getStaticProperty(symbol: NgccClassSymbol, propertyName: ts.__String): ts.Symbol
      |undefined {
    return symbol.implementation.exports?.get(propertyName) ||
        symbol.adjacent?.exports?.get(propertyName) ||
        symbol.declaration.exports?.get(propertyName);
  }

  /**
   * This is the main entry-point for obtaining information on the decorators of a given class. This
   * information is computed either from static properties if present, or using `tslib.__decorate`
   * helper calls otherwise. The computed result is cached per class.
   *
   * @param classSymbol the class for which decorators should be acquired.
   * @returns all information of the decorators on the class.
   */
  protected acquireDecoratorInfo(classSymbol: NgccClassSymbol): DecoratorInfo {
    const decl = classSymbol.declaration.valueDeclaration;
    if (this.decoratorCache.has(decl)) {
      return this.decoratorCache.get(decl)!;
    }

    // Extract decorators from static properties and `__decorate` helper calls, then merge them
    // together where the information from the static properties is preferred.
    const staticProps = this.computeDecoratorInfoFromStaticProperties(classSymbol);
    const helperCalls = this.computeDecoratorInfoFromHelperCalls(classSymbol);

    const decoratorInfo: DecoratorInfo = {
      classDecorators: staticProps.classDecorators || helperCalls.classDecorators,
      memberDecorators: staticProps.memberDecorators || helperCalls.memberDecorators,
      constructorParamInfo: staticProps.constructorParamInfo || helperCalls.constructorParamInfo,
    };

    this.decoratorCache.set(decl, decoratorInfo);
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
  protected computeDecoratorInfoFromStaticProperties(classSymbol: NgccClassSymbol): {
    classDecorators: Decorator[]|null; memberDecorators: Map<string, Decorator[]>| null;
    constructorParamInfo: ParamInfo[] | null;
  } {
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

    return {classDecorators, memberDecorators, constructorParamInfo};
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
  protected getMembersOfSymbol(symbol: NgccClassSymbol): ClassMember[] {
    const members: ClassMember[] = [];

    // The decorators map contains all the properties that are decorated
    const {memberDecorators} = this.acquireDecoratorInfo(symbol);

    // Make a copy of the decorators as successfully reflected members delete themselves from the
    // map, so that any leftovers can be easily dealt with.
    const decoratorsMap = new Map(memberDecorators);

    // The member map contains all the method (instance and static); and any instance properties
    // that are initialized in the class.
    if (symbol.implementation.members) {
      symbol.implementation.members.forEach((value, key) => {
        const decorators = decoratorsMap.get(key as string);
        const reflectedMembers = this.reflectMembers(value, decorators);
        if (reflectedMembers) {
          decoratorsMap.delete(key as string);
          members.push(...reflectedMembers);
        }
      });
    }

    // The static property map contains all the static properties
    if (symbol.implementation.exports) {
      symbol.implementation.exports.forEach((value, key) => {
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
    if (ts.isVariableDeclaration(symbol.declaration.valueDeclaration)) {
      if (symbol.declaration.exports) {
        symbol.declaration.exports.forEach((value, key) => {
          const decorators = decoratorsMap.get(key as string);
          const reflectedMembers = this.reflectMembers(value, decorators, true);
          if (reflectedMembers) {
            decoratorsMap.delete(key as string);
            members.push(...reflectedMembers);
          }
        });
      }
    }

    // If this class was declared as a VariableDeclaration inside an IIFE, then it may have static
    // properties attached to the variable rather than the class itself.
    //
    // For example:
    // ```
    // let OuterClass = (() => {
    //   let AdjacentClass = class InternalClass {
    //     // no static properties here!
    //   }
    //   AdjacentClass.staticProperty = ...;
    // })();
    // ```
    if (symbol.adjacent !== undefined) {
      if (ts.isVariableDeclaration(symbol.adjacent.valueDeclaration)) {
        if (symbol.adjacent.exports !== undefined) {
          symbol.adjacent.exports.forEach((value, key) => {
            const decorators = decoratorsMap.get(key as string);
            const reflectedMembers = this.reflectMembers(value, decorators, true);
            if (reflectedMembers) {
              decoratorsMap.delete(key as string);
              members.push(...reflectedMembers);
            }
          });
        }
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
  protected computeDecoratorInfoFromHelperCalls(classSymbol: NgccClassSymbol): DecoratorInfo {
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
    const helperCalls = this.getHelperCallsForClass(classSymbol, ['__decorate']);

    const outerDeclaration = classSymbol.declaration.valueDeclaration;
    const innerDeclaration = classSymbol.implementation.valueDeclaration;
    const adjacentDeclaration = this.getAdjacentNameOfClassSymbol(classSymbol).parent;
    const matchesClass = (identifier: ts.Identifier) => {
      const decl = this.getDeclarationOfIdentifier(identifier);
      return decl !== null &&
          (decl.node === adjacentDeclaration || decl.node === outerDeclaration ||
           decl.node === innerDeclaration);
    };

    for (const helperCall of helperCalls) {
      if (isClassDecorateCall(helperCall, matchesClass)) {
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
      } else if (isMemberDecorateCall(helperCall, matchesClass)) {
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
                  memberDecorators.has(memberName) ? memberDecorators.get(memberName)! : [];
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
   * Check the given statement to see if it is a call to any of the specified helper functions or
   * null if not found.
   *
   * Matching statements will look like:  `tslib_1.__decorate(...);`.
   * @param statement the statement that may contain the call.
   * @param helperNames the names of the helper we are looking for.
   * @returns the node that corresponds to the `__decorate(...)` call or null if the statement
   * does not match.
   */
  protected getHelperCall(statement: ts.Statement, helperNames: string[]): ts.CallExpression|null {
    if ((ts.isExpressionStatement(statement) || ts.isReturnStatement(statement)) &&
        statement.expression) {
      let expression = statement.expression;
      while (isAssignment(expression)) {
        expression = expression.right;
      }
      if (ts.isCallExpression(expression)) {
        const calleeName = getCalleeName(expression);
        if (calleeName !== null && helperNames.includes(calleeName)) {
          return expression;
        }
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
            let decoratorType = decorator.get('type')!;
            if (isDecoratorIdentifier(decoratorType)) {
              const decoratorIdentifier =
                  ts.isIdentifier(decoratorType) ? decoratorType : decoratorType.name;
              decorators.push({
                name: decoratorIdentifier.text,
                identifier: decoratorType,
                import: this.getImportOfIdentifier(decoratorIdentifier),
                node,
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
      implementation: node,
      kind,
      type,
      name,
      nameNode,
      value,
      isStatic,
      decorators: decorators || []
    };
  }

  /**
   * Find the declarations of the constructor parameters of a class identified by its symbol.
   * @param classSymbol the class whose parameters we want to find.
   * @returns an array of `ts.ParameterDeclaration` objects representing each of the parameters in
   * the class's constructor or null if there is no constructor.
   */
  protected getConstructorParameterDeclarations(classSymbol: NgccClassSymbol):
      ts.ParameterDeclaration[]|null {
    const members = classSymbol.implementation.members;
    if (members && members.has(CONSTRUCTOR)) {
      const constructorSymbol = members.get(CONSTRUCTOR)!;
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
      classSymbol: NgccClassSymbol, parameterNodes: ts.ParameterDeclaration[]): CtorParameter[] {
    const {constructorParamInfo} = this.acquireDecoratorInfo(classSymbol);

    return parameterNodes.map((node, index) => {
      const {decorators, typeExpression} = constructorParamInfo[index] ?
          constructorParamInfo[index] :
          {decorators: null, typeExpression: null};
      const nameNode = node.name;
      const typeValueReference = this.typeToValue(typeExpression);

      return {
        name: getNameText(nameNode),
        nameNode,
        typeValueReference,
        typeNode: null,
        decorators
      };
    });
  }

  /**
   * Compute the `TypeValueReference` for the given `typeExpression`.
   *
   * Although `typeExpression` is a valid `ts.Expression` that could be emitted directly into the
   * generated code, ngcc still needs to resolve the declaration and create an `IMPORTED` type
   * value reference as the compiler has specialized handling for some symbols, for example
   * `ChangeDetectorRef` from `@angular/core`. Such an `IMPORTED` type value reference will result
   * in a newly generated namespace import, instead of emitting the original `typeExpression` as is.
   */
  private typeToValue(typeExpression: ts.Expression|null): TypeValueReference {
    if (typeExpression === null) {
      return {
        kind: TypeValueReferenceKind.UNAVAILABLE,
        reason: {kind: ValueUnavailableKind.MISSING_TYPE},
      };
    }

    const imp = this.getImportOfExpression(typeExpression);
    const decl = this.getDeclarationOfExpression(typeExpression);
    if (imp === null || decl === null) {
      return {
        kind: TypeValueReferenceKind.LOCAL,
        expression: typeExpression,
        defaultImportStatement: null,
      };
    }

    return {
      kind: TypeValueReferenceKind.IMPORTED,
      valueDeclaration: decl.node,
      moduleName: imp.from,
      importedName: imp.name,
      nestedPath: null,
    };
  }

  /**
   * Determines where the `expression` is imported from.
   *
   * @param expression the expression to determine the import details for.
   * @returns the `Import` for the expression, or `null` if the expression is not imported or the
   * expression syntax is not supported.
   */
  private getImportOfExpression(expression: ts.Expression): Import|null {
    if (ts.isIdentifier(expression)) {
      return this.getImportOfIdentifier(expression);
    } else if (ts.isPropertyAccessExpression(expression) && ts.isIdentifier(expression.name)) {
      return this.getImportOfIdentifier(expression.name);
    } else {
      return null;
    }
  }

  /**
   * Get the parameter type and decorators for the constructor of a class,
   * where the information is stored on a static property of the class.
   *
   * Note that in ESM2015, the property is defined an array, or by an arrow function that returns
   * an array, of decorator and type information.
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
                  paramInfo && paramInfo.has('type') ? paramInfo.get('type')! : null;
              const decoratorInfo =
                  paramInfo && paramInfo.has('decorators') ? paramInfo.get('decorators')! : null;
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
   * @param helperNames the names of the helpers (e.g. `__decorate`) whose calls we are interested
   * in.
   * @returns an array of CallExpression nodes for each matching helper call.
   */
  protected getHelperCallsForClass(classSymbol: NgccClassSymbol, helperNames: string[]):
      ts.CallExpression[] {
    return this.getStatementsForClass(classSymbol)
        .map(statement => this.getHelperCall(statement, helperNames))
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
  protected getStatementsForClass(classSymbol: NgccClassSymbol): ts.Statement[] {
    const classNode = classSymbol.implementation.valueDeclaration;
    if (isTopLevel(classNode)) {
      return this.getModuleStatements(classNode.getSourceFile());
    }
    const statement = getContainingStatement(classNode);
    if (ts.isBlock(statement.parent)) {
      return Array.from(statement.parent.statements);
    }
    // We should never arrive here
    throw new Error(`Unable to find adjacent statements for ${classSymbol.name}`);
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
   * Create a mapping between the public exports in a src program and the public exports of a dts
   * program.
   *
   * @param src the program bundle containing the source files.
   * @param dts the program bundle containing the typings files.
   * @returns a map of source declarations to typings declarations.
   */
  protected computePublicDtsDeclarationMap(src: BundleProgram, dts: BundleProgram):
      Map<DeclarationNode, ts.Declaration> {
    const declarationMap = new Map<DeclarationNode, ts.Declaration>();
    const dtsDeclarationMap = new Map<string, ts.Declaration>();
    const rootDts = getRootFileOrFail(dts);
    this.collectDtsExportedDeclarations(dtsDeclarationMap, rootDts, dts.program.getTypeChecker());
    const rootSrc = getRootFileOrFail(src);
    this.collectSrcExportedDeclarations(declarationMap, dtsDeclarationMap, rootSrc);
    return declarationMap;
  }

  /**
   * Create a mapping between the "private" exports in a src program and the "private" exports of a
   * dts program. These exports may be exported from individual files in the src or dts programs,
   * but not exported from the root file (i.e publicly from the entry-point).
   *
   * This mapping is a "best guess" since we cannot guarantee that two declarations that happen to
   * be exported from a file with the same name are actually equivalent. But this is a reasonable
   * estimate for the purposes of ngcc.
   *
   * @param src the program bundle containing the source files.
   * @param dts the program bundle containing the typings files.
   * @returns a map of source declarations to typings declarations.
   */
  protected computePrivateDtsDeclarationMap(src: BundleProgram, dts: BundleProgram):
      Map<DeclarationNode, ts.Declaration> {
    const declarationMap = new Map<DeclarationNode, ts.Declaration>();
    const dtsDeclarationMap = new Map<string, ts.Declaration>();
    const typeChecker = dts.program.getTypeChecker();

    const dtsFiles = getNonRootPackageFiles(dts);
    for (const dtsFile of dtsFiles) {
      this.collectDtsExportedDeclarations(dtsDeclarationMap, dtsFile, typeChecker);
    }

    const srcFiles = getNonRootPackageFiles(src);
    for (const srcFile of srcFiles) {
      this.collectSrcExportedDeclarations(declarationMap, dtsDeclarationMap, srcFile);
    }
    return declarationMap;
  }

  /**
   * Collect mappings between names of exported declarations in a file and its actual declaration.
   *
   * Any new mappings are added to the `dtsDeclarationMap`.
   */
  protected collectDtsExportedDeclarations(
      dtsDeclarationMap: Map<string, ts.Declaration>, srcFile: ts.SourceFile,
      checker: ts.TypeChecker): void {
    const srcModule = srcFile && checker.getSymbolAtLocation(srcFile);
    const moduleExports = srcModule && checker.getExportsOfModule(srcModule);
    if (moduleExports) {
      moduleExports.forEach(exportedSymbol => {
        const name = exportedSymbol.name;
        if (exportedSymbol.flags & ts.SymbolFlags.Alias) {
          exportedSymbol = checker.getAliasedSymbol(exportedSymbol);
        }
        const declaration = exportedSymbol.valueDeclaration;
        if (declaration && !dtsDeclarationMap.has(name)) {
          dtsDeclarationMap.set(name, declaration);
        }
      });
    }
  }


  protected collectSrcExportedDeclarations(
      declarationMap: Map<DeclarationNode, ts.Declaration>,
      dtsDeclarationMap: Map<string, ts.Declaration>, srcFile: ts.SourceFile): void {
    const fileExports = this.getExportsOfModule(srcFile);
    if (fileExports !== null) {
      for (const [exportName, {node: declarationNode}] of fileExports) {
        if (dtsDeclarationMap.has(exportName)) {
          declarationMap.set(declarationNode, dtsDeclarationMap.get(exportName)!);
        }
      }
    }
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

    const exportDecl = namespaceExports.get(expression.name.text)!;
    return {...exportDecl, viaModule: namespaceDecl.viaModule};
  }

  /** Checks if the specified declaration resolves to the known JavaScript global `Object`. */
  protected isJavaScriptObjectDeclaration(decl: Declaration): boolean {
    const node = decl.node;
    // The default TypeScript library types the global `Object` variable through
    // a variable declaration with a type reference resolving to `ObjectConstructor`.
    if (!ts.isVariableDeclaration(node) || !ts.isIdentifier(node.name) ||
        node.name.text !== 'Object' || node.type === undefined) {
      return false;
    }
    const typeNode = node.type;
    // If the variable declaration does not have a type resolving to `ObjectConstructor`,
    // we cannot guarantee that the declaration resolves to the global `Object` variable.
    if (!ts.isTypeReferenceNode(typeNode) || !ts.isIdentifier(typeNode.typeName) ||
        typeNode.typeName.text !== 'ObjectConstructor') {
      return false;
    }
    // Finally, check if the type definition for `Object` originates from a default library
    // definition file. This requires default types to be enabled for the host program.
    return this.src.program.isSourceFileDefaultLibrary(node.getSourceFile());
  }

  /**
   * In JavaScript, enum declarations are emitted as a regular variable declaration followed by an
   * IIFE in which the enum members are assigned.
   *
   *   export var Enum;
   *   (function (Enum) {
   *     Enum["a"] = "A";
   *     Enum["b"] = "B";
   *   })(Enum || (Enum = {}));
   *
   * @param declaration A variable declaration that may represent an enum
   * @returns An array of enum members if the variable declaration is followed by an IIFE that
   * declares the enum members, or null otherwise.
   */
  protected resolveEnumMembers(declaration: ts.VariableDeclaration): EnumMember[]|null {
    // Initialized variables don't represent enum declarations.
    if (declaration.initializer !== undefined) return null;

    const variableStmt = declaration.parent.parent;
    if (!ts.isVariableStatement(variableStmt)) return null;

    const block = variableStmt.parent;
    if (!ts.isBlock(block) && !ts.isSourceFile(block)) return null;

    const declarationIndex = block.statements.findIndex(statement => statement === variableStmt);
    if (declarationIndex === -1 || declarationIndex === block.statements.length - 1) return null;

    const subsequentStmt = block.statements[declarationIndex + 1];
    if (!ts.isExpressionStatement(subsequentStmt)) return null;

    const iife = stripParentheses(subsequentStmt.expression);
    if (!ts.isCallExpression(iife) || !isEnumDeclarationIife(iife)) return null;

    const fn = stripParentheses(iife.expression);
    if (!ts.isFunctionExpression(fn)) return null;

    return this.reflectEnumMembers(fn);
  }

  /**
   * Attempts to extract all `EnumMember`s from a function that is according to the JavaScript emit
   * format for enums:
   *
   *   function (Enum) {
   *     Enum["MemberA"] = "a";
   *     Enum["MemberB"] = "b";
   *   }
   *
   * @param fn The function expression that is assumed to contain enum members.
   * @returns All enum members if the function is according to the correct syntax, null otherwise.
   */
  private reflectEnumMembers(fn: ts.FunctionExpression): EnumMember[]|null {
    if (fn.parameters.length !== 1) return null;

    const enumName = fn.parameters[0].name;
    if (!ts.isIdentifier(enumName)) return null;

    const enumMembers: EnumMember[] = [];
    for (const statement of fn.body.statements) {
      const enumMember = this.reflectEnumMember(enumName, statement);
      if (enumMember === null) {
        return null;
      }
      enumMembers.push(enumMember);
    }
    return enumMembers;
  }

  /**
   * Attempts to extract a single `EnumMember` from a statement in the following syntax:
   *
   *   Enum["MemberA"] = "a";
   *
   * or, for enum member with numeric values:
   *
   *   Enum[Enum["MemberA"] = 0] = "MemberA";
   *
   * @param enumName The identifier of the enum that the members should be set on.
   * @param statement The statement to inspect.
   * @returns An `EnumMember` if the statement is according to the expected syntax, null otherwise.
   */
  protected reflectEnumMember(enumName: ts.Identifier, statement: ts.Statement): EnumMember|null {
    if (!ts.isExpressionStatement(statement)) return null;

    const expression = statement.expression;

    // Check for the `Enum[X] = Y;` case.
    if (!isEnumAssignment(enumName, expression)) {
      return null;
    }
    const assignment = reflectEnumAssignment(expression);
    if (assignment != null) {
      return assignment;
    }

    // Check for the `Enum[Enum[X] = Y] = ...;` case.
    const innerExpression = expression.left.argumentExpression;
    if (!isEnumAssignment(enumName, innerExpression)) {
      return null;
    }
    return reflectEnumAssignment(innerExpression);
  }

  private getAdjacentNameOfClassSymbol(classSymbol: NgccClassSymbol): ts.Identifier {
    if (classSymbol.adjacent !== undefined) {
      return this.getNameFromClassSymbolDeclaration(
          classSymbol, classSymbol.adjacent.valueDeclaration);
    } else {
      return this.getNameFromClassSymbolDeclaration(
          classSymbol, classSymbol.implementation.valueDeclaration);
    }
  }
}

///////////// Exported Helpers /////////////

/**
 * Checks whether the iife has the following call signature:
 *
 *   (Enum || (Enum = {})
 *
 * Note that the `Enum` identifier is not checked, as it could also be something
 * like `exports.Enum`. Instead, only the structure of binary operators is checked.
 *
 * @param iife The call expression to check.
 * @returns true if the iife has a call signature that corresponds with a potential
 * enum declaration.
 */
function isEnumDeclarationIife(iife: ts.CallExpression): boolean {
  if (iife.arguments.length !== 1) return false;

  const arg = iife.arguments[0];
  if (!ts.isBinaryExpression(arg) || arg.operatorToken.kind !== ts.SyntaxKind.BarBarToken ||
      !ts.isParenthesizedExpression(arg.right)) {
    return false;
  }

  const right = arg.right.expression;
  if (!ts.isBinaryExpression(right) || right.operatorToken.kind !== ts.SyntaxKind.EqualsToken) {
    return false;
  }

  if (!ts.isObjectLiteralExpression(right.right) || right.right.properties.length !== 0) {
    return false;
  }

  return true;
}

/**
 * An enum member assignment that looks like `Enum[X] = Y;`.
 */
export type EnumMemberAssignment = ts.BinaryExpression&{left: ts.ElementAccessExpression};

/**
 * Checks whether the expression looks like an enum member assignment targeting `Enum`:
 *
 *   Enum[X] = Y;
 *
 * Here, X and Y can be any expression.
 *
 * @param enumName The identifier of the enum that the members should be set on.
 * @param expression The expression that should be checked to conform to the above form.
 * @returns true if the expression is of the correct form, false otherwise.
 */
function isEnumAssignment(
    enumName: ts.Identifier, expression: ts.Expression): expression is EnumMemberAssignment {
  if (!ts.isBinaryExpression(expression) ||
      expression.operatorToken.kind !== ts.SyntaxKind.EqualsToken ||
      !ts.isElementAccessExpression(expression.left)) {
    return false;
  }

  // Verify that the outer assignment corresponds with the enum declaration.
  const enumIdentifier = expression.left.expression;
  return ts.isIdentifier(enumIdentifier) && enumIdentifier.text === enumName.text;
}

/**
 * Attempts to create an `EnumMember` from an expression that is believed to represent an enum
 * assignment.
 *
 * @param expression The expression that is believed to be an enum assignment.
 * @returns An `EnumMember` or null if the expression did not represent an enum member after all.
 */
function reflectEnumAssignment(expression: EnumMemberAssignment): EnumMember|null {
  const memberName = expression.left.argumentExpression;
  if (!ts.isPropertyName(memberName)) return null;

  return {name: memberName, initializer: expression.right};
}

export type ParamInfo = {
  decorators: Decorator[]|null,
  typeExpression: ts.Expression|null
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
export type DecorateHelperEntry = ParameterTypes|ParameterDecorators|DecoratorCall;

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
   * decorators for a certain parameter. Indices in this array correspond with the parameter's
   * index in the constructor. Note that this array may be sparse, i.e. certain constructor
   * parameters may not have any info recorded.
   */
  constructorParamInfo: ParamInfo[];
}

/**
 * A statement node that represents an assignment.
 */
export type AssignmentStatement =
    ts.ExpressionStatement&{expression: {left: ts.Identifier, right: ts.Expression}};

/**
 * Test whether a statement node is an assignment statement.
 * @param statement the statement to test.
 */
export function isAssignmentStatement(statement: ts.Statement): statement is AssignmentStatement {
  return ts.isExpressionStatement(statement) && isAssignment(statement.expression) &&
      ts.isIdentifier(statement.expression.left);
}

/**
 * Parse the `expression` that is believed to be an IIFE and return the AST node that corresponds to
 * the body of the IIFE.
 *
 * The expression may be wrapped in parentheses, which are stripped off.
 *
 * If the IIFE is an arrow function then its body could be a `ts.Expression` rather than a
 * `ts.FunctionBody`.
 *
 * @param expression the expression to parse.
 * @returns the `ts.Expression` or `ts.FunctionBody` that holds the body of the IIFE or `undefined`
 *     if the `expression` did not have the correct shape.
 */
export function getIifeBody(expression: ts.Expression): ts.ConciseBody|undefined {
  const call = stripParentheses(expression);
  if (!ts.isCallExpression(call)) {
    return undefined;
  }

  const fn = stripParentheses(call.expression);
  if (!ts.isFunctionExpression(fn) && !ts.isArrowFunction(fn)) {
    return undefined;
  }

  return fn.body;
}

/**
 * Returns true if the `node` is an assignment of the form `a = b`.
 *
 * @param node The AST node to check.
 */
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
 * @param matches predicate function to test whether the call is associated with the desired class.
 */
export function isClassDecorateCall(
    call: ts.CallExpression, matches: (identifier: ts.Identifier) => boolean):
    call is ts.CallExpression&{arguments: [ts.ArrayLiteralExpression, ts.Expression]} {
  const helperArgs = call.arguments[0];
  if (helperArgs === undefined || !ts.isArrayLiteralExpression(helperArgs)) {
    return false;
  }

  const target = call.arguments[1];
  return target !== undefined && ts.isIdentifier(target) && matches(target);
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
 * @param matches predicate function to test whether the call is associated with the desired class.
 */
export function isMemberDecorateCall(
    call: ts.CallExpression, matches: (identifier: ts.Identifier) => boolean):
    call is ts.CallExpression&
    {arguments: [ts.ArrayLiteralExpression, ts.StringLiteral, ts.StringLiteral]} {
  const helperArgs = call.arguments[0];
  if (helperArgs === undefined || !ts.isArrayLiteralExpression(helperArgs)) {
    return false;
  }

  const target = call.arguments[1];
  if (target === undefined || !ts.isPropertyAccessExpression(target) ||
      !ts.isIdentifier(target.expression) || !matches(target.expression) ||
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

type InitializedVariableClassDeclaration =
    ClassDeclaration<ts.VariableDeclaration>&{initializer: ts.Expression};

function isInitializedVariableClassDeclaration(node: ts.Node):
    node is InitializedVariableClassDeclaration {
  return isNamedVariableDeclaration(node) && node.initializer !== undefined;
}

/**
 * Handle a variable declaration of the form
 *
 * ```
 * var MyClass = alias1 = alias2 = <<declaration>>
 * ```
 *
 * @param node the LHS of a variable declaration.
 * @returns the original AST node or the RHS of a series of assignments in a variable
 *     declaration.
 */
export function skipClassAliases(node: InitializedVariableClassDeclaration): ts.Expression {
  let expression = node.initializer;
  while (isAssignment(expression)) {
    expression = expression.right;
  }
  return expression;
}

/**
 * This expression could either be a class expression
 *
 * ```
 * class MyClass {};
 * ```
 *
 * or an IIFE wrapped class expression
 *
 * ```
 * (() => {
 *   class MyClass {}
 *   ...
 *   return MyClass;
 * })()
 * ```
 *
 * or an IIFE wrapped aliased class expression
 *
 * ```
 * (() => {
 *   let MyClass = class MyClass {}
 *   ...
 *   return MyClass;
 * })()
 * ```
 *
 * or an IFFE wrapped ES5 class function
 *
 * ```
 * (function () {
 *  function MyClass() {}
 *  ...
 *  return MyClass
 * })()
 * ```
 *
 * @param expression the node that represents the class whose declaration we are finding.
 * @returns the declaration of the class or `null` if it is not a "class".
 */
export function getInnerClassDeclaration(expression: ts.Expression):
    ClassDeclaration<ts.ClassExpression|ts.ClassDeclaration|ts.FunctionDeclaration>|null {
  if (ts.isClassExpression(expression) && hasNameIdentifier(expression)) {
    return expression;
  }

  const iifeBody = getIifeBody(expression);
  if (iifeBody === undefined) {
    return null;
  }

  if (!ts.isBlock(iifeBody)) {
    // Handle the fat arrow expression case: `() => ClassExpression`
    return ts.isClassExpression(iifeBody) && isNamedDeclaration(iifeBody) ? iifeBody : null;
  } else {
    // Handle the case of a normal or fat-arrow function with a body.
    // Return the first ClassDeclaration/VariableDeclaration inside the body
    for (const statement of iifeBody.statements) {
      if (isNamedClassDeclaration(statement) || isNamedFunctionDeclaration(statement)) {
        return statement;
      }
      if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (isInitializedVariableClassDeclaration(declaration)) {
            const expression = skipClassAliases(declaration);
            if (ts.isClassExpression(expression) && hasNameIdentifier(expression)) {
              return expression;
            }
          }
        }
      }
    }
  }

  return null;
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

function isNamedDeclaration(node: ts.Node): node is ts.NamedDeclaration&{name: ts.Identifier} {
  const anyNode: any = node;
  return !!anyNode.name && ts.isIdentifier(anyNode.name);
}


function isClassMemberType(node: ts.Declaration): node is ts.ClassElement|
    ts.PropertyAccessExpression|ts.BinaryExpression {
  return (ts.isClassElement(node) || isPropertyAccess(node) || ts.isBinaryExpression(node)) &&
      // Additionally, ensure `node` is not an index signature, for example on an abstract class:
      // `abstract class Foo { [key: string]: any; }`
      !ts.isIndexSignatureDeclaration(node);
}

/**
 * Attempt to resolve the variable declaration that the given declaration is assigned to.
 * For example, for the following code:
 *
 * ```
 * var MyClass = MyClass_1 = class MyClass {};
 * ```
 *
 * or
 *
 * ```
 * var MyClass = MyClass_1 = (() => {
 *   class MyClass {}
 *   ...
 *   return MyClass;
 * })()
  ```
 *
 * and the provided declaration being `class MyClass {}`, this will return the `var MyClass`
 * declaration.
 *
 * @param declaration The declaration for which any variable declaration should be obtained.
 * @returns the outer variable declaration if found, undefined otherwise.
 */
function getFarLeftHandSideOfAssignment(declaration: ts.Declaration): ts.VariableDeclaration|
    undefined {
  let node = declaration.parent;

  // Detect an intermediary variable assignment and skip over it.
  if (isAssignment(node) && ts.isIdentifier(node.left)) {
    node = node.parent;
  }

  return ts.isVariableDeclaration(node) ? node : undefined;
}

function getContainingVariableDeclaration(node: ts.Node): ClassDeclaration<ts.VariableDeclaration>|
    undefined {
  node = node.parent;
  while (node !== undefined) {
    if (isNamedVariableDeclaration(node)) {
      return node;
    }
    node = node.parent;
  }
  return undefined;
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

/**
 * Find the statement that contains the given node
 * @param node a node whose containing statement we wish to find
 */
export function getContainingStatement(node: ts.Node): ts.Statement {
  while (node.parent) {
    if (ts.isBlock(node.parent) || ts.isSourceFile(node.parent)) {
      break;
    }
    node = node.parent;
  }
  return node as ts.Statement;
}

function getRootFileOrFail(bundle: BundleProgram): ts.SourceFile {
  const rootFile = bundle.program.getSourceFile(bundle.path);
  if (rootFile === undefined) {
    throw new Error(`The given rootPath ${rootFile} is not a file of the program.`);
  }
  return rootFile;
}

function getNonRootPackageFiles(bundle: BundleProgram): ts.SourceFile[] {
  const rootFile = bundle.program.getSourceFile(bundle.path);
  return bundle.program.getSourceFiles().filter(
      f => (f !== rootFile) && isWithinPackage(bundle.package, absoluteFromSourceFile(f)));
}

function isTopLevel(node: ts.Node): boolean {
  while (node = node.parent) {
    if (ts.isBlock(node)) {
      return false;
    }
  }
  return true;
}

/**
 * Get a node that represents the actual (outer) declaration of a class from its implementation.
 *
 * Sometimes, the implementation of a class is an expression that is hidden inside an IIFE and
 * assigned to a variable outside the IIFE, which is what the rest of the program interacts with.
 * For example,
 *
 * ```
 * OuterNode = Alias = (function() { function InnerNode() {} return InnerNode; })();
 * ```
 *
 * @param node a node that could be the implementation inside an IIFE.
 * @returns a node that represents the outer declaration, or `null` if it is does not match the IIFE
 *     format shown above.
 */
export function getOuterNodeFromInnerDeclaration(node: ts.Node): ts.Node|null {
  if (!ts.isFunctionDeclaration(node) && !ts.isClassDeclaration(node) &&
      !ts.isVariableStatement(node)) {
    return null;
  }

  // It might be the function expression inside the IIFE. We need to go 5 levels up...

  // - IIFE body.
  let outerNode = node.parent;
  if (!outerNode || !ts.isBlock(outerNode)) return null;

  // - IIFE function expression.
  outerNode = outerNode.parent;
  if (!outerNode || (!ts.isFunctionExpression(outerNode) && !ts.isArrowFunction(outerNode))) {
    return null;
  }
  outerNode = outerNode.parent;

  // - Parenthesis inside IIFE.
  if (outerNode && ts.isParenthesizedExpression(outerNode)) outerNode = outerNode.parent;

  // - IIFE call expression.
  if (!outerNode || !ts.isCallExpression(outerNode)) return null;
  outerNode = outerNode.parent;

  // - Parenthesis around IIFE.
  if (outerNode && ts.isParenthesizedExpression(outerNode)) outerNode = outerNode.parent;

  // - Skip any aliases between the IIFE and the far left hand side of any assignments.
  while (isAssignment(outerNode.parent)) {
    outerNode = outerNode.parent;
  }

  return outerNode;
}
