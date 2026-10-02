/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ImportManager} from '@angular/compiler-cli/private/migrations';
import ts from 'typescript';
import {
  confirmAsSerializable,
  ProgramInfo,
  projectFile,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeFunnelMigration,
} from '../../utils/tsurge';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';
import {getImportSpecifier} from '../../utils/typescript/imports';

export interface UnitAnalysisMetadata {
  replacements: Replacement[];
}

export class CanLoadToCanMatchMigration extends TsurgeFunnelMigration<
  UnitAnalysisMetadata,
  UnitAnalysisMetadata
> {
  override async analyze(info: ProgramInfo): Promise<Serializable<UnitAnalysisMetadata>> {
    const replacements: Replacement[] = [];
    const {sourceFiles, program} = info;
    const typeChecker = program.getTypeChecker();
    const importManager = new ImportManager();

    const guardClasses = new Set<ts.ClassDeclaration>();
    const guardObjects = new Set<ts.ObjectLiteralExpression>();
    const guardMethods = new Set<ts.MethodDeclaration | ts.PropertyDeclaration>();

    // Pass 1: Discover all guard classes and objects
    for (const sourceFile of sourceFiles) {
      ts.forEachChild(sourceFile, function visit(node: ts.Node) {
        if (ts.isClassDeclaration(node)) {
          if (implementsInterface(node, 'CanLoad')) {
            guardClasses.add(node);
          }
        } else if (ts.isObjectLiteralExpression(node)) {
          const canLoadProp = findPropertyNamed(node, 'canLoad');
          if (canLoadProp && ts.isPropertyAssignment(canLoadProp)) {
            if (ts.isArrayLiteralExpression(canLoadProp.initializer)) {
              for (const elem of canLoadProp.initializer.elements) {
                registerGuardElement(elem, typeChecker, guardClasses, guardObjects, guardMethods);
              }
            } else {
              registerGuardElement(
                canLoadProp.initializer,
                typeChecker,
                guardClasses,
                guardObjects,
                guardMethods,
              );
            }
          }
        }
        ts.forEachChild(node, visit);
      });
    }

    // Discover derived classes that inherit from a guard class
    let foundNewGuardClass = true;
    while (foundNewGuardClass) {
      foundNewGuardClass = false;
      for (const sourceFile of sourceFiles) {
        ts.forEachChild(sourceFile, function visit(node: ts.Node) {
          if (ts.isClassDeclaration(node) && !guardClasses.has(node)) {
            if (extendsGuardClass(node, typeChecker, guardClasses)) {
              guardClasses.add(node);
              foundNewGuardClass = true;
            }
          }
          ts.forEachChild(node, visit);
        });
      }
    }

    // Register methods on discovered guard classes and objects
    for (const classDecl of guardClasses) {
      for (const member of classDecl.members) {
        if (
          (ts.isMethodDeclaration(member) ||
            ts.isPropertyDeclaration(member) ||
            ts.isGetAccessorDeclaration(member) ||
            ts.isSetAccessorDeclaration(member)) &&
          ts.isIdentifier(member.name) &&
          member.name.text === 'canLoad'
        ) {
          guardMethods.add(member as any);
        }
      }
    }

    for (const obj of guardObjects) {
      for (const prop of obj.properties) {
        if (
          (ts.isPropertyAssignment(prop) || ts.isMethodDeclaration(prop)) &&
          ts.isIdentifier(prop.name) &&
          prop.name.text === 'canLoad'
        ) {
          guardMethods.add(prop as any);
        }
      }
    }

    // Pass 2: Generate replacements
    for (const sourceFile of sourceFiles) {
      // 1. Update imports
      const canLoadImport = getImportSpecifier(sourceFile, '@angular/router', 'CanLoad');
      if (canLoadImport) {
        importManager.removeImport(sourceFile, 'CanLoad', '@angular/router');
        importManager.addImport({
          requestedFile: sourceFile,
          exportSymbolName: 'CanMatch',
          exportModuleSpecifier: '@angular/router',
        });
      }

      const canLoadFnImport = getImportSpecifier(sourceFile, '@angular/router', 'CanLoadFn');
      if (canLoadFnImport) {
        importManager.removeImport(sourceFile, 'CanLoadFn', '@angular/router');
        importManager.addImport({
          requestedFile: sourceFile,
          exportSymbolName: 'CanMatchFn',
          exportModuleSpecifier: '@angular/router',
        });
      }

      // 2. Walk AST for modifications
      const walk = (node: ts.Node): void => {
        // Classes: implements CanLoad -> implements CanMatch, and rename canLoad members
        if (ts.isClassDeclaration(node)) {
          if (node.heritageClauses) {
            for (const clause of node.heritageClauses) {
              if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
                const canLoadType = clause.types.find((t) =>
                  isIdentifierOrPropAccessNamed(t.expression, 'CanLoad'),
                );
                if (canLoadType) {
                  const hasCanMatch = clause.types.some(
                    (t) =>
                      t !== canLoadType && isIdentifierOrPropAccessNamed(t.expression, 'CanMatch'),
                  );
                  if (hasCanMatch) {
                    const idx = clause.types.indexOf(canLoadType);
                    if (idx === 0 && clause.types.length > 1) {
                      replacements.push(
                        new Replacement(
                          projectFile(sourceFile, info),
                          new TextUpdate({
                            position: canLoadType.getStart(),
                            end: clause.types[1].getStart(),
                            toInsert: '',
                          }),
                        ),
                      );
                    } else if (idx > 0) {
                      replacements.push(
                        new Replacement(
                          projectFile(sourceFile, info),
                          new TextUpdate({
                            position: clause.types[idx - 1].getEnd(),
                            end: canLoadType.getEnd(),
                            toInsert: '',
                          }),
                        ),
                      );
                    }
                  } else {
                    const targetNode = ts.isPropertyAccessExpression(canLoadType.expression)
                      ? canLoadType.expression.name
                      : canLoadType.expression;
                    replacements.push(
                      new Replacement(
                        projectFile(sourceFile, info),
                        new TextUpdate({
                          position: targetNode.getStart(),
                          end: targetNode.getEnd(),
                          toInsert: 'CanMatch',
                        }),
                      ),
                    );
                  }
                }
              }
            }
          }

          if (guardClasses.has(node)) {
            for (const member of node.members) {
              if (
                (ts.isMethodDeclaration(member) ||
                  ts.isPropertyDeclaration(member) ||
                  ts.isGetAccessorDeclaration(member) ||
                  ts.isSetAccessorDeclaration(member)) &&
                ts.isIdentifier(member.name) &&
                member.name.text === 'canLoad'
              ) {
                replacements.push(
                  new Replacement(
                    projectFile(sourceFile, info),
                    new TextUpdate({
                      position: member.name.getStart(),
                      end: member.name.getEnd(),
                      toInsert: 'canMatch',
                    }),
                  ),
                );
              }
            }
          }
        }

        // Interface declarations (e.g. mock or local CanLoad interfaces)
        if (ts.isInterfaceDeclaration(node) && node.name.text === 'CanLoad') {
          replacements.push(
            new Replacement(
              projectFile(sourceFile, info),
              new TextUpdate({
                position: node.name.getStart(),
                end: node.name.getEnd(),
                toInsert: 'CanMatch',
              }),
            ),
          );
          for (const member of node.members) {
            if (
              (ts.isMethodSignature(member) || ts.isPropertySignature(member)) &&
              ts.isIdentifier(member.name) &&
              member.name.text === 'canLoad'
            ) {
              replacements.push(
                new Replacement(
                  projectFile(sourceFile, info),
                  new TextUpdate({
                    position: member.name.getStart(),
                    end: member.name.getEnd(),
                    toInsert: 'canMatch',
                  }),
                ),
              );
            }
          }
        }

        // Route object literals
        if (ts.isObjectLiteralExpression(node)) {
          const canLoadProp = findPropertyNamed(node, 'canLoad');
          const canMatchProp = findPropertyNamed(node, 'canMatch');

          if (canLoadProp) {
            if (!canMatchProp) {
              if (ts.isPropertyAssignment(canLoadProp)) {
                replacements.push(
                  new Replacement(
                    projectFile(sourceFile, info),
                    new TextUpdate({
                      position: canLoadProp.name.getStart(),
                      end: canLoadProp.name.getEnd(),
                      toInsert: 'canMatch',
                    }),
                  ),
                );
              } else if (ts.isShorthandPropertyAssignment(canLoadProp)) {
                replacements.push(
                  new Replacement(
                    projectFile(sourceFile, info),
                    new TextUpdate({
                      position: canLoadProp.getStart(),
                      end: canLoadProp.getEnd(),
                      toInsert: `canMatch: ${canLoadProp.name.text}`,
                    }),
                  ),
                );
              } else if (ts.isMethodDeclaration(canLoadProp) && ts.isIdentifier(canLoadProp.name)) {
                replacements.push(
                  new Replacement(
                    projectFile(sourceFile, info),
                    new TextUpdate({
                      position: canLoadProp.name.getStart(),
                      end: canLoadProp.name.getEnd(),
                      toInsert: 'canMatch',
                    }),
                  ),
                );
              }
            } else {
              // Both canMatch and canLoad exist on the route
              if (ts.isPropertyAssignment(canLoadProp) && ts.isPropertyAssignment(canMatchProp)) {
                if (ts.isArrayLiteralExpression(canMatchProp.initializer)) {
                  if (ts.isArrayLiteralExpression(canLoadProp.initializer)) {
                    if (canLoadProp.initializer.elements.length > 0) {
                      const firstElem = canLoadProp.initializer.elements[0];
                      const lastElem =
                        canLoadProp.initializer.elements[
                          canLoadProp.initializer.elements.length - 1
                        ];
                      const elementsText = sourceFile.text.substring(
                        firstElem.getStart(),
                        lastElem.getEnd(),
                      );

                      if (canMatchProp.initializer.elements.length > 0) {
                        const lastMatchElem =
                          canMatchProp.initializer.elements[
                            canMatchProp.initializer.elements.length - 1
                          ];
                        replacements.push(
                          new Replacement(
                            projectFile(sourceFile, info),
                            new TextUpdate({
                              position: lastMatchElem.getEnd(),
                              end: lastMatchElem.getEnd(),
                              toInsert: `, ${elementsText}`,
                            }),
                          ),
                        );
                      } else {
                        const closeBracketPos = canMatchProp.initializer.getEnd() - 1;
                        replacements.push(
                          new Replacement(
                            projectFile(sourceFile, info),
                            new TextUpdate({
                              position: closeBracketPos,
                              end: closeBracketPos,
                              toInsert: elementsText,
                            }),
                          ),
                        );
                      }
                    }
                  } else {
                    const exprText = canLoadProp.initializer.getText();
                    if (canMatchProp.initializer.elements.length > 0) {
                      const lastMatchElem =
                        canMatchProp.initializer.elements[
                          canMatchProp.initializer.elements.length - 1
                        ];
                      replacements.push(
                        new Replacement(
                          projectFile(sourceFile, info),
                          new TextUpdate({
                            position: lastMatchElem.getEnd(),
                            end: lastMatchElem.getEnd(),
                            toInsert: `, ...${exprText}`,
                          }),
                        ),
                      );
                    } else {
                      const closeBracketPos = canMatchProp.initializer.getEnd() - 1;
                      replacements.push(
                        new Replacement(
                          projectFile(sourceFile, info),
                          new TextUpdate({
                            position: closeBracketPos,
                            end: closeBracketPos,
                            toInsert: `...${exprText}`,
                          }),
                        ),
                      );
                    }
                  }
                }
              }

              // Remove canLoad property
              const removalRange = getPropertyRemovalRange(sourceFile, canLoadProp);
              replacements.push(
                new Replacement(
                  projectFile(sourceFile, info),
                  new TextUpdate({
                    position: removalRange.start,
                    end: removalRange.end,
                    toInsert: '',
                  }),
                ),
              );
            }
          }
        }

        // Property access expressions (guard.canLoad, route.canLoad, this.canLoad, etc.)
        if (ts.isPropertyAccessExpression(node) && node.name.text === 'canLoad') {
          if (
            isCanLoadReceiver(
              node.expression,
              typeChecker,
              guardClasses,
              guardObjects,
              guardMethods,
            )
          ) {
            replacements.push(
              new Replacement(
                projectFile(sourceFile, info),
                new TextUpdate({
                  position: node.name.getStart(),
                  end: node.name.getEnd(),
                  toInsert: 'canMatch',
                }),
              ),
            );
          }
        }

        // Element access expressions (guard['canLoad'])
        if (
          ts.isElementAccessExpression(node) &&
          ts.isStringLiteral(node.argumentExpression) &&
          node.argumentExpression.text === 'canLoad'
        ) {
          if (
            isCanLoadReceiver(
              node.expression,
              typeChecker,
              guardClasses,
              guardObjects,
              guardMethods,
            )
          ) {
            const raw = node.argumentExpression.getText();
            const quote = raw[0];
            replacements.push(
              new Replacement(
                projectFile(sourceFile, info),
                new TextUpdate({
                  position: node.argumentExpression.getStart(),
                  end: node.argumentExpression.getEnd(),
                  toInsert: `${quote}canMatch${quote}`,
                }),
              ),
            );
          }
        }

        // Spies: spyOn(guard, 'canLoad') / jest.spyOn(guard, 'canLoad')
        if (ts.isCallExpression(node) && isSpyOnCall(node)) {
          if (
            node.arguments.length >= 2 &&
            ts.isStringLiteral(node.arguments[1]) &&
            node.arguments[1].text === 'canLoad'
          ) {
            if (
              isCanLoadReceiver(
                node.arguments[0],
                typeChecker,
                guardClasses,
                guardObjects,
                guardMethods,
              )
            ) {
              const raw = node.arguments[1].getText();
              const quote = raw[0];
              replacements.push(
                new Replacement(
                  projectFile(sourceFile, info),
                  new TextUpdate({
                    position: node.arguments[1].getStart(),
                    end: node.arguments[1].getEnd(),
                    toInsert: `${quote}canMatch${quote}`,
                  }),
                ),
              );
            }
          }
        }

        // Type references: CanLoad / CanLoadFn
        if (ts.isTypeReferenceNode(node)) {
          if (ts.isIdentifier(node.typeName)) {
            if (node.typeName.text === 'CanLoad') {
              replacements.push(
                new Replacement(
                  projectFile(sourceFile, info),
                  new TextUpdate({
                    position: node.typeName.getStart(),
                    end: node.typeName.getEnd(),
                    toInsert: 'CanMatch',
                  }),
                ),
              );
            } else if (node.typeName.text === 'CanLoadFn') {
              replacements.push(
                new Replacement(
                  projectFile(sourceFile, info),
                  new TextUpdate({
                    position: node.typeName.getStart(),
                    end: node.typeName.getEnd(),
                    toInsert: 'CanMatchFn',
                  }),
                ),
              );
            }
          } else if (ts.isQualifiedName(node.typeName)) {
            if (node.typeName.right.text === 'CanLoad') {
              replacements.push(
                new Replacement(
                  projectFile(sourceFile, info),
                  new TextUpdate({
                    position: node.typeName.right.getStart(),
                    end: node.typeName.right.getEnd(),
                    toInsert: 'CanMatch',
                  }),
                ),
              );
            } else if (node.typeName.right.text === 'CanLoadFn') {
              replacements.push(
                new Replacement(
                  projectFile(sourceFile, info),
                  new TextUpdate({
                    position: node.typeName.right.getStart(),
                    end: node.typeName.right.getEnd(),
                    toInsert: 'CanMatchFn',
                  }),
                ),
              );
            }
          }
        }

        ts.forEachChild(node, walk);
      };

      ts.forEachChild(sourceFile, walk);
    }

    applyImportManagerChanges(importManager, replacements, sourceFiles, info);

    return confirmAsSerializable({replacements});
  }

  override async combine(
    unitA: UnitAnalysisMetadata,
    unitB: UnitAnalysisMetadata,
  ): Promise<Serializable<UnitAnalysisMetadata>> {
    return confirmAsSerializable({
      replacements: [...unitA.replacements, ...unitB.replacements],
    });
  }

  override async globalMeta(
    combinedData: UnitAnalysisMetadata,
  ): Promise<Serializable<UnitAnalysisMetadata>> {
    return confirmAsSerializable(combinedData);
  }

  override async stats(globalMetadata: UnitAnalysisMetadata): Promise<Serializable<unknown>> {
    return confirmAsSerializable({});
  }

  override async migrate(globalData: UnitAnalysisMetadata): Promise<{replacements: Replacement[]}> {
    return {replacements: globalData.replacements};
  }
}

function implementsInterface(decl: ts.ClassDeclaration, interfaceName: string): boolean {
  if (!decl.heritageClauses) return false;

  for (const clause of decl.heritageClauses) {
    if (clause.token === ts.SyntaxKind.ImplementsKeyword) {
      for (const expr of clause.types) {
        if (isIdentifierOrPropAccessNamed(expr.expression, interfaceName)) {
          return true;
        }
      }
    }
  }

  return false;
}

function extendsGuardClass(
  decl: ts.ClassDeclaration,
  typeChecker: ts.TypeChecker,
  guardClasses: Set<ts.ClassDeclaration>,
): boolean {
  if (!decl.heritageClauses) return false;

  for (const clause of decl.heritageClauses) {
    if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
      for (const expr of clause.types) {
        const symbol = typeChecker.getSymbolAtLocation(expr.expression);
        if (symbol && symbol.declarations) {
          for (const d of symbol.declarations) {
            if (ts.isClassDeclaration(d) && guardClasses.has(d)) {
              return true;
            }
          }
        }
      }
    }
  }

  return false;
}

function registerGuardElement(
  expr: ts.Expression,
  typeChecker: ts.TypeChecker,
  guardClasses: Set<ts.ClassDeclaration>,
  guardObjects: Set<ts.ObjectLiteralExpression>,
  guardMethods: Set<ts.MethodDeclaration | ts.PropertyDeclaration>,
) {
  if (ts.isIdentifier(expr)) {
    const symbol = typeChecker.getSymbolAtLocation(expr);
    if (symbol?.declarations) {
      for (const d of symbol.declarations) {
        if (ts.isClassDeclaration(d)) {
          guardClasses.add(d);
        } else if (
          ts.isVariableDeclaration(d) &&
          d.initializer &&
          ts.isObjectLiteralExpression(d.initializer)
        ) {
          guardObjects.add(d.initializer);
        }
      }
    }
  } else if (ts.isPropertyAccessExpression(expr) && expr.name.text === 'canLoad') {
    const symbol = typeChecker.getSymbolAtLocation(expr);
    if (symbol?.declarations) {
      for (const d of symbol.declarations) {
        if (ts.isMethodDeclaration(d) || ts.isPropertyDeclaration(d)) {
          guardMethods.add(d);
        }
      }
    }
    const receiverSymbol = typeChecker.getSymbolAtLocation(expr.expression);
    if (receiverSymbol?.declarations) {
      for (const d of receiverSymbol.declarations) {
        if (ts.isClassDeclaration(d)) {
          guardClasses.add(d);
        } else if (
          ts.isVariableDeclaration(d) &&
          d.initializer &&
          ts.isObjectLiteralExpression(d.initializer)
        ) {
          guardObjects.add(d.initializer);
        }
      }
    }
  }
}

function isIdentifierOrPropAccessNamed(expr: ts.Expression, name: string): boolean {
  if (ts.isIdentifier(expr)) {
    return expr.text === name;
  }
  if (ts.isPropertyAccessExpression(expr)) {
    return expr.name.text === name;
  }
  return false;
}

function getPropertyName(prop: ts.ObjectLiteralElementLike): string | null {
  if (prop.name) {
    if (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) {
      return prop.name.text;
    }
  }
  return null;
}

function findPropertyNamed(
  node: ts.ObjectLiteralExpression,
  name: string,
): ts.ObjectLiteralElementLike | undefined {
  return node.properties.find((prop) => getPropertyName(prop) === name);
}

function getPropertyRemovalRange(
  sourceFile: ts.SourceFile,
  prop: ts.ObjectLiteralElementLike,
): {start: number; end: number} {
  const text = sourceFile.text;
  let start = prop.getStart();
  let end = prop.getEnd();

  // Find trailing comma if any
  let index = end;
  while (
    index < text.length &&
    text[index] !== '\n' &&
    (text[index] === ' ' || text[index] === '\t')
  ) {
    index++;
  }
  if (index < text.length && text[index] === ',') {
    end = index + 1; // consume comma
    while (end < text.length && text[end] !== '\n' && (text[end] === ' ' || text[end] === '\t')) {
      end++;
    }
    if (end < text.length && (text[end] === '\r' || text[end] === '\n')) {
      if (text[end] === '\r' && end + 1 < text.length && text[end + 1] === '\n') {
        end += 2;
      } else {
        end += 1;
      }
      let lineStart = start - 1;
      while (lineStart >= 0 && (text[lineStart] === ' ' || text[lineStart] === '\t')) {
        lineStart--;
      }
      if (lineStart >= 0 && (text[lineStart] === '\n' || text[lineStart] === '\r')) {
        start = lineStart + 1;
      }
    }
  } else {
    // If no trailing comma, check for leading comma
    let leading = start - 1;
    while (
      leading >= 0 &&
      (text[leading] === ' ' ||
        text[leading] === '\t' ||
        text[leading] === '\n' ||
        text[leading] === '\r')
    ) {
      if (text[leading] === ',') {
        start = leading;
        break;
      }
      leading--;
    }
  }

  return {start, end};
}

function isCanLoadReceiver(
  expr: ts.Expression,
  typeChecker: ts.TypeChecker,
  guardClasses: Set<ts.ClassDeclaration>,
  guardObjects: Set<ts.ObjectLiteralExpression>,
  guardMethods: Set<ts.MethodDeclaration | ts.PropertyDeclaration>,
): boolean {
  // If expr is `this` inside a guard class
  if (expr.kind === ts.SyntaxKind.ThisKeyword) {
    let parent: ts.Node | undefined = expr.parent;
    while (parent && !ts.isClassDeclaration(parent)) {
      parent = parent.parent;
    }
    if (parent && guardClasses.has(parent)) {
      return true;
    }
  }

  // If expr is `super` inside a guard class or subclass
  if (expr.kind === ts.SyntaxKind.SuperKeyword) {
    let parent: ts.Node | undefined = expr.parent;
    while (parent && !ts.isClassDeclaration(parent)) {
      parent = parent.parent;
    }
    if (
      parent &&
      (guardClasses.has(parent) || extendsGuardClass(parent, typeChecker, guardClasses))
    ) {
      return true;
    }
  }

  if (isGuardInstantiationOrInjection(expr, typeChecker, guardClasses)) {
    return true;
  }

  const type = typeChecker.getTypeAtLocation(expr);
  if (isCanLoadTypeOrClass(type, typeChecker, guardClasses, guardObjects)) {
    return true;
  }

  // If untyped variable: check if expr is an identifier assigned to new GuardClass() or TestBed.inject(GuardClass)
  if (ts.isIdentifier(expr)) {
    const symbol = typeChecker.getSymbolAtLocation(expr);
    if (symbol?.valueDeclaration && ts.isVariableDeclaration(symbol.valueDeclaration)) {
      const init = symbol.valueDeclaration.initializer;
      if (init && isGuardInstantiationOrInjection(init, typeChecker, guardClasses)) {
        return true;
      }
    }
  }

  return false;
}

function isGuardInstantiationOrInjection(
  expr: ts.Expression,
  typeChecker: ts.TypeChecker,
  guardClasses: Set<ts.ClassDeclaration>,
): boolean {
  if (ts.isNewExpression(expr)) {
    const symbol = typeChecker.getSymbolAtLocation(expr.expression);
    if (symbol?.declarations?.some((d) => ts.isClassDeclaration(d) && guardClasses.has(d))) {
      return true;
    }
  }
  if (ts.isCallExpression(expr)) {
    if (expr.typeArguments) {
      for (const typeArg of expr.typeArguments) {
        if (ts.isTypeReferenceNode(typeArg)) {
          const type = typeChecker.getTypeAtLocation(typeArg);
          const symbol = type.getSymbol();
          if (symbol?.declarations?.some((d) => ts.isClassDeclaration(d) && guardClasses.has(d))) {
            return true;
          }
          if (symbol?.name === 'CanLoad' || symbol?.name === 'CanMatch') {
            return true;
          }
        }
      }
    }
    if (expr.arguments.length > 0) {
      const arg = expr.arguments[0];
      const symbol = typeChecker.getSymbolAtLocation(arg);
      if (symbol?.declarations?.some((d) => ts.isClassDeclaration(d) && guardClasses.has(d))) {
        return true;
      }
    }
  }
  return false;
}

function isCanLoadTypeOrClass(
  type: ts.Type,
  typeChecker: ts.TypeChecker,
  guardClasses: Set<ts.ClassDeclaration>,
  guardObjects: Set<ts.ObjectLiteralExpression>,
): boolean {
  if (type.isUnion()) {
    return type.types.some((t) => isCanLoadTypeOrClass(t, typeChecker, guardClasses, guardObjects));
  }
  if (type.isIntersection()) {
    return type.types.some((t) => isCanLoadTypeOrClass(t, typeChecker, guardClasses, guardObjects));
  }

  const symbol = type.getSymbol() || type.aliasSymbol;
  if (symbol) {
    if (symbol.name === 'CanLoad' || symbol.name === 'CanMatch' || symbol.name === 'Route') {
      return true;
    }

    if (symbol.declarations) {
      for (const d of symbol.declarations) {
        if (ts.isClassDeclaration(d)) {
          if (guardClasses.has(d)) return true;
          if (implementsInterface(d, 'CanLoad') || implementsInterface(d, 'CanMatch')) return true;
        }
        if (ts.isInterfaceDeclaration(d)) {
          if (d.name.text === 'CanLoad' || d.name.text === 'CanMatch' || d.name.text === 'Route')
            return true;
        }
        if (
          ts.isVariableDeclaration(d) &&
          d.initializer &&
          ts.isObjectLiteralExpression(d.initializer)
        ) {
          if (guardObjects.has(d.initializer)) return true;
        }
      }
    }
  }

  const baseTypes = type.getBaseTypes?.();
  if (baseTypes) {
    for (const base of baseTypes) {
      if (isCanLoadTypeOrClass(base, typeChecker, guardClasses, guardObjects)) {
        return true;
      }
    }
  }

  return false;
}

function isSpyOnCall(call: ts.CallExpression): boolean {
  if (ts.isIdentifier(call.expression)) {
    return call.expression.text === 'spyOn' || call.expression.text === 'spyOnProperty';
  }
  if (ts.isPropertyAccessExpression(call.expression)) {
    return call.expression.name.text === 'spyOn';
  }
  return false;
}
