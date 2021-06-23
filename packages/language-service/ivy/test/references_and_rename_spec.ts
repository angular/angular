/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {assertFileNames, assertTextSpans, createModuleAndProjectWithDeclarations, humanizeDocumentSpanLike, LanguageServiceTestEnv, OpenBuffer} from '../testing';

describe('find references and rename locations', () => {
  let env: LanguageServiceTestEnv;

  beforeEach(() => {
    initMockFileSystem('Native');
  });

  afterEach(() => {
    // Clear env so it's not accidentally carried over to the next test.
    env = undefined!;
  });

  describe('cursor is on binding in component class', () => {
    let appFile: OpenBuffer;

    beforeEach(() => {
      const files = {
        'app.ts': `import {Component} from '@angular/core';

          @Component({templateUrl: './app.html'})
          export class AppCmp {
            myProp!: string;
          }`,
        'app.html': '{{myProp}}'
      };
      env = LanguageServiceTestEnv.setup();
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      appFile = project.openFile('app.ts');
      appFile.moveCursorToText('myP¦rop');
    });

    it('gets component member references from TS file and external template', () => {
      const refs = getReferencesAtPosition(appFile)!;
      expect(refs.length).toBe(2);
      assertFileNames(refs, ['app.html', 'app.ts']);
      assertTextSpans(refs, ['myProp']);
    });

    it('gets rename locations from TS file and external template', () => {
      const renameLocations = getRenameLocationsAtPosition(appFile)!;
      expect(renameLocations.length).toBe(2);
      assertFileNames(renameLocations, ['app.html', 'app.ts']);
      assertTextSpans(renameLocations, ['myProp']);
    });
  });

  describe('when cursor is on binding in an external template', () => {
    let templateFile: OpenBuffer;

    beforeEach(() => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({templateUrl: './app.html'})
          export class AppCmp {
            myProp = '';
          }`,
        'app.html': '{{myProp}}'
      };
      env = LanguageServiceTestEnv.setup();
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      templateFile = project.openFile('app.html');
      templateFile.moveCursorToText('myP¦rop');
    });

    it('gets references', () => {
      const refs = getReferencesAtPosition(templateFile)!;
      expect(refs.length).toBe(2);
      assertFileNames(refs, ['app.html', 'app.ts']);
      assertTextSpans(refs, ['myProp']);
    });

    it('gets rename locations', () => {
      const renameLocations = getRenameLocationsAtPosition(templateFile)!;
      expect(renameLocations.length).toBe(2);
      assertFileNames(renameLocations, ['app.html', 'app.ts']);
      assertTextSpans(renameLocations, ['myProp']);
    });
  });

  describe('when cursor is on function call in external template', () => {
    let appFile: OpenBuffer;

    beforeEach(() => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({template: '<div (click)="setTitle(2)"></div>'})
          export class AppCmp {
            setTitle(s: number) {}
          }`
      };
      env = LanguageServiceTestEnv.setup();
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      appFile = project.openFile('app.ts');
      appFile.moveCursorToText('setTi¦tle(2)');
    });

    it('gets component member reference in ts file', () => {
      const refs = getReferencesAtPosition(appFile)!;
      expect(refs.length).toBe(2);

      assertFileNames(refs, ['app.ts']);
      assertTextSpans(refs, ['setTitle']);
    });

    it('gets rename location in ts file', () => {
      const renameLocations = getRenameLocationsAtPosition(appFile)!;
      expect(renameLocations.length).toBe(2);

      assertFileNames(renameLocations, ['app.ts']);
      assertTextSpans(renameLocations, ['setTitle']);
    });
  });

  describe('when cursor in on argument to a function call in an external template', () => {
    let appFile: OpenBuffer;

    beforeEach(() => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({template: '<div (click)="setTitle(title)"></div>'})
          export class AppCmp {
            title = '';
            setTitle(s: string) {}
          }`
      };
      env = LanguageServiceTestEnv.setup();
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      appFile = project.openFile('app.ts');
      appFile.moveCursorToText('(ti¦tle)');
    });

    it('gets member reference in ts file', () => {
      const refs = getReferencesAtPosition(appFile)!;
      expect(refs.length).toBe(2);

      assertTextSpans(refs, ['title']);
    });

    it('finds rename location in ts file', () => {
      const refs = getRenameLocationsAtPosition(appFile)!;
      expect(refs.length).toBe(2);

      assertTextSpans(refs, ['title']);
    });
  });

  describe('when cursor is on $event in method call arguments', () => {
    let file: OpenBuffer;

    beforeEach(() => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';
          @Component({template: '<div (click)="setTitle($event)"></div>'})
          export class AppCmp {
            setTitle(s: any) {}
          }`
      };
      env = LanguageServiceTestEnv.setup();
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      file = project.openFile('app.ts');
      file.moveCursorToText('($even¦t)');
    });

    it('find references', () => {
      const refs = getReferencesAtPosition(file)!;
      expect(refs.length).toBe(1);

      assertTextSpans(refs, ['$event']);
    });

    it('gets no rename locations', () => {
      const renameLocations = getRenameLocationsAtPosition(file)!;
      expect(renameLocations).toBeUndefined();
    });
  });

  describe('when cursor in on LHS of property write in external template', () => {
    let file: OpenBuffer;

    beforeEach(() => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({templateUrl: './app.html' })
          export class AppCmp {
            title = '';
          }`,
        'app.html': `<div (click)="title = 'newtitle'"></div>`
      };
      env = LanguageServiceTestEnv.setup();
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      file = project.openFile('app.html');
      file.moveCursorToText('ti¦tle = ');
    });

    it('gets member reference in ts file', () => {
      const refs = getReferencesAtPosition(file)!;
      expect(refs.length).toBe(2);

      assertFileNames(refs, ['app.ts', 'app.html']);
      assertTextSpans(refs, ['title']);
    });

    it('gets rename location in ts file', () => {
      const renameLocations = getRenameLocationsAtPosition(file)!;
      expect(renameLocations.length).toBe(2);

      assertFileNames(renameLocations, ['app.ts', 'app.html']);
      assertTextSpans(renameLocations, ['title']);
    });
  });

  describe('when cursor in on RHS of property write in external template', () => {
    let file: OpenBuffer;

    beforeEach(() => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({template: '<div (click)="title = otherTitle"></div>' })
          export class AppCmp {
            title = '';
            otherTitle = '';
          }`
      };

      env = LanguageServiceTestEnv.setup();
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      file = project.openFile('app.ts');
      file.moveCursorToText('= otherT¦itle">');
    });

    it('get reference to member in ts file', () => {
      const refs = getReferencesAtPosition(file)!;
      expect(refs.length).toBe(2);

      assertFileNames(refs, ['app.ts']);
      assertTextSpans(refs, ['otherTitle']);
    });

    it('finds rename location in ts file', () => {
      const renameLocations = getRenameLocationsAtPosition(file)!;
      expect(renameLocations.length).toBe(2);

      assertFileNames(renameLocations, ['app.ts']);
      assertTextSpans(renameLocations, ['otherTitle']);
    });
  });

  describe('when cursor in on a keyed read', () => {
    let file: OpenBuffer;

    beforeEach(() => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({template: '{{hero["name"]}}' })
          export class AppCmp {
            hero: {name: string} = {name: 'Superman'};
          }`
      };
      env = LanguageServiceTestEnv.setup();
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      file = project.openFile('app.ts');
      file.moveCursorToText('{{hero["na¦me"]}}');
    });

    it('gets reference to member type definition and initialization in component class', () => {
      const refs = getReferencesAtPosition(file)!;
      // 3 references: the type definition, the value assignment, and the read in the template
      expect(refs.length).toBe(3);

      assertFileNames(refs, ['app.ts']);
      // TODO(atscott): investigate if we can make the template keyed read be just the 'name' part.
      // The TypeScript implementation specifically adjusts the span to accommodate string literals:
      // https://sourcegraph.com/github.com/microsoft/TypeScript@d5779c75d3dd19565b60b9e2960b8aac36d4d635/-/blob/src/services/findAllReferences.ts#L508-512
      // One possible solution would be to extend `FullTemplateMapping` to include the matched TCB
      // node and then do the same thing that TS does: if the node is a string, adjust the span.
      assertTextSpans(refs, ['name', '"name"']);
    });

    it('gets rename locations in component class', () => {
      const renameLocations = getRenameLocationsAtPosition(file)!;
      expect(renameLocations).toBeUndefined();

      // TODO(atscott): We should handle this case. The fix requires us to fix the result span as
      // described above.
      // 3 references: the type definition, the value assignment, and the read in the template
      // expect(renameLocations.length).toBe(3);
      //
      // assertFileNames(renameLocations, ['app.ts']);
      // assertTextSpans(renameLocations, ['name']);
    });
  });

  describe('when cursor in on RHS of keyed write in a template', () => {
    let file: OpenBuffer;

    beforeEach(() => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({templateUrl: './app.html' })
          export class AppCmp {
            hero: {name: string} = {name: 'Superman'};
            batman = 'batman';
          }`,
        'app.html': `<div (click)="hero['name'] = batman"></div>`
      };
      env = LanguageServiceTestEnv.setup();
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      file = project.openFile('app.html');
      file.moveCursorToText('bat¦man');
    });

    it('get references in ts file', () => {
      const refs = getReferencesAtPosition(file)!;
      expect(refs.length).toBe(2);

      assertFileNames(refs, ['app.ts', 'app.html']);
      assertTextSpans(refs, ['batman']);
    });

    it('finds rename location in ts file', () => {
      const renameLocations = getRenameLocationsAtPosition(file)!;
      expect(renameLocations.length).toBe(2);

      assertFileNames(renameLocations, ['app.ts', 'app.html']);
      assertTextSpans(renameLocations, ['batman']);
    });
  });

  describe('when cursor in on an element reference', () => {
    let file: OpenBuffer;

    beforeEach(() => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({template: '<input #myInput /> {{ myInput.value }}'})
          export class AppCmp {
            title = '';
          }`
      };
      env = LanguageServiceTestEnv.setup();
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      file = project.openFile('app.ts');
      file.moveCursorToText('myInp¦ut.value');
    });

    it('get reference to declaration in template', () => {
      const refs = getReferencesAtPosition(file)!;

      expect(refs.length).toBe(2);
      assertTextSpans(refs, ['myInput']);

      // Get the declaration by finding the reference that appears first in the template
      refs.sort((a, b) => a.textSpan.start - b.textSpan.start);
      expect(refs[0].isDefinition).toBe(true);
    });

    it('finds rename location in template', () => {
      const renameLocations = getRenameLocationsAtPosition(file)!;

      expect(renameLocations.length).toBe(2);
      assertTextSpans(renameLocations, ['myInput']);
    });
  });

  describe('when cursor in on a template reference', () => {
    let file: OpenBuffer;

    beforeEach(() => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({templateUrl: './app.html'})
          export class AppCmp {
            title = '';
          }`,
        'app.html': `
              <ng-template #myTemplate >bla</ng-template>
              <ng-container [ngTemplateOutlet]="myTemplate"></ng-container>`
      };
      env = LanguageServiceTestEnv.setup();
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      file = project.openFile('app.html');
      file.moveCursorToText('#myTem¦plate');
    });

    it('gets reference to declaration', () => {
      const refs = getReferencesAtPosition(file)!;
      expect(refs.length).toBe(2);
      assertTextSpans(refs, ['myTemplate']);
      assertFileNames(refs, ['app.html']);

      // Get the declaration by finding the reference that appears first in the template
      refs.sort((a, b) => a.textSpan.start - b.textSpan.start);
      expect(refs[0].isDefinition).toBe(true);
    });

    it('finds rename location in template', () => {
      const renameLocations = getRenameLocationsAtPosition(file)!;
      expect(renameLocations.length).toBe(2);
      assertTextSpans(renameLocations, ['myTemplate']);
      assertFileNames(renameLocations, ['app.html']);
    });
  });

  describe('template references', () => {
    describe('directives', () => {
      const dirFileContents = `
            import {Directive} from '@angular/core';

            @Directive({selector: '[dir]', exportAs: 'myDir'})
            export class Dir {
              dirValue!: string;
              doSomething() {}
            }`;
      const appFileContents = `
            import {Component} from '@angular/core';

            @Component({templateUrl: './app.html'})
            export class AppCmp {}`;

      describe('when cursor is on usage of template reference', () => {
        let file: OpenBuffer;
        beforeEach(() => {
          const files = {
            'app.ts': appFileContents,
            'dir.ts': dirFileContents,
            'app.html': '<div [dir] #dirRef="myDir"></div> {{ dirRef }}'
          };
          env = LanguageServiceTestEnv.setup();
          const project = createModuleAndProjectWithDeclarations(env, 'test', files);
          file = project.openFile('app.html');
          file.moveCursorToText('#dirR¦ef');
        });

        it('should get references', () => {
          const refs = getReferencesAtPosition(file)!;
          expect(refs.length).toBe(2);
          assertFileNames(refs, ['app.html']);
          assertTextSpans(refs, ['dirRef']);
        });

        it('should find rename locations', () => {
          const renameLocations = getRenameLocationsAtPosition(file)!;
          expect(renameLocations.length).toBe(2);
          assertFileNames(renameLocations, ['app.html']);
          assertTextSpans(renameLocations, ['dirRef']);
        });
      });

      describe('when cursor is on a property read of directive reference', () => {
        let file: OpenBuffer;
        beforeEach(() => {
          const files = {
            'app.ts': appFileContents,
            'dir.ts': dirFileContents,
            'app.html': '<div [dir] #dirRef="myDir"></div> {{ dirRef.dirValue }}'
          };
          env = LanguageServiceTestEnv.setup();
          const project = createModuleAndProjectWithDeclarations(env, 'test', files);
          file = project.openFile('app.html');
          file.moveCursorToText('dirRef.dirV¦alue');
        });

        it('should get references', () => {
          const refs = getReferencesAtPosition(file)!;
          expect(refs.length).toBe(2);
          assertFileNames(refs, ['dir.ts', 'app.html']);
          assertTextSpans(refs, ['dirValue']);
        });

        it('should find rename locations', () => {
          const renameLocations = getRenameLocationsAtPosition(file)!;
          expect(renameLocations.length).toBe(2);
          assertFileNames(renameLocations, ['dir.ts', 'app.html']);
          assertTextSpans(renameLocations, ['dirValue']);
        });
      });

      describe('when cursor is on a safe prop read', () => {
        let file: OpenBuffer;
        beforeEach(() => {
          const files = {
            'app.ts': appFileContents,
            'dir.ts': dirFileContents,
            'app.html': '<div [dir] #dirRef="myDir"></div> {{ dirRef?.dirValue }}'
          };
          env = LanguageServiceTestEnv.setup();
          const project = createModuleAndProjectWithDeclarations(env, 'test', files);
          file = project.openFile('app.html');
          file.moveCursorToText('dirRef?.dirV¦alue');
        });


        it('should get references', () => {
          const refs = getReferencesAtPosition(file)!;
          expect(refs.length).toBe(2);
          assertFileNames(refs, ['dir.ts', 'app.html']);
          assertTextSpans(refs, ['dirValue']);
        });

        it('should find rename locations', () => {
          const renameLocations = getRenameLocationsAtPosition(file)!;
          expect(renameLocations.length).toBe(2);
          assertFileNames(renameLocations, ['dir.ts', 'app.html']);
          assertTextSpans(renameLocations, ['dirValue']);
        });
      });

      describe('when cursor is on safe method call', () => {
        let file: OpenBuffer;
        beforeEach(() => {
          const files = {
            'app.ts': appFileContents,
            'dir.ts': dirFileContents,
            'app.html': '<div [dir] #dirRef="myDir"></div> {{ dirRef?.doSomething() }}'
          };
          env = LanguageServiceTestEnv.setup();
          const project = createModuleAndProjectWithDeclarations(env, 'test', files);
          file = project.openFile('app.html');
          file.moveCursorToText('dirRef?.doSometh¦ing()');
        });


        it('should get references', () => {
          const refs = getReferencesAtPosition(file)!;
          expect(refs.length).toBe(2);
          assertFileNames(refs, ['dir.ts', 'app.html']);
          assertTextSpans(refs, ['doSomething']);
        });

        it('should find rename locations', () => {
          const renameLocations = getRenameLocationsAtPosition(file)!;
          expect(renameLocations.length).toBe(2);
          assertFileNames(renameLocations, ['dir.ts', 'app.html']);
          assertTextSpans(renameLocations, ['doSomething']);
        });
      });
    });
  });

  describe('template variables', () => {
    describe('when cursor is on variable which was initialized implicitly', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const files = {
          'app.ts': `
          import {Component} from '@angular/core';

          @Component({templateUrl: './template.ng.html'})
          export class AppCmp {
            heroes: string[] = [];
          }`,
          'template.ng.html': `
          <div *ngFor="let hero of heroes">
            <span *ngIf="hero">
              {{hero}}
            </span>
          </div>
          `
        };
        env = LanguageServiceTestEnv.setup();
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        file = project.openFile('template.ng.html');
        file.moveCursorToText('{{her¦o}}');
      });

      it('should find references', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toBe(3);
        assertFileNames(refs, ['template.ng.html']);
        assertTextSpans(refs, ['hero']);

        // Get the declaration by finding the reference that appears first in the template
        refs.sort((a, b) => a.textSpan.start - b.textSpan.start);
        expect(refs[0].isDefinition).toBe(true);
      });

      it('should find rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations.length).toBe(3);
        assertFileNames(renameLocations, ['template.ng.html']);
        assertTextSpans(renameLocations, ['hero']);
      });
    });

    describe('when cursor is on renamed variable', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const files = {
          'app.ts': `
          import {Component} from '@angular/core';

          @Component({template: '<div *ngFor="let hero of heroes; let iRef = index">{{iRef}}</div>'})
          export class AppCmp {
            heroes: string[] = [];
          }`
        };

        env = LanguageServiceTestEnv.setup();
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        file = project.openFile('app.ts');
        file.moveCursorToText('{{iR¦ef}}');
      });

      it('should find references', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toBe(2);
        assertFileNames(refs, ['app.ts']);
        assertTextSpans(refs, ['iRef']);

        // Get the declaration by finding the reference that appears first in the template
        refs.sort((a, b) => a.textSpan.start - b.textSpan.start);
        expect(refs[0].isDefinition).toBe(true);
      });

      it('should find rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations.length).toBe(2);
        assertFileNames(renameLocations, ['app.ts']);
        assertTextSpans(renameLocations, ['iRef']);
      });
    });

    describe('when cursor is on initializer of variable', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const files = {
          'example-directive.ts': `
        import {Directive, Input} from '@angular/core';

        export class ExampleContext<T> {
          constructor(readonly $implicit: T, readonly identifier: string) {}
        }

        @Directive({ selector: '[example]' })
        export class ExampleDirective<T> {
          @Input() set example(v: T) { }
          static ngTemplateContextGuard<T>(dir: ExampleDirective<T>, ctx: unknown):
            ctx is ExampleContext<T> {
            return true;
          }
        }`,
          'app.ts': `
        import {Component, NgModule} from '@angular/core';
        import {ExampleDirective} from './example-directive';

        @Component({template: '<div *example="state; let id = identifier">{{id}}</div>'})
        export class AppCmp {
          state = {};
        }

        @NgModule({declarations: [AppCmp, ExampleDirective]})
        export class AppModule {}`
        };

        env = LanguageServiceTestEnv.setup();
        const project = env.addProject('test', files);
        file = project.openFile('app.ts');
        file.moveCursorToText('identif¦ier');
        env.expectNoSourceDiagnostics();
        project.expectNoTemplateDiagnostics('app.ts', 'AppCmp');
      });

      it('should find references', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toBe(2);
        assertFileNames(refs, ['app.ts', 'example-directive.ts']);
        assertTextSpans(refs, ['identifier']);
      });

      it('should find rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations.length).toBe(2);
        assertFileNames(renameLocations, ['app.ts', 'example-directive.ts']);
        assertTextSpans(renameLocations, ['identifier']);
      });
    });

    describe('when cursor is on property read of variable', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({template: '<div *ngFor="let hero of heroes">{{hero.name}}</div>'})
            export class AppCmp {
              heroes: Array<{name: string}> = [];
            }`
        };

        env = LanguageServiceTestEnv.setup();
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        file = project.openFile('app.ts');
        file.moveCursorToText('hero.na¦me');
      });

      it('should find references', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toBe(2);
        assertFileNames(refs, ['app.ts']);
        assertTextSpans(refs, ['name']);
      });

      it('should find rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations.length).toBe(2);
        assertFileNames(renameLocations, ['app.ts']);
        assertTextSpans(renameLocations, ['name']);
      });
    });

    describe('when cursor is on property read of variable', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const files = {
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({template: '<div (click)="setHero({name})"></div>'})
            export class AppCmp {
              name = 'Frodo';

              setHero(hero: {name: string}) {}
            }`
        };

        env = LanguageServiceTestEnv.setup();
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        file = project.openFile('app.ts');
        file.moveCursorToText('{na¦me}');
      });

      it('should find references', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toBe(2);
        assertFileNames(refs, ['app.ts']);
        assertTextSpans(refs, ['name']);
      });

      it('should find rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations.length).toBe(2);
        assertFileNames(renameLocations, ['app.ts']);
        assertTextSpans(renameLocations, ['name']);
      });
    });
  });

  describe('pipes', () => {
    const prefixPipe = `
        import {Pipe, PipeTransform} from '@angular/core';

        @Pipe({ name: 'prefixPipe' })
        export class PrefixPipe implements PipeTransform {
          transform(value: string, prefix: string): string;
          transform(value: number, prefix: number): number;
          transform(value: string|number, prefix: string|number): string|number {
            return '';
          }
        }`;

    for (const checkTypeOfPipes of [true, false]) {
      describe(`when cursor is on pipe name, checkTypeOfPipes: ${checkTypeOfPipes}`, () => {
        let file: OpenBuffer;
        beforeEach(() => {
          const files = {
            'app.ts': `
        import {Component} from '@angular/core';

        @Component({template: '{{birthday | prefixPipe: "MM/dd/yy"}}'})
        export class AppCmp {
          birthday = '';
        }
      `,
            'prefix-pipe.ts': prefixPipe
          };

          env = LanguageServiceTestEnv.setup();
          const project = createModuleAndProjectWithDeclarations(env, 'test', files);
          file = project.openFile('app.ts');
          file.moveCursorToText('prefi¦xPipe:');
        });

        it('should find references', () => {
          const refs = getReferencesAtPosition(file)!;
          expect(refs.length).toBe(5);
          assertFileNames(refs, ['index.d.ts', 'prefix-pipe.ts', 'app.ts']);
          assertTextSpans(refs, ['transform', 'prefixPipe']);
        });

        it('should find rename locations', () => {
          const renameLocations = getRenameLocationsAtPosition(file)!;
          expect(renameLocations.length).toBe(2);
          assertFileNames(renameLocations, ['prefix-pipe.ts', 'app.ts']);
          assertTextSpans(renameLocations, ['prefixPipe']);
        });

        it('should get rename info', () => {
          const result = file.getRenameInfo() as ts.RenameInfoSuccess;
          expect(result.canRename).toEqual(true);
          expect(result.displayName).toEqual('prefixPipe');
        });
      });
    }

    describe('when cursor is on pipe name expression', () => {
      it('finds rename locations and rename info', () => {
        const files = {
          '/app.ts': `
        import {Component} from '@angular/core';

        @Component({template: '{{birthday | prefixPipe: "MM/dd/yy"}}'})
        export class AppCmp {
          birthday = '';
        }
      `,
          'prefix_pipe.ts': prefixPipe
        };
        env = LanguageServiceTestEnv.setup();
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const file = project.openFile('prefix_pipe.ts');
        file.moveCursorToText(`'prefi¦xPipe'`);
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations.length).toBe(2);
        assertFileNames(renameLocations, ['prefix_pipe.ts', 'app.ts']);
        assertTextSpans(renameLocations, ['prefixPipe']);

        const result = file.getRenameInfo() as ts.RenameInfoSuccess;
        expect(result.canRename).toEqual(true);
        expect(result.displayName).toEqual('prefixPipe');
        expect(file.contents.substring(
                   result.triggerSpan.start, result.triggerSpan.start + result.triggerSpan.length))
            .toBe('prefixPipe');
      });

      it('finds rename locations in base class', () => {
        const files = {
          '/base_pipe.ts': `
        import {Pipe, PipeTransform} from '@angular/core';

        @Pipe({ name: 'basePipe' })
        export class BasePipe implements PipeTransform {
          transform(value: string, prefix: string): string;
          transform(value: number, prefix: number): number;
          transform(value: string|number, prefix: string|number): string|number {
            return '';
          }
        }`,
          'prefix_pipe.ts': prefixPipe,
          'app.ts': `
            import {Component} from '@angular/core';

            @Component({template: '{{"a" | prefixPipe: "MM/dd/yy"}}'})
            export class AppCmp { }
          `
        };
        env = LanguageServiceTestEnv.setup();
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        const file = project.openFile('prefix_pipe.ts');
        file.moveCursorToText(`'prefi¦xPipe'`);
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations.length).toBe(2);
        assertFileNames(renameLocations, ['prefix_pipe.ts', 'app.ts']);
        assertTextSpans(renameLocations, ['prefixPipe']);
      });
    });

    describe('when cursor is on pipe argument', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const files = {
          'prefix-pipe.ts': prefixPipe,
          'app.ts': `
        import {Component} from '@angular/core';

        @Component({template: '{{birthday | prefixPipe: prefix}}'})
        export class AppCmp {
          birthday = '';
          prefix = '';
        }
      `
        };

        env = LanguageServiceTestEnv.setup();
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        file = project.openFile('app.ts');
        file.moveCursorToText('prefixPipe: pr¦efix');
      });

      it('should find references', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toBe(2);
        assertFileNames(refs, ['app.ts']);
        assertTextSpans(refs, ['prefix']);
      });

      it('should find rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations.length).toBe(2);
        assertFileNames(renameLocations, ['app.ts']);
        assertTextSpans(renameLocations, ['prefix']);
      });
    });
  });

  describe('inputs', () => {
    const dirFileContents = `
        import {Directive, Input} from '@angular/core';

        @Directive({selector: '[string-model]'})
        export class StringModel {
          @Input() model!: string;
          @Input('alias') aliasedModel!: string;
        }`;
    describe('when cursor is on the input in the template', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const files = {
          'string-model.ts': dirFileContents,
          'app.ts': `
        import {Component} from '@angular/core';

        @Component({template: '<div string-model [model]="title"></div>'})
        export class AppCmp {
          title = 'title';
        }`
        };

        env = LanguageServiceTestEnv.setup();
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        file = project.openFile('app.ts');
        file.moveCursorToText('[mod¦el]');
      });

      it('should find references', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toEqual(2);
        assertFileNames(refs, ['string-model.ts', 'app.ts']);
        assertTextSpans(refs, ['model']);
      });

      it('should find rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations.length).toEqual(2);
        assertFileNames(renameLocations, ['string-model.ts', 'app.ts']);
        assertTextSpans(renameLocations, ['model']);
      });
    });

    describe('when cursor is on an input that maps to multiple directives', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const files = {
          'other-dir.ts': `
        import {Directive, Input} from '@angular/core';

        @Directive({selector: '[string-model]'})
        export class OtherDir {
          @Input('model') otherDirAliasedInput!: any;
        }
        `,
          'string-model.ts': dirFileContents,
          'app.ts': `
        import {Component} from '@angular/core';

        @Component({template: '<div string-model [model]="title"></div>'})
        export class AppCmp {
          title = 'title';
        }`
        };

        env = LanguageServiceTestEnv.setup();
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        file = project.openFile('app.ts');
        file.moveCursorToText('[mod¦el]');
      });

      it('should find references', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toEqual(3);
        assertFileNames(refs, ['string-model.ts', 'app.ts', 'other-dir.ts']);
        assertTextSpans(refs, ['model', 'otherDirAliasedInput']);
      });

      // TODO(atscott): This test fails because template symbol builder only returns one binding.
      // The result is that rather than returning `undefined` because we don't handle alias inputs,
      // we return the rename locations for the first binding.
      it('should find rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations).toBeUndefined();
        // TODO(atscott): The below assertions are the correct ones if we were supporting aliases
        // expect(renameLocations.length).toEqual(3);
        // assertFileNames(renameLocations, ['string-model.ts', 'app.ts', 'other-dir']);
        // assertTextSpans(renameLocations, ['model']);
      });
    });

    describe('should work when cursor is on text attribute input', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const files = {
          'string-model.ts': dirFileContents,
          'app.ts': `
        import {Component} from '@angular/core';

        @Component({template: '<div string-model model="title"></div>'})
        export class AppCmp {
          title = 'title';
        }`
        };

        env = LanguageServiceTestEnv.setup();
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        file = project.openFile('app.ts');
        file.moveCursorToText('mod¦el="title"');
      });

      it('should work for text attributes', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toEqual(2);
        assertFileNames(refs, ['string-model.ts', 'app.ts']);
        assertTextSpans(refs, ['model']);
      });

      it('should find rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations.length).toEqual(2);
        assertFileNames(renameLocations, ['string-model.ts', 'app.ts']);
        assertTextSpans(renameLocations, ['model']);
      });
    });

    describe('when cursor is on the class member input', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const files = {
          'string-model.ts': `
        import {Directive, Input} from '@angular/core';

        @Directive({selector: '[string-model]'})
        export class StringModel {
          @Input() model!: string;
        }`,
          'app.ts': `
        import {Component} from '@angular/core';

        @Component({template: '<div string-model model="title"></div>'})
        export class AppCmp {
          title = 'title';
        }`
        };

        env = LanguageServiceTestEnv.setup();
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        file = project.openFile('string-model.ts');
        file.moveCursorToText('@Input() mod¦el!');
      });

      it('should work from the TS input declaration', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toEqual(2);
        assertFileNames(refs, ['app.ts', 'string-model.ts']);
        assertTextSpans(refs, ['model']);
      });

      it('should find rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations.length).toEqual(2);
        assertFileNames(renameLocations, ['app.ts', 'string-model.ts']);
        assertTextSpans(renameLocations, ['model']);
      });
    });

    describe('when cursor is on input referenced somewhere in the class functions', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const files = {
          'other-dir.ts': `
        import {Directive, Input} from '@angular/core';
        import {StringModel} from './string-model';

        @Directive({selector: '[other-dir]'})
        export class OtherDir {
          @Input() stringModelRef!: StringModel;

          doSomething() {
            console.log(this.stringModelRef.model);
          }
        }`,
          'string-model.ts': `
        import {Directive, Input} from '@angular/core';

        @Directive({selector: '[string-model]'})
        export class StringModel {
          @Input() model!: string;
        }`,
          'app.ts': `
        import {Component} from '@angular/core';

        @Component({template: '<div string-model other-dir model="title"></div>'})
        export class AppCmp {
          title = 'title';
        }`
        };

        env = LanguageServiceTestEnv.setup();
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        file = project.openFile('other-dir.ts');
        file.moveCursorToText('this.stringModelRef.mod¦el');
      });

      it('should find references', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toEqual(3);
        assertFileNames(refs, ['app.ts', 'string-model.ts', 'other-dir.ts']);
        assertTextSpans(refs, ['model']);
      });

      it('should find rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations.length).toEqual(3);
        assertFileNames(renameLocations, ['app.ts', 'string-model.ts', 'other-dir.ts']);
        assertTextSpans(renameLocations, ['model']);
      });
    });

    describe('when cursor is on an aliased input', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const files = {
          'string-model.ts': dirFileContents,
          'app.ts': `
        import {Component} from '@angular/core';

        @Component({template: '<div string-model [alias]="title"></div>'})
        export class AppCmp {
          title = 'title';
        }`
        };

        env = LanguageServiceTestEnv.setup();
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        file = project.openFile('app.ts');
        file.moveCursorToText('[al¦ias]');
      });

      it('should find references', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toEqual(2);
        assertFileNames(refs, ['string-model.ts', 'app.ts']);
        assertTextSpans(refs, ['aliasedModel', 'alias']);
      });

      it('should find rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations).toBeUndefined();
        // TODO(atscott): add support for renaming alias outputs
        // expect(renameLocations.length).toEqual(2);
        // assertFileNames(renameLocations, ['string-model.ts', 'app.ts']);
        // assertTextSpans(renameLocations, ['alias']);
      });
    });
  });

  describe('outputs', () => {
    const dirFile = `
        import {Directive, Output, EventEmitter} from '@angular/core';

        @Directive({selector: '[string-model]'})
        export class StringModel {
          @Output() modelChange = new EventEmitter<string>();
          @Output('alias') aliasedModelChange = new EventEmitter<string>();
        }`;

    function generateAppFile(template: string) {
      return `
        import {Component, NgModule} from '@angular/core';
        import {StringModel} from './string-model';

        @Component({template: '${template}'})
        export class AppCmp {
          setTitle(s: string) {}
        }

        @NgModule({declarations: [AppCmp, StringModel]})
        export class AppModule {}`;
    }

    describe('when cursor is on output key in template', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const appFile =
            generateAppFile(`<div string-model (modelChange)="setTitle($event)"></div>`);

        env = LanguageServiceTestEnv.setup();
        const project = env.addProject('test', {'app.ts': appFile, 'string-model.ts': dirFile});
        file = project.openFile('app.ts');
        file.moveCursorToText('(mod¦elChange)');
      });

      it('should find references', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toEqual(2);
        assertTextSpans(refs, ['modelChange']);
      });

      it('should find rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations.length).toEqual(2);
        assertTextSpans(renameLocations, ['modelChange']);
      });
    });

    describe('when cursor is on alias output key', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const appFile = generateAppFile(`<div string-model (alias)="setTitle($event)"></div>`);

        env = LanguageServiceTestEnv.setup();
        const project = env.addProject('test', {'app.ts': appFile, 'string-model.ts': dirFile});
        file = project.openFile('app.ts');
        file.moveCursorToText('(a¦lias)');
      });

      it('should find references', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toEqual(2);
        assertTextSpans(refs, ['aliasedModelChange', 'alias']);
      });

      it('should find rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations).toBeUndefined();
        // TODO(atscott): add support for renaming alias outputs
        // expect(renameLocations.length).toEqual(2);
        // assertTextSpans(renameLocations, ['alias']);
      });
    });
  });

  it('should get references to both input and output for two-way binding', () => {
    const files = {
      'dir.ts': `
      import {Directive, Input, Output} from '@angular/core';

      @Directive({selector: '[string-model]'})
      export class StringModel {
        @Input() model!: any;
        @Output() modelChange!: any;
      }`,
      'app.ts': `
      import {Component} from '@angular/core';

      @Component({template: '<div string-model [(model)]="title"></div>'})
      export class AppCmp {
        title = 'title';
      }`

    };

    env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const file = project.openFile('app.ts');
    file.moveCursorToText('[(mod¦el)]');

    const refs = getReferencesAtPosition(file)!;
    expect(refs.length).toEqual(3);
    assertFileNames(refs, ['dir.ts', 'app.ts']);
    assertTextSpans(refs, ['model', 'modelChange']);
  });

  describe('directives', () => {
    describe('when cursor is on the directive class', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const files = {
          'dir.ts': `
      import {Directive} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class Dir {}`,
          'app.ts': `
        import {Component, NgModule} from '@angular/core';
        import {Dir} from './dir';

        @Component({template: '<div dir></div>'})
        export class AppCmp {
        }

        @NgModule({declarations: [AppCmp, Dir]})
        export class AppModule {}
      `
        };

        env = LanguageServiceTestEnv.setup();
        const project = env.addProject('test', files);
        file = project.openFile('dir.ts');
        file.moveCursorToText('export class Di¦r {}');
      });

      it('should find references', () => {
        const refs = getReferencesAtPosition(file)!;
        // 4 references are:  class declaration, template usage, app import and use in declarations
        // list.
        expect(refs.length).toBe(4);
        assertTextSpans(refs, ['<div dir>', 'Dir']);
        assertFileNames(refs, ['app.ts', 'dir.ts']);
      });

      it('should find rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations).toBeUndefined();
        // TODO(atscott): We should handle this case, but exclude the template results
        // expect(renameLocations.length).toBe(3);
        // assertTextSpans(renameLocations, ['Dir']);
        // assertFileNames(renameLocations, ['app.ts', 'dir.ts']);
      });
    });

    describe('when cursor is on an attribute', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const dirFile = `
      import {Directive} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class Dir {}`;
        const dirFile2 = `
      import {Directive} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class Dir2 {}`;
        const appFile = `
        import {Component, NgModule} from '@angular/core';
        import {Dir} from './dir';
        import {Dir2} from './dir2';

        @Component({template: '<div dir></div>'})
        export class AppCmp {
        }

        @NgModule({declarations: [AppCmp, Dir, Dir2]})
        export class AppModule {}
      `;
        env = LanguageServiceTestEnv.setup();
        const project =
            env.addProject('test', {'app.ts': appFile, 'dir.ts': dirFile, 'dir2.ts': dirFile2});
        file = project.openFile('app.ts');
        file.moveCursorToText('<div di¦r></div>');
      });

      it('gets references to all matching directives', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toBe(7);
        assertTextSpans(refs, ['<div dir>', 'Dir', 'Dir2']);
        assertFileNames(refs, ['app.ts', 'dir.ts', 'dir2.ts']);
      });

      it('finds rename locations for all matching directives', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations).toBeUndefined();
        // TODO(atscott): We could consider supporting rename for directive selectors in the future
        // expect(renameLocations.length).toBe(3);
        // assertTextSpans(renameLocations, ['dir']);
        // assertFileNames(renameLocations, ['app.ts', 'dir.ts', 'dir2.ts']);
      });
    });

    describe('when cursor is on generic directive selector in template', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const files = {
          'app.ts': `
        import {Component, NgModule} from '@angular/core';

        @Component({template: '<div *ngFor="let item of items"></div>'})
        export class AppCmp {
          items = [];
        }
      `
        };

        env = LanguageServiceTestEnv.setup();
        const project = createModuleAndProjectWithDeclarations(env, 'test', files);
        file = project.openFile('app.ts');
        file.moveCursorToText('*ngF¦or');
      });

      it('should be able to request references', () => {
        const refs = getReferencesAtPosition(file)!;
        expect(refs.length).toBe(6);
        assertTextSpans(refs, ['<div *ngFor="let item of items"></div>', 'NgForOf']);
        assertFileNames(refs, ['index.d.ts', 'app.ts']);
      });

      it('should not support rename if directive is in a dts file', () => {
        const renameLocations = getRenameLocationsAtPosition(file);
        expect(renameLocations).toBeUndefined();
      });
    });
  });

  describe('components', () => {
    describe('when cursor is on component class', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const myComp = `
      import {Component} from '@angular/core';

      @Component({selector: 'my-comp', template: ''})
      export class MyComp {}`;
        const appFile = `
        import {Component, NgModule} from '@angular/core';
        import {MyComp} from './comp';

        @Component({template: '<my-comp></my-comp>'})
        export class AppCmp {
        }

        @NgModule({declarations: [AppCmp, MyComp]})
        export class AppModule {}
      `;
        env = LanguageServiceTestEnv.setup();
        const project = env.addProject('test', {'comp.ts': myComp, 'app.ts': appFile});
        file = project.openFile('comp.ts');
        file.moveCursorToText('MyCo¦mp');
      });

      it('finds references', () => {
        const refs = getReferencesAtPosition(file)!;
        // 4 references are:  class declaration, template usage, app import and use in declarations
        // list.
        expect(refs.length).toBe(4);
        assertTextSpans(refs, ['<my-comp>', 'MyComp']);
        assertFileNames(refs, ['app.ts', 'comp.ts']);
      });

      it('gets rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations).toBeUndefined();
        // TODO(atscott): If we register as an exclusive provider for TS, we may need to return
        // results here and should exclude the template results.
        // expect(renameLocations.length).toBe(3);
        // assertTextSpans(renameLocations, ['MyComp']);
        // assertFileNames(renameLocations, ['app.ts', 'comp.ts']);
      });
    });

    describe('when cursor is on the element tag', () => {
      let file: OpenBuffer;
      beforeEach(() => {
        const compFile = `
      import {Component} from '@angular/core';

      @Component({selector: 'my-comp', template: ''})
      export class MyComp {}`;
        const app = `
        import {Component, NgModule} from '@angular/core';
        import {MyComp} from './comp';

        @Component({template: '<my-comp></my-comp>'})
        export class AppCmp {
        }

        @NgModule({declarations: [AppCmp, MyComp]})
        export class AppModule {}
      `;
        env = LanguageServiceTestEnv.setup();
        const project = env.addProject('test', {'app.ts': app, 'comp.ts': compFile});
        file = project.openFile('app.ts');
        file.moveCursorToText('<my-c¦omp></my-comp>');
      });

      it('gets references', () => {
        const refs = getReferencesAtPosition(file)!;
        // 4 references are:  class declaration, template usage, app import and use in declarations
        // list.
        expect(refs.length).toBe(4);
        assertTextSpans(refs, ['<my-comp>', 'MyComp']);
        assertFileNames(refs, ['app.ts', 'comp.ts']);
      });

      it('finds rename locations', () => {
        const renameLocations = getRenameLocationsAtPosition(file)!;
        expect(renameLocations).toBeUndefined();
        // TODO(atscott): We may consider supporting rename of component selector in the future
        // expect(renameLocations.length).toBe(2);
        // assertTextSpans(renameLocations, ['my-comp']);
        // assertFileNames(renameLocations, ['app.ts', 'comp.ts']);
      });
    });
  });

  describe('get rename info', () => {
    it('indicates inability to rename when cursor is outside template and in a string literal',
       () => {
         const comp = `
            import {Component} from '@angular/core';

            @Component({selector: 'my-comp', template: ''})
            export class MyComp {
              myProp = 'cannot rename me';
            }`;
         env = LanguageServiceTestEnv.setup();
         const project = createModuleAndProjectWithDeclarations(env, 'test', {'my-comp.ts': comp});
         env.expectNoSourceDiagnostics();

         const file = project.openFile('my-comp.ts');
         file.moveCursorToText('cannot rena¦me me');
         const result = file.getRenameInfo();
         expect(result.canRename).toEqual(false);
       });

    it('gets rename info when cursor is outside template', () => {
      const comp = `
            import {Component, Input} from '@angular/core';

            @Component({name: 'my-comp', template: ''})
            export class MyComp {
              @Input() myProp!: string;
            }`;
      env = LanguageServiceTestEnv.setup();
      const project = createModuleAndProjectWithDeclarations(env, 'test', {'my-comp.ts': comp});
      env.expectNoSourceDiagnostics();

      const file = project.openFile('my-comp.ts');
      file.moveCursorToText('m¦yProp!');
      const result = file.getRenameInfo() as ts.RenameInfoSuccess;
      expect(result.canRename).toEqual(true);
      expect(result.displayName).toEqual('myProp');
      expect(result.kind).toEqual('property');
    });

    it('gets rename info on keyed read', () => {
      const text = `
            import {Component} from '@angular/core';

            @Component({name: 'my-comp', template: '{{ myObj["myProp"] }}'})
            export class MyComp {
              readonly myObj = {'myProp': 'hello world'};
            }`;
      env = LanguageServiceTestEnv.setup();
      const project = createModuleAndProjectWithDeclarations(env, 'test', {'my-comp.ts': text});
      env.expectNoSourceDiagnostics();
      const file = project.openFile('my-comp.ts');
      file.moveCursorToText('myObj["my¦Prop"]');

      const result = file.getRenameInfo() as ts.RenameInfoSuccess;
      expect(result.canRename).toEqual(true);
      expect(result.displayName).toEqual('myProp');
      expect(result.kind).toEqual('property');
      expect(text.substring(
                 result.triggerSpan.start, result.triggerSpan.start + result.triggerSpan.length))
          .toBe('myProp');
      // re-queries also work
      const {triggerSpan, displayName} = file.getRenameInfo() as ts.RenameInfoSuccess;
      expect(displayName).toEqual('myProp');
      expect(text.substring(triggerSpan.start, triggerSpan.start + triggerSpan.length))
          .toBe('myProp');
    });

    it('gets rename info when cursor is on a directive input in a template', () => {
      const files = {
        'dir.ts': `
        import {Directive, Input} from '@angular/core';
        @Directive({selector: '[dir]'})
        export class MyDir {
          @Input() dir!: any;
        }`,
        'my-comp.ts': `
            import {Component, Input} from '@angular/core';

            @Component({name: 'my-comp', template: '<div dir="something"></div>'})
            export class MyComp {
              @Input() myProp!: string;
            }`
      };

      env = LanguageServiceTestEnv.setup();
      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      env.expectNoSourceDiagnostics();

      const file = project.openFile('my-comp.ts');
      file.moveCursorToText('di¦r="something"');
      const result = file.getRenameInfo() as ts.RenameInfoSuccess;
      expect(result.canRename).toEqual(true);
      expect(result.displayName).toEqual('dir');
      expect(result.kind).toEqual('property');
    });
  });

  function getReferencesAtPosition(file: OpenBuffer) {
    env.expectNoSourceDiagnostics();
    const result = file.getReferencesAtPosition();
    return result?.map((item) => humanizeDocumentSpanLike(item, env));
  }

  function getRenameLocationsAtPosition(file: OpenBuffer) {
    env.expectNoSourceDiagnostics();
    const result = file.fineRenameLocations();
    return result?.map((item) => humanizeDocumentSpanLike(item, env));
  }
});
