/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  confirmAsSerializable,
  ProgramInfo,
  Replacement,
  Serializable,
  TsurgeFunnelMigration,
  TextUpdate,
  ProjectFile,
  projectFile,
} from '../../utils/tsurge';
import ts from 'typescript';
import {PartialEvaluator, Reference, ImportManager} from '@angular/compiler-cli/private/migrations';
import {TypeScriptReflectionHost} from '@angular/compiler-cli/src/ngtsc/reflection';
import {applyImportManagerChanges} from '../../utils/tsurge/helpers/apply_import_manager';
import {getAngularDecorators} from '@angular/compiler-cli/src/ngtsc/annotations';
import {findLiteralProperty} from '../../utils/typescript/property_name';
import {getRelativePath} from '../../utils/typescript/imports';

interface CompilationUnitData {
  replacements: Replacement[];
}

export class BootstrapOptionsMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    const replacements: Replacement[] = [];
    const checker = info.program.getTypeChecker();
    const reflector = new TypeScriptReflectionHost(checker);
    const evaluator = new PartialEvaluator(reflector, checker, null);
    const importManager = new ImportManager();

    for (const sourceFile of info.program.getSourceFiles()) {
      if (sourceFile.isDeclarationFile) {
        continue;
      }

      ts.forEachChild(sourceFile, function walk(node) {
        if (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          node.expression.name.text === 'bootstrapModule' &&
          node.arguments.length > 1
        ) {
          const optionsNode = node.arguments[1];
          if (!ts.isObjectLiteralExpression(optionsNode)) {
            return;
          }

          const options = evaluator.evaluate(optionsNode);
          if (!(options instanceof Map)) {
            return;
          }

          const moduleType = evaluator.evaluate(node.arguments[0]);

          if (!(moduleType instanceof Reference) || !ts.isClassDeclaration(moduleType.node)) {
            return;
          }

          const moduleClass = moduleType.node;
          const moduleSourceFile = moduleClass.getSourceFile();
          const moduleProjectFile = projectFile(moduleSourceFile, info);
          const ngModule = findNgModule(moduleClass, reflector);
          if (!ngModule) {
            return;
          }

          let hasExistingChangeDetectionProvider = false;
          const providersNode = findLiteralProperty(ngModule, 'providers');
          if (
            providersNode &&
            ts.isPropertyAssignment(providersNode) &&
            ts.isArrayLiteralExpression(providersNode.initializer)
          ) {
            for (const element of providersNode.initializer.elements) {
              if (ts.isCallExpression(element)) {
                const symbol = checker.getSymbolAtLocation(element.expression);
                if (
                  symbol &&
                  (symbol.name === 'provideZoneChangeDetection' ||
                    symbol.name === 'provideZonelessChangeDetection')
                ) {
                  hasExistingChangeDetectionProvider = true;
                  break;
                }
              }
            }
          }

          const providers: string[] = [];
          const ngZoneOption = options.get('ngZone');

          if (
            !hasExistingChangeDetectionProvider &&
            (options.has('ngZoneRunCoalescing') ||
              options.has('ngZoneEventCoalescing') ||
              options.has('ignoreChangesOutsideZone') ||
              (typeof ngZoneOption === 'string' && ngZoneOption === 'zone.js'))
          ) {
            importManager.addImport({
              exportModuleSpecifier: '@angular/core',
              exportSymbolName: 'provideZoneChangeDetection',
              requestedFile: moduleSourceFile,
            });
            const config: string[] = [];
            if (options.get('ngZoneRunCoalescing')) {
              config.push('runCoalescing: true');
            }
            if (options.get('ngZoneEventCoalescing')) {
              config.push('eventCoalescing: true');
            }
            if (options.get('ignoreChangesOutsideZone')) {
              config.push('ignoreChangesOutsideZone: true');
            }
            providers.push(
              `provideZoneChangeDetection(${config.length > 0 ? `{ ${config.join(', ')} }` : ''})`,
            );
          }

          if (ngZoneOption instanceof Reference) {
            importManager.addImport({
              exportModuleSpecifier: '@angular/core',
              exportSymbolName: 'NgZone',
              requestedFile: moduleSourceFile,
            });
            const clazz = ngZoneOption.node;
            if (ts.isClassDeclaration(clazz) && clazz.name) {
              const customZoneSourceFile = clazz.getSourceFile();
              const exportModuleSpecifier =
                ngZoneOption.bestGuessOwningModule?.specifier ??
                getRelativePath(moduleSourceFile.fileName, customZoneSourceFile.fileName);
              importManager.addImport({
                exportModuleSpecifier,
                exportSymbolName: clazz.name.text,
                requestedFile: moduleSourceFile,
              });

              providers.push(`{provide: NgZone, useClass: ${clazz.name.text}}`);
            }
          } else if (typeof ngZoneOption === 'string' && ngZoneOption === 'noop') {
            importManager.addImport({
              exportModuleSpecifier: '@angular/core',
              exportSymbolName: 'NgZone',
              requestedFile: moduleSourceFile,
            });
            importManager.addImport({
              exportModuleSpecifier: '@angular/core',
              exportSymbolName: 'ɵNoopNgZone',
              requestedFile: moduleSourceFile,
            });
            providers.push(`{provide: NgZone, useClass: ɵNoopNgZone}`);
          }

          if (providers.length > 0) {
            addProvidersToNgModule(
              moduleProjectFile,
              ngModule,
              providers.join(',\n'),
              replacements,
            );
          }

          // Remove the options argument
          replacements.push(
            new Replacement(
              projectFile(sourceFile, info),
              new TextUpdate({
                position: node.arguments[0].getEnd(),
                end: node.getEnd() - 1,
                toInsert: '',
              }),
            ),
          );
        }
        ts.forEachChild(node, walk);
      });
    }
    applyImportManagerChanges(importManager, replacements, info.sourceFiles, info);
    return confirmAsSerializable({replacements});
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    return confirmAsSerializable({
      replacements: [...unitA.replacements, ...unitB.replacements],
    });
  }

  override async globalMeta(data: CompilationUnitData): Promise<Serializable<CompilationUnitData>> {
    return confirmAsSerializable(data);
  }

  override async stats(data: CompilationUnitData) {
    return confirmAsSerializable({});
  }

  override async migrate(data: CompilationUnitData) {
    return {replacements: data.replacements};
  }
}

function addProvidersToNgModule(
  projectFile: ProjectFile,
  ngModule: ts.ObjectLiteralExpression,
  providersText: string,
  replacements: Replacement[],
) {
  const providersNode = findLiteralProperty(ngModule, 'providers');
  if (providersNode && ts.isPropertyAssignment(providersNode)) {
    if (ts.isArrayLiteralExpression(providersNode.initializer)) {
      const initializer = providersNode.initializer;
      const text = `${providersText},`;
      replacements.push(
        new Replacement(
          projectFile,
          new TextUpdate({
            position: initializer.elements[0]?.getStart() ?? initializer.getEnd() - 1,
            end: initializer.elements[0]?.getStart() ?? initializer.getEnd() - 1,
            toInsert: text,
          }),
        ),
      );
    } else if (ts.isIdentifier(providersNode.initializer)) {
      const newProviders = `[${providersText}, ...${providersNode.initializer.text}]`;
      replacements.push(
        new Replacement(
          projectFile,
          new TextUpdate({
            position: providersNode.initializer.getStart(),
            end: providersNode.initializer.getEnd(),
            toInsert: newProviders,
          }),
        ),
      );
    }
  } else {
    const bootstrapNode = findLiteralProperty(ngModule, 'bootstrap');
    if (bootstrapNode) {
      const text = `providers: [${providersText}]`;
      const toInsert = `\n  ${text},\n`;
      replacements.push(
        new Replacement(
          projectFile,
          new TextUpdate({
            position: bootstrapNode.getStart(),
            end: bootstrapNode.getStart(),
            toInsert,
          }),
        ),
      );
    }
  }
}

function findNgModule(
  node: ts.ClassDeclaration,
  reflector: TypeScriptReflectionHost,
): ts.ObjectLiteralExpression | null {
  const decorators = reflector.getDecoratorsOfDeclaration(node);
  if (decorators) {
    const ngModuleDecorator = getAngularDecorators(decorators, ['NgModule'], true)[0];
    if (
      ngModuleDecorator &&
      ngModuleDecorator.args &&
      ngModuleDecorator.args.length > 0 &&
      ts.isObjectLiteralExpression(ngModuleDecorator.args[0])
    ) {
      return ngModuleDecorator.args[0];
    }
  }
  return null;
}
