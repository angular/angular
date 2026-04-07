/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  AbsoluteFsPath,
  getFileSystem,
  PathManipulation,
} from '@angular/compiler-cli/private/localize';
import {
  ɵisMissingTranslationError,
  ɵmakeTemplateObject,
  ɵParsedTranslation,
  ɵSourceLocation,
  ɵtranslate,
} from '../../index';
import {BabelFile, NodePath, types as t} from '@babel/core';

import {DiagnosticHandlingStrategy, Diagnostics} from './diagnostics';

/**
 * Is the given `expression` the global `$localize` identifier?
 *
 * @param expression The expression to check.
 * @param localizeName The configured name of `$localize`.
 */
export function isLocalize(
  expression: NodePath,
  localizeName: string,
): expression is NodePath<t.Identifier> {
  return isNamedIdentifier(expression, localizeName) && isGlobalIdentifier(expression);
}

/**
 * Is the given `expression` an identifier with the correct `name`?
 *
 * @param expression The expression to check.
 * @param name The name of the identifier we are looking for.
 */
export function isNamedIdentifier(
  expression: NodePath,
  name: string,
): expression is NodePath<t.Identifier> {
  return expression.isIdentifier() && expression.node.name === name;
}

/**
 * Is the given `identifier` declared globally.
 *
 * @param identifier The identifier to check.
 * @publicApi used by CLI
 */
export function isGlobalIdentifier(identifier: NodePath<t.Identifier>) {
  return !identifier.scope || !identifier.scope.hasBinding(identifier.node.name);
}

/**
 * Build a translated expression to replace the call to `$localize`.
 * @param messageParts The static parts of the message.
 * @param substitutions The expressions to substitute into the message.
 * @publicApi used by CLI
 */
export function buildLocalizeReplacement(
  messageParts: TemplateStringsArray,
  substitutions: readonly t.Expression[],
): t.Expression {
  let mappedString: t.Expression = t.stringLiteral(messageParts[0]);
  for (let i = 1; i < messageParts.length; i++) {
    mappedString = t.binaryExpression(
      '+',
      mappedString,
      wrapInParensIfNecessary(substitutions[i - 1]),
    );
    mappedString = t.binaryExpression('+', mappedString, t.stringLiteral(messageParts[i]));
  }
  return mappedString;
}

/**
 * Extract the message parts from the given `call` (to `$localize`).
 *
 * The message parts will either by the first argument to the `call` or it will be wrapped in call
 * to a helper function like `__makeTemplateObject`.
 *
 * @param call The AST node of the call to process.
 * @param fs The file system to use when computing source-map paths. If not provided then it uses
 *     the "current" FileSystem.
 * @publicApi used by CLI
 */
export function unwrapMessagePartsFromLocalizeCall(
  call: NodePath<t.CallExpression>,
  fs: PathManipulation = getFileSystem(),
): [TemplateStringsArray, (ɵSourceLocation | undefined)[]] {
  let cooked = call.get('arguments')[0];

  if (cooked === undefined) {
    throw new BabelParseError(call.node, '`$localize` called without any arguments.');
  }
  if (!cooked.isExpression()) {
    throw new BabelParseError(
      cooked.node,
      'Unexpected argument to `$localize` (expected an array).',
    );
  }

  // If there is no call to `__makeTemplateObject(...)`, then `raw` must be the same as `cooked`.
  let raw = cooked;

  // Check for a memoized form: `x || x = ...`
  if (
    cooked.isLogicalExpression() &&
    cooked.node.operator === '||' &&
    cooked.get('left').isIdentifier()
  ) {
    const right = cooked.get('right');
    if (right.isAssignmentExpression()) {
      cooked = right.get('right');
      if (!cooked.isExpression()) {
        throw new BabelParseError(
          cooked.node,
          'Unexpected "makeTemplateObject()" function (expected an expression).',
        );
      }
    } else if (right.isSequenceExpression()) {
      const expressions = right.get('expressions');
      if (expressions.length > 2) {
        // This is a minified sequence expression, where the first two expressions in the sequence
        // are assignments of the cooked and raw arrays respectively.
        const [first, second] = expressions;
        if (first.isAssignmentExpression()) {
          cooked = first.get('right');
          if (!cooked.isExpression()) {
            throw new BabelParseError(
              first.node,
              'Unexpected cooked value, expected an expression.',
            );
          }
          if (second.isAssignmentExpression()) {
            raw = second.get('right');
            if (!raw.isExpression()) {
              throw new BabelParseError(
                second.node,
                'Unexpected raw value, expected an expression.',
              );
            }
          } else {
            // If the second expression is not an assignment then it is probably code to take a copy
            // of the cooked array. For example: `raw || (raw=cooked.slice(0))`.
            raw = cooked;
          }
        }
      }
    }
  }

  // Check for `__makeTemplateObject(cooked, raw)` or `__templateObject()` calls.
  if (cooked.isCallExpression()) {
    let call = cooked;
    if (call.get('arguments').length === 0) {
      // No arguments so perhaps it is a `__templateObject()` call.
      // Unwrap this to get the `_taggedTemplateLiteral(cooked, raw)` call.
      call = unwrapLazyLoadHelperCall(call);
    }

    cooked = call.get('arguments')[0];
    if (!cooked.isExpression()) {
      throw new BabelParseError(
        cooked.node,
        'Unexpected `cooked` argument to the "makeTemplateObject()" function (expected an expression).',
      );
    }
    const arg2 = call.get('arguments')[1];
    if (arg2 && !arg2.isExpression()) {
      throw new BabelParseError(
        arg2.node,
        'Unexpected `raw` argument to the "makeTemplateObject()" function (expected an expression).',
      );
    }
    // If there is no second argument then assume that raw and cooked are the same
    raw = arg2 !== undefined ? arg2 : cooked;
  }

  const [cookedStrings] = unwrapStringLiteralArray(cooked, fs);
  const [rawStrings, rawLocations] = unwrapStringLiteralArray(raw, fs);
  return [ɵmakeTemplateObject(cookedStrings, rawStrings), rawLocations];
}

/**
 * Parse the localize call expression to extract the arguments that hold the substitution
 * expressions.
 *
 * @param call The AST node of the call to process.
 * @param fs The file system to use when computing source-map paths. If not provided then it uses
 *     the "current" FileSystem.
 * @publicApi used by CLI
 */
export function unwrapSubstitutionsFromLocalizeCall(
  call: NodePath<t.CallExpression>,
  fs: PathManipulation = getFileSystem(),
): [t.Expression[], (ɵSourceLocation | undefined)[]] {
  const expressions = call.get('arguments').splice(1);
  if (!isArrayOfExpressions(expressions)) {
    const badExpression = expressions.find((expression) => !expression.isExpression())!;
    throw new BabelParseError(
      badExpression.node,
      'Invalid substitutions for `$localize` (expected all substitution arguments to be expressions).',
    );
  }
  return [
    expressions.map((path) => path.node),
    expressions.map((expression) => getLocation(fs, expression)),
  ];
}

/**
 * Parse the tagged template literal to extract the message parts.
 *
 * @param elements The elements of the template literal to process.
 * @param fs The file system to use when computing source-map paths. If not provided then it uses
 *     the "current" FileSystem.
 * @publicApi used by CLI
 */
export function unwrapMessagePartsFromTemplateLiteral(
  elements: NodePath<t.TemplateElement>[],
  fs: PathManipulation = getFileSystem(),
): [TemplateStringsArray, (ɵSourceLocation | undefined)[]] {
  const cooked = elements.map((q) => {
    if (q.node.value.cooked === undefined) {
      throw new BabelParseError(
        q.node,
        `Unexpected undefined message part in "${elements.map((q) => q.node.value.cooked)}"`,
      );
    }
    return q.node.value.cooked;
  });
  const raw = elements.map((q) => q.node.value.raw);
  const locations = elements.map((q) => getLocation(fs, q));
  return [ɵmakeTemplateObject(cooked, raw), locations];
}

/**
 * Parse the tagged template literal to extract the interpolation expressions.
 *
 * @param quasi The AST node of the template literal to process.
 * @param fs The file system to use when computing source-map paths. If not provided then it uses
 *     the "current" FileSystem.
 * @publicApi used by CLI
 */
export function unwrapExpressionsFromTemplateLiteral(
  quasi: NodePath<t.TemplateLiteral>,
  fs: PathManipulation = getFileSystem(),
): [t.Expression[], (ɵSourceLocation | undefined)[]] {
  return [
    quasi.node.expressions as t.Expression[],
    quasi.get('expressions').map((e) => getLocation(fs, e)),
  ];
}

/**
 * Wrap the given `expression` in parentheses if it is a binary expression.
 *
 * This ensures that this expression is evaluated correctly if it is embedded in another expression.
 *
 * @param expression The expression to potentially wrap.
 */
export function wrapInParensIfNecessary(expression: t.Expression): t.Expression {
  if (t.isBinaryExpression(expression)) {
    return t.parenthesizedExpression(expression);
  } else {
    return expression;
  }
}

/**
 * Extract the string values from an `array` of string literals.
 *
 * @param array The array to unwrap.
 * @param fs The file system to use when computing source-map paths. If not provided then it uses
 *     the "current" FileSystem.
 */
export function unwrapStringLiteralArray(
  array: NodePath<t.Expression>,
  fs: PathManipulation = getFileSystem(),
): [string[], (ɵSourceLocation | undefined)[]] {
  if (!isStringLiteralArray(array.node)) {
    throw new BabelParseError(
      array.node,
      'Unexpected messageParts for `$localize` (expected an array of strings).',
    );
  }
  const elements = array.get('elements') as NodePath<t.StringLiteral>[];
  return [elements.map((str) => str.node.value), elements.map((str) => getLocation(fs, str))];
}

/**
 * This expression is believed to be a call to a "lazy-load" template object helper function.
 * This is expected to be of the form:
 *
 * ```ts
 *  function _templateObject() {
 *    var e = _taggedTemplateLiteral(['cooked string', 'raw string']);
 *    return _templateObject = function() { return e }, e
 *  }
 * ```
 *
 * We unwrap this to return the call to `_taggedTemplateLiteral()`.
 *
 * @param call the call expression to unwrap
 * @returns the  call expression
 */
export function unwrapLazyLoadHelperCall(
  call: NodePath<t.CallExpression>,
): NodePath<t.CallExpression> {
  const callee = call.get('callee');
  if (!callee.isIdentifier()) {
    throw new BabelParseError(
      callee.node,
      'Unexpected lazy-load helper call (expected a call of the form `_templateObject()`).',
    );
  }
  const lazyLoadBinding = call.scope.getBinding(callee.node.name);
  if (!lazyLoadBinding) {
    throw new BabelParseError(callee.node, 'Missing declaration for lazy-load helper function');
  }
  const lazyLoadFn = lazyLoadBinding.path;
  if (!lazyLoadFn.isFunctionDeclaration()) {
    throw new BabelParseError(
      lazyLoadFn.node,
      'Unexpected expression (expected a function declaration',
    );
  }
  const returnedNode = getReturnedExpression(lazyLoadFn);

  if (returnedNode.isCallExpression()) {
    return returnedNode;
  }

  if (returnedNode.isIdentifier()) {
    const identifierName = returnedNode.node.name;
    const declaration = returnedNode.scope.getBinding(identifierName);
    if (declaration === undefined) {
      throw new BabelParseError(
        returnedNode.node,
        'Missing declaration for return value from helper.',
      );
    }
    if (!declaration.path.isVariableDeclarator()) {
      throw new BabelParseError(
        declaration.path.node,
        'Unexpected helper return value declaration (expected a variable declaration).',
      );
    }
    const initializer = declaration.path.get('init');
    if (!initializer.isCallExpression()) {
      throw new BabelParseError(
        declaration.path.node,
        'Unexpected return value from helper (expected a call expression).',
      );
    }

    // Remove the lazy load helper if this is the only reference to it.
    if (lazyLoadBinding.references === 1) {
      lazyLoadFn.remove();
    }

    return initializer;
  }
  return call;
}

function getReturnedExpression(fn: NodePath<t.FunctionDeclaration>): NodePath<t.Expression> {
  const bodyStatements = fn.get('body').get('body');
  for (const statement of bodyStatements) {
    if (statement.isReturnStatement()) {
      const argument = statement.get('argument');
      if (argument.isSequenceExpression()) {
        const expressions = argument.get('expressions');
        return Array.isArray(expressions) ? expressions[expressions.length - 1] : expressions;
      } else if (argument.isExpression()) {
        return argument;
      } else {
        throw new BabelParseError(
          statement.node,
          'Invalid return argument in helper function (expected an expression).',
        );
      }
    }
  }
  throw new BabelParseError(fn.node, 'Missing return statement in helper function.');
}

/**
 * Is the given `node` an array of literal strings?
 *
 * @param node The node to test.
 */
export function isStringLiteralArray(
  node: t.Node,
): node is t.Expression & {elements: t.StringLiteral[]} {
  return t.isArrayExpression(node) && node.elements.every((element) => t.isStringLiteral(element));
}

/**
 * Are all the given `nodes` expressions?
 * @param nodes The nodes to test.
 */
export function isArrayOfExpressions(paths: NodePath<t.Node>[]): paths is NodePath<t.Expression>[] {
  return paths.every((element) => element.isExpression());
}

/** Options that affect how the `makeEsXXXTranslatePlugin()` functions work. */
export interface TranslatePluginOptions {
  missingTranslation?: DiagnosticHandlingStrategy;
  localizeName?: string;
}

/**
 * Translate the text of the given message, using the given translations.
 *
 * Logs as warning if the translation is not available
 * @publicApi used by CLI
 */
export function translate(
  diagnostics: Diagnostics,
  translations: Record<string, ɵParsedTranslation>,
  messageParts: TemplateStringsArray,
  substitutions: readonly any[],
  missingTranslation: DiagnosticHandlingStrategy,
): [TemplateStringsArray, readonly any[]] {
  try {
    return ɵtranslate(translations, messageParts, substitutions);
  } catch (e: any) {
    if (ɵisMissingTranslationError(e)) {
      diagnostics.add(missingTranslation, e.message);
      // Return the parsed message because this will have the meta blocks stripped
      return [
        ɵmakeTemplateObject(e.parsedMessage.messageParts, e.parsedMessage.messageParts),
        substitutions,
      ];
    } else {
      diagnostics.error(e.message);
      return [messageParts, substitutions];
    }
  }
}

export class BabelParseError extends Error {
  private readonly type = 'BabelParseError';
  constructor(
    public node: t.Node,
    message: string,
  ) {
    super(message);
  }
}

export function isBabelParseError(e: any): e is BabelParseError {
  return e.type === 'BabelParseError';
}

export function buildCodeFrameError(
  fs: PathManipulation,
  path: NodePath,
  file: BabelFile,
  e: BabelParseError,
): string {
  let filename = file.opts.filename;
  if (filename) {
    filename = fs.resolve(filename);
    let cwd = file.opts.cwd;
    if (cwd) {
      cwd = fs.resolve(cwd);
      filename = fs.relative(cwd, filename);
    }
  } else {
    filename = '(unknown file)';
  }
  const {message} = file.hub.buildError(e.node, e.message);
  return `${filename}: ${message}`;
}

export function getLocation(
  fs: PathManipulation,
  startPath: NodePath,
  endPath?: NodePath,
): ɵSourceLocation | undefined {
  const startLocation = startPath.node.loc;
  const file = getFileFromPath(fs, startPath);
  if (!startLocation || !file) {
    return undefined;
  }

  const endLocation =
    (endPath && getFileFromPath(fs, endPath) === file && endPath.node.loc) || startLocation;

  return {
    start: getLineAndColumn(startLocation.start),
    end: getLineAndColumn(endLocation.end),
    file,
    text: startPath.getSource() || undefined,
  };
}

export function serializeLocationPosition(location: ɵSourceLocation): string {
  const endLineString =
    location.end !== undefined && location.end.line !== location.start.line
      ? `,${location.end.line + 1}`
      : '';
  return `${location.start.line + 1}${endLineString}`;
}

function getFileFromPath(fs: PathManipulation, path: NodePath | undefined): AbsoluteFsPath | null {
  // The file field is not guaranteed to be present for all node paths
  const opts = (path?.hub as {file?: BabelFile}).file?.opts;
  const filename = opts?.filename;
  if (!filename || !opts.cwd) {
    return null;
  }
  const relativePath = fs.relative(opts.cwd, filename);
  const root = opts.generatorOpts?.sourceRoot ?? opts.cwd;
  const absPath = fs.resolve(root, relativePath);
  return absPath;
}

function getLineAndColumn(loc: {line: number; column: number}): {line: number; column: number} {
  // Note we want 0-based line numbers but Babel returns 1-based.
  return {line: loc.line - 1, column: loc.column};
}
