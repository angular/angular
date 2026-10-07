/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  AST,
  Binary,
  BindingPipe,
  LiteralPrimitive,
  PropertyRead,
  SafePropertyRead,
  TmplAstBoundAttribute,
  TmplAstBoundEvent,
  TmplAstElement,
  TmplAstLetDeclaration,
  TmplAstNode,
  TmplAstReference,
  TmplAstTemplate,
  TmplAstTextAttribute,
  TmplAstVariable,
  CssSelector,
  ExpressionIdentifier,
} from '@angular/compiler';
import {hasExpressionIdentifier} from '@angular/compiler-cli/private/hybrid_analysis';
import ts from 'typescript';
import {Location, Range} from 'vscode-languageserver';
import {URI} from 'vscode-uri';
import {fileURLToPath} from 'node:url';

import {getTargetAtPosition, TargetNodeKind} from '@angular/language-service/private';
import {SymbolKind} from './symbols.js';
import {TemplateTypeChecker} from './type_checker.js';
import {SetupResult} from './type_checker_setup.js';
import {HybridCompiler} from '../../src/hybrid_compiler.js';
import {
  getTemplateLocationFromTcbLocation,
  offsetToPosition,
  positionToOffset,
  isTcbFunction,
  getTcbPath,
} from '../../src/tcb_ls_util.js';
import {readSpanComment} from '../../src/comments.js';
import {isWithin, getDirectiveMatchesForAttribute, canonicalizePath} from './utils.js';
import {makeClassKey} from '../../src/compiler-utils.js';
import {ClassMetadata} from '../../src/types.js';

export interface FilePosition {
  fileName: string;
  position: number;
}

export interface TemplateLocationDetails {
  templateTarget: TmplAstNode | AST;
  typescriptLocations: FilePosition[];
  symbol: any;
}

export interface RenameTextAndSpan {
  text: string;
  span: {start: number; length: number};
}

export function findTightestNode(node: ts.Node, position: number): ts.Node | undefined {
  if (node.getStart() <= position && position < node.getEnd()) {
    return node.forEachChild((c) => findTightestNode(c, position)) ?? node;
  }
  return undefined;
}

export function getParentClassDeclaration(startNode: ts.Node): ts.ClassDeclaration | undefined {
  let curr: ts.Node | undefined = startNode;
  while (curr) {
    if (ts.isClassDeclaration(curr)) {
      return curr;
    }
    curr = curr.parent;
  }
  return undefined;
}

export function collectMemberMethods(clazz: ts.ClassDeclaration): ts.MethodDeclaration[] {
  const members: ts.MethodDeclaration[] = [];
  for (const member of clazz.members) {
    if (ts.isMethodDeclaration(member)) {
      members.push(member);
    }
  }
  return members;
}

export function getTargetDetailsAtTemplatePosition(
  info: SetupResult,
  position: number,
  templateTypeChecker: TemplateTypeChecker,
  hybridCompiler: HybridCompiler,
): TemplateLocationDetails[] | null {
  const positionDetails = getTargetAtPosition(info.parsedTemplate.nodes, position);
  if (positionDetails === null) {
    return null;
  }

  const nodes =
    positionDetails.context.kind === TargetNodeKind.TwoWayBindingContext
      ? (positionDetails.context as any).nodes
      : [(positionDetails.context as any).node];

  const details: TemplateLocationDetails[] = [];

  for (const node of nodes) {
    if (!node) continue;
    const symbol = templateTypeChecker.getSymbolForNode(
      node,
      info.tsFilePath,
      info.meta.classKey,
      info.tcbSf,
    );
    if (!symbol) continue;

    const templateTarget = node;
    switch (symbol.kind) {
      case SymbolKind.Directive:
        if (
          templateTarget instanceof TmplAstTextAttribute ||
          templateTarget instanceof TmplAstBoundAttribute
        ) {
          const pos = getPositionForDirective(symbol, info.meta.allDeclarations, hybridCompiler);
          if (pos) {
            details.push({
              typescriptLocations: [pos],
              templateTarget,
              symbol,
            });
          }
        }
        break;

      case SymbolKind.Template:
        break;

      case SymbolKind.Element: {
        const matches = getDirectiveMatchesForElementTag(
          symbol.templateNode,
          symbol.directives || [],
        );
        details.push({
          typescriptLocations: getPositionsForDirectives(
            matches,
            info.meta.allDeclarations,
            hybridCompiler,
          ),
          templateTarget,
          symbol,
        });
        break;
      }

      case SymbolKind.DomBinding: {
        if (!(node instanceof TmplAstTextAttribute) && !(node instanceof TmplAstBoundAttribute)) {
          return null;
        }
        const directives = getDirectiveMatchesForAttribute(
          node.name,
          symbol.host.templateNode,
          symbol.host.directives || [],
        );
        details.push({
          typescriptLocations: getPositionsForDirectives(
            Array.from(directives),
            info.meta.allDeclarations,
            hybridCompiler,
          ),
          templateTarget,
          symbol,
        });
        break;
      }

      case SymbolKind.Reference: {
        if (symbol.referenceVarLocation) {
          details.push({
            typescriptLocations: [
              {
                fileName: symbol.referenceVarLocation.tcbPath,
                position: symbol.referenceVarLocation.positionInFile,
              },
            ],
            templateTarget,
            symbol,
          });
        }
        break;
      }

      case SymbolKind.Variable: {
        if (templateTarget instanceof TmplAstVariable) {
          if (
            templateTarget.valueSpan !== undefined &&
            isWithin(position, templateTarget.valueSpan)
          ) {
            if (symbol.initializerLocation) {
              details.push({
                typescriptLocations: [
                  {
                    fileName: symbol.initializerLocation.tcbPath,
                    position: symbol.initializerLocation.positionInFile,
                  },
                ],
                templateTarget,
                symbol,
              });
            }
          } else if (isWithin(position, templateTarget.keySpan)) {
            if (symbol.localVarLocation) {
              details.push({
                typescriptLocations: [
                  {
                    fileName: symbol.localVarLocation.tcbPath,
                    position: symbol.localVarLocation.positionInFile,
                  },
                ],
                templateTarget,
                symbol,
              });
            }
          }
        } else {
          if (symbol.localVarLocation) {
            details.push({
              typescriptLocations: [
                {
                  fileName: symbol.localVarLocation.tcbPath,
                  position: symbol.localVarLocation.positionInFile,
                },
              ],
              templateTarget,
              symbol,
            });
          }
        }
        break;
      }

      case SymbolKind.LetDeclaration: {
        if (
          !(templateTarget instanceof TmplAstLetDeclaration) ||
          isWithin(position, templateTarget.nameSpan)
        ) {
          if (symbol.localVarLocation) {
            details.push({
              typescriptLocations: [
                {
                  fileName: symbol.localVarLocation.tcbPath,
                  position: symbol.localVarLocation.positionInFile,
                },
              ],
              templateTarget,
              symbol,
            });
          }
        }
        break;
      }

      case SymbolKind.Input:
      case SymbolKind.Output: {
        if (symbol.bindings && symbol.bindings.length > 0) {
          details.push({
            typescriptLocations: symbol.bindings
              .filter((b: any) => b.tcbLocation)
              .map((b: any) => {
                let pos = b.tcbLocation.positionInFile;
                if (symbol.kind === SymbolKind.Output && info.tcbSf) {
                  const node = findTightestNode(info.tcbSf, pos);
                  if (node) {
                    if (ts.isStringLiteral(node)) {
                      pos = node.getStart(info.tcbSf) + 1;
                    } else if (ts.isIdentifier(node)) {
                      pos = node.getStart(info.tcbSf);
                    } else if (ts.isElementAccessExpression(node)) {
                      pos = node.argumentExpression.getStart(info.tcbSf) + 1;
                    }
                  }
                }
                return {
                  fileName: b.tcbLocation.tcbPath,
                  position: pos,
                };
              }),
            templateTarget,
            symbol,
          });
        } else {
          const parent = (positionDetails as any).parent;
          const templateName = (templateTarget as any).name || '';
          const directiveMatches =
            parent instanceof TmplAstElement || parent instanceof TmplAstTemplate
              ? getDirectiveMatchesForAttribute(
                  templateName,
                  parent,
                  info.meta.resolvedDeclarations || [],
                )
              : new Set<any>();
          if (directiveMatches.size > 0) {
            const locs = Array.from(directiveMatches)
              .filter((d) => d.tcbLocation)
              .map((d) => ({
                fileName: getTcbPath(info.tsFilePath),
                position: d.tcbLocation!.positionInFile,
              }));
            if (locs.length > 0) {
              details.push({
                typescriptLocations: locs,
                templateTarget,
                symbol,
              });
            }
          }
        }
        break;
      }

      case SymbolKind.Pipe: {
        const loc = symbol.tcbLocation || symbol.classSymbol?.tcbLocation;
        if (loc) {
          details.push({
            typescriptLocations: [
              {
                fileName: loc.tcbPath,
                position: loc.positionInFile,
              },
            ],
            templateTarget,
            symbol,
          });
        }
        break;
      }

      case SymbolKind.Expression: {
        if (symbol.tcbLocation) {
          details.push({
            typescriptLocations: [
              {
                fileName: symbol.tcbLocation.tcbPath,
                position: symbol.tcbLocation.positionInFile,
              },
            ],
            templateTarget,
            symbol,
          });
        }
        break;
      }
    }
  }

  return details.length > 0 ? details : null;
}

function getDirectiveMatchesForElementTag(templateNode: TmplAstElement, directives: any[]): any[] {
  const matching: any[] = [];
  const tagName = templateNode.name.toLowerCase();
  for (const dir of directives) {
    if (!dir.selector) continue;
    try {
      const selectors = CssSelector.parse(dir.selector);
      for (const sel of selectors) {
        if (sel.element && sel.element.toLowerCase() === tagName) {
          matching.push(dir);
          break;
        }
      }
    } catch {}
  }
  return matching.length > 0 ? matching : directives;
}

export function getPositionsForDirectives(
  directives: any[] | Set<any>,
  allDeclarations: ClassMetadata[] = [],
  hybridCompiler?: HybridCompiler,
): FilePosition[] {
  const positions: FilePosition[] = [];
  const list = directives instanceof Set ? Array.from(directives) : directives;
  for (const dir of list) {
    const pos = getPositionForDirective(dir, allDeclarations, hybridCompiler);
    if (pos) {
      positions.push(pos);
    }
  }
  return positions;
}

export function getPositionForDirective(
  directive: any,
  allDeclarations: ClassMetadata[] = [],
  hybridCompiler?: HybridCompiler,
): FilePosition | null {
  if (directive.ref) {
    if (directive.ref.nodeFilePath && directive.ref.nodeNameSpan) {
      return {
        fileName: directive.ref.nodeFilePath,
        position: directive.ref.nodeNameSpan.start,
      };
    }
    if (directive.ref.filePath && directive.ref.position !== undefined) {
      return {
        fileName: directive.ref.filePath,
        position: directive.ref.position,
      };
    }
  }

  const dirName =
    directive.name ||
    directive.ref?.name ||
    directive.className ||
    directive.selectorlessNode?.componentName ||
    directive.selectorlessNode?.name;
  if (dirName) {
    for (const decl of allDeclarations) {
      if (decl.className === dirName && decl.nameSpan) {
        return {
          fileName: (decl as any).filePath || '',
          position: decl.nameSpan.start,
        };
      }
    }

    if (hybridCompiler && hybridCompiler.fileCache) {
      for (const filePath of hybridCompiler.fileCache.keys()) {
        if (typeof filePath !== 'string') continue;
        const meta = hybridCompiler.getClassMetadata(filePath);
        for (const decl of meta?.classes || []) {
          if (decl.className === dirName && decl.nameSpan) {
            return {
              fileName: filePath,
              position: decl.nameSpan.start,
            };
          }
        }
      }
    }
  }

  return null;
}

export function createLocationKey(ds: Location | {uri: string; range: Range}): string {
  return `${ds.uri}:${ds.range.start.line}:${ds.range.start.character}:${ds.range.end.line}:${ds.range.end.character}`;
}

export async function convertToTemplateDocumentSpan(
  shimLocation: Location,
  hybridCompiler: HybridCompiler,
  requiredNodeText?: string,
): Promise<Location | null> {
  const rawUri = shimLocation.uri;
  const filePath = rawUri.startsWith('file:') ? fileURLToPath(rawUri) : rawUri;

  if (!filePath.endsWith('.ngtypecheck.ts')) {
    return shimLocation;
  }

  const tsFilePath = filePath.replace(/(\.ts)?\.ngtypecheck\.ts$/, '.ts');
  const tcbCode = hybridCompiler.getTcbForFile(tsFilePath);
  if (!tcbCode) {
    return null;
  }

  const tcbSf = ts.createSourceFile(filePath, tcbCode, ts.ScriptTarget.Latest, true);
  const startOffset = positionToOffset(tcbCode, shimLocation.range.start);
  const tcbNode = findTightestNode(tcbSf, startOffset);

  if (
    tcbNode !== undefined &&
    hasExpressionIdentifier(tcbSf, tcbNode, ExpressionIdentifier.EVENT_PARAMETER)
  ) {
    return null;
  }

  let effectiveNode = tcbNode;
  if (
    effectiveNode !== undefined &&
    hasExpressionIdentifier(tcbSf, effectiveNode, ExpressionIdentifier.VARIABLE_AS_EXPRESSION)
  ) {
    let curr: ts.Node | undefined = effectiveNode;
    while (curr && !ts.isVariableDeclaration(curr)) {
      curr = curr.parent;
    }
    if (curr && ts.isVariableDeclaration(curr) && ts.isIdentifier(curr.name)) {
      effectiveNode = curr.name;
    }
  }

  // Resolve template URL from enclosing TCB function
  let currentNode: ts.Node | undefined = effectiveNode ?? tcbNode;
  let typeCheckId: string | undefined;
  while (currentNode !== undefined) {
    if (isTcbFunction(currentNode)) {
      typeCheckId = currentNode.name.text.substring(1);
      break;
    }
    currentNode = currentNode.parent;
  }

  const metadata = hybridCompiler.getClassMetadata(tsFilePath);
  const typeCheckIdMap = hybridCompiler.getTypeCheckIdMap(tsFilePath);
  let templatePath = tsFilePath;

  if (metadata && typeCheckIdMap && typeCheckId) {
    for (const cls of metadata.classes ?? []) {
      if (cls.className && cls.component?.templateUrl) {
        const classKey = makeClassKey(cls.className, cls.span.start);
        const id = typeCheckIdMap.get(classKey);
        if (id === typeCheckId) {
          templatePath = cls.component.templateUrl.resolvedPath;
          break;
        }
      }
    }
  }

  let mapped: {start: number; end: number} | null = null;
  let currNode: ts.Node | undefined = effectiveNode ?? tcbNode;
  while (currNode && !isTcbFunction(currNode)) {
    const span = readSpanComment(currNode, tcbSf);
    if (span) {
      mapped = {start: span.start, end: span.end};
      break;
    }
    currNode = currNode.parent;
  }
  if (!mapped) {
    mapped = getTemplateLocationFromTcbLocation(tcbCode, startOffset);
  }
  if (!mapped) {
    return null;
  }

  let templateContent: string;
  try {
    templateContent = hybridCompiler.getFileContent(templatePath);
  } catch {
    return null;
  }

  let exactSpan = {start: mapped.start, end: mapped.end};
  const targetClass = metadata?.classes.find((c) => {
    if (typeCheckId && typeCheckIdMap) {
      const key = makeClassKey(c.className, c.span.start);
      return typeCheckIdMap.get(key) === typeCheckId;
    }
    return true;
  });
  if (targetClass) {
    const ck = makeClassKey(targetClass.className, targetClass.span.start);
    const parsed = hybridCompiler.getParsedTemplate(tsFilePath, ck);
    if (parsed && parsed.nodes) {
      const target = getTargetAtPosition(parsed.nodes, mapped.start);
      if (target) {
        let node =
          'nodes' in target.context ? target.context.nodes[0] : (target.context as any).node;
        if (node && (node instanceof TmplAstElement || node instanceof TmplAstTemplate)) {
          const matchingAttr = [
            ...(node.inputs || []),
            ...(node.outputs || []),
            ...(node.attributes || []),
            ...(node.references || []),
          ].find(
            (attr) =>
              isWithin(mapped!.start, attr.sourceSpan) ||
              (attr.sourceSpan && attr.sourceSpan.start.offset === mapped!.start),
          );
          if (matchingAttr) {
            node = matchingAttr;
          }
        }
        if (node) {
          if (node.keySpan) {
            exactSpan = {
              start: node.keySpan.start.offset,
              end: node.keySpan.end.offset,
            };
          } else if (node.nameSpan) {
            const s =
              typeof node.nameSpan.start === 'number'
                ? node.nameSpan.start
                : node.nameSpan.start.offset;
            const e =
              typeof node.nameSpan.end === 'number' ? node.nameSpan.end : node.nameSpan.end.offset;
            exactSpan = {start: s, end: e};
          } else if (node instanceof LiteralPrimitive && typeof node.value === 'string') {
            const s =
              typeof node.sourceSpan.start === 'number'
                ? node.sourceSpan.start
                : (node.sourceSpan.start as any).offset;
            const e =
              typeof node.sourceSpan.end === 'number'
                ? node.sourceSpan.end
                : (node.sourceSpan.end as any).offset;
            exactSpan = {start: s + 1, end: e - 1};
          }
        }
      }
    }
  }

  if (requiredNodeText !== undefined) {
    const actualText = templateContent.substring(exactSpan.start, exactSpan.end);
    if (actualText !== requiredNodeText) {
      return null;
    }
  }

  const startPos = offsetToPosition(templateContent, exactSpan.start);
  const endPos = offsetToPosition(templateContent, exactSpan.end);

  return {
    uri: URI.file(await canonicalizePath(templatePath)).toString(),
    range: {
      start: startPos,
      end: endPos,
    },
  };
}

export function getRenameTextAndSpanAtPosition(
  node: TmplAstNode | AST,
  position: number,
): RenameTextAndSpan | null {
  if (
    node instanceof TmplAstBoundAttribute ||
    node instanceof TmplAstTextAttribute ||
    node instanceof TmplAstBoundEvent
  ) {
    if (!node.keySpan) return null;
    return {
      text: node.name,
      span: {
        start: node.keySpan.start.offset,
        length: node.keySpan.end.offset - node.keySpan.start.offset,
      },
    };
  } else if (node instanceof TmplAstLetDeclaration && isWithin(position, node.nameSpan)) {
    return {
      text: node.nameSpan.toString(),
      span: {
        start: node.nameSpan.start.offset,
        length: node.nameSpan.end.offset - node.nameSpan.start.offset,
      },
    };
  } else if (node instanceof TmplAstVariable || node instanceof TmplAstReference) {
    if (isWithin(position, node.keySpan)) {
      return {
        text: node.keySpan.toString(),
        span: {
          start: node.keySpan.start.offset,
          length: node.keySpan.end.offset - node.keySpan.start.offset,
        },
      };
    } else if (node.valueSpan && isWithin(position, node.valueSpan)) {
      return {
        text: node.valueSpan.toString(),
        span: {
          start: node.valueSpan.start.offset,
          length: node.valueSpan.end.offset - node.valueSpan.start.offset,
        },
      };
    }
  } else if (
    node instanceof PropertyRead ||
    node instanceof SafePropertyRead ||
    node instanceof BindingPipe
  ) {
    const span = (node as any).nameSpan || (node as any).sourceSpan;
    if (!span) return null;
    const start = typeof span.start === 'number' ? span.start : span.start.offset;
    const end = typeof span.end === 'number' ? span.end : span.end.offset;
    return {
      text: node.name,
      span: {start, length: end - start},
    };
  } else if (
    node instanceof Binary &&
    node.operation === '=' &&
    node.left instanceof PropertyRead
  ) {
    return getRenameTextAndSpanAtPosition(node.left, position);
  } else if (node instanceof LiteralPrimitive) {
    let start =
      typeof node.sourceSpan.start === 'number'
        ? node.sourceSpan.start
        : (node.sourceSpan.start as any).offset;
    let end =
      typeof node.sourceSpan.end === 'number'
        ? node.sourceSpan.end
        : (node.sourceSpan.end as any).offset;
    let length = end - start;
    if (typeof node.value === 'string') {
      start += 1;
      length -= 2;
    }
    return {
      text: `${node.value}`,
      span: {start, length},
    };
  } else if (node instanceof TmplAstElement) {
    if (
      !isWithin(position, node.startSourceSpan) &&
      (!node.endSourceSpan || !isWithin(position, node.endSourceSpan))
    ) {
      return null;
    }
    return {
      text: node.name,
      span: {
        start: node.startSourceSpan.start.offset,
        length: node.startSourceSpan.end.offset - node.startSourceSpan.start.offset,
      },
    };
  }

  return null;
}
