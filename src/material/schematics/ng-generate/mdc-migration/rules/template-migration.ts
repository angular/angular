/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Migration, ResolvedResource} from '@angular/cdk/schematics';
import {SchematicContext} from '@angular-devkit/schematics';
import {StyleMigrator} from './style-migrator';
import * as compiler from '@angular/compiler';

/**
 * Traverses the given tree of nodes and runs the given callbacks for each Element node encountered.
 *
 * Note that updates to the start tags of html element should be done in the postorder callback,
 * and updates to the end tags of html elements should be done in the preorder callback to avoid
 * issues with line collisions.
 *
 * @param nodes The nodes of the ast from a parsed template.
 * @param preorderCallback A function that gets run for each Element node in a preorder traversal.
 * @param postorderCallback A function that gets run for each Element node in a postorder traversal.
 */
function visitElements(
  nodes: compiler.TmplAstNode[],
  preorderCallback: (node: compiler.TmplAstElement) => void = () => {},
  postorderCallback: (node: compiler.TmplAstElement) => void = () => {},
): void {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node instanceof compiler.TmplAstElement) {
      preorderCallback(node);
      visitElements(node.children, preorderCallback, postorderCallback);
      postorderCallback(node);
    }
  }
}

export class TemplateMigration extends Migration<StyleMigrator[], SchematicContext> {
  enabled = true;

  override visitTemplate(template: ResolvedResource) {
    const ast = compiler.parseTemplate(template.content, template.filePath, {
      preserveWhitespaces: true,
      preserveLineEndings: true,
      leadingTriviaChars: [],
    });

    visitElements(ast.nodes, node => {
      // TODO(wagnermaciel): implement the migration updates.
    });

    this.fileSystem.overwrite(template.filePath, template.content);
  }
}
