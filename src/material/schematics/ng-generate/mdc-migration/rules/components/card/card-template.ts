/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as compiler from '@angular/compiler';
import {TemplateMigrator} from '../../template-migrator';
import {addAttribute, visitElements} from '../../tree-traversal';
import {Update} from '../../../../../migration-utilities';

export class CardTemplateMigrator extends TemplateMigrator {
  getUpdates(ast: compiler.ParsedTemplate): Update[] {
    const updates: Update[] = [];

    visitElements(ast.nodes, (node: compiler.TmplAstElement) => {
      if (node.name !== 'mat-card') {
        return;
      }

      updates.push({
        offset: node.startSourceSpan.start.offset,
        updateFn: html => addAttribute(html, node, 'appearance', 'outlined'),
      });
    });

    return updates;
  }
}
