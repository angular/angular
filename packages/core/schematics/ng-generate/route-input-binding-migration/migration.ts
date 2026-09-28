/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';
import {ImportManager} from '@angular/compiler-cli/private/migrations';
import {
  confirmAsSerializable,
  ProgramInfo,
  projectFile,
  Replacement,
  Serializable,
  TextUpdate,
  TsurgeComplexMigration,
} from '../../utils/tsurge';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';
import {getImportSpecifier} from '../../utils/typescript/imports';
import {
  ActivatedRouteMember,
  analyzeComponentClass,
  analyzeRouterSetup,
  analyzeRoutes,
  analyzeExcludedComponents,
  getComponentId,
  getReadKey,
  isComponentClass,
  isTestFile,
  parseReadKey,
  RouteRead,
} from './analysis';
import {
  CompilationUnitData,
  ComponentID,
  GlobalMetadata,
  MigrationConfig,
  RouteReadKey,
} from './types';

/**
 * Migration that replaces reads of path and query parameters from an injected
 * `ActivatedRoute` snapshot with signal inputs, in apps that bind route
 * information to component inputs via `withComponentInputBinding`.
 */
export class RouteInputBindingMigration extends TsurgeComplexMigration<
  CompilationUnitData,
  GlobalMetadata
> {
  constructor(private readonly config: MigrationConfig = {}) {
    super();
  }

  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const checker = info.program.getTypeChecker();
    const data: CompilationUnitData = {
      routerSetup: {withBinding: 0, withoutBinding: 0, queryParamsNotBound: 0},
      routedComponents: {},
      excludedComponents: {},
      candidates: {},
    };

    for (const sf of info.sourceFiles) {
      if (!isTestFile(sf)) {
        analyzeRouterSetup(sf, checker, data.routerSetup);
        analyzeRoutes(sf, info, checker, data.routedComponents);
      }
      analyzeExcludedComponents(sf, info, checker, data.excludedComponents);

      const file = projectFile(sf, info);
      if (this.config.shouldMigrate && !this.config.shouldMigrate(file)) {
        continue;
      }

      forEachComponentClass(sf, checker, (node) => {
        const id = getComponentId(node, info);
        const analysis = analyzeComponentClass(node, checker);
        if (id === null || analysis === null) {
          return;
        }
        const reads = new Set(
          analysis.members.flatMap((m) => m.reads.map((r) => getReadKey(r.source, r.key))),
        );
        if (reads.size > 0) {
          data.candidates[id] = {file, reads: Array.from(reads)};
        }
      });
    }

    return confirmAsSerializable(data);
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    const routedComponents = {...unitA.routedComponents};
    for (const [id, routes] of Object.entries(unitB.routedComponents)) {
      routedComponents[id as ComponentID] = [
        ...(routedComponents[id as ComponentID] ?? []),
        ...routes,
      ];
    }

    return confirmAsSerializable({
      routerSetup: {
        withBinding: unitA.routerSetup.withBinding + unitB.routerSetup.withBinding,
        withoutBinding: unitA.routerSetup.withoutBinding + unitB.routerSetup.withoutBinding,
        queryParamsNotBound:
          unitA.routerSetup.queryParamsNotBound + unitB.routerSetup.queryParamsNotBound,
      },
      routedComponents,
      excludedComponents: {
        ...unitA.excludedComponents,
        ...unitB.excludedComponents,
      },
      candidates: {...unitA.candidates, ...unitB.candidates},
    });
  }

  override async globalMeta(
    combinedData: CompilationUnitData,
  ): Promise<Serializable<GlobalMetadata>> {
    const {routerSetup, routedComponents, excludedComponents, candidates} = combinedData;

    // Only migrate if every router in the project binds route information to inputs.
    // Otherwise, components might end up in an app where their inputs aren't set.
    const bindingEnabled = routerSetup.withBinding > 0 && routerSetup.withoutBinding === 0;
    const queryParamsBound = routerSetup.queryParamsNotBound === 0;
    const approved: GlobalMetadata['approved'] = {};
    let candidateReads = 0;

    for (const [id, candidate] of Object.entries(candidates)) {
      candidateReads += candidate.reads.length;

      const routes = routedComponents[id as ComponentID];
      if (!bindingEnabled || routes === undefined || excludedComponents[id as ComponentID]) {
        continue;
      }
      // Data keys take precedence over params when binding inputs, so collisions
      // can't be ruled out if the data of any route is unknown.
      if (routes.some((r) => r.dataKeys === null)) {
        continue;
      }

      const approvedReads: GlobalMetadata['approved'][ComponentID] = {};

      for (const readKey of candidate.reads) {
        const {source, key} = parseReadKey(readKey);
        const hasDataCollision = routes.some((r) => r.dataKeys!.includes(key));

        if (source === 'params') {
          const required = routes.every((r) => r.pathParams.includes(key));
          // If a param isn't guaranteed to be in the path, a query param with
          // the same name would be bound to the input instead.
          if (!hasDataCollision && (required || !queryParamsBound)) {
            approvedReads[readKey] = {required};
          }
        } else if (
          queryParamsBound &&
          !hasDataCollision &&
          !routes.some((r) => r.pathParams.includes(key))
        ) {
          approvedReads[readKey] = {required: false};
        }
      }

      if (Object.keys(approvedReads).length > 0) {
        approved[id as ComponentID] = approvedReads;
      }
    }

    return confirmAsSerializable({
      bindingEnabled,
      routerSetup,
      approved,
      candidateComponents: Object.keys(candidates).length,
      candidateReads,
    });
  }

  override async migrate(globalMetadata: GlobalMetadata, info: ProgramInfo) {
    const checker = info.program.getTypeChecker();
    const replacements: Replacement[] = [];
    const importManager = new ImportManager();
    const printer = ts.createPrinter();

    for (const sf of info.sourceFiles) {
      const file = projectFile(sf, info);
      if (this.config.shouldMigrate && !this.config.shouldMigrate(file)) {
        continue;
      }

      const removedMembers: ActivatedRouteMember[] = [];

      forEachComponentClass(sf, checker, (node) => {
        const id = getComponentId(node, info);
        const approvedReads = id !== null ? globalMetadata.approved[id] : undefined;
        const analysis = approvedReads ? analyzeComponentClass(node, checker) : null;
        if (analysis === null || approvedReads === undefined) {
          return;
        }

        const inputRef = importManager.addImport({
          exportSymbolName: 'input',
          exportModuleSpecifier: '@angular/core',
          requestedFile: sf,
        });
        const inputFn = printer.printNode(ts.EmitHint.Expression, inputRef, sf);
        const inputsToAdd = new Map<RouteReadKey, string>();
        const updates: TextUpdate[] = [];

        for (const member of analysis.members) {
          let migratedAllReads = !member.hasOtherUsages;

          for (const read of member.reads) {
            const readKey = getReadKey(read.source, read.key);
            const approval = approvedReads[readKey];
            if (approval === undefined) {
              migratedAllReads = false;
              continue;
            }
            const name = analysis.inputNames.get(readKey)!;
            inputsToAdd.set(readKey, getInputDeclaration(name, read.key, approval, inputFn));
            updates.push(replaceRead(read, name, approval.required));
          }

          if (migratedAllReads && member.isPrivate && member.reads.length > 0) {
            removedMembers.push(member);
          }
        }

        updates.push(
          ...insertInputs(
            node,
            Array.from(inputsToAdd.values()),
            removedMembers.filter((m) => m.node.parent === node),
          ),
        );
        updates.push(...removeConstructorParameters(node, removedMembers));
        replacements.push(...updates.map((update) => new Replacement(file, update)));
      });

      if (removedMembers.length > 0) {
        removeUnusedImports(sf, removedMembers, importManager);
      }
    }

    applyImportManagerChanges(importManager, replacements, info.sourceFiles, info);
    return {replacements};
  }

  override async stats(globalMetadata: GlobalMetadata) {
    const approvedComponents = Object.values(globalMetadata.approved);
    const stats = {
      counters: {
        bindingEnabled: globalMetadata.bindingEnabled ? 1 : 0,
        routerSetupsWithoutBinding: globalMetadata.routerSetup.withoutBinding,
        candidateComponents: globalMetadata.candidateComponents,
        candidateReads: globalMetadata.candidateReads,
        migratedComponents: approvedComponents.length,
        migratedReads: approvedComponents.reduce((acc, c) => acc + Object.keys(c).length, 0),
      },
    };
    return stats as Serializable<typeof stats>;
  }
}

function forEachComponentClass(
  sf: ts.SourceFile,
  checker: ts.TypeChecker,
  callback: (node: ts.ClassDeclaration) => void,
) {
  const visit = (node: ts.Node) => {
    if (ts.isClassDeclaration(node) && isComponentClass(node, checker)) {
      callback(node);
    }
    ts.forEachChild(node, visit);
  };
  ts.forEachChild(sf, visit);
}

function getInputDeclaration(
  name: string,
  key: string,
  {required}: {required: boolean},
  inputFn: string,
): string {
  const alias = name !== key ? `{alias: '${key.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'}` : '';
  if (required) {
    return `readonly ${name} = ${inputFn}.required<string>(${alias});`;
  }
  return `readonly ${name} = ${inputFn}<string>(${alias ? `undefined, ${alias}` : ''});`;
}

/** Replaces a route read with a call to the corresponding input. */
function replaceRead(read: RouteRead, name: string, required: boolean): TextUpdate {
  let replacement = `this.${name}()`;

  // `ParamMap.get` returns `null` for missing values, while inputs are `undefined`.
  if (read.isMapGet && !required) {
    replacement = `${replacement} ?? null`;
    if (needsParentheses(read.node)) {
      replacement = `(${replacement})`;
    }
  }

  return new TextUpdate({
    position: read.node.getStart(),
    end: read.node.getEnd(),
    toInsert: replacement,
  });
}

/** Whether a nullish coalescing expression replacing the node needs to be parenthesized. */
function needsParentheses(node: ts.Expression): boolean {
  const parent = node.parent;
  return !(
    (ts.isVariableDeclaration(parent) && parent.initializer === node) ||
    (ts.isCallExpression(parent) && parent.arguments.includes(node)) ||
    (ts.isPropertyAssignment(parent) && parent.initializer === node) ||
    (ts.isBinaryExpression(parent) &&
      parent.right === node &&
      parent.operatorToken.kind === ts.SyntaxKind.EqualsToken) ||
    ts.isReturnStatement(parent) ||
    ts.isParenthesizedExpression(parent) ||
    ts.isExpressionStatement(parent) ||
    ts.isArrowFunction(parent)
  );
}

/**
 * Inserts the input declarations. If a removed field holds the `ActivatedRoute`,
 * the inputs replace it. Otherwise they're added before the first class member.
 */
function insertInputs(
  node: ts.ClassDeclaration,
  declarations: string[],
  removedFields: ActivatedRouteMember[],
): TextUpdate[] {
  const updates: TextUpdate[] = [];
  const sf = node.getSourceFile();
  const [anchorField, ...otherFields] = removedFields;

  for (const field of otherFields) {
    updates.push(new TextUpdate({...getLineRange(field.node), toInsert: ''}));
  }

  const anchor = anchorField?.node ?? node.members[0];
  if (declarations.length === 0 || anchor === undefined) {
    if (anchorField !== undefined) {
      updates.push(new TextUpdate({...getLineRange(anchorField.node), toInsert: ''}));
    }
    return updates;
  }

  const lineStart = getLineStart(sf, anchor.getStart());
  const indent = sf.text.slice(lineStart, anchor.getStart());

  // Fall back to inserting inline if the member doesn't start on its own line.
  if (indent.trim() !== '') {
    updates.push(
      new TextUpdate({
        position: anchor.getStart(),
        end: anchorField !== undefined ? anchor.getEnd() : anchor.getStart(),
        toInsert: declarations.join(' ') + (anchorField !== undefined ? '' : ' '),
      }),
    );
    return updates;
  }

  const lines = declarations.map((d) => `${indent}${d}\n`).join('');
  if (anchorField !== undefined) {
    updates.push(new TextUpdate({...getLineRange(anchorField.node), toInsert: lines}));
  } else {
    updates.push(new TextUpdate({position: lineStart, end: lineStart, toInsert: `${lines}\n`}));
  }
  return updates;
}

/** Removes constructor parameter properties, and the constructor itself if it's left empty. */
function removeConstructorParameters(
  node: ts.ClassDeclaration,
  removedMembers: ActivatedRouteMember[],
): TextUpdate[] {
  const ctor = node.members.find(ts.isConstructorDeclaration);
  const removedParams = new Set<ts.Node>(removedMembers.map((m) => m.node));
  if (ctor === undefined || !ctor.parameters.some((p) => removedParams.has(p))) {
    return [];
  }

  const params = ctor.parameters;
  const remaining = params.filter((p) => !removedParams.has(p));

  if (remaining.length === 0) {
    const isEmpty =
      ctor.body !== undefined &&
      ctor.body.statements.length === 0 &&
      ts.getModifiers(ctor) === undefined &&
      !/\/[/*]/.test(ctor.body.getText());
    if (isEmpty) {
      return [new TextUpdate({...getLineRange(ctor), toInsert: ''})];
    }
    return [new TextUpdate({position: params.pos, end: params.end, toInsert: ''})];
  }

  const updates: TextUpdate[] = [];
  params.forEach((param, index) => {
    if (!removedParams.has(param)) {
      return;
    }
    const next = params[index + 1];
    updates.push(
      next !== undefined
        ? new TextUpdate({position: param.getStart(), end: next.getStart(), toInsert: ''})
        : new TextUpdate({position: params[index - 1].getEnd(), end: param.getEnd(), toInsert: ''}),
    );
  });
  return updates;
}

/** Removes the `ActivatedRoute` and `inject` imports if they're no longer used in the file. */
function removeUnusedImports(
  sf: ts.SourceFile,
  removedMembers: ActivatedRouteMember[],
  importManager: ImportManager,
) {
  const removedNodes = new Set<ts.Node>(removedMembers.map((m) => m.node));
  const candidates: [string, string][] = [['ActivatedRoute', '@angular/router']];
  if (removedMembers.some((m) => m.usesInjectFunction)) {
    candidates.push(['inject', '@angular/core']);
  }

  for (const [name, moduleName] of candidates) {
    const specifier = getImportSpecifier(sf, moduleName, name);
    if (specifier === null) {
      continue;
    }
    const localName = specifier.name.text;
    let isUsed = false;

    const visit = (node: ts.Node) => {
      if (isUsed || ts.isImportDeclaration(node) || removedNodes.has(node)) {
        return;
      }
      if (ts.isIdentifier(node) && node.text === localName) {
        isUsed = true;
        return;
      }
      ts.forEachChild(node, visit);
    };
    ts.forEachChild(sf, visit);

    if (!isUsed) {
      importManager.removeImport(sf, name, moduleName);
    }
  }
}

function getLineStart(sf: ts.SourceFile, position: number): number {
  const {line} = sf.getLineAndCharacterOfPosition(position);
  return sf.getPositionOfLineAndCharacter(line, 0);
}

/**
 * Gets the range of a node including its indentation and trailing line
 * break, if the node is the only content on its lines.
 */
function getLineRange(node: ts.Node): {position: number; end: number} {
  const sf = node.getSourceFile();
  const lineStart = getLineStart(sf, node.getStart());
  const lineEnd = sf.text.indexOf('\n', node.getEnd());
  const endOfLine = lineEnd === -1 ? sf.text.length : lineEnd + 1;

  if (
    sf.text.slice(lineStart, node.getStart()).trim() === '' &&
    sf.text.slice(node.getEnd(), endOfLine).trim() === ''
  ) {
    return {position: lineStart, end: endOfLine};
  }
  return {position: node.getStart(), end: node.getEnd()};
}
