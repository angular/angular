/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {createModuleAndProjectWithDeclarations, LanguageServiceTestEnv} from '../testing';
import {AriaDiagnosticCode} from '../src/aria';

describe('ARIA validation diagnostics', () => {
  let env: LanguageServiceTestEnv;

  beforeEach(() => {
    initMockFileSystem('Native');
    env = LanguageServiceTestEnv.setup();
  });

  describe('Unknown ARIA attribute detection', () => {
    it('should detect misspelled ARIA attribute names', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<button aria-labelled="label">Click</button>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.UNKNOWN_ARIA_ATTRIBUTE);

      expect(ariaDiags.length).toBe(1);
      expect(ariaDiags[0].messageText).toContain('aria-labelled');
      expect(ariaDiags[0].messageText).toContain('aria-labelledby'); // Should suggest
    });

    it('should suggest similar ARIA attribute for typos', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div aria-hiddn="true"></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.UNKNOWN_ARIA_ATTRIBUTE);

      expect(ariaDiags.length).toBe(1);
      expect(ariaDiags[0].messageText).toContain('aria-hiddn');
      expect(ariaDiags[0].messageText).toContain('aria-hidden');
    });

    it('should not report valid ARIA attributes', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<button aria-label="Submit form">Submit</button>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.UNKNOWN_ARIA_ATTRIBUTE);

      expect(ariaDiags.length).toBe(0);
    });

    it('should validate multiple ARIA attributes on same element', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div aria-hidden="true" aria-label="test" aria-invald="false"></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.UNKNOWN_ARIA_ATTRIBUTE);

      expect(ariaDiags.length).toBe(1);
      expect(ariaDiags[0].messageText).toContain('aria-invald');
    });
  });

  describe('Invalid ARIA attribute value detection', () => {
    it('should detect invalid boolean values', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div aria-hidden="yes"></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.INVALID_ARIA_VALUE);

      expect(ariaDiags.length).toBe(1);
      expect(ariaDiags[0].messageText).toContain('yes');
      expect(ariaDiags[0].messageText).toContain('true');
    });

    it('should accept valid boolean values', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div aria-hidden="true" aria-disabled="false"></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.INVALID_ARIA_VALUE);

      expect(ariaDiags.length).toBe(0);
    });

    it('should detect invalid token values for aria-autocomplete', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<input aria-autocomplete="suggest">',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.INVALID_ARIA_VALUE);

      expect(ariaDiags.length).toBe(1);
      expect(ariaDiags[0].messageText).toContain('suggest');
    });

    it('should accept valid token values for aria-autocomplete', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<input aria-autocomplete="inline">',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.INVALID_ARIA_VALUE);

      expect(ariaDiags.length).toBe(0);
    });

    it('should detect invalid tristate values for aria-checked', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div role="checkbox" aria-checked="partial"></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.INVALID_ARIA_VALUE);

      expect(ariaDiags.length).toBe(1);
      expect(ariaDiags[0].messageText).toContain('partial');
    });

    it('should accept valid tristate values for aria-checked', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div role="checkbox" aria-checked="mixed"></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.INVALID_ARIA_VALUE);

      expect(ariaDiags.length).toBe(0);
    });

    it('should accept empty string values (treated as undefined)', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div aria-hidden=""></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.INVALID_ARIA_VALUE);

      expect(ariaDiags.length).toBe(0);
    });

    it('should validate aria-live token values', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div aria-live="aggressive"></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.INVALID_ARIA_VALUE);

      expect(ariaDiags.length).toBe(1);
      expect(ariaDiags[0].messageText).toContain('aggressive');
    });
  });

  describe('Unknown ARIA role detection', () => {
    it('should detect misspelled ARIA role names', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div role="buton"></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.UNKNOWN_ARIA_ROLE);

      expect(ariaDiags.length).toBe(1);
      expect(ariaDiags[0].messageText).toContain('buton');
      expect(ariaDiags[0].messageText).toContain('button');
    });

    it('should not report valid ARIA roles', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div role="button"></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.UNKNOWN_ARIA_ROLE);

      expect(ariaDiags.length).toBe(0);
    });

    it('should validate multiple roles (space-separated)', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div role="button presentaton"></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.UNKNOWN_ARIA_ROLE);

      expect(ariaDiags.length).toBe(1);
      expect(ariaDiags[0].messageText).toContain('presentaton');
    });

    it('should accept all standard widget roles', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <div role="alert"></div>
              <div role="alertdialog"></div>
              <div role="button"></div>
              <div role="checkbox"></div>
              <div role="dialog"></div>
              <div role="link"></div>
              <div role="listbox"></div>
              <div role="menu"></div>
              <div role="menubar"></div>
              <div role="menuitem"></div>
              <div role="progressbar"></div>
              <div role="radio"></div>
              <div role="radiogroup"></div>
              <div role="slider"></div>
              <div role="spinbutton"></div>
              <div role="status"></div>
              <div role="switch"></div>
              <div role="tab"></div>
              <div role="tablist"></div>
              <div role="tabpanel"></div>
              <div role="textbox"></div>
              <div role="tooltip"></div>
              <div role="tree"></div>
              <div role="treegrid"></div>
              <div role="treeitem"></div>
            \`,
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.UNKNOWN_ARIA_ROLE);

      expect(ariaDiags.length).toBe(0);
    });

    it('should accept landmark roles', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <nav role="navigation"></nav>
              <main role="main"></main>
              <header role="banner"></header>
              <footer role="contentinfo"></footer>
              <aside role="complementary"></aside>
              <form role="form"></form>
              <section role="region"></section>
              <div role="search"></div>
            \`,
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.UNKNOWN_ARIA_ROLE);

      expect(ariaDiags.length).toBe(0);
    });

    it('should accept document structure roles (doc-*)', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <div role="doc-abstract"></div>
              <div role="doc-acknowledgments"></div>
              <div role="doc-appendix"></div>
              <div role="doc-bibliography"></div>
              <div role="doc-chapter"></div>
              <div role="doc-conclusion"></div>
              <div role="doc-cover"></div>
              <div role="doc-footnote"></div>
              <div role="doc-foreword"></div>
              <div role="doc-glossary"></div>
              <div role="doc-index"></div>
              <div role="doc-introduction"></div>
              <div role="doc-toc"></div>
            \`,
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.UNKNOWN_ARIA_ROLE);

      expect(ariaDiags.length).toBe(0);
    });
  });

  describe('Deprecated ARIA attribute detection', () => {
    it('should warn about deprecated aria-grabbed', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div aria-grabbed="true"></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter(
        (d) => d.code === AriaDiagnosticCode.DEPRECATED_ARIA_ATTRIBUTE,
      );

      expect(ariaDiags.length).toBe(1);
      expect(ariaDiags[0].messageText).toContain('aria-grabbed');
      expect(ariaDiags[0].messageText).toContain('deprecated');
    });

    it('should warn about deprecated aria-dropeffect', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div aria-dropeffect="move"></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter(
        (d) => d.code === AriaDiagnosticCode.DEPRECATED_ARIA_ATTRIBUTE,
      );

      expect(ariaDiags.length).toBe(1);
      expect(ariaDiags[0].messageText).toContain('aria-dropeffect');
      expect(ariaDiags[0].messageText).toContain('deprecated');
    });
  });

  describe('Bound ARIA attributes', () => {
    it('should validate bound ARIA attribute names [attr.aria-*]', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [attr.aria-hiddn]="isHidden"></div>',
          })
          export class AppComponent {
            isHidden = true;
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.UNKNOWN_ARIA_ATTRIBUTE);

      expect(ariaDiags.length).toBe(1);
      expect(ariaDiags[0].messageText).toContain('aria-hiddn');
    });

    it('should not report valid bound ARIA attributes', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [attr.aria-hidden]="isHidden" [attr.aria-label]="label"></div>',
          })
          export class AppComponent {
            isHidden = true;
            label = 'Test';
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.UNKNOWN_ARIA_ATTRIBUTE);

      expect(ariaDiags.length).toBe(0);
    });
  });

  describe('ARIA in ng-template', () => {
    it('should validate ARIA inside ng-template children', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <ng-template>
                <div aria-labeld="label"></div>
              </ng-template>
            \`,
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.UNKNOWN_ARIA_ATTRIBUTE);

      expect(ariaDiags.length).toBe(1);
      expect(ariaDiags[0].messageText).toContain('aria-labeld');
    });
  });

  describe('ARIA integer and number values', () => {
    it('should accept valid integer values for aria-level', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<h2 aria-level="2"></h2>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.INVALID_ARIA_VALUE);

      expect(ariaDiags.length).toBe(0);
    });

    it('should reject non-integer values for aria-level', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<h2 aria-level="two"></h2>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.INVALID_ARIA_VALUE);

      expect(ariaDiags.length).toBe(1);
      expect(ariaDiags[0].messageText).toContain('two');
      expect(ariaDiags[0].messageText).toContain('integer');
    });

    it('should accept valid number values for aria-valuenow', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div role="slider" aria-valuenow="50.5" aria-valuemin="0" aria-valuemax="100"></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter((d) => d.code === AriaDiagnosticCode.INVALID_ARIA_VALUE);

      expect(ariaDiags.length).toBe(0);
    });
  });

  describe('All valid ARIA attributes', () => {
    it('should accept common ARIA attributes without errors', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <div
                aria-label="Main content"
                aria-labelledby="heading"
                aria-describedby="description"
                aria-hidden="false"
                aria-expanded="true"
                aria-disabled="false"
                aria-live="polite"
                aria-atomic="false"
                aria-busy="false"
                aria-controls="panel"
                aria-current="page"
                aria-details="details"
                aria-errormessage="error"
                aria-flowto="next"
                aria-haspopup="menu"
                aria-keyshortcuts="Ctrl+S"
                aria-modal="false"
                aria-owns="child"
                aria-relevant="additions"
                aria-roledescription="custom button"
              >
                Content
              </div>
            \`,
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const ariaDiags = diags.filter(
        (d) =>
          d.code === AriaDiagnosticCode.UNKNOWN_ARIA_ATTRIBUTE ||
          d.code === AriaDiagnosticCode.INVALID_ARIA_VALUE,
      );

      expect(ariaDiags.length).toBe(0);
    });
  });
});
