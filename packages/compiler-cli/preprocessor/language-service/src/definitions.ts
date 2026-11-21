/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TemplateTypeChecker} from './type_checker.js';
import {getSetup} from './type_checker_setup.js';
import {HybridCompiler} from '../../src/hybrid_compiler.js';
import {UrlMetadata} from '../../src/types.js';
import {TsGoFacade} from './facade.js';
import {SymbolKind} from './symbols.js';
import {getTargetAtPosition} from '@angular/language-service/private';
import {getDirectiveMatchesForAttribute, isWithin} from './utils.js';
import {
  getTemplateLocationFromTcbLocation,
  positionToOffset,
  offsetToPosition,
} from './tcb_ls_util.js';
import {LocationLink} from 'vscode-languageserver';
import {URI} from 'vscode-uri';
import {
  PropertyRead,
  TmplAstVariable,
  TmplAstReference,
  TmplAstTextAttribute,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstTemplate,
  TmplAstElement,
} from '@angular/compiler';

export class DefinitionBuilder {
  constructor(
    private readonly facade: TsGoFacade,
    private readonly hybridCompiler: HybridCompiler,
    private readonly templateTypeChecker: TemplateTypeChecker,
  ) {}

  async getDefinition(
    filePath: string,
    offset: number,
    position: {line: number; character: number},
    fileContent: string,
  ): Promise<unknown> {
    const setup = await getSetup(this.hybridCompiler, filePath, position);
    if (!setup) {
      // We were unable to get a template at the given position. If we are in a TS file, instead
      // attempt to get an Angular definition at the location inside a TS file (examples of this
      // would be templateUrl or a url in styleUrls).
      if (filePath.endsWith('.html')) {
        return null;
      }
      return getDefinitionForExpressionAtPosition(
        filePath,
        offset,
        fileContent,
        this.hybridCompiler,
      );
    }
    const {parsedTemplate, isHostBinding, hostElement} = setup;

    let target;
    if (isHostBinding && hostElement) {
      target = getTargetAtPosition([hostElement], offset);
    } else {
      target = getTargetAtPosition(parsedTemplate.nodes, offset);
    }

    if (!target) {
      return null;
    }

    const {context, parent} = target;

    function hasNode(obj: unknown): obj is {node: unknown} {
      return typeof obj === 'object' && obj !== null && 'node' in obj;
    }

    const node = hasNode(context) ? context.node : null;
    let templateName = '';

    if (node instanceof PropertyRead) {
      templateName = node.name;
    } else if (
      node instanceof TmplAstVariable ||
      node instanceof TmplAstReference ||
      node instanceof TmplAstTextAttribute ||
      node instanceof TmplAstBoundAttribute ||
      node instanceof TmplAstBoundEvent
    ) {
      templateName = node.name;
    }

    const tcbResult = await this.templateTypeChecker.getTcb(filePath, position);
    if (!tcbResult) {
      return null;
    }

    const ngSymbol = await this.templateTypeChecker.getSymbolOfNode(filePath, position);
    if (!ngSymbol) {
      return null;
    }

    const tcbUri = tcbResult.filePath;
    await this.facade.ensureDocument(tcbUri, tcbResult.code);

    switch (ngSymbol.kind) {
      case SymbolKind.Directive: {
        if (!ngSymbol.tcbLocation) return null;
        const pos = offsetToPosition(tcbResult.code, ngSymbol.tcbLocation.positionInFile);

        return await this.facade.getTypeDefinitionAtPosition(tcbUri, pos);
      }
      case SymbolKind.Element:
      case SymbolKind.Template: {
        const directive = ngSymbol.directives?.[0];
        const loc = directive?.tcbLocation || ngSymbol.tcbLocation;
        if (!loc) return null;
        const pos = offsetToPosition(tcbResult.code, loc.positionInFile);
        return await this.facade.getTypeDefinitionAtPosition(tcbUri, pos);
      }
      case SymbolKind.Pipe: {
        let pos: {line: number; character: number} | null = null;
        if (ngSymbol.tcbLocation) {
          pos = offsetToPosition(tcbResult.code, ngSymbol.tcbLocation.positionInFile);
        } else if (ngSymbol.classSymbol?.tcbLocation) {
          pos = offsetToPosition(tcbResult.code, ngSymbol.classSymbol.tcbLocation.positionInFile);
        }
        if (!pos) return null;

        return await this.facade.getDefinitionAtPosition(tcbUri, pos);
      }
      case SymbolKind.Output:
      case SymbolKind.Input: {
        const bindings = ngSymbol.bindings;
        if (!bindings || bindings.length === 0) {
          const directiveMatches =
            parent instanceof TmplAstElement || parent instanceof TmplAstTemplate
              ? getDirectiveMatchesForAttribute(
                  templateName,
                  parent,
                  setup.meta.resolvedDeclarations,
                )
              : new Set<{selector: string | null; tcbLocation?: {positionInFile: number}}>();
          if (directiveMatches.size > 0) {
            const defs = [];
            for (const dir of directiveMatches) {
              if (dir.tcbLocation) {
                const pos = offsetToPosition(tcbResult.code, dir.tcbLocation.positionInFile);

                const typeDefs = await this.facade.getDefinitionAtPosition(tcbUri, pos);
                if (typeDefs) defs.push(...typeDefs);
              }
            }
            return defs;
          }
          return null;
        }

        const defs = [];
        for (const binding of bindings) {
          if (binding.tcbLocation) {
            const pos = offsetToPosition(tcbResult.code, binding.tcbLocation.positionInFile);

            const typeDefs = await this.facade.getDefinitionAtPosition(tcbUri, pos);
            if (typeDefs) defs.push(...typeDefs);
          }
        }

        const directiveMatches =
          parent instanceof TmplAstElement || parent instanceof TmplAstTemplate
            ? getDirectiveMatchesForAttribute(templateName, parent, setup.meta.resolvedDeclarations)
            : new Set<{selector: string | null; tcbLocation?: {positionInFile: number}}>();
        for (const dir of directiveMatches) {
          if (dir.tcbLocation) {
            const pos = offsetToPosition(tcbResult.code, dir.tcbLocation.positionInFile);

            const typeDefs = await this.facade.getDefinitionAtPosition(tcbUri, pos);
            if (typeDefs) defs.push(...typeDefs);
          }
        }

        return defs;
      }
      case SymbolKind.Expression:
      case SymbolKind.LetDeclaration:
      case SymbolKind.Reference:
      case SymbolKind.Variable: {
        const loc =
          ngSymbol.tcbLocation ||
          ngSymbol.localVarLocation ||
          ngSymbol.targetLocation ||
          ngSymbol.referenceVarLocation;
        if (!loc) return null;
        const pos = offsetToPosition(tcbResult.code, loc.positionInFile);

        const result = await this.facade.getDefinitionAtPosition(tcbUri, pos);

        if (result && (!Array.isArray(result) || result.length > 0)) {
          const locations = Array.isArray(result) ? result : [result];
          const mappedLocations = [];
          for (const rLoc of locations) {
            const uri = rLoc.uri;
            if (uri === tcbUri || uri.includes('.ngtypecheck.ts')) {
              const targetPos = positionToOffset(tcbResult.code, rLoc.range.start);
              const mapped = getTemplateLocationFromTcbLocation(tcbResult.code, targetPos);
              if (mapped) {
                mappedLocations.push({
                  uri: filePath,
                  range: {
                    start: offsetToPosition(fileContent, mapped.start),
                    end: offsetToPosition(fileContent, mapped.end),
                  },
                });
                continue;
              }
              continue;
            }
            mappedLocations.push(rLoc);
          }
          if (mappedLocations.length > 0) {
            return mappedLocations;
          }
        }

        // Fallback: Try to map the TCB location back to the template
        const targetPos = loc.positionInFile;
        const mapped = getTemplateLocationFromTcbLocation(tcbResult.code, targetPos);
        if (mapped) {
          return [
            {
              uri: filePath,
              range: {
                start: offsetToPosition(fileContent, mapped.start),
                end: offsetToPosition(fileContent, mapped.end),
              },
            },
          ];
        }

        return result;
      }
    }

    return null;
  }
}

export async function getDefinition(
  filePath: string,
  offset: number,
  position: {line: number; character: number},
  fileContent: string,
  hybridCompiler: HybridCompiler,
  templateTypeChecker: TemplateTypeChecker,
  facade: TsGoFacade,
): Promise<unknown> {
  const builder = new DefinitionBuilder(facade, hybridCompiler, templateTypeChecker);
  return builder.getDefinition(filePath, offset, position, fileContent);
}

/**
 * Gets an Angular-specific definition in a TypeScript source file.
 */
async function getDefinitionForExpressionAtPosition(
  fileName: string,
  position: number,
  fileContent: string,
  compiler: HybridCompiler,
): Promise<LocationLink[] | null> {
  const fileResult = await compiler.getClassMetadata(fileName);
  if (!fileResult) {
    return null;
  }

  for (const cls of fileResult.classes) {
    const component = cls.component;
    if (!component) {
      continue;
    }

    let resourceForExpression: UrlMetadata | null = null;

    if (
      component.templateUrl?.stringLiteralSpan !== undefined &&
      isWithin(position, component.templateUrl.stringLiteralSpan)
    ) {
      resourceForExpression = component.templateUrl;
    }

    if (resourceForExpression === null && component.styleUrls !== undefined) {
      for (const style of component.styleUrls) {
        if (style.stringLiteralSpan !== undefined && isWithin(position, style.stringLiteralSpan)) {
          resourceForExpression = style;
          break;
        }
      }
    }

    if (resourceForExpression === null || resourceForExpression.stringLiteralSpan === undefined) {
      continue;
    }

    const originSelectionRange = {
      start: offsetToPosition(fileContent, resourceForExpression.stringLiteralSpan.start + 1),
      end: offsetToPosition(fileContent, resourceForExpression.stringLiteralSpan.end - 1),
    };
    const emptyRange = {
      start: {line: 0, character: 0},
      end: {line: 0, character: 0},
    };
    return [
      {
        originSelectionRange,
        targetUri: URI.file(resourceForExpression.resolvedPath).toString(),
        targetRange: emptyRange,
        targetSelectionRange: emptyRange,
      },
    ];
  }

  return null;
}
