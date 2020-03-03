/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {createLanguageService} from '../src/language_service';
import {CompletionKind} from '../src/types';
import {TypeScriptServiceHost} from '../src/typescript_host';

import {MockTypescriptHost} from './test_utils';

describe('completions', () => {
  const mockHost = new MockTypescriptHost(['/app/main.ts']);
  const tsLS = ts.createLanguageService(mockHost);
  const ngHost = new TypeScriptServiceHost(mockHost, tsLS);
  const ngLS = createLanguageService(ngHost);

  type CI = ts.CompletionInfo | undefined;

  function normalizeTemplateCursor(template: string): string {
    const cursorMarker = '~{cursor}';
    if (template.indexOf(cursorMarker) === -1) {
      // mockHost ignores location markers; replace the cursor shorthand "|" with the marker if
      // necessary.
      return template.replace('|', cursorMarker);
    }

    return template;
  }

  /**
   * Evaluates an expectation on completions generated for an external template.
   * The external template's component is defined in this function.
   * @param template template to test completions on. The template must include a cursor location,
   *        either via the "|" character or "~{cursor}" marker, where completions will be generated
   *        at.
   * @param expectation assertion function to perform on the generated completions
   */
  function driveExternal(template: string, expectation: (completions: CI) => void) {
    const TEST_TEMPLATE = '/app/test.ng';

    mockHost.override(TEST_TEMPLATE, normalizeTemplateCursor(template));
    const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
    expectation(completions);
  }

  /**
   * Evaluates an expectation completions generated for an inline template.
   * The inline template's component is expected to be "TemplateReference" in "parsing-cases".
   * @param template template to test completions on. The template must include a cursor location,
   *        either via the "|" character or "~{cursor}" marker, where completions will be generated
   *        at.
   * @param expectation assertion function to perform on the generated completions
   */
  function driveInline(template: string, expectation: (completions: CI) => void) {
    const APP_COMPONENT = '/app/app.component.ts';

    template = normalizeTemplateCursor(template);
    // TODO(ayazhafiz): it would be easier to inject the template into the "TemplateReference"
    // component.
    mockHost.override(APP_COMPONENT, `
        import {Component} from '@angular/core';

        const person = {
          name: 'John Doe',
          age: 42,
          street: '123 Angular Ln',
        };

        @Component({
          template: \`${template}\`,
        })
        export class AppComponent {
          title = 'Tour of Heroes';
          hero = {id: 1, name: 'Windstorm'};
          heroes = [this.hero];
          league = [this.heroes];
          myClick(event: any) {}
          people = Promise.resolve([person]);
          promisedPerson = Promise.resolve(person);
          private internal: string = 'internal';
        }
      `);
    const marker = mockHost.getLocationMarkerFor(APP_COMPONENT, 'cursor');
    const completions = ngLS.getCompletionsAtPosition(APP_COMPONENT, marker.start);
    expectation(completions);
  }

  beforeEach(() => { mockHost.reset(); });

  it('should not expand i18n templates', () => {
    const template = `<div i18n="@@el">{{ | }}</div>`;
    const expectation = (ci: CI) => { expectContain(ci, CompletionKind.PROPERTY, ['title']); };

    driveExternal(template, expectation);
    driveInline(template, expectation);
  });

  describe('entity completions', () => {
    it('should provide entity completions', () => {
      const template = '&|amp';
      const expectation = (ci: CI) => {
        expectContain(ci, CompletionKind.ENTITY, ['&amp;', '&gt;', '&lt;', '&iota;']);
      };

      driveExternal(template, expectation);
      // TODO(ayazhafiz): this doesn't work on inline templates?
    });
  });

  describe('element completions', () => {
    it('should provide components', () => {
      const template = `
        ~{empty}
        <~{start-tag}h~{start-tag-after-h}1>
          ~{nested-content}
        </h1>
      `;
      const expectation = (ci: CI) => {
        expectContain(ci, CompletionKind.COMPONENT, ['test-comp', 'ng-component']);
      };

      const locations = ['empty', 'start-tag', 'start-tag-after-h', 'nested-content'];
      for (const location of locations) {
        const templateWithCursor = template.replace(location, 'cursor');
        driveExternal(templateWithCursor, expectation);
        driveInline(templateWithCursor, expectation);
      }
    });

    it('should provide angular pseudo elements', () => {
      const template = `
        ~{empty}
        <~{start-tag}n~{start-tag-after-n}1>
          ~{nested-content}
        </h1>`;
      const expectation = (ci: CI) => {
        expectContain(ci, CompletionKind.ANGULAR_ELEMENT, [
          'ng-container',
          'ng-content',
          'ng-template',
        ]);
      };

      const locations = ['empty', 'start-tag', 'start-tag-after-n', 'nested-content'];
      for (const location of locations) {
        const templateWithCursor = template.replace(location, 'cursor');
        driveExternal(templateWithCursor, expectation);
        driveInline(templateWithCursor, expectation);
      }
    });

    it('should provide completions in an incomplete template', () => {
      const template = '<t|';
      const expectation =
          (ci: CI) => { expectContain(ci, CompletionKind.COMPONENT, ['test-comp']); };

      driveExternal(template, expectation);
      driveInline(template, expectation);
    });

    describe('html element completions', () => {
      const TEMPLATE = `
        ~{empty}
        <~{start-tag}h~{start-tag-after-h}1>
          ~{nested-content}
        </h1>`;
      const LOCATIONS = ['empty', 'start-tag', 'start-tag-after-h', 'nested-content'];
      const ELS = ['h1', 'h2', 'div', 'span'];

      it('should provide html elements in inline templates', () => {
        const expectation = (ci: CI) => { expectContain(ci, CompletionKind.HTML_ELEMENT, ELS); };

        for (const location of LOCATIONS) {
          const templateWithCursor = TEMPLATE.replace(location, 'cursor');
          driveInline(templateWithCursor, expectation);
        }
      });

      it('should not provide html elements in external templates', () => {
        const expectation = (ci: CI) => {
          for (const el of ELS) {
              expect(ci?.entries).not.toContain(jasmine.objectContaining({name: el}));
          }
        };

        for (const location of LOCATIONS) {
          const templateWithCursor = TEMPLATE.replace(location, 'cursor');
          driveExternal(templateWithCursor, expectation);
        }
      });
    });
  });

  describe('attribute completions', () => {
    it('should provide attribute directives', () => {
      const template = '<div |></div>';
      const expectation = (ci: CI) => {
        expectContain(ci, CompletionKind.ATTRIBUTE, ['string-model', 'number-model']);
      };

      driveExternal(template, expectation);
      driveInline(template, expectation);
    });

    it('should provide structural directives', () => {
      const template = '<div *|></div>';
      const expectation = (ci: CI) => {
        expectContain(ci, CompletionKind.ATTRIBUTE, [
          'ngFor',
          'ngForOf',
          'ngIf',
          'ngSwitchCase',
          'ngSwitchDefault',
          'ngPluralCase',
          'ngTemplateOutlet',
        ]);
      };

      driveExternal(template, expectation);
      driveInline(template, expectation);
    });

    it('should provide completions in an incomplete template', () => {
      const template = '<div |>';
      const expectation =
          (ci: CI) => { expectContain(ci, CompletionKind.ATTRIBUTE, ['string-model']); };

      driveExternal(template, expectation);
      driveInline(template, expectation);
    });

    it('should provide completions inside an unknown tag', () => {
      const template = '<unknown |></unknown>';
      const expectation =
          (ci: CI) => { expectContain(ci, CompletionKind.ATTRIBUTE, ['string-model']); };

      driveExternal(template, expectation);
      driveInline(template, expectation);
    });

    describe('html attribute completions', () => {
      const TEMPLATE = `<h1 |</h1>`;
      const ATTRS = ['class', 'id', 'onclick', 'onmouseup'];

      it('should provide html elements in inline templates', () => {
        const expectation =
            (ci: CI) => { expectContain(ci, CompletionKind.HTML_ATTRIBUTE, ATTRS); };

        driveInline(TEMPLATE, expectation);
      });

      it('should not provide html elements in external templates', () => {
        const expectation = (ci: CI) => {
          for (const attr of ATTRS) {
            expect(ci?.entries).not.toContain(jasmine.objectContaining({name: attr}));
          }
        };

        driveExternal(TEMPLATE, expectation);
      });
    });
  });

  describe('expression completions', () => {
    it('should provide public members of a component', () => {
      const template = '{{ | }}';
      const expectation = (ci: CI) => {
        expectContain(ci, CompletionKind.PROPERTY, ['title', 'hero']);
      };

      driveExternal(template, expectation);
      driveInline(template, expectation);
    });

    it('should not include private members of a class', () => {
      const template = '{{ | }}';
      const expectation = (ci: CI) => {
        const internal = ci !.entries.find(e => e.name === 'internal');
        expect(internal).toBeUndefined();
      };

      driveExternal(template, expectation);
      driveInline(template, expectation);
    });

    describe('expression property completions', () => {
      it('should provide properties of an object', () => {
        const template = '{{ hero.| }}';
        const expectation = (ci: CI) => {
          expectContain(ci, CompletionKind.PROPERTY, ['id', 'name']);
        };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });

      describe('with numeric index signatures', () => {
        it('should work with numeric index signatures (arrays)', () => {
          const template = `{{ heroes[0].| }}`;
          const expectation = (ci: CI) => {
            expectContain(ci, CompletionKind.PROPERTY, ['id', 'name']);
          };

          driveExternal(template, expectation);
        });

        it('should work with numeric index signatures (tuple arrays)', () => {
          const template = `{{ tupleArray[1].| }}`;
          const expectation = (ci: CI) => {
            expectContain(ci, CompletionKind.PROPERTY, ['id', 'name']);
          };

          driveExternal(template, expectation);
        });
      });

      describe('with string index signatures', () => {
        it('should work with index notation', () => {
          const template = `{{ heroesByName['Jacky'].| }}`;
          const expectation = (ci: CI) => {
            expectContain(ci, CompletionKind.PROPERTY, ['id', 'name']);
          };

          driveExternal(template, expectation);
        });

        it('should work with dot notation', () => {
          const template = `{{ heroesByName.jacky.| }}`;
          const expectation = (ci: CI) => {
            expectContain(ci, CompletionKind.PROPERTY, ['id', 'name']);
          };

          driveExternal(template, expectation);
        });

        it('should work with dot notation if stringIndexType is a primitive type', () => {
          const template = `{{ primitiveIndexType.test.| }}`;
          const expectation =
              (ci: CI) => { expectContain(ci, CompletionKind.METHOD, ['substring']); };

          driveExternal(template, expectation);
        });
      });

      describe('pipe completions', () => {
        it('should provide pipe completions', () => {
          const template = '{{ title | ~{before}low~{in}erc~{after} }}';
          const expectation = (ci: CI) => {
            expectContain(
                ci, CompletionKind.PIPE, ['lowercase', 'uppercase', 'async', 'titlecase']);
          };
          for (const location of ['before', 'in', 'after']) {
            const templateWithCursor = template.replace(location, 'cursor');

            driveExternal(templateWithCursor, expectation);
            driveInline(templateWithCursor, expectation);
          }
        });

        it('should provide pipe result property completions', () => {
          const template = '{{ (title | lowercase).~{cursor} }}';
          const expectation = (ci: CI) => {
            // Expect string completions
            expectContain(ci, CompletionKind.METHOD, ['charAt', 'replace', 'substring']);
          };

          driveExternal(template, expectation);
          driveInline(template, expectation);
        });
      });
    });

    describe('template reference variable expressions', () => {
      it('should provide template reference variables', () => {
        const template = `
        <div #div>
          <test-comp #test1>
            {{ | }}
          </test-comp>
        </div>
        <test-comp #test2></test-comp>`;
        const expectation = (ci: CI) => {
          expectContain(ci, CompletionKind.REFERENCE, ['div', 'test1', 'test2']);
        };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });

      it('should provide properties for template references targetting components', () => {
        const template = `
            <test-comp #test></test-comp>
            <div (click)="test.|"></div>
          `;
        const expectation = (ci: CI) => {
          expectContain(ci, CompletionKind.PROPERTY, ['name', 'testEvent']);
        };

        driveExternal(template, expectation);
      });

      // TODO: Enable when we have a flag that indicates the project targets the DOM
      // it('should work with template references targetting DOM elements', () => {
      //  mockHost.override(TEST_TEMPLATE, `
      //    <div #div></div>
      //    <div (click)="div.~{property-read}"></div>
      //  `);
      //  const marker = mockHost.getLocationMarkerFor(TEST_TEMPLATE, 'property-read');
      //  const completions = ngLS.getCompletionsAtPosition(TEST_TEMPLATE, marker.start);
      //  expectContain(completions, CompletionKind.PROPERTY, ['innerText']);
      // });
    });

    describe('template binding expressions', () => {
      it('should provide template bindings variables', () => {
        const template = `
        <div *ngFor="let h of heroes">
          {{ | }}
        </div>
      `;
        const expectation = (ci: CI) => { expectContain(ci, CompletionKind.VARIABLE, ['h']); };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });

      it('should provide properties for template bindings', () => {
        const template = `
          <div *withContext="let p = nonImplicitPerson">
            {{ p.~{cursor} }}
          </div>
        `;
        const expectation = (ci: CI) => {
          expectContain(ci, CompletionKind.PROPERTY, ['name', 'age', 'street']);
        };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });
    });

    it('should provide the $any() type cast method', () => {
      const template = '{{ | }}';
      const expectation = (ci: CI) => { expectContain(ci, CompletionKind.METHOD, ['$any']); };

      driveExternal(template, expectation);
      driveInline(template, expectation);
    });
  });

  describe('property binding completions', () => {
    it('should suggest input property bindings ([] syntax)', () => {
      const template = `<div number-model [|]></div>`;
      const expectation =
          (ci: CI) => { expectContain(ci, CompletionKind.ATTRIBUTE, ['inputAlias']); };

      driveExternal(template, expectation);
      driveInline(template, expectation);
    });

    it('should suggest input property bindings (bind- syntax)', () => {
      const template = `<div number-model bind-|></div>`;
      const expectation =
          (ci: CI) => { expectContain(ci, CompletionKind.ATTRIBUTE, ['inputAlias']); };

      driveExternal(template, expectation);
      driveInline(template, expectation);
    });

    describe('binding values', () => {
      it('should provide component members', () => {
        const template = `<div [id]="|"></div>`;
        const expectation = (ci: CI) => {
          expectContain(ci, CompletionKind.PROPERTY, ['title', 'hero']);
        };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });

      it('should provide properties', () => {
        const template = `<h1 [model]="hero.|"></h1>`;
        const expectation = (ci: CI) => {
          expectContain(ci, CompletionKind.PROPERTY, ['id', 'name']);
        };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });
    });
  });

  describe('event binding completions', () => {
    it('should suggest output event bindings ([] syntax)', () => {
      const template = `<div number-model (|)></div>`;
      const expectation =
          (ci: CI) => { expectContain(ci, CompletionKind.ATTRIBUTE, ['outputAlias']); };

      driveExternal(template, expectation);
      driveInline(template, expectation);
    });

    it('should suggest output event bindings (on- syntax)', () => {
      const template = `<div number-model on-|></div>`;
      const expectation =
          (ci: CI) => { expectContain(ci, CompletionKind.ATTRIBUTE, ['outputAlias']); };

      driveExternal(template, expectation);
      driveInline(template, expectation);
    });

    describe('binding values', () => {
      it('should provide component methods', () => {
        const template = `<div (click)="|"></div>`;
        const expectation = (ci: CI) => { expectContain(ci, CompletionKind.METHOD, ['myClick']); };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });

      it('should provide $event in event bindings', () => {
        const template = `<div (click)="myClick(|);"></div>`;
        const expectation = (ci: CI) => { expectContain(ci, CompletionKind.VARIABLE, ['$event']); };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });

      it('should provide $event property completions in output bindings', () => {
        const template = `<div string-model (modelChange)="$event.|"></div>`;
        const expectation = (ci: CI) => {
          // Expect string properties
          expectContain(ci, CompletionKind.METHOD, ['charAt', 'substring']);
        };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });
    });
  });

  describe('two-way binding completions', () => {
    it('should suggest two-way input and output bindings ( [()] syntax )', () => {
      const template = `<div string-model [(|)]></div>`;
      const expectation = (ci: CI) => { expectContain(ci, CompletionKind.ATTRIBUTE, ['model']); };

      driveInline(template, expectation);
      driveExternal(template, expectation);
    });

    it('should suggest two-way input and output bindings (bindon- syntax)', () => {
      const template = `<div string-model bindon-|></div>`;
      const expectation = (ci: CI) => { expectContain(ci, CompletionKind.ATTRIBUTE, ['model']); };

      driveInline(template, expectation);
      driveExternal(template, expectation);
    });

    describe('binding values', () => {
      it('should provide component members', () => {
        const template = `<div [(model)]="|"></div>`;
        const expectation = (ci: CI) => {
          expectContain(ci, CompletionKind.PROPERTY, ['title', 'hero']);
        };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });

      it('should provide properties', () => {
        const template = `<div [(model)]="hero.|"></div>`;
        const expectation = (ci: CI) => {
          expectContain(ci, CompletionKind.PROPERTY, ['id', 'name']);
        };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });

      it('should provide $event', () => {
        const template = `<div [(click)]="$ev|"></div>`;
        const expectation = (ci: CI) => { expectContain(ci, CompletionKind.VARIABLE, ['$event']); };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });
    });
  });

  describe('template reference variable completions', () => {
    it('should provide reference targets (ref- prefix)', () => {
      const template = `<form ref-itemForm="ngF|"></form>`;
      const expectation = (ci: CI) => { expectContain(ci, CompletionKind.REFERENCE, ['ngForm']); };

      driveExternal(template, expectation);
      driveInline(template, expectation);
    });

    it('should provide reference targets (# prefix)', () => {
      const template = `<form #itemForm="ngF|"></form>`;
      const expectation = (ci: CI) => { expectContain(ci, CompletionKind.REFERENCE, ['ngForm']); };

      driveExternal(template, expectation);
      driveInline(template, expectation);
    });
  });

  describe('template binding completions', () => {
    describe('let expression', () => {
      it('should not provide suggestion before the = sign', () => {
        const template = `<div *withContext="let i| = "></div>`;
        const expectation = (ci: CI) => { expect(ci).toBeUndefined(); };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });

      it('should suggest template context members for initialization', () => {
        const template = `<div *withContext="let p=|"></div>`;
        const expectation = (ci: CI) => {
          expectContain(ci, CompletionKind.PROPERTY, ['$implicit', 'nonImplicitPerson']);
        };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });

      it('should suggest field references', () => {
        const template = `<div *withContext="let x of |"></div>`;
        const expectation = (ci: CI) => {
          expectContain(ci, CompletionKind.PROPERTY, ['title', 'heroes']);
          // The symbol 'x' is also in scope. This asserts that we are actually taking the AST into
          // account and not just referring to the symbol table of the Component.
          expectContain(ci, CompletionKind.VARIABLE, ['x']);
        };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });

      it('should provide expression completions', () => {
        const template = `<div *ngFor="let x of hero.|"></div>`;
        const expectation = (ci: CI) => { expectContain(ci, CompletionKind.PROPERTY, ['name']); };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });
    });

    describe('ngIf special cases', () => {
      it('should be able to get completions for exported *ngIf variable', () => {
        const template = `
          <div *ngIf="promisedPerson | async as person">
            {{ person.~{cursor}name }}
          </div>`;
        const expectation = (ci: CI) => {
          expectContain(ci, CompletionKind.PROPERTY, ['name', 'age', 'street']);
        };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });
    });

    describe('ngFor special cases', () => {
      it('should be able to infer the type of a ngForOf with an async pipe', () => {
        const template = `
          <div *ngFor="let person of people | async">
            {{ person.~{cursor}name }}
          </div>`;
        const expectation = (ci: CI) => {
          expectContain(ci, CompletionKind.PROPERTY, ['name', 'age', 'street']);
        };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });

      it('should be able to resolve variable in nested loop', () => {
        const template = `
          <div *ngFor="let leagueMembers of league">
            <div *ngFor="let member of leagueMembers">
              {{ member.| }}
            </div>
          </div>`;
        const expectation = (ci: CI) => {
          expectContain(ci, CompletionKind.PROPERTY, ['id', 'name']);
        };

        driveExternal(template, expectation);
        driveInline(template, expectation);
      });
    });
  });

  describe('replacement span', () => {
    it('should not generate replacement entries for zero-length replacements', () => {
      const template = '{{ hero.| }}';
      const expectation = (ci: CI) => {
        const completion = ci ?.entries ?.find(entry => entry.name === 'name');
        expect(completion).toBeDefined();
        expect(completion !.replacementSpan).toBeUndefined();
      };

      driveExternal(template, expectation);
    });

    it('should work at the start of a template', () => {
      const template = '|tes';
      const expectation = (ci: CI) => {
        const completion = ci ?.entries ?.find(entry => entry.name === 'test-comp');
        expect(completion).toBeDefined();
        expect(completion !.replacementSpan).toEqual({start: 0, length: 3});
      };

      driveExternal(template, expectation);
    });

    it('should work at the end of a template', () => {
      const template = 'tes|';
      const expectation = (ci: CI) => {
        const completion = ci ?.entries ?.find(entry => entry.name === 'test-comp');
        expect(completion).toBeDefined();
        expect(completion !.replacementSpan).toEqual({start: 0, length: 3});
      };

      driveExternal(template, expectation);
    });

    it('should work for mid-word completions', () => {
      const template = 'tes|t-co';
      const expectation = (ci: CI) => {
        const completion = ci ?.entries ?.find(entry => entry.name === 'test-comp');
        expect(completion).toBeDefined();
        expect(completion !.replacementSpan).toEqual({start: 0, length: 7});
      };

      driveExternal(template, expectation);
    });

    it('should work for attributes', () => {
      const template = `<div (cl|)></div>`;
      const expectation = (ci: CI) => {
        const completion = ci ?.entries ?.find(entry => entry.name === 'click');
        expect(completion).toBeDefined();
        expect(completion !.replacementSpan).toEqual({start: 6, length: 2});
      };

      driveExternal(template, expectation);
    });

    it('should work for events', () => {
      const template = `<div (click)="my|"></div>`;
      const expectation = (ci: CI) => {
        const completion = ci ?.entries ?.find(entry => entry.name === 'myClick');
        expect(completion).toBeDefined();
        expect(completion !.replacementSpan).toEqual({start: 14, length: 2});
      };

      driveExternal(template, expectation);
    });

    it('should work for element names', () => {
      const template = `<tes|></test-comp>`;
      const expectation = (ci: CI) => {
        const completion = ci ?.entries ?.find(entry => entry.name === 'test-comp');
        expect(completion).toBeDefined();
        expect(completion !.replacementSpan).toEqual({start: 1, length: 3});
      };

      driveExternal(template, expectation);
    });

    it('should work for bindings', () => {
      const template = `<input [(ngMod|)] />`;
      const expectation = (ci: CI) => {
        const completion = ci ?.entries ?.find(entry => entry.name === 'ngModel');
        expect(completion).toBeDefined();
        expect(completion !.replacementSpan).toEqual({start: 9, length: 5});
      };

      driveExternal(template, expectation);
    });
  });

  describe('insert text', () => {
    it('should include parentheses for methods', () => {
      const template = `<div (click)="|"></div>`;
      const expectation = (ci: CI) => {
        expect(ci?.entries).toContain(jasmine.objectContaining({
          name: 'myClick',
          kind: CompletionKind.METHOD as any,
          insertText: 'myClick()',
        }));
      };

      driveExternal(template, expectation);
    });

    it('shiuld exclude parentheses for pipes', () => {
      const template = `<h1>{{title | lowe~{cursor} }}`;
      const expectation = (ci: CI) => {
        expect(ci?.entries).toContain(jasmine.objectContaining({
          name: 'lowercase',
          kind: CompletionKind.PIPE as any,
          insertText: 'lowercase',
        }));
      };

      driveExternal(template, expectation);
    });
  });
});

function expectContain(
    completions: ts.CompletionInfo | undefined, kind: CompletionKind, names: string[]) {
  expect(completions).toBeDefined();
  for (const name of names) {
    expect(completions !.entries).toContain(jasmine.objectContaining({ name, kind } as any));
  }
}
