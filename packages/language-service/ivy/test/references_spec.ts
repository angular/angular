/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom, absoluteFrom as _} from '@angular/compiler-cli/src/ngtsc/file_system';
import {initMockFileSystem, TestFile} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import * as ts from 'typescript/lib/tsserverlibrary';

import {extractCursorInfo, LanguageServiceTestEnvironment} from './env';
import {createModuleWithDeclarations, getText} from './test_utils';

describe('find references', () => {
  let env: LanguageServiceTestEnvironment;

  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('gets component member references from TS file', () => {
    const {text, cursor} = extractCursorInfo(`
          import {Component} from '@angular/core';

          @Component({templateUrl: './app.html'})
          export class AppCmp {
            myP¦rop!: string;
          }`);
    const appFile = {name: _('/app.ts'), contents: text};
    const templateFile = {name: _('/app.html'), contents: '{{myProp}}'};
    env = createModuleWithDeclarations([appFile], [templateFile]);
    const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
    expect(refs.length).toBe(2);
    assertFileNames(refs, ['app.html', 'app.ts']);
    assertTextSpans(refs, ['myProp']);
  });

  it('gets component member references from TS file and inline template', () => {
    const {text, cursor} = extractCursorInfo(`
          import {Component} from '@angular/core';

          @Component({template: '{{myProp}}'})
          export class AppCmp {
            myP¦rop!: string;
          }`);
    const appFile = {name: _('/app.ts'), contents: text};
    env = createModuleWithDeclarations([appFile]);
    const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
    expect(refs.length).toBe(2);
    assertFileNames(refs, ['app.ts']);
    assertTextSpans(refs, ['myProp']);
  });

  it('gets component member references from template', () => {
    const appFile = {
      name: _('/app.ts'),
      contents: `
          import {Component} from '@angular/core';

          @Component({templateUrl: './app.html'})
          export class AppCmp {
            myProp = '';
          }`,
    };
    const {text, cursor} = extractCursorInfo('{{myP¦rop}}');
    const templateFile = {name: _('/app.html'), contents: text};
    env = createModuleWithDeclarations([appFile], [templateFile]);
    const refs = getReferencesAtPosition(_('/app.html'), cursor)!;
    expect(refs.length).toBe(2);
    assertFileNames(refs, ['app.html', 'app.ts']);
    assertTextSpans(refs, ['myProp']);
  });

  it('should work for method calls', () => {
    const {text, cursor} = extractCursorInfo(`
          import {Component} from '@angular/core';

          @Component({template: '<div (click)="set¦Title(2)"></div>'})
          export class AppCmp {
            setTitle(s: number) {}
          }`);
    const appFile = {name: _('/app.ts'), contents: text};
    env = createModuleWithDeclarations([appFile]);
    const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
    expect(refs.length).toBe(2);

    assertFileNames(refs, ['app.ts']);
    assertTextSpans(refs, ['setTitle']);
  });

  it('should work for method call arguments', () => {
    const {text, cursor} = extractCursorInfo(`
          import {Component} from '@angular/core';

          @Component({template: '<div (click)="setTitle(ti¦tle)"></div>'})
          export class AppCmp {
            title = '';
            setTitle(s: string) {}
          }`);
    const appFile = {name: _('/app.ts'), contents: text};
    env = createModuleWithDeclarations([appFile]);
    const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
    expect(refs.length).toBe(2);

    assertTextSpans(refs, ['title']);
  });

  it('should work for property writes', () => {
    const appFile = {
      name: _('/app.ts'),
      contents: `
          import {Component} from '@angular/core';

          @Component({templateUrl: './app.html' })
          export class AppCmp {
            title = '';
          }`,
    };
    const templateFileWithCursor = `<div (click)="ti¦tle = 'newtitle'"></div>`;
    const {text, cursor} = extractCursorInfo(templateFileWithCursor);
    const templateFile = {name: _('/app.html'), contents: text};
    env = createModuleWithDeclarations([appFile], [templateFile]);
    const refs = getReferencesAtPosition(_('/app.html'), cursor)!;
    expect(refs.length).toBe(2);

    assertFileNames(refs, ['app.ts', 'app.html']);
    assertTextSpans(refs, ['title']);
  });

  it('should work for RHS of property writes', () => {
    const {text, cursor} = extractCursorInfo(`
          import {Component} from '@angular/core';

          @Component({template: '<div (click)="title = otherT¦itle"></div>' })
          export class AppCmp {
            title = '';
            otherTitle = '';
          }`);
    const appFile = {
      name: _('/app.ts'),
      contents: text,
    };
    env = createModuleWithDeclarations([appFile]);
    const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
    expect(refs.length).toBe(2);

    assertFileNames(refs, ['app.ts']);
    assertTextSpans(refs, ['otherTitle']);
  });

  it('should work for keyed reads', () => {
    const {text, cursor} = extractCursorInfo(`
          import {Component} from '@angular/core';

          @Component({template: '{{hero["na¦me"]}}' })
          export class AppCmp {
            hero: {name: string} = {name: 'Superman'};
          }`);
    const appFile = {
      name: _('/app.ts'),
      contents: text,
    };
    env = createModuleWithDeclarations([appFile]);
    const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
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

  it('should work for keyed writes', () => {
    const appFile = {
      name: _('/app.ts'),
      contents: `
          import {Component} from '@angular/core';

          @Component({templateUrl: './app.html' })
          export class AppCmp {
            hero: {name: string} = {name: 'Superman'};
            batman = 'batman';
          }`,
    };
    const templateFileWithCursor = `<div (click)="hero['name'] = bat¦man"></div>`;
    const {text, cursor} = extractCursorInfo(templateFileWithCursor);
    const templateFile = {name: _('/app.html'), contents: text};
    env = createModuleWithDeclarations([appFile], [templateFile]);
    const refs = getReferencesAtPosition(_('/app.html'), cursor)!;
    expect(refs.length).toBe(2);

    assertFileNames(refs, ['app.ts', 'app.html']);
    assertTextSpans(refs, ['batman']);
  });

  describe('references', () => {
    it('should work for element references', () => {
      const {text, cursor} = extractCursorInfo(`
          import {Component} from '@angular/core';

          @Component({template: '<input #myInput /> {{ myIn¦put.value }}'})
          export class AppCmp {
            title = '';
          }`);
      const appFile = {name: _('/app.ts'), contents: text};
      env = createModuleWithDeclarations([appFile]);
      const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
      expect(refs.length).toBe(2);
      assertTextSpans(refs, ['myInput']);

      const originalRefs = env.ngLS.getReferencesAtPosition(_('/app.ts'), cursor)!;
      // Get the declaration by finding the reference that appears first in the template
      originalRefs.sort((a, b) => a.textSpan.start - b.textSpan.start);
      expect(originalRefs[0].isDefinition).toBe(true);
    });

    it('should work for template references', () => {
      const templateWithCursor = `
              <ng-template #myTemplate >bla</ng-template>
              <ng-container [ngTemplateOutlet]="myTem¦plate"></ng-container>`;
      const appFile = {
        name: _('/app.ts'),
        contents: `
          import {Component} from '@angular/core';

          @Component({templateUrl: './app.html'})
          export class AppCmp {
            title = '';
          }`,
      };
      const {text, cursor} = extractCursorInfo(templateWithCursor);
      const templateFile = {name: _('/app.html'), contents: text};
      env = createModuleWithDeclarations([appFile], [templateFile]);
      const refs = getReferencesAtPosition(_('/app.html'), cursor)!;
      expect(refs.length).toBe(2);
      assertTextSpans(refs, ['myTemplate']);
      assertFileNames(refs, ['app.html']);

      const originalRefs = env.ngLS.getReferencesAtPosition(_('/app.html'), cursor)!;
      // Get the declaration by finding the reference that appears first in the template
      originalRefs.sort((a, b) => a.textSpan.start - b.textSpan.start);
      expect(originalRefs[0].isDefinition).toBe(true);
    });

    describe('directive references', () => {
      let appFile: TestFile;
      let dirFile: TestFile;

      beforeEach(() => {
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
        appFile = {name: _('/app.ts'), contents: appFileContents};
        dirFile = {name: _('/dir.ts'), contents: dirFileContents};
      });

      it('should work for usage of reference in template', () => {
        const templateWithCursor = '<div [dir] #dirRef="myDir"></div> {{ dirR¦ef }}';
        const {text, cursor} = extractCursorInfo(templateWithCursor);
        const templateFile = {name: _('/app.html'), contents: text};
        env = createModuleWithDeclarations([appFile, dirFile], [templateFile]);
        const refs = getReferencesAtPosition(_('/app.html'), cursor)!;
        expect(refs.length).toBe(2);
        assertFileNames(refs, ['app.html']);
        assertTextSpans(refs, ['dirRef']);
      });

      it('should work for prop reads of directive references', () => {
        const fileWithCursor = '<div [dir] #dirRef="myDir"></div> {{ dirRef.dirV¦alue }}';
        const {text, cursor} = extractCursorInfo(fileWithCursor);
        const templateFile = {name: _('/app.html'), contents: text};
        env = createModuleWithDeclarations([appFile, dirFile], [templateFile]);
        const refs = getReferencesAtPosition(_('/app.html'), cursor)!;
        expect(refs.length).toBe(2);
        assertFileNames(refs, ['dir.ts', 'app.html']);
        assertTextSpans(refs, ['dirValue']);
      });

      it('should work for safe prop reads', () => {
        const fileWithCursor = '<div [dir] #dirRef="myDir"></div> {{ dirRef?.dirV¦alue }}';
        const {text, cursor} = extractCursorInfo(fileWithCursor);
        const templateFile = {name: _('/app.html'), contents: text};
        env = createModuleWithDeclarations([appFile, dirFile], [templateFile]);
        const refs = getReferencesAtPosition(_('/app.html'), cursor)!;
        expect(refs.length).toBe(2);
        assertFileNames(refs, ['dir.ts', 'app.html']);
        assertTextSpans(refs, ['dirValue']);
      });

      it('should work for safe method calls', () => {
        const fileWithCursor = '<div [dir] #dirRef="myDir"></div> {{ dirRef?.doSometh¦ing() }}';
        const {text, cursor} = extractCursorInfo(fileWithCursor);
        const templateFile = {name: _('/app.html'), contents: text};
        env = createModuleWithDeclarations([appFile, dirFile], [templateFile]);
        const refs = getReferencesAtPosition(_('/app.html'), cursor)!;
        expect(refs.length).toBe(2);
        assertFileNames(refs, ['dir.ts', 'app.html']);
        assertTextSpans(refs, ['doSomething']);
      });
    });
  });

  describe('variables', () => {
    it('should work for variable initialized implicitly', () => {
      const {text, cursor} = extractCursorInfo(`
          import {Component} from '@angular/core';

          @Component({template: '<div *ngFor="let hero of heroes">{{her¦o}}</div>'})
          export class AppCmp {
            heroes: string[] = [];
          }`);
      const appFile = {name: _('/app.ts'), contents: text};
      env = createModuleWithDeclarations([appFile]);
      const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
      expect(refs.length).toBe(2);
      assertFileNames(refs, ['app.ts']);
      assertTextSpans(refs, ['hero']);

      const originalRefs = env.ngLS.getReferencesAtPosition(_('/app.ts'), cursor)!;
      // Get the declaration by finding the reference that appears first in the template
      originalRefs.sort((a, b) => a.textSpan.start - b.textSpan.start);
      expect(originalRefs[0].isDefinition).toBe(true);
    });

    it('should work for renamed variables', () => {
      const {text, cursor} = extractCursorInfo(`
          import {Component} from '@angular/core';

          @Component({template: '<div *ngFor="let hero of heroes; let iRef = index">{{iR¦ef}}</div>'})
          export class AppCmp {
            heroes: string[] = [];
          }`);
      const appFile = {name: _('/app.ts'), contents: text};
      env = createModuleWithDeclarations([appFile]);
      const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
      expect(refs.length).toBe(2);
      assertFileNames(refs, ['app.ts']);
      assertTextSpans(refs, ['iRef']);

      const originalRefs = env.ngLS.getReferencesAtPosition(_('/app.ts'), cursor)!;
      // Get the declaration by finding the reference that appears first in the template
      originalRefs.sort((a, b) => a.textSpan.start - b.textSpan.start);
      expect(originalRefs[0].isDefinition).toBe(true);
    });

    it('should work for initializer of variable', () => {
      const dirFile = `
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
        }`;
      const fileWithCursor = `
        import {Component, NgModule} from '@angular/core';
        import {ExampleDirective} from './example-directive';

        @Component({template: '<div *example="state; let id = identif¦ier">{{id}}</div>'})
        export class AppCmp {
          state = {};
        }

        @NgModule({declarations: [AppCmp, ExampleDirective]})
        export class AppModule {}`;
      const {text, cursor} = extractCursorInfo(fileWithCursor);
      env = LanguageServiceTestEnvironment.setup([
        {name: _('/app.ts'), contents: text, isRoot: true},
        {name: _('/example-directive.ts'), contents: dirFile},
      ]);
      env.expectNoSourceDiagnostics();
      env.expectNoTemplateDiagnostics(absoluteFrom('/app.ts'), 'AppCmp');
      const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
      expect(refs.length).toBe(2);
      assertFileNames(refs, ['app.ts', 'example-directive.ts']);
      assertTextSpans(refs, ['identifier']);
    });

    it('should work for prop reads of variables', () => {
      const {text, cursor} = extractCursorInfo(`
            import {Component} from '@angular/core';

            @Component({template: '<div *ngFor="let hero of heroes">{{hero.na¦me}}</div>'})
            export class AppCmp {
              heroes: Array<{name: string}> = [];
            }`);
      const appFile = {name: _('/app.ts'), contents: text};
      env = createModuleWithDeclarations([appFile]);
      const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
      expect(refs.length).toBe(2);
      assertFileNames(refs, ['app.ts']);
      assertTextSpans(refs, ['name']);
    });
  });

  describe('pipes', () => {
    let prefixPipeFile: TestFile;
    beforeEach(() => {
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
      prefixPipeFile = {name: _('/prefix-pipe.ts'), contents: prefixPipe};
    });

    it('should work for pipe names', () => {
      const appContentsWithCursor = `
        import {Component} from '@angular/core';

        @Component({template: '{{birthday | prefi¦xPipe: "MM/dd/yy"}}'})
        export class AppCmp {
          birthday = '';
        }
      `;
      const {text, cursor} = extractCursorInfo(appContentsWithCursor);
      const appFile = {name: _('/app.ts'), contents: text};
      env = createModuleWithDeclarations([appFile, prefixPipeFile]);
      const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
      expect(refs.length).toBe(5);
      assertFileNames(refs, ['index.d.ts', 'prefix-pipe.ts', 'app.ts']);
      assertTextSpans(refs, ['transform', 'prefixPipe']);
    });

    it('should work for pipe arguments', () => {
      const appContentsWithCursor = `
        import {Component} from '@angular/core';

        @Component({template: '{{birthday | prefixPipe: pr¦efix}}'})
        export class AppCmp {
          birthday = '';
          prefix = '';
        }
      `;
      const {text, cursor} = extractCursorInfo(appContentsWithCursor);
      const appFile = {name: _('/app.ts'), contents: text};
      env = createModuleWithDeclarations([appFile, prefixPipeFile]);
      const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
      expect(refs.length).toBe(2);
      assertFileNames(refs, ['app.ts']);
      assertTextSpans(refs, ['prefix']);
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
    it('should work from the template', () => {
      const stringModelTestFile = {name: _('/string-model.ts'), contents: dirFileContents};
      const {text, cursor} = extractCursorInfo(`
        import {Component} from '@angular/core';

        @Component({template: '<div string-model [mod¦el]="title"></div>'})
        export class AppCmp {
          title = 'title';
        }`);
      const appFile = {name: _('/app.ts'), contents: text};
      env = createModuleWithDeclarations([appFile, stringModelTestFile]);
      const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
      expect(refs.length).toEqual(2);
      assertFileNames(refs, ['string-model.ts', 'app.ts']);
      assertTextSpans(refs, ['model']);
    });

    it('should work for text attributes', () => {
      const stringModelTestFile = {name: _('/string-model.ts'), contents: dirFileContents};
      const {text, cursor} = extractCursorInfo(`
        import {Component} from '@angular/core';

        @Component({template: '<div string-model mod¦el="title"></div>'})
        export class AppCmp {
          title = 'title';
        }`);
      const appFile = {name: _('/app.ts'), contents: text};
      env = createModuleWithDeclarations([appFile, stringModelTestFile]);
      const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
      expect(refs.length).toEqual(2);
      assertFileNames(refs, ['string-model.ts', 'app.ts']);
      assertTextSpans(refs, ['model']);
    });

    it('should work from the TS input declaration', () => {
      const dirFileWithCursor = `
        import {Directive, Input} from '@angular/core';

        @Directive({selector: '[string-model]'})
        export class StringModel {
          @Input() mod¦el!: string;
        }`;
      const {text, cursor} = extractCursorInfo(dirFileWithCursor);
      const stringModelTestFile = {name: _('/string-model.ts'), contents: text};
      const appFile = {
        name: _('/app.ts'),
        contents: `
        import {Component} from '@angular/core';

        @Component({template: '<div string-model model="title"></div>'})
        export class AppCmp {
          title = 'title';
        }`,
      };
      env = createModuleWithDeclarations([appFile, stringModelTestFile]);
      const refs = getReferencesAtPosition(_('/string-model.ts'), cursor)!;
      expect(refs.length).toEqual(2);
      assertFileNames(refs, ['app.ts', 'string-model.ts']);
      assertTextSpans(refs, ['model']);
    });

    it('should work for inputs referenced from some other place', () => {
      const otherDirContents = `
        import {Directive, Input} from '@angular/core';
        import {StringModel} from './string-model';

        @Directive({selector: '[other-dir]'})
        export class OtherDir {
          @Input() stringModelRef!: StringModel;

          doSomething() {
            console.log(this.stringModelRef.mod¦el);
          }
        }`;
      const {text, cursor} = extractCursorInfo(otherDirContents);
      const otherDirFile = {name: _('/other-dir.ts'), contents: text};
      const stringModelTestFile = {
        name: _('/string-model.ts'),
        contents: `
        import {Directive, Input} from '@angular/core';

        @Directive({selector: '[string-model]'})
        export class StringModel {
          @Input() model!: string;
        }`,
      };
      const appFile = {
        name: _('/app.ts'),
        contents: `
        import {Component} from '@angular/core';

        @Component({template: '<div string-model other-dir model="title"></div>'})
        export class AppCmp {
          title = 'title';
        }`,
      };
      env = createModuleWithDeclarations([appFile, stringModelTestFile, otherDirFile]);
      const refs = getReferencesAtPosition(_('/other-dir.ts'), cursor)!;
      expect(refs.length).toEqual(3);
      assertFileNames(refs, ['app.ts', 'string-model.ts', 'other-dir.ts']);
      assertTextSpans(refs, ['model']);
    });

    it('should work with aliases', () => {
      const stringModelTestFile = {name: _('/string-model.ts'), contents: dirFileContents};
      const {text, cursor} = extractCursorInfo(`
        import {Component} from '@angular/core';

        @Component({template: '<div string-model [al¦ias]="title"></div>'})
        export class AppCmp {
          title = 'title';
        }`);
      const appFile = {name: _('/app.ts'), contents: text};
      env = createModuleWithDeclarations([appFile, stringModelTestFile]);
      const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
      expect(refs.length).toEqual(2);
      assertFileNames(refs, ['string-model.ts', 'app.ts']);
      assertTextSpans(refs, ['aliasedModel', 'alias']);
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

    it('should work', () => {
      const {text, cursor} = extractCursorInfo(
          generateAppFile(`<div string-model (mod¦elChange)="setTitle($event)"></div>`));
      env = LanguageServiceTestEnvironment.setup([
        {name: _('/app.ts'), contents: text, isRoot: true},
        {name: _('/string-model.ts'), contents: dirFile},
      ]);
      const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
      expect(refs.length).toEqual(2);
      assertTextSpans(refs, ['modelChange']);
    });

    it('should work with aliases', () => {
      const {text, cursor} = extractCursorInfo(
          generateAppFile(`<div string-model (a¦lias)="setTitle($event)"></div>`));
      env = LanguageServiceTestEnvironment.setup([
        {name: _('/app.ts'), contents: text, isRoot: true},
        {name: _('/string-model.ts'), contents: dirFile},
      ]);
      const refs = getReferencesAtPosition(_('/app.ts'), cursor)!;
      expect(refs.length).toEqual(2);
      assertTextSpans(refs, ['aliasedModelChange', 'alias']);
    });
  });

  describe('directives', () => {
    it('works for directive classes', () => {
      const {text, cursor} = extractCursorInfo(`
      import {Directive} from '@angular/core';

      @Directive({selector: '[dir]'})
      export class Di¦r {}`);
      const appFile = `
        import {Component, NgModule} from '@angular/core';
        import {Dir} from './dir';

        @Component({template: '<div dir></div>'})
        export class AppCmp {
        }

        @NgModule({declarations: [AppCmp, Dir]})
        export class AppModule {}
      `;
      env = LanguageServiceTestEnvironment.setup([
        {name: _('/app.ts'), contents: appFile, isRoot: true},
        {name: _('/dir.ts'), contents: text},
      ]);
      const refs = getReferencesAtPosition(_('/dir.ts'), cursor)!;
      // 4 references are:  class declaration, template usage, app import and use in declarations
      // list.
      expect(refs.length).toBe(4);
      assertTextSpans(refs, ['<div dir>', 'Dir']);
      assertFileNames(refs, ['app.ts', 'dir.ts']);
    });
  });

  function getReferencesAtPosition(fileName: string, position: number) {
    env.expectNoSourceDiagnostics();
    const result = env.ngLS.getReferencesAtPosition(fileName, position);
    return result?.map(humanizeReferenceEntry);
  }

  function humanizeReferenceEntry(entry: ts.ReferenceEntry): Stringy<ts.DocumentSpan>&
      Pick<ts.ReferenceEntry, 'isWriteAccess'|'isDefinition'|'isInString'> {
    const fileContents = env.host.readFile(entry.fileName);
    if (!fileContents) {
      throw new Error('Could not read file ${entry.fileName}');
    }
    return {
      ...entry,
      textSpan: getText(fileContents, entry.textSpan),
      contextSpan: entry.contextSpan ? getText(fileContents, entry.contextSpan) : undefined,
      originalTextSpan: entry.originalTextSpan ? getText(fileContents, entry.originalTextSpan) :
                                                 undefined,
      originalContextSpan:
          entry.originalContextSpan ? getText(fileContents, entry.originalContextSpan) : undefined,
    };
  }
});

function assertFileNames(refs: Array<{fileName: string}>, expectedFileNames: string[]) {
  const actualPaths = refs.map(r => r.fileName);
  const actualFileNames = actualPaths.map(p => last(p.split('/')));
  expect(new Set(actualFileNames)).toEqual(new Set(expectedFileNames));
}

function assertTextSpans(refs: Array<{textSpan: string}>, expectedTextSpans: string[]) {
  const actualSpans = refs.map(ref => ref.textSpan);
  expect(new Set(actualSpans)).toEqual(new Set(expectedTextSpans));
}

function last<T>(array: T[]): T {
  return array[array.length - 1];
}

type Stringy<T> = {
  [P in keyof T]: string;
};
