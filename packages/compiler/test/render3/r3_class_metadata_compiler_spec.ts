/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {AbstractJsEmitterVisitor} from '../../src/output/abstract_js_emitter';
import {EmitterVisitorContext} from '../../src/output/abstract_emitter';
import * as o from '../../src/output/output_ast';
import {
  compileCtorParameters,
  R3ClassMetadataCtorParameter,
} from '../../src/render3/r3_class_metadata_compiler';

class CommentPrintingJsEmitter extends AbstractJsEmitterVisitor {
  override readonly printComments = true;

  override visitExternalExpr(ast: o.ExternalExpr, ctx: EmitterVisitorContext): void {
    ctx.print(ast, ast.value.name!);
  }
}

function emitExpr(expr: o.Expression): string {
  const ctx = EmitterVisitorContext.createRoot();
  expr.visitExpression(new CommentPrintingJsEmitter(), ctx);
  return ctx.toSource();
}

/** Builds a parameter, defaulting the parts a given test doesn't care about. */
function param(
  overrides: Partial<R3ClassMetadataCtorParameter> = {},
): R3ClassMetadataCtorParameter {
  return {
    type: o.variable('Dep'),
    decorators: null,
    suppressTypeErrors: false,
    ...overrides,
  };
}

/** Unwraps the `() => [...]` callback down to its parameter entries. */
function entriesOf(expr: o.Expression): o.LiteralMapExpr[] {
  const fn = expr as o.ArrowFunctionExpr;
  expect(fn instanceof o.ArrowFunctionExpr).toBe(true);
  const arr = fn.body as o.LiteralArrayExpr;
  expect(arr instanceof o.LiteralArrayExpr).toBe(true);
  return arr.entries as o.LiteralMapExpr[];
}

function commentTextsOf(entry: o.LiteralMapExpr): string[] {
  const typeProp = propertiesOf(entry).find((e) => e.key === 'type');
  return (typeProp?.leadingComments ?? []).map((c) => c.text);
}

/**
 * `LiteralMapEntry` also covers spread assignments, which have no key. Nothing here should ever
 * produce one, so narrow rather than handle it.
 */
function propertiesOf(entry: o.LiteralMapExpr): o.LiteralMapPropertyAssignment[] {
  return entry.entries.map((e) => {
    if (!(e instanceof o.LiteralMapPropertyAssignment)) {
      throw new Error(`Expected a property assignment, got ${e.constructor.name}.`);
    }
    return e;
  });
}

function keysOf(entry: o.LiteralMapExpr): string[] {
  return propertiesOf(entry).map((e) => e.key);
}

function valueForKey(entry: o.LiteralMapExpr, key: string): o.Expression | undefined {
  return propertiesOf(entry).find((e) => e.key === key)?.value;
}

describe('compileCtorParameters', () => {
  it('should emit `null` when there is no constructor', () => {
    expect(compileCtorParameters(null, true)).toEqual(o.literal(null));
  });

  it('should pass an already-built expression through untouched', () => {
    // A producer that built the callback itself — e.g. the linker reading a partial declaration —
    // gets it back as-is, because there is no way to tell which part holds a parameter type.
    const prebuilt = o.arrowFn([], o.literalArr([o.variable('whatever')]));
    expect(compileCtorParameters(prebuilt, true)).toBe(prebuilt);
  });

  it('should suppress only the parameters that ask for it', () => {
    const entries = entriesOf(
      compileCtorParameters(
        [
          param({type: o.variable('Verified')}),
          param({type: o.variable('Unverified'), suppressTypeErrors: true}),
        ],
        true,
      ),
    );

    expect(commentTextsOf(entries[0])).toEqual([]);
    expect(commentTextsOf(entries[1])).toEqual(['@ts-ignore']);
  });

  it('should emit `undefined` for a null type and never suppress it', () => {
    // `undefined` is always valid in a value position, so there is nothing to suppress even if
    // the producer asked.
    const entries = entriesOf(
      compileCtorParameters([param({type: null, suppressTypeErrors: true})], true),
    );

    expect(valueForKey(entries[0], 'type')).toEqual(o.literal(undefined));
    expect(commentTextsOf(entries[0])).toEqual([]);
  });

  it('should omit the `decorators` key when there are none', () => {
    const entries = entriesOf(compileCtorParameters([param({decorators: null})], true));

    expect(keysOf(entries[0])).toEqual(['type']);
  });

  it('should keep the `decorators` key when there are some', () => {
    const decorators = o.literalArr([o.variable('Inject')]);
    const entries = entriesOf(compileCtorParameters([param({decorators})], true));

    expect(keysOf(entries[0])).toEqual(['type', 'decorators']);
    expect(valueForKey(entries[0], 'decorators')).toBe(decorators);
  });

  it('should not suppress when suppressions are disallowed', () => {
    // Partial declarations are published as JavaScript, which is never type-checked, so the
    // comment would be pure noise there.
    const entries = entriesOf(
      compileCtorParameters([param({suppressTypeErrors: true})], /* allowSuppressions */ false),
    );

    expect(commentTextsOf(entries[0])).toEqual([]);
  });

  it('should not accumulate comments when the same metadata is compiled twice', () => {
    // Analysis is cached across incremental rebuilds, so the same parameter objects can be
    // compiled more than once. The comment is attached to the fresh property assignment built here
    // rather than to the caller's `type` expression, so repeats can't stack up and the caller
    // expression remains unmutated.
    const originalType = o.variable('Dep');
    const params = [param({type: originalType, suppressTypeErrors: true})];

    compileCtorParameters(params, true);
    const entries = entriesOf(compileCtorParameters(params, true));

    expect(commentTextsOf(entries[0])).toEqual(['@ts-ignore']);
    expect(originalType.leadingComments).toBeUndefined();
  });

  it('should emit `@ts-ignore` on the line immediately before `type:` via AbstractEmitterVisitor', () => {
    const expr = compileCtorParameters(
      [
        param({type: o.variable('Verified')}),
        param({
          type: o.variable('Unverified'),
          decorators: o.literalArr([o.variable('Optional')]),
          suppressTypeErrors: true,
        }),
      ],
      true,
    );

    expect(emitExpr(expr)).toBe(
      '() => [{type: Verified}, {\n/* @ts-ignore */\ntype: Unverified, decorators: [Optional]}]',
    );
  });
});
