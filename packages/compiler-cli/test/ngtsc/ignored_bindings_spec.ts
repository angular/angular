/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ERROR_DETAILS_PAGE_BASE_URL, ErrorCode, ngErrorCode} from '../../src/ngtsc/diagnostics';
import {runInEachFileSystem} from '../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles} from '../../src/ngtsc/testing';

import {NgtscTestEnvironment} from './env';

const testFiles = loadStandardTestFiles({fakeCommon: true});

/** A test name, a full template, and the diagnostics the template is expected to produce. */
type Row = [name: string, template: string, expected: string[]];

// The default level of NG8031, as `diagnosticCodes` reports it.
const NG8031 = 'error NG8031';

runInEachFileSystem(() => {
  describe('bindings on ng-container, ng-template, and ng-content', () => {
    let env!: NgtscTestEnvironment;

    beforeEach(() => {
      env = NgtscTestEnvironment.setup(testFiles);
    });

    /** Compiles the program and returns its diagnostics, leaving out unused imports. */
    function getDiagnostics(): ts.Diagnostic[] {
      return env
        .driveDiagnostics()
        .filter((diag) => diag.code !== ngErrorCode(ErrorCode.UNUSED_STANDALONE_IMPORTS));
    }

    /**
     * Compiles the program and returns its diagnostics as strings such as `error NG8002`.
     * The result is sorted, because compiler backends report diagnostics in different orders.
     */
    function diagnosticCodes(): string[] {
      return getDiagnostics()
        .map(
          (diag) =>
            `${diag.category === ts.DiagnosticCategory.Error ? 'error' : 'warning'} ${String(
              diag.code,
            ).replace(/^-99/, 'NG')}`,
        )
        .sort();
    }

    /**
     * Compiles `template` with `strictTemplates` and returns its diagnostics. `metadata` adds
     * fields to the test component's decorator.
     */
    function diagnose(
      template: string,
      options: Record<string, unknown> = {},
      metadata = '',
    ): string[] {
      writeTestComponent(template, options, metadata);
      return diagnosticCodes();
    }

    function writeTestComponent(
      template: string,
      options: Record<string, unknown> = {},
      metadata = '',
    ): void {
      env.tsconfig({strictTemplates: true, ...options});
      env.write(
        'test.ts',
        `
        import {
          Component,
          Directive,
          HostAttributeToken,
          inject,
          input,
          NO_ERRORS_SCHEMA,
          output,
        } from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Directive({selector: '[out-dir]'})
        export class OutDir {
          readonly out = output<string>();
        }

        @Directive({selector: '[class-input-dir]'})
        export class ClassInputDir {
          readonly class = input('');
        }

        @Directive({selector: '[static-input-dir]'})
        export class StaticInputDir {
          readonly foo = input('');
        }

        @Directive({selector: '[p-input-dir]'})
        export class PInputDir {
          readonly p = input<unknown>();
        }

        @Directive({selector: '[match-dir]'})
        export class MatchDir {}

        @Directive({selector: '[host-only]'})
        export class HostOnly {}

        @Directive({selector: '[with-host]', hostDirectives: [HostOnly]})
        export class WithHost {}

        @Directive({selector: '[tab-role]'})
        export class TabRole {
          readonly role = inject(new HostAttributeToken('role'));
        }

        @Component({selector: '[card]', template: '<b>c</b>'})
        export class Card {}

        @Component({
          selector: 'proj',
          template:
            '<ng-content select="[card-header]" /><ng-content select=".card-body" /><ng-content />',
        })
        export class Proj {}

        @Component({selector: 'catch-all', template: '<ng-content />'})
        export class CatchAll {}

        @Component({
          selector: 'test',
          template: \`${template}\`,
          imports: [
            OutDir,
            ClassInputDir,
            StaticInputDir,
            PInputDir,
            MatchDir,
            WithHost,
            TabRole,
            Card,
            Proj,
            CatchAll,
            CommonModule,
          ],
          ${metadata}
        })
        export class TestCmp {
          v = true;
          h(value?: unknown) {}
        }
      `,
      );
    }

    function runRows(rows: Row[]): void {
      for (const [name, template, expected] of rows) {
        it(name, () => {
          expect(diagnose(template)).toEqual(expected);
        });
      }
    }

    runRows([
      [
        'should report a static attribute on ng-container',
        `<ng-container class="s"></ng-container>`,
        [NG8031],
      ],
      [
        'should report a class binding on ng-container',
        `<ng-container [class.p]="v"></ng-container>`,
        [NG8031],
      ],
      [
        'should report a class map binding on ng-container',
        `<ng-container [class]="'a'"></ng-container>`,
        [NG8031],
      ],
      [
        'should report a class interpolation on ng-container',
        `<ng-container class="a {{v}}"></ng-container>`,
        [NG8031],
      ],
      [
        'should report a style map binding on ng-container',
        `<ng-container [style]="'color: red'"></ng-container>`,
        [NG8031],
      ],
      [
        'should report an event binding on ng-container',
        `<ng-container (click)="h()"></ng-container>`,
        [NG8031],
      ],
      [
        'should report an animation binding on ng-container',
        `<ng-container [animate.enter]="'fade'"></ng-container>`,
        [NG8031],
      ],
      [
        'should report an animation event on ng-container',
        `<ng-container (animate.leave)="h()"></ng-container>`,
        [NG8031],
      ],
      [
        'should report a class binding on ng-container inside svg',
        `<svg><ng-container [class.a]="v"></ng-container></svg>`,
        [NG8031],
      ],
      [
        'should leave an attribute binding on ng-container to the template parser',
        `<ng-container [attr.title]="'t'"></ng-container>`,
        ['error NG5002'],
      ],
      [
        'should leave an unknown property on ng-container to the DOM schema check',
        `<ng-container [title]="missing"></ng-container>`,
        ['error 2339', 'error NG8002'],
      ],
      [
        'should leave an unclaimed two-way binding on ng-container to the DOM schema check',
        `<ng-container [(x)]="v"></ng-container>`,
        ['error NG8002'],
      ],
      [
        'should report a class binding on ng-template',
        `<ng-template [class.p]="v"></ng-template>`,
        [NG8031],
      ],
      [
        'should report an attribute binding on ng-template',
        `<ng-template [attr.title]="'t'"></ng-template>`,
        [NG8031],
      ],
      [
        'should report an event binding on ng-template',
        `<ng-template (click)="h()"></ng-template>`,
        [NG8031],
      ],
      [
        'should report an unclaimed property binding on ng-template',
        `<ng-template [title]="'t'"></ng-template>`,
        [NG8031],
      ],
      [
        'should report an unclaimed two-way binding on ng-template once',
        `<ng-template [(x)]="v"></ng-template>`,
        [NG8031],
      ],
      ['should report a binding on ng-content', `<ng-content [foo]="v" />`, [NG8031]],
      [
        'should report each static attribute on ng-content',
        `<ng-content class="c" title="t" />`,
        [NG8031, NG8031],
      ],
      [
        'should report an attribute that i18n translates on ng-container',
        `<ng-container i18n-title title="t"></ng-container>`,
        [NG8031],
      ],
    ]);

    describe('directive inputs named like a class, style, or attribute binding', () => {
      runRows([
        [
          'should report a class binding on ng-container',
          `<ng-container p-input-dir [class.p]="v"></ng-container>`,
          [NG8031],
        ],
        [
          'should report a style binding on ng-container',
          `<ng-container p-input-dir [style.p]="v"></ng-container>`,
          [NG8031],
        ],
        [
          'should leave an attribute binding on ng-container to the template parser',
          `<ng-container p-input-dir [attr.p]="'t'"></ng-container>`,
          ['error NG5002'],
        ],
        [
          'should not report a class binding on ng-template',
          `<ng-template p-input-dir [class.p]="v"></ng-template>`,
          [],
        ],
        [
          'should not report a style binding on ng-template',
          `<ng-template p-input-dir [style.p]="v"></ng-template>`,
          [],
        ],
        [
          'should not report an attribute binding on ng-template',
          `<ng-template p-input-dir [attr.p]="'t'"></ng-template>`,
          [],
        ],
      ]);
    });

    describe('bindings that take effect', () => {
      runRows([
        [
          'should not report a property binding that a directive selector matches on ng-template',
          `<ng-template [match-dir]="v"></ng-template>`,
          [],
        ],
        [
          'should not report an event that a directive selector matches',
          `<ng-container (match-dir)="h()"></ng-container>`,
          [],
        ],
        [
          'should report a binding that only the selector of a host directive names',
          `<ng-template with-host [host-only]="v"></ng-template>`,
          [NG8031],
        ],
        [
          'should not report a directive input on ng-template inside svg',
          `<ng-template #t>t</ng-template><svg><ng-template [ngTemplateOutlet]="t"></ng-template></svg>`,
          [],
        ],
        [
          'should not report a directive input on ng-template inside a namespaced element',
          `<xhtml:div xmlns:xhtml="http://www.w3.org/1999/xhtml"><ng-template [ngIf]="v"></ng-template></xhtml:div>`,
          [],
        ],
        [
          'should not report an event that a directive output claims',
          `<ng-container out-dir (out)="h($event)"></ng-container>`,
          [],
        ],
        [
          'should not report an event on a global target',
          `<ng-container (document:ping)="h()"></ng-container>`,
          [],
        ],
        [
          'should not report a class map binding that a directive input claims',
          `<ng-container class-input-dir [class]="'b'"></ng-container>`,
          [],
        ],
        [
          'should not report static attributes when a directive matches',
          `<ng-container static-input-dir class="foo" role="tab"></ng-container>`,
          [],
        ],
        [
          'should not report a static attribute that a directive can inject',
          `<ng-container tab-role role="tab"></ng-container>`,
          [],
        ],
        [
          'should not report static attributes when a structural directive matches',
          `<ng-container *ngIf="v" foo="x"></ng-container>`,
          [],
        ],
        [
          'should not report ngProjectAs',
          `<ng-container ngProjectAs="[card-header]"></ng-container>`,
          [],
        ],
        [
          'should not report ngNonBindable',
          `<ng-container ngNonBindable>{{ v }}</ng-container>`,
          [],
        ],
        [
          'should not report ngPreserveWhitespaces on ng-container',
          `<ng-container ngPreserveWhitespaces></ng-container>`,
          [],
        ],
        [
          'should not report ngPreserveWhitespaces on ng-template',
          `<ng-template ngPreserveWhitespaces></ng-template>`,
          [],
        ],
        [
          'should not report ngPreserveWhitespaces on ng-content',
          `<ng-content ngPreserveWhitespaces />`,
          [],
        ],
        [
          'should not report ngSkipHydration on ng-container',
          `<ng-container ngSkipHydration></ng-container>`,
          [],
        ],
        [
          'should not report ngSkipHydration on ng-template',
          `<ng-template ngSkipHydration></ng-template>`,
          [],
        ],
        ['should not report ngSkipHydration on ng-content', `<ng-content ngSkipHydration />`, []],
        [
          'should not report the attributes that ng-content reads',
          `<ng-content select="[a]" ngProjectAs="b" />`,
          [],
        ],
        [
          'should not report the select attribute of ng-content in any case',
          `<ng-content SELECT="[a]" />`,
          [],
        ],
        ['should not report a structural directive on ng-content', `<ng-content *ngIf="v" />`, []],
        [
          'should not report bindings on an element with a structural directive',
          `<div *ngIf="v" [class.a]="v" (click)="h()" title="t">D</div>`,
          [],
        ],
        [
          'should not report template outlets, references, and template variables',
          `<ng-template #t let-x><span>{{x}}</span></ng-template>` +
            `<ng-container [ngTemplateOutlet]="t" [ngTemplateOutletContext]="{$implicit: v}"/>` +
            `<ng-container *ngTemplateOutlet="t"/>`,
          [],
        ],
      ]);

      for (const tag of ['ng-container', 'ng-template']) {
        it(`should not report static attributes on ${tag} when a selectorless directive applies`, () => {
          env.tsconfig({strictTemplates: true, _enableSelectorless: true});
          env.write(
            'test.ts',
            `
            import {Component, Directive} from '@angular/core';

            @Directive()
            export class Dir {}

            @Component({template: '<${tag} @Dir role="tab"></${tag}>'})
            export class TestCmp {}
          `,
          );
          expect(diagnosticCodes()).toEqual([]);
        });
      }
    });

    describe('content projection', () => {
      runRows([
        [
          'should not report a static attribute that a projection slot selects',
          `<proj><ng-container card-header>H</ng-container></proj>`,
          [],
        ],
        [
          'should not report a static class that a projection slot selects',
          `<proj><ng-container class="card-body">B</ng-container></proj>`,
          [],
        ],
        [
          'should not report a static attribute that a projection slot selects through a block',
          `<proj>@if (v) {<ng-container card-header>H</ng-container>}</proj>`,
          [],
        ],
        [
          'should not report a static attribute that a projection slot selects through a structural directive',
          `<proj><ng-container *unmatched card-header>H</ng-container></proj>`,
          ['warning NG8116'],
        ],
        [
          'should report a static attribute that no projection slot selects',
          `<proj><ng-container foo>H</ng-container></proj>`,
          [NG8031],
        ],
        [
          'should report a static attribute when ngProjectAs selects the projection slot',
          `<proj><ng-container ngProjectAs="[card-header]" foo>H</ng-container></proj>`,
          [NG8031],
        ],
        [
          'should report static attributes that a projection slot selects when ngProjectAs is set',
          `<proj><ng-container ngProjectAs="[card-footer]" card-header title="t">H</ng-container></proj>`,
          [NG8031, NG8031],
        ],
        [
          'should not report static attributes on ng-content that is projected again',
          `<proj><ng-content title="t" /></proj>`,
          [],
        ],
        [
          'should report static attributes on ng-content projected into a catch-all slot',
          `<catch-all><ng-content title="t" /></catch-all>`,
          [NG8031],
        ],
      ]);

      it('should not report a static attribute that a selectorless component slot selects', () => {
        env.tsconfig({strictTemplates: true, _enableSelectorless: true});
        env.write(
          'test.ts',
          `
          import {Component} from '@angular/core';

          @Component({template: '<ng-content select="[card-header]" />'})
          export class Proj {}

          @Component({
            template: '<Proj><ng-container card-header>H</ng-container><ng-container foo>F</ng-container></Proj>',
          })
          export class TestCmp {}
        `,
        );
        expect(diagnosticCodes()).toEqual([NG8031]);
      });
    });

    describe('components on ng-container and ng-template', () => {
      // The level of NG8032, as `diagnosticCodes` reports it.
      const NG8032 = 'warning NG8032';

      runRows([
        [
          'should report a component on ng-container',
          `<ng-container card></ng-container>`,
          [NG8032],
        ],
        ['should report a component on ng-template', `<ng-template card></ng-template>`, [NG8032]],
        [
          'should report a component on ng-container once when a structural directive wraps it',
          `<ng-container *ngIf="v" card></ng-container>`,
          [NG8032],
        ],
        [
          'should not report a component on a template created by structural syntax',
          `<div *card></div>`,
          [],
        ],
      ]);

      it('should report a component when the ignoredBinding check is suppressed', () => {
        const options = {extendedDiagnostics: {checks: {ignoredBinding: 'suppress'}}};
        expect(diagnose(`<ng-container card></ng-container>`, options)).toEqual([NG8032]);
      });
    });

    it('should report an unclaimed event on ng-container only as NG8031', () => {
      const options = {strictUnclaimedEventNames: true};
      expect(diagnose(`<ng-container out-dir (fooBar)="h()"></ng-container>`, options)).toEqual([
        NG8031,
      ]);
    });

    it('should report an unclaimed event on ng-container as NG8030 when NG8031 is suppressed', () => {
      const options = {
        strictUnclaimedEventNames: true,
        extendedDiagnostics: {checks: {ignoredBinding: 'suppress'}},
      };
      expect(diagnose(`<ng-container out-dir (fooBar)="h()"></ng-container>`, options)).toEqual([
        'error NG8030',
      ]);
    });

    it('should not report a property binding that a directive selector matches under NO_ERRORS_SCHEMA', () => {
      expect(
        diagnose(
          `<ng-container [match-dir]="v"></ng-container>`,
          {},
          'schemas: [NO_ERRORS_SCHEMA],',
        ),
      ).toEqual([]);
    });

    describe('configuration', () => {
      const template = `<ng-container [class.p]="v"></ng-container>`;

      it('should report warnings when the check is configured as a warning', () => {
        const options = {extendedDiagnostics: {checks: {ignoredBinding: 'warning'}}};
        expect(diagnose(template, options)).toEqual(['warning NG8031']);
      });

      it('should report nothing when the check is suppressed', () => {
        const options = {extendedDiagnostics: {checks: {ignoredBinding: 'suppress'}}};
        expect(diagnose(template, options)).toEqual([]);
      });

      it('should report nothing without strictTemplates', () => {
        expect(diagnose(template, {strictTemplates: false})).toEqual([]);
      });
    });

    it('should report bindings under NO_ERRORS_SCHEMA', () => {
      expect(
        diagnose(
          `<ng-container [class.p]="v" (click)="h()" title="t" [foo]="v"></ng-container>`,
          {},
          'schemas: [NO_ERRORS_SCHEMA],',
        ),
      ).toEqual([NG8031, NG8031, NG8031, NG8031]);
    });

    describe('messages', () => {
      const hint =
        'This check can be disabled using the ' +
        '`extendedDiagnostics.checks.ignoredBinding = "suppress"` compiler option. ' +
        `Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/NG8031`;

      /** Compiles `template` and returns the source text and the message of each diagnostic. */
      function getMessages(template: string): Array<{span: string; message: string}> {
        writeTestComponent(template);
        return getDiagnostics().map((diag) => ({
          span: diag.file!.text.substring(diag.start!, diag.start! + diag.length!),
          message: ts.flattenDiagnosticMessageText(diag.messageText, '\n'),
        }));
      }

      it('should tell to move a class, style, or event binding to an element', () => {
        expect(getMessages(`<ng-container [class.p]="v"></ng-container>`)).toEqual([
          {
            span: `[class.p]="v"`,
            message:
              `The '[class.p]' binding has no effect on <ng-container>, because <ng-container> ` +
              `doesn't render an element. Move the binding to an element.\n\n${hint}`,
          },
        ]);
      });

      it('should say that nothing reads a static attribute', () => {
        expect(getMessages(`<ng-container title="t"></ng-container>`)).toEqual([
          {
            span: `title="t"`,
            message:
              `The 'title' attribute has no effect on <ng-container>, because <ng-container> ` +
              `doesn't render an element, and no directive or content projection slot reads ` +
              `it.\n\n${hint}`,
          },
        ]);
      });

      it('should suggest importing a directive for an unclaimed property binding', () => {
        expect(getMessages(`<ng-template [title]="v"></ng-template>`)).toEqual([
          {
            span: `[title]="v"`,
            message:
              `The '[title]' binding has no effect on <ng-template>, because <ng-template> ` +
              `doesn't render an element. If 'title' is an input of a directive, add the ` +
              `directive to the component's imports.\n\n${hint}`,
          },
        ]);
      });

      it('should say that ng-container cannot host a component', () => {
        expect(getMessages(`<ng-container card></ng-container>`)).toEqual([
          {
            span: `<ng-container card>`,
            message:
              `Component 'Card' matches <ng-container>, but <ng-container> can't host a ` +
              `component because it doesn't render an element. Use an element that matches ` +
              `the component's selector instead. Find more at ${ERROR_DETAILS_PAGE_BASE_URL}/NG8032`,
          },
        ]);
      });

      it('should say that Angular never evaluates bindings on ng-content', () => {
        expect(getMessages(`<ng-content [foo]="v" />`)).toEqual([
          {
            span: `[foo]="v"`,
            message:
              `The '[foo]' binding has no effect on <ng-content>, because Angular replaces ` +
              `<ng-content> with projected content. Angular never evaluates bindings on ` +
              `<ng-content>.\n\n${hint}`,
          },
        ]);
      });
    });
  });
});
