/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  ASTWithSource,
  ArrowFunction,
  BindingPipe,
  BindingType,
  Call,
  ImplicitReceiver,
  LiteralArray,
  LiteralMap,
  LiteralPrimitive,
  SafeCall,
  ParsedEventType,
  PropertyRead,
  SpreadElement,
  TemplateLiteral,
  TmplAstBoundAttribute,
  TmplAstBoundDeferredTrigger,
  TmplAstBoundEvent,
  TmplAstBoundText,
  TmplAstDeferredBlock,
  TmplAstForLoopBlock,
  TmplAstIfBlockBranch,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstSwitchBlock,
  TmplAstTextAttribute,
  TmplAstVariable,
  TmplAstReference,
  tmplAstVisitAll,
  RecursiveAstVisitor,
  TmplAstRecursiveVisitor,
  Unary,
} from '@angular/compiler';
import {NgCompiler} from '@angular/compiler-cli/src/ngtsc/core';
import {
  SymbolKind,
  VariableSymbol,
  PipeSymbol,
  OutputBindingSymbol,
  InputBindingSymbol,
  LetDeclarationSymbol,
  ReferenceSymbol,
  DomBindingSymbol,
  ElementSymbol,
  ExpressionSymbol,
} from '@angular/compiler-cli/src/ngtsc/typecheck/api';
import {TemplateTypeChecker} from '@angular/compiler-cli/src/ngtsc/typecheck/api/checker';
import {findFirstMatchingNode} from '@angular/compiler-cli/src/ngtsc/typecheck/src/comments';
import ts from 'typescript';

import {TypeCheckInfo} from './utils';
import {DOM_EVENT_TYPE_MAP} from './events';

// Re-export types from API for internal use
export type {AngularInlayHint, InlayHintsConfig, InlayHintDisplayPart} from '../api';
import type {AngularInlayHint, InlayHintsConfig, InlayHintDisplayPart} from '../api';

/**
 * Default configuration - aligned with TypeScript's defaults where applicable.
 */
const DEFAULT_CONFIG: Required<InlayHintsConfig> = {
  // Variable type hints (like TS includeInlayVariableTypeHints)
  forLoopVariableTypes: true,
  ifAliasTypes: true,
  letDeclarationTypes: true,
  referenceVariableTypes: true,
  variableTypeHintsWhenTypeMatchesName: true,

  // Arrow function type hints (like TS function type hints)
  arrowFunctionParameterTypes: true,
  arrowFunctionReturnTypes: true,

  // Parameter name hints (like TS includeInlayParameterNameHints)
  parameterNameHints: 'all',
  parameterNameHintsWhenArgumentMatchesName: false,

  // Event type hints (Angular-specific)
  eventParameterTypes: true,

  // Pipe and binding hints (Angular-specific)
  pipeOutputTypes: true,
  propertyBindingTypes: true,
  twoWayBindingSignalTypes: true,

  // Visual differentiation
  requiredInputIndicator: 'none',

  // Interactive hints (like TS interactiveInlayHints)
  interactiveInlayHints: false,

  // Host listener argument types (Angular-specific)
  hostListenerArgumentTypes: true,

  // Control flow block hints (Angular-specific)
  switchExpressionTypes: true,
  deferTriggerTypes: true,
};

/**
 * Normalize the eventParameterTypes config to a structured format.
 */
function normalizeEventConfig(
  config:
    | boolean
    | {nativeEvents?: boolean; componentEvents?: boolean; animationEvents?: boolean}
    | undefined,
): {
  enabled: boolean;
  nativeEvents: boolean;
  componentEvents: boolean;
  animationEvents: boolean;
} {
  if (config === false) {
    return {enabled: false, nativeEvents: false, componentEvents: false, animationEvents: false};
  }
  if (config === true || config === undefined) {
    return {enabled: true, nativeEvents: true, componentEvents: true, animationEvents: true};
  }
  return {
    enabled: true,
    nativeEvents: config.nativeEvents ?? true,
    componentEvents: config.componentEvents ?? true,
    animationEvents: config.animationEvents ?? true,
  };
}

/**
 * Normalize the propertyBindingTypes config to a structured format.
 */
function normalizePropertyConfig(
  config: boolean | {nativeProperties?: boolean; componentInputs?: boolean} | undefined,
): {
  enabled: boolean;
  nativeProperties: boolean;
  componentInputs: boolean;
} {
  if (config === false) {
    return {enabled: false, nativeProperties: false, componentInputs: false};
  }
  if (config === true || config === undefined) {
    return {enabled: true, nativeProperties: true, componentInputs: true};
  }
  return {
    enabled: true,
    nativeProperties: config.nativeProperties ?? true,
    componentInputs: config.componentInputs ?? true,
  };
}

/**
 * Normalize the ifAliasTypes config to a structured format.
 */
function normalizeIfAliasConfig(config: InlayHintsConfig['ifAliasTypes']): {
  enabled: boolean;
  simpleExpressions: boolean;
  complexExpressions: boolean;
} {
  if (config === false) {
    return {enabled: false, simpleExpressions: false, complexExpressions: false};
  }
  if (config === true || config === undefined) {
    return {enabled: true, simpleExpressions: true, complexExpressions: true};
  }
  if (config === 'complex') {
    // Only show hints for complex expressions
    return {enabled: true, simpleExpressions: false, complexExpressions: true};
  }
  return {
    enabled: true,
    simpleExpressions: config.simpleExpressions ?? true,
    complexExpressions: config.complexExpressions ?? true,
  };
}

/**
 * Check if an @if expression is a "simple" expression.
 * Simple: @if (variable; as alias) - just a property read from implicit receiver
 * Complex: @if (var == 2; as alias), @if (var.prop; as alias), @if (fn(); as alias)
 */
function isSimpleIfExpression(expression: AST | null): boolean {
  if (!expression) return true;

  // Unwrap ASTWithSource
  const expr = expression instanceof ASTWithSource ? expression.ast : expression;

  // Simple case: PropertyRead with ImplicitReceiver (e.g., @if (data; as result))
  if (expr instanceof PropertyRead && expr.receiver instanceof ImplicitReceiver) {
    return true;
  }

  // Everything else is complex
  return false;
}

/**
 * Get Angular-specific inlay hints for a template.
 */
export function getInlayHintsForTemplate(
  compiler: NgCompiler,
  typeCheckInfo: TypeCheckInfo,
  span: ts.TextSpan,
  config: InlayHintsConfig = {},
): AngularInlayHint[] {
  const mergedConfig = {...DEFAULT_CONFIG, ...config};
  const hints: AngularInlayHint[] = [];
  const ttc = compiler.getTemplateTypeChecker();
  const typeChecker = compiler.getCurrentProgram().getTypeChecker();

  // Get the Type Check Block for accessing resolved types
  // The TCB has TypeScript's resolved types for all expressions, including
  // overloaded function calls and generic type inference
  const tcb = ttc.getTypeCheckBlock(typeCheckInfo.declaration);

  // Get the template AST (may be null for directives without templates)
  const template = ttc.getTemplate(typeCheckInfo.declaration);

  // Helper to check if a position is within our requested span
  const isInSpan = (pos: number): boolean => {
    return pos >= span.start && pos < span.start + span.length;
  };

  // Helper to format type string (remove unnecessary verbosity)
  const formatType = (type: ts.Type): string => {
    let typeStr = typeChecker.typeToString(
      type,
      undefined,
      ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.OmitParameterModifiers,
    );
    // Simplify common patterns
    typeStr = typeStr.replace(/import\([^)]+\)\./g, ''); // Remove import paths
    return typeStr;
  };

  /**
   * Try to get the declaration info from a type for interactive hints.
   * Returns the first declaration's location if available.
   */
  const getTypeDeclarationInfo = (
    type: ts.Type,
  ): {file: string; start: number; length: number} | null => {
    const symbol = type.getSymbol();
    if (symbol) {
      const declarations = symbol.getDeclarations();
      if (declarations && declarations.length > 0) {
        const decl = declarations[0];
        const sourceFile = decl.getSourceFile();
        return {
          file: sourceFile.fileName,
          start: decl.getStart(),
          length: decl.getWidth(),
        };
      }
    }
    return null;
  };

  /**
   * Create a type hint with optional interactivity.
   * When interactiveInlayHints is enabled and the type has a declaration,
   * clicking the hint navigates to the type definition.
   *
   * @param position - Position in the template where the hint should appear
   * @param type - The ts.Type object (required for interactive navigation)
   * @param typeStr - The formatted type string to display
   * @param paddingLeft - Add padding before the hint
   * @param paddingRight - Add padding after the hint
   */
  const createTypeHint = (
    position: number,
    type: ts.Type,
    typeStr: string,
    paddingLeft: boolean = false,
    paddingRight: boolean = false,
  ): AngularInlayHint => {
    // Try to get the type's declaration for interactive hints
    if (mergedConfig.interactiveInlayHints) {
      const declInfo = getTypeDeclarationInfo(type);
      if (declInfo) {
        return {
          position,
          text: '',
          kind: 'Type',
          paddingLeft,
          paddingRight,
          displayParts: [
            {text: ': '},
            {
              text: typeStr,
              span: {
                start: declInfo.start,
                length: declInfo.length,
              },
              file: declInfo.file,
            },
          ],
        };
      }
    }

    // Non-interactive hint
    return {
      position,
      text: `: ${typeStr}`,
      kind: 'Type',
      paddingLeft,
      paddingRight,
    };
  };

  /**
   * Create a type hint from a type string with optional suffix (like "!" for required).
   * When interactiveInlayHints is enabled and the type has a declaration,
   * clicking the hint navigates to the type definition.
   *
   * This is useful when we have a ts.Type but need to add extra text like
   * required indicators or wrapper types.
   *
   * @param position - Position in the template where the hint should appear
   * @param type - The ts.Type object (can be null if type not available)
   * @param typeStr - The formatted type string to display
   * @param suffix - Optional suffix to add after the type (e.g., "!" for required)
   * @param prefix - Optional prefix before the colon (defaults to empty)
   */
  const createTypeHintWithSuffix = (
    position: number,
    type: ts.Type | null,
    typeStr: string,
    suffix: string = '',
    prefix: string = '',
  ): AngularInlayHint => {
    // Try to get the type's declaration for interactive hints
    if (mergedConfig.interactiveInlayHints && type) {
      const declInfo = getTypeDeclarationInfo(type);
      if (declInfo) {
        const parts: InlayHintDisplayPart[] = [];
        if (prefix) {
          parts.push({text: prefix});
        }
        parts.push({text: ': '});
        parts.push({
          text: typeStr,
          span: {
            start: declInfo.start,
            length: declInfo.length,
          },
          file: declInfo.file,
        });
        if (suffix) {
          parts.push({text: suffix});
        }
        return {
          position,
          text: '',
          kind: 'Type',
          paddingLeft: false,
          paddingRight: false,
          displayParts: parts,
        };
      }
    }

    // Non-interactive hint
    return {
      position,
      text: `${prefix}: ${typeStr}${suffix}`,
      kind: 'Type',
      paddingLeft: false,
      paddingRight: false,
    };
  };

  /**
   * Check if the type name matches the variable name (case-insensitive).
   * TypeScript skips variable type hints when the type name matches the variable name.
   * e.g., `const user: User` - hint is skipped because 'user' matches 'User'
   */
  const typeMatchesName = (typeName: string, variableName: string): boolean => {
    // Handle generic types like User<T> - extract the base type name
    const baseTypeName = typeName.split('<')[0].trim();
    return baseTypeName.toLowerCase() === variableName.toLowerCase();
  };

  /**
   * Check if a variable type hint should be shown based on config.
   * Returns false if variableTypeHintsWhenTypeMatchesName is false and the names match.
   */
  const shouldShowVariableTypeHint = (typeStr: string, varName: string): boolean => {
    if (!mergedConfig.variableTypeHintsWhenTypeMatchesName && typeMatchesName(typeStr, varName)) {
      return false;
    }
    return true;
  };

  // Track variables that have already been processed to avoid duplicate hints.
  // Variables from @for blocks (item and context variables) and @if aliases
  // are processed in their respective visit methods, but the recursive visitor
  // will also visit them via visitVariable. We track them to prevent duplicates.
  const processedVariables = new Set<TmplAstVariable>();

  // Visitor to collect inlay hints from template nodes
  class InlayHintVisitor extends TmplAstRecursiveVisitor {
    override visitForLoopBlock(block: TmplAstForLoopBlock): void {
      if (mergedConfig.forLoopVariableTypes) {
        // Get type hint for the main loop variable
        const itemVar = block.item;
        // Mark as processed to avoid duplicate hint in visitVariable
        processedVariables.add(itemVar);
        if (itemVar.keySpan && isInSpan(itemVar.keySpan.start.offset)) {
          const symbol = ttc.getSymbolOfNode(itemVar, typeCheckInfo.declaration);
          if (symbol && symbol.kind === SymbolKind.Variable) {
            const varSymbol = symbol as VariableSymbol;
            const typeStr = formatType(varSymbol.tsType);
            // Skip hint if type matches variable name (like TypeScript does)
            if (shouldShowVariableTypeHint(typeStr, itemVar.name)) {
              // Position after the variable name
              hints.push(
                createTypeHint(itemVar.keySpan.end.offset, varSymbol.tsType, typeStr, false, true),
              );
            }
          }
        }

        // Get type hints for context variables ($index, $count, etc.)
        // Only process context variables that have non-empty keySpans.
        // The parser creates implicit context variables with empty spans for all
        // allowed names ($index, $first, $last, $even, $odd, $count), but only
        // explicitly aliased ones (e.g., `let idx = $index`) have meaningful spans.
        for (const contextVar of block.contextVariables) {
          // Mark as processed to avoid duplicate hint in visitVariable
          processedVariables.add(contextVar);

          // Skip implicit context variables with empty spans (start === end)
          if (
            !contextVar.keySpan ||
            contextVar.keySpan.start.offset === contextVar.keySpan.end.offset
          ) {
            continue;
          }

          if (isInSpan(contextVar.keySpan.start.offset)) {
            const symbol = ttc.getSymbolOfNode(contextVar, typeCheckInfo.declaration);
            if (symbol && symbol.kind === SymbolKind.Variable) {
              const varSymbol = symbol as VariableSymbol;
              const typeStr = formatType(varSymbol.tsType);
              // Skip hint if type matches variable name (like TypeScript does)
              if (shouldShowVariableTypeHint(typeStr, contextVar.name)) {
                hints.push(
                  createTypeHint(
                    contextVar.keySpan.end.offset,
                    varSymbol.tsType,
                    typeStr,
                    false,
                    true,
                  ),
                );
              }
            }
          }
        }
      }

      // Continue visiting children
      super.visitForLoopBlock(block);
    }

    override visitIfBlockBranch(branch: TmplAstIfBlockBranch): void {
      // Always mark @if alias as processed to prevent visitVariable from showing duplicate hints
      if (branch.expressionAlias) {
        processedVariables.add(branch.expressionAlias);
      }

      const ifAliasConfig = normalizeIfAliasConfig(mergedConfig.ifAliasTypes);
      if (ifAliasConfig.enabled && branch.expressionAlias) {
        // Get type for @if alias: @if (condition; as result)
        const aliasVar = branch.expressionAlias;

        // Check if this expression should show a hint based on config
        const isSimple = isSimpleIfExpression(branch.expression);
        const shouldShow = isSimple
          ? ifAliasConfig.simpleExpressions
          : ifAliasConfig.complexExpressions;

        if (shouldShow && aliasVar.keySpan && isInSpan(aliasVar.keySpan.start.offset)) {
          const symbol = ttc.getSymbolOfNode(aliasVar, typeCheckInfo.declaration);
          if (symbol && symbol.kind === SymbolKind.Variable) {
            const varSymbol = symbol as VariableSymbol;
            const typeStr = formatType(varSymbol.tsType);
            // Skip hint if type matches variable name (like TypeScript does)
            if (shouldShowVariableTypeHint(typeStr, aliasVar.name)) {
              hints.push(
                createTypeHint(aliasVar.keySpan.end.offset, varSymbol.tsType, typeStr, false, true),
              );
            }
          }
        }
      }

      super.visitIfBlockBranch(branch);
    }

    override visitBoundEvent(event: TmplAstBoundEvent): void {
      // Show event type hint after event name: (click: MouseEvent)
      const eventConfig = normalizeEventConfig(mergedConfig.eventParameterTypes);
      if (eventConfig.enabled && event.keySpan) {
        if (isInSpan(event.keySpan.start.offset)) {
          // Determine the event source to apply fine-grained config
          const symbol = ttc.getSymbolOfNode(event, typeCheckInfo.declaration);
          const isComponentEvent = symbol?.kind === SymbolKind.Output;
          const isAnimationEvent =
            event.type === ParsedEventType.LegacyAnimation ||
            event.type === ParsedEventType.Animation;
          const isNativeEvent = !isComponentEvent && !isAnimationEvent;

          // Check if this event type should show hints based on config
          const shouldShow =
            (isNativeEvent && eventConfig.nativeEvents) ||
            (isComponentEvent && eventConfig.componentEvents) ||
            (isAnimationEvent && eventConfig.animationEvents);

          if (shouldShow) {
            // Get the $event type from the template type checker
            const eventTypeResult = getEventType(event, typeCheckInfo, ttc, typeChecker);
            if (eventTypeResult) {
              // Use createTypeHint for interactive hints if we have the ts.Type
              if (eventTypeResult.tsType) {
                hints.push(
                  createTypeHint(
                    event.keySpan.end.offset,
                    eventTypeResult.tsType,
                    eventTypeResult.typeStr,
                  ),
                );
              } else {
                // Fallback for types without ts.Type (like AnimationCallbackEvent)
                hints.push({
                  position: event.keySpan.end.offset,
                  text: `: ${eventTypeResult.typeStr}`,
                  kind: 'Type',
                  paddingLeft: false,
                  paddingRight: false,
                });
              }
            }
          }
        }
      }

      // Show function argument parameter name hints for method calls in the handler
      if (mergedConfig.parameterNameHints !== 'none') {
        const visitor = new FunctionArgumentVisitor(
          typeCheckInfo,
          ttc,
          typeChecker,
          tcb,
          hints,
          isInSpan,
          formatType,
          mergedConfig,
          createTypeHint,
        );
        event.handler.visit(visitor);
      }
    }

    override visitVariable(variable: TmplAstVariable): void {
      // Skip variables that were already processed in visitForLoopBlock or visitIfBlockBranch
      // to avoid duplicate hints.
      if (processedVariables.has(variable)) {
        return;
      }

      // This handles template variables like `let-item` on ng-template
      // and structural directive variables like `*ngFor="let item of items"`
      if (
        mergedConfig.forLoopVariableTypes &&
        variable.keySpan &&
        isInSpan(variable.keySpan.start.offset)
      ) {
        const symbol = ttc.getSymbolOfNode(variable, typeCheckInfo.declaration);
        if (symbol && symbol.kind === SymbolKind.Variable) {
          const varSymbol = symbol as VariableSymbol;
          const typeStr = formatType(varSymbol.tsType);
          // Skip hint if type matches variable name (like TypeScript does)
          if (shouldShowVariableTypeHint(typeStr, variable.name)) {
            hints.push(
              createTypeHint(variable.keySpan.end.offset, varSymbol.tsType, typeStr, false, true),
            );
          }
        }
      }
    }

    override visitLetDeclaration(decl: TmplAstLetDeclaration): void {
      // Handle @let declarations: @let result = expression
      if (
        mergedConfig.letDeclarationTypes &&
        decl.nameSpan &&
        isInSpan(decl.nameSpan.start.offset)
      ) {
        const symbol = ttc.getSymbolOfNode(decl, typeCheckInfo.declaration);
        if (symbol && symbol.kind === SymbolKind.LetDeclaration) {
          const letSymbol = symbol as LetDeclarationSymbol;
          const typeStr = formatType(letSymbol.tsType);
          // Skip hint if type matches variable name (like TypeScript does)
          if (shouldShowVariableTypeHint(typeStr, decl.name)) {
            hints.push(
              createTypeHint(decl.nameSpan.end.offset, letSymbol.tsType, typeStr, false, true),
            );
          }
        }
      }
    }

    override visitReference(reference: TmplAstReference): void {
      // Handle template reference variables: #ref, #myInput="matInput"
      if (
        mergedConfig.referenceVariableTypes &&
        reference.keySpan &&
        isInSpan(reference.keySpan.start.offset)
      ) {
        const symbol = ttc.getSymbolOfNode(reference, typeCheckInfo.declaration);
        if (symbol && symbol.kind === SymbolKind.Reference) {
          const refSymbol = symbol as ReferenceSymbol;
          const typeStr = formatType(refSymbol.tsType);
          // Skip hint if type matches variable name (like TypeScript does)
          if (shouldShowVariableTypeHint(typeStr, reference.name)) {
            hints.push(
              createTypeHint(reference.keySpan.end.offset, refSymbol.tsType, typeStr, false, true),
            );
          }
        }
      }
    }

    override visitBoundText(text: TmplAstBoundText): void {
      // Handle interpolations: {{ value | pipe }}
      if (mergedConfig.pipeOutputTypes) {
        const pipeVisitor = new PipeExpressionVisitor(
          ttc,
          typeChecker,
          typeCheckInfo.declaration,
          tcb,
          hints,
          isInSpan,
          formatType,
          mergedConfig,
          createTypeHint,
        );
        text.value.visit(pipeVisitor);
      }

      // Show function argument parameter name hints for method calls in interpolations
      if (mergedConfig.parameterNameHints !== 'none') {
        const argVisitor = new FunctionArgumentVisitor(
          typeCheckInfo,
          ttc,
          typeChecker,
          tcb,
          hints,
          isInSpan,
          formatType,
          mergedConfig,
          createTypeHint,
        );
        text.value.visit(argVisitor);
      }
    }

    override visitBoundAttribute(attribute: TmplAstBoundAttribute): void {
      // Handle property bindings: [prop]="value | pipe"
      if (mergedConfig.pipeOutputTypes) {
        const pipeVisitor = new PipeExpressionVisitor(
          ttc,
          typeChecker,
          typeCheckInfo.declaration,
          tcb,
          hints,
          isInSpan,
          formatType,
          mergedConfig,
          createTypeHint,
        );
        attribute.value.visit(pipeVisitor);
      }

      // Handle input binding type hints: [input: Type]="value" or [(model): WritableSignal<Type>]="signal"
      // Works with @Input(), input(), input.required(), and model() bindings
      const propertyConfig = normalizePropertyConfig(mergedConfig.propertyBindingTypes);
      if (propertyConfig.enabled && attribute.keySpan) {
        if (isInSpan(attribute.keySpan.start.offset)) {
          const symbol = ttc.getSymbolOfNode(attribute, typeCheckInfo.declaration);
          if (symbol && symbol.kind === SymbolKind.Input) {
            // Component/directive input - check if we should show it
            if (propertyConfig.componentInputs) {
              const inputSymbol = symbol as InputBindingSymbol;
              // Get the first binding's type (usually there's only one)
              if (inputSymbol.bindings.length > 0) {
                const binding = inputSymbol.bindings[0];
                // Unwrap InputSignal<T>, InputSignalWithTransform<T, _>, or ModelSignal<T>
                const unwrappedType = unwrapAngularType(binding.tsType, typeChecker);
                const typeStr = formatType(unwrappedType);

                // Check if this is a required input (for visual indicator)
                const isRequired = isRequiredInput(binding.tsSymbol, typeChecker);
                const requiredSuffix = getRequiredIndicator(
                  isRequired,
                  mergedConfig.requiredInputIndicator,
                );

                // For two-way bindings [(model)], optionally show that it expects WritableSignal<T>
                if (
                  attribute.type === BindingType.TwoWay &&
                  mergedConfig.twoWayBindingSignalTypes
                ) {
                  // For two-way bindings, show WritableSignal<T>
                  hints.push(
                    createTypeHintWithSuffix(
                      attribute.keySpan.end.offset,
                      unwrappedType,
                      `WritableSignal<${typeStr}>`,
                      requiredSuffix,
                    ),
                  );
                } else {
                  hints.push(
                    createTypeHintWithSuffix(
                      attribute.keySpan.end.offset,
                      unwrappedType,
                      typeStr,
                      requiredSuffix,
                    ),
                  );
                }
              }
            }
          } else if (symbol && symbol.kind === SymbolKind.DomBinding) {
            // DOM property binding - check if we should show it
            if (propertyConfig.nativeProperties) {
              const domSymbol = symbol as DomBindingSymbol;
              const propTypeResult = getDomPropertyType(attribute.name, domSymbol, typeChecker);
              if (propTypeResult) {
                hints.push(
                  createTypeHint(
                    attribute.keySpan.end.offset,
                    propTypeResult.tsType,
                    propTypeResult.typeStr,
                  ),
                );
              }
            }
          }
        }
      }

      // Show function argument parameter name hints for method calls in bindings
      if (mergedConfig.parameterNameHints !== 'none') {
        const argVisitor = new FunctionArgumentVisitor(
          typeCheckInfo,
          ttc,
          typeChecker,
          tcb,
          hints,
          isInSpan,
          formatType,
          mergedConfig,
          createTypeHint,
        );
        attribute.value.visit(argVisitor);
      }

      super.visitBoundAttribute(attribute);
    }

    override visitTextAttribute(attribute: TmplAstTextAttribute): void {
      // Handle text attribute input bindings: input="stringValue"
      // These are inputs bound with plain string literals (no brackets)
      const propertyConfig = normalizePropertyConfig(mergedConfig.propertyBindingTypes);
      if (propertyConfig.enabled && propertyConfig.componentInputs && attribute.keySpan) {
        if (isInSpan(attribute.keySpan.start.offset)) {
          const symbol = ttc.getSymbolOfNode(attribute, typeCheckInfo.declaration);
          if (symbol && symbol.kind === SymbolKind.Input) {
            const inputSymbol = symbol as InputBindingSymbol;
            // Get the first binding's type (usually there's only one)
            if (inputSymbol.bindings.length > 0) {
              const binding = inputSymbol.bindings[0];
              // Unwrap InputSignal<T>, InputSignalWithTransform<T, _>, or ModelSignal<T>
              const unwrappedType = unwrapAngularType(binding.tsType, typeChecker);
              const typeStr = formatType(unwrappedType);

              // Check if this is a required input (for visual indicator)
              const isRequired = isRequiredInput(binding.tsSymbol, typeChecker);
              const requiredSuffix = getRequiredIndicator(
                isRequired,
                mergedConfig.requiredInputIndicator,
              );

              hints.push(
                createTypeHintWithSuffix(
                  attribute.keySpan.end.offset,
                  unwrappedType,
                  typeStr,
                  requiredSuffix,
                ),
              );
            }
          }
        }
      }

      super.visitTextAttribute(attribute);
    }

    override visitSwitchBlock(block: TmplAstSwitchBlock): void {
      // Handle @switch expression type hints: @switch (status: Status) { ... }
      if (mergedConfig.switchExpressionTypes && block.expression) {
        // Get the expression's source span for positioning
        const expr = block.expression;
        const sourceSpan = expr instanceof ASTWithSource ? expr.sourceSpan : expr.span;

        if (sourceSpan && isInSpan(sourceSpan.start)) {
          // Get the type of the expression from the template type checker
          const symbol = ttc.getSymbolOfNode(expr, typeCheckInfo.declaration);
          if (symbol && symbol.kind === SymbolKind.Expression) {
            const exprSymbol =
              symbol as import('@angular/compiler-cli/src/ngtsc/typecheck/api/symbols').ExpressionSymbol;
            const typeStr = formatType(exprSymbol.tsType);
            hints.push(createTypeHint(sourceSpan.end, exprSymbol.tsType, typeStr));
          }
        }
      }

      super.visitSwitchBlock(block);
    }

    override visitDeferredBlock(block: TmplAstDeferredBlock): void {
      // Handle @defer trigger expression type hints: @defer (when isVisible: boolean) { ... }
      if (mergedConfig.deferTriggerTypes) {
        // Process 'when' trigger if it exists
        const whenTrigger = block.triggers.when;
        if (whenTrigger && whenTrigger instanceof TmplAstBoundDeferredTrigger) {
          const expr = whenTrigger.value;
          const sourceSpan = expr instanceof ASTWithSource ? expr.sourceSpan : expr.span;

          if (sourceSpan && isInSpan(sourceSpan.start)) {
            const symbol = ttc.getSymbolOfNode(expr, typeCheckInfo.declaration);
            if (symbol && symbol.kind === SymbolKind.Expression) {
              const exprSymbol =
                symbol as import('@angular/compiler-cli/src/ngtsc/typecheck/api/symbols').ExpressionSymbol;
              const typeStr = formatType(exprSymbol.tsType);
              hints.push(createTypeHint(sourceSpan.end, exprSymbol.tsType, typeStr));
            }
          }
        }

        // Also check prefetch triggers (prefetch on ...)
        const prefetchWhen = block.prefetchTriggers.when;
        if (prefetchWhen && prefetchWhen instanceof TmplAstBoundDeferredTrigger) {
          const expr = prefetchWhen.value;
          const sourceSpan = expr instanceof ASTWithSource ? expr.sourceSpan : expr.span;

          if (sourceSpan && isInSpan(sourceSpan.start)) {
            const symbol = ttc.getSymbolOfNode(expr, typeCheckInfo.declaration);
            if (symbol && symbol.kind === SymbolKind.Expression) {
              const exprSymbol =
                symbol as import('@angular/compiler-cli/src/ngtsc/typecheck/api/symbols').ExpressionSymbol;
              const typeStr = formatType(exprSymbol.tsType);
              hints.push(createTypeHint(sourceSpan.end, exprSymbol.tsType, typeStr));
            }
          }
        }

        // Also check hydrate triggers (hydrate when ...)
        const hydrateWhen = block.hydrateTriggers.when;
        if (hydrateWhen && hydrateWhen instanceof TmplAstBoundDeferredTrigger) {
          const expr = hydrateWhen.value;
          const sourceSpan = expr instanceof ASTWithSource ? expr.sourceSpan : expr.span;

          if (sourceSpan && isInSpan(sourceSpan.start)) {
            const symbol = ttc.getSymbolOfNode(expr, typeCheckInfo.declaration);
            if (symbol && symbol.kind === SymbolKind.Expression) {
              const exprSymbol =
                symbol as import('@angular/compiler-cli/src/ngtsc/typecheck/api/symbols').ExpressionSymbol;
              const typeStr = formatType(exprSymbol.tsType);
              hints.push(createTypeHint(sourceSpan.end, exprSymbol.tsType, typeStr));
            }
          }
        }
      }

      super.visitDeferredBlock(block);
    }
  }
  // Type for the createTypeHint helper function
  type CreateTypeHintFn = (
    position: number,
    type: ts.Type,
    typeStr: string,
    paddingLeft?: boolean,
    paddingRight?: boolean,
  ) => AngularInlayHint;

  // Visitor for pipe expressions in interpolations and bindings
  class PipeExpressionVisitor extends RecursiveAstVisitor {
    constructor(
      private readonly ttc: ReturnType<typeof compiler.getTemplateTypeChecker>,
      private readonly typeChecker: ts.TypeChecker,
      private readonly component: ts.ClassDeclaration,
      private readonly tcb: ts.Node | null,
      private readonly hints: AngularInlayHint[],
      private readonly isInSpan: (pos: number) => boolean,
      private readonly formatType: (type: ts.Type) => string,
      private readonly config: InlayHintsConfig,
      private readonly createTypeHintFn: CreateTypeHintFn,
    ) {
      super();
    }

    /**
     * Get the resolved return type of a pipe call from the TCB.
     * This uses TypeScript's actual overload resolution, which handles:
     * - Overloaded method signatures (like DatePipe)
     * - Generic type inference
     * - Complex type relationships
     */
    private getResolvedPipeReturnType(ast: BindingPipe): ts.Type | null {
      if (!this.tcb) return null;

      // Find the call expression in the TCB using the pipe's source span
      // The TCB has: _pipe.transform(value, arg1, arg2, ...)
      const callExpr = findFirstMatchingNode(this.tcb, {
        withSpan: ast.sourceSpan,
        filter: ts.isCallExpression,
      });

      if (callExpr) {
        // getTypeAtLocation on a call expression returns the resolved return type
        // This automatically handles overload resolution and generics!
        return this.typeChecker.getTypeAtLocation(callExpr);
      }

      return null;
    }

    override visitPipe(ast: BindingPipe, context: any): any {
      // Pipe hints: {{ value | date : 'short' : 'pl' }}
      // Goal: Show parameter names before pipe args and return type after the last argument
      // Like function calls: {{ value | date(format: 'short', locale: 'pl'): string | null }}
      if (ast.nameSpan && this.isInSpan(ast.nameSpan.start)) {
        const symbol = this.ttc.getSymbolOfNode(ast, this.component);
        if (symbol && symbol.kind === SymbolKind.Pipe) {
          const pipeSymbol = symbol as PipeSymbol;

          // Get the transform method's signature from the pipe class
          const transformMethod = pipeSymbol.classSymbol.tsType.getProperty('transform');
          if (transformMethod) {
            const transformType = this.typeChecker.getTypeOfSymbolAtLocation(
              transformMethod,
              transformMethod.valueDeclaration!,
            );
            const signatures = this.typeChecker.getSignaturesOfType(
              transformType,
              ts.SignatureKind.Call,
            );

            if (signatures.length > 0) {
              // For parameter name hints, we need to find a signature that matches the argument count
              // We use the first signature that has enough parameters
              const targetParamCount = ast.args.length + 1; // +1 for the piped value
              let signatureForParams = signatures[0];
              for (const sig of signatures) {
                const params = sig.getParameters();
                if (params.length >= targetParamCount) {
                  signatureForParams = sig;
                  break;
                }
              }

              const parameters = signatureForParams.getParameters();

              // Add parameter name hints for pipe arguments
              // Parameters[0] is typically "value" (the piped input), so pipe args start at index 1
              if (this.config.parameterNameHints !== 'none') {
                for (let i = 0; i < ast.args.length; i++) {
                  const arg = ast.args[i];
                  const param = parameters[i + 1]; // +1 because first param is the piped value
                  if (!param) continue;

                  const paramName = param.getName();

                  // Get the argument's source span
                  const argSpan = arg.sourceSpan;
                  if (!argSpan || !this.isInSpan(argSpan.start)) continue;

                  // Create interactive hint if enabled
                  if (this.config.interactiveInlayHints && param.valueDeclaration) {
                    const paramDecl = param.valueDeclaration;
                    const sourceFile = paramDecl.getSourceFile();
                    this.hints.push({
                      position: argSpan.start,
                      text: '',
                      kind: 'Parameter',
                      paddingLeft: false,
                      paddingRight: true,
                      displayParts: [
                        {
                          text: paramName,
                          span: {
                            start: paramDecl.getStart(),
                            length: paramDecl.getWidth(),
                          },
                          file: sourceFile.fileName,
                        },
                        {text: ':'},
                      ],
                    });
                  } else {
                    this.hints.push({
                      position: argSpan.start,
                      text: `${paramName}:`,
                      kind: 'Parameter',
                      paddingLeft: false,
                      paddingRight: true,
                    });
                  }
                }
              }

              // Get the return type using TypeScript's resolved type from the TCB call expression
              // This automatically handles overload resolution and generics!
              let returnType: ts.Type | null = this.getResolvedPipeReturnType(ast);

              // Fallback: if we couldn't get the resolved type from TCB,
              // use the first matching signature's return type
              if (!returnType) {
                returnType = signatureForParams.getReturnType();
              }

              const returnTypeStr = this.formatType(returnType);

              // Position hint after the last pipe argument, or after pipe name if no args
              let hintPosition: number;
              if (ast.args.length > 0) {
                const lastArg = ast.args[ast.args.length - 1];
                hintPosition = lastArg.sourceSpan.end;
              } else {
                hintPosition = ast.nameSpan.end;
              }

              this.hints.push(
                this.createTypeHintFn(hintPosition, returnType, returnTypeStr, false, true),
              );
            }
          } else {
            // Fallback: try to get return type from the TCB directly
            const resolvedType = this.getResolvedPipeReturnType(ast);
            if (resolvedType) {
              const returnTypeStr = this.formatType(resolvedType);
              this.hints.push(
                this.createTypeHintFn(ast.nameSpan.end, resolvedType, returnTypeStr, false, true),
              );
            } else {
              // Last resort fallback: use pipeSymbol.tsType's call signatures
              const tsType = pipeSymbol.tsType;
              const callSignatures = tsType.getCallSignatures();
              if (callSignatures.length > 0) {
                const returnType = callSignatures[0].getReturnType();
                const returnTypeStr = this.formatType(returnType);
                this.hints.push(
                  this.createTypeHintFn(ast.nameSpan.end, returnType, returnTypeStr, false, true),
                );
              }
            }
          }
        }
      }
      return super.visitPipe(ast, context);
    }
  }

  /**
   * Visitor for function/method call arguments to show parameter name hints.
   * This follows TypeScript's inlay hints implementation for parameter names.
   *
   * Example: handleClick($event) -> handleClick(event: $event)
   * where 'event' is the parameter name from the method signature.
   */
  class FunctionArgumentVisitor extends RecursiveAstVisitor {
    constructor(
      private readonly typeCheckInfo: TypeCheckInfo,
      private readonly ttc: ReturnType<typeof compiler.getTemplateTypeChecker>,
      private readonly typeChecker: ts.TypeChecker,
      private readonly tcb: ts.Node | null,
      private readonly hints: AngularInlayHint[],
      private readonly isInSpan: (pos: number) => boolean,
      private readonly formatType: (type: ts.Type) => string,
      private readonly config: InlayHintsConfig,
      private readonly createTypeHintFn?: CreateTypeHintFn,
    ) {
      super();
    }

    /**
     * Get the resolved signature for a function call from the TCB.
     * This uses TypeScript's actual overload resolution.
     */
    private getResolvedSignature(sourceSpan: {
      start: number;
      end: number;
    }): ts.Signature | undefined {
      if (!this.tcb) return undefined;

      // Find the call expression in the TCB
      const callExpr = findFirstMatchingNode(this.tcb, {
        withSpan: sourceSpan,
        filter: ts.isCallExpression,
      });

      if (callExpr) {
        // getResolvedSignature returns the actual resolved overload
        return this.typeChecker.getResolvedSignature(callExpr);
      }

      return undefined;
    }

    override visitCall(ast: Call, context: any): any {
      this.processCallArguments(ast.receiver, ast.args, ast.sourceSpan);
      return super.visitCall(ast, context);
    }

    override visitSafeCall(ast: SafeCall, context: any): any {
      this.processCallArguments(ast.receiver, ast.args, ast.sourceSpan);
      return super.visitSafeCall(ast, context);
    }

    private processCallArguments(
      receiver: AST,
      args: AST[],
      sourceSpan: {start: number; end: number},
    ): void {
      if (args.length === 0) return;

      // Try to get the resolved signature from the TCB first
      // This handles overloads and generics correctly
      let signature = this.getResolvedSignature(sourceSpan);

      // Fallback to the first signature from the receiver type
      if (!signature) {
        const receiverSymbol = this.ttc.getSymbolOfNode(receiver, this.typeCheckInfo.declaration);
        if (!receiverSymbol || receiverSymbol.kind !== SymbolKind.Expression) return;

        const exprSymbol = receiverSymbol as ExpressionSymbol;
        const receiverType = exprSymbol.tsType;

        // Get call signatures from the receiver type
        const signatures = this.typeChecker.getSignaturesOfType(
          receiverType,
          ts.SignatureKind.Call,
        );
        if (signatures.length === 0) return;

        signature = signatures[0];
      }

      const parameters = signature.getParameters();

      // Check if the last parameter is a rest parameter
      let lastParamIsRest = false;
      if (parameters.length > 0) {
        const lastParam = parameters[parameters.length - 1];
        const lastParamDecl = lastParam.valueDeclaration;
        if (lastParamDecl && ts.isParameter(lastParamDecl) && lastParamDecl.dotDotDotToken) {
          lastParamIsRest = true;
        }
      }

      // Track current parameter position (may skip ahead for tuple spreads)
      let signatureParamPos = 0;

      // Add parameter name hints for each argument
      for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        // Handle spread elements - TypeScript provides hints for tuple spreads
        if (arg instanceof SpreadElement) {
          // Get the type of the spread expression
          const spreadSymbol = this.ttc.getSymbolOfNode(
            arg.expression,
            this.typeCheckInfo.declaration,
          );
          if (spreadSymbol && spreadSymbol.kind === SymbolKind.Expression) {
            const spreadType = (spreadSymbol as ExpressionSymbol).tsType;
            // Check if it's a tuple type
            if (this.typeChecker.isTupleType(spreadType)) {
              // Get the tuple's fixed length (number of required elements)
              const tupleTypeRef = spreadType as ts.TypeReference;
              const target = tupleTypeRef.target;
              if (target && 'fixedLength' in target) {
                const fixedLength = (target as any).fixedLength as number;
                if (fixedLength > 0) {
                  // Advance the parameter position by the tuple's fixed length
                  signatureParamPos += fixedLength;
                }
              }
            }
          }
          // Skip showing hint for the spread itself (no visual hint on ...arr)
          continue;
        }

        // Handle rest parameters: if signatureParamPos >= params.length - 1 and last param is rest, use last param
        let param: ts.Symbol | undefined;
        let isFirstRestArg = false;
        if (signatureParamPos < parameters.length - 1 || !lastParamIsRest) {
          // Regular parameter or no rest param
          param = parameters[signatureParamPos];
        } else if (lastParamIsRest) {
          // This argument maps to the rest parameter
          param = parameters[parameters.length - 1];
          // Mark as first rest arg only when this is the first argument mapping to rest
          isFirstRestArg = signatureParamPos === parameters.length - 1;
        }

        // Advance to next parameter
        signatureParamPos++;

        if (!param) continue;

        const paramName = param.getName();

        // Skip if argument name matches parameter name (like TypeScript does)
        // unless parameterNameHintsWhenArgumentMatchesName is true
        if (
          !this.config.parameterNameHintsWhenArgumentMatchesName &&
          this.argumentMatchesParameterName(arg, paramName)
        ) {
          continue;
        }

        // In 'literals' mode, only show hints for literal arguments
        if (this.config.parameterNameHints === 'literals' && !this.isHintableLiteral(arg)) {
          continue;
        }

        // Get the argument's source span
        const argSpan = arg.sourceSpan;
        if (!argSpan || !this.isInSpan(argSpan.start)) continue;

        // Add "..." prefix for the first rest argument only (like TypeScript does)
        const prefix = isFirstRestArg ? '...' : '';

        // Create interactive hint if enabled
        if (this.config.interactiveInlayHints && param.valueDeclaration) {
          const paramDecl = param.valueDeclaration;
          const sourceFile = paramDecl.getSourceFile();
          this.hints.push({
            position: argSpan.start,
            text: '', // Empty for interactive hints
            kind: 'Parameter',
            paddingLeft: false,
            paddingRight: true,
            displayParts: [
              {
                text: `${prefix}${paramName}`,
                span: {
                  start: paramDecl.getStart(),
                  length: paramDecl.getWidth(),
                },
                file: sourceFile.fileName,
              },
              {text: ':'},
            ],
          });
        } else {
          this.hints.push({
            position: argSpan.start,
            text: `${prefix}${paramName}:`,
            kind: 'Parameter',
            paddingLeft: false,
            paddingRight: true,
          });
        }
      }
    }

    /**
     * Check if the argument expression matches the parameter name.
     * TypeScript skips parameter hints when the argument already conveys the parameter name.
     * e.g., handleClick(event) where param is 'event' -> skip hint
     */
    private argumentMatchesParameterName(arg: AST, paramName: string): boolean {
      if (arg instanceof PropertyRead) {
        return arg.name === paramName;
      }
      return false;
    }

    /**
     * Check if an argument is a "hintable literal" - used for 'literals' mode.
     * TypeScript only shows parameter name hints for literal values in this mode.
     * Includes: string/number/boolean literals, null, undefined, NaN, Infinity,
     *           template literals, arrays, objects
     *
     * Aligned with TypeScript's isHintableLiteral function.
     */
    private isHintableLiteral(arg: AST): boolean {
      // LiteralPrimitive covers strings, numbers, booleans, null
      if (arg instanceof LiteralPrimitive) {
        return true;
      }
      // LiteralArray covers array literals like [1, 2, 3]
      if (arg instanceof LiteralArray) {
        return true;
      }
      // LiteralMap covers object literals like { key: value }
      if (arg instanceof LiteralMap) {
        return true;
      }
      // Template literals like `hello ${name}` or `plain string`
      if (arg instanceof TemplateLiteral) {
        return true;
      }
      // Unary operations on literals (e.g., -1, +2, -Infinity)
      if (arg instanceof Unary) {
        if (arg.expr instanceof LiteralPrimitive) {
          return true;
        }
        // -Infinity, +NaN etc.
        if (arg.expr instanceof PropertyRead && this.isSpecialNumericIdentifier(arg.expr.name)) {
          return true;
        }
      }
      // Special identifiers: undefined, NaN, Infinity (from implicit receiver)
      if (arg instanceof PropertyRead && arg.receiver instanceof ImplicitReceiver) {
        if (this.isSpecialLiteralIdentifier(arg.name)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Check if an identifier name is a special literal-like value.
     * TypeScript treats undefined, NaN, and Infinity as literals for hint purposes.
     */
    private isSpecialLiteralIdentifier(name: string): boolean {
      return name === 'undefined' || name === 'NaN' || name === 'Infinity';
    }

    /**
     * Check if an identifier name is a special numeric value (NaN, Infinity).
     * Used for unary expressions like -Infinity.
     */
    private isSpecialNumericIdentifier(name: string): boolean {
      return name === 'NaN' || name === 'Infinity';
    }

    /**
     * Visit arrow functions in template expressions.
     * Provides:
     * 1. Parameter type hints - like TS includeInlayFunctionParameterTypeHints
     * 2. Return type hints - like TS includeInlayFunctionLikeReturnTypeHints
     *
     * Example: `(a, b) => a + b` becomes `(a: number, b: number): number => a + b`
     */
    override visitArrowFunction(ast: ArrowFunction, context: any): any {
      // Get the arrow function type from TCB
      if (!this.tcb) {
        return super.visitArrowFunction(ast, context);
      }

      // Find the arrow function expression in the TCB
      const arrowExpr = findFirstMatchingNode(this.tcb, {
        withSpan: ast.sourceSpan,
        filter: ts.isArrowFunction,
      });

      if (!arrowExpr) {
        return super.visitArrowFunction(ast, context);
      }

      const arrowType = this.typeChecker.getTypeAtLocation(arrowExpr);
      const callSignatures = arrowType.getCallSignatures();
      if (callSignatures.length === 0) {
        return super.visitArrowFunction(ast, context);
      }

      const signature = callSignatures[0];
      const parameters = signature.getParameters();

      // Parameter type hints
      if (this.config.arrowFunctionParameterTypes) {
        for (let i = 0; i < ast.parameters.length && i < parameters.length; i++) {
          const param = ast.parameters[i];
          const tsParam = parameters[i];

          // Get the parameter's source span
          if (!param.sourceSpan || !this.isInSpan(param.sourceSpan.start)) continue;

          // Get parameter type from TypeScript
          const paramType = this.typeChecker.getTypeOfSymbolAtLocation(tsParam, arrowExpr);
          const paramTypeStr = this.formatType(paramType);

          // Skip if type is 'any' or parameter name matches type
          if (paramTypeStr === 'any') continue;
          if (param.name.toLowerCase() === paramTypeStr.toLowerCase()) continue;

          // Position hint after the parameter name - use createTypeHint if available
          if (this.createTypeHintFn) {
            this.hints.push(this.createTypeHintFn(param.sourceSpan.end, paramType, paramTypeStr));
          } else {
            this.hints.push({
              position: param.sourceSpan.end,
              text: `: ${paramTypeStr}`,
              kind: 'Type',
              paddingLeft: false,
              paddingRight: false,
            });
          }
        }
      }

      // Return type hint
      if (this.config.arrowFunctionReturnTypes) {
        const returnType = signature.getReturnType();
        const returnTypeStr = this.formatType(returnType);

        // Skip if return type is 'any' or 'void'
        if (returnTypeStr !== 'any' && returnTypeStr !== 'void') {
          // Find the position just before the => operator
          // The arrow operator position is after all parameters
          const lastParam = ast.parameters[ast.parameters.length - 1];
          let hintPosition: number;

          if (lastParam) {
            // Position after the last parameter or closing paren
            hintPosition = lastParam.sourceSpan.end;
            // If there's a closing paren, place after that
            // We need to check if the source has parens
          } else {
            // No parameters - position at start of arrow function
            hintPosition = ast.sourceSpan.start;
          }

          // For now, we'll skip return type hints for arrow functions
          // as positioning is tricky and may overlap with parameter hints
          // TODO: Implement proper positioning for return type hints
        }
      }

      // Continue visiting the body
      return super.visitArrowFunction(ast, context);
    }
  }

  /**
   * Unwraps Angular wrapper types to get the underlying value type.
   * Handles: EventEmitter<T>, OutputEmitterRef<T>, Observable<T>, Subject<T>,
   *          InputSignal<T>, InputSignalWithTransform<T, _>, ModelSignal<T>
   *
   * @param type The type to unwrap
   * @param typeChecker TypeScript type checker
   * @returns The unwrapped type, or the original type if not a wrapper
   */
  function unwrapAngularType(type: ts.Type, typeChecker: ts.TypeChecker): ts.Type {
    const typeRef = type as ts.TypeReference;
    const typeArgs = typeRef.typeArguments;

    if (!typeArgs || typeArgs.length === 0) {
      return type;
    }

    // Get the type name to check what kind of wrapper this is
    const typeName = typeChecker.typeToString(type);

    // Output wrappers: EventEmitter<T>, OutputEmitterRef<T>, Observable<T>, Subject<T>
    // The first type argument is the event/value type
    if (
      typeName.startsWith('EventEmitter<') ||
      typeName.startsWith('OutputEmitterRef<') ||
      typeName.startsWith('Observable<') ||
      typeName.startsWith('Subject<')
    ) {
      return typeArgs[0];
    }

    // Input signal wrappers: InputSignal<T>, ModelSignal<T>
    // The first type argument is the value type
    if (typeName.startsWith('InputSignal<') || typeName.startsWith('ModelSignal<')) {
      return typeArgs[0];
    }

    // InputSignalWithTransform<T, TransformT> - first arg is the output type
    if (typeName.startsWith('InputSignalWithTransform<')) {
      return typeArgs[0];
    }

    return type;
  }

  /**
   * Check if an input is required (input.required() or @Input with required: true).
   *
   * For signal inputs, we check the type signature:
   * - Required: InputSignal<T> (no undefined in the type)
   * - Optional: InputSignal<T | undefined>
   *
   * For decorator inputs, we check @Input({required: true}).
   */
  function isRequiredInput(symbol: ts.Symbol | undefined, typeChecker: ts.TypeChecker): boolean {
    if (!symbol) return false;

    const declarations = symbol.getDeclarations();
    if (!declarations || declarations.length === 0) return false;

    const decl = declarations[0];
    if (!ts.isPropertyDeclaration(decl) && !ts.isPropertySignature(decl)) return false;

    // Get the type at the declaration
    const type = typeChecker.getTypeAtLocation(decl);
    const typeName = typeChecker.typeToString(type);

    // Check for signal-based inputs via type signature
    // Required inputs have InputSignal<T> where T doesn't include undefined
    // Optional inputs have InputSignal<T | undefined>
    if (typeName.includes('InputSignal<')) {
      // If the inner type includes undefined, it's optional
      if (typeName.includes('undefined')) {
        return false;
      }
      // Otherwise check if it's actually using input.required() via AST
      // This handles edge cases where the type might look required but isn't
      if (ts.isPropertyDeclaration(decl) && decl.initializer) {
        if (ts.isCallExpression(decl.initializer)) {
          const callExpr = decl.initializer;
          if (ts.isPropertyAccessExpression(callExpr.expression)) {
            const methodName = callExpr.expression.name.text;
            if (methodName === 'required') {
              return true;
            }
          }
        }
      }
      // Even without AST check, if type doesn't have undefined, treat as required
      return true;
    }

    // Check for decorator-based @Input({required: true})
    if (ts.isPropertyDeclaration(decl)) {
      const decorators = ts.getDecorators(decl);
      if (decorators) {
        for (const decorator of decorators) {
          if (ts.isCallExpression(decorator.expression)) {
            const decoratorExpr = decorator.expression.expression;
            // Handle both `Input` and `namespace.Input` patterns
            const decoratorName = ts.isIdentifier(decoratorExpr)
              ? decoratorExpr.text
              : ts.isPropertyAccessExpression(decoratorExpr)
                ? decoratorExpr.name.text
                : null;

            if (decoratorName === 'Input') {
              // Check if there's an options object with required: true
              const args = decorator.expression.arguments;
              if (args.length > 0) {
                const firstArg = args[0];
                if (ts.isObjectLiteralExpression(firstArg)) {
                  for (const prop of firstArg.properties) {
                    if (ts.isPropertyAssignment(prop)) {
                      const propName = ts.isIdentifier(prop.name)
                        ? prop.name.text
                        : ts.isStringLiteral(prop.name)
                          ? prop.name.text
                          : null;
                      if (
                        propName === 'required' &&
                        prop.initializer.kind === ts.SyntaxKind.TrueKeyword
                      ) {
                        return true;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Get the visual indicator suffix for required inputs.
   */
  function getRequiredIndicator(
    isRequired: boolean,
    indicator: 'none' | 'asterisk' | 'exclamation' | undefined,
  ): string {
    if (!isRequired || !indicator || indicator === 'none') {
      return '';
    }
    if (indicator === 'asterisk') {
      return '*';
    }
    if (indicator === 'exclamation') {
      return '!';
    }
    return '';
  }

  /**
   * Result type for getEventType - contains both the type string and optionally the ts.Type
   * for interactive hint support.
   */
  interface EventTypeResult {
    typeStr: string;
    tsType: ts.Type | null;
  }

  /**
   * Get the $event type for an event binding from TCB type inference.
   * Returns null if the type cannot be determined.
   *
   * Handles:
   * - @Output() EventEmitter<T>
   * - output() OutputEmitterRef<T>
   * - model() ModelSignal<T> - generates (nameChange) event
   * - DOM events (click, input, etc.)
   */
  function getEventType(
    event: TmplAstBoundEvent,
    typeCheckInfo: TypeCheckInfo,
    ttc: ReturnType<typeof compiler.getTemplateTypeChecker>,
    typeChecker: ts.TypeChecker,
  ): EventTypeResult | null {
    // Get the event's output binding type from the template type checker
    const symbol = ttc.getSymbolOfNode(event, typeCheckInfo.declaration);

    if (symbol && symbol.kind === SymbolKind.Output) {
      // Component/directive output event (@Output, output(), or model() change event)
      const outputSymbol = symbol as OutputBindingSymbol;
      if (outputSymbol.bindings.length > 0) {
        const bindingType = outputSymbol.bindings[0].tsType;
        // Unwrap the wrapper type (EventEmitter, OutputEmitterRef, ModelSignal, etc.)
        const unwrappedType = unwrapAngularType(bindingType, typeChecker);
        return {
          typeStr: typeChecker.typeToString(unwrappedType),
          tsType: unwrappedType,
        };
      }
    }

    // Animation events (check before DOM events)
    if (event.type === ParsedEventType.LegacyAnimation) {
      // Try to get AnimationEvent type from lib.dom
      const animationEventType = getGlobalDomType('AnimationEvent', typeChecker);
      return {
        typeStr: 'AnimationEvent',
        tsType: animationEventType,
      };
    }
    if (event.type === ParsedEventType.Animation) {
      // AnimationCallbackEvent is an Angular-specific type, no DOM equivalent
      return {
        typeStr: 'AnimationCallbackEvent',
        tsType: null,
      };
    }

    // For native DOM events, use the DOM_EVENT_TYPE_MAP for accurate event types
    // This ensures we show the correct event type like MouseEvent, KeyboardEvent, etc.
    // regardless of what the handler declares or what symbol type we get.
    // Check this for all non-Output events (including when symbol is null or DomBinding)
    if (!symbol || symbol.kind !== SymbolKind.Output) {
      // Extract base event name (handle keyboard modifiers like keydown.enter)
      const baseEventName = event.name.split('.')[0].toLowerCase();

      // Look up the event type in our map
      const mappedEventType = DOM_EVENT_TYPE_MAP[baseEventName];
      if (mappedEventType) {
        // Try to get the actual ts.Type for the DOM event type
        const domEventType = getGlobalDomType(mappedEventType, typeChecker);
        return {
          typeStr: mappedEventType,
          tsType: domEventType,
        };
      }

      // For unknown events, fall back to inferring from $event usage in the handler
      const eventTypeFromHandler = getEventTypeFromHandler(event, typeCheckInfo, ttc, typeChecker);
      if (eventTypeFromHandler) {
        return eventTypeFromHandler;
      }
    }

    return null;
  }

  /**
   * Try to get a global DOM type (like MouseEvent, KeyboardEvent) from the type checker.
   * Returns null if the type is not found in the global scope.
   */
  function getGlobalDomType(typeName: string, typeChecker: ts.TypeChecker): ts.Type | null {
    try {
      // Try to resolve the type from the global scope
      const symbol = typeChecker.resolveName(
        typeName,
        undefined,
        ts.SymbolFlags.Type,
        /* excludeGlobals */ false,
      );
      if (symbol) {
        const declarations = symbol.getDeclarations();
        if (declarations && declarations.length > 0) {
          return typeChecker.getDeclaredTypeOfSymbol(symbol);
        }
      }
    } catch {
      // Type not found in global scope
    }
    return null;
  }

  /**
   * Get the event type by finding the $event reference in the handler
   * and using its inferred type from the TCB.
   */
  function getEventTypeFromHandler(
    event: TmplAstBoundEvent,
    typeCheckInfo: TypeCheckInfo,
    ttc: ReturnType<typeof compiler.getTemplateTypeChecker>,
    typeChecker: ts.TypeChecker,
  ): EventTypeResult | null {
    let eventResult: EventTypeResult | null = null;

    class EventTypeVisitor extends RecursiveAstVisitor {
      override visitPropertyRead(ast: PropertyRead, context: any): any {
        if (ast.name === '$event' && !(ast.receiver instanceof PropertyRead)) {
          const symbol = ttc.getSymbolOfNode(ast, typeCheckInfo.declaration);
          if (symbol && symbol.kind === SymbolKind.Expression) {
            const exprSymbol = symbol as ExpressionSymbol;
            eventResult = {
              typeStr: typeChecker.typeToString(exprSymbol.tsType),
              tsType: exprSymbol.tsType,
            };
          }
        }
        return super.visitPropertyRead(ast, context);
      }
    }

    const visitor = new EventTypeVisitor();
    event.handler.visit(visitor);
    return eventResult;
  }

  // Visit the template (if it exists - directives without templates will skip this)
  if (template) {
    const visitor = new InlayHintVisitor();
    tmplAstVisitAll(visitor, template);
  }

  // Also process host element bindings (from component/directive host property and @HostBinding/@HostListener)
  // NOTE: Host bindings have keySpan positions in the TypeScript file (not template), so we use
  // a separate isInSpan check that accounts for the host binding positions being in TS source.
  // When the span parameter covers only part of the file (e.g., visible area), host binding
  // positions might be outside that range, but they should still be shown since they belong
  // to this component. We create a helper function that checks if we're requesting the whole file.
  const hostElement = ttc.getHostElement(typeCheckInfo.declaration);
  if (hostElement) {
    // For host bindings, check if the position is within the requested span.
    // Host binding keySpan positions are absolute TypeScript file positions.
    const isHostBindingInSpan = (pos: number): boolean => {
      // If pos < 0, it's a dummy span, skip it
      if (pos < 0) return false;
      // Always show host binding hints (they're conceptually part of the component)
      // The keySpan positions are in TypeScript source, but the span might only cover
      // part of the file. Since host bindings are always associated with the component,
      // we should show them regardless of whether they're in the visible range.
      return pos >= span.start && pos < span.start + span.length;
    };

    // Process host property bindings for property type hints
    // These come from @HostBinding('prop') or host: { '[prop]': 'expr' }
    const propertyConfig = normalizePropertyConfig(mergedConfig.propertyBindingTypes);
    if (propertyConfig.enabled && propertyConfig.nativeProperties) {
      for (const binding of hostElement.bindings) {
        // Only process bindings with valid keySpan (not dummy spans)
        if (binding.keySpan && binding.keySpan.start.offset >= 0) {
          if (isHostBindingInSpan(binding.keySpan.start.offset)) {
            const symbol = ttc.getSymbolOfNode(binding, typeCheckInfo.declaration);
            if (symbol && symbol.kind === SymbolKind.DomBinding) {
              const domSymbol = symbol as DomBindingSymbol;
              const propTypeResult = getDomPropertyType(binding.name, domSymbol, typeChecker);
              if (propTypeResult) {
                hints.push(
                  createTypeHint(
                    binding.keySpan.end.offset,
                    propTypeResult.tsType,
                    propTypeResult.typeStr,
                  ),
                );
              }
            }
          }
        }
      }
    }

    // Process host event listeners for event type hints and function argument hints
    const eventConfig = normalizeEventConfig(mergedConfig.eventParameterTypes);
    for (const listener of hostElement.listeners) {
      // Event type hint on the event name
      if (eventConfig.enabled && listener.keySpan) {
        if (isHostBindingInSpan(listener.keySpan.start.offset)) {
          // For host listeners, determine the event source
          const symbol = ttc.getSymbolOfNode(listener, typeCheckInfo.declaration);
          const isComponentEvent = symbol?.kind === SymbolKind.Output;
          const isAnimationEvent =
            listener.type === ParsedEventType.LegacyAnimation ||
            listener.type === ParsedEventType.Animation;
          const isNativeEvent = !isComponentEvent && !isAnimationEvent;

          const shouldShow =
            (isNativeEvent && eventConfig.nativeEvents) ||
            (isComponentEvent && eventConfig.componentEvents) ||
            (isAnimationEvent && eventConfig.animationEvents);

          if (shouldShow) {
            const eventTypeResult = getEventType(listener, typeCheckInfo, ttc, typeChecker);
            if (eventTypeResult) {
              // Use createTypeHint for interactive hints if we have the ts.Type
              if (eventTypeResult.tsType) {
                hints.push(
                  createTypeHint(
                    listener.keySpan.end.offset,
                    eventTypeResult.tsType,
                    eventTypeResult.typeStr,
                  ),
                );
              } else {
                // Fallback for types without ts.Type
                hints.push({
                  position: listener.keySpan.end.offset,
                  text: `: ${eventTypeResult.typeStr}`,
                  kind: 'Type',
                  paddingLeft: false,
                  paddingRight: false,
                });
              }
            }
          }
        }
      }

      // Function argument parameter name hints
      if (mergedConfig.parameterNameHints !== 'none') {
        const argVisitor = new FunctionArgumentVisitor(
          typeCheckInfo,
          ttc,
          typeChecker,
          tcb,
          hints,
          isHostBindingInSpan,
          formatType,
          mergedConfig,
          createTypeHint,
        );
        listener.handler.visit(argVisitor);
      }

      // @HostListener argument type hints
      // For @HostListener('click', ['$event.target', '$event.clientX']),
      // we show the inferred type for each expression argument
      if (mergedConfig.hostListenerArgumentTypes) {
        processHostListenerArgumentTypes(
          listener,
          ttc,
          typeChecker,
          tcb,
          typeCheckInfo,
          hints,
          isHostBindingInSpan,
          formatType,
          createTypeHint,
        );
      }
    }
  }

  return hints;
}

/**
 * Process @HostListener argument expressions and add type hints.
 *
 * For decorators like `@HostListener('click', ['$event.target', '$event.clientX'])`,
 * this shows the inferred type for each expression argument:
 * `['$event.target: EventTarget | null', '$event.clientX: number']`
 *
 * The handler is a Call node where:
 * - receiver is a PropertyRead of the method name
 * - args are the parsed expressions from the decorator arguments
 */
function processHostListenerArgumentTypes(
  listener: TmplAstBoundEvent,
  ttc: TemplateTypeChecker,
  typeChecker: ts.TypeChecker,
  tcb: ts.Node | null,
  typeCheckInfo: TypeCheckInfo,
  hints: AngularInlayHint[],
  isInSpan: (offset: number) => boolean,
  formatType: (type: ts.Type) => string,
  createTypeHintFn: (
    position: number,
    type: ts.Type,
    typeStr: string,
    paddingLeft?: boolean,
    paddingRight?: boolean,
  ) => AngularInlayHint,
): void {
  // The handler should be a Call node for @HostListener
  if (!(listener.handler instanceof Call)) {
    return;
  }

  const handlerCall = listener.handler as Call;

  // Skip if no arguments or if the handler doesn't have the expected structure
  if (handlerCall.args.length === 0) {
    return;
  }

  // Process each argument expression
  for (const arg of handlerCall.args) {
    // Skip simple identifiers that are just variable references (method parameters)
    // We only want to show hints for expressions like $event.target
    if (arg instanceof PropertyRead && arg.receiver instanceof ImplicitReceiver) {
      // This is a simple variable reference, might be $event itself
      // Only skip if it's NOT $event (which would have type information)
      if (arg.name !== '$event') {
        continue;
      }
    }

    // Get the source span for positioning the hint
    const argSpan = arg.sourceSpan;
    if (!argSpan || !isInSpan(argSpan.start)) {
      continue;
    }

    // Try to find the corresponding TCB node and get its type
    if (tcb) {
      const tcbNode = findFirstMatchingNode(tcb, {
        withSpan: argSpan,
        filter: (node): node is ts.Expression => ts.isExpression(node),
      });

      if (tcbNode) {
        const argType = typeChecker.getTypeAtLocation(tcbNode);
        const typeStr = formatType(argType);

        hints.push(createTypeHintFn(argSpan.end, argType, typeStr));
      }
    } else {
      // Fallback: try to get type from the template type checker
      const symbol = ttc.getSymbolOfNode(arg, typeCheckInfo.declaration);
      if (symbol && symbol.kind === SymbolKind.Expression) {
        const exprSymbol = symbol as ExpressionSymbol;
        const typeStr = formatType(exprSymbol.tsType);

        hints.push(createTypeHintFn(argSpan.end, exprSymbol.tsType, typeStr));
      }
    }
  }
}

/**
 * Get the type of a DOM property binding.
 *
 * For bindings like [value], [disabled], etc., looks up the property type
 * on the element's DOM interface using TypeScript's type checker.
 *
 * Note: Style bindings ([style.width], [style.width.px]), class bindings ([class.active]),
 * and attribute bindings ([attr.data-cy]) are NOT type-checked by Angular currently.
 * See: packages/compiler-cli/src/ngtsc/typecheck/src/ops/inputs.ts
 * "TODO: properly check class and style bindings."
 *
 * We intentionally don't show inlay hints for these bindings until Angular
 * implements proper type checking for them, as any hint would be misleading
 * (e.g., [style.width.px]="'2'" is valid at runtime).
 */
interface DomPropertyTypeResult {
  typeStr: string;
  tsType: ts.Type;
}

function getDomPropertyType(
  bindingName: string,
  domSymbol: DomBindingSymbol,
  typeChecker: ts.TypeChecker,
): DomPropertyTypeResult | null {
  // Skip style/class/attr bindings - Angular doesn't type-check these yet
  // See: packages/compiler-cli/src/ngtsc/typecheck/src/ops/inputs.ts
  // "TODO: properly check class and style bindings."
  if (
    bindingName.startsWith('style.') ||
    bindingName.startsWith('class.') ||
    bindingName.startsWith('attr.')
  ) {
    return null;
  }

  // For regular DOM properties, look up the type on the element
  if (domSymbol.host.kind === SymbolKind.Element) {
    const elementSymbol = domSymbol.host as ElementSymbol;
    const elementType = elementSymbol.tsType;

    // Get the property from the element type
    const property = elementType.getProperty(bindingName);
    if (property) {
      const propType = typeChecker.getTypeOfSymbol(property);
      return {
        typeStr: typeChecker.typeToString(propType),
        tsType: propType,
      };
    }
  }

  return null;
}
