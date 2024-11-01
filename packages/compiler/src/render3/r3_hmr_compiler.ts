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

  /** Name under which `@angular/core` should be referred to in the compiled HMR code. */
  coreName: string;

  /**
   * HMR update functions cannot contain imports so any locals the generated code depends on
   * (e.g. references to imports within the same file or imported symbols) have to be passed in
   * as function parameters. This array contains the names of those local symbols.
   */
  locals: string[];
}

/**
 * Compiles the expression that initializes HMR for a class.
 * @param meta HMR metadata extracted from the class.
 */
export function compileHmrInitializer(meta: R3HmrMetadata): o.Expression {
  const id = encodeURIComponent(`${meta.filePath}@${meta.className}`);
  const urlPartial = `/@ng/component?c=${id}&t=`;
  const moduleName = 'm';
  const dataName = 'd';
  const timestampName = 't';
  const importCallbackName = `${meta.className}_HmrLoad`;
  const locals = meta.locals.map((localName) => o.variable(localName));

  // m.default
  const defaultRead = o.variable(moduleName).prop('default');

  // ɵɵreplaceMetadata(Comp, m.default, [...]);
  const replaceCall = o
    .importExpr(R3.replaceMetadata)
    .callFn([meta.type, defaultRead, new o.ExternalExpr(R3.core), o.literalArr(locals)]);

  // (m) => m.default && ɵɵreplaceMetadata(...)
  const replaceCallback = o.arrowFn([new o.FnParam(moduleName)], defaultRead.and(replaceCall));

  // '<urlPartial>' + encodeURIComponent(t)
  const urlValue = o
    .literal(urlPartial)
    .plus(o.variable('encodeURIComponent').callFn([o.variable(timestampName)]));

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
      new o.DynamicImportExpr(urlValue, null, '@vite-ignore')
        .prop('then')
        .callFn([replaceCallback])
        .toStmt(),
    ],
    null,
    o.StmtModifier.Final,
  );

  // (d) => d.id === <id> && Cmp_HmrLoad(d.timestamp)
  const updateCallback = o.arrowFn(
    [new o.FnParam(dataName)],
    o
      .variable(dataName)
      .prop('id')
      .identical(o.literal(id))
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
  // The class name should always be first and core should be second.
  const params = [meta.className, meta.coreName, ...meta.locals].map(
    (name) => new o.FnParam(name, o.DYNAMIC_TYPE),
  );
  const body: o.Statement[] = [...constantStatements];

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
