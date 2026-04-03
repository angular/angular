/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  MatchSource,
  TmplAstComponent,
  TmplAstDirective,
  TmplAstElement,
  TmplAstLetDeclaration,
  TmplAstReference,
  TmplAstTemplate,
  TmplAstVariable,
} from '@angular/compiler';
import ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';
import {SymbolWithValueDeclaration} from '../../util/src/typescript';

import {PotentialDirective} from './scope';

export enum SymbolKind {
  Input,
  Output,
  Binding,
  Reference,
  Variable,
  Directive,
  Element,
  Template,
  Expression,
  DomBinding,
  Pipe,
  LetDeclaration,
  SelectorlessComponent,
  SelectorlessDirective,
}

/**
 * A representation of an entity in the `TemplateAst`.
 */
export type Symbol =
  | InputBindingSymbol
  | OutputBindingSymbol
  | ElementSymbol
  | ReferenceSymbol
  | VariableSymbol
  | ExpressionSymbol
  | DirectiveSymbol
  | TemplateSymbol
  | DomBindingSymbol
  | PipeSymbol
  | LetDeclarationSymbol
  | SelectorlessComponentSymbol
  | SelectorlessDirectiveSymbol;

/**
 * A `Symbol` which declares a new named entity in the template scope.
 */
export type TemplateDeclarationSymbol = ReferenceSymbol | VariableSymbol;

/**
 * Information about where a `ts.Node` can be found in the type check file. This can either be
 * a type-checking shim file, or an original source file for inline type check blocks.
 */
export interface TcbLocation {
  /**
   * The fully qualified path of the file which contains the generated TypeScript type check
   * code for the component's template.
   */
  tcbPath: AbsoluteFsPath;

  /**
   * Whether the type check block exists in a type-checking shim file or is inline.
   */
  isShimFile: boolean;

  /** The location in the file where node appears. */
  positionInFile: number;

  /** The end position in the TCB file. Used to correctly resolve AST expressions. */
  endInFile?: number;
}

/**
 * A generic representation of some node in a template.
 */
export interface TsNodeSymbolInfo {
  /** The position of the most relevant part of the template node. */
  tcbLocation: TcbLocation;

  /** The position of the expression used to determine the type. */
  tcbTypeLocation?: TcbLocation;
}

/**
 * A representation of an expression in a component template.
 */
export interface ExpressionSymbol {
  kind: SymbolKind.Expression;

  /** The position of the most relevant part of the expression. */
  tcbLocation: TcbLocation;

  /** The position of the expression used to determine the type. */
  tcbTypeLocation?: TcbLocation;
}

/** Represents either an input or output binding in a template. */
export interface BindingSymbol {
  kind: SymbolKind.Binding;

  /**
   * The `DirectiveSymbol` or `ElementSymbol` for the Directive, Component, or `HTMLElement` with
   * the binding.
   */
  target: DirectiveSymbol | ElementSymbol | TemplateSymbol;

  /** The location in the shim file where the field access for the binding appears. */
  tcbLocation: TcbLocation;

  /** The position of the expression used to determine the type. */
  tcbTypeLocation?: TcbLocation;
}

/**
 * A representation of an input binding in a component template.
 */
export interface InputBindingSymbol {
  kind: SymbolKind.Input;

  /** A single input may be bound to multiple components or directives. */
  bindings: BindingSymbol[];
}

/**
 * A representation of an output binding in a component template.
 */
export interface OutputBindingSymbol {
  kind: SymbolKind.Output;

  /** A single output may be bound to multiple components or directives. */
  bindings: BindingSymbol[];
}

/**
 * A representation of a local reference in a component template.
 */
export interface ReferenceSymbol {
  kind: SymbolKind.Reference;

  /**
   * Depending on the type of the reference, this is one of the following:
   *  - `TmplAstElement` when the local ref refers to the HTML element
   *  - `TmplAstTemplate` when the ref refers to an `ng-template`
   *  - `ts.ClassDeclaration` when the local ref refers to a Directive instance (#ref="myExportAs")
   */
  target: TmplAstElement | TmplAstTemplate | ts.ClassDeclaration;

  /**
   * The node in the `TemplateAst` where the symbol is declared. That is, node for the `#ref` or
   * `#ref="exportAs"`.
   */
  declaration: TmplAstReference;

  /**
   * The location in the shim file of a variable that holds the type of the local ref.
   * For example, a reference declaration like the following:
   * ```ts
   * var _t1 = document.createElement('div');
   * var _t2 = _t1; // This is the reference declaration
   * ```
   * This `targetLocation` is `[_t1 variable declaration].getStart()`.
   */
  targetLocation: TcbLocation;

  /**
   * The location in the TCB for the identifier node in the reference variable declaration.
   * For example, given a variable declaration statement for a template reference:
   * `var _t2 = _t1`, this location is `[_t2 node].getStart()`. This location can
   * be used to find references to the variable within the template.
   */
  referenceVarLocation: TcbLocation;
}

/**
 * A representation of a context variable in a component template.
 */
export interface VariableSymbol {
  kind: SymbolKind.Variable;

  /**
   * The node in the `TemplateAst` where the variable is declared. That is, the node for the `let-`
   * node in the template.
   */
  declaration: TmplAstVariable;

  /**
   * The location in the shim file for the identifier that was declared for the template variable.
   */
  localVarLocation: TcbLocation;

  /** The location in the shim file for the initializer node of the variable that represents the template variable. */
  initializerLocation: TcbLocation;
}

/**
 * A representation of an `@let` declaration in a component template.
 */
export interface LetDeclarationSymbol {
  kind: SymbolKind.LetDeclaration;

  /** The node in the `TemplateAst` where the `@let` is declared.  */
  declaration: TmplAstLetDeclaration;

  /**
   * The location in the shim file for the identifier of the `@let` declaration.
   */
  localVarLocation: TcbLocation;

  /** The location in the shim file of the `@let` declaration's initializer expression. */
  initializerLocation: TcbLocation;
}

/**
 * A representation of an element in a component template.
 */
export interface ElementSymbol {
  kind: SymbolKind.Element;

  /** A list of directives applied to the element. */
  directives: DirectiveSymbol[];

  /** The location in the shim file for the variable that holds the type of the element. */
  tcbLocation: TcbLocation;

  templateNode: TmplAstElement;
}

export interface TemplateSymbol {
  kind: SymbolKind.Template;

  /** A list of directives applied to the element. */
  directives: DirectiveSymbol[];

  templateNode: TmplAstTemplate;
}

/** A representation of a selectorless component reference in a template. */
export interface SelectorlessComponentSymbol {
  kind: SymbolKind.SelectorlessComponent;

  /**
   * Includes the component class itself and any host directives
   * that may have been applied as a side-effect of it.
   */
  directives: DirectiveSymbol[];

  /** The location in the shim file for the variable that holds the type of the component. */
  tcbLocation: TcbLocation;

  /** Template AST node defining the component. */
  templateNode: TmplAstComponent;
}

/** A representation of a selectorless directive reference in a template. */
export interface SelectorlessDirectiveSymbol {
  kind: SymbolKind.SelectorlessDirective;

  /**
   * Includes the directive class itself and any host directives
   * that may have been applied as a side-effect of it.
   */
  directives: DirectiveSymbol[];

  /** The location in the shim file for the variable that holds the type of the directive. */
  tcbLocation: TcbLocation;

  /** Template AST node defining the directive. */
  templateNode: TmplAstDirective;
}

/** Interface shared between host and non-host directives. */
interface DirectiveSymbolBase extends PotentialDirective {
  kind: SymbolKind.Directive;

  /** The location in the shim file for the variable that holds the type of the directive. */
  tcbLocation: TcbLocation;
}

/**
 * A representation of a directive/component whose selector matches a node in a component
 * template.
 */
export type DirectiveSymbol =
  | (DirectiveSymbolBase & {matchSource: MatchSource.Selector})
  | (DirectiveSymbolBase & {
      matchSource: MatchSource.HostDirective;
      exposedInputs: Record<string, string> | null;
      exposedOutputs: Record<string, string> | null;
    });

/**
 * A representation of an attribute on an element or template. These bindings aren't currently
 * type-checked (see `checkTypeOfDomBindings`) so they won't have a `ts.Type`, `ts.Symbol`, or shim
 * location.
 */
export interface DomBindingSymbol {
  kind: SymbolKind.DomBinding;

  /** The symbol for the element or template of the text attribute. */
  host: ElementSymbol | TemplateSymbol;
}

/**
 * A representation for a call to a pipe's transform method in the TCB.
 */
export interface PipeSymbol {
  kind: SymbolKind.Pipe;

  /** The position of the transform call in the template. */
  tcbLocation: TcbLocation;

  /** The symbol for the pipe class as an instance that appears in the TCB. */
  classSymbol: ClassSymbol;
}

/** Represents an instance of a class found in the TCB, i.e. `var _pipe1: MyPipe = null!; */
export interface ClassSymbol {
  /** The position for the variable declaration for the class instance. */
  tcbLocation: TcbLocation;
}
