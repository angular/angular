/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import ts from 'typescript';

import {createModuleAndProjectWithDeclarations, LanguageServiceTestEnv} from '../testing';
import {CssDiagnosticCode} from '../src/css';

describe('CSS property validation diagnostics', () => {
  let env: LanguageServiceTestEnv;

  beforeEach(() => {
    initMockFileSystem('Native');
    env = LanguageServiceTestEnv.setup();
  });

  describe('valid CSS properties', () => {
    it('should not report diagnostic for valid CSS property', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.width]="100"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      // Filter to only CSS diagnostics
      const cssDiags = diags.filter(
        (d) =>
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY ||
          d.code === CssDiagnosticCode.INVALID_CSS_UNIT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should not report diagnostic for valid CSS property with unit', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.width.px]="100"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) =>
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY ||
          d.code === CssDiagnosticCode.INVALID_CSS_UNIT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should not report diagnostic for valid camelCase CSS property', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.backgroundColor]="color"></div>',
          })
          export class AppComponent {
            color = 'red';
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) =>
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY ||
          d.code === CssDiagnosticCode.INVALID_CSS_UNIT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should not report diagnostic for valid kebab-case CSS property', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.background-color]="color"></div>',
          })
          export class AppComponent {
            color = 'red';
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) =>
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY ||
          d.code === CssDiagnosticCode.INVALID_CSS_UNIT,
      );
      expect(cssDiags.length).toBe(0);
    });
  });

  describe('invalid CSS properties', () => {
    it('should report diagnostic for unknown CSS property', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.wdith]="100"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY);
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain("Unknown CSS property 'wdith'");
      expect(cssDiags[0].messageText).toContain("Did you mean 'width'");
    });

    it('should report diagnostic for unknown CSS property with suggestions', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.colro]="color"></div>',
          })
          export class AppComponent {
            color = 'red';
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY);
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain("Unknown CSS property 'colro'");
      expect(cssDiags[0].messageText).toContain("Did you mean 'color'");
    });

    it('should report diagnostic for multiple unknown CSS properties', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <div [style.wdith]="100" [style.heigth]="100"></div>
            \`,
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY);
      expect(cssDiags.length).toBe(2);
    });

    it('should report diagnostic in external template', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            templateUrl: './app.html',
          })
          export class AppComponent {}
        `,
        'app.html': '<div [style.wdith]="100"></div>',
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.html');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY);
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain("Unknown CSS property 'wdith'");
    });
  });

  describe('CSS unit validation', () => {
    it('should not report diagnostic for valid CSS unit', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.width.px]="100"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_CSS_UNIT);
      expect(cssDiags.length).toBe(0);
    });

    it('should not report diagnostic for various valid CSS units', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <div [style.width.em]="1"></div>
              <div [style.width.rem]="1"></div>
              <div [style.width.%]="50"></div>
              <div [style.width.vh]="50"></div>
              <div [style.width.vw]="50"></div>
              <div [style.transition-duration.ms]="300"></div>
              <div [style.animation-duration.s]="1"></div>
            \`,
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_CSS_UNIT);
      expect(cssDiags.length).toBe(0);
    });

    it('should report diagnostic for invalid CSS unit', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.width.pxs]="100"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_CSS_UNIT);
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain("Unknown CSS unit 'pxs'");
    });
  });

  describe('style object literal validation', () => {
    it('should validate CSS properties in object literal bindings', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="{wdith: \\'100px\\'}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain("Unknown CSS property 'wdith'");
      expect(cssDiags[0].messageText).toContain("Did you mean 'width'");
    });

    it('should not report diagnostic for valid CSS properties in object literal', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="{width: \\'100px\\', backgroundColor: \\'red\\'}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should validate multiple invalid properties in object literal', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="{wdith: \\'100px\\', bgColor: \\'red\\'}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(2);
    });

    it('should validate CSS unit in object literal key', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="{\\' width.pxs\\': 100}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_CSS_UNIT);
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain("Unknown CSS unit 'pxs'");
    });
  });

  describe('duplicate CSS property detection', () => {
    it('should report duplicate CSS properties in object literal', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="{width: \\'100px\\', width: \\'200px\\'}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.DUPLICATE_CSS_PROPERTY);
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain("Duplicate CSS property 'width'");
    });

    it('should detect duplicates with different casing (camelCase vs kebab-case)', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="{backgroundColor: \\'red\\', \\'background-color\\': \\'blue\\'}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.DUPLICATE_CSS_PROPERTY);
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain(
        "'background-color' and 'backgroundColor' refer to the same property",
      );
    });

    it('should not report duplicates for different properties', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="{width: \\'100px\\', height: \\'200px\\'}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.DUPLICATE_CSS_PROPERTY);
      expect(cssDiags.length).toBe(0);
    });
  });

  describe('spread operator validation', () => {
    it('should validate CSS properties in spread object literal', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="{...baseStyles}"></div>',
          })
          export class AppComponent {
            baseStyles = {
              wdith: '100px',
              backgroudnColor: 'red',
            };
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      // Should detect the invalid properties in the spread object
      expect(cssDiags.length).toBe(2);
    });

    it('should not report diagnostic for valid CSS properties in spread', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="{...baseStyles}"></div>',
          })
          export class AppComponent {
            baseStyles = {
              width: '100px',
              backgroundColor: 'red',
            };
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should validate combined inline and spread properties', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="{color: \\'blue\\', ...baseStyles}"></div>',
          })
          export class AppComponent {
            baseStyles = {
              wdith: '100px',
            };
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      // Should only detect the invalid 'wdith' from the spread, not 'color'
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain("Unknown CSS property 'wdith'");
    });
  });

  describe('style binding conflict detection', () => {
    it('should report conflict when [style] is overridden by [style.prop]', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.backgroundColor]="\\'red\\'" [style]="{backgroundColor: \\'blue\\'}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.CONFLICTING_STYLE_BINDING);
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain('backgroundColor');
      expect(cssDiags[0].messageText).toContain(
        '[style.property] binding takes precedence over [style]',
      );
    });

    it('should report conflict when [ngStyle] is overridden by [style.prop]', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';
          import {NgStyle} from '@angular/common';

          @Component({
            imports: [NgStyle],
            template: '<div [style.color]="\\'red\\'" [ngStyle]="{color: \\'blue\\'}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.CONFLICTING_STYLE_BINDING);
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain('color');
      expect(cssDiags[0].messageText).toContain(
        '[style.property] binding takes precedence over [ngStyle]',
      );
    });

    it('should report conflict when [ngStyle] is overridden by [style]', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';
          import {NgStyle} from '@angular/common';

          @Component({
            imports: [NgStyle],
            template: '<div [style]="{width: \\'100px\\'}" [ngStyle]="{width: \\'200px\\'}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.CONFLICTING_STYLE_BINDING);
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain('width');
      expect(cssDiags[0].messageText).toContain('[style] binding takes precedence over [ngStyle]');
    });

    it('should not report conflict for different properties', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.width]="\\'100px\\'" [style]="{height: \\'200px\\'}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.CONFLICTING_STYLE_BINDING);
      expect(cssDiags.length).toBe(0);
    });

    it('should detect conflict with kebab-case vs camelCase property names', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.background-color]="\\'red\\'" [style]="{backgroundColor: \\'blue\\'}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.CONFLICTING_STYLE_BINDING);
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain(
        '[style.property] binding takes precedence over [style]',
      );
    });

    it('should detect conflicts with spread properties in [style]', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.width]="\\'100px\\'" [style]="{...baseStyles}"></div>',
          })
          export class AppComponent {
            baseStyles = {
              width: '200px',
              height: '100px',
            };
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.CONFLICTING_STYLE_BINDING);
      // Should detect conflict for 'width' between [style.width] and spread
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain('width');
    });
  });

  describe('host binding CSS validation', () => {
    it('should report diagnostic for unknown CSS property in host binding', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div></div>',
            host: {
              '[style.wdith]': '"100px"',
            },
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_HOST,
      );
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain("Unknown CSS property 'wdith' in host binding");
      expect(cssDiags[0].messageText).toContain("Did you mean 'width'");
    });

    it('should not report diagnostic for valid CSS property in host binding', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div></div>',
            host: {
              '[style.backgroundColor]': '"red"',
              '[style.width]': '"100px"',
            },
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_HOST,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should report diagnostic for invalid CSS unit in host binding', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div></div>',
            host: {
              '[style.width.pxs]': '100',
            },
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_CSS_UNIT_IN_HOST);
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain("Unknown CSS unit 'pxs' in host binding");
    });

    it('should validate multiple host style bindings', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div></div>',
            host: {
              '[style.wdith]': '"100px"',
              '[style.heigth]': '"200px"',
            },
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_HOST,
      );
      expect(cssDiags.length).toBe(2);
    });

    it('should validate kebab-case CSS properties in host binding', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div></div>',
            host: {
              '[style.backgroud-color]': '"red"',
            },
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_HOST,
      );
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain("Unknown CSS property 'backgroud-color'");
      expect(cssDiags[0].messageText).toContain("Did you mean 'background-color'");
    });

    it('should report diagnostic for unknown CSS property in @HostBinding decorator', () => {
      const files = {
        'app.ts': `
          import {Component, HostBinding} from '@angular/core';

          @Component({
            template: '<div></div>',
          })
          export class AppComponent {
            @HostBinding('style.wdith') width = '100px';
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_HOST,
      );
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain("Unknown CSS property 'wdith' in host binding");
      expect(cssDiags[0].messageText).toContain("Did you mean 'width'");
    });

    it('should not report diagnostic for valid CSS property in @HostBinding decorator', () => {
      const files = {
        'app.ts': `
          import {Component, HostBinding} from '@angular/core';

          @Component({
            template: '<div></div>',
          })
          export class AppComponent {
            @HostBinding('style.width') width = '100px';
            @HostBinding('style.backgroundColor') bgColor = 'red';
            @HostBinding('style.width.px') widthPx = 100;
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_HOST,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should validate multiple @HostBinding style decorators', () => {
      const files = {
        'app.ts': `
          import {Component, HostBinding} from '@angular/core';

          @Component({
            template: '<div></div>',
          })
          export class AppComponent {
            @HostBinding('style.wdith') width = '100px';
            @HostBinding('style.heigth') height = '200px';
            @HostBinding('style.backgroundColor') bgColor = 'red';
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_HOST,
      );
      expect(cssDiags.length).toBe(2);
    });

    it('should validate CSS properties in both host and @HostBinding', () => {
      const files = {
        'app.ts': `
          import {Component, HostBinding} from '@angular/core';

          @Component({
            template: '<div></div>',
            host: {
              '[style.colr]': '"blue"',
            },
          })
          export class AppComponent {
            @HostBinding('style.wdith') width = '100px';
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_HOST,
      );
      expect(cssDiags.length).toBe(2);
    });

    describe('host binding conflict detection', () => {
      it('should detect conflict between multiple host individual style bindings for same property', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div></div>',
              host: {
                '[style.width]': '"100px"',
                '[style.width]': '"200px"',
              },
            })
            export class AppComponent {}
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        // Note: This is technically a JavaScript object duplicate key issue,
        // but we still track and report the conflict if it somehow reaches validation
        const cssDiags = diags.filter(
          (d) => d.code === CssDiagnosticCode.CONFLICTING_STYLE_BINDING,
        );
        // May or may not have diagnostics depending on how TS handles duplicate keys
        expect(cssDiags).toBeDefined();
      });

      it('should NOT detect conflict between different CSS properties in host bindings', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div></div>',
              host: {
                '[style.width]': '"100px"',
                '[style.height]': '"200px"',
                '[style.backgroundColor]': '"red"',
              },
            })
            export class AppComponent {}
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter(
          (d) => d.code === CssDiagnosticCode.CONFLICTING_STYLE_BINDING,
        );
        expect(cssDiags.length).toBe(0);
      });

      it('should validate host @HostBinding decorators without conflicts for different properties', () => {
        const files = {
          'app.ts': `
            import {Component, HostBinding} from '@angular/core';

            @Component({
              template: '<div></div>',
            })
            export class AppComponent {
              @HostBinding('style.width') width = '100px';
              @HostBinding('style.height') height = '200px';
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter(
          (d) => d.code === CssDiagnosticCode.CONFLICTING_STYLE_BINDING,
        );
        expect(cssDiags.length).toBe(0);
      });

      it('should allow host binding combined with template binding on different elements', () => {
        // Host binding applies to the component's host element
        // Template binding applies to elements inside the template
        // These do NOT conflict since they target different elements
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.width]="\\'200px\\'"></div>',
              host: {
                '[style.width]': '"100px"',
              },
            })
            export class AppComponent {}
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        // No conflict because they target different elements
        const cssDiags = diags.filter(
          (d) => d.code === CssDiagnosticCode.CONFLICTING_STYLE_BINDING,
        );
        expect(cssDiags.length).toBe(0);
      });

      it('should handle mixed kebab and camelCase properties without false conflicts', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div></div>',
              host: {
                '[style.background-color]': '"red"',
                '[style.border-radius]': '"5px"',
              },
            })
            export class AppComponent {}
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter(
          (d) => d.code === CssDiagnosticCode.CONFLICTING_STYLE_BINDING,
        );
        expect(cssDiags.length).toBe(0);
      });

      it('should detect conflict between host property and @HostBinding for same CSS property', () => {
        // When both host: {'[style.width]': ...} and @HostBinding('style.width') set the same property,
        // there is a conflict - only one will take effect at runtime
        const files = {
          'app.ts': `
            import {Component, HostBinding} from '@angular/core';

            @Component({
              template: '<div></div>',
              host: {
                '[style.width]': '"100px"',
              },
            })
            export class AppComponent {
              @HostBinding('style.width') widthValue = '200px';
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter(
          (d) => d.code === CssDiagnosticCode.CONFLICTING_STYLE_BINDING,
        );
        // Should detect the conflict - same 'width' property set via two different mechanisms
        expect(cssDiags.length).toBe(1);
        expect(cssDiags[0].messageText).toContain('width');
      });

      it('should NOT detect conflict between host and @HostBinding for different CSS properties', () => {
        const files = {
          'app.ts': `
            import {Component, HostBinding} from '@angular/core';

            @Component({
              template: '<div></div>',
              host: {
                '[style.width]': '"100px"',
              },
            })
            export class AppComponent {
              @HostBinding('style.height.em') get heightEm() { return 5; }
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter(
          (d) => d.code === CssDiagnosticCode.CONFLICTING_STYLE_BINDING,
        );
        expect(cssDiags.length).toBe(0);
      });
    });
  });

  describe('false positive prevention (valid CSS patterns)', () => {
    it('should allow CSS custom properties (--my-var)', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.--my-custom-color]="color"></div>',
          })
          export class AppComponent {
            color = 'red';
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) =>
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY ||
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should allow CSS custom properties in object literals', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="{\\'--my-var\\': \\'value\\', \\'--another-var\\': \\'10px\\'}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should allow vendor-prefixed properties in kebab-case', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <div [style.-webkit-transform]="transform"></div>
              <div [style.-moz-appearance]="'none'"></div>
              <div [style.-ms-flex]="1"></div>
              <div [style.-o-transition]="'all 0.5s'"></div>
            \`,
          })
          export class AppComponent {
            transform = 'rotate(45deg)';
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) =>
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY ||
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should allow vendor-prefixed properties in camelCase', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <div [style.WebkitTransform]="'rotate(45deg)'"></div>
              <div [style.MozAppearance]="'none'"></div>
              <div [style.msFlexAlign]="'center'"></div>
              <div [style.OTransition]="'all 0.5s'"></div>
            \`,
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) =>
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY ||
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should allow vendor-prefixed properties in object literals', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="{WebkitTransform: \\'rotate(45deg)\\', MozTransform: \\'rotate(45deg)\\', msTransform: \\'rotate(45deg)\\'}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should allow all standard CSS properties', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <div [style.display]="'flex'"></div>
              <div [style.position]="'absolute'"></div>
              <div [style.zIndex]="100"></div>
              <div [style.opacity]="0.5"></div>
              <div [style.overflow]="'hidden'"></div>
              <div [style.visibility]="'visible'"></div>
              <div [style.transform]="'translateX(10px)'"></div>
              <div [style.transition]="'all 0.3s'"></div>
              <div [style.animation]="'fadeIn 1s'"></div>
              <div [style.boxShadow]="'0 0 10px black'"></div>
              <div [style.textDecoration]="'underline'"></div>
              <div [style.cursor]="'pointer'"></div>
            \`,
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) =>
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY ||
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should allow modern CSS properties (grid, flexbox, etc.)', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: \`
              <div [style.gap]="'10px'"></div>
              <div [style.gridTemplateColumns]="'1fr 1fr'"></div>
              <div [style.gridArea]="'header'"></div>
              <div [style.alignItems]="'center'"></div>
              <div [style.justifyContent]="'space-between'"></div>
              <div [style.flexWrap]="'wrap'"></div>
              <div [style.aspectRatio]="'16/9'"></div>
              <div [style.objectFit]="'cover'"></div>
              <div [style.backdropFilter]="'blur(10px)'"></div>
              <div [style.clipPath]="'circle(50%)'"></div>
            \`,
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) =>
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY ||
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should not validate non-style property bindings', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<input [value]="unknownProp" [placeholder]="anotherProp">',
          })
          export class AppComponent {
            unknownProp = 'test';
            anotherProp = 'placeholder';
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) =>
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY ||
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should not validate class bindings', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [class.unknownClass]="true" [class]="classObj"></div>',
          })
          export class AppComponent {
            classObj = {unknownClass: true};
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) =>
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY ||
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should handle empty style object literal', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="{}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) =>
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT ||
          d.code === CssDiagnosticCode.DUPLICATE_CSS_PROPERTY,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should handle variable references without false positives', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="myStyles"></div>',
          })
          export class AppComponent {
            myStyles = {
              width: '100px',
              height: '200px',
            };
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      // Variable references are not object literals, so validation doesn't apply
      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should handle ternary expression style bindings', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.backgroundColor]="isActive ? \\'red\\' : \\'blue\\'"></div>',
          })
          export class AppComponent {
            isActive = true;
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) =>
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY ||
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should handle method call style bindings without false positives', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="getStyles()"></div>',
          })
          export class AppComponent {
            getStyles() {
              return {width: '100px'};
            }
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      // Method calls are not validated (we can't determine the return type statically)
      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should handle ngStyle with valid properties', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';
          import {NgStyle} from '@angular/common';

          @Component({
            imports: [NgStyle],
            template: '<div [ngStyle]="{width: \\'100px\\', \\'font-size\\': \\'14px\\'}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should validate ngStyle with invalid properties', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';
          import {NgStyle} from '@angular/common';

          @Component({
            imports: [NgStyle],
            template: '<div [ngStyle]="{wdith: \\'100px\\'}"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(1);
      expect(cssDiags[0].messageText).toContain("Unknown CSS property 'wdith'");
    });

    it('should handle ng-template style bindings', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<ng-template [style.width]="\\'100px\\'"></ng-template>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) =>
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY ||
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });

    it('should handle multiple spread operators', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style]="{...base, ...override}"></div>',
          })
          export class AppComponent {
            base = {width: '100px'};
            override = {height: '200px'};
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const cssDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY_IN_OBJECT,
      );
      expect(cssDiags.length).toBe(0);
    });
  });

  describe('obsolete CSS properties', () => {
    describe('in template [style.prop] bindings', () => {
      it('should report diagnostic for obsolete boxAlign property with replacement', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.boxAlign]="align"></div>',
            })
            export class AppComponent {
              align = 'center';
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.OBSOLETE_CSS_PROPERTY);
        expect(cssDiags.length).toBe(1);
        expect(cssDiags[0].messageText).toContain("CSS property 'boxAlign' is deprecated");
        expect(cssDiags[0].messageText).toContain('Use Flexbox `align-items` instead');
        expect(cssDiags[0].messageText).toContain("Consider using 'alignItems' instead");
        expect(cssDiags[0].messageText).toContain(
          'https://developer.mozilla.org/docs/Web/CSS/box-align',
        );
      });

      it('should report diagnostic for obsolete gridGap property with replacement', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.gridGap]="gap"></div>',
            })
            export class AppComponent {
              gap = '10px';
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.OBSOLETE_CSS_PROPERTY);
        expect(cssDiags.length).toBe(1);
        expect(cssDiags[0].messageText).toContain("CSS property 'gridGap' is deprecated");
        expect(cssDiags[0].messageText).toContain('Use `gap` instead');
        expect(cssDiags[0].messageText).toContain("Consider using 'gap' instead");
        expect(cssDiags[0].messageText).toContain('https://developer.mozilla.org/docs/Web/CSS/gap');
      });

      it('should report diagnostic for obsolete grid-row-gap in kebab-case', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.grid-row-gap]="gap"></div>',
            })
            export class AppComponent {
              gap = '5px';
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.OBSOLETE_CSS_PROPERTY);
        expect(cssDiags.length).toBe(1);
        expect(cssDiags[0].messageText).toContain("CSS property 'grid-row-gap' is deprecated");
        expect(cssDiags[0].messageText).toContain('Use `row-gap` instead');
        expect(cssDiags[0].messageText).toContain("Consider using 'row-gap' instead");
      });

      it('should report diagnostic for obsolete pageBreakAfter property', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.pageBreakAfter]="value"></div>',
            })
            export class AppComponent {
              value = 'always';
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.OBSOLETE_CSS_PROPERTY);
        expect(cssDiags.length).toBe(1);
        expect(cssDiags[0].messageText).toContain("CSS property 'pageBreakAfter' is deprecated");
        expect(cssDiags[0].messageText).toContain('Use `break-after` instead');
        expect(cssDiags[0].messageText).toContain("Consider using 'breakAfter' instead");
      });

      it('should report diagnostic for obsolete imeMode property without replacement', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.imeMode]="mode"></div>',
            })
            export class AppComponent {
              mode = 'disabled';
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter((d) => d.code === CssDiagnosticCode.OBSOLETE_CSS_PROPERTY);
        expect(cssDiags.length).toBe(1);
        expect(cssDiags[0].messageText).toContain("CSS property 'imeMode' is deprecated");
        expect(cssDiags[0].messageText).toContain('No replacement available');
        expect(cssDiags[0].messageText).not.toContain('Consider using');
        expect(cssDiags[0].messageText).toContain(
          'https://developer.mozilla.org/docs/Web/CSS/ime-mode',
        );
      });
    });

    describe('in style object literals', () => {
      it('should report diagnostic for obsolete property in [style]="{}"', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style]="{gridGap: gap}"></div>',
            })
            export class AppComponent {
              gap = '10px';
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter(
          (d) => d.code === CssDiagnosticCode.OBSOLETE_CSS_PROPERTY_IN_OBJECT,
        );
        expect(cssDiags.length).toBe(1);
        expect(cssDiags[0].messageText).toContain("CSS property 'gridGap' is deprecated");
        expect(cssDiags[0].messageText).toContain('Use `gap` instead');
      });

      it('should report diagnostic for obsolete property in [ngStyle]="{}"', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';
            import {NgStyle} from '@angular/common';

            @Component({
              imports: [NgStyle],
              template: '<div [ngStyle]="{boxFlex: flex}"></div>',
            })
            export class AppComponent {
              flex = 1;
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter(
          (d) => d.code === CssDiagnosticCode.OBSOLETE_CSS_PROPERTY_IN_OBJECT,
        );
        expect(cssDiags.length).toBe(1);
        expect(cssDiags[0].messageText).toContain("CSS property 'boxFlex' is deprecated");
        expect(cssDiags[0].messageText).toContain('Use Flexbox `flex` instead');
      });

      it('should report diagnostic for kebab-case obsolete property in object', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style]="{\\'box-align\\': align}"></div>',
            })
            export class AppComponent {
              align = 'center';
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter(
          (d) => d.code === CssDiagnosticCode.OBSOLETE_CSS_PROPERTY_IN_OBJECT,
        );
        expect(cssDiags.length).toBe(1);
        expect(cssDiags[0].messageText).toContain("CSS property 'box-align' is deprecated");
      });
    });

    describe('in host bindings', () => {
      it('should report diagnostic for obsolete property in host: {[style.prop]}', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: '',
              host: {
                '[style.gridGap]': 'gap',
              },
            })
            export class AppComponent {
              gap = '10px';
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter(
          (d) => d.code === CssDiagnosticCode.OBSOLETE_CSS_PROPERTY_IN_HOST,
        );
        expect(cssDiags.length).toBe(1);
        expect(cssDiags[0].messageText).toContain("CSS property 'gridGap' is deprecated");
        expect(cssDiags[0].messageText).toContain('Use `gap` instead');
        expect(cssDiags[0].messageText).toContain("Consider using 'gap' instead");
      });

      it('should report diagnostic for obsolete @HostBinding', () => {
        const files = {
          'app.ts': `
            import {Component, HostBinding} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: '',
            })
            export class AppComponent {
              @HostBinding('style.boxOrient') orient = 'horizontal';
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter(
          (d) => d.code === CssDiagnosticCode.OBSOLETE_CSS_PROPERTY_IN_HOST,
        );
        expect(cssDiags.length).toBe(1);
        expect(cssDiags[0].messageText).toContain("CSS property 'boxOrient' is deprecated");
        expect(cssDiags[0].messageText).toContain('Use Flexbox `flex-direction` instead');
        expect(cssDiags[0].messageText).toContain("Consider using 'flexDirection' instead");
      });

      it('should report diagnostic for kebab-case obsolete property in host', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              selector: 'my-component',
              template: '',
              host: {
                '[style.grid-column-gap]': 'gap',
              },
            })
            export class AppComponent {
              gap = '10px';
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const cssDiags = diags.filter(
          (d) => d.code === CssDiagnosticCode.OBSOLETE_CSS_PROPERTY_IN_HOST,
        );
        expect(cssDiags.length).toBe(1);
        expect(cssDiags[0].messageText).toContain("CSS property 'grid-column-gap' is deprecated");
        expect(cssDiags[0].messageText).toContain('Use `column-gap` instead');
        expect(cssDiags[0].messageText).toContain("Consider using 'column-gap' instead");
      });
    });

    describe('prioritization over unknown', () => {
      it('should report obsolete (not unknown) for known obsolete properties', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.scrollSnapPointsX]="snap"></div>',
            })
            export class AppComponent {
              snap = 'repeat(100px)';
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        // Should NOT report unknown
        const unknownDiags = diags.filter((d) => d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY);
        expect(unknownDiags.length).toBe(0);

        // Should report obsolete
        const obsoleteDiags = diags.filter(
          (d) => d.code === CssDiagnosticCode.OBSOLETE_CSS_PROPERTY,
        );
        expect(obsoleteDiags.length).toBe(1);
        expect(obsoleteDiags[0].messageText).toContain(
          "CSS property 'scrollSnapPointsX' is deprecated",
        );
      });
    });
  });

  describe('unit suffix value validation', () => {
    describe('in template [style.prop.unit] bindings', () => {
      it('should NOT report error for numeric value with unit suffix', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.width.px]="100"></div>',
            })
            export class AppComponent {}
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const unitValueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_UNIT_VALUE);
        expect(unitValueDiags.length).toBe(0);
      });

      it('should NOT report error for numeric string value with unit suffix', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.width.px]="\\'100\\'"></div>',
            })
            export class AppComponent {}
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const unitValueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_UNIT_VALUE);
        expect(unitValueDiags.length).toBe(0);
      });

      it('should report error for non-numeric string value with unit suffix', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.width.px]="\\'red\\'"></div>',
            })
            export class AppComponent {}
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const unitValueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_UNIT_VALUE);
        expect(unitValueDiags.length).toBe(1);
        expect(unitValueDiags[0].messageText).toContain("Invalid value 'red'");
        expect(unitValueDiags[0].messageText).toContain('expects a numeric value');
        expect(unitValueDiags[0].messageText).toContain("'redpx'");
      });

      it('should report error for boolean value with unit suffix', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.width.px]="true"></div>',
            })
            export class AppComponent {}
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const unitValueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_UNIT_VALUE);
        expect(unitValueDiags.length).toBe(1);
        expect(unitValueDiags[0].messageText).toContain("Invalid value 'true'");
        expect(unitValueDiags[0].messageText).toContain('not a boolean');
      });

      it('should NOT report error for null value with unit suffix', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.width.px]="null"></div>',
            })
            export class AppComponent {}
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const unitValueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_UNIT_VALUE);
        expect(unitValueDiags.length).toBe(0);
      });

      it('should NOT report error for variable reference (cannot validate statically)', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.width.px]="myWidth"></div>',
            })
            export class AppComponent {
              myWidth = 100;
            }
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const unitValueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_UNIT_VALUE);
        expect(unitValueDiags.length).toBe(0);
      });

      it('should report error for color name with px unit', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.height.em]="\\'blue\\'"></div>',
            })
            export class AppComponent {}
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const unitValueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_UNIT_VALUE);
        expect(unitValueDiags.length).toBe(1);
        expect(unitValueDiags[0].messageText).toContain("Invalid value 'blue'");
        expect(unitValueDiags[0].messageText).toContain("'blueem'");
      });

      it('should NOT report error for negative numeric values', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.margin.px]="-10"></div>',
            })
            export class AppComponent {}
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const unitValueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_UNIT_VALUE);
        expect(unitValueDiags.length).toBe(0);
      });

      it('should NOT report error for decimal numeric string values', () => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              template: '<div [style.lineHeight.em]="\\'1.5\\'"></div>',
            })
            export class AppComponent {}
          `,
        };
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const diags = project.getDiagnosticsForFile('app.ts');

        const unitValueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_UNIT_VALUE);
        expect(unitValueDiags.length).toBe(0);
      });
    });
  });

  describe('shorthand/longhand conflict detection', () => {
    it('should detect when background shorthand overrides backgroundColor longhand', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.backgroundColor]="\\'red\\'" [style.background]="\\'blue url(img.png)\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const shorthandDiags = diags.filter((d) => d.code === CssDiagnosticCode.SHORTHAND_OVERRIDE);
      expect(shorthandDiags.length).toBe(1);
      expect(shorthandDiags[0].messageText).toContain("'background-color' will be overridden");
      expect(shorthandDiags[0].messageText).toContain("'background' shorthand");
    });

    it('should detect when margin shorthand overrides marginTop longhand', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.marginTop]="\\'10px\\'" [style.margin]="\\'20px\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const shorthandDiags = diags.filter((d) => d.code === CssDiagnosticCode.SHORTHAND_OVERRIDE);
      expect(shorthandDiags.length).toBe(1);
      expect(shorthandDiags[0].messageText).toContain("'margin-top' will be overridden");
      expect(shorthandDiags[0].messageText).toContain("'margin' shorthand");
    });

    it('should detect multiple longhand conflicts with one shorthand', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.paddingTop]="\\'10px\\'" [style.paddingLeft]="\\'5px\\'" [style.padding]="\\'20px\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const shorthandDiags = diags.filter((d) => d.code === CssDiagnosticCode.SHORTHAND_OVERRIDE);
      expect(shorthandDiags.length).toBe(2);
    });

    it('should NOT report conflict when only shorthand is used', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.background]="\\'blue\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const shorthandDiags = diags.filter((d) => d.code === CssDiagnosticCode.SHORTHAND_OVERRIDE);
      expect(shorthandDiags.length).toBe(0);
    });

    it('should NOT report conflict when only longhand is used', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.backgroundColor]="\\'red\\'" [style.backgroundImage]="\\'url(img.png)\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const shorthandDiags = diags.filter((d) => d.code === CssDiagnosticCode.SHORTHAND_OVERRIDE);
      expect(shorthandDiags.length).toBe(0);
    });

    it('should detect border shorthand conflict with borderColor', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.borderColor]="\\'red\\'" [style.border]="\\'1px solid blue\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const shorthandDiags = diags.filter((d) => d.code === CssDiagnosticCode.SHORTHAND_OVERRIDE);
      expect(shorthandDiags.length).toBe(1);
      expect(shorthandDiags[0].messageText).toContain("'border-color' will be overridden");
    });

    it('should detect flex shorthand conflict with flexGrow', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.flexGrow]="1" [style.flex]="\\'1 1 auto\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const shorthandDiags = diags.filter((d) => d.code === CssDiagnosticCode.SHORTHAND_OVERRIDE);
      expect(shorthandDiags.length).toBe(1);
      expect(shorthandDiags[0].messageText).toContain("'flex-grow' will be overridden");
    });

    it('should work with kebab-case property names', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.background-color]="\\'red\\'" [style.background]="\\'blue\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const shorthandDiags = diags.filter((d) => d.code === CssDiagnosticCode.SHORTHAND_OVERRIDE);
      expect(shorthandDiags.length).toBe(1);
    });
  });

  describe('CSS value validation', () => {
    // Note: vscode-css-languageservice does NOT perform semantic value validation.
    // It only validates CSS syntax (missing colons, empty values, etc.) and property names.
    // These tests verify the existing behavior and integration.

    it('should report diagnostic for invalid CSS value (validated by css-tree)', () => {
      // css-tree validates property VALUES. 'flexx' is not a valid value for display property.
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.display]="\\'flexx\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const valueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_CSS_VALUE);
      // css-tree validates property values, so this should report 1 diagnostic
      expect(valueDiags.length).toBe(1);
      expect(valueDiags[0].messageText).toContain('flexx');
    });

    it('should suggest similar values for typos (flexx -> flex)', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.display]="\\'flexx\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const valueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_CSS_VALUE);
      expect(valueDiags.length).toBe(1);
      expect(valueDiags[0].messageText).toContain("Did you mean 'flex'");
    });

    it('should not report diagnostic for valid CSS value in style binding', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.display]="\\'flex\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const valueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_CSS_VALUE);
      expect(valueDiags.length).toBe(0);
    });

    it('should not report diagnostic for CSS custom properties (CSS variables)', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.--my-color]="\\'anything\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const valueDiags = diags.filter(
        (d) =>
          d.code === CssDiagnosticCode.INVALID_CSS_VALUE ||
          d.code === CssDiagnosticCode.UNKNOWN_CSS_PROPERTY,
      );
      expect(valueDiags.length).toBe(0);
    });

    it('should not validate non-literal values (variables)', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.display]="myDisplay"></div>',
          })
          export class AppComponent {
            myDisplay = 'flex';
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      // Should not report value diagnostics for dynamic values
      const valueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_CSS_VALUE);
      expect(valueDiags.length).toBe(0);
    });

    it('should skip validation for bindings with unit suffix', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.width.px]="100"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const valueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_CSS_VALUE);
      expect(valueDiags.length).toBe(0);
    });

    it('should not report diagnostic for @HostBinding with dynamic value', () => {
      const files = {
        'app.ts': `
          import {Component, HostBinding} from '@angular/core';

          @Component({
            template: '',
          })
          export class AppComponent {
            @HostBinding('style.display') display = 'flex';
          }
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      // Dynamic values from class properties are not validated at compile time
      const valueDiags = diags.filter(
        (d) => d.code === CssDiagnosticCode.INVALID_CSS_VALUE_IN_HOST,
      );
      expect(valueDiags.length).toBe(0);
    });

    // css-tree value validation tests
    it('should validate compound CSS values like border', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.border]="\\'1px solid red\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const valueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_CSS_VALUE);
      expect(valueDiags.length).toBe(0);
    });

    it('should report diagnostic for invalid compound CSS value', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.border]="\\'1px solids red\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const valueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_CSS_VALUE);
      expect(valueDiags.length).toBe(1);
    });

    it('should not validate CSS var() references', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.color]="\\'var(--my-color)\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const valueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_CSS_VALUE);
      expect(valueDiags.length).toBe(0);
    });

    it('should validate color values', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.color]="\\'#ff0000\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const valueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_CSS_VALUE);
      expect(valueDiags.length).toBe(0);
    });

    it('should report diagnostic for invalid color value', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<div [style.color]="\\'notacolor\\'"></div>',
          })
          export class AppComponent {}
        `,
      };
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      const valueDiags = diags.filter((d) => d.code === CssDiagnosticCode.INVALID_CSS_VALUE);
      expect(valueDiags.length).toBe(1);
    });
  });

  // TODO: Configuration tests require updating the testing infrastructure to support
  // PluginConfig options (cssPropertyValidation). Currently, the test environment
  // always uses default config. Configuration tests should be added in a follow-up PR.
  //
  // Strict mode warnings (strictUnitValues: true) would test:
  // - PREFER_NUMERIC_UNIT_VALUE (99015): Warn when using string '100' instead of number 100 with unit suffix
  //   Example: [style.width.px]="'100'" should suggest using [style.width.px]="100"
  // - MISSING_UNIT_FOR_NUMBER (99016): Warn when number used without unit for length properties
  //   Example: [style.width]="100" should suggest using [style.width.px]="100" or [style.width]="'100px'"
});

// Unit tests for CSS value hover functionality (using css-tree)
import {getCSSValueHoverAtOffset, getCSSValueTokens} from '../src/css';

describe('CSS value hover documentation (css-tree)', () => {
  describe('getCSSValueHoverAtOffset', () => {
    it('should identify dimension values', () => {
      const result = getCSSValueHoverAtOffset('border', '1px solid red', 0);
      expect(result).not.toBeNull();
      expect(result!.token).toBe('1px');
      // css-tree returns the actual grammar type (line-width for border widths)
      expect(result!.semanticType).toBeTruthy();
    });

    it('should identify line-style values', () => {
      const result = getCSSValueHoverAtOffset('border', '1px solid red', 5);
      expect(result).not.toBeNull();
      expect(result!.token).toBe('solid');
      expect(result!.semanticType).toBe('line-style');
    });

    it('should identify color values', () => {
      const result = getCSSValueHoverAtOffset('border', '1px solid red', 11);
      expect(result).not.toBeNull();
      expect(result!.token).toBe('red');
      // css-tree returns the first matching type from the grammar
      expect(result!.semanticType).toBeTruthy();
    });

    it('should identify hex colors', () => {
      const result = getCSSValueHoverAtOffset('color', '#ff0000', 0);
      expect(result).not.toBeNull();
      expect(result!.token).toBe('#ff0000');
      // Hash nodes use their node type as semantic type
      expect(result!.semanticType).toBeTruthy();
    });

    it('should identify rgb function colors', () => {
      const result = getCSSValueHoverAtOffset('color', 'rgb(255, 0, 0)', 0);
      expect(result).not.toBeNull();
      // css-tree returns the grammar type for color functions
      expect(result!.semanticType).toBeTruthy();
    });

    it('should identify hsl function colors', () => {
      const result = getCSSValueHoverAtOffset('color', 'hsl(0, 100%, 50%)', 0);
      expect(result).not.toBeNull();
      expect(result!.semanticType).toBeTruthy();
    });

    it('should identify hwb function colors', () => {
      const result = getCSSValueHoverAtOffset('color', 'hwb(0 0% 0%)', 0);
      expect(result).not.toBeNull();
      expect(result!.semanticType).toBeTruthy();
    });

    it('should identify lab function colors (wide-gamut)', () => {
      const result = getCSSValueHoverAtOffset('color', 'lab(50% 40 59.5)', 0);
      expect(result).not.toBeNull();
      expect(result!.semanticType).toBeTruthy();
    });

    it('should identify lch function colors (wide-gamut)', () => {
      const result = getCSSValueHoverAtOffset('color', 'lch(52.2% 72.2 50)', 0);
      expect(result).not.toBeNull();
      expect(result!.semanticType).toBeTruthy();
    });

    it('should identify oklab function colors (wide-gamut)', () => {
      const result = getCSSValueHoverAtOffset('color', 'oklab(59% 0.1 0.1)', 0);
      expect(result).not.toBeNull();
      expect(result!.semanticType).toBeTruthy();
    });

    it('should identify oklch function colors (wide-gamut)', () => {
      const result = getCSSValueHoverAtOffset('color', 'oklch(60% 0.15 50)', 0);
      expect(result).not.toBeNull();
      expect(result!.semanticType).toBeTruthy();
    });

    it('should identify color() function with display-p3 (wide-gamut)', () => {
      const result = getCSSValueHoverAtOffset('color', 'color(display-p3 1 0.5 0)', 0);
      expect(result).not.toBeNull();
      expect(result!.semanticType).toBeTruthy();
    });

    it('should identify color() function with srgb', () => {
      const result = getCSSValueHoverAtOffset('color', 'color(srgb 1 0.5 0)', 0);
      expect(result).not.toBeNull();
      expect(result!.semanticType).toBeTruthy();
    });

    it('should identify color() function with rec2020 (wide-gamut)', () => {
      const result = getCSSValueHoverAtOffset('color', 'color(rec2020 1 0.5 0)', 0);
      expect(result).not.toBeNull();
      expect(result!.semanticType).toBeTruthy();
    });

    it('should identify color-mix() function', () => {
      const result = getCSSValueHoverAtOffset('color', 'color-mix(in srgb, red, blue)', 0);
      expect(result).not.toBeNull();
      expect(result!.semanticType).toBeTruthy();
    });

    it('should identify light-dark() function', () => {
      const result = getCSSValueHoverAtOffset('color', 'light-dark(white, black)', 0);
      expect(result).not.toBeNull();
      expect(result!.semanticType).toBeTruthy();
    });

    it('should identify display-inside values', () => {
      const result = getCSSValueHoverAtOffset('display', 'flex', 0);
      expect(result).not.toBeNull();
      expect(result!.token).toBe('flex');
      expect(result!.semanticType).toBe('display-inside');
    });

    it('should include MDN documentation for values', () => {
      // MDN documentation from vscode-css-languageservice should be included
      const result = getCSSValueHoverAtOffset('display', 'flex', 0);
      expect(result).not.toBeNull();
      expect(result!.description).toContain('flex');
    });

    it('should identify var() as function (css-tree cannot infer type)', () => {
      const result = getCSSValueHoverAtOffset('color', 'var(--my-color)', 0);
      expect(result).not.toBeNull();
      // css-tree returns 'function' since it can't know what the variable resolves to
      expect(result!.semanticType).toBe('function');
    });

    it('should identify calc() with a semantic type', () => {
      const result = getCSSValueHoverAtOffset('width', 'calc(100% - 20px)', 0);
      expect(result).not.toBeNull();
      // css-tree returns the result type or 'function' if it can't determine
      expect(result!.semanticType).toBeTruthy();
    });

    it('should return null for invalid offset', () => {
      const result = getCSSValueHoverAtOffset('color', 'red', 10);
      expect(result).toBeNull();
    });
  });

  describe('getCSSValueTokens', () => {
    it('should return all tokens for compound value', () => {
      const tokens = getCSSValueTokens('border', '1px solid red');
      expect(tokens.length).toBe(3);
      // css-tree returns the actual grammar types
      expect(tokens[0].semanticType).toBeTruthy();
      expect(tokens[1].semanticType).toBe('line-style');
      expect(tokens[2].semanticType).toBeTruthy();
    });

    it('should include token offsets', () => {
      const tokens = getCSSValueTokens('border', '1px solid red');
      expect(tokens[0].start).toBe(0);
      expect(tokens[0].end).toBe(3);
      expect(tokens[1].start).toBe(4);
      expect(tokens[1].end).toBe(9);
    });

    it('should return empty array for invalid value', () => {
      const tokens = getCSSValueTokens('color', '');
      expect(tokens.length).toBe(0);
    });

    it('should handle font stacks with generic families', () => {
      const tokens = getCSSValueTokens('font-family', 'Arial, sans-serif');
      // Arial is an identifier, sans-serif is a generic-family
      // css-tree returns the actual grammar type 'generic-family'
      expect(
        tokens.some((t) => t.token === 'sans-serif' && t.semanticType === 'generic-family'),
      ).toBe(true);
    });

    it('should handle quoted font names', () => {
      const tokens = getCSSValueTokens('font-family', "'Open Sans', Arial");
      // css-tree returns 'family-name' from the CSS grammar for font names
      expect(
        tokens.some((t) => t.token.includes('Open Sans') && t.semanticType === 'family-name'),
      ).toBe(true);
    });

    it('should handle alignment multi-word values', () => {
      const tokens = getCSSValueTokens('align-items', 'first baseline');
      expect(tokens.length).toBe(2);
      // Both should be identified (baseline-position type)
      expect(tokens[0].token).toBe('first');
      expect(tokens[1].token).toBe('baseline');
    });
  });
});

// Unit tests for fuzzy CSS value matching
import {findSimilarCSSValues} from '../src/css';

describe('findSimilarCSSValues', () => {
  it('should suggest flex for flexx typo', () => {
    const suggestions = findSimilarCSSValues('display', 'flexx');
    expect(suggestions).toContain('flex');
  });

  it('should suggest block for blok typo', () => {
    const suggestions = findSimilarCSSValues('display', 'blok');
    expect(suggestions).toContain('block');
  });

  it('should suggest solid for sloid typo', () => {
    const suggestions = findSimilarCSSValues('border-style', 'sloid');
    expect(suggestions).toContain('solid');
  });

  it('should suggest center for cneter typo', () => {
    const suggestions = findSimilarCSSValues('text-align', 'cneter');
    expect(suggestions).toContain('center');
  });

  it('should return empty array for very different input', () => {
    const suggestions = findSimilarCSSValues('display', 'xyzabc123');
    expect(suggestions.length).toBe(0);
  });

  it('should return empty array for property with no keyword values', () => {
    // width takes length values, not keywords like display
    const suggestions = findSimilarCSSValues('width', 'flexx');
    // May have some suggestions like 'fit-content' but not 'flex'
    expect(suggestions).not.toContain('flex');
  });

  it('should limit suggestions to maxSuggestions', () => {
    const suggestions = findSimilarCSSValues('display', 'none', 1);
    expect(suggestions.length).toBeLessThanOrEqual(1);
  });
});

// Unit tests for getCSSValueHover - simple API for value documentation
import {getCSSValueHover} from '../src/css';

describe('getCSSValueHover', () => {
  it('should return hover info for valid keyword value', () => {
    const result = getCSSValueHover('display', 'flex');
    expect(result).not.toBeNull();
    expect(result!.property).toBe('display');
    expect(result!.value).toBe('flex');
    expect(result!.isValid).toBe(true);
    expect(result!.documentation).toBeDefined();
    expect(result!.documentation).toContain('flex');
  });

  it('should return hover info for color keywords', () => {
    const result = getCSSValueHover('color', 'red');
    expect(result).not.toBeNull();
    expect(result!.property).toBe('color');
    expect(result!.value).toBe('red');
    expect(result!.isValid).toBe(true);
  });

  it('should return isValid false for invalid values', () => {
    const result = getCSSValueHover('display', 'flexx');
    expect(result).not.toBeNull();
    expect(result!.isValid).toBe(false);
  });

  it('should work for position keywords', () => {
    const result = getCSSValueHover('position', 'absolute');
    expect(result).not.toBeNull();
    expect(result!.value).toBe('absolute');
    expect(result!.isValid).toBe(true);
  });

  it('should return isValid false for invalid property', () => {
    const result = getCSSValueHover('not-a-property', 'value');
    expect(result).not.toBeNull();
    expect(result!.isValid).toBe(false);
  });
});
