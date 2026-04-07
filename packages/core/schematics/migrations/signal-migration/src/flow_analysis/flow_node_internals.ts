/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// NOTE: This file contains derived code from original sources
// created by Microsoft, licensed under an Apache License.
// This is the formal `NOTICE` for the modified/copied code.
// Original license: https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt.
// Original ref: https://github.com/microsoft/TypeScript/pull/58036

import ts from 'typescript';

/** @internal */
export enum FlowFlags {
  Unreachable = 1 << 0, // Unreachable code
  Start = 1 << 1, // Start of flow graph
  BranchLabel = 1 << 2, // Non-looping junction
  LoopLabel = 1 << 3, // Looping junction
  Assignment = 1 << 4, // Assignment
  TrueCondition = 1 << 5, // Condition known to be true
  FalseCondition = 1 << 6, // Condition known to be false
  SwitchClause = 1 << 7, // Switch statement clause
  ArrayMutation = 1 << 8, // Potential array mutation
  Call = 1 << 9, // Potential assertion call
  ReduceLabel = 1 << 10, // Temporarily reduce antecedents of label
  Referenced = 1 << 11, // Referenced as antecedent once
  Shared = 1 << 12, // Referenced as antecedent more than once

  Label = BranchLabel | LoopLabel,
  Condition = TrueCondition | FalseCondition,
}

/** @internal */
export type FlowNode =
  | FlowUnreachable
  | FlowStart
  | FlowLabel
  | FlowAssignment
  | FlowCondition
  | FlowSwitchClause
  | FlowArrayMutation
  | FlowCall
  | FlowReduceLabel;

/** @internal */
export interface FlowNodeBase {
  flags: FlowFlags;
  id: number; // Node id used by flow type cache in checker
  node: unknown; // Node or other data
  antecedent: FlowNode | FlowNode[] | undefined;
}

/** @internal */
export interface FlowUnreachable extends FlowNodeBase {
  node: undefined;
  antecedent: undefined;
}

// FlowStart represents the start of a control flow. For a function expression or arrow
// function, the node property references the function (which in turn has a flowNode
// property for the containing control flow).
/** @internal */
export interface FlowStart extends FlowNodeBase {
  node:
    | ts.FunctionExpression
    | ts.ArrowFunction
    | ts.MethodDeclaration
    | ts.GetAccessorDeclaration
    | ts.SetAccessorDeclaration
    | undefined;
  antecedent: undefined;
}

// FlowLabel represents a junction with multiple possible preceding control flows.
/** @internal */
export interface FlowLabel extends FlowNodeBase {
  node: undefined;
  antecedent: FlowNode[] | undefined;
}

// FlowAssignment represents a node that assigns a value to a narrowable reference,
// i.e. an identifier or a dotted name that starts with an identifier or 'this'.
/** @internal */
export interface FlowAssignment extends FlowNodeBase {
  node: ts.Expression | ts.VariableDeclaration | ts.BindingElement;
  antecedent: FlowNode;
}

/** @internal */
export interface FlowCall extends FlowNodeBase {
  node: ts.CallExpression;
  antecedent: FlowNode;
}

// FlowCondition represents a condition that is known to be true or false at the
// node's location in the control flow.
/** @internal */
export interface FlowCondition extends FlowNodeBase {
  node: ts.Expression;
  antecedent: FlowNode;
}

// dprint-ignore
/** @internal */
export interface FlowSwitchClause extends FlowNodeBase {
  node: FlowSwitchClauseData;
  antecedent: FlowNode;
}

/** @internal */
export interface FlowSwitchClauseData {
  switchStatement: ts.SwitchStatement;
  clauseStart: number; // Start index of case/default clause range
  clauseEnd: number; // End index of case/default clause range
}

// FlowArrayMutation represents a node potentially mutates an array, i.e. an
// operation of the form 'x.push(value)', 'x.unshift(value)' or 'x[n] = value'.
/** @internal */
export interface FlowArrayMutation extends FlowNodeBase {
  node: ts.CallExpression | ts.BinaryExpression;
  antecedent: FlowNode;
}

/** @internal */
export interface FlowReduceLabel extends FlowNodeBase {
  node: FlowReduceLabelData;
  antecedent: FlowNode;
}

/** @internal */
export interface FlowReduceLabelData {
  target: FlowLabel;
  antecedents: FlowNode[];
}
