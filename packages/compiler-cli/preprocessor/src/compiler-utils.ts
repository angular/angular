/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Shared compiler utilities for Angular template compilation.
 * Used by both ngp.ts and tests/utils.ts.
 */

import {
  outputAst as o,
  R3InputMetadata,
  R3HostDirectiveMetadata,
  R3QueryMetadata,
  WrappedNodeExpr,
  ParsedHostBindings,
  MatchSource,
  DirectiveMeta,
  ClassPropertyMapping,
  parseHostBindings,
  verifyHostBindings,
  ParseError,
  ParseSourceFile,
  ParseSourceSpan,
  ParseLocation,
  outputAst,
  parseTemplate,
  ParseTemplateOptions,
  getSafePropertyAccessString,
} from '@angular/compiler';

import * as nga from './types.js';
import {PipeMeta} from './tcb.js';
import {RawSource} from './output_ast_printer.js';
import {offsetToPosition} from './tcb_util.js';
import MagicString from 'magic-string';

/** Minimal directive metadata for `R3TargetBinder`. */
export interface MinimalDirectiveMeta extends DirectiveMeta {
  animationTriggerNames: null;
}

/** Convert `InputMetadata[]` to Angular's `R3InputMetadata` map. */
export function buildInputsMap(
  inputs: nga.InputMetadata[],
  content: string,
): Record<string, R3InputMetadata> {
  const result: Record<string, R3InputMetadata> = {};
  for (const input of inputs) {
    let transformFunction = null;
    if (input.transform && !input.isSignal) {
      const fnStr = content.substring(input.transform.span.start, input.transform.span.end);
      transformFunction = new WrappedNodeExpr(new RawSource(fnStr));
    }
    result[input.name] = {
      classPropertyName: input.name,
      bindingPropertyName: input.alias || input.name,
      required: input.required,
      isSignal: input.isSignal,
      transformFunction,
    };
  }
  return result;
}

/**
 * Convert OutputMetadata[] to Angular's outputs format
 */
export function buildOutputsMap(outputs: nga.OutputMetadata[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const output of outputs) {
    result[output.name] = output.alias || output.name;
  }
  return result;
}

/**
 * Convert QueryMetadata[] to Angular's R3QueryMetadata format
 */
export function buildQueriesMap(
  queries: nga.QueryMetadata[],
  sourceText: string,
): R3QueryMetadata[] {
  return queries.map((q) => {
    // The analyzer has already read the predicate the way ngtsc does: selector strings when it
    // reduced to them, otherwise an expression to emit as written.
    const predicate: R3QueryMetadata['predicate'] = q.predicateSelectors ?? {
      expression: new o.WrappedNodeExpr(
        new RawSource(sourceText.substring(q.predicateSpan.start, q.predicateSpan.end)),
      ),
      forwardRef: q.isForwardRef
        ? 2 /* ForwardRefHandling.Unwrapped */
        : 0 /* ForwardRefHandling.None */,
    };

    let read: o.Expression | null = null;
    if (q.readSpan) {
      const readText = sourceText.substring(q.readSpan.start, q.readSpan.end);
      read = new o.WrappedNodeExpr(new RawSource(readText));
    }

    return {
      propertyName: q.propertyName,
      first: q.first,
      predicate,
      descendants: q.descendants,
      emitDistinctChangesOnly: q.emitDistinctChangesOnly,
      read,
      static: q.isStatic,
      isSignal: q.isSignal,
    };
  });
}

/** Creates a source span from a known position. */
export function createSpan(fileName: string, start: number, end: number): ParseSourceSpan {
  const file = new ParseSourceFile('', fileName);
  return new ParseSourceSpan(
    new ParseLocation(file, start, 0, start),
    new ParseLocation(file, end, 0, end),
  );
}

/**
 * Create a valid source span for use with host bindings.
 * Required by Angular's binding parser.
 */
export function createDummySourceSpan(filePath: string): ParseSourceSpan {
  const sourceFile = new ParseSourceFile('', filePath);
  const startLocation = new ParseLocation(sourceFile, 0, 0, 0);
  return new ParseSourceSpan(startLocation, startLocation);
}

/**
 * Everything needed to report host binding problems through the diagnostics channel: where
 * to report (file, `host` object span, per-property syntax for precise anchoring) and the
 * sink to report into.
 */
export interface HostBindingDiagnosticsContext {
  filePath: string;
  hostSpan?: nga.SpanMetadata;
  hostProperties?: nga.HostPropertyMetadata[];
  diagnostics: nga.NgDiagnostic[];
}

/**
 * The span ngtsc anchors a host binding verification error on: the string literal whose text
 * the parser failed on when it can be identified, the whole `host` object otherwise.
 * https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L2077-L2095
 */
function getHostBindingErrorSpan(
  error: ParseError,
  ctx: HostBindingDiagnosticsContext,
): nga.SpanMetadata | undefined {
  for (const prop of ctx.hostProperties ?? []) {
    if (
      prop.value.kind === nga.ExpressionValueKindMetadata.String &&
      prop.value.text != null &&
      error.msg.includes(`[${prop.value.text}]`)
    ) {
      return prop.value.sourceSpan;
    }
  }
  return ctx.hostSpan;
}

/**
 * Build host metadata from the evaluated `host` object, @HostBinding and @HostListener
 * decorators. Combines all sources into a single host object that Angular's
 * `parseHostBindings` can process, mirroring ngtsc's `extractHostBindings`.
 * https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L607-L625
 *
 * When `diagCtx` is provided, `host` object parse and verification failures are reported as
 * NG5001 (`HOST_BINDING_PARSE_ERROR`) diagnostics and compilation continues without the
 * unparseable `host` object; without `diagCtx`, parse failures throw.
 *
 * TODO(parity): an unfoldable `@HostBinding` argument (e.g. an imported constant in unoptimized
 * mode) is silently dropped, so it neither overrides a same-named `host` entry nor reports ngtsc's
 * error: https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L640-L661
 * `@HostListener` arguments are only folded within their own file, whereas ngtsc also follows
 * imported constants: https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L732-L743
 */
export function buildHostMetadata(
  hostMetadata: nga.HostMetadataEntry[],
  hostBindings: nga.HostBindingMetadata[],
  hostListeners: nga.HostListenerMetadata[],
  className?: string,
  diagCtx?: HostBindingDiagnosticsContext,
): ParsedHostBindings {
  // Start with the host: object from the decorator, as the partial evaluator reduced it. Its
  // entries are either a folded string or an expression the evaluator could not fold, which
  // ngtsc passes through as a `WrappedNodeExpr`.
  // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L2036-L2039
  const hostObj: Record<string, string | o.Expression> = {};
  for (const entry of hostMetadata) {
    if (entry.value != null) {
      hostObj[entry.key] = entry.value;
    } else if (entry.expression != null) {
      hostObj[entry.key] = new o.WrappedNodeExpr(new RawSource(entry.expression));
    }
  }

  // Parse and verify the `host` object on its own first, mirroring ngtsc's
  // `evaluateHostExpressionBindings`, which runs before the decorator-based bindings are
  // merged in. It throws when a binding/listener/class/style key holds a value that did not
  // fold to a string, and `verifyHostBindings` re-parses each binding expression collecting
  // syntax errors — NG5001 (HOST_BINDING_PARSE_ERROR) in both cases.
  // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L2049-L2067
  if (diagCtx) {
    let failed = false;
    try {
      const objBindings = parseHostBindings(hostObj);
      const errors = verifyHostBindings(objBindings, createDummySourceSpan(diagCtx.filePath));
      if (errors.length > 0) {
        failed = true;
        diagCtx.diagnostics.push({
          category: 1,
          code: 5001,
          messageText: errors.map((error: ParseError) => error.msg).join('\n'),
          filePath: diagCtx.filePath,
          span: getHostBindingErrorSpan(errors[0], diagCtx),
        });
      }
    } catch (e) {
      failed = true;
      diagCtx.diagnostics.push({
        category: 1,
        code: 5001,
        messageText: e instanceof Error ? e.message : String(e),
        filePath: diagCtx.filePath,
        span: diagCtx.hostSpan,
      });
    }
    if (failed) {
      // ngtsc treats either failure as fatal for the class. Our recovery drops the broken
      // `host` object — compiling it anyway would crash the downstream binding compiler on
      // the very expressions `verifyHostBindings` rejected — and continues with the
      // decorator-sourced bindings alone.
      for (const key of Object.keys(hostObj)) {
        delete hostObj[key];
      }
    }
  }

  // @HostBinding('class.active') isActive -> '[class.active]': 'isActive'
  for (const binding of hostBindings) {
    if (!isStaticSourceNode(binding.memberName)) {
      continue;
    }

    let bindingName: string = binding.memberName.text;
    if (binding.arguments.length > 0) {
      if (binding.hostPropertyName === undefined) {
        continue;
      }
      bindingName = binding.hostPropertyName;
    }

    const key =
      bindingName.startsWith('[') || bindingName.startsWith('(') ? bindingName : `[${bindingName}]`;
    // Ensure names that aren't valid identifiers (e.g. `is-a`) are emitted as quoted property reads.
    // https://github.com/angular/angular/blob/c1829f6/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L685-L689
    hostObj[key] = getSafePropertyAccessString('this', binding.memberName.text!);
  }

  // Add @HostListener decorators as event bindings
  // @HostListener('click', ['$event']) onClick($event) -> '(click)': 'onClick($event)'
  for (const listener of hostListeners) {
    if (listener.resolvedEventName === undefined) {
      continue;
    }
    const key = `(${listener.resolvedEventName})`;
    const args = listener.runtimeArgs
      ? listener.runtimeArgs.join(', ')
      : listener.args.map((arg) => (arg.text ? arg.text : 'null')).join(', ');
    hostObj[key] = `${listener.methodName.text}(${args})`;
  }

  // Use Angular's parseHostBindings to process the combined host object. With a `diagCtx`
  // the `host` object was already parse-checked (and dropped if unparseable) above, so this
  // cannot throw for it, and the decorator-sourced entries are constructed strings that
  // always parse. Without a `diagCtx` the throw stands rather than being swallowed into a
  // silently wrong definition; name the class, which the bare message from
  // `@angular/compiler` does not.
  // https://github.com/angular/angular/blob/e3ac727/packages/compiler-cli/src/ngtsc/annotations/directive/src/shared.ts#L2049-L2058
  try {
    return parseHostBindings(hostObj);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new Error(
      `Failed to parse host bindings${className ? ` for ${className}` : ''}: ${message}`,
    );
  }
}

/**
 * Create a MinimalDirectiveMeta for R3TargetBinder template binding.
 */
export function createDirectiveMeta(
  decl: nga.DeclarationMetadata,
  inputNames?: Set<string>,
  outputNames?: Set<string>,
  filePath?: string,
): MinimalDirectiveMeta {
  return {
    name: decl.name,
    selector: decl.selector || null,
    isComponent: decl.declarationType === 'component',
    inputs: inputNames
      ? ClassPropertyMapping.fromMappedObject(
          Object.fromEntries(Array.from(inputNames).map((n) => [n, n])),
        )
      : ClassPropertyMapping.empty(),
    outputs: outputNames
      ? ClassPropertyMapping.fromMappedObject(
          Object.fromEntries(Array.from(outputNames).map((n) => [n, n])),
        )
      : ClassPropertyMapping.empty(),
    exportAs: decl.exportAs || null,
    isStructural: false,
    ngContentSelectors: null,
    preserveWhitespaces: false,
    animationTriggerNames: null,
    ref: {
      key: decl.ref.typecheckImport
        ? `${decl.ref.typecheckImport.specifier}#${decl.name}`
        : decl.ref.consumerImport
          ? `${decl.ref.consumerImport.specifier}#${decl.name}`
          : filePath
            ? `${filePath}#${decl.name}`
            : decl.name,
    },
    matchSource: MatchSource.Selector,
  };
}

/**
 * Build dependency injection tokens from constructor parameter types.
 *
 * Mirrors ngtsc's getConstructorDependencies() + unwrapConstructorDependencies() which
 * processes constructor params and returns 'invalid' when any param's type has no runtime
 * value (interface, type alias, type-only import) and no explicit @Inject/@Attribute override.
 * https://github.com/angular/angular/blob/50e599e/packages/compiler-cli/src/ngtsc/annotations/common/src/di.ts#L39-L151
 *
 * When deps is 'invalid', the Angular compiler skips factory generation entirely
 * (r3_factory.ts) rather than emitting broken ɵɵinject(null) calls.
 */
export function buildDeps(
  constructorParams: nga.ConstructorParamMetadata[] | undefined,
  usesInheritance: boolean,
  o: typeof outputAst,
  s: MagicString,
):
  | Array<{
      token: outputAst.Expression;
      attributeNameType: outputAst.Expression | null;
      host: boolean;
      optional: boolean;
      self: boolean;
      skipSelf: boolean;
    }>
  | 'invalid'
  | null {
  if (constructorParams === undefined) {
    return usesInheritance ? null : [];
  }
  if (constructorParams.length === 0) {
    return [];
  }

  let hasInvalidDep = false;

  const deps = constructorParams.map((param) => {
    // Equivalent to ngtsc's valueReferenceToExpression(param.typeValueReference):
    // returns null when the type has no runtime value (UNAVAILABLE).
    const isTypeOnly = param.isTypeOnly;
    // The Rust extractor leaves `typeName` undefined for parameters without a runtime-referenceable
    // type (primitives, inline types, no annotation); fall back to `Object` as the DI token, which
    // is what this layer historically relied on for factory generation.
    const effectiveTypeName = param.typeName ?? 'Object';
    let tokenResolved = !isTypeOnly;
    let token: outputAst.Expression;
    if (tokenResolved) {
      // ngtsc's valueReferenceToExpression() emits a named-import type reference as an
      // `ExternalExpr` (kind IMPORTED), which the import manager prints through the module's
      // namespace import — e.g. `i0.ElementRef` for a token imported from `@angular/core`.
      // We scope this to `@angular/core` (the documented set of core DI tokens here); other
      // named imports keep their bare local name, which still resolves because the original
      // user import is preserved in the emitted file.
      // https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/common/src/util.ts#L71-L82
      token =
        param.typeModule === '@angular/core' && param.typeName != null
          ? o.importExpr(new o.ExternalReference(param.typeModule, param.typeName))
          : o.variable(effectiveTypeName);
    } else {
      token = o.literal(null);
    }
    let attributeNameType: outputAst.Expression | null = null;
    let host = false;
    let optional = false;
    let self = false;
    let skipSelf = false;

    // Decorator processing mirrors ngtsc's getConstructorDependencies() decorator loop.
    // @Inject and @Attribute provide explicit tokens that override the type reference,
    // so even a type-only param is valid if one of these decorators is present.
    // https://github.com/angular/angular/blob/50e599e/packages/compiler-cli/src/ngtsc/annotations/common/src/di.ts#L62-L100
    for (const decorator of param.decorators) {
      const arg = decorator.args?.[0];
      let isInjectDecorator = false;
      const decoratorKind = decorator.canonicalName ?? decorator.name;

      switch (decoratorKind) {
        case 'Optional':
          optional = true;
          isInjectDecorator = true;
          break;
        case 'Self':
          self = true;
          isInjectDecorator = true;
          break;
        case 'SkipSelf':
          skipSelf = true;
          isInjectDecorator = true;
          break;
        case 'Host':
          host = true;
          isInjectDecorator = true;
          break;
        case 'Inject':
          if (arg) {
            token = arg.isLiteral ? o.literal(arg.value) : o.variable(arg.value);
            tokenResolved = true;
          }
          isInjectDecorator = true;
          break;
        case 'Attribute':
          if (arg) {
            token = arg.isLiteral ? o.literal(arg.value) : o.variable(arg.value);
            // https://github.com/angular/angular/blob/83622ee/packages/compiler-cli/src/ngtsc/annotations/common/src/di.ts#L93-L100
            attributeNameType = arg.isLiteral
              ? o.literal(arg.value)
              : new o.WrappedNodeExpr(new RawSource('unknown'));
            tokenResolved = true;
          }
          isInjectDecorator = true;
          break;
      }

      if (isInjectDecorator && decorator.decoratorSpan !== undefined) {
        s.remove(decorator.decoratorSpan.start, decorator.decoratorSpan.end);
      }
    }

    // After all decorator processing, if no valid token was resolved, this param
    // is invalid. Mirrors ngtsc adding to the errors array when token === null.
    if (!tokenResolved) {
      hasInvalidDep = true;
    }

    return {
      token,
      attributeNameType,
      host,
      optional,
      self,
      skipSelf,
    };
  });

  // Mirrors ngtsc's unwrapConstructorDependencies(): if any param had an unavailable
  // type without an @Inject/@Attribute override, the entire deps is 'invalid'.
  // This tells the compiler to skip factory generation entirely.
  if (hasInvalidDep) {
    return 'invalid';
  }

  return deps;
}

/**
 * Create an empty source span for directives without host bindings.
 */
export function createEmptySourceSpan(): ParseSourceSpan {
  return {start: null!, end: null!, fullStart: null!, details: null};
}

/** Identifier a reference resolves to in the emitting file (local binding or exported symbol). */
export function refName(ref: nga.ReferenceMetadata): string {
  const name = ref.localAlias ?? ref.consumerImport?.symbol ?? ref.typecheckImport?.symbol;
  if (name === undefined) {
    throw new Error('ReferenceMetadata has neither a local binding nor an import path');
  }
  return name;
}

export function refToExpression(ref: nga.ReferenceMetadata): o.Expression {
  if (ref.localAlias) {
    return o.variable(ref.localAlias);
  }
  if (ref.consumerImport) {
    return new o.ExternalExpr({
      moduleName: ref.consumerImport.specifier,
      name: ref.consumerImport.symbol,
    } as any);
  }
  return o.variable(refName(ref));
}

/**
 * Builds the hostDirectives metadata for the compiler from the raw AST expression string.
 * Extracts `directive`, `inputs` and `outputs` properties.
 */
export function buildHostDirectives(
  parsedHostDirectives: nga.HostDirectiveMetadata[] | null | undefined,
): R3HostDirectiveMetadata[] | null {
  if (!parsedHostDirectives || parsedHostDirectives.length === 0) return null;

  return parsedHostDirectives.map((hd) => ({
    directive: {
      value: refToExpression(hd.directive),
      type: refToExpression(hd.directive),
    },
    isForwardReference: hd.isForwardRef,
    inputs: hd.inputs
      ? Object.fromEntries(hd.inputs.map((io) => [io.publicName, io.bindingName]))
      : null,
    outputs: hd.outputs
      ? Object.fromEntries(hd.outputs.map((io) => [io.publicName, io.bindingName]))
      : null,
  }));
}

/** Checks if a `SourceNode` is static. */
export function isStaticSourceNode(
  node: nga.ExpressionValueMetadata,
): node is nga.ExpressionValueMetadata & {
  text: string;
} {
  return node.kind === 'identifier' || node.kind === 'string';
}

/**
 * Parses an inline template declared as a string literal or a no-substitution template literal
 * straight out of the component file's source text, as ngtsc's `extractTemplate` does for a
 * `direct` source mapping.
 *
 * The lexer reads the literal's source text inside `contentSpan` (ngtsc's `getTemplateRange`)
 * and decodes its escape sequences itself (`escapedString`), so every span it produces is an
 * offset into `sourceText` — exact even where the literal's source is longer than its value
 * (`\n`, `\'`, `\u00e9`, line continuations) or where a template literal's value normalizes
 * CRLF line endings to LF. ngtsc always normalizes ICU line endings for such a template.
 */
export function parseDirectInlineTemplate(
  sourceText: string,
  filePath: string,
  contentSpan: nga.SpanMetadata,
  options: Partial<ParseTemplateOptions> = {},
) {
  const {line, character} = offsetToPosition(sourceText, contentSpan.start);
  return parseTemplate(sourceText, filePath, {
    ...options,
    escapedString: true,
    i18nNormalizeLineEndingsInICUs: true,
    range: {
      startPos: contentSpan.start,
      endPos: contentSpan.end,
      startLine: line,
      startCol: character,
    },
  });
}

export function metadataToDeclaration(
  meta: nga.ComponentMetadata | nga.DirectiveMetadata,
  classMeta: nga.ClassMetadata,
  declarationType: string,
  ngContentSelectors: string[] | null,
  fileId: nga.FileId = 0,
): nga.DeclarationMetadata {
  const decl: nga.DeclarationMetadata = {
    name: classMeta.className!,
    nameSpan: classMeta.nameSpan!,
    declarationType,
    // The analyzer has already applied ngtsc's default selector (`ng-component`) to a component
    // without one, so this matches the `DeclarationMetadata` other components see.
    selector: meta.selector || undefined,
    pipeName: undefined,
    isStandalone: meta.standalone,
    exportAs: meta.exportAs || undefined,
    fileId,
    ref: classMeta.ref ?? {
      localAlias: classMeta.className!,
    },
    hostDirectives: meta.hostDirectives || undefined,
    resolvedHostDirectives:
      'resolvedHostDirectives' in meta ? (meta.resolvedHostDirectives ?? undefined) : undefined,
    fields: classMeta.fields || undefined,
    flattenedFields: classMeta.flattenedFields || undefined,
    ngContentSelectors: ngContentSelectors || undefined,
    typeParameters: classMeta.typeParameters || undefined,

    hasNgTemplateContextGuard: classMeta.hasNgTemplateContextGuard || false,
    ngTemplateGuards: classMeta.ngTemplateGuards || [],
    hasNgFieldDirective: classMeta.hasNgFieldDirective || false,
    isForwardRef:
      'isForwardRef' in meta ? ((meta as {isForwardRef?: boolean}).isForwardRef ?? false) : false,
    isStructural:
      'isStructural' in meta ? ((meta as {isStructural?: boolean}).isStructural ?? false) : false,
    isExported: classMeta.isExported ?? true,
    hasNonExportedBounds: classMeta.hasNonExportedBounds ?? false,
    isExplicitlyDeferred: false,
  };

  return decl;
}

export function buildPipeRegistry(declarations: nga.DeclarationMetadata[]): Map<string, PipeMeta> {
  const registry = new Map<string, PipeMeta>();
  for (const decl of declarations) {
    if (decl.declarationType === 'pipe' && decl.pipeName) {
      registry.set(decl.pipeName, {
        name: decl.pipeName,
        className: decl.name,
        importPath: decl.ref.typecheckImport?.specifier ?? undefined,
        filePath: decl.filePath,
        isExported: decl.isExported ?? true,
        hasNonExportedBounds: decl.hasNonExportedBounds ?? false,
        isExplicitlyDeferred: decl.isExplicitlyDeferred,
        deferredBlocks: decl.deferredBlocks,
      });
    }
  }
  return registry;
}
export function makeClassKey(className: string | undefined | null, spanStart: number): string {
  return `${className ?? ''}@${spanStart}`;
}

/**
 * Unwraps an immediately-invoked function expression (IIFE), returning its inner statement(s).
 * If the expression is not an IIFE, returns the expression wrapped as a statement.
 */
export function stripIife(expr: o.Expression): o.Statement[] {
  if (!(expr instanceof o.InvokeFunctionExpr)) {
    return [expr.toStmt()];
  }

  const fn = expr.fn;
  if (fn instanceof o.ArrowFunctionExpr) {
    if (Array.isArray(fn.body)) {
      return fn.body;
    }
    if (fn.body instanceof o.Expression) {
      return [fn.body.toStmt()];
    }
  }

  if (fn instanceof o.FunctionExpr) {
    return fn.statements;
  }

  return [expr.toStmt()];
}
