/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AbsoluteSourceSpan,
  AST,
  BindingPipe,
  BindingType,
  ParseSourceSpan,
  PropertyRead,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstComponent,
  TmplAstDirective,
  TmplAstElement,
  TmplAstForLoopBlock,
  TmplAstForLoopBlockEmpty,
  TmplAstHoverDeferredTrigger,
  TmplAstIfBlockBranch,
  TmplAstInteractionDeferredTrigger,
  TmplAstLetDeclaration,
  TmplAstReference,
  TmplAstSwitchBlockCase,
  TmplAstTemplate,
  TmplAstTextAttribute,
  TmplAstVariable,
  TmplAstViewportDeferredTrigger,
  OutOfBandDiagnosticCategory,
  OutOfBandDiagnosticRecorder,
  type TcbDirectiveMetadata,
  type TypeCheckId,
} from '@angular/compiler';
import {Diagnostic} from './diagnostic.js';

export class OutOfBandDiagnosticRecorderImpl implements OutOfBandDiagnosticRecorder<Diagnostic> {
  private _diagnostics: Diagnostic[] = [];

  get diagnostics(): ReadonlyArray<Diagnostic> {
    return this._diagnostics;
  }

  private pushDiagnostic(
    typeCheckId: TypeCheckId,
    message: string,
    span: ParseSourceSpan | AbsoluteSourceSpan,
    category: OutOfBandDiagnosticCategory = OutOfBandDiagnosticCategory.Error,
    code?: number,
  ) {
    let start: number;
    let end: number;

    if (span instanceof ParseSourceSpan) {
      start = span.start.offset;
      end = span.end.offset;
    } else {
      start = span.start;
      end = span.end;
    }

    this._diagnostics.push({
      typeCheckId,
      message,
      start,
      end,
      category,
      code,
    });
  }

  error(id: TypeCheckId, message: string, span: AbsoluteSourceSpan) {
    this.pushDiagnostic(id, message, span, OutOfBandDiagnosticCategory.Error, 8000);
  }

  missingReferenceTarget(id: TypeCheckId, ref: TmplAstReference) {
    this.pushDiagnostic(
      id,
      `No directive found with exportAs '${ref.value.trim()}'.`,
      ref.valueSpan || ref.sourceSpan,
      OutOfBandDiagnosticCategory.Error,
      8003,
    );
  }

  missingPipe(id: TypeCheckId, ast: BindingPipe) {
    this.pushDiagnostic(
      id,
      `No pipe found with name '${ast.name}'.`,
      ast.nameSpan,
      OutOfBandDiagnosticCategory.Error,
      8004,
    );
  }

  deferredPipeUsedEagerly(
    id: TypeCheckId,
    ast: BindingPipe,
    currentBlockName: string | null = null,
    declaredBlocks: string[] | null = null,
  ) {
    let errorMsg: string;
    if (currentBlockName !== null && declaredBlocks !== null && declaredBlocks.length > 0) {
      errorMsg =
        `Pipe '${ast.name}' was imported via \`@Component.deferredImports\` under block '${declaredBlocks.join(', ')}', ` +
        `but is used in a \`@defer\` block configured for '${currentBlockName}'. ` +
        `To fix this, add '${ast.name}' to 'deferredImports.${currentBlockName}'.`;
    } else {
      errorMsg =
        `Pipe '${ast.name}' was imported via \`@Component.deferredImports\`, ` +
        `but was used outside of a \`@defer\` block in a template. To fix this, either ` +
        `use the '${ast.name}' pipe inside of a \`@defer\` block or import this dependency ` +
        `using the \`@Component.imports\` field.`;
    }

    this.pushDiagnostic(id, errorMsg, ast.nameSpan, OutOfBandDiagnosticCategory.Error, 8012);
  }

  deferredComponentUsedEagerly(
    id: TypeCheckId,
    element: TmplAstElement | TmplAstTemplate,
    dirMeta?: TcbDirectiveMetadata,
    currentBlockName: string | null = null,
    declaredBlocks: string[] | null = null,
  ) {
    const elementName =
      element instanceof TmplAstElement ? element.name : (element.tagName ?? 'ng-template');
    const kind = dirMeta?.isComponent ? 'Component' : 'Directive';
    const name = dirMeta?.name ?? elementName;
    const usage = dirMeta?.isComponent
      ? `used as element '${elementName}'`
      : `used on element '${elementName}'`;

    let errorMsg: string;
    if (currentBlockName !== null && declaredBlocks !== null && declaredBlocks.length > 0) {
      errorMsg =
        `${kind} '${name}' (${usage}) was imported via \`@Component.deferredImports\` ` +
        `under block '${declaredBlocks.join(', ')}', but is used in a \`@defer\` block configured for '${currentBlockName}'. ` +
        `To fix this, add '${name}' to 'deferredImports.${currentBlockName}'.`;
    } else {
      errorMsg =
        `${kind} '${name}' (${usage}) was imported via \`@Component.deferredImports\`, ` +
        `but was used outside of a \`@defer\` block in a template. To fix this, either ` +
        `use the '${elementName}' element inside of a \`@defer\` block or ` +
        `import '${name}' using the \`@Component.imports\` field.`;
    }

    const startSourceSpan = (element as any).startSourceSpan ?? element.sourceSpan;

    this.pushDiagnostic(id, errorMsg, startSourceSpan, OutOfBandDiagnosticCategory.Error, 8013);
  }

  duplicateTemplateVar(id: TypeCheckId, variable: TmplAstVariable) {
    this.pushDiagnostic(
      id,
      `Cannot redeclare variable '${variable.name}' as it was previously declared elsewhere for the same template.`,
      variable.keySpan,
      OutOfBandDiagnosticCategory.Error,
      8006,
    );
  }

  suboptimalTypeInference(id: TypeCheckId, variables: TmplAstVariable[]) {
    let diagnosticVar: TmplAstVariable | null = null;
    for (const variable of variables) {
      if (diagnosticVar === null || variable.value === '' || variable.value === '$implicit') {
        diagnosticVar = variable;
      }
    }
    if (diagnosticVar === null) return;
    let varIdentification = `'${diagnosticVar.name}'`;
    if (variables.length === 2) {
      varIdentification += ` (and 1 other)`;
    } else if (variables.length > 2) {
      varIdentification += ` (and ${variables.length - 1} others)`;
    }
    this.pushDiagnostic(
      id,
      `This structural directive supports advanced type inference, but the current compiler ` +
        `configuration prevents its usage. The variable ${varIdentification} will have type ` +
        `'any' as a result.\n\nConsider enabling the 'strictTemplates' option in your ` +
        `tsconfig.json for better type inference within this template.`,
      diagnosticVar.keySpan,
      OutOfBandDiagnosticCategory.Warning,
      8104,
    );
  }

  splitTwoWayBinding(id: TypeCheckId, input: TmplAstBoundAttribute) {
    this.pushDiagnostic(
      id,
      `The property and event halves of the two-way binding '${input.name}' are not bound ` +
        `to the same target.\n            ` +
        `Find more at https://angular.dev/guide/templates/two-way-binding`,
      input.keySpan,
      OutOfBandDiagnosticCategory.Error,
      8007,
    );
  }

  missingRequiredInputs(
    id: TypeCheckId,
    element: TmplAstElement | TmplAstTemplate | TmplAstComponent | TmplAstDirective,
    directiveName: string,
    isComponent: boolean,
    inputAliases: string[],
  ) {
    const aliasString = inputAliases.map((n) => `'${n}'`).join(', ');
    const type = isComponent ? 'component' : 'directive';
    let name: string | null;
    let span: ParseSourceSpan;

    if (element instanceof TmplAstElement || element instanceof TmplAstDirective) {
      name = element.name;
    } else if (element instanceof TmplAstComponent) {
      name = element.componentName;
    } else {
      name = null;
    }

    if (name === null) {
      span = element.startSourceSpan;
    } else {
      // Only highlight the tag name since highlighting the entire start tag can be noisy.
      const start = element.startSourceSpan.start.moveBy(1);
      const end = element.startSourceSpan.end.moveBy(
        start.offset + name.length - element.startSourceSpan.end.offset,
      );
      span = new ParseSourceSpan(start, end);
    }

    this.pushDiagnostic(
      id,
      `Required input${inputAliases.length === 1 ? '' : 's'} ${aliasString} from ${type} ${directiveName} must be specified.`,
      span,
      OutOfBandDiagnosticCategory.Error,
      8008,
    );
  }

  illegalForLoopTrackAccess(id: TypeCheckId, block: TmplAstForLoopBlock, access: PropertyRead) {
    const messageVars = [
      block.item,
      ...(block.contextVariables || []).filter((v) => v.value === '$index'),
    ]
      .map((v) => `'${v.name}'`)
      .join(', ');
    this.pushDiagnostic(
      id,
      `Cannot access '${access.name}' inside of a track expression. ` +
        `Only ${messageVars} and properties on the containing component are available to this expression.`,
      access.sourceSpan,
      OutOfBandDiagnosticCategory.Error,
      8009,
    );
  }

  inaccessibleDeferredTriggerElement(
    id: TypeCheckId,
    trigger:
      | TmplAstHoverDeferredTrigger
      | TmplAstInteractionDeferredTrigger
      | TmplAstViewportDeferredTrigger,
  ) {
    if (trigger.reference === null) {
      this.pushDiagnostic(
        id,
        `Trigger cannot find reference. Make sure that the @defer block has a @placeholder with at least one root element node.`,
        trigger.sourceSpan,
        OutOfBandDiagnosticCategory.Error,
        8010,
      );
    } else {
      this.pushDiagnostic(
        id,
        `Trigger cannot find reference "${trigger.reference}".\nCheck that an element ` +
          `with #${trigger.reference} exists in the same template and it's accessible ` +
          `from the @defer block.\nDeferred blocks can only access triggers in same view, ` +
          `a parent embedded view or the root view of the @placeholder block.`,
        trigger.sourceSpan,
        OutOfBandDiagnosticCategory.Error,
        8010,
      );
    }
  }

  controlFlowPreventingContentProjection(
    id: TypeCheckId,
    category: OutOfBandDiagnosticCategory,
    node: TmplAstElement | TmplAstTemplate,
    componentName: string,
    selector: string | null,
    controlFlowNode:
      | TmplAstIfBlockBranch
      | TmplAstSwitchBlockCase
      | TmplAstForLoopBlock
      | TmplAstForLoopBlockEmpty,
    preservesWhitespaces: boolean,
  ) {
    const blockName = controlFlowNode?.nameSpan?.toString().trim() || 'block';
    let msg =
      `Node matches the "${selector}" slot of the "${componentName}" component, but will not be projected into the specific slot because the surrounding ${blockName} has more than one node at its root. To project the node in the right slot, you can:\n\n` +
      `1. Wrap the content of the ${blockName} block in an <ng-container/> that matches the "${selector}" selector.\n` +
      `2. Split the content of the ${blockName} block across multiple ${blockName} blocks such that each one only has a single projectable node at its root.\n` +
      `3. Remove all content from the ${blockName} block, except for the node being projected.\n`;
    if (preservesWhitespaces) {
      msg +=
        '\nNote: the host component has `preserveWhitespaces: true` which may cause whitespace to affect content projection.\n';
    }
    msg +=
      '\nThis check can be disabled using the `extendedDiagnostics.checks.controlFlowPreventingContentProjection = "suppress"` compiler option.';
    this.pushDiagnostic(id, msg, node.startSourceSpan, category, 8011);
  }

  illegalWriteToLetDeclaration(id: TypeCheckId, node: AST, target: TmplAstLetDeclaration) {
    this.pushDiagnostic(
      id,
      `Cannot assign to @let declaration '${target.name}'.`,
      node.sourceSpan,
      OutOfBandDiagnosticCategory.Error,
      8015,
    );
  }

  letUsedBeforeDefinition(id: TypeCheckId, node: PropertyRead, target: TmplAstLetDeclaration) {
    this.pushDiagnostic(
      id,
      `Cannot read @let declaration '${target.name}' before it has been defined.`,
      node.sourceSpan,
      OutOfBandDiagnosticCategory.Error,
      8016,
    );
  }

  conflictingDeclaration(id: TypeCheckId, decl: TmplAstLetDeclaration) {
    this.pushDiagnostic(
      id,
      `Cannot declare @let called '${decl.name}' as there is another symbol in the template with the same name.`,
      decl.sourceSpan,
      OutOfBandDiagnosticCategory.Error,
      8017,
    );
  }

  missingNamedTemplateDependency(id: TypeCheckId, node: TmplAstComponent | TmplAstDirective) {
    this.pushDiagnostic(
      id,
      `Cannot find name "${node instanceof TmplAstDirective ? node.name : node.componentName}". ` +
        `Selectorless references are only supported to classes or non-type import statements.`,
      node.startSourceSpan,
      OutOfBandDiagnosticCategory.Error,
      8001,
    );
  }

  incorrectTemplateDependencyType(id: TypeCheckId, node: TmplAstComponent | TmplAstDirective) {
    this.pushDiagnostic(
      id,
      `Incorrect reference type. Type must be a standalone @Component or @Directive.`,
      node.startSourceSpan,
      OutOfBandDiagnosticCategory.Error,
      8001,
    );
  }

  unclaimedDirectiveBinding(
    id: TypeCheckId,
    directive: TmplAstDirective,
    node: TmplAstBoundAttribute | TmplAstTextAttribute | TmplAstBoundEvent,
  ) {
    this.pushDiagnostic(
      id,
      `Directive ${directive.name} does not have an input or output named "${node.name}". ` +
        `Bindings to directives must target existing inputs or outputs.`,
      node.keySpan || node.sourceSpan,
      OutOfBandDiagnosticCategory.Error,
      8018,
    );
  }

  deferImplicitTriggerMissingPlaceholder(
    id: TypeCheckId,
    trigger:
      | TmplAstHoverDeferredTrigger
      | TmplAstInteractionDeferredTrigger
      | TmplAstViewportDeferredTrigger,
  ) {
    this.pushDiagnostic(
      id,
      'Trigger with no target can only be placed on an @defer that has a @placeholder block',
      trigger.sourceSpan,
      OutOfBandDiagnosticCategory.Error,
      8019,
    );
  }

  deferImplicitTriggerInvalidPlaceholder(
    id: TypeCheckId,
    trigger:
      | TmplAstHoverDeferredTrigger
      | TmplAstInteractionDeferredTrigger
      | TmplAstViewportDeferredTrigger,
  ) {
    this.pushDiagnostic(
      id,
      'Trigger with no target can only be placed on an @defer that has a ' +
        '@placeholder block with exactly one root element node',
      trigger.sourceSpan,
      OutOfBandDiagnosticCategory.Error,
      8019,
    );
  }

  formFieldUnsupportedBinding(id: TypeCheckId, node: TmplAstBoundAttribute | TmplAstTextAttribute) {
    let message: string;

    if (node instanceof TmplAstBoundAttribute) {
      let name: string;

      if (node.type === BindingType.Property) {
        name = `[${node.name}]`;
      } else if (node.type === BindingType.Attribute) {
        name = `[attr.${node.name}]`;
      } else {
        // We shouldn't hit this, but we have this logic as a fallback.
        name = node.name;
      }

      message = `Binding to '${name}' is not allowed on nodes using the '[formField]' directive`;
    } else {
      message = `Setting the '${node.name}' attribute is not allowed on nodes using the '[formField]' directive`;
    }

    this.pushDiagnostic(id, message, node.sourceSpan, OutOfBandDiagnosticCategory.Error, 8020);
  }

  multipleMatchingComponents(id: TypeCheckId, element: TmplAstElement, componentNames: string[]) {
    const names = componentNames.map((n: string) => `'${n}'`).join(', ');
    this.pushDiagnostic(
      id,
      `Multiple components match node with tagname ${element.name}: ${names}.`,
      element.startSourceSpan,
      OutOfBandDiagnosticCategory.Error,
      8001,
    );
  }

  conflictingHostDirectiveBinding(
    id: TypeCheckId,
    node: TmplAstElement | TmplAstTemplate | TmplAstComponent | TmplAstDirective,
    directiveName: string,
    kind: 'input' | 'output',
    classPropertyName: string,
    aliases: string[],
  ): void {
    // Dummy implementation to satisfy interface
  }
}
