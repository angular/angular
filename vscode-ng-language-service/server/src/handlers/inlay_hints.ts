/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as lsp from 'vscode-languageserver/node';
import * as ts from 'typescript/lib/tsserverlibrary';
import {Session} from '../session';
import {lspRangeToTsPositions} from '../utils';
import {filePathToUri} from '../utils';
import {getWorkspaceConfigurationCached, flattenConfiguration} from '../config';
import {
  isNgLanguageService,
  AngularInlayHint,
  InlayHintsConfig,
} from '@angular/language-service/api';

function isEditorInlayHintsEnabled(vsCodeConfig: Record<string, unknown>): boolean {
  const editorEnabled = vsCodeConfig['editor.inlayHints.enabled'];
  return !(editorEnabled === 'off' || editorEnabled === false);
}

/**
 * Map VS Code's Angular inlay hints configuration to InlayHintsConfig.
 */
function mapAngularInlayHintsConfig(vsCodeConfig: Record<string, unknown>): InlayHintsConfig {
  const config: InlayHintsConfig = {};

  const getConfigValue = <T>(...keys: string[]): T | undefined => {
    for (const key of keys) {
      if (vsCodeConfig[key] !== undefined && vsCodeConfig[key] !== null) {
        return vsCodeConfig[key] as T;
      }
    }
    return undefined;
  };

  const forLoopVariableTypes = getConfigValue<boolean>(
    'angular.inlayHints.variableTypes.forLoopVariableTypes',
  );
  if (forLoopVariableTypes !== undefined) config.forLoopVariableTypes = forLoopVariableTypes;

  const ifAliasTypes = getConfigValue<boolean | 'complex'>(
    'angular.inlayHints.variableTypes.ifAliasTypes',
  );
  if (ifAliasTypes !== undefined) config.ifAliasTypes = ifAliasTypes;

  const letDeclarationTypes = getConfigValue<boolean>(
    'angular.inlayHints.variableTypes.letDeclarationTypes',
  );
  if (letDeclarationTypes !== undefined) config.letDeclarationTypes = letDeclarationTypes;

  const referenceVariableTypes = getConfigValue<boolean>(
    'angular.inlayHints.variableTypes.referenceVariableTypes',
  );
  if (referenceVariableTypes !== undefined) config.referenceVariableTypes = referenceVariableTypes;

  const suppressWhenTypeMatchesName = getConfigValue<boolean>(
    'angular.inlayHints.variableTypes.suppressWhenTypeMatchesName',
  );
  if (suppressWhenTypeMatchesName !== undefined) {
    config.variableTypeHintsWhenTypeMatchesName = !suppressWhenTypeMatchesName;
  }

  const arrowFunctionParameterTypes = getConfigValue<boolean>(
    'angular.inlayHints.functionTypes.arrowFunctionParameterTypes',
  );
  if (arrowFunctionParameterTypes !== undefined) {
    config.arrowFunctionParameterTypes = arrowFunctionParameterTypes;
  }

  const arrowFunctionReturnTypes = getConfigValue<boolean>(
    'angular.inlayHints.functionTypes.arrowFunctionReturnTypes',
  );
  if (arrowFunctionReturnTypes !== undefined) {
    config.arrowFunctionReturnTypes = arrowFunctionReturnTypes;
  }

  const parameterNameHints = getConfigValue<'none' | 'literals' | 'all'>(
    'angular.inlayHints.parameterHints.nameHints',
  );
  if (parameterNameHints !== undefined) config.parameterNameHints = parameterNameHints;

  const suppressWhenArgumentMatchesName = getConfigValue<boolean>(
    'angular.inlayHints.parameterHints.suppressWhenArgumentMatchesName',
  );
  if (suppressWhenArgumentMatchesName !== undefined) {
    config.parameterNameHintsWhenArgumentMatchesName = !suppressWhenArgumentMatchesName;
  }

  const eventParameterTypes = getConfigValue<boolean>(
    'angular.inlayHints.eventHints.parameterTypes',
  );
  if (eventParameterTypes !== undefined) config.eventParameterTypes = eventParameterTypes;

  const propertyBindingTypes = getConfigValue<boolean>(
    'angular.inlayHints.bindingHints.propertyBindingTypes',
  );
  if (propertyBindingTypes !== undefined) config.propertyBindingTypes = propertyBindingTypes;

  const pipeOutputTypes = getConfigValue<boolean>(
    'angular.inlayHints.bindingHints.pipeOutputTypes',
  );
  if (pipeOutputTypes !== undefined) config.pipeOutputTypes = pipeOutputTypes;

  const twoWayBindingSignalTypes = getConfigValue<boolean>(
    'angular.inlayHints.bindingHints.twoWayBindingSignalTypes',
  );
  if (twoWayBindingSignalTypes !== undefined) {
    config.twoWayBindingSignalTypes = twoWayBindingSignalTypes;
  }

  const requiredInputIndicator = getConfigValue<'none' | 'asterisk' | 'exclamation'>(
    'angular.inlayHints.bindingHints.requiredInputIndicator',
  );
  if (requiredInputIndicator !== undefined) {
    config.requiredInputIndicator = requiredInputIndicator;
  }

  const interactiveInlayHints = getConfigValue<boolean>(
    'angular.inlayHints.interaction.interactiveInlayHints',
  );
  if (interactiveInlayHints !== undefined) config.interactiveInlayHints = interactiveInlayHints;

  const hostListenerArgumentTypes = getConfigValue<boolean>(
    'angular.inlayHints.eventHints.hostListenerArgumentTypes',
  );
  if (hostListenerArgumentTypes !== undefined) {
    config.hostListenerArgumentTypes = hostListenerArgumentTypes;
  }

  const switchExpressionTypes = getConfigValue<boolean>(
    'angular.inlayHints.controlFlowHints.switchExpressionTypes',
  );
  if (switchExpressionTypes !== undefined) config.switchExpressionTypes = switchExpressionTypes;

  const deferTriggerTypes = getConfigValue<boolean>(
    'angular.inlayHints.controlFlowHints.deferTriggerTypes',
  );
  if (deferTriggerTypes !== undefined) config.deferTriggerTypes = deferTriggerTypes;

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
 * This handler returns Angular-specific template inlay hints.
 * TypeScript inlay hints are provided by TypeScript's own provider in VS Code.
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

  // Request workspace configuration from the client for Angular inlay hints.
  let angularConfig: InlayHintsConfig = {};

  try {
    // Request configuration from the client using shared config infrastructure
    const configResult = await getWorkspaceConfigurationCached<Record<string, unknown>>(
      session.connection,
      [
        {section: 'angular.inlayHints', scopeUri: params.textDocument.uri},
        {section: 'editor.inlayHints', scopeUri: params.textDocument.uri},
      ],
    );

    if (configResult && configResult.length >= 2) {
      // Flatten each config section using the shared utility
      const flatConfig: Record<string, unknown> = {
        ...flattenConfiguration(configResult[0] ?? {}, 'angular.inlayHints'),
        ...flattenConfiguration(configResult[1] ?? {}, 'editor.inlayHints'),
      };

      if (!isEditorInlayHintsEnabled(flatConfig)) {
        return null;
      }
      angularConfig = mapAngularInlayHintsConfig(flatConfig);
    }
  } catch {
    // If configuration request fails, use defaults
  }

  // Get Angular-specific inlay hints for templates
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
        hints.push(convertAngularInlayHint(session, angularHint, position));
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
 * This is called when the user requests lazy resolution for an inlay hint.
 * For now, we just return the hint as-is since we don't have expensive data to defer.
 */
export function onInlayHintResolve(session: Session, hint: lsp.InlayHint): lsp.InlayHint {
  // Currently, all our hints are fully computed upfront.
  // In the future, we could defer tooltip computation here.
  return hint;
}

/**
 * Convert an Angular InlayHint to an LSP InlayHint.
 */
function convertAngularInlayHint(
  session: Session,
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
      const location = getDisplayPartLocation(session, part);
      if (location) {
        labelPart.location = location;
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

function getDisplayPartLocation(
  session: Session,
  part: {
    span?: {start: number; length: number};
    file?: string;
  },
): lsp.Location | undefined {
  if (!part.span || !part.file) {
    return undefined;
  }

  const text = readFileText(session, part.file);
  if (text === undefined) {
    return undefined;
  }

  const sourceFile = ts.createSourceFile(part.file, text, ts.ScriptTarget.Latest, true);
  const start = ts.getLineAndCharacterOfPosition(sourceFile, part.span.start);
  const end = ts.getLineAndCharacterOfPosition(sourceFile, part.span.start + part.span.length);

  return {
    uri: filePathToUri(part.file),
    range: {
      start: {line: start.line, character: start.character},
      end: {line: end.line, character: end.character},
    },
  };
}

function readFileText(session: Session, fileName: string): string | undefined {
  const scriptInfo = session.projectService.getScriptInfo(fileName);
  if (scriptInfo) {
    const snapshot = scriptInfo.getSnapshot();
    return snapshot.getText(0, snapshot.getLength());
  }
  return ts.sys.readFile(fileName);
}
