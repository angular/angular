/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {
  ClassDeclaration,
  CompilationMode,
  Decorator,
  DecoratorInputTransform,
  DirectiveMeta,
  DtsMetadataReader,
  DynamicValue,
  FatalDiagnosticError,
  getAngularDecorators,
  InputMapping,
  parseDecoratorInputTransformFunction,
  PartialEvaluator,
  Reference,
  ReferenceEmitKind,
  ReferenceEmitter,
  ReflectionHost,
  ResolvedValueMap,
} from '@angular/compiler-cli';
import {NULL_EXPR} from '../../../../../../compiler/src/output/output_ast';
import {InputNode, isInputContainerNode} from '../input_detection/input_node';
import {MigrationHost} from '../migration_host';

/** Metadata extracted of an input declaration (in `.ts` or `.d.ts` files). */
export interface ExtractedInput extends InputMapping {
  inSourceFile: boolean;
  inputDecorator: Decorator | null;
  fieldDecorators: Decorator[];
}

/** Attempts to extract metadata of a potential TypeScript `@Input()` declaration. */
export function extractDecoratorInput(
  node: ts.Node,
  host: MigrationHost,
  reflector: ReflectionHost,
  metadataReader: DtsMetadataReader,
  evaluator: PartialEvaluator,
): ExtractedInput | null {
  return (
    extractSourceCodeInput(node, host, reflector, evaluator) ??
    extractDtsInput(node, metadataReader)
  );
}

/**
 * Attempts to extract `@Input()` information for the given node, assuming it's
 * part of a `.d.ts` file.
 */
function extractDtsInput(node: ts.Node, metadataReader: DtsMetadataReader): ExtractedInput | null {
  if (
    !isInputContainerNode(node) ||
    !ts.isIdentifier(node.name) ||
    !node.getSourceFile().isDeclarationFile
  ) {
    return null;
  }
  // If the potential node is not part of a valid input class, skip.
  if (
    !ts.isClassDeclaration(node.parent) ||
    node.parent.name === undefined ||
    !ts.isIdentifier(node.parent.name)
  ) {
    return null;
  }

  let directiveMetadata: DirectiveMeta | null = null;

  // Getting directive metadata can throw errors when e.g. types referenced
  // in the `.d.ts` aren't resolvable. This seems to be unexpected and shouldn't
  // result in the entire migration to be failing.
  try {
    directiveMetadata = metadataReader.getDirectiveMetadata(
      new Reference(node.parent as ClassDeclaration),
    );
  } catch (e) {
    console.error('Unexpected error. Gracefully ignoring.');
    console.error('Could not parse directive metadata:', e);
    return null;
  }
  const inputMapping = directiveMetadata?.inputs.getByClassPropertyName(node.name.text);

  // Signal inputs are never tracked and migrated.
  if (inputMapping?.isSignal) {
    return null;
  }

  return inputMapping == null
    ? null
    : {
        ...inputMapping,
        inputDecorator: null,
        inSourceFile: false,
        // Inputs from `.d.ts` cannot have any field decorators applied.
        fieldDecorators: [],
      };
}

/**
 * Attempts to extract `@Input()` information for the given node, assuming it's
 * directly defined inside a source file (`.ts`).
 */
function extractSourceCodeInput(
  node: ts.Node,
  host: MigrationHost,
  reflector: ReflectionHost,
  evaluator: PartialEvaluator,
): ExtractedInput | null {
  if (
    !isInputContainerNode(node) ||
    !ts.isIdentifier(node.name) ||
    node.getSourceFile().isDeclarationFile
  ) {
    return null;
  }
  const decorators = reflector.getDecoratorsOfDeclaration(node);
  if (decorators === null) {
    return null;
  }
  const ngDecorators = getAngularDecorators(decorators, ['Input'], host.isMigratingCore);
  if (ngDecorators.length === 0) {
    return null;
  }
  const inputDecorator = ngDecorators[0];

  let publicName = node.name.text;
  let isRequired = false;
  let transformResult: DecoratorInputTransform | null = null;

  // Check options object from `@Input()`.
  if (inputDecorator.args?.length === 1) {
    const evaluatedInputOpts = evaluator.evaluate(inputDecorator.args[0]);
    if (typeof evaluatedInputOpts === 'string') {
      publicName = evaluatedInputOpts;
    } else if (evaluatedInputOpts instanceof Map) {
      if (evaluatedInputOpts.has('alias') && typeof evaluatedInputOpts.get('alias') === 'string') {
        publicName = evaluatedInputOpts.get('alias')! as string;
      }
      if (
        evaluatedInputOpts.has('required') &&
        typeof evaluatedInputOpts.get('required') === 'boolean'
      ) {
        isRequired = !!evaluatedInputOpts.get('required');
      }
      if (evaluatedInputOpts.has('transform') && evaluatedInputOpts.get('transform') != null) {
        transformResult = parseTransformOfInput(evaluatedInputOpts, node, reflector);
      }
    }
  }

  return {
    bindingPropertyName: publicName,
    classPropertyName: node.name.text,
    required: isRequired,
    isSignal: false,
    inSourceFile: true,
    transform: transformResult,
    inputDecorator,
    fieldDecorators: decorators,
  };
}

/**
 * Gracefully attempts to parse the `transform` option of an `@Input()`
 * and extracts its metadata.
 */
function parseTransformOfInput(
  evaluatedInputOpts: ResolvedValueMap,
  node: InputNode,
  reflector: ReflectionHost,
): DecoratorInputTransform | null {
  const transformValue = evaluatedInputOpts.get('transform');
  if (!(transformValue instanceof DynamicValue) && !(transformValue instanceof Reference)) {
    return null;
  }

  // For parsing the transform, we don't need a real reference emitter, as
  // the emitter is only used for verifying that the transform type could be
  // copied into e.g. an `ngInputAccept` class member.
  const noopRefEmitter = new ReferenceEmitter([
    {
      emit: () => ({
        kind: ReferenceEmitKind.Success as const,
        expression: NULL_EXPR,
        importedFile: null,
      }),
    },
  ]);

  try {
    return parseDecoratorInputTransformFunction(
      node.parent as ClassDeclaration,
      node.name.text,
      transformValue,
      reflector,
      noopRefEmitter,
      CompilationMode.FULL,
      /* emitDeclarationOnly */ false,
    );
  } catch (e: unknown) {
    if (!(e instanceof FatalDiagnosticError)) {
      throw e;
    }

    // TODO: implement error handling.
    // See failing case: e.g. inherit_definition_feature_spec.ts
    console.error(`${e.node.getSourceFile().fileName}: ${e.toString()}`);
    return null;
  }
}
