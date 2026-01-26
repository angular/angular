/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {LanguageServiceTestEnv} from '../testing';
import {createModuleAndProjectWithDeclarations} from '../testing/src/util';

describe('linked editing ranges', () => {
  let env: LanguageServiceTestEnv;

  beforeEach(() => {
    initMockFileSystem('Native');
    env = LanguageServiceTestEnv.setup();
  });

  describe('external templates', () => {
    it('should return linked ranges for element tag in external template', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            templateUrl: './app.html',
          })
          export class AppComponent {}
        `,
        'app.html': '<div>content</div>',
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      // Position on the opening "div" tag
      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.html', 2);

      expect(linkedRanges).not.toBeNull();
      expect(linkedRanges!.ranges.length).toBe(2);
      // Opening tag span: <div> - "div" starts at position 1
      expect(linkedRanges!.ranges[0].start).toBe(1);
      expect(linkedRanges!.ranges[0].length).toBe(3);
      // Closing tag span: </div> - "div" starts at position 14 (<div>content</div> = pos 14 for closing div)
      expect(linkedRanges!.ranges[1].start).toBe(14);
      expect(linkedRanges!.ranges[1].length).toBe(3);
    });

    it('should return linked ranges when on closing tag', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            templateUrl: './app.html',
          })
          export class AppComponent {}
        `,
        'app.html': '<span>text</span>',
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      // Position on the closing "span" tag (</span> starts at position 10, "span" at 13)
      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.html', 13);

      expect(linkedRanges).not.toBeNull();
      expect(linkedRanges!.ranges.length).toBe(2);
    });

    it('should return null for void elements', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            templateUrl: './app.html',
          })
          export class AppComponent {}
        `,
        'app.html': '<br>',
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      // Position on "br"
      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.html', 2);

      // Void elements have no closing tag, so no linked ranges
      expect(linkedRanges).toBeNull();
    });

    it('should return null when not on a tag name', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            templateUrl: './app.html',
          })
          export class AppComponent {}
        `,
        'app.html': '<div class="test">content</div>',
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      // Position on "class" attribute
      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.html', 8);

      expect(linkedRanges).toBeNull();
    });
  });

  describe('inline templates', () => {
    it('should return linked ranges for element tag in inline template', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<div>content</div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Find position of opening "div" in the inline template
      const templateStart = appFile.contents.indexOf("template: '") + "template: '".length;
      const divPosition = templateStart + 1; // Skip '<'

      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.ts', divPosition);

      expect(linkedRanges).not.toBeNull();
      expect(linkedRanges!.ranges.length).toBe(2);
      expect(linkedRanges!.wordPattern).toBe('[-\\w]+');
    });

    it('should return linked ranges when on closing tag in inline template', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<span>text</span>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Find position of closing "span" in the inline template
      // '</span>' - we want to be on the 's' of span
      const closingSpanIndex = appFile.contents.indexOf('</span>') + 2;

      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.ts', closingSpanIndex);

      expect(linkedRanges).not.toBeNull();
      expect(linkedRanges!.ranges.length).toBe(2);
    });

    it('should return linked ranges for nested elements in inline template', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<div><span>nested</span></div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Find position of "span" opening tag
      const templateStart = appFile.contents.indexOf("template: '") + "template: '".length;
      const spanPosition = templateStart + '<div><'.length;

      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.ts', spanPosition);

      expect(linkedRanges).not.toBeNull();
      expect(linkedRanges!.ranges.length).toBe(2);
    });

    it('should return linked ranges for template literals', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: \`
              <section>
                <article>content</article>
              </section>
            \`,
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Find position of "section" opening tag
      const sectionStart = appFile.contents.indexOf('<section>') + 1;

      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.ts', sectionStart);

      expect(linkedRanges).not.toBeNull();
      expect(linkedRanges!.ranges.length).toBe(2);
    });

    it('should return null for void elements in inline template', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<img src="test.png">',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Find position of "img"
      const imgStart = appFile.contents.indexOf('<img') + 1;

      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.ts', imgStart);

      // Void elements have no closing tag, so no linked ranges
      expect(linkedRanges).toBeNull();
    });

    it('should handle inline templates with @if control flow', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: \`
              @if (show) {
                <button>Click me</button>
              }
            \`,
          })
          export class AppComponent {
            show = true;
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Find position of "button" opening tag
      const buttonStart = appFile.contents.indexOf('<button>') + 1;

      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.ts', buttonStart);

      expect(linkedRanges).not.toBeNull();
      expect(linkedRanges!.ranges.length).toBe(2);
    });

    it('should return null when position is on attribute name', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<div class="test">content</div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Find position of "class" attribute
      const classStart = appFile.contents.indexOf('class=');

      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.ts', classStart);

      expect(linkedRanges).toBeNull();
    });

    it('should return null when position is on content text', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<div>some content here</div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Find position in the middle of the text content
      const contentStart = appFile.contents.indexOf('some content');

      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.ts', contentStart);

      expect(linkedRanges).toBeNull();
    });

    it('should handle hyphenated tag names', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<my-custom-element>content</my-custom-element>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Find position on the opening tag name
      const tagStart = appFile.contents.indexOf('<my-custom-element>') + 1;

      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.ts', tagStart);

      expect(linkedRanges).not.toBeNull();
      expect(linkedRanges!.ranges.length).toBe(2);
      // Verify the tag name length includes hyphens
      expect(linkedRanges!.ranges[0].length).toBe('my-custom-element'.length);
      expect(linkedRanges!.ranges[1].length).toBe('my-custom-element'.length);
    });

    it('should handle @for control flow blocks', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: \`
              @for (item of items; track item) {
                <li>{{ item }}</li>
              }
            \`,
          })
          export class AppComponent {
            items = ['a', 'b', 'c'];
          }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      const liStart = appFile.contents.indexOf('<li>') + 1;

      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.ts', liStart);

      expect(linkedRanges).not.toBeNull();
      expect(linkedRanges!.ranges.length).toBe(2);
    });

    it('should handle elements inside ng-template', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: \`
              <ng-template>
                <span>template content</span>
              </ng-template>
            \`,
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      const spanStart = appFile.contents.indexOf('<span>') + 1;

      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.ts', spanStart);

      expect(linkedRanges).not.toBeNull();
      expect(linkedRanges!.ranges.length).toBe(2);
    });

    it('should handle position at exact start of tag name', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<p>paragraph</p>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Position right after '<'
      const pStart = appFile.contents.indexOf('<p>') + 1;

      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.ts', pStart);

      expect(linkedRanges).not.toBeNull();
      expect(linkedRanges!.ranges.length).toBe(2);
    });

    it('should handle position at exact end of tag name', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<div>text</div>',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      // Position right at the end of 'div' (just before '>')
      const divEnd = appFile.contents.indexOf('<div>') + 4; // 1 for '<' + 3 for 'div'

      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.ts', divEnd);

      expect(linkedRanges).not.toBeNull();
      expect(linkedRanges!.ranges.length).toBe(2);
    });

    it('should return null for self-closing elements', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: '<input type="text" />',
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      const inputStart = appFile.contents.indexOf('<input') + 1;

      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.ts', inputStart);

      // Self-closing elements don't have linked ranges
      expect(linkedRanges).toBeNull();
    });

    it('should work with SVG elements', () => {
      const files = {
        'app.ts': `
          import {Component} from '@angular/core';

          @Component({
            selector: 'my-app',
            template: \`
              <svg>
                <rect width="100" height="100"></rect>
              </svg>
            \`,
          })
          export class AppComponent {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', files);
      const appFile = project.openFile('app.ts');
      const rectStart = appFile.contents.indexOf('<rect') + 1;

      const linkedRanges = project.getLinkedEditingRangeAtPosition('app.ts', rectStart);

      expect(linkedRanges).not.toBeNull();
      expect(linkedRanges!.ranges.length).toBe(2);
    });
  });
});
