/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Tree} from '@angular-devkit/schematics';
import ts from 'typescript';

import {NgComponentTemplateVisitor} from '../../utils/ng_component_template';

// Use it instead of individually passing all 3 arguments down the call stack
export class ComponentTemplatesResolver {
  constructor(private typeChecker: ts.TypeChecker, private tree: Tree, private basePath: string) {}

  resolveTemplates(classDeclaration: ts.ClassDeclaration) {
    const templateVisitor =
        new NgComponentTemplateVisitor(this.typeChecker, this.basePath, this.tree);
    templateVisitor.visitNode(classDeclaration);
    return templateVisitor.resolvedTemplates;
  }
}
