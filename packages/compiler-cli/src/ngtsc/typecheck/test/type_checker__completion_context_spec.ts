/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TmplAstElement, TmplAstTemplate} from '@angular/compiler';
import * as ts from 'typescript';

import {absoluteFrom, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {getTokenAtPosition} from '../../util/src/typescript';
import {OptimizeFor, TemplateTypeChecker, TypeCheckingConfig} from '../api';
import {ReusedProgramStrategy} from '../src/augmented_program';

import {getClass, getLineAtPositionWithCursor, ngForDeclaration, ngForDts, setup as baseTestSetup, TypeCheckingTarget} from './test_utils';

runInEachFileSystem(() => {
  describe('global completion positions', () => {
    describe('for the top-level of a template', () => {
      it('should include available references', () => {
        const fileName = absoluteFrom('/main.ts');
        const {templateTypeChecker, program, programStrategy} = setup([{
          fileName,
          templates: {
            'Cmp': `<div #refA></div><span #refB></span>`,
          },
          source: `export class Cmp { propA: string; propB: number; }`,
        }]);

        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');

        const completionPos =
            templateTypeChecker.getGlobalCompletionPosition(cmp, /* top-level context */ null);
        if (completionPos === null) {
          return fail('Null context!');
        }

        const file = programStrategy.getProgram().getSourceFile(completionPos.shimFile)!;
        const node = getTokenAtPosition(file, completionPos.position - 2);
        if (!ts.isIdentifier(node)) {
          return fail(`Expected context to be a ts.Identifier, got ${ts.SyntaxKind[node.kind]}`);
        }

        const checker = programStrategy.getProgram().getTypeChecker();

        expect(getDeclaredTypeString(node, checker))
            .toEqual('Omit<typeof ctx, "refA" | "refB"> & { refA: typeof _t1; refB: typeof _t3; }');
        expect(getProperties(node, checker)).toEqual(new Set(['propA', 'propB', 'refA', 'refB']));
      });

      it('should not result in additional diagnostics when generated', () => {
        const fileName = absoluteFrom('/main.ts');
        const templateString = `<div *ngFor="let item of items"></div>`;
        const {templateTypeChecker, program, programStrategy} = setup(
            [
              {
                fileName,
                templates: {'Cmp': templateString},
                source: `export class Cmp { items: string[]; other: number; }`,
                declarations: [ngForDeclaration()]
              },
              ngForDts(),
            ],
        );
        const sf = getSourceFileOrError(program, fileName);
        const diags = templateTypeChecker.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram);
        expect(diags.length).toBe(0);
      });
    });

    describe('for embedded views', () => {
      it('should include declared variables', () => {
        const fileName = absoluteFrom('/main.ts');
        const templateString = `<div *ngFor="let item of items"></div>`;
        const {templateTypeChecker, program, programStrategy} = setup(
            [
              {
                fileName,
                templates: {'Cmp': templateString},
                source: `export class Cmp { items: string[]; other: number; }`,
                declarations: [ngForDeclaration()]
              },
              ngForDts(),
            ],
        );
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');
        const embeddedView = templateTypeChecker.getTemplate(cmp)![0] as TmplAstTemplate;

        const completionPos = templateTypeChecker.getGlobalCompletionPosition(cmp, embeddedView);
        if (completionPos === null) {
          return fail('Null context!');
        }

        const file = programStrategy.getProgram().getSourceFile(completionPos.shimFile)!;
        const node = getTokenAtPosition(file, completionPos.position - 2);
        if (!ts.isIdentifier(node)) {
          return fail(`Expected context to be a ts.Identifier, got ${ts.SyntaxKind[node.kind]}`);
        }

        const checker = programStrategy.getProgram().getTypeChecker();

        expect(getDeclaredTypeString(node, checker))
            .toEqual('Omit<typeof _t1, "item"> & { item: typeof _t4; }');
        expect(getProperties(node, checker)).toEqual(new Set(['items', 'other', 'item']));
      });

      it('should support multiple levels of nesting', () => {
        const fileName = absoluteFrom('/main.ts');
        const templateString = `
              <span #refA></span>
              <div *ngFor="let varA of items">
                <span #refB></span>
                <div *ngFor="let varB of item.subitems"></div>
              </div>
            `;
        const {templateTypeChecker, program, programStrategy} = setup(
            [
              {
                fileName,
                templates: {'Cmp': templateString},
                source: `export class Cmp { propA: string; propB: number; }`,
                declarations: [ngForDeclaration()]
              },
              ngForDts(),
            ],
        );
        const sf = getSourceFileOrError(program, fileName);
        const cmp = getClass(sf, 'Cmp');
        const embeddedViewA = templateTypeChecker.getTemplate(cmp)![1] as TmplAstTemplate;
        const embeddedViewB =
            (embeddedViewA.children[0] as TmplAstElement).children[1] as TmplAstTemplate;

        const completionPos = templateTypeChecker.getGlobalCompletionPosition(cmp, embeddedViewB);
        if (completionPos === null) {
          return fail('Null context!');
        }

        const file = programStrategy.getProgram().getSourceFile(completionPos.shimFile)!;
        const node = getTokenAtPosition(file, completionPos.position - 2);
        if (!ts.isIdentifier(node)) {
          return fail(`Expected context to be a ts.Identifier, got ${ts.SyntaxKind[node.kind]}`);
        }

        const checker = programStrategy.getProgram().getTypeChecker();

        expect(getProperties(node, checker)).toEqual(new Set([
          'propA', 'propB', 'varA', 'varB', 'refA', 'refB'
        ]));
      });
    });

    it('should not result in additional diagnostics when generated', () => {
      const fileName = absoluteFrom('/main.ts');
      const templateString = `<div *ngFor="let item of items"></div>`;
      const {templateTypeChecker, program, programStrategy} = setup(
          [
            {
              fileName,
              templates: {'Cmp': templateString},
              source: `export class Cmp { items: string[]; other: number; }`,
              declarations: [ngForDeclaration()]
            },
            ngForDts(),
          ],
      );
      const sf = getSourceFileOrError(program, fileName);
      const diags = templateTypeChecker.getDiagnosticsForFile(sf, OptimizeFor.WholeProgram);
      expect(diags.length).toBe(0);
    });
  });
});

export function setup(targets: TypeCheckingTarget[], config?: Partial<TypeCheckingConfig>): {
  templateTypeChecker: TemplateTypeChecker,
  program: ts.Program,
  programStrategy: ReusedProgramStrategy,
} {
  return baseTestSetup(
      targets, {inlining: false, config: {...config, enableTemplateTypeChecker: true}});
}

function getDeclaredTypeString(node: ts.Node, checker: ts.TypeChecker): string {
  const symbol = checker.getSymbolAtLocation(node);
  if (symbol === undefined) {
    throw new Error(`Expected defined symbol`);
  } else if (!ts.isVariableDeclaration(symbol.valueDeclaration)) {
    throw new Error(`Expected ts.VariableDeclaration`);
  } else if (symbol.valueDeclaration.type === undefined) {
    throw new Error(`Expected explicit type node for ts.VariableDeclaration`);
  }

  return symbol.valueDeclaration.type.getText().replace(/[\r\n\t ]+/g, ' ');
}

function getProperties(node: ts.Node, checker: ts.TypeChecker): Set<string> {
  const type = checker.getTypeAtLocation(node);
  return new Set(checker.getPropertiesOfType(type).map(sym => sym.escapedName as string));
}
