/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as lsp from 'vscode-languageserver/node';
import {Session} from '../session';
import {lspRangeToTsPositions} from '../utils';
import {getWorkspaceConfiguration, flattenConfiguration} from '../config';
import {
  isNgLanguageService,
  AngularInlayHint,
  InlayHintsConfig,
} from '@angular/language-service/api';

/**
 * Map VS Code's TypeScript inlay hints configuration to TypeScript's UserPreferences.
 * This allows TypeScript's inlay hints to respect user settings.
 */
function mapTsInlayHintsConfig(
  vsCodeConfig: Record<string, unknown>,
): import('typescript').UserPreferences {
  // Check if inlay hints are globally disabled
  const editorEnabled = vsCodeConfig['editor.inlayHints.enabled'];
  if (editorEnabled === 'off' || editorEnabled === false) {
    // Return preferences that disable all hints
    return {
      includeInlayParameterNameHints: 'none',
      includeInlayFunctionParameterTypeHints: false,
      includeInlayVariableTypeHints: false,
      includeInlayPropertyDeclarationTypeHints: false,
      includeInlayFunctionLikeReturnTypeHints: false,
      includeInlayEnumMemberValueHints: false,
    };
  }

  // Build preferences object with configured values
  const paramNameEnabled = vsCodeConfig['typescript.inlayHints.parameterNames.enabled'];
  const paramNameSuppressMatch =
    vsCodeConfig['typescript.inlayHints.parameterNames.suppressWhenArgumentMatchesName'];
  const paramTypesEnabled = vsCodeConfig['typescript.inlayHints.parameterTypes.enabled'];
  const varTypesEnabled = vsCodeConfig['typescript.inlayHints.variableTypes.enabled'];
  const varTypesSuppressMatch =
    vsCodeConfig['typescript.inlayHints.variableTypes.suppressWhenTypeMatchesName'];
  const propDeclTypesEnabled =
    vsCodeConfig['typescript.inlayHints.propertyDeclarationTypes.enabled'];
  const returnTypesEnabled = vsCodeConfig['typescript.inlayHints.functionLikeReturnTypes.enabled'];
  const enumValuesEnabled = vsCodeConfig['typescript.inlayHints.enumMemberValues.enabled'];

  return {
    includeInlayParameterNameHints:
      paramNameEnabled === 'all'
        ? 'all'
        : paramNameEnabled === 'literals'
          ? 'literals'
          : paramNameEnabled === 'none'
            ? 'none'
            : undefined,
    includeInlayParameterNameHintsWhenArgumentMatchesName:
      paramNameSuppressMatch !== undefined ? !paramNameSuppressMatch : undefined,
    includeInlayFunctionParameterTypeHints:
      paramTypesEnabled !== undefined ? (paramTypesEnabled as boolean) : undefined,
    includeInlayVariableTypeHints:
      varTypesEnabled !== undefined ? (varTypesEnabled as boolean) : undefined,
    includeInlayVariableTypeHintsWhenTypeMatchesName:
      varTypesSuppressMatch !== undefined ? !varTypesSuppressMatch : undefined,
    includeInlayPropertyDeclarationTypeHints:
      propDeclTypesEnabled !== undefined ? (propDeclTypesEnabled as boolean) : undefined,
    includeInlayFunctionLikeReturnTypeHints:
      returnTypesEnabled !== undefined ? (returnTypesEnabled as boolean) : undefined,
    includeInlayEnumMemberValueHints:
      enumValuesEnabled !== undefined ? (enumValuesEnabled as boolean) : undefined,
  };
}

/**
 * Map VS Code's Angular inlay hints configuration to InlayHintsConfig.
 */
function mapAngularInlayHintsConfig(vsCodeConfig: Record<string, unknown>): InlayHintsConfig {
  const config: InlayHintsConfig = {};

  // Map angular.inlayHints.* settings
  if (vsCodeConfig['angular.inlayHints.forLoopVariableTypes'] !== undefined) {
    config.forLoopVariableTypes = vsCodeConfig[
      'angular.inlayHints.forLoopVariableTypes'
    ] as boolean;
  }
  if (vsCodeConfig['angular.inlayHints.ifAliasTypes'] !== undefined) {
    config.ifAliasTypes = vsCodeConfig['angular.inlayHints.ifAliasTypes'] as boolean | 'complex';
  }
  if (vsCodeConfig['angular.inlayHints.letDeclarationTypes'] !== undefined) {
    config.letDeclarationTypes = vsCodeConfig['angular.inlayHints.letDeclarationTypes'] as boolean;
  }
  if (vsCodeConfig['angular.inlayHints.referenceVariableTypes'] !== undefined) {
    config.referenceVariableTypes = vsCodeConfig[
      'angular.inlayHints.referenceVariableTypes'
    ] as boolean;
  }
  if (vsCodeConfig['angular.inlayHints.variableTypeHintsWhenTypeMatchesName'] !== undefined) {
    config.variableTypeHintsWhenTypeMatchesName = vsCodeConfig[
      'angular.inlayHints.variableTypeHintsWhenTypeMatchesName'
    ] as boolean;
  }
  if (vsCodeConfig['angular.inlayHints.arrowFunctionParameterTypes'] !== undefined) {
    config.arrowFunctionParameterTypes = vsCodeConfig[
      'angular.inlayHints.arrowFunctionParameterTypes'
    ] as boolean;
  }
  if (vsCodeConfig['angular.inlayHints.arrowFunctionReturnTypes'] !== undefined) {
    config.arrowFunctionReturnTypes = vsCodeConfig[
      'angular.inlayHints.arrowFunctionReturnTypes'
    ] as boolean;
  }
  if (vsCodeConfig['angular.inlayHints.parameterNameHints'] !== undefined) {
    config.parameterNameHints = vsCodeConfig['angular.inlayHints.parameterNameHints'] as
      | 'none'
      | 'literals'
      | 'all';
  }
  if (vsCodeConfig['angular.inlayHints.parameterNameHintsWhenArgumentMatchesName'] !== undefined) {
    config.parameterNameHintsWhenArgumentMatchesName = vsCodeConfig[
      'angular.inlayHints.parameterNameHintsWhenArgumentMatchesName'
    ] as boolean;
  }
  if (vsCodeConfig['angular.inlayHints.eventParameterTypes'] !== undefined) {
    config.eventParameterTypes = vsCodeConfig['angular.inlayHints.eventParameterTypes'] as boolean;
  }
  if (vsCodeConfig['angular.inlayHints.propertyBindingTypes'] !== undefined) {
    config.propertyBindingTypes = vsCodeConfig[
      'angular.inlayHints.propertyBindingTypes'
    ] as boolean;
  }
  if (vsCodeConfig['angular.inlayHints.pipeOutputTypes'] !== undefined) {
    config.pipeOutputTypes = vsCodeConfig['angular.inlayHints.pipeOutputTypes'] as boolean;
  }
  if (vsCodeConfig['angular.inlayHints.twoWayBindingSignalTypes'] !== undefined) {
    config.twoWayBindingSignalTypes = vsCodeConfig[
      'angular.inlayHints.twoWayBindingSignalTypes'
    ] as boolean;
  }
  if (vsCodeConfig['angular.inlayHints.requiredInputIndicator'] !== undefined) {
    config.requiredInputIndicator = vsCodeConfig['angular.inlayHints.requiredInputIndicator'] as
      | 'none'
      | 'asterisk'
      | 'exclamation';
  }
  if (vsCodeConfig['angular.inlayHints.interactiveInlayHints'] !== undefined) {
    config.interactiveInlayHints = vsCodeConfig[
      'angular.inlayHints.interactiveInlayHints'
    ] as boolean;
  }
  if (vsCodeConfig['angular.inlayHints.hostListenerArgumentTypes'] !== undefined) {
    config.hostListenerArgumentTypes = vsCodeConfig[
      'angular.inlayHints.hostListenerArgumentTypes'
    ] as boolean;
  }
  if (vsCodeConfig['angular.inlayHints.switchExpressionTypes'] !== undefined) {
    config.switchExpressionTypes = vsCodeConfig[
      'angular.inlayHints.switchExpressionTypes'
    ] as boolean;
  }
  if (vsCodeConfig['angular.inlayHints.deferTriggerTypes'] !== undefined) {
    config.deferTriggerTypes = vsCodeConfig['angular.inlayHints.deferTriggerTypes'] as boolean;
  }

  return config;
}

/**
 * Handle the textDocument/inlayHint request (LSP 3.17).
 *
 * This handler provides inlay hints for Angular templates, showing:
 * - Types of template variables (from *ngFor, @for, @if aliases)
 * - Event parameter types ($event)
 * - Pipe output types
 * - Signal types
 *
 * For TypeScript files with inline templates, we combine:
 * - TypeScript's built-in inlay hints for the TS code
 * - Angular-specific hints for template regions
 */
export async function onInlayHint(
  session: Session,
  params: lsp.InlayHintParams,
): Promise<lsp.InlayHint[] | null> {
  const lsInfo = session.getLSAndScriptInfo(params.textDocument);
  if (!lsInfo) {
    return null;
  }

  const {languageService, scriptInfo} = lsInfo;
  const hints: lsp.InlayHint[] = [];

  // Get the text span for the requested range
  const [startOffset, endOffset] = lspRangeToTsPositions(scriptInfo, params.range);
  const span = {start: startOffset, length: endOffset - startOffset};

  // Request workspace configuration from the client for both TypeScript and Angular inlay hints
  let tsPreferences: import('typescript').UserPreferences | undefined;
  let angularConfig: InlayHintsConfig = {};

  try {
    // Request configuration from the client using shared config infrastructure
    const configResult = await getWorkspaceConfiguration<Record<string, unknown>>(
      session.connection,
      [
        {section: 'typescript.inlayHints'},
        {section: 'angular.inlayHints'},
        {section: 'editor.inlayHints'},
      ],
    );

    if (configResult && configResult.length >= 2) {
      // Flatten each config section using the shared utility
      const flatConfig: Record<string, unknown> = {
        ...flattenConfiguration(configResult[0] ?? {}, 'typescript.inlayHints'),
        ...flattenConfiguration(configResult[1] ?? {}, 'angular.inlayHints'),
        ...flattenConfiguration(configResult[2] ?? {}, 'editor.inlayHints'),
      };

      tsPreferences = mapTsInlayHintsConfig(flatConfig);
      angularConfig = mapAngularInlayHintsConfig(flatConfig);
    }
  } catch {
    // If configuration request fails, use defaults
  }

  // 1. Get TypeScript's inlay hints (for TS code in .ts files)
  //    This includes parameter names, return types, variable types, etc.
  try {
    const tsHints = languageService.provideInlayHints(scriptInfo.fileName, span, tsPreferences);

    for (const tsHint of tsHints) {
      const position = scriptInfo.positionToLineOffset(tsHint.position);
      hints.push(convertTsInlayHint(tsHint, position));
    }
  } catch (e) {
    // TypeScript's provideInlayHints might fail for some edge cases
    // Silently ignore - TypeScript hints are optional
  }

  // 2. Get Angular-specific inlay hints for templates
  //    - @for item variable types: @for (user: User of users)
  //    - @if alias types: @if (data; as result: ApiResult)
  //    - $event parameter types: (click)="onClick($event: MouseEvent)"
  //    - Pipe output types: {{ value | async }}
  //    - @let declaration types
  if (isNgLanguageService(languageService)) {
    try {
      const angularHints = languageService.getAngularInlayHints(
        scriptInfo.fileName,
        span,
        angularConfig,
      );
      for (const angularHint of angularHints) {
        const position = scriptInfo.positionToLineOffset(angularHint.position);
        hints.push(convertAngularInlayHint(angularHint, position));
      }
    } catch (e) {
      // Silently ignore - Angular hints are optional
    }
  }

  return hints.length > 0 ? hints : null;
}

/**
 * Handle the inlayHint/resolve request.
 *
 * This is called when the user hovers over an inlay hint to get additional details.
 * For now, we just return the hint as-is since we don't have expensive data to defer.
 */
export function onInlayHintResolve(session: Session, hint: lsp.InlayHint): lsp.InlayHint {
  // Currently, all our hints are fully computed upfront.
  // In the future, we could defer tooltip computation here.
  return hint;
}

/**
 * Convert a TypeScript InlayHint to an LSP InlayHint.
 */
function convertTsInlayHint(
  tsHint: import('typescript').InlayHint,
  position: {line: number; offset: number},
): lsp.InlayHint {
  // Convert TypeScript's 1-based line/offset to LSP's 0-based line/character
  const lspPosition: lsp.Position = {
    line: position.line - 1,
    character: position.offset - 1,
  };

  // Map TypeScript InlayHintKind to LSP InlayHintKind
  const kind = mapInlayHintKind(tsHint.kind);

  // Build the label - can be string or InlayHintLabelPart[]
  let label: string | lsp.InlayHintLabelPart[];
  if (tsHint.displayParts && tsHint.displayParts.length > 0) {
    label = tsHint.displayParts.map((part) => {
      const labelPart: lsp.InlayHintLabelPart = {
        value: part.text,
      };
      // If the part has a location, add it for go-to-definition
      if (part.span && part.file) {
        labelPart.location = {
          uri: `file://${part.file}`,
          range: {
            start: {line: 0, character: part.span.start},
            end: {line: 0, character: part.span.start + part.span.length},
          },
        };
      }
      return labelPart;
    });
  } else {
    label = tsHint.text;
  }

  const hint: lsp.InlayHint = {
    position: lspPosition,
    label,
    kind,
    paddingLeft: tsHint.whitespaceBefore,
    paddingRight: tsHint.whitespaceAfter,
  };

  return hint;
}

/**
 * Convert an Angular InlayHint to an LSP InlayHint.
 */
function convertAngularInlayHint(
  angularHint: AngularInlayHint,
  position: {line: number; offset: number},
): lsp.InlayHint {
  // Convert to LSP's 0-based line/character
  const lspPosition: lsp.Position = {
    line: position.line - 1,
    character: position.offset - 1,
  };

  // Map Angular hint kind to LSP InlayHintKind
  const kind = angularHint.kind === 'Type' ? lsp.InlayHintKind.Type : lsp.InlayHintKind.Parameter;

  // Build the label - can be string or InlayHintLabelPart[] for interactive hints
  let label: string | lsp.InlayHintLabelPart[];
  if (angularHint.displayParts && angularHint.displayParts.length > 0) {
    // Interactive hints with navigation support
    label = angularHint.displayParts.map((part) => {
      const labelPart: lsp.InlayHintLabelPart = {
        value: part.text,
      };
      // If the part has a location, add it for go-to-definition on click
      if (part.span && part.file) {
        labelPart.location = {
          uri: `file://${part.file}`,
          range: {
            start: {line: 0, character: part.span.start},
            end: {line: 0, character: part.span.start + part.span.length},
          },
        };
      }
      return labelPart;
    });
  } else {
    // Non-interactive hints
    label = angularHint.text;
  }

  const hint: lsp.InlayHint = {
    position: lspPosition,
    label,
    kind,
    paddingLeft: angularHint.paddingLeft,
    paddingRight: angularHint.paddingRight,
  };

  if (angularHint.tooltip) {
    hint.tooltip = angularHint.tooltip;
  }

  return hint;
}

/**
 * Map TypeScript's InlayHintKind to LSP's InlayHintKind.
 */
function mapInlayHintKind(tsKind: string): lsp.InlayHintKind | undefined {
  switch (tsKind) {
    case 'Type':
      return lsp.InlayHintKind.Type;
    case 'Parameter':
      return lsp.InlayHintKind.Parameter;
    case 'Enum':
      // LSP doesn't have an Enum kind, treat as Type
      return lsp.InlayHintKind.Type;
    default:
      return undefined;
  }
}
