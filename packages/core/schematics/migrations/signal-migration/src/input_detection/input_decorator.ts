/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {getAngularDecorators} from '../../../../../../compiler-cli/src/ngtsc/annotations';
import {parseDecoratorInputTransformFunction} from '../../../../../../compiler-cli/src/ngtsc/annotations/directive';
import {FatalDiagnosticError} from '../../../../../../compiler-cli/src/ngtsc/diagnostics';
import {Reference, ReferenceEmitter} from '../../../../../../compiler-cli/src/ngtsc/imports';
import {
  DecoratorInputTransform,
  DtsMetadataReader,
  InputMapping,
} from '../../../../../../compiler-cli/src/ngtsc/metadata';
import {
  DynamicValue,
  PartialEvaluator,
  ResolvedValueMap,
} from '../../../../../../compiler-cli/src/ngtsc/partial_evaluator';
import {
  ClassDeclaration,
  DecoratorIdentifier,
  ReflectionHost,
} from '../../../../../../compiler-cli/src/ngtsc/reflection';
import {CompilationMode} from '../../../../../../compiler-cli/src/ngtsc/transform';
import {MigrationHost} from '../migration_host';
import {InputNode, isInputContainerNode} from '../input_detection/input_node';

/** Metadata extracted of an input declaration (in `.ts` or `.d.ts` files). */
export interface ExtractedInput extends InputMapping {
  inSourceFile: boolean;
  inputDecoratorRef: DecoratorIdentifier | null;
}

/** Attempts to extract metadata of a potential TypeScript `@Input()` declaration. */
export function extractDecoratorInput(
  node: ts.Node,
  host: MigrationHost,
  reflector: ReflectionHost,
  metadataReader: DtsMetadataReader,
  evaluator: PartialEvaluator,
  refEmitter: ReferenceEmitter,
): ExtractedInput | null {
  return (
    extractSourceCodeInput(node, host, reflector, evaluator, refEmitter) ??
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

  const directiveMetadata = metadataReader.getDirectiveMetadata(
    new Reference(node.parent as ClassDeclaration),
  );
  const inputMapping = directiveMetadata?.inputs.getByClassPropertyName(node.name.text);

  // Signal inputs are never tracked and migrated.
  if (inputMapping?.isSignal) {
    return null;
  }

  return inputMapping == null
    ? null
    : {
        ...inputMapping,
        inputDecoratorRef: null,
        inSourceFile: false,
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
  refEmitter: ReferenceEmitter,
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
        transformResult = parseTransformOfInput(evaluatedInputOpts, node, reflector, refEmitter);
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
    inputDecoratorRef: inputDecorator.identifier,
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
  refEmitter: ReferenceEmitter,
): DecoratorInputTransform | null {
  const transformValue = evaluatedInputOpts.get('transform');
  if (!(transformValue instanceof DynamicValue) && !(transformValue instanceof Reference)) {
    return null;
  }

  try {
    return parseDecoratorInputTransformFunction(
      node.parent as ClassDeclaration,
      node.name.text,
      transformValue,
      reflector,
      refEmitter,
      CompilationMode.FULL,
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
