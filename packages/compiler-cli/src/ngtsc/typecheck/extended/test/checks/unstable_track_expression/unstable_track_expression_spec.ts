/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {parseTemplate} from '@angular/compiler';
import ts from 'typescript';

import {DiagnosticCategoryLabel, NgCompilerOptions} from '../../../../../core/api';
import {ErrorCode, ExtendedTemplateDiagnosticName, ngErrorCode} from '../../../../../diagnostics';
import {absoluteFrom, getSourceFileOrError} from '../../../../../file_system';
import {runInEachFileSystem} from '../../../../../file_system/testing';
import {getSourceCodeForDiagnostic} from '../../../../../testing';
import {getClass, setup} from '../../../../testing';
import {formatExtendedError, TemplateCheckFactory} from '../../../api';
import {factory} from '../../../checks/unstable_track_expression';
import {factory as uninvokedTrackFunctionFactory} from '../../../checks/uninvoked_track_function';
import {ExtendedTemplateCheckerImpl} from '../../../src/extended_template_checker';

runInEachFileSystem(() => {
  describe('UnstableTrackExpressionCheck', () => {
    it('binds the error code to its diagnostic name', () => {
      expect(factory.code).toBe(ErrorCode.UNSTABLE_TRACK_EXPRESSION);
      expect(factory.name).toBe(ExtendedTemplateDiagnosticName.UNSTABLE_TRACK_EXPRESSION);
    });

    for (const expression of [
      '{id: user.id}',
      '[user.id]',
      '({id: user.id})',
      '([user.id])',
      '((({id: user.id})))',
      '((([user.id])))',
      '{}',
      '[]',
    ]) {
      it(`diagnoses the supported track expression ${expression}`, () => {
        const template = `@for (user of users; track ${expression}) { {{user.id}} }`;
        expect(parseTemplate(template, 'test.html').errors).toBeNull();
        const diagnostics = diagnose(template);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].code).toBe(ngErrorCode(ErrorCode.UNSTABLE_TRACK_EXPRESSION));
        expect(diagnostics[0].category).toBe(ts.DiagnosticCategory.Warning);
        expect(getSourceCodeForDiagnostic(diagnostics[0])).toBe(expression);
        expect(diagnostics[0].messageText).toBe(
          formatExtendedError(
            ErrorCode.UNSTABLE_TRACK_EXPRESSION,
            'The @for tracking expression creates a new object or array on every evaluation. ' +
              'Use a stable tracking key, such as a unique property of the loop item, ' +
              'instead of creating a new object or array.',
          ),
        );
      });
    }

    for (const expression of [
      'user.id',
      '1',
      "'key'",
      '$index',
      'user',
      'user.key',
      'getUserId(user)',
      'getUser(user)',
      '(user.id)',
      '(user)',
      'user.id ? user : {id: user.id}',
      'getUserId({id: user.id})',
      '[user.id][0]',
      '{id: user.id}.id',
    ]) {
      it(`does not diagnose ${expression}`, () => {
        expect(diagnose(`@for (user of users; track ${expression}) {}`)).toEqual([]);
      });
    }

    it('does not diagnose literals outside track expressions', () => {
      expect(
        diagnose('@for (user of [{id: 1}]; track user.id) { {{ {id: user.id} }} {{ [user.id] }} }'),
      ).toEqual([]);
    });

    it('does not diagnose nested loops with stable keys', () => {
      expect(
        diagnose('@for (user of users; track user.id) { @for (key of [user.key]; track key) {} }'),
      ).toEqual([]);
    });

    it('diagnoses each unstable key in nested loops once', () => {
      const diagnostics = diagnose(
        '@for (user of users; track {id: user.id}) { @for (key of [user.key]; track [key]) {} }',
      );
      expect(diagnostics.map(getSourceCodeForDiagnostic)).toEqual(['{id: user.id}', '[key]']);
    });

    it('preserves Signal Forms field identity tracking alongside NG8115', () => {
      expect(
        diagnose(
          '@for (field of fields.emails; track field) {}',
          {
            extendedDiagnostics: {
              checks: {unstableTrackExpression: DiagnosticCategoryLabel.Warning},
            },
          },
          'readonly model = signal({emails: ["a@example.com"]}); readonly fields = form(this.model);',
          [factory, uninvokedTrackFunctionFactory],
        ),
      ).toEqual([]);
    });

    it('coexists with NG8115 without changing its diagnostics', () => {
      const template =
        '@for (user of users; track {id: user.id}) {} @for (user of users; track getUserId) {}';
      const options: NgCompilerOptions = {
        extendedDiagnostics: {checks: {unstableTrackExpression: DiagnosticCategoryLabel.Warning}},
      };
      const unstableDiagnostics = diagnose(template, options);
      const uninvokedDiagnostics = diagnose(template, options, '', [uninvokedTrackFunctionFactory]);
      const combinedDiagnostics = diagnose(template, options, '', [
        factory,
        uninvokedTrackFunctionFactory,
      ]);

      expect(unstableDiagnostics.map((diagnostic) => diagnostic.code)).toEqual([
        ngErrorCode(ErrorCode.UNSTABLE_TRACK_EXPRESSION),
      ]);
      expect(combinedDiagnostics.map((diagnostic) => diagnostic.code)).toEqual(
        [...unstableDiagnostics, ...uninvokedDiagnostics].map((diagnostic) => diagnostic.code),
      );
    });

    it('requires an explicit category even when the default category is error', () => {
      for (const options of [
        {},
        {extendedDiagnostics: {}},
        {extendedDiagnostics: {defaultCategory: DiagnosticCategoryLabel.Error}},
        {extendedDiagnostics: {defaultCategory: DiagnosticCategoryLabel.Warning}},
      ]) {
        expect(factory.create(options)).toBeNull();
        expect(diagnose('@for (user of users; track [user.id]) {}', options)).toEqual([]);
      }
    });

    for (const category of [
      DiagnosticCategoryLabel.Warning,
      DiagnosticCategoryLabel.Error,
      DiagnosticCategoryLabel.Suppress,
    ]) {
      it(`respects the explicit ${category} category`, () => {
        const diagnostics = diagnose('@for (user of users; track [user.id]) {}', {
          extendedDiagnostics: {
            defaultCategory: DiagnosticCategoryLabel.Error,
            checks: {unstableTrackExpression: category},
          },
        });
        if (category === DiagnosticCategoryLabel.Suppress) {
          expect(diagnostics).toEqual([]);
        } else {
          expect(diagnostics.length).toBe(1);
          expect(diagnostics[0].category).toBe(
            category === DiagnosticCategoryLabel.Warning
              ? ts.DiagnosticCategory.Warning
              : ts.DiagnosticCategory.Error,
          );
        }
      });
    }
  });
});

function diagnose(
  template: string,
  options: NgCompilerOptions = {
    extendedDiagnostics: {checks: {unstableTrackExpression: DiagnosticCategoryLabel.Warning}},
  },
  members: string = '',
  factories: readonly TemplateCheckFactory<ErrorCode, ExtendedTemplateDiagnosticName>[] = [factory],
) {
  const fileName = absoluteFrom('/main.ts');
  const {program, templateTypeChecker} = setup(
    [
      {
        fileName,
        templates: {TestCmp: template},
        source: `
        import {signal} from '@angular/core';
        import {form} from '@angular/forms/signals';
        export class TestCmp {
          users = [{id: 1, key: {id: 1}}];
          getUserId(user: {id: number}) { return user.id; }
          getUser(user: {id: number}) { return user; }
          ${members}
        }
      `,
      },
    ],
    {},
    {forms: true},
  );
  const component = getClass(getSourceFileOrError(program, fileName), 'TestCmp');
  return new ExtendedTemplateCheckerImpl(
    templateTypeChecker,
    program.getTypeChecker(),
    factories,
    options,
  ).getDiagnosticsForComponent(component);
}
