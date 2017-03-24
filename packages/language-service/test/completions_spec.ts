/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import 'reflect-metadata';
import * as ts from 'typescript';

import {createLanguageService} from '../src/language_service';
import {Completions} from '../src/types';
import {TypeScriptServiceHost} from '../src/typescript_host';

import {toh} from './test_data';
import {MockTypescriptHost} from './test_utils';

describe('completions', () => {
  let documentRegistry = ts.createDocumentRegistry();
  let mockHost = new MockTypescriptHost(['/app/main.ts', '/app/parsing-cases.ts'], toh);
  let service = ts.createLanguageService(mockHost, documentRegistry);
  let ngHost = new TypeScriptServiceHost(mockHost, service);
  let ngService = createLanguageService(ngHost);
  ngHost.setSite(ngService);

  it('should be able to get entity completions',
     () => { contains('/app/test.ng', 'entity-amp', '&amp;', '&gt;', '&lt;', '&iota;'); });

  it('should be able to return html elements', () => {
    let htmlTags = ['h1', 'h2', 'div', 'span'];
    let locations = ['empty', 'start-tag-h1', 'h1-content', 'start-tag', 'start-tag-after-h'];
    for (let location of locations) {
      contains('/app/test.ng', location, ...htmlTags);
    }
  });

  it('should be able to return element diretives',
     () => { contains('/app/test.ng', 'empty', 'my-app'); });

  it('should be able to return h1 attributes',
     () => { contains('/app/test.ng', 'h1-after-space', 'id', 'dir', 'lang', 'onclick'); });

  it('should be able to find common angular attributes',
     () => { contains('/app/test.ng', 'div-attributes', '(click)', '[ngClass]'); });

  it('should be able to get completions in some random garbage', () => {
    const fileName = '/app/test.ng';
    mockHost.override(fileName, ' > {{tle<\n  {{retl  ><bel/beled}}di>\n   la</b  </d    &a  ');
    expect(() => ngService.getCompletionsAt(fileName, 31)).not.toThrow();
    mockHost.override(fileName, undefined !);
  });

  it('should be able to infer the type of a ngForOf', () => {
    addCode(
        `
      interface Person {
        name: string,
        street: string
      }

      @Component({template: '<div *ngFor="let person of people">{{person.~{name}name}}</div'})
      export class MyComponent {
        people: Person[]
      }`,
        () => { contains('/app/app.component.ts', 'name', 'name', 'street'); });
  });

  it('should be able to infer the type of a ngForOf with an async pipe', () => {
    addCode(
        `
      interface Person {
        name: string,
        street: string
      }

      @Component({template: '<div *ngFor="let person of people | async">{{person.~{name}name}}</div'})
      export class MyComponent {
        people: Promise<Person[]>;
      }`,
        () => { contains('/app/app.component.ts', 'name', 'name', 'street'); });
  });

  it('should be able to complete every character in the file', () => {
    const fileName = '/app/test.ng';

    expect(() => {
      let chance = 0.05;
      let requests = 0;
      function tryCompletionsAt(position: number) {
        try {
          if (Math.random() < chance) {
            ngService.getCompletionsAt(fileName, position);
            requests++;
          }
        } catch (e) {
          // Emit enough diagnostic information to reproduce the error.
          console.error(
              `Position: ${position}\nContent: "${mockHost.getFileContent(fileName)}"\nStack:\n${e.stack}`);
          throw e;
        }
      }
      try {
        const originalContent = mockHost.getFileContent(fileName) !;

        // For each character in the file, add it to the file and request a completion after it.
        for (let index = 0, len = originalContent.length; index < len; index++) {
          const content = originalContent.substr(0, index);
          mockHost.override(fileName, content);
          tryCompletionsAt(index);
        }

        // For the complete file, try to get a completion at every character.
        mockHost.override(fileName, originalContent);
        for (let index = 0, len = originalContent.length; index < len; index++) {
          tryCompletionsAt(index);
        }

        // Delete random characters in the file until we get an empty file.
        let content = originalContent;
        while (content.length > 0) {
          const deleteIndex = Math.floor(Math.random() * content.length);
          content = content.slice(0, deleteIndex - 1) + content.slice(deleteIndex + 1);
          mockHost.override(fileName, content);

          const requestIndex = Math.floor(Math.random() * content.length);
          tryCompletionsAt(requestIndex);
        }

        // Build up the string from zero asking for a completion after every char
        buildUp(originalContent, (text, position) => {
          mockHost.override(fileName, text);
          tryCompletionsAt(position);
        });
      } finally {
        mockHost.override(fileName, undefined !);
      }
    }).not.toThrow();
  });

  describe('with regression tests', () => {
    it('should not crash with an incomplete component', () => {
      expect(() => {
        const code = `
@Component({
  template: '~{inside-template}'
})
export class MyComponent {

}`;
        addCode(code, fileName => { contains(fileName, 'inside-template', 'h1'); });
      }).not.toThrow();
    });

    it('should hot crash with an incomplete class', () => {
      expect(() => {
        addCode('\nexport class', fileName => { ngHost.updateAnalyzedModules(); });
      }).not.toThrow();
    });

  });

  function addCode(code: string, cb: (fileName: string, content?: string) => void) {
    const fileName = '/app/app.component.ts';
    const originalContent = mockHost.getFileContent(fileName);
    const newContent = originalContent + code;
    mockHost.override(fileName, originalContent + code);
    ngHost.updateAnalyzedModules();
    try {
      cb(fileName, newContent);
    } finally {
      mockHost.override(fileName, undefined !);
    }
  }

  function contains(fileName: string, locationMarker: string, ...names: string[]) {
    let location = mockHost.getMarkerLocations(fileName) ![locationMarker];
    if (location == null) {
      throw new Error(`No marker ${locationMarker} found.`);
    }
    expectEntries(locationMarker, ngService.getCompletionsAt(fileName, location), ...names);
  }
});


function expectEntries(locationMarker: string, completions: Completions, ...names: string[]) {
  let entries: {[name: string]: boolean} = {};
  if (!completions) {
    throw new Error(
        `Expected result from ${locationMarker} to include ${names.join(', ')} but no result provided`);
  }
  if (!completions.length) {
    throw new Error(
        `Expected result from ${locationMarker} to include ${names.join(', ')} an empty result provided`);
  } else {
    for (let entry of completions) {
      entries[entry.name] = true;
    }
    let missing = names.filter(name => !entries[name]);
    if (missing.length) {
      throw new Error(
          `Expected result from ${locationMarker} to include at least one of the following, ${missing.join(', ')}, in the list of entries ${completions.map(entry => entry.name).join(', ')}`);
    }
  }
}

function buildUp(originalText: string, cb: (text: string, position: number) => void) {
  let count = originalText.length;

  let inString: boolean[] = (new Array(count)).fill(false);
  let unused: number[] = (new Array(count)).fill(1).map((v, i) => i);

  function getText() {
    return new Array(count)
        .fill(1)
        .map((v, i) => i)
        .filter(i => inString[i])
        .map(i => originalText[i])
        .join('');
  }

  function randomUnusedIndex() { return Math.floor(Math.random() * unused.length); }

  while (unused.length > 0) {
    let unusedIndex = randomUnusedIndex();
    let index = unused[unusedIndex];
    if (index == null) throw new Error('Internal test buildup error');
    if (inString[index]) throw new Error('Internal test buildup error');
    inString[index] = true;
    unused.splice(unusedIndex, 1);
    let text = getText();
    let position =
        inString.filter((_, i) => i <= index).map(v => v ? 1 : 0).reduce((p, v) => p + v, 0);
    cb(text, position);
  }
}
