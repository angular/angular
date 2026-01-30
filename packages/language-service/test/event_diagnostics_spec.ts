/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {createModuleAndProjectWithDeclarations, LanguageServiceTestEnv} from '../testing';
import {EventDiagnosticCode} from '../src/events';

describe('Event validation diagnostics', () => {
  let env: LanguageServiceTestEnv;

  beforeEach(() => {
    initMockFileSystem('Native');
    env = LanguageServiceTestEnv.setup();
  });

  describe('Unknown DOM event detection', () => {
    it('should detect misspelled DOM event names', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<button (clcik)="onClick()">Click</button>',
          })
          export class AppComponent {
            onClick() {}
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      // Debug: print all diagnostics
      console.log(
        'All diagnostics:',
        diags.map((d) => ({code: d.code, message: d.messageText})),
      );

      const eventDiags = diags.filter((d) => d.code === EventDiagnosticCode.UNKNOWN_DOM_EVENT);

      expect(eventDiags.length).toBe(1);
      expect(eventDiags[0].messageText).toContain('clcik');
      expect(eventDiags[0].messageText).toContain('click'); // Should suggest 'click'
    });

    it('should not report valid DOM events', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<button (click)="onClick()">Click</button>',
          })
          export class AppComponent {
            onClick() {}
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const eventDiags = diags.filter((d) => d.code === EventDiagnosticCode.UNKNOWN_DOM_EVENT);

      expect(eventDiags.length).toBe(0);
    });

    it('should not report events on custom elements', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<my-component (customEvent)="onEvent()"></my-component>',
          })
          export class AppComponent {
            onEvent() {}
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const eventDiags = diags.filter((d) => d.code === EventDiagnosticCode.UNKNOWN_DOM_EVENT);

      expect(eventDiags.length).toBe(0);
    });

    it('should handle keyboard event modifiers correctly', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            template: '<input (keydown.enter)="onEnter()">',
          })
          export class AppComponent {
            onEnter() {}
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const eventDiags = diags.filter((d) => d.code === EventDiagnosticCode.UNKNOWN_DOM_EVENT);

      expect(eventDiags.length).toBe(0);
    });

    it('should not report when directive output shadows DOM event', () => {
      // When a directive has an @Output with the same name as a DOM event (e.g., 'click'),
      // Angular calls both the DOM event listener and the directive output subscriber.
      // We should not warn about this since the directive output is intentional.
      const files = {
        'app.ts': `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[appClickOverride]',
            standalone: true,
          })
          export class ClickOverrideDirective {
            @Output() click = new EventEmitter<string>();
          }

          @Component({
            imports: [ClickOverrideDirective],
            template: '<button appClickOverride (click)="onClick($event)">Click</button>',
          })
          export class AppComponent {
            onClick(event: any) {}
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const eventDiags = diags.filter((d) => d.code === EventDiagnosticCode.UNKNOWN_DOM_EVENT);

      expect(eventDiags.length).toBe(0);
    });

    it('should still detect typos when directive is present but event name does not match', () => {
      // Even with a directive that has an @Output(), if the event name doesn't match
      // the directive output, we should still validate it as a DOM event.
      const files = {
        'app.ts': `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[appClickOverride]',
            standalone: true,
          })
          export class ClickOverrideDirective {
            @Output() click = new EventEmitter<string>();  // Has 'click', not 'clcik'
          }

          @Component({
            imports: [ClickOverrideDirective],
            template: '<button appClickOverride (clcik)="onClick($event)">Click</button>',
          })
          export class AppComponent {
            onClick(event: any) {}
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const eventDiags = diags.filter((d) => d.code === EventDiagnosticCode.UNKNOWN_DOM_EVENT);

      // Should warn about 'clcik' being unknown, even though directive has 'click' output
      expect(eventDiags.length).toBe(1);
      expect(eventDiags[0].messageText).toContain('clcik');
      expect(eventDiags[0].messageText).toContain('click'); // Should suggest 'click'
    });
  });

  describe('Shadowed DOM event detection', () => {
    it('should warn when directive output shadows a native DOM event', () => {
      // When a directive has an @Output with the same name as a DOM event (e.g., 'click'),
      // Angular calls both the DOM event listener and the directive output subscriber.
      // This can lead to unexpected behavior where the handler is called twice.
      const files = {
        'app.ts': `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[appClickOverride]',
            standalone: true,
          })
          export class ClickOverrideDirective {
            @Output() click = new EventEmitter<string>();
          }

          @Component({
            imports: [ClickOverrideDirective],
            template: '<button appClickOverride (click)="onClick($event)">Click</button>',
          })
          export class AppComponent {
            onClick(event: any) {}
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const shadowDiags = diags.filter((d) => d.code === EventDiagnosticCode.SHADOWED_DOM_EVENT);

      expect(shadowDiags.length).toBe(1);
      expect(shadowDiags[0].messageText).toContain('ClickOverrideDirective');
      expect(shadowDiags[0].messageText).toContain('click');
      expect(shadowDiags[0].messageText).toContain('2 times');
      expect(shadowDiags[0].messageText).toContain('PointerEvent'); // Shows DOM event type
    });

    it('should not warn when directive output does not shadow a DOM event', () => {
      // Custom event names that don't match any DOM event should not trigger the warning
      const files = {
        'app.ts': `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[appCustom]',
            standalone: true,
          })
          export class CustomDirective {
            @Output() customEvent = new EventEmitter<string>();
          }

          @Component({
            imports: [CustomDirective],
            template: '<button appCustom (customEvent)="onEvent($event)">Click</button>',
          })
          export class AppComponent {
            onEvent(event: string) {}
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const shadowDiags = diags.filter((d) => d.code === EventDiagnosticCode.SHADOWED_DOM_EVENT);

      expect(shadowDiags.length).toBe(0);
    });
  });

  describe('Conflicting directive outputs detection', () => {
    it('should warn when multiple directives have outputs with the same name and show types', () => {
      // When multiple directives on the same element have outputs with the same name,
      // the handler will be called multiple times.
      const files = {
        'app.ts': `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[appFirst]',
            standalone: true,
          })
          export class FirstDirective {
            @Output() customEvent = new EventEmitter<string>();
          }

          @Directive({
            selector: '[appSecond]',
            standalone: true,
          })
          export class SecondDirective {
            @Output() customEvent = new EventEmitter<number>();
          }

          @Component({
            imports: [FirstDirective, SecondDirective],
            template: '<button appFirst appSecond (customEvent)="onEvent($event)">Click</button>',
          })
          export class AppComponent {
            onEvent(event: any) {}
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const conflictDiags = diags.filter((d) => d.code === EventDiagnosticCode.CONFLICTING_OUTPUTS);

      expect(conflictDiags.length).toBe(1);
      expect(conflictDiags[0].messageText).toContain('FirstDirective');
      expect(conflictDiags[0].messageText).toContain('SecondDirective');
      expect(conflictDiags[0].messageText).toContain('customEvent');
      // Should show actual output types (string for FirstDirective, number for SecondDirective)
      expect(conflictDiags[0].messageText).toContain('string');
      expect(conflictDiags[0].messageText).toContain('number');
    });

    it('should warn when multiple directives shadow a DOM event', () => {
      // Multiple directives with 'click' outputs all shadow the native click event
      const files = {
        'app.ts': `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[appFirst]',
            standalone: true,
          })
          export class FirstDirective {
            @Output() click = new EventEmitter<string>();
          }

          @Directive({
            selector: '[appSecond]',
            standalone: true,
          })
          export class SecondDirective {
            @Output() click = new EventEmitter<number>();
          }

          @Component({
            imports: [FirstDirective, SecondDirective],
            template: '<button appFirst appSecond (click)="onClick($event)">Click</button>',
          })
          export class AppComponent {
            onClick(event: any) {}
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');

      // Should have both conflicting outputs warning and shadowed DOM event warning
      const conflictDiags = diags.filter((d) => d.code === EventDiagnosticCode.CONFLICTING_OUTPUTS);
      const shadowDiags = diags.filter((d) => d.code === EventDiagnosticCode.SHADOWED_DOM_EVENT);

      expect(conflictDiags.length).toBe(1);
      expect(shadowDiags.length).toBe(1);
      expect(shadowDiags[0].messageText).toContain('3 times'); // DOM + 2 directives
      expect(shadowDiags[0].messageText).toContain('PointerEvent'); // Shows DOM event type
    });

    it('should detect outputs from hostDirectives that shadow DOM events', () => {
      // When a directive uses hostDirectives that have outputs matching DOM events
      const files = {
        'app.ts': `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[baseDir]',
            standalone: true,
          })
          export class BaseDirective {
            @Output() click = new EventEmitter<string>();
          }

          @Directive({
            selector: '[appDir]',
            standalone: true,
            hostDirectives: [{ directive: BaseDirective, outputs: ['click'] }],
          })
          export class AppDirective {}

          @Component({
            imports: [AppDirective],
            template: '<button appDir (click)="onClick($event)">Click</button>',
          })
          export class AppComponent {
            onClick(event: any) {}
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const shadowDiags = diags.filter((d) => d.code === EventDiagnosticCode.SHADOWED_DOM_EVENT);

      // Should detect that BaseDirective's click output shadows the DOM event
      expect(shadowDiags.length).toBe(1);
      expect(shadowDiags[0].messageText).toContain('click');
      expect(shadowDiags[0].messageText).toContain('2 times');
      expect(shadowDiags[0].messageText).toContain('PointerEvent');
    });
  });

  describe('Output definition warnings', () => {
    it('should warn when @Output name matches a DOM event', () => {
      // When a directive defines an output that shadows a DOM event name
      const files = {
        'app.ts': `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[appClickDir]',
            standalone: true,
          })
          export class ClickDirective {
            @Output() click = new EventEmitter<string>();
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const outputDiags = diags.filter(
        (d) => d.code === EventDiagnosticCode.OUTPUT_SHADOWS_DOM_EVENT,
      );

      expect(outputDiags.length).toBe(1);
      expect(outputDiags[0].messageText).toContain("Output 'click' shadows");
      expect(outputDiags[0].messageText).toContain('PointerEvent');
      expect(outputDiags[0].messageText).toContain('Consider renaming');
    });

    it('should not warn for custom output names that do not match DOM events', () => {
      const files = {
        'app.ts': `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[appCustomDir]',
            standalone: true,
          })
          export class CustomDirective {
            @Output() customEvent = new EventEmitter<string>();
            @Output() dataChanged = new EventEmitter<number>();
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const outputDiags = diags.filter(
        (d) => d.code === EventDiagnosticCode.OUTPUT_SHADOWS_DOM_EVENT,
      );

      expect(outputDiags.length).toBe(0);
    });

    it('should warn for multiple DOM event output names in same directive', () => {
      const files = {
        'app.ts': `
          import {Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[appMultiDir]',
            standalone: true,
          })
          export class MultiDirective {
            @Output() click = new EventEmitter<string>();
            @Output() focus = new EventEmitter<void>();
            @Output() mouseenter = new EventEmitter<MouseEvent>();
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const outputDiags = diags.filter(
        (d) => d.code === EventDiagnosticCode.OUTPUT_SHADOWS_DOM_EVENT,
      );

      expect(outputDiags.length).toBe(3);
      expect(outputDiags[0].messageText).toContain('click');
      expect(outputDiags[1].messageText).toContain('focus');
      expect(outputDiags[2].messageText).toContain('mouseenter');
    });

    it('should warn for output() function that shadows DOM event', () => {
      const files = {
        'app.ts': `
          import {Directive, output} from '@angular/core';

          @Directive({
            selector: '[appSignalDir]',
            standalone: true,
          })
          export class SignalDirective {
            click = output<string>();
            focus = output<void>();
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const outputDiags = diags.filter(
        (d) => d.code === EventDiagnosticCode.OUTPUT_SHADOWS_DOM_EVENT,
      );

      expect(outputDiags.length).toBe(2);
      expect(outputDiags[0].messageText).toContain('click');
      expect(outputDiags[1].messageText).toContain('focus');
    });

    it('should warn for output() function with alias that shadows DOM event', () => {
      const files = {
        'app.ts': `
          import {Directive, output} from '@angular/core';

          @Directive({
            selector: '[appAliasDir]',
            standalone: true,
          })
          export class AliasDirective {
            // Internal name is customClick, but public binding name is 'click'
            customClick = output<string>({ alias: 'click' });
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const outputDiags = diags.filter(
        (d) => d.code === EventDiagnosticCode.OUTPUT_SHADOWS_DOM_EVENT,
      );

      expect(outputDiags.length).toBe(1);
      expect(outputDiags[0].messageText).toContain('click');
    });
  });

  describe('external template support', () => {
    it('should detect shadowed DOM events in external HTML templates', () => {
      const files = {
        'app.ts': `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            selector: '[appClickOverride]',
            standalone: true,
          })
          export class ClickOverrideDirective {
            @Output() click = new EventEmitter<string>();
          }

          @Component({
            imports: [ClickOverrideDirective],
            templateUrl: './app.html',
          })
          export class AppComponent {
            onClick(event: any) {}
          }
        `,
        'app.html': '<button appClickOverride (click)="onClick($event)">Click</button>',
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);

      // Check diagnostics from HTML file perspective
      const htmlDiags = project.getDiagnosticsForFile('app.html');
      const shadowDiagsFromHtml = htmlDiags.filter(
        (d) => d.code === EventDiagnosticCode.SHADOWED_DOM_EVENT,
      );
      expect(shadowDiagsFromHtml.length).toBe(1);
      expect(shadowDiagsFromHtml[0].messageText).toContain('ClickOverrideDirective');
      expect(shadowDiagsFromHtml[0].messageText).toContain('2 times');

      // Check diagnostics from TS file perspective (should also work)
      const tsDiags = project.getDiagnosticsForFile('app.ts');
      const shadowDiagsFromTs = tsDiags.filter(
        (d) => d.code === EventDiagnosticCode.SHADOWED_DOM_EVENT,
      );
      expect(shadowDiagsFromTs.length).toBe(1);
    });
  });

  describe('Conflicting inputs detection', () => {
    it('should warn when multiple directives have inputs with the same name', () => {
      const files = {
        'app.ts': `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dirA]',
            standalone: true,
          })
          export class DirA {
            @Input() value!: string;
          }

          @Directive({
            selector: '[dirB]',
            standalone: true,
          })
          export class DirB {
            @Input() value!: number;
          }

          @Component({
            imports: [DirA, DirB],
            template: '<div dirA dirB [value]="myValue"></div>',
          })
          export class AppComponent {
            myValue = 'test';
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const conflictDiags = diags.filter((d) => d.code === EventDiagnosticCode.CONFLICTING_INPUTS);

      expect(conflictDiags.length).toBe(1);
      expect(conflictDiags[0].messageText).toContain(
        "Multiple directives have inputs named 'value'",
      );
      expect(conflictDiags[0].messageText).toContain('DirA');
      expect(conflictDiags[0].messageText).toContain('DirB');
    });

    it('should show actual types in conflicting input warning', () => {
      const files = {
        'app.ts': `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dirA]',
            standalone: true,
          })
          export class DirA {
            @Input() value!: string;
          }

          @Directive({
            selector: '[dirB]',
            standalone: true,
          })
          export class DirB {
            @Input() value!: number;
          }

          @Component({
            imports: [DirA, DirB],
            template: '<div dirA dirB [value]="myValue"></div>',
          })
          export class AppComponent {
            myValue = 'test';
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const conflictDiags = diags.filter((d) => d.code === EventDiagnosticCode.CONFLICTING_INPUTS);

      expect(conflictDiags.length).toBe(1);
      // Should show actual types
      expect(conflictDiags[0].messageText).toContain('string');
      expect(conflictDiags[0].messageText).toContain('number');
    });

    it('should not warn when only one directive claims the input', () => {
      const files = {
        'app.ts': `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({
            selector: '[dirA]',
            standalone: true,
          })
          export class DirA {
            @Input() value!: string;
          }

          @Component({
            imports: [DirA],
            template: '<div dirA [value]="myValue"></div>',
          })
          export class AppComponent {
            myValue = 'test';
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const conflictDiags = diags.filter((d) => d.code === EventDiagnosticCode.CONFLICTING_INPUTS);

      expect(conflictDiags.length).toBe(0);
    });
  });

  describe('Host directive shadowing detection', () => {
    it('should warn when own output shadows host directive output', () => {
      const files = {
        'app.ts': `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            standalone: true,
          })
          export class BaseDirective {
            @Output() action = new EventEmitter<string>();
          }

          @Directive({
            selector: '[derived]',
            standalone: true,
            hostDirectives: [{
              directive: BaseDirective,
              outputs: ['action']
            }]
          })
          export class DerivedDirective {
            @Output() action = new EventEmitter<number>();
          }

          @Component({
            imports: [DerivedDirective],
            template: '<div derived (action)="onAction($event)"></div>',
          })
          export class AppComponent {
            onAction(event: any) {}
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const shadowDiags = diags.filter(
        (d) => d.code === EventDiagnosticCode.HOST_DIRECTIVE_OUTPUT_SHADOWED,
      );

      expect(shadowDiags.length).toBe(1);
      expect(shadowDiags[0].messageText).toContain("Output 'action' shadows");
      expect(shadowDiags[0].messageText).toContain('BaseDirective');
    });

    it('should warn when own input shadows host directive input', () => {
      const files = {
        'app.ts': `
          import {Component, Directive, Input} from '@angular/core';

          @Directive({
            standalone: true,
          })
          export class BaseDirective {
            @Input() config!: string;
          }

          @Directive({
            selector: '[derived]',
            standalone: true,
            hostDirectives: [{
              directive: BaseDirective,
              inputs: ['config']
            }]
          })
          export class DerivedDirective {
            @Input() config!: number;
          }

          @Component({
            imports: [DerivedDirective],
            template: '<div derived [config]="myConfig"></div>',
          })
          export class AppComponent {
            myConfig = 'test';
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const shadowDiags = diags.filter(
        (d) => d.code === EventDiagnosticCode.HOST_DIRECTIVE_INPUT_SHADOWED,
      );

      expect(shadowDiags.length).toBe(1);
      expect(shadowDiags[0].messageText).toContain("Input 'config' shadows");
      expect(shadowDiags[0].messageText).toContain('BaseDirective');
    });

    it('should not warn when host directive output is not exposed', () => {
      const files = {
        'app.ts': `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            standalone: true,
          })
          export class BaseDirective {
            @Output() action = new EventEmitter<string>();
          }

          @Directive({
            selector: '[derived]',
            standalone: true,
            hostDirectives: [{
              directive: BaseDirective
              // outputs not specified, so 'action' is NOT exposed
            }]
          })
          export class DerivedDirective {
            @Output() action = new EventEmitter<number>();
          }

          @Component({
            imports: [DerivedDirective],
            template: '<div derived (action)="onAction($event)"></div>',
          })
          export class AppComponent {
            onAction(event: any) {}
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const shadowDiags = diags.filter(
        (d) => d.code === EventDiagnosticCode.HOST_DIRECTIVE_OUTPUT_SHADOWED,
      );

      // Should not warn because the host directive output is not exposed
      expect(shadowDiags.length).toBe(0);
    });

    it('should warn with aliased host directive output', () => {
      const files = {
        'app.ts': `
          import {Component, Directive, Output, EventEmitter} from '@angular/core';

          @Directive({
            standalone: true,
          })
          export class BaseDirective {
            @Output() originalAction = new EventEmitter<string>();
          }

          @Directive({
            selector: '[derived]',
            standalone: true,
            hostDirectives: [{
              directive: BaseDirective,
              outputs: ['originalAction: action']
            }]
          })
          export class DerivedDirective {
            @Output() action = new EventEmitter<number>();
          }

          @Component({
            imports: [DerivedDirective],
            template: '<div derived (action)="onAction($event)"></div>',
          })
          export class AppComponent {
            onAction(event: any) {}
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const diags = project.getDiagnosticsForFile('app.ts');
      const shadowDiags = diags.filter(
        (d) => d.code === EventDiagnosticCode.HOST_DIRECTIVE_OUTPUT_SHADOWED,
      );

      expect(shadowDiags.length).toBe(1);
      expect(shadowDiags[0].messageText).toContain("Output 'action' shadows");
    });
  });
});
