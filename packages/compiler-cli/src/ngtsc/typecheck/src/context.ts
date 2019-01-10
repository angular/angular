/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {R3TargetBinder, SelectorMatcher, TmplAstNode} from '@angular/compiler';
import * as ts from 'typescript';

import {ImportManager} from '../../translator';

import {TypeCheckBlockMetadata, TypeCheckableDirectiveMeta, TypeCtorMetadata} from './api';
import {generateTypeCheckBlock} from './type_check_block';
import {generateTypeCtor} from './type_constructor';


/**
 * A template type checking context for a program.
 *
 * The `TypeCheckContext` allows registration of components and their templates which need to be
 * type checked. It also allows generation of modified `ts.SourceFile`s which contain the type
 * checking code.
 */
export class TypeCheckContext {
  /**
   * A `Set` of classes which will be used to generate type constructors.
   */
  private typeCtors = new Set<ts.ClassDeclaration>();

  /**
   * A `Map` of `ts.SourceFile`s that the context has seen to the operations (additions of methods
   * or type-check blocks) that need to be eventually performed on that file.
   */
  private opMap = new Map<ts.SourceFile, Op[]>();

  /**
   * Record a template for the given component `node`, with a `SelectorMatcher` for directive
   * matching.
   *
   * @param node class of the node being recorded.
   * @param template AST nodes of the template being recorded.
   * @param matcher `SelectorMatcher` which tracks directives that are in scope for this template.
   */
  addTemplate(
      node: ts.ClassDeclaration, template: TmplAstNode[],
      matcher: SelectorMatcher<TypeCheckableDirectiveMeta>): void {
    // Only write TCBs for named classes.
    if (node.name === undefined) {
      throw new Error(`Assertion: class must be named`);
    }

    // Bind the template, which will:
    //   - Extract the metadata needed to generate type check blocks.
    //   - Perform directive matching, which informs the context which directives are used in the
    //     template. This allows generation of type constructors for only those directives which
    //     are actually used by the templates.
    const binder = new R3TargetBinder(matcher);
    const boundTarget = binder.bind({template});

    // Get all of the directives used in the template and record type constructors for all of them.
    boundTarget.getUsedDirectives().forEach(dir => {
      const dirNode = dir.ref.node;
      // Add a type constructor operation for the directive.
      this.addTypeCtor(dirNode.getSourceFile(), dirNode, {
        fnName: 'ngTypeCtor',
        // The constructor should have a body if the directive comes from a .ts file, but not if it
        // comes from a .d.ts file. .d.ts declarations don't have bodies.
        body: !dirNode.getSourceFile().fileName.endsWith('.d.ts'),
        fields: {
          inputs: Object.keys(dir.inputs),
          outputs: Object.keys(dir.outputs),
          // TODO: support queries
          queries: dir.queries,
        },
      });
    });

    // Record the type check block operation for the template itself.
    this.addTypeCheckBlock(node.getSourceFile(), node, {
      boundTarget,
      fnName: `${node.name.text}_TypeCheckBlock`,
    });
  }

  /**
   * Record a type constructor for the given `node` with the given `ctorMetadata`.
   */
  addTypeCtor(sf: ts.SourceFile, node: ts.ClassDeclaration, ctorMeta: TypeCtorMetadata): void {
    if (this.hasTypeCtor(node)) {
      return;
    }
    // Lazily construct the operation map.
    if (!this.opMap.has(sf)) {
      this.opMap.set(sf, []);
    }
    const ops = this.opMap.get(sf) !;

    // Push a `TypeCtorOp` into the operation queue for the source file.
    ops.push(new TypeCtorOp(node, ctorMeta));
  }

  /**
   * Transform a `ts.SourceFile` into a version that includes type checking code.
   *
   * If this particular source file has no directives that require type constructors, or components
   * that require type check blocks, then it will be returned directly. Otherwise, a new
   * `ts.SourceFile` is parsed from modified text of the original. This is necessary to ensure the
   * added code has correct positional information associated with it.
   */
  transform(sf: ts.SourceFile): ts.SourceFile {
    // If there are no operations pending for this particular file, return it directly.
    if (!this.opMap.has(sf)) {
      return sf;
    }

    // Imports may need to be added to the file to support type-checking of directives used in the
    // template within it.
    const importManager = new ImportManager(false, '_i');

    // Each Op has a splitPoint index into the text where it needs to be inserted. Split the
    // original source text into chunks at these split points, where code will be inserted between
    // the chunks.
    const ops = this.opMap.get(sf) !.sort(orderOps);
    const textParts = splitStringAtPoints(sf.text, ops.map(op => op.splitPoint));

    // Use a `ts.Printer` to generate source code.
    const printer = ts.createPrinter({omitTrailingSemicolon: true});

    // Begin with the intial section of the code text.
    let code = textParts[0];

    // Process each operation and use the printer to generate source code for it, inserting it into
    // the source code in between the original chunks.
    ops.forEach((op, idx) => {
      const text = op.execute(importManager, sf, printer);
      code += text + textParts[idx + 1];
    });

    // Write out the imports that need to be added to the beginning of the file.
    let imports = importManager.getAllImports(sf.fileName, null)
                      .map(i => `import * as ${i.as} from '${i.name}';`)
                      .join('\n');
    code = imports + '\n' + code;

    // Parse the new source file and return it.
    return ts.createSourceFile(sf.fileName, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  }

  /**
   * Whether the given `node` has a type constructor already.
   */
  private hasTypeCtor(node: ts.ClassDeclaration): boolean { return this.typeCtors.has(node); }

  private addTypeCheckBlock(
      sf: ts.SourceFile, node: ts.ClassDeclaration, tcbMeta: TypeCheckBlockMetadata): void {
    if (!this.opMap.has(sf)) {
      this.opMap.set(sf, []);
    }
    const ops = this.opMap.get(sf) !;
    ops.push(new TcbOp(node, tcbMeta));
  }
}

/**
 * A code generation operation that needs to happen within a given source file.
 */
interface Op {
  /**
   * The node in the file which will have code generated for it.
   */
  readonly node: ts.ClassDeclaration;

  /**
   * Index into the source text where the code generated by the operation should be inserted.
   */
  readonly splitPoint: number;

  /**
   * Execute the operation and return the generated code as text.
   */
  execute(im: ImportManager, sf: ts.SourceFile, printer: ts.Printer): string;
}

/**
 * A type check block operation which produces type check code for a particular component.
 */
class TcbOp implements Op {
  constructor(readonly node: ts.ClassDeclaration, readonly meta: TypeCheckBlockMetadata) {}

  /**
   * Type check blocks are inserted immediately after the end of the component class.
   */
  get splitPoint(): number { return this.node.end + 1; }

  execute(im: ImportManager, sf: ts.SourceFile, printer: ts.Printer): string {
    const tcb = generateTypeCheckBlock(this.node, this.meta, im);
    return printer.printNode(ts.EmitHint.Unspecified, tcb, sf);
  }
}

/**
 * A type constructor operation which produces type constructor code for a particular directive.
 */
class TypeCtorOp implements Op {
  constructor(readonly node: ts.ClassDeclaration, readonly meta: TypeCtorMetadata) {}

  /**
   * Type constructor operations are inserted immediately before the end of the directive class.
   */
  get splitPoint(): number { return this.node.end - 1; }

  execute(im: ImportManager, sf: ts.SourceFile, printer: ts.Printer): string {
    const tcb = generateTypeCtor(this.node, this.meta);
    return printer.printNode(ts.EmitHint.Unspecified, tcb, sf);
  }
}

/**
 * Compare two operations and return their split point ordering.
 */
function orderOps(op1: Op, op2: Op): number {
  return op1.splitPoint - op2.splitPoint;
}

/**
 * Split a string into chunks at any number of split points.
 */
function splitStringAtPoints(str: string, points: number[]): string[] {
  const splits: string[] = [];
  let start = 0;
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    splits.push(str.substring(start, point));
    start = point;
  }
  splits.push(str.substring(start));
  return splits;
}
