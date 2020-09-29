/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TmplAstTemplate} from '@angular/compiler';
import * as ts from 'typescript';

import {absoluteFrom, getSourceFileOrError} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {getTokenAtPosition} from '../../util/src/typescript';
import {CompletionKind, TypeCheckingConfig} from '../api';

import {getClass, setup as baseTestSetup, TypeCheckingTarget} from './test_utils';

runInEachFileSystem(() => {
  describe('TemplateTypeChecker.getGlobalCompletions()', () => {
    it('should return a completion point in the TCB for the component context', () => {
      const MAIN_TS = absoluteFrom('/main.ts');
      const {templateTypeChecker, programStrategy} = setup([
        {
          fileName: MAIN_TS,
          templates: {'SomeCmp': `No special template needed`},
          source: `
            export class SomeCmp {}
          `,
        },
      ]);
      const sf = getSourceFileOrError(programStrategy.getProgram(), MAIN_TS);
      const SomeCmp = getClass(sf, 'SomeCmp');

      const [global, ...rest] =
          templateTypeChecker.getGlobalCompletions(/* root template */ null, SomeCmp);
      expect(rest.length).toBe(0);
      if (global.kind !== CompletionKind.ContextComponent) {
        return fail(`Expected a ContextComponent completion`);
      }
      const tcbSf =
          getSourceFileOrError(programStrategy.getProgram(), absoluteFrom(global.shimPath));
      const node = getTokenAtPosition(tcbSf, global.positionInShimFile).parent;
      if (!ts.isExpressionStatement(node)) {
        return fail(`Expected a ts.ExpressionStatement`);
      }
      expect(node.expression.getText()).toEqual('ctx.');
      // The position should be between the '.' and a following space.
      expect(tcbSf.text.substr(global.positionInShimFile - 1, 2)).toEqual('. ');
    });

    it('should return additional completions for references and variables when available', () => {
      const MAIN_TS = absoluteFrom('/main.ts');
      const {templateTypeChecker, programStrategy} = setup([
        {
          fileName: MAIN_TS,
          templates: {
            'SomeCmp': `
              <div *ngFor="let user of users">
                <div #innerRef></div>
                <div *ngIf="user">
                  <div #notInScope></div>
                </div>
              </div>
              <div #topLevelRef></div>
          `
          },
          source: `
            export class SomeCmp {
              users: string[];
            }
          `,
        },
      ]);
      const sf = getSourceFileOrError(programStrategy.getProgram(), MAIN_TS);
      const SomeCmp = getClass(sf, 'SomeCmp');

      const tmpl = templateTypeChecker.getTemplate(SomeCmp)!;
      const ngForTemplate = tmpl[0] as TmplAstTemplate;

      const [contextCmp, ...rest] =
          templateTypeChecker.getGlobalCompletions(ngForTemplate, SomeCmp);
      if (contextCmp.kind !== CompletionKind.ContextComponent) {
        return fail(`Expected first completion to be a ContextComponent`);
      }

      const completionKeys: string[] = [];
      for (const completion of rest) {
        if (completion.kind !== CompletionKind.Reference &&
            completion.kind !== CompletionKind.Variable) {
          return fail(`Unexpected CompletionKind, expected a Reference or Variable`);
        }
        completionKeys.push(completion.node.name);
      }

      expect(new Set(completionKeys)).toEqual(new Set(['innerRef', 'user', 'topLevelRef']));
    });

    it('should support shadowing between outer and inner templates  ', () => {
      const MAIN_TS = absoluteFrom('/main.ts');
      const {templateTypeChecker, programStrategy} = setup([
        {
          fileName: MAIN_TS,
          templates: {
            'SomeCmp': `
              <div *ngFor="let user of users">
                Within this template, 'user' should be a variable, not a reference.
              </div>
              <div #user>Out here, 'user' is the reference.</div>
          `
          },
          source: `
            export class SomeCmp {
              users: string[];
            }
          `,
        },
      ]);
      const sf = getSourceFileOrError(programStrategy.getProgram(), MAIN_TS);
      const SomeCmp = getClass(sf, 'SomeCmp');

      const tmpl = templateTypeChecker.getTemplate(SomeCmp)!;
      const ngForTemplate = tmpl[0] as TmplAstTemplate;

      const [_a, userAtTopLevel] =
          templateTypeChecker.getGlobalCompletions(/* root template */ null, SomeCmp);
      const [_b, userInNgFor] = templateTypeChecker.getGlobalCompletions(ngForTemplate, SomeCmp);

      expect(userAtTopLevel.kind).toBe(CompletionKind.Reference);
      expect(userInNgFor.kind).toBe(CompletionKind.Variable);
    });
  });
});

function setup(targets: TypeCheckingTarget[], config?: Partial<TypeCheckingConfig>) {
  return baseTestSetup(
      targets, {inlining: false, config: {...config, enableTemplateTypeChecker: true}});
}
