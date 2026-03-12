/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import * as o from '../output/output_ast';
import {Identifiers as R3} from './r3_identifiers';
import {devOnlyGuardedExpression} from './util';

/** Metadata necessary to compile HMR-related code call. */
export interface R3HmrMetadata {
  /** Component class for which HMR is being enabled. */
  type: o.Expression;

  /** Name of the component class. */
  className: string;

  /** File path of the component class. */
  filePath: string;

  /**
   * When the compiler generates new imports, they get produced as namespace imports
   * (e.g. import * as i0 from '@angular/core'). These namespaces have to be captured and passed
   * along to the update callback.
   */
  namespaceDependencies: R3HmrNamespaceDependency[];

  /**
   * HMR update functions cannot contain imports so any locals the generated code depends on
   * (e.g. references to imports within the same file or imported symbols) have to be passed in
   * as function parameters. This array contains the names and runtime representation of the locals.
   */
  localDependencies: {name: string; runtimeRepresentation: o.Expression}[];
}

/** HMR dependency on a namespace import. */
export interface R3HmrNamespaceDependency {
  /** Module name of the import. */
  moduleName: string;

  /**
   * Name under which to refer to the namespace inside
   * HMR-related code. Must be a valid JS identifier.
   */
  assignedName: string;
}

/**
 * Compiles the expression that initializes HMR for a class.
 * @param meta HMR metadata extracted from the class.
 */
export function compileHmrInitializer(meta: R3HmrMetadata): o.Expression {
  const moduleName = 'm';
  const dataName = 'd';
  const timestampName = 't';
  const idName = 'id';
  const importCallbackName = `${meta.className}_HmrLoad`;
  const namespaces = meta.namespaceDependencies.map((dep) => {
    return new o.ExternalExpr({moduleName: dep.moduleName, name: null});
  });

  // m.default
  const defaultRead = o.variable(moduleName).prop('default');

  // ɵɵreplaceMetadata(Comp, m.default, [...namespaces], [...locals], import.meta, id);
  const replaceCall = o
    .importExpr(R3.replaceMetadata)
    .callFn([
      meta.type,
      defaultRead,
      o.literalArr(namespaces),
      o.literalArr(meta.localDependencies.map((l) => l.runtimeRepresentation)),
      o.variable('import').prop('meta'),
      o.variable(idName),
    ]);

  // (m) => m.default && ɵɵreplaceMetadata(...)
  const replaceCallback = o.arrowFn([new o.FnParam(moduleName)], defaultRead.and(replaceCall));

  // getReplaceMetadataURL(id, timestamp, import.meta.url)
  const url = o
    .importExpr(R3.getReplaceMetadataURL)
    .callFn([
      o.variable(idName),
      o.variable(timestampName),
      o.variable('import').prop('meta').prop('url'),
    ]);

  // function Cmp_HmrLoad(t) {
  //   import(/* @vite-ignore */ url).then((m) => m.default && replaceMetadata(...));
  // }
  const importCallback = new o.DeclareFunctionStmt(
    importCallbackName,
    [new o.FnParam(timestampName)],
    [
      // The vite-ignore special comment is required to prevent Vite from generating a superfluous
      // warning for each usage within the development code. If Vite provides a method to
      // programmatically avoid this warning in the future, this added comment can be removed here.
      new o.DynamicImportExpr(url, null, '@vite-ignore')
        .prop('then')
        .callFn([replaceCallback])
        .toStmt(),
    ],
    null,
    o.StmtModifier.Final,
  );

  // (d) => d.id === id && Cmp_HmrLoad(d.timestamp)
  const updateCallback = o.arrowFn(
    [new o.FnParam(dataName)],
    o
      .variable(dataName)
      .prop('id')
      .identical(o.variable(idName))
      .and(o.variable(importCallbackName).callFn([o.variable(dataName).prop('timestamp')])),
  );

  // Cmp_HmrLoad(Date.now());
  // Initial call to kick off the loading in order to avoid edge cases with components
  // coming from lazy chunks that change before the chunk has loaded.
  const initialCall = o
    .variable(importCallbackName)
    .callFn([o.variable('Date').prop('now').callFn([])]);

  // import.meta.hot
  const hotRead = o.variable('import').prop('meta').prop('hot');

  // import.meta.hot.on('angular:component-update', () => ...);
  const hotListener = hotRead
    .clone()
    .prop('on')
    .callFn([o.literal('angular:component-update'), updateCallback]);

  return o
    .arrowFn(
      [],
      [
        // const id = <id>;
        new o.DeclareVarStmt(
          idName,
          o.literal(encodeURIComponent(`${meta.filePath}@${meta.className}`)),
          null,
          o.StmtModifier.Final,
        ),
        // function Cmp_HmrLoad() {...}.
        importCallback,
        // ngDevMode && Cmp_HmrLoad(Date.now());
        devOnlyGuardedExpression(initialCall).toStmt(),
        // ngDevMode && import.meta.hot && import.meta.hot.on(...)
        devOnlyGuardedExpression(hotRead.and(hotListener)).toStmt(),
      ],
    )
    .callFn([]);
}

/**
 * Compiles the HMR update callback for a class.
 * @param definitions Compiled definitions for the class (e.g. `defineComponent` calls).
 * @param constantStatements Supporting constants statements that were generated alongside
 *  the definition.
 * @param meta HMR metadata extracted from the class.
 */
export function compileHmrUpdateCallback(
  definitions: {name: string; initializer: o.Expression | null; statements: o.Statement[]}[],
  constantStatements: o.Statement[],
  meta: R3HmrMetadata,
): o.DeclareFunctionStmt {
  const namespaces = 'ɵɵnamespaces';
  const params = [meta.className, namespaces].map((name) => new o.FnParam(name, o.DYNAMIC_TYPE));
  const body: o.Statement[] = [];

  for (const local of meta.localDependencies) {
    params.push(new o.FnParam(local.name));
  }

  // Declare variables that read out the individual namespaces.
  for (let i = 0; i < meta.namespaceDependencies.length; i++) {
    body.push(
      new o.DeclareVarStmt(
        meta.namespaceDependencies[i].assignedName,
        o.variable(namespaces).key(o.literal(i)),
        o.DYNAMIC_TYPE,
        o.StmtModifier.Final,
      ),
    );
  }

  body.push(...constantStatements);

  for (const field of definitions) {
    if (field.initializer !== null) {
      body.push(o.variable(meta.className).prop(field.name).set(field.initializer).toStmt());

      for (const stmt of field.statements) {
        body.push(stmt);
      }
    }
  }

  return new o.DeclareFunctionStmt(
    `${meta.className}_UpdateMetadata`,
    params,
    body,
    null,
    o.StmtModifier.Final,
  );
}
