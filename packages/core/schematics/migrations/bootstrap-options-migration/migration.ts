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
import {getImportSpecifier, getRelativePath} from '../../utils/typescript/imports';
import {isReferenceToImport} from '../../utils/typescript/symbol';

interface CompilationUnitData {
  replacements: Replacement[];
}

const CORE_PACKAGE = '@angular/core';
const PROVIDE_ZONE_CHANGE_DETECTION = 'provideZoneChangeDetection';
const ZONE_CD_PROVIDER = `${PROVIDE_ZONE_CHANGE_DETECTION}()`;

export class BootstrapOptionsMigration extends TsurgeFunnelMigration<
  CompilationUnitData,
  CompilationUnitData
> {
  override async analyze(info: ProgramInfo): Promise<Serializable<CompilationUnitData>> {
    let replacements: Replacement[] = [];
    const importManager = new ImportManager();

    for (const sourceFile of info.sourceFiles) {
      // We need to migration either
      // * `bootstrapApplication(App)
      // * `platformBrowser().bootstrapModule(AppModule)`
      // * `platformBrowserDynamic().bootstrapModule(AppModule)`
      // * `TestBed.initTestEnvironment([AppModule], platformBrowserTesting())`
      // * `getTestBed.initTestEnvironment([AppModule], platformBrowserTesting())`

      const specifiers = getSpecifiers(sourceFile);
      // If none of the imports related to bootstraping are present, we can skip the file.
      if (specifiers === null) continue;

      const {
        bootstrapAppSpecifier,
        platformBrowserDynamicSpecifier,
        platformBrowserSpecifier,
        testBedSpecifier,
        createApplicationSpecifier,
        getTestBedSpecifier,
      } = specifiers;

      const typeChecker = info.program.getTypeChecker();

      const isCreateApplicationNode = (node: ts.Node): node is ts.CallExpression => {
        return (
          ts.isCallExpression(node) &&
          createApplicationSpecifier !== null &&
          isReferenceToImport(typeChecker, node.expression, createApplicationSpecifier)
        );
      };

      const isBootstrapAppNode = (node: ts.Node): node is ts.CallExpression => {
        return (
          ts.isCallExpression(node) &&
          bootstrapAppSpecifier !== null &&
          isReferenceToImport(typeChecker, node.expression, bootstrapAppSpecifier)
        );
      };
      const isBootstrapModuleNode = (node: ts.Node): node is ts.CallExpression => {
        return (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          node.expression.name.text === 'bootstrapModule' &&
          ts.isCallExpression(node.expression.expression) &&
          (isReferenceToImport(
            typeChecker,
            node.expression.expression.expression,
            platformBrowserSpecifier,
          ) ||
            isReferenceToImport(
              typeChecker,
              node.expression.expression.expression,
              platformBrowserDynamicSpecifier,
            ))
        );
      };
      const isTestBedInitEnvironmentNode = (node: ts.Node): node is ts.CallExpression => {
        return (
          ts.isCallExpression(node) &&
          ts.isPropertyAccessExpression(node.expression) &&
          node.expression.name.text === 'initTestEnvironment' &&
          (isReferenceToImport(typeChecker, node.expression.expression, testBedSpecifier) ||
            isReferenceToImport(typeChecker, node.expression.expression, getTestBedSpecifier))
        );
      };

      const reflector = new TypeScriptReflectionHost(typeChecker);
      const evaluator = new PartialEvaluator(reflector, typeChecker, null);

      const walk = (node: ts.Node): void => {
        if (isBootstrapAppNode(node)) {
          this.analyzeBootstrapApplication(
            node,
            sourceFile,
            info,
            typeChecker,
            importManager,
            replacements,
          );
        } else if (isCreateApplicationNode(node)) {
          this.analyzeCreateApplication(
            node,
            sourceFile,
            info,
            typeChecker,
            importManager,
            replacements,
          );
        } else if (isBootstrapModuleNode(node)) {
          this.analyzeBootstrapModule(
            node,
            sourceFile,
            reflector,
            evaluator,
            info,
            typeChecker,
            importManager,
            replacements,
          );
        } else if (isTestBedInitEnvironmentNode(node)) {
          this.analyzeTestBedInitEnvironment(
            node,
            sourceFile,
            info,
            typeChecker,
            importManager,
            replacements,
          );
        }
        node.forEachChild(walk);
      };
      sourceFile.forEachChild(walk);
    }

    // The combine method might not run when there is a single target.
    // So we deduplicate here
    replacements = deduplicateReplacements(replacements);

    applyImportManagerChanges(importManager, replacements, info.sourceFiles, info);
    return confirmAsSerializable({replacements});
  }

  override async combine(
    unitA: CompilationUnitData,
    unitB: CompilationUnitData,
  ): Promise<Serializable<CompilationUnitData>> {
    const combined = [...unitA.replacements, ...unitB.replacements];
    return confirmAsSerializable({replacements: deduplicateReplacements(combined)});
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

  private analyzeBootstrapApplication(
    node: ts.CallExpression,
    sourceFile: ts.SourceFile,
    info: ProgramInfo,
    typeChecker: ts.TypeChecker,
    importManager: ImportManager,
    replacements: Replacement[],
  ) {
    const hasExistingChangeDetectionProvider = hasChangeDetectionProvider(node, typeChecker);
    if (hasExistingChangeDetectionProvider) return;

    const providerFn = 'provideZoneChangeDetection()';
    const optionsNode = node.arguments[1];
    const currentProjectFile = projectFile(sourceFile, info);

    if (optionsNode) {
      let optionProjectFile = currentProjectFile;
      let optionLiteral: ts.ObjectLiteralExpression | undefined;
      if (ts.isObjectLiteralExpression(optionsNode)) {
        optionLiteral = optionsNode;
        addProvidersToBootstrapOption(optionProjectFile, optionLiteral, providerFn, replacements);
      } else if (ts.isIdentifier(optionsNode)) {
        // This case handled both `bootstrapApplication(App, appConfig)` and the server () => bootstrapApplication(App, appConfig)
        // where appConfig is the result of a `mergeApplicationConfig` call.

        // This is tricky case to handle, in G3 we're might not be able to resolve the identifier's value
        // Our best alternative is to assume there is not CD providers set and add the ZoneChangeDetection provider
        // In the cases where it is, we'll just override the zone provider we just set by re-used inthe appConfig providers

        // TODO: Should we insert a TODO to clean this up ?
        const text = `{...${optionsNode.getText()}, providers: [${providerFn}, ...${optionsNode.getText()}.providers]}`;
        replacements.push(
          new Replacement(
            currentProjectFile,
            new TextUpdate({
              position: optionsNode.getStart(),
              end: optionsNode.getEnd(),
              toInsert: text,
            }),
          ),
        );
      } else {
        throw new Error('unsupported optionsNode: ' + optionsNode.getText());
      }
    } else {
      // No options object, add it.
      const text = `, {providers: [${providerFn}]}`;
      const component = node.arguments[0];
      replacements.push(
        new Replacement(
          currentProjectFile,
          new TextUpdate({position: component.getEnd(), end: component.getEnd(), toInsert: text}),
        ),
      );
    }

    importManager.addImport({
      exportModuleSpecifier: CORE_PACKAGE,
      exportSymbolName: 'provideZoneChangeDetection',
      requestedFile: sourceFile,
    });
  }

  private analyzeCreateApplication(
    node: ts.CallExpression,
    sourceFile: ts.SourceFile,
    info: ProgramInfo,
    typeChecker: ts.TypeChecker,
    importManager: ImportManager,
    replacements: Replacement[],
  ) {
    const hasExistingChangeDetectionProvider = hasChangeDetectionProvider(node, typeChecker);
    if (hasExistingChangeDetectionProvider) return;

    const providerFn = 'provideZoneChangeDetection()';
    const optionsNode = node.arguments[0];
    const currentProjectFile = projectFile(sourceFile, info);

    if (optionsNode) {
      let optionProjectFile = currentProjectFile;
      let optionLiteral: ts.ObjectLiteralExpression | undefined;
      if (ts.isObjectLiteralExpression(optionsNode)) {
        optionLiteral = optionsNode;
        addProvidersToBootstrapOption(optionProjectFile, optionLiteral, providerFn, replacements);
      } else if (
        ts.isIdentifier(optionsNode) ||
        ts.isCallExpression(optionsNode) ||
        ts.isPropertyAccessExpression(optionsNode)
      ) {
        // This is tricky case to handle, in G3 we're might not be able to resolve the identifier's value
        // Our best alternative is to assume there is no CD providers set and add the ZoneChangeDetection provider
        // In the cases where it is, we'll just override the zone provider we just set by re-used inthe appConfig providers

        // TODO: Should we insert a TODO to clean this up ?
        const text = `{...${optionsNode.getText()}, providers: [${providerFn}, ...${optionsNode.getText()}.providers]}`;
        replacements.push(
          new Replacement(
            currentProjectFile,
            new TextUpdate({
              position: optionsNode.getStart(),
              end: optionsNode.getEnd(),
              toInsert: text,
            }),
          ),
        );
      } else {
        throw new Error('unsupported optionsNode: ' + optionsNode.getText());
      }
    } else {
      // No options object, add it.
      const text = `{providers: [${providerFn}]}`;
      replacements.push(
        new Replacement(
          currentProjectFile,
          new TextUpdate({
            position: node.expression.getEnd() + 1,
            end: node.expression.getEnd() + 1,
            toInsert: text,
          }),
        ),
      );
    }

    importManager.addImport({
      exportModuleSpecifier: CORE_PACKAGE,
      exportSymbolName: 'provideZoneChangeDetection',
      requestedFile: sourceFile,
    });
  }

  private analyzeBootstrapModule(
    node: ts.CallExpression,
    sourceFile: ts.SourceFile,
    reflector: TypeScriptReflectionHost,
    evaluator: PartialEvaluator,
    info: ProgramInfo,
    typeChecker: ts.TypeChecker,
    importManager: ImportManager,
    replacements: Replacement[],
  ) {
    const moduleIdentifier = node.arguments[0];
    const moduleType = evaluator.evaluate(moduleIdentifier);

    if (!(moduleType instanceof Reference) || !ts.isClassDeclaration(moduleType.node)) {
      return;
    }

    const moduleClass = moduleType.node;
    const ngModule = findNgModule(moduleClass, reflector);
    if (!ngModule) {
      return;
    }

    const moduleSourceFile = moduleClass.getSourceFile();
    const moduleProjectFile = projectFile(moduleSourceFile, info);

    if (moduleSourceFile.getText().includes('ZoneChangeDetectionModule')) {
      // If the file already contains the ZoneChangeDetectionModule, we can skip it.
      return;
    }

    // Always remove the options argument
    replacements.push(
      new Replacement(
        projectFile(sourceFile, info),
        new TextUpdate({position: moduleIdentifier.getEnd(), end: node.getEnd() - 1, toInsert: ''}),
      ),
    );

    const hasExistingChangeDetectionProvider = hasChangeDetectionProvider(ngModule, typeChecker);
    if (hasExistingChangeDetectionProvider) {
      return;
    }

    // Let's try to understand the bootstrap options.
    const optionsNode = node.arguments[1];
    const options =
      optionsNode && ts.isObjectLiteralExpression(optionsNode)
        ? evaluator.evaluate(optionsNode)
        : null;

    let zoneCdProvider = ZONE_CD_PROVIDER;
    let zoneInstanceProvider: string | null = null;

    if (options instanceof Map) {
      const ngZoneOption = options.get('ngZone');
      if (options.has('ngZoneRunCoalescing') || options.has('ngZoneEventCoalescing')) {
        const config: string[] = [];
        if (options.get('ngZoneRunCoalescing')) {
          config.push('runCoalescing: true');
        }
        if (options.get('ngZoneEventCoalescing')) {
          config.push('eventCoalescing: true');
        }
        zoneCdProvider = `${PROVIDE_ZONE_CHANGE_DETECTION}(${config.length > 0 ? `{ ${config.join(', ')} }` : ''})`;
      }

      if (ngZoneOption instanceof Reference) {
        importManager.addImport({
          exportModuleSpecifier: CORE_PACKAGE,
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

          zoneInstanceProvider = `{provide: NgZone, useClass: ${clazz.name.text}}`;
        }
      } else if (typeof ngZoneOption === 'string' && ngZoneOption === 'noop') {
        return;
      } else if (ngZoneOption && typeof ngZoneOption !== 'string') {
        // This is a case where we're not able to migrate automatically
        // The migration fails gracefully, keeps the ngZone option and adds a TODO.
        let ngZoneValue: string | undefined;
        (optionsNode as ts.ObjectLiteralExpression).properties.forEach((p) => {
          if (ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === 'ngZone') {
            ngZoneValue = p.initializer.getText();
          } else if (ts.isShorthandPropertyAssignment(p) && p.name.text === 'ngZone') {
            ngZoneValue = p.name.text;
          }
        });
        if (ngZoneValue) {
          // We re-add the ngZone option
          replacements.push(
            new Replacement(
              projectFile(sourceFile, info),
              new TextUpdate({
                position: moduleIdentifier.getEnd(),
                end: node.getEnd() - 1,
                toInsert: `, {ngZone: ${ngZoneValue}}`,
              }),
            ),
          );
        }

        // And add the TODO
        replacements.push(
          new Replacement(
            projectFile(sourceFile, info),
            new TextUpdate({
              position: node.getStart() - 1,
              end: node.getStart() - 1,
              toInsert:
                '// TODO: BootstrapOptions are deprecated & ignored. Configure NgZone in the providers array of the application module instead.',
            }),
          ),
        );
      }
    }

    const providers = [zoneCdProvider];
    if (zoneInstanceProvider) {
      providers.push(zoneInstanceProvider);
    }

    if (providers.length > 0) {
      importManager.addImport({
        exportModuleSpecifier: CORE_PACKAGE,
        exportSymbolName: PROVIDE_ZONE_CHANGE_DETECTION,
        requestedFile: moduleSourceFile,
      });

      addProvidersToNgModule(
        moduleProjectFile,
        moduleSourceFile,
        ngModule,
        providers.join(',\n'),
        replacements,
      );
    }
  }

  private analyzeTestBedInitEnvironment(
    callExpr: ts.CallExpression,
    sourceFile: ts.SourceFile,
    info: ProgramInfo,
    typeChecker: ts.TypeChecker,
    importManager: ImportManager,
    replacements: Replacement[],
  ) {
    const hasExistingChangeDetectionProvider = hasChangeDetectionProvider(callExpr, typeChecker);
    if (hasExistingChangeDetectionProvider) return;

    const ngModules = callExpr.arguments[0];

    const moduleProjectFile = projectFile(sourceFile, info);

    importManager.addImport({
      exportModuleSpecifier: CORE_PACKAGE,
      exportSymbolName: PROVIDE_ZONE_CHANGE_DETECTION,
      requestedFile: sourceFile,
    });

    let tmpNode: ts.Node = callExpr;
    let insertPosition = 0;
    while (tmpNode.parent.kind !== ts.SyntaxKind.SourceFile) {
      insertPosition = tmpNode.parent.getStart(sourceFile, true) - 1;
      tmpNode = tmpNode.parent!;
    }

    importManager.addImport({
      exportModuleSpecifier: CORE_PACKAGE,
      exportSymbolName: 'NgModule',
      requestedFile: sourceFile,
    });
    addZoneCDModule(ZONE_CD_PROVIDER, moduleProjectFile, insertPosition, replacements);
    insertZoneCDModule(ngModules, moduleProjectFile, replacements, 'ZoneChangeDetectionModule');
  }
}

function addProvidersToNgModule(
  projectFile: ProjectFile,
  moduleSourceFile: ts.SourceFile,
  ngModule: ts.ObjectLiteralExpression,
  providersText: string,
  replacements: Replacement[],
) {
  //                             ObjLiteral => callExp => Decorator => ClassExpression
  const moduleClassDeclaration = ngModule.parent.parent.parent;
  const insertPosition = moduleClassDeclaration.getStart(moduleSourceFile, true) - 1;
  addZoneCDModule(providersText, projectFile, insertPosition, replacements);

  const importsNode = findLiteralProperty(ngModule, 'imports');
  if (importsNode && ts.isPropertyAssignment(importsNode)) {
    insertZoneCDModule(
      importsNode.initializer,
      projectFile,
      replacements,
      'ZoneChangeDetectionModule',
    );
  } else {
    const text = `imports: [ZoneChangeDetectionModule]`;
    const toInsert = `${text},\n`;
    let position = ngModule.getStart() + 1;

    if (ngModule.properties.length > 0) {
      const firstProperty = ngModule.properties[0];
      position = firstProperty.getStart();
    }
    replacements.push(
      new Replacement(
        projectFile,
        new TextUpdate({
          position,
          end: position,
          toInsert,
        }),
      ),
    );
  }
}

function addZoneCDModule(
  providersText: string,
  projectFile: ProjectFile,
  location: number,
  replacements: Replacement[],
) {
  const newModuleText = `\n@NgModule({ providers: [ ${providersText} ] })
export class ZoneChangeDetectionModule {}\n\n`;

  if (replacementsHaveZoneCdModule(projectFile.rootRelativePath, replacements, newModuleText)) {
    return;
  }

  replacements.push(
    new Replacement(
      projectFile,
      new TextUpdate({
        position: location,
        end: location,
        toInsert: newModuleText,
      }),
    ),
  );
}

function insertZoneCDModule(
  node: ts.Node,
  projectFile: ProjectFile,
  replacements: Replacement[],
  importedModule: string,
) {
  if (ts.isArrayLiteralExpression(node)) {
    const literal = node;
    replacements.push(
      new Replacement(
        projectFile,
        new TextUpdate({
          position: literal.elements[0]?.getStart() ?? literal.getEnd() - 1,
          end: literal.elements[0]?.getStart() ?? literal.getEnd() - 1,
          toInsert: importedModule + ',',
        }),
      ),
    );
  } else if (ts.isIdentifier(node)) {
    // This should be a good enough heuristic to determine if the identifier is not array
    let isArray = !node.text.endsWith('Module');

    // Because if it's an array, we need to spread it
    const newImports = `[${importedModule}, ${isArray ? '...' : ''}${node.text}]`;
    replacements.push(
      new Replacement(
        projectFile,
        new TextUpdate({
          position: node.getStart(),
          end: node.getEnd(),
          toInsert: newImports,
        }),
      ),
    );
  } else {
    throw new Error('unsupported importsNode: ' + node.getText());
  }
}

function addProvidersToBootstrapOption(
  projectFile: ProjectFile,
  optionsNode: ts.ObjectLiteralExpression,
  providersText: string,
  replacements: Replacement[],
) {
  const providersProp = findLiteralProperty(optionsNode, 'providers');
  if (providersProp && ts.isPropertyAssignment(providersProp)) {
    // Can be bootstrap(App, {providers: [...]}), bootstrap(App, {providers}), bootstrap(App, {...appConfig, providers}) etc.

    if (ts.isArrayLiteralExpression(providersProp.initializer)) {
      const initializer = providersProp.initializer;
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
    } else if (ts.isIdentifier(providersProp.initializer)) {
      const newProviders = `[${providersText}, ...${providersProp.initializer.text}]`;
      replacements.push(
        new Replacement(
          projectFile,
          new TextUpdate({
            position: providersProp.initializer.getStart(),
            end: providersProp.initializer.getEnd(),
            toInsert: newProviders,
          }),
        ),
      );
    } else {
      const newProviders = `[${providersText}, ...`;
      replacements.push(
        new Replacement(
          projectFile,
          new TextUpdate({
            position: providersProp.initializer.getStart(),
            end: providersProp.initializer.getStart(),
            toInsert: newProviders,
          }),
        ),
      );
      replacements.push(
        new Replacement(
          projectFile,
          new TextUpdate({
            position: providersProp.initializer.getEnd(),
            end: providersProp.initializer.getEnd(),
            toInsert: ']',
          }),
        ),
      );
    }
  } else if (providersProp && ts.isShorthandPropertyAssignment(providersProp)) {
    const newProviders = `providers: [${providersText}, ...${providersProp.name.text}]`;
    replacements.push(
      new Replacement(
        projectFile,
        new TextUpdate({
          position: providersProp.getStart(),
          end: providersProp.getEnd(),
          toInsert: newProviders,
        }),
      ),
    );
  } else if (
    optionsNode.properties.length === 1 &&
    ts.isSpreadAssignment(optionsNode.properties[0])
  ) {
    const spread = optionsNode.properties[0];
    const newProviders = `, providers: [${providersText}, ...${spread.expression.getText()}.providers]`;
    replacements.push(
      new Replacement(
        projectFile,
        new TextUpdate({
          position: spread.getEnd(),
          end: spread.getEnd(),
          toInsert: newProviders,
        }),
      ),
    );
  } else {
    const text = `providers: [${providersText}]`;
    let toInsert: string;
    let position: number;

    if (optionsNode.properties.length > 0) {
      const lastProperty = optionsNode.properties[optionsNode.properties.length - 1];
      toInsert = `,\n  ${text}`;
      position = lastProperty.getEnd();
    } else {
      toInsert = `\n  ${text}\n`;
      position = optionsNode.getStart() + 1;
    }
    replacements.push(
      new Replacement(
        projectFile,
        new TextUpdate({
          position,
          end: position,
          toInsert,
        }),
      ),
    );
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

function hasChangeDetectionProvider(
  expression: ts.CallExpression | ts.ObjectLiteralExpression, // either the bootstrapApplication or platformBrowserDynamic().bootstrapModule()
  typeChecker: ts.TypeChecker,
): boolean {
  let literal: ts.ObjectLiteralExpression | undefined;
  if (ts.isCallExpression(expression)) {
    let optionsNode = expression.arguments[1];
    if (
      !optionsNode &&
      isReferenceToImport(
        typeChecker,
        expression.expression,
        getImportSpecifier(expression.getSourceFile(), '@angular/core', 'createApplication')!,
      )
    ) {
      optionsNode = expression.arguments[0];
    }
    if (!optionsNode) return false;

    if (ts.isIdentifier(optionsNode)) {
      literal = getObjectLiteralFromIdentifier(optionsNode, typeChecker);
    } else {
      literal = optionsNode as ts.ObjectLiteralExpression;
    }
  } else {
    literal = expression;
  }

  if (!literal) {
    return false;
  }

  const provideZoneCdSpecifier = getImportSpecifier(
    literal.getSourceFile(),
    '@angular/core',
    'provideZoneChangeDetection',
  );
  const provideZonelessCdSpecifier = getImportSpecifier(
    literal.getSourceFile(),
    '@angular/core',
    'provideZonelessChangeDetection',
  );

  if (provideZoneCdSpecifier === null && provideZonelessCdSpecifier === null) {
    return false;
  }

  const found = ts.forEachChild(literal, function walk(node: ts.Node): boolean | undefined {
    if (ts.isCallExpression(node)) {
      if (
        provideZonelessCdSpecifier &&
        node.getText().includes(provideZonelessCdSpecifier.getText())
      ) {
        return true;
      }
      if (provideZoneCdSpecifier && node.getText().includes(provideZoneCdSpecifier.getText())) {
        return true;
      }
    }
    return ts.forEachChild(node, walk);
  });

  return !!found;
}

function getObjectLiteralFromIdentifier(
  identifier: ts.Identifier,
  typeChecker: ts.TypeChecker,
): ts.ObjectLiteralExpression | undefined {
  let symbol = typeChecker.getSymbolAtLocation(identifier);
  if (!symbol) return;

  // Follow aliases (for imported symbols)
  if ((symbol.flags & ts.SymbolFlags.Alias) !== 0) {
    symbol = typeChecker.getAliasedSymbol(symbol);
  }

  const declarations = symbol.getDeclarations();
  if (!declarations) return;

  for (const decl of declarations) {
    if (
      ts.isVariableDeclaration(decl) &&
      decl.initializer &&
      ts.isObjectLiteralExpression(decl.initializer)
    ) {
      return decl.initializer;
    }
  }

  return;
}

/**
 * Extracts the import specifiers related to bootstraping from the source file.
 * Returns null if no relevant specifiers are found.
 */
function getSpecifiers(sourceFile: ts.SourceFile) {
  const createApplicationSpecifier = getImportSpecifier(
    sourceFile,
    '@angular/core',
    'createApplication',
  );
  const bootstrapAppSpecifier = getImportSpecifier(
    sourceFile,
    '@angular/platform-browser',
    'bootstrapApplication',
  );
  const platformBrowserDynamicSpecifier = getImportSpecifier(
    sourceFile,
    '@angular/platform-browser-dynamic',
    'platformBrowserDynamic',
  );
  const platformBrowserSpecifier = getImportSpecifier(
    sourceFile,
    '@angular/platform-browser',
    'platformBrowser',
  );
  const testBedSpecifier = getImportSpecifier(sourceFile, '@angular/core/testing', 'TestBed');
  const getTestBedSpecifier = getImportSpecifier(sourceFile, '@angular/core/testing', 'getTestBed');
  const ngModuleSpecifier = getImportSpecifier(sourceFile, '@angular/core', 'NgModule');
  if (
    !createApplicationSpecifier &&
    !bootstrapAppSpecifier &&
    !platformBrowserDynamicSpecifier &&
    !platformBrowserSpecifier &&
    !testBedSpecifier &&
    !ngModuleSpecifier &&
    !getTestBedSpecifier
  ) {
    return null;
  }

  return {
    createApplicationSpecifier,
    bootstrapAppSpecifier,
    platformBrowserDynamicSpecifier,
    platformBrowserSpecifier,
    testBedSpecifier,
    ngModuleSpecifier,
    getTestBedSpecifier,
  };
}

/**
 * Removes duplicate replacements and for replacements at the same position, takes the longest one.
 */
function deduplicateReplacements(replacements: Replacement[]): Replacement[] {
  if (replacements.length <= 1) {
    return replacements;
  }

  // Group replacements by file and position
  const groupedByFileAndPosition = new Map<string, Map<number, Replacement[]>>();

  for (const replacement of replacements) {
    const fileKey = replacement.projectFile.id;
    const position = replacement.update.data.position;

    if (!groupedByFileAndPosition.has(fileKey)) {
      groupedByFileAndPosition.set(fileKey, new Map());
    }

    const fileReplacements = groupedByFileAndPosition.get(fileKey)!;
    if (!fileReplacements.has(position)) {
      fileReplacements.set(position, []);
    }

    fileReplacements.get(position)!.push(replacement);
  }

  const result: Replacement[] = [];

  for (const fileReplacements of groupedByFileAndPosition.values()) {
    for (const positionReplacements of fileReplacements.values()) {
      if (positionReplacements.length === 1) {
        result.push(positionReplacements[0]);
      } else {
        // For multiple replacements at the same position, take the one with the longest content
        const longestReplacement = positionReplacements.reduce((longest, current) => {
          const longestLength = longest.update.data.toInsert.length;
          const currentLength = current.update.data.toInsert.length;
          return currentLength > longestLength ? current : longest;
        });
        result.push(longestReplacement);
      }
    }
  }

  return result;
}

/**
 * In the case we're looking to insert a new ZoneChangeDetectionModule, we need to check if we already inserted one.
 *
 * This function also checks if the existing one has fewer options (shorter text length), which means the previous migration strategy inserted one
 * but the following one is more complete and we should still add it (the dedup function will take care of the cleanup).
 */
function replacementsHaveZoneCdModule(
  rootRelativePath: string,
  replacements: Replacement[],
  text: string,
): boolean {
  return replacements.some((replacement) => {
    const exisitingText = replacement.update.data.toInsert;
    const isSameFile = replacement.projectFile.rootRelativePath === rootRelativePath;
    return (
      isSameFile &&
      text.includes('ZoneChangeDetectionModule') &&
      exisitingText.length >= text.length
    );
  });
}
