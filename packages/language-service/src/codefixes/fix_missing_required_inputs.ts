/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AST, BindingType, TmplAstBoundAttribute, TmplAstElement, TmplAstTemplate, TmplAstTextAttribute} from '@angular/compiler';
import {ErrorCode, ngErrorCode} from '@angular/compiler-cli/src/ngtsc/diagnostics';
import {TypeCheckableDirectiveMeta} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import {Node} from '@angular/compiler/src/render3/r3_ast';
import tss from 'typescript/lib/tsserverlibrary';

import {getTargetAtPosition, TargetNodeKind} from '../template_target';

import {CodeActionMeta, FixIdForCodeFixesAll} from './utils';

/**
 * This code action will fix the missing required input of an element.
 */
export const fixMissingRequiredInput: CodeActionMeta = {
  errorCodes: [ngErrorCode(ErrorCode.MISSING_REQUIRED_INPUTS)],
  getCodeActions: function({templateInfo, start, compiler, fileName}) {
    const positionDetails = getTargetAtPosition(templateInfo.template, start);
    if (positionDetails === null) {
      return [];
    }

    // For two-way bindings, we actually only need to be concerned with the bound attribute because
    // the bindings in the template are written with the attribute name, not the event name.
    const node = positionDetails.context.kind === TargetNodeKind.TwoWayBindingContext ?
        positionDetails.context.nodes[0] :
        positionDetails.context.node;

    if (!(node instanceof TmplAstElement || node instanceof TmplAstTemplate)) {
      return [];
    }

    let tagName: string|null = null;
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

    const symbol = ttc.getSymbolOfNode(node, templateInfo.component);
    if (symbol === null) {
      return [];
    }

    const codeActions: tss.CodeFixAction[] = [];

    for (const dirSymbol of symbol.directives) {
      const directive = dirSymbol.tsSymbol.valueDeclaration;
      if (!tss.isClassDeclaration(directive)) {
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
          const memberSymbol =
              typeCheck.getPropertyOfType(dirSymbol.tsType, input.classPropertyName);
          if (memberSymbol === undefined) {
            continue;
          }

          const memberType = typeCheck.getTypeOfSymbol(memberSymbol);
          if (memberType.flags & tss.TypeFlags.BooleanLike) {
            const insertText = input.bindingPropertyName;
            codeActions.push({
              fixName: FixIdForCodeFixesAll.FIX_SPELLING,
              // fixId: FixIdForCodeFixesAll.FIX_MISSING_REQUIRED_INPUTS,
              // fixAllDescription: '',
              description: `Create ${insertText} attribute for "${tagName}"`,
              changes: [{
                fileName,
                textChanges: [{
                  span: tss.createTextSpan(insertPosition, 0),
                  newText: ' ' + insertText,
                }],
              }],
            });
          } else if (memberType.flags & tss.TypeFlags.StringLike) {
            const insertInterpolations = `${input.bindingPropertyName}=""`;
            codeActions.push({
              fixName: FixIdForCodeFixesAll.FIX_MISSING_REQUIRED_INPUTS,
              // fixId: FixIdForCodeFixesAll.FIX_MISSING_REQUIRED_INPUTS,
              // fixAllDescription: '',
              description: `Create ${insertInterpolations} attribute for "${tagName}"`,
              changes: [{
                fileName,
                textChanges: [{
                  span: tss.createTextSpan(insertPosition, 0),
                  newText: ' ' + insertInterpolations,
                }],
              }],
            });
          } else {
          }

          const insertBoundText = `[${input.bindingPropertyName}]=""`;
          codeActions.push({
            fixName: FixIdForCodeFixesAll.FIX_MISSING_REQUIRED_INPUTS,
            // fixId: FixIdForCodeFixesAll.FIX_MISSING_REQUIRED_INPUTS,
            // fixAllDescription: '',
            description: `Create ${insertBoundText} attribute for "${tagName}"`,
            changes: [{
              fileName,
              textChanges: [{
                span: tss.createTextSpan(insertPosition, 0),
                newText: ' ' + insertBoundText,
              }],
            }],
          });
        }
      }
    }

    return codeActions;
  },
  fixIds: [FixIdForCodeFixesAll.FIX_MISSING_REQUIRED_INPUTS],
  getAllCodeActions: function() {
    return {
      changes: [],
    };
  }
};

interface TcbBoundAttribute {
  attribute: TmplAstBoundAttribute|TmplAstTextAttribute;
  inputs: {
    fieldName: string,
    required: boolean,
    transformType: tss.TypeNode|null,
  }[];
}

function getBoundAttributes(
    directive: TypeCheckableDirectiveMeta,
    node: TmplAstTemplate|TmplAstElement): TcbBoundAttribute[] {
  const boundInputs: TcbBoundAttribute[] = [];

  const processAttribute = (attr: TmplAstBoundAttribute|TmplAstTextAttribute) => {
    // Skip non-property bindings.
    if (attr instanceof TmplAstBoundAttribute && attr.type !== BindingType.Property) {
      return;
    }

    // Skip the attribute if the directive does not have an input for it.
    const inputs = directive.inputs.getByBindingPropertyName(attr.name);

    if (inputs !== null) {
      boundInputs.push({
        attribute: attr,
        inputs: inputs.map(input => ({
                             fieldName: input.classPropertyName,
                             required: input.required,
                             transformType: input.transform?.type || null
                           }))
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
    element: TmplAstElement|TmplAstTemplate, parent: Node|AST|null): Node|null {
  let lastAttribute: Node|null = null;

  const updateAttribute = (attr: Node) => {
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
    parent: Node|AST|null, node: Node): parent is TmplAstTemplate {
  if (parent instanceof TmplAstTemplate && node instanceof TmplAstElement) {
    if (parent.sourceSpan.start.offset === node.sourceSpan.start.offset) {
      return true;
    }
  }
  return false;
}
