/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AST,
  BindingType,
  R3Identifiers,
  TmplAstBoundAttribute,
  TmplAstElement,
  TmplAstNode,
  TmplAstTemplate,
  TmplAstTextAttribute,
} from '@angular/compiler';
import {ErrorCode, ngErrorCode} from '@angular/compiler-cli/src/ngtsc/diagnostics';
import {TypeCheckableDirectiveMeta} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import ts from 'typescript';

import {getTargetAtPosition, TargetNodeKind} from '../template_target';

import {CodeActionContext, CodeActionMeta, FixIdForCodeFixesAll} from './utils';

/**
 * This code action will fix the missing required input of an element.
 */
export const fixMissingRequiredInput: CodeActionMeta = {
  errorCodes: [ngErrorCode(ErrorCode.MISSING_REQUIRED_INPUTS)],
  getCodeActions: function ({typeCheckInfo, start, compiler, fileName}: CodeActionContext) {
    if (typeCheckInfo === null) {
      return [];
    }

    const positionDetails = getTargetAtPosition(typeCheckInfo.nodes, start);
    if (positionDetails === null) {
      return [];
    }

    // For two-way bindings, we actually only need to be concerned with the bound attribute because
    // the bindings in the template are written with the attribute name, not the event name.
    const node =
      positionDetails.context.kind === TargetNodeKind.TwoWayBindingContext
        ? positionDetails.context.nodes[0]
        : positionDetails.context.node;

    if (!(node instanceof TmplAstElement || node instanceof TmplAstTemplate)) {
      return [];
    }

    let tagName: string | null = null;
    if (node instanceof TmplAstElement) {
      tagName = node.name;
    } else {
      tagName = node.tagName;
    }
    if (tagName === null) {
      return [];
    }

    let insertPosition = node.startSourceSpan.start.offset + tagName.length + 1;
    const lastAttribute = findLastAttributeInTheElement(node, positionDetails.parent);
    if (lastAttribute !== null) {
      insertPosition = lastAttribute.sourceSpan.end.offset;
    }

    const ttc = compiler.getTemplateTypeChecker();

    const symbol = ttc.getSymbolOfNode(node, typeCheckInfo.declaration);
    if (symbol === null) {
      return [];
    }

    const codeActions: ts.CodeFixAction[] = [];

    for (const dirSymbol of symbol.directives) {
      const directive = dirSymbol.tsSymbol.valueDeclaration;
      if (!ts.isClassDeclaration(directive)) {
        continue;
      }

      const meta = ttc.getDirectiveMetadata(directive);
      if (meta === null) {
        continue;
      }

      const seenRequiredInputs = new Set<string>();

      const boundAttrs = getBoundAttributes(meta, node);
      for (const attr of boundAttrs) {
        for (const {fieldName, required} of attr.inputs) {
          if (required) {
            seenRequiredInputs.add(fieldName);
          }
        }
      }

      for (const input of meta.inputs) {
        if (input.required && !seenRequiredInputs.has(input.classPropertyName)) {
          const typeCheck = compiler.getCurrentProgram().getTypeChecker();
          const memberSymbol = typeCheck.getPropertyOfType(
            dirSymbol.tsType,
            input.classPropertyName,
          );
          if (memberSymbol === undefined) {
            continue;
          }

          const memberType = getInputType(
            memberSymbol,
            typeCheck,
            input.isSignal,
            input.transform?.type.node,
          );
          // For boolean inputs, suggest adding the attribute name directly (e.g., `attrName`).
          // This is a common way to set boolean inputs to true.
          if (memberType.flags & ts.TypeFlags.BooleanLike) {
            const insertText = input.bindingPropertyName;
            codeActions.push({
              fixName: FixIdForCodeFixesAll.FIX_MISSING_REQUIRED_INPUTS,
              // fixId: FixIdForCodeFixesAll.FIX_MISSING_REQUIRED_INPUTS,
              // fixAllDescription: '',
              description: `Create ${insertText} attribute for "${tagName}"`,
              changes: [
                {
                  fileName,
                  textChanges: [
                    {
                      span: ts.createTextSpan(insertPosition, 0),
                      newText: ' ' + insertText,
                    },
                  ],
                },
              ],
            });
            // For string inputs, suggest adding an empty string binding (e.g., `attrName=""`).
          } else if (memberType.flags & ts.TypeFlags.StringLike) {
            const insertInterpolations = `${input.bindingPropertyName}=""`;
            codeActions.push({
              fixName: FixIdForCodeFixesAll.FIX_MISSING_REQUIRED_INPUTS,
              // fixId: FixIdForCodeFixesAll.FIX_MISSING_REQUIRED_INPUTS,
              // fixAllDescription: '',
              description: `Create ${insertInterpolations} attribute for "${tagName}"`,
              changes: [
                {
                  fileName,
                  textChanges: [
                    {
                      span: ts.createTextSpan(insertPosition, 0),
                      newText: ' ' + insertInterpolations,
                    },
                  ],
                },
              ],
            });
          } else {
            // For other input types (numbers, objects, etc.), no type-specific shorthand
            // attribute suggestion is generated here. The general property binding suggestion
            // `[inputName]=""` (added below for all missing inputs) covers these cases.
          }

          // As a general solution, always offer a property binding suggestion (e.g., `[inputName]=""`).
          // This is the most versatile way for users to satisfy a required input,
          // allowing them to bind to component properties or provide initial literal values.
          const insertBoundText = `[${input.bindingPropertyName}]=""`;
          codeActions.push({
            fixName: FixIdForCodeFixesAll.FIX_MISSING_REQUIRED_INPUTS,
            // fixId: FixIdForCodeFixesAll.FIX_MISSING_REQUIRED_INPUTS,
            // fixAllDescription: '',
            description: `Create ${insertBoundText} attribute for "${tagName}"`,
            changes: [
              {
                fileName,
                textChanges: [
                  {
                    span: ts.createTextSpan(insertPosition, 0),
                    newText: ' ' + insertBoundText,
                  },
                ],
              },
            ],
          });
        }
      }
    }

    return codeActions;
  },
  fixIds: [FixIdForCodeFixesAll.FIX_MISSING_REQUIRED_INPUTS],
  getAllCodeActions: function () {
    return {
      changes: [],
    };
  },
};

interface TcbBoundAttribute {
  attribute: TmplAstBoundAttribute | TmplAstTextAttribute;
  inputs: {
    fieldName: string;
    required: boolean;
  }[];
}

function getBoundAttributes(
  directive: TypeCheckableDirectiveMeta,
  node: TmplAstTemplate | TmplAstElement,
): TcbBoundAttribute[] {
  const boundInputs: TcbBoundAttribute[] = [];

  const processAttribute = (attr: TmplAstBoundAttribute | TmplAstTextAttribute) => {
    // Skip non-property bindings.
    if (attr instanceof TmplAstBoundAttribute && attr.type !== BindingType.Property) {
      return;
    }

    // Skip the attribute if the directive does not have an input for it.
    const inputs = directive.inputs.getByBindingPropertyName(attr.name);

    if (inputs !== null) {
      boundInputs.push({
        attribute: attr,
        inputs: inputs.map((input) => ({
          fieldName: input.classPropertyName,
          required: input.required,
        })),
      });
    }
  };

  node.inputs.forEach(processAttribute);
  node.attributes.forEach(processAttribute);
  if (node instanceof TmplAstTemplate) {
    node.templateAttrs.forEach(processAttribute);
  }

  return boundInputs;
}

/**
 * If the last attribute is from the structural directive, it is skipped and returns
 * the previous attribute.
 */
function findLastAttributeInTheElement(
  element: TmplAstElement | TmplAstTemplate,
  parent: TmplAstNode | AST | null,
): TmplAstNode | null {
  let lastAttribute: TmplAstNode | null = null;

  const updateAttribute = (attr: TmplAstNode) => {
    if (lastAttribute === null) {
      lastAttribute = attr;
      return;
    }
    if (attr.sourceSpan.end.offset < lastAttribute.sourceSpan.end.offset) {
      return;
    }
    lastAttribute = attr;
  };

  const attrNodes = [...element.attributes, ...element.inputs, ...element.outputs];

  /**
   * Skip the template attributes. For example, `<a *ngFor=""></a>`, its shorthand is `<ng-template
   * ngFor>`, the `valueSpan` of `ngFor` is empty, the info of `=""` is lost, so it can't use to
   * insert the missing attribute after it.
   */
  // if (element instanceof TmplAstElement && isStructuralDirectiveShorthand(parent, element)) {
  //   attrNodes.push(...parent.templateAttrs);
  // }

  for (const attr of attrNodes) {
    updateAttribute(attr);
  }

  return lastAttribute;
}

function isStructuralDirectiveShorthand(
  parent: TmplAstNode | AST | null,
  node: TmplAstNode,
): parent is TmplAstTemplate {
  if (parent instanceof TmplAstTemplate && node instanceof TmplAstElement) {
    if (parent.sourceSpan.start.offset === node.sourceSpan.start.offset) {
      return true;
    }
  }
  return false;
}

/**
 * If the input is a decorator, return the type of the symbol; if there is a
 * transform for the input, return the transform type.
 *
 * If the input is a signal, the real input type is wrapped by the signal type.
 */
function getInputType(
  symbol: ts.Symbol,
  typeCheck: ts.TypeChecker,
  isSignal: boolean,
  transformTypeNode: ts.TypeNode | undefined,
): ts.Type {
  if (isSignal) {
    return getSignalMemberTypeOfSymbol(symbol, typeCheck);
  } else {
    const transformType =
      transformTypeNode !== undefined ? typeCheck.getTypeAtLocation(transformTypeNode) : undefined;
    return transformType ?? typeCheck.getTypeOfSymbol(symbol);
  }
}

/**
 * The return of `input.required` is extended from the `InputSignalWithTransform`,
 * return the type of `TransformT` for the signal input
 *
 * ```ts
 * export interface InputSignalWithTransform<T, TransformT> extends Signal<T> {
 *    [SIGNAL]: InputSignalNode<T, TransformT>;
 *    [ɵINPUT_SIGNAL_BRAND_READ_TYPE]: T;
 *    [ɵINPUT_SIGNAL_BRAND_WRITE_TYPE]: TransformT;
 * }
 * ```
 */
function getSignalMemberTypeOfSymbol(symbol: ts.Symbol, typeCheck: ts.TypeChecker): ts.Type {
  const memberType = typeCheck.getTypeOfSymbol(symbol);
  const properties = typeCheck.getPropertiesOfType(memberType);
  for (const property of properties) {
    const propertyNode =
      property.declarations !== undefined && property.declarations.length > 0
        ? property.declarations[0]
        : undefined;
    if (propertyNode === undefined) {
      continue;
    }

    if (ts.isPropertySignature(propertyNode)) {
      if (ts.isComputedPropertyName(propertyNode.name)) {
        if (
          propertyNode.name.expression.getText() === R3Identifiers.InputSignalBrandWriteType.name
        ) {
          return typeCheck.getTypeOfSymbol(property);
        }
      }
    }
  }
  return typeCheck.getUnknownType();
}
