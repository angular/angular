/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as compiler from '@angular/compiler';
import {TemplateMigrator, Update} from '../../template-migrator';
import {replaceStartTag, replaceEndTag, visitElements} from '../../tree-traversal';

/** Stores a mat-chip-list with the mat-chip elements nested within it. */
interface ChipMap {
  chipList: compiler.TmplAstElement;
  chips: compiler.TmplAstElement[];
}

export class ChipsTemplateMigrator extends TemplateMigrator {
  /** Stores the mat-chip-list elements with their nested mat-chip elements. */
  chipMap?: ChipMap;

  /** All of the ChipMaps found while parsing a template AST. */
  chipMaps: ChipMap[] = [];

  /** Chips that are not nested within mat-chip elements. */
  standaloneChips: compiler.TmplAstElement[] = [];

  /** Input elements that have matChipInputFor attributes. */
  chipInputs: compiler.TmplAstBoundAttribute[] = [];

  getUpdates(ast: compiler.ParsedTemplate): Update[] {
    this._gatherDomData(ast);
    const updates: Update[] = [];
    this.chipMaps.forEach(chipMap => {
      if (this._isChipGrid(chipMap.chipList)) {
        updates.push(...this._buildUpdatesForChipMap(chipMap, 'mat-chip-grid', 'mat-chip-row'));
        return;
      }
      updates.push(...this._buildUpdatesForChipMap(chipMap, 'mat-chip-listbox', 'mat-chip-option'));
    });
    this.standaloneChips.forEach(chip => {
      updates.push(...this._buildTagUpdates(chip, 'mat-chip-option'));
    });
    return updates;
  }

  /** Traverses the AST and stores all relevant DOM data needed for building updates. */
  private _gatherDomData(ast: compiler.ParsedTemplate): void {
    this.chipMap = undefined;
    this.chipMaps = [];
    this.standaloneChips = [];
    this.chipInputs = [];

    visitElements(
      ast.nodes,
      (node: compiler.TmplAstElement) => {
        switch (node.name) {
          case 'input':
            this._handleInputNode(node);
            break;
          case 'mat-chip-list':
            this.chipMap = {chipList: node, chips: []};
            break;
          case 'mat-chip':
            this.chipMap ? this.chipMap.chips.push(node) : this.standaloneChips.push(node);
        }
      },
      (node: compiler.TmplAstElement) => {
        if (node.name === 'mat-chip-list') {
          this.chipMaps.push(this.chipMap!);
          this.chipMap = undefined;
        }
      },
    );
  }

  /** Returns the mat-chip-list and mat-chip updates for the given ChipMap. */
  private _buildUpdatesForChipMap(
    chipMap: ChipMap,
    chipListTagName: string,
    chipTagName: string,
  ): Update[] {
    const updates: Update[] = [];
    updates.push(...this._buildTagUpdates(chipMap.chipList, chipListTagName));
    chipMap.chips.forEach(chip => updates.push(...this._buildTagUpdates(chip, chipTagName)));
    return updates;
  }

  /** Creates and returns the start and end tag updates for the given node. */
  private _buildTagUpdates(node: compiler.TmplAstElement, tagName: string): Update[] {
    return [
      {
        location: node.startSourceSpan.start,
        updateFn: html => replaceStartTag(html, node, tagName),
      },
      {
        location: node.endSourceSpan!.start,
        updateFn: html => replaceEndTag(html, node, tagName),
      },
    ];
  }

  /** Stores the given input node if it has a matChipInputFor attribute. */
  private _handleInputNode(node: compiler.TmplAstElement): void {
    node.inputs.forEach(attr => {
      if (attr.name === 'matChipInputFor') {
        this.chipInputs.push(attr);
      }
    });
  }

  /** Returns true if the given mat-chip-list is referenced by any inputs. */
  private _isChipGrid(node: compiler.TmplAstElement): boolean {
    return node.references.some(ref => {
      return this.chipInputs.some(attr => {
        return ref.name === (attr.value as compiler.ASTWithSource).source;
      });
    });
  }
}
