/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Make the `$localize()` global function available to the compiled templates, and the direct calls
// below. This would normally be done inside the application `polyfills.ts` file.
import '@angular/localize/init';
import {registerLocaleData} from '@angular/common';
import localeRo from '@angular/common/locales/ro';
import {Component, ContentChild, ContentChildren, Directive, HostBinding, Input, LOCALE_ID, QueryList, TemplateRef, Type, ViewChild, ViewContainerRef, Pipe, PipeTransform} from '@angular/core';
import {setDelayProjection} from '@angular/core/src/render3/instructions/projection';
import {TestBed} from '@angular/core/testing';
import {loadTranslations} from '@angular/localize';
import {By} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';


onlyInIvy('Ivy i18n logic')
    .describe(
        'runtime i18n', () => {
          beforeEach(() => {
            TestBed.configureTestingModule(
                {declarations: [AppComp, DirectiveWithTplRef, UppercasePipe]});
          });

          afterEach(() => { setDelayProjection(false); });

          it('should translate text', () => {
            loadTranslations({'text': 'texte'});
            const fixture = initWithTemplate(AppComp, `<div i18n>text</div>`);
            expect(fixture.nativeElement.innerHTML).toEqual(`<div>texte</div>`);
          });

          it('should support interpolations', () => {
            loadTranslations({'Hello {$INTERPOLATION}!': 'Bonjour {$INTERPOLATION}!'});
            const fixture = initWithTemplate(AppComp, `<div i18n>Hello {{name}}!</div>`);
            expect(fixture.nativeElement.innerHTML).toEqual(`<div>Bonjour Angular!</div>`);
            fixture.componentRef.instance.name = `John`;
            fixture.detectChanges();
            expect(fixture.nativeElement.innerHTML).toEqual(`<div>Bonjour John!</div>`);
          });

          it('should support named interpolations', () => {
            loadTranslations({
              ' Hello {$USER_NAME}! Emails: {$AMOUNT_OF_EMAILS_RECEIVED} ':
                  ' Bonjour {$USER_NAME}! Emails: {$AMOUNT_OF_EMAILS_RECEIVED} '
            });
            const fixture = initWithTemplate(AppComp, `
      <div i18n>
        Hello {{ name // i18n(ph="user_name") }}!
        Emails: {{ count // i18n(ph="amount of emails received") }}
      </div>
    `);
            expect(fixture.nativeElement.innerHTML)
                .toEqual(`<div> Bonjour Angular! Emails: 0 </div>`);
            fixture.componentRef.instance.name = `John`;
            fixture.componentRef.instance.count = 5;
            fixture.detectChanges();
            expect(fixture.nativeElement.innerHTML).toEqual(`<div> Bonjour John! Emails: 5 </div>`);
          });

          it('should support interpolations with custom interpolation config', () => {
            loadTranslations({'Hello {$INTERPOLATION}': 'Bonjour {$INTERPOLATION}'});
            const interpolation = ['{%', '%}'] as[string, string];
            TestBed.overrideComponent(AppComp, {set: {interpolation}});
            const fixture = initWithTemplate(AppComp, `<div i18n>Hello {% name %}</div>`);

            expect(fixture.nativeElement.innerHTML).toBe('<div>Bonjour Angular</div>');
          });

          it('should support &ngsp; in translatable sections', () => {
            // note: the `` unicode symbol represents the `&ngsp;` in translations
            loadTranslations({'text ||': 'texte ||'});
            const fixture =
                initWithTemplate(AppCompWithWhitespaces, `<div i18n>text |&ngsp;|</div>`);

            expect(fixture.nativeElement.innerHTML).toEqual(`<div>texte | |</div>`);
          });

          it('should support interpolations with complex expressions', () => {
            loadTranslations({
              ' {$INTERPOLATION} - {$INTERPOLATION_1} - {$INTERPOLATION_2} ':
                  ' {$INTERPOLATION} - {$INTERPOLATION_1} - {$INTERPOLATION_2} (fr) '
            });
            const fixture = initWithTemplate(AppComp, `
      <div i18n>
        {{ name | uppercase }} -
        {{ obj?.a?.b }} -
        {{ obj?.getA()?.b }}
      </div>
    `);
            // the `obj` field is not yet defined, so 2nd and 3rd interpolations return empty
            // strings
            expect(fixture.nativeElement.innerHTML).toEqual(`<div> ANGULAR -  -  (fr) </div>`);

            fixture.componentRef.instance.obj = {
              a: {b: 'value 1'},
              getA: () => ({b: 'value 2'}),
            };
            fixture.detectChanges();
            expect(fixture.nativeElement.innerHTML)
                .toEqual(`<div> ANGULAR - value 1 - value 2 (fr) </div>`);
          });

          it('should support elements', () => {
            loadTranslations({
              'Hello {$START_TAG_SPAN}world{$CLOSE_TAG_SPAN} and {$START_TAG_DIV}universe{$CLOSE_TAG_DIV}!':
                  'Bonjour {$START_TAG_SPAN}monde{$CLOSE_TAG_SPAN} et {$START_TAG_DIV}univers{$CLOSE_TAG_DIV}!'
            });
            const fixture = initWithTemplate(
                AppComp, `<div i18n>Hello <span>world</span> and <div>universe</div>!</div>`);
            expect(fixture.nativeElement.innerHTML)
                .toEqual(`<div>Bonjour <span>monde</span> et <div>univers</div>!</div>`);
          });

          it('should support removing elements', () => {
            loadTranslations({
              'Hello {$START_BOLD_TEXT}my{$CLOSE_BOLD_TEXT}{$START_TAG_SPAN}world{$CLOSE_TAG_SPAN}':
                  'Bonjour {$START_TAG_SPAN}monde{$CLOSE_TAG_SPAN}'
            });
            const fixture = initWithTemplate(
                AppComp, `<div i18n>Hello <b>my</b><span>world</span></div><div>!</div>`);
            expect(fixture.nativeElement.innerHTML)
                .toEqual(`<div>Bonjour <span>monde</span></div><div>!</div>`);
          });

          it('should support moving elements', () => {
            loadTranslations({
              'Hello {$START_TAG_SPAN}world{$CLOSE_TAG_SPAN} and {$START_TAG_DIV}universe{$CLOSE_TAG_DIV}!':
                  'Bonjour {$START_TAG_DIV}univers{$CLOSE_TAG_DIV} et {$START_TAG_SPAN}monde{$CLOSE_TAG_SPAN}!'
            });
            const fixture = initWithTemplate(
                AppComp, `<div i18n>Hello <span>world</span> and <div>universe</div>!</div>`);
            expect(fixture.nativeElement.innerHTML)
                .toEqual(`<div>Bonjour <div>univers</div> et <span>monde</span>!</div>`);
          });

          it('should support template directives', () => {
            loadTranslations({
              'Content: {$START_TAG_DIV}before{$START_TAG_SPAN}middle{$CLOSE_TAG_SPAN}after{$CLOSE_TAG_DIV}!':
                  'Contenu: {$START_TAG_DIV}avant{$START_TAG_SPAN}milieu{$CLOSE_TAG_SPAN}après{$CLOSE_TAG_DIV}!'
            });
            const fixture = initWithTemplate(
                AppComp,
                `<div i18n>Content: <div *ngIf="visible">before<span>middle</span>after</div>!</div>`);
            expect(fixture.nativeElement.innerHTML)
                .toEqual(`<div>Contenu: <div>avant<span>milieu</span>après</div><!--bindings={
  "ng-reflect-ng-if": "true"
}-->!</div>`);

            fixture.componentRef.instance.visible = false;
            fixture.detectChanges();
            expect(fixture.nativeElement.innerHTML).toEqual(`<div>Contenu: <!--bindings={
  "ng-reflect-ng-if": "false"
}-->!</div>`);
          });

          it('should support multiple i18n blocks', () => {
            loadTranslations({
              'trad {$INTERPOLATION}': 'traduction {$INTERPOLATION}',
              'start {$INTERPOLATION} middle {$INTERPOLATION_1} end':
                  'start {$INTERPOLATION_1} middle {$INTERPOLATION} end',
              '{$START_TAG_C}trad{$CLOSE_TAG_C}{$START_TAG_D}{$CLOSE_TAG_D}{$START_TAG_E}{$CLOSE_TAG_E}':
                  '{$START_TAG_E}{$CLOSE_TAG_E}{$START_TAG_C}traduction{$CLOSE_TAG_C}'
            });
            const fixture = initWithTemplate(AppComp, `
      <div>
        <a i18n>trad {{name}}</a>
        hello
        <b i18n i18n-title title="start {{count}} middle {{name}} end">
          <c>trad</c>
          <d></d>
          <e></e>
        </b>
      </div>`);
            expect(fixture.nativeElement.innerHTML)
                .toEqual(
                    `<div><a>traduction Angular</a> hello <b title="start Angular middle 0 end"><e></e><c>traduction</c></b></div>`);
          });

          it('should support multiple sibling i18n blocks', () => {
            loadTranslations({
              'Section 1': 'Section un',
              'Section 2': 'Section deux',
              'Section 3': 'Section trois',
            });
            const fixture = initWithTemplate(AppComp, `
      <div>
        <div i18n>Section 1</div>
        <div i18n>Section 2</div>
        <div i18n>Section 3</div>
      </div>`);
            expect(fixture.nativeElement.innerHTML)
                .toEqual(
                    `<div><div>Section un</div><div>Section deux</div><div>Section trois</div></div>`);
          });

          it('should support multiple sibling i18n blocks inside of a template directive', () => {
            loadTranslations({
              'Section 1': 'Section un',
              'Section 2': 'Section deux',
              'Section 3': 'Section trois',
            });
            const fixture = initWithTemplate(AppComp, `
      <ul *ngFor="let item of [1,2,3]">
        <li i18n>Section 1</li>
        <li i18n>Section 2</li>
        <li i18n>Section 3</li>
      </ul>`);
            expect(fixture.nativeElement.innerHTML)
                .toEqual(
                    `<ul><li>Section un</li><li>Section deux</li><li>Section trois</li></ul><ul><li>Section un</li><li>Section deux</li><li>Section trois</li></ul><ul><li>Section un</li><li>Section deux</li><li>Section trois</li></ul><!--bindings={
  "ng-reflect-ng-for-of": "1,2,3"
}-->`);
          });

          it('should properly escape quotes in content', () => {
            loadTranslations({
              '\'Single quotes\' and "Double quotes"':
                  '\'Guillemets simples\' et "Guillemets doubles"'
            });
            const fixture =
                initWithTemplate(AppComp, `<div i18n>'Single quotes' and "Double quotes"</div>`);

            expect(fixture.nativeElement.innerHTML)
                .toEqual('<div>\'Guillemets simples\' et "Guillemets doubles"</div>');
          });

          it('should correctly bind to context in nested template', () => {
            loadTranslations({'Item {$INTERPOLATION}': 'Article {$INTERPOLATION}'});
            const fixture = initWithTemplate(AppComp, `
          <div *ngFor='let id of items'>
            <div i18n>Item {{ id }}</div>
          </div>
        `);

            const element = fixture.nativeElement;
            for (let i = 0; i < element.children.length; i++) {
              const child = element.children[i];
              expect(child).toHaveText(`Article ${i + 1}`);
            }
          });

          it('should ignore i18n attributes on self-closing tags', () => {
            const fixture = initWithTemplate(AppComp, '<img src="logo.png" i18n>');
            expect(fixture.nativeElement.innerHTML).toBe(`<img src="logo.png">`);
          });

          it('should handle i18n attribute with directives', () => {
            loadTranslations({'Hello {$INTERPOLATION}': 'Bonjour {$INTERPOLATION}'});
            const fixture =
                initWithTemplate(AppComp, `<div *ngIf="visible" i18n>Hello {{ name }}</div>`);
            expect(fixture.nativeElement.firstChild).toHaveText('Bonjour Angular');
          });

          it('should work correctly with event listeners', () => {
            loadTranslations({'Hello {$INTERPOLATION}': 'Bonjour {$INTERPOLATION}'});

            @Component({
              selector: 'app-comp',
              template: `<div i18n (click)="onClick()">Hello {{ name }}</div>`
            })
            class ListenerComp {
              name = `Angular`;
              clicks = 0;

              onClick() { this.clicks++; }
            }

            TestBed.configureTestingModule({declarations: [ListenerComp]});
            const fixture = TestBed.createComponent(ListenerComp);
            fixture.detectChanges();

            const element = fixture.nativeElement.firstChild;
            const instance = fixture.componentInstance;

            expect(element).toHaveText('Bonjour Angular');
            expect(instance.clicks).toBe(0);

            element.click();
            expect(instance.clicks).toBe(1);
          });

          describe('ng-container and ng-template support', () => {
            it('should support ng-container', () => {
              loadTranslations({'text': 'texte'});
              const fixture = initWithTemplate(AppComp, `<ng-container i18n>text</ng-container>`);
              expect(fixture.nativeElement.innerHTML).toEqual(`texte<!--ng-container-->`);
            });

            it('should handle single translation message within ng-template', () => {
              loadTranslations({'Hello {$INTERPOLATION}': 'Bonjour {$INTERPOLATION}'});
              const fixture = initWithTemplate(
                  AppComp, `<ng-template i18n tplRef>Hello {{ name }}</ng-template>`);

              const element = fixture.nativeElement;
              expect(element).toHaveText('Bonjour Angular');
            });

            // Note: applying structural directives to <ng-template> is typically user error, but it
            // is technically allowed, so we need to support it.
            it('should handle structural directives on ng-template', () => {
              loadTranslations({'Hello {$INTERPOLATION}': 'Bonjour {$INTERPOLATION}'});
              const fixture = initWithTemplate(
                  AppComp, `<ng-template *ngIf="name" i18n tplRef>Hello {{ name }}</ng-template>`);

              const element = fixture.nativeElement;
              expect(element).toHaveText('Bonjour Angular');
            });

            it('should be able to act as child elements inside i18n block (plain text content)', () => {
              loadTranslations({

                '{$START_TAG_NG_TEMPLATE} Hello {$CLOSE_TAG_NG_TEMPLATE}{$START_TAG_NG_CONTAINER} Bye {$CLOSE_TAG_NG_CONTAINER}':
                    '{$START_TAG_NG_TEMPLATE} Bonjour {$CLOSE_TAG_NG_TEMPLATE}{$START_TAG_NG_CONTAINER} Au revoir {$CLOSE_TAG_NG_CONTAINER}'
              });
              const fixture = initWithTemplate(AppComp, `
        <div i18n>
          <ng-template tplRef>
            Hello
          </ng-template>
          <ng-container>
            Bye
          </ng-container>
        </div>
      `);

              const element = fixture.nativeElement.firstChild;
              expect(element.textContent.replace(/\s+/g, ' ').trim()).toBe('Bonjour Au revoir');
            });

            it('should be able to act as child elements inside i18n block (text + tags)', () => {
              loadTranslations({

                '{$START_TAG_NG_TEMPLATE}{$START_TAG_SPAN}Hello{$CLOSE_TAG_SPAN}{$CLOSE_TAG_NG_TEMPLATE}{$START_TAG_NG_CONTAINER}{$START_TAG_SPAN}Hello{$CLOSE_TAG_SPAN}{$CLOSE_TAG_NG_CONTAINER}':
                    '{$START_TAG_NG_TEMPLATE}{$START_TAG_SPAN}Bonjour{$CLOSE_TAG_SPAN}{$CLOSE_TAG_NG_TEMPLATE}{$START_TAG_NG_CONTAINER}{$START_TAG_SPAN}Bonjour{$CLOSE_TAG_SPAN}{$CLOSE_TAG_NG_CONTAINER}'
              });
              const fixture = initWithTemplate(AppComp, `
        <div i18n>
          <ng-template tplRef>
            <span>Hello</span>
          </ng-template>
          <ng-container>
            <span>Hello</span>
          </ng-container>
        </div>
      `);

              const element = fixture.nativeElement;
              const spans = element.getElementsByTagName('span');
              for (let i = 0; i < spans.length; i++) {
                expect(spans[i]).toHaveText('Bonjour');
              }
            });

            it('should be able to act as child elements inside i18n block (text + pipes)', () => {
              // Note: for some reason keeping this key inline causes clang to reformat the entire
              // file
              // in a very weird way. Keeping it separated like this seems to make it happy.
              const key = '{$START_TAG_NG_TEMPLATE}Hello {$INTERPOLATION}{$CLOSE_TAG_NG_TEMPLATE}' +
                  '{$START_TAG_NG_CONTAINER}Bye {$INTERPOLATION}{$CLOSE_TAG_NG_CONTAINER}';

              loadTranslations({

                [key]:
                    '{$START_TAG_NG_TEMPLATE}Hej {$INTERPOLATION}{$CLOSE_TAG_NG_TEMPLATE}{$START_TAG_NG_CONTAINER}Vi ses {$INTERPOLATION}{$CLOSE_TAG_NG_CONTAINER}'
              });
              const fixture = initWithTemplate(AppComp, `
        <div i18n>
          <ng-template tplRef>Hello {{name | uppercase}}</ng-template>
          <ng-container>Bye {{name | uppercase}}</ng-container>
        </div>
      `);

              const element = fixture.nativeElement.firstChild;
              expect(element.textContent.replace(/\s+/g, ' ').trim())
                  .toBe('Hej ANGULARVi ses ANGULAR');
            });

            it('should be able to handle deep nested levels with templates', () => {
              loadTranslations({

                '{$START_TAG_SPAN} Hello - 1 {$CLOSE_TAG_SPAN}{$START_TAG_SPAN_1} Hello - 2 {$START_TAG_SPAN_1} Hello - 3 {$START_TAG_SPAN_1} Hello - 4 {$CLOSE_TAG_SPAN}{$CLOSE_TAG_SPAN}{$CLOSE_TAG_SPAN}{$START_TAG_SPAN} Hello - 5 {$CLOSE_TAG_SPAN}':
                    '{$START_TAG_SPAN} Bonjour - 1 {$CLOSE_TAG_SPAN}{$START_TAG_SPAN_1} Bonjour - 2 {$START_TAG_SPAN_1} Bonjour - 3 {$START_TAG_SPAN_1} Bonjour - 4 {$CLOSE_TAG_SPAN}{$CLOSE_TAG_SPAN}{$CLOSE_TAG_SPAN}{$START_TAG_SPAN} Bonjour - 5 {$CLOSE_TAG_SPAN}'
              });
              const fixture = initWithTemplate(AppComp, `
        <div i18n>
          <span>
            Hello - 1
          </span>
          <span *ngIf="visible">
            Hello - 2
            <span *ngIf="visible">
              Hello - 3
              <span *ngIf="visible">
                Hello - 4
              </span>
            </span>
          </span>
          <span>
            Hello - 5
          </span>
        </div>
      `);

              const element = fixture.nativeElement;
              const spans = element.getElementsByTagName('span');
              for (let i = 0; i < spans.length; i++) {
                expect(spans[i].innerHTML).toContain(`Bonjour - ${i + 1}`);
              }
            });

            it('should handle self-closing tags as content', () => {
              loadTranslations({

                '{$START_TAG_SPAN}My logo{$TAG_IMG}{$CLOSE_TAG_SPAN}':
                    '{$START_TAG_SPAN}Mon logo{$TAG_IMG}{$CLOSE_TAG_SPAN}'
              });
              const content = `My logo<img src="logo.png" title="Logo">`;
              const fixture = initWithTemplate(AppComp, `
        <ng-container i18n>
          <span>${content}</span>
        </ng-container>
        <ng-template i18n tplRef>
          <span>${content}</span>
        </ng-template>
      `);

              const element = fixture.nativeElement;
              const spans = element.getElementsByTagName('span');
              for (let i = 0; i < spans.length; i++) {
                const child = spans[i];
                expect(child).toHaveText('Mon logo');
              }
            });

            it('should correctly find context for an element inside i18n section in <ng-template>',
               () => {
                 @Directive({selector: '[myDir]'})
                 class Dir {
                   condition = true;
                 }

                 @Component({
                   selector: 'my-cmp',
                   template: `
              <div *ngIf="isLogged; else notLoggedIn">
                <span>Logged in</span>
              </div>
              <ng-template #notLoggedIn i18n>
                <a myDir>Not logged in</a>
              </ng-template>
            `,
                 })
                 class Cmp {
                   isLogged = false;
                 }

                 TestBed.configureTestingModule({
                   declarations: [Cmp, Dir],
                 });
                 const fixture = TestBed.createComponent(Cmp);
                 fixture.detectChanges();

                 const a = fixture.debugElement.query(By.css('a'));
                 const dir = a.injector.get(Dir);
                 expect(dir.condition).toEqual(true);
               });
          });

          describe('should support ICU expressions', () => {
            it('with no root node', () => {
              loadTranslations({

                '{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}':
                    '{VAR_SELECT, select, 10 {dix} 20 {vingt} other {autre}}'
              });
              const fixture =
                  initWithTemplate(AppComp, `{count, select, 10 {ten} 20 {twenty} other {other}}`);

              const element = fixture.nativeElement;
              expect(element).toHaveText('autre');
            });

            it('with no i18n tag', () => {
              loadTranslations({

                '{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}':
                    '{VAR_SELECT, select, 10 {dix} 20 {vingt} other {autre}}'
              });
              const fixture = initWithTemplate(
                  AppComp, `<div>{count, select, 10 {ten} 20 {twenty} other {other}}</div>`);

              const element = fixture.nativeElement;
              expect(element).toHaveText('autre');
            });

            it('multiple', () => {
              loadTranslations({

                '{VAR_PLURAL, plural, =0 {no {START_BOLD_TEXT}emails{CLOSE_BOLD_TEXT}!} =1 {one {START_ITALIC_TEXT}email{CLOSE_ITALIC_TEXT}} other {{INTERPOLATION} {START_TAG_SPAN}emails{CLOSE_TAG_SPAN}}}':
                    '{VAR_PLURAL, plural, =0 {aucun {START_BOLD_TEXT}email{CLOSE_BOLD_TEXT}!} =1 {un {START_ITALIC_TEXT}email{CLOSE_ITALIC_TEXT}} other {{INTERPOLATION} {START_TAG_SPAN}emails{CLOSE_TAG_SPAN}}}',
                '{VAR_SELECT, select, other {(name)}}':
                    '{VAR_SELECT, select, other {({$INTERPOLATION})}}'
              });
              const fixture = initWithTemplate(AppComp, `<div i18n>{count, plural,
        =0 {no <b>emails</b>!}
        =1 {one <i>email</i>}
        other {{{count}} <span title="{{name}}">emails</span>}
      } - {name, select,
        other {({{name}})}
      }</div>`);
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(`<div>aucun <b>email</b>!<!--ICU 7--> - (Angular)<!--ICU 13--></div>`);

              fixture.componentRef.instance.count = 4;
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(
                      `<div>4 <span title="Angular">emails</span><!--ICU 7--> - (Angular)<!--ICU 13--></div>`);

              fixture.componentRef.instance.count = 0;
              fixture.componentRef.instance.name = 'John';
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(`<div>aucun <b>email</b>!<!--ICU 7--> - (John)<!--ICU 13--></div>`);
            });

            it('with custom interpolation config', () => {
              loadTranslations({

                '{VAR_SELECT, select, 10 {ten} other {{$INTERPOLATION}}}':
                    '{VAR_SELECT, select, 10 {dix} other {{$INTERPOLATION}}}'
              });
              const interpolation = ['{%', '%}'] as[string, string];
              TestBed.overrideComponent(AppComp, {set: {interpolation}});
              const fixture = initWithTemplate(
                  AppComp, `<div i18n>{count, select, 10 {ten} other {{% name %}}}</div>`);

              expect(fixture.nativeElement).toHaveText(`Angular`);
            });

            it('inside HTML elements', () => {
              loadTranslations({

                '{VAR_PLURAL, plural, =0 {no {START_BOLD_TEXT}emails{CLOSE_BOLD_TEXT}!} =1 {one {START_ITALIC_TEXT}email{CLOSE_ITALIC_TEXT}} other {{INTERPOLATION} {START_TAG_SPAN}emails{CLOSE_TAG_SPAN}}}':
                    '{VAR_PLURAL, plural, =0 {aucun {START_BOLD_TEXT}email{CLOSE_BOLD_TEXT}!} =1 {un {START_ITALIC_TEXT}email{CLOSE_ITALIC_TEXT}} other {{INTERPOLATION} {START_TAG_SPAN}emails{CLOSE_TAG_SPAN}}}',
                '{VAR_SELECT, select, other {(name)}}':
                    '{VAR_SELECT, select, other {({$INTERPOLATION})}}'
              });
              const fixture = initWithTemplate(AppComp, `<div i18n><span>{count, plural,
        =0 {no <b>emails</b>!}
        =1 {one <i>email</i>}
        other {{{count}} <span title="{{name}}">emails</span>}
      }</span> - <span>{name, select,
        other {({{name}})}
      }</span></div>`);
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(
                      `<div><span>aucun <b>email</b>!<!--ICU 9--></span> - <span>(Angular)<!--ICU 15--></span></div>`);

              fixture.componentRef.instance.count = 4;
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(
                      `<div><span>4 <span title="Angular">emails</span><!--ICU 9--></span> - <span>(Angular)<!--ICU 15--></span></div>`);

              fixture.componentRef.instance.count = 0;
              fixture.componentRef.instance.name = 'John';
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(
                      `<div><span>aucun <b>email</b>!<!--ICU 9--></span> - <span>(John)<!--ICU 15--></span></div>`);
            });

            it('inside template directives', () => {
              loadTranslations({

                '{VAR_SELECT, select, other {(name)}}':
                    '{VAR_SELECT, select, other {({$INTERPOLATION})}}'
              });
              const fixture =
                  initWithTemplate(AppComp, `<div i18n><span *ngIf="visible">{name, select,
        other {({{name}})}
      }</span></div>`);
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(`<div><span>(Angular)<!--ICU 4--></span><!--bindings={
  "ng-reflect-ng-if": "true"
}--></div>`);

              fixture.componentRef.instance.visible = false;
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML).toEqual(`<div><!--bindings={
  "ng-reflect-ng-if": "false"
}--></div>`);
            });

            it('inside ng-container', () => {
              loadTranslations({

                '{VAR_SELECT, select, other {(name)}}':
                    '{VAR_SELECT, select, other {({$INTERPOLATION})}}'
              });
              const fixture = initWithTemplate(AppComp, `<ng-container i18n>{name, select,
        other {({{name}})}
      }</ng-container>`);
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(`(Angular)<!--ICU 4--><!--ng-container-->`);
            });

            it('inside <ng-template>', () => {
              loadTranslations({

                '{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}':
                    '{VAR_SELECT, select, 10 {dix} 20 {vingt} other {autre}}'
              });
              const fixture = initWithTemplate(
                  AppComp, `
        <ng-template i18n tplRef>` +
                      `{count, select, 10 {ten} 20 {twenty} other {other}}` +
                      `</ng-template>
      `);

              const element = fixture.nativeElement;
              expect(element).toHaveText('autre');
            });

            it('nested', () => {
              loadTranslations({

                '{VAR_PLURAL, plural, =0 {zero} other {{INTERPOLATION} {VAR_SELECT, select, cat {cats} dog {dogs} other {animals}}!}}':
                    '{VAR_PLURAL, plural, =0 {zero} other {{INTERPOLATION} {VAR_SELECT, select, cat {chats} dog {chients} other {animaux}}!}}'
              });
              const fixture = initWithTemplate(AppComp, `<div i18n>{count, plural,
        =0 {zero}
        other {{{count}} {name, select,
                       cat {cats}
                       dog {dogs}
                       other {animals}
                     }!}
      }</div>`);
              expect(fixture.nativeElement.innerHTML).toEqual(`<div>zero<!--ICU 5--></div>`);

              fixture.componentRef.instance.count = 4;
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(`<div>4 animaux<!--nested ICU 0-->!<!--ICU 5--></div>`);
            });

            it('nested with interpolations in "other" blocks', () => {
              // Note: for some reason long string causing clang to reformat the entire file.
              const key =
                  '{VAR_PLURAL, plural, =0 {zero} =2 {{INTERPOLATION} {VAR_SELECT, select, ' +
                  'cat {cats} dog {dogs} other {animals}}!} other {other - {INTERPOLATION}}}';
              const translation =
                  '{VAR_PLURAL, plural, =0 {zero} =2 {{INTERPOLATION} {VAR_SELECT, select, ' +
                  'cat {chats} dog {chients} other {animaux}}!} other {other - {INTERPOLATION}}}';
              loadTranslations({[key]: translation});

              const fixture = initWithTemplate(AppComp, `<div i18n>{count, plural,
        =0 {zero}
        =2 {{{count}} {name, select,
                       cat {cats}
                       dog {dogs}
                       other {animals}
                     }!}
        other {other - {{count}}}
      }</div>`);
              expect(fixture.nativeElement.innerHTML).toEqual(`<div>zero<!--ICU 5--></div>`);

              fixture.componentRef.instance.count = 2;
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(`<div>2 animaux<!--nested ICU 0-->!<!--ICU 5--></div>`);

              fixture.componentRef.instance.count = 4;
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML).toEqual(`<div>other - 4<!--ICU 5--></div>`);
            });

            it('should return the correct plural form for ICU expressions when using a specific locale',
               () => {
                 registerLocaleData(localeRo);
                 TestBed.configureTestingModule(
                     {providers: [{provide: LOCALE_ID, useValue: 'ro'}]});
                 // We could also use `TestBed.overrideProvider(LOCALE_ID, {useValue: 'ro'});`
                 const fixture = initWithTemplate(AppComp, `
          {count, plural,
            =0 {no email}
            =one {one email}
            =few {a few emails}
            =other {lots of emails}
          }`);

                 expect(fixture.nativeElement.innerHTML).toEqual('no email<!--ICU 2-->');

                 // Change detection cycle, no model changes
                 fixture.detectChanges();
                 expect(fixture.nativeElement.innerHTML).toEqual('no email<!--ICU 2-->');

                 fixture.componentInstance.count = 3;
                 fixture.detectChanges();
                 expect(fixture.nativeElement.innerHTML).toEqual('a few emails<!--ICU 2-->');

                 fixture.componentInstance.count = 1;
                 fixture.detectChanges();
                 expect(fixture.nativeElement.innerHTML).toEqual('one email<!--ICU 2-->');

                 fixture.componentInstance.count = 10;
                 fixture.detectChanges();
                 expect(fixture.nativeElement.innerHTML).toEqual('a few emails<!--ICU 2-->');

                 fixture.componentInstance.count = 20;
                 fixture.detectChanges();
                 expect(fixture.nativeElement.innerHTML).toEqual('lots of emails<!--ICU 2-->');

                 fixture.componentInstance.count = 0;
                 fixture.detectChanges();
                 expect(fixture.nativeElement.innerHTML).toEqual('no email<!--ICU 2-->');
               });

            it('projection', () => {
              @Component({selector: 'child', template: '<div><ng-content></ng-content></div>'})
              class Child {
              }

              @Component({
                selector: 'parent',
                template: `
      <child i18n>{
        value // i18n(ph = "blah"),
        plural,
         =1 {one}
        other {at least {{value}} .}
      }</child>`
              })
              class Parent {
                value = 3;
              }
              TestBed.configureTestingModule({declarations: [Parent, Child]});
              loadTranslations({});

              const fixture = TestBed.createComponent(Parent);
              fixture.detectChanges();

              expect(fixture.nativeElement.innerHTML).toContain('at least');
            });

            it('with empty values', () => {
              const fixture =
                  initWithTemplate(AppComp, `{count, select, 10 {} 20 {twenty} other {other}}`);

              const element = fixture.nativeElement;
              expect(element).toHaveText('other');
            });

            it('inside a container when creating a view via vcr.createEmbeddedView', () => {
              @Directive({
                selector: '[someDir]',
              })
              class Dir {
                constructor(
                    private readonly viewContainerRef: ViewContainerRef,
                    private readonly templateRef: TemplateRef<any>) {}

                ngOnInit() { this.viewContainerRef.createEmbeddedView(this.templateRef); }
              }

              @Component({
                selector: 'my-cmp',
                template: `
              <div *someDir>
                <ng-content></ng-content>
              </div>
            `,
              })
              class Cmp {
              }

              @Component({
                selector: 'my-app',
                template: `
            <my-cmp i18n="test" *ngIf="condition">{
              count,
              plural,
              =1 {ONE}
              other {OTHER}
            }</my-cmp>
          `,
              })
              class App {
                count = 1;
                condition = true;
              }

              TestBed.configureTestingModule({
                declarations: [App, Cmp, Dir],
              });
              const fixture = TestBed.createComponent(App);
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement.innerHTML)
                  .toContain('<my-cmp><div>ONE<!--ICU 13--></div><!--container--></my-cmp>');

              fixture.componentRef.instance.count = 2;
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement.innerHTML)
                  .toContain('<my-cmp><div>OTHER<!--ICU 13--></div><!--container--></my-cmp>');

              // destroy component
              fixture.componentInstance.condition = false;
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement.textContent).toBe('');

              // render it again and also change ICU case
              fixture.componentInstance.condition = true;
              fixture.componentInstance.count = 1;
              fixture.detectChanges();
              expect(fixture.debugElement.nativeElement.innerHTML)
                  .toContain('<my-cmp><div>ONE<!--ICU 13--></div><!--container--></my-cmp>');
            });

            it('with nested ICU expression and inside a container when creating a view via vcr.createEmbeddedView',
               () => {
                 let dir: Dir|null = null;
                 @Directive({
                   selector: '[someDir]',
                 })
                 class Dir {
                   constructor(
                       private readonly viewContainerRef: ViewContainerRef,
                       private readonly templateRef: TemplateRef<any>) {
                     dir = this;
                   }

                   attachEmbeddedView() {
                     this.viewContainerRef.createEmbeddedView(this.templateRef);
                   }
                 }

                 @Component({
                   selector: 'my-cmp',
                   template: `
              <div *someDir>
                <ng-content></ng-content>
              </div>
            `,
                 })
                 class Cmp {
                 }

                 @Component({
                   selector: 'my-app',
                   template: `
            <my-cmp i18n="test">{
              count,
              plural,
              =1 {ONE}
              other {{{count}} {name, select,
                cat {cats}
                dog {dogs}
                other {animals}
              }!}
            }</my-cmp>
          `,
                 })
                 class App {
                   count = 1;
                 }

                 TestBed.configureTestingModule({
                   declarations: [App, Cmp, Dir],
                 });
                 const fixture = TestBed.createComponent(App);
                 fixture.componentRef.instance.count = 2;
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement.innerHTML)
                     .toBe('<my-cmp><!--container--></my-cmp>');

                 dir !.attachEmbeddedView();
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement.innerHTML)
                     .toBe(
                         '<my-cmp><div>2 animals<!--nested ICU 0-->!<!--ICU 15--></div><!--container--></my-cmp>');

                 fixture.componentRef.instance.count = 1;
                 fixture.detectChanges();
                 expect(fixture.debugElement.nativeElement.innerHTML)
                     .toBe('<my-cmp><div>ONE<!--ICU 15--></div><!--container--></my-cmp>');
               });

            it('with nested containers', () => {
              @Component({
                selector: 'comp',
                template: `
        <ng-container [ngSwitch]="visible">
          <ng-container *ngSwitchCase="isVisible()" i18n>
            {type, select, A { A } B { B } other { C }}
          </ng-container>
          <ng-container *ngSwitchCase="!isVisible()" i18n>
            {type, select, A1 { A1 } B1 { B1 } other { C1 }}
          </ng-container>
        </ng-container>
      `,
              })
              class Comp {
                type = 'A';
                visible = true;
                isVisible() { return true; }
              }

              TestBed.configureTestingModule({declarations: [Comp]});

              const fixture = TestBed.createComponent(Comp);
              fixture.detectChanges();

              expect(fixture.debugElement.nativeElement.innerHTML).toContain('A');

              fixture.componentInstance.visible = false;
              fixture.detectChanges();

              expect(fixture.debugElement.nativeElement.innerHTML).not.toContain('A');
              expect(fixture.debugElement.nativeElement.innerHTML).toContain('C1');
            });

            it('with named interpolations', () => {
              @Component({
                selector: 'comp',
                template: `
          <ng-container i18n>{
            type,
            select,
              A {A - {{ typeA // i18n(ph="PH_A") }}}
              B {B - {{ typeB // i18n(ph="PH_B") }}}
              other {other - {{ typeC // i18n(ph="PH WITH SPACES") }}}
          }</ng-container>
        `,
              })
              class Comp {
                type = 'A';
                typeA = 'Type A';
                typeB = 'Type B';
                typeC = 'Type C';
              }

              TestBed.configureTestingModule({declarations: [Comp]});

              const fixture = TestBed.createComponent(Comp);
              fixture.detectChanges();

              expect(fixture.debugElement.nativeElement.innerHTML).toContain('A - Type A');

              fixture.componentInstance.type = 'C';  // trigger "other" case
              fixture.detectChanges();

              expect(fixture.debugElement.nativeElement.innerHTML).not.toContain('A - Type A');
              expect(fixture.debugElement.nativeElement.innerHTML).toContain('other - Type C');
            });

            it('should work inside an ngTemplateOutlet inside an ngFor', () => {
              @Component({
                selector: 'app',
                template: `
          <ng-template #myTemp i18n let-type>{
            type,
            select,
            A {A }
            B {B }
            other {other - {{ typeC // i18n(ph="PH WITH SPACES") }}}
          }
          </ng-template>

          <div *ngFor="let type of types">
            <ng-container *ngTemplateOutlet="myTemp; context: {$implicit: type}">
            </ng-container>
          </div>
        `
              })
              class AppComponent {
                types = ['A', 'B', 'C'];
              }

              TestBed.configureTestingModule({declarations: [AppComponent]});

              const fixture = TestBed.createComponent(AppComponent);
              fixture.detectChanges();

              expect(fixture.debugElement.nativeElement.innerHTML).toContain('A');
              expect(fixture.debugElement.nativeElement.innerHTML).toContain('B');
            });
          });

          describe('should support attributes', () => {
            it('text', () => {
              loadTranslations({'text': 'texte'});
              const fixture = initWithTemplate(AppComp, `<div i18n i18n-title title="text"></div>`);
              expect(fixture.nativeElement.innerHTML).toEqual(`<div title="texte"></div>`);
            });

            it('interpolations', () => {
              loadTranslations({'hello {$INTERPOLATION}': 'bonjour {$INTERPOLATION}'});
              const fixture =
                  initWithTemplate(AppComp, `<div i18n i18n-title title="hello {{name}}"></div>`);
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(`<div title="bonjour Angular"></div>`);

              fixture.componentRef.instance.name = 'John';
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML).toEqual(`<div title="bonjour John"></div>`);
            });

            it('with pipes', () => {
              loadTranslations({'hello {$INTERPOLATION}': 'bonjour {$INTERPOLATION}'});
              const fixture = initWithTemplate(
                  AppComp, `<div i18n i18n-title title="hello {{name | uppercase}}"></div>`);
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(`<div title="bonjour ANGULAR"></div>`);
            });

            it('multiple attributes', () => {
              loadTranslations({'hello {$INTERPOLATION}': 'bonjour {$INTERPOLATION}'});
              const fixture = initWithTemplate(
                  AppComp,
                  `<input i18n i18n-title title="hello {{name}}" i18n-placeholder placeholder="hello {{name}}">`);
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(`<input title="bonjour Angular" placeholder="bonjour Angular">`);

              fixture.componentRef.instance.name = 'John';
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(`<input title="bonjour John" placeholder="bonjour John">`);
            });

            it('on removed elements', () => {
              loadTranslations(
                  {'text': 'texte', '{$START_TAG_SPAN}content{$CLOSE_TAG_SPAN}': 'contenu'});
              const fixture = initWithTemplate(
                  AppComp, `<div i18n><span i18n-title title="text">content</span></div>`);
              expect(fixture.nativeElement.innerHTML).toEqual(`<div>contenu</div>`);
            });

            it('with custom interpolation config', () => {
              loadTranslations({'Hello {$INTERPOLATION}': 'Bonjour {$INTERPOLATION}'});
              const interpolation = ['{%', '%}'] as[string, string];
              TestBed.overrideComponent(AppComp, {set: {interpolation}});
              const fixture = initWithTemplate(
                  AppComp, `<div i18n-title="m|d" title="Hello {% name %}"></div>`);

              const element = fixture.nativeElement.firstChild;
              expect(element.title).toBe('Bonjour Angular');
            });

            it('in nested template', () => {
              loadTranslations({'Item {$INTERPOLATION}': 'Article {$INTERPOLATION}'});
              const fixture = initWithTemplate(AppComp, `
          <div *ngFor='let item of [1,2,3]'>
            <div i18n-title='m|d' title='Item {{ item }}'></div>
          </div>`);

              const element = fixture.nativeElement;
              for (let i = 0; i < element.children.length; i++) {
                const child = element.children[i];
                expect((child as any).innerHTML).toBe(`<div title="Article ${i + 1}"></div>`);
              }
            });

            it('should add i18n attributes on self-closing tags', () => {
              loadTranslations({'Hello {$INTERPOLATION}': 'Bonjour {$INTERPOLATION}'});
              const fixture = initWithTemplate(
                  AppComp, `<img src="logo.png" i18n-title title="Hello {{ name }}">`);

              const element = fixture.nativeElement.firstChild;
              expect(element.title).toBe('Bonjour Angular');
            });

            it('should apply i18n attributes during second template pass', () => {
              @Directive({
                selector: '[test]',
                inputs: ['test'],
                exportAs: 'dir',
              })
              class Dir {
              }

              @Component({
                selector: 'other',
                template: `<div i18n #ref="dir" test="Set" i18n-test="This is also a test"></div>`
              })
              class Other {
              }

              @Component({
                selector: 'blah',
                template: `
          <other></other>
          <other></other>
        `
              })
              class Cmp {
              }

              TestBed.configureTestingModule({
                declarations: [Dir, Cmp, Other],
              });

              const fixture = TestBed.createComponent(Cmp);
              fixture.detectChanges();
              expect(fixture.debugElement.children[0].children[0].references.ref.test).toBe('Set');
              expect(fixture.debugElement.children[1].children[0].references.ref.test).toBe('Set');
            });

            it('with complex expressions', () => {
              loadTranslations({
                '{$INTERPOLATION} - {$INTERPOLATION_1} - {$INTERPOLATION_2}':
                    '{$INTERPOLATION} - {$INTERPOLATION_1} - {$INTERPOLATION_2} (fr)'
              });
              const fixture = initWithTemplate(AppComp, `
        <div i18n-title title="{{ name | uppercase }} - {{ obj?.a?.b }} - {{ obj?.getA()?.b }}"></div>
      `);
              // the `obj` field is not yet defined, so 2nd and 3rd interpolations return empty
              // strings
              expect(fixture.nativeElement.firstChild.title).toEqual(`ANGULAR -  -  (fr)`);

              fixture.componentRef.instance.obj = {
                a: {b: 'value 1'},
                getA: () => ({b: 'value 2'}),
              };
              fixture.detectChanges();
              expect(fixture.nativeElement.firstChild.title)
                  .toEqual(`ANGULAR - value 1 - value 2 (fr)`);
            });
          });

          it('should work with directives and host bindings', () => {
            let directiveInstances: ClsDir[] = [];

            @Directive({selector: '[test]'})
            class ClsDir {
              @HostBinding('className')
              klass = 'foo';

              constructor() { directiveInstances.push(this); }
            }

            @Component({
              selector: `my-app`,
              template: `
      <div i18n test i18n-title title="start {{exp1}} middle {{exp2}} end">
         trad: {exp1, plural,
              =0 {no <b title="none">emails</b>!}
              =1 {one <i>email</i>}
              other {{{exp1}} emails}
         }
      </div><div test></div>`
            })
            class MyApp {
              exp1 = 1;
              exp2 = 2;
            }

            TestBed.configureTestingModule({declarations: [ClsDir, MyApp]});
            loadTranslations({
              // Not that this translation switches the order of the expressions!
              'start {$INTERPOLATION} middle {$INTERPOLATION_1} end':
                  'début {$INTERPOLATION_1} milieu {$INTERPOLATION} fin',
              '{VAR_PLURAL, plural, =0 {no {START_BOLD_TEXT}emails{CLOSE_BOLD_TEXT}!} =1 {one {START_ITALIC_TEXT}email{CLOSE_ITALIC_TEXT}} other {{INTERPOLATION} emails}}':
                  '{VAR_PLURAL, plural, =0 {aucun {START_BOLD_TEXT}email{CLOSE_BOLD_TEXT}!} =1 {un {START_ITALIC_TEXT}email{CLOSE_ITALIC_TEXT}} other {{INTERPOLATION} emails}}',
              ' trad: {$ICU} ': ' traduction: {$ICU} '
            });
            const fixture = TestBed.createComponent(MyApp);
            fixture.detectChanges();
            expect(fixture.nativeElement.innerHTML)
                .toEqual(
                    `<div test="" title="début 2 milieu 1 fin" class="foo"> traduction: un <i>email</i><!--ICU 20--> ` +
                    `</div><div test="" class="foo"></div>`);

            directiveInstances.forEach(instance => instance.klass = 'bar');
            fixture.componentRef.instance.exp1 = 2;
            fixture.componentRef.instance.exp2 = 3;
            fixture.detectChanges();
            expect(fixture.nativeElement.innerHTML)
                .toEqual(
                    `<div test="" title="début 3 milieu 2 fin" class="bar"> traduction: 2 emails<!--ICU 20--> ` +
                    `</div><div test="" class="bar"></div>`);
          });

          it('should handle i18n attribute with directive inputs', () => {
            let calledTitle = false;
            let calledValue = false;
            @Component({selector: 'my-comp', template: ''})
            class MyComp {
              t !: string;
              @Input()
              get title() { return this.t; }
              set title(title) {
                calledTitle = true;
                this.t = title;
              }

              @Input()
              get value() { return this.val; }
              set value(value: string) {
                calledValue = true;
                this.val = value;
              }
              val !: string;
            }

            TestBed.configureTestingModule({declarations: [AppComp, MyComp]});
            loadTranslations(
                {'Hello {$INTERPOLATION}': 'Bonjour {$INTERPOLATION}', 'works': 'fonctionne'});
            const fixture = initWithTemplate(
                AppComp,
                `<my-comp i18n i18n-title title="works" i18n-value="hi" value="Hello {{name}}"></my-comp>`);
            fixture.detectChanges();

            const directive = fixture.debugElement.children[0].injector.get(MyComp);
            expect(calledValue).toEqual(true);
            expect(calledTitle).toEqual(true);
            expect(directive.value).toEqual(`Bonjour Angular`);
            expect(directive.title).toEqual(`fonctionne`);
          });

          it('should support adding/moving/removing nodes', () => {
            loadTranslations({
              '{$START_TAG_DIV2}{$CLOSE_TAG_DIV2}{$START_TAG_DIV3}{$CLOSE_TAG_DIV3}{$START_TAG_DIV4}{$CLOSE_TAG_DIV4}{$START_TAG_DIV5}{$CLOSE_TAG_DIV5}{$START_TAG_DIV6}{$CLOSE_TAG_DIV6}{$START_TAG_DIV7}{$CLOSE_TAG_DIV7}{$START_TAG_DIV8}{$CLOSE_TAG_DIV8}':
                  '{$START_TAG_DIV2}{$CLOSE_TAG_DIV2}{$START_TAG_DIV8}{$CLOSE_TAG_DIV8}{$START_TAG_DIV4}{$CLOSE_TAG_DIV4}{$START_TAG_DIV5}{$CLOSE_TAG_DIV5}Bonjour monde{$START_TAG_DIV3}{$CLOSE_TAG_DIV3}{$START_TAG_DIV7}{$CLOSE_TAG_DIV7}'
            });
            const fixture = initWithTemplate(AppComp, `
      <div i18n>
        <div2></div2>
        <div3></div3>
        <div4></div4>
        <div5></div5>
        <div6></div6>
        <div7></div7>
        <div8></div8>
      </div>`);
            expect(fixture.nativeElement.innerHTML)
                .toEqual(
                    `<div><div2></div2><div8></div8><div4></div4><div5></div5>Bonjour monde<div3></div3><div7></div7></div>`);
          });

          describe('projection', () => {
            it('should project the translations', () => {
              @Component({selector: 'child', template: '<p><ng-content></ng-content></p>'})
              class Child {
              }

              @Component({
                selector: 'parent',
                template: `
            <div i18n>
              <child>I am projected from
                <b i18n-title title="Child of {{name}}">{{name}}<remove-me-1></remove-me-1></b>
                <remove-me-2></remove-me-2>
              </child>
              <remove-me-3></remove-me-3>
            </div>`
              })
              class Parent {
                name: string = 'Parent';
              }
              TestBed.configureTestingModule({declarations: [Parent, Child]});
              loadTranslations({

                'Child of {$INTERPOLATION}': 'Enfant de {$INTERPOLATION}',
                '{$START_TAG_CHILD}I am projected from {$START_BOLD_TEXT}{$INTERPOLATION}{$START_TAG_REMOVE_ME_1}{$CLOSE_TAG_REMOVE_ME_1}{$CLOSE_BOLD_TEXT}{$START_TAG_REMOVE_ME_2}{$CLOSE_TAG_REMOVE_ME_2}{$CLOSE_TAG_CHILD}{$START_TAG_REMOVE_ME_3}{$CLOSE_TAG_REMOVE_ME_3}':
                    '{$START_TAG_CHILD}Je suis projeté depuis {$START_BOLD_TEXT}{$INTERPOLATION}{$CLOSE_BOLD_TEXT}{$CLOSE_TAG_CHILD}'
              });
              const fixture = TestBed.createComponent(Parent);
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(
                      `<div><child><p>Je suis projeté depuis <b title="Enfant de Parent">Parent</b></p></child></div>`);
            });

            it('should project a translated i18n block', () => {
              @Component({selector: 'child', template: '<p><ng-content></ng-content></p>'})
              class Child {
              }

              @Component({
                selector: 'parent',
                template: `
          <div>
            <child>
              <any></any>
              <b i18n i18n-title title="Child of {{name}}">I am projected from {{name}}</b>
              <any></any>
            </child>
          </div>`
              })
              class Parent {
                name: string = 'Parent';
              }
              TestBed.configureTestingModule({declarations: [Parent, Child]});
              loadTranslations({

                'Child of {$INTERPOLATION}': 'Enfant de {$INTERPOLATION}',
                'I am projected from {$INTERPOLATION}': 'Je suis projeté depuis {$INTERPOLATION}'
              });
              const fixture = TestBed.createComponent(Parent);
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(
                      `<div><child><p><any></any><b title="Enfant de Parent">Je suis projeté depuis Parent</b><any></any></p></child></div>`);

              // it should be able to render a new component with the same template code
              const fixture2 = TestBed.createComponent(Parent);
              fixture2.detectChanges();
              expect(fixture.nativeElement.innerHTML).toEqual(fixture2.nativeElement.innerHTML);

              fixture2.componentRef.instance.name = 'Parent 2';
              fixture2.detectChanges();
              expect(fixture2.nativeElement.innerHTML)
                  .toEqual(
                      `<div><child><p><any></any><b title="Enfant de Parent 2">Je suis projeté depuis Parent 2</b><any></any></p></child></div>`);

              // The first fixture should not have changed
              expect(fixture.nativeElement.innerHTML).not.toEqual(fixture2.nativeElement.innerHTML);
            });

            it('should re-project translations when multiple projections', () => {
              @Component(
                  {selector: 'grand-child', template: '<div><ng-content></ng-content></div>'})
              class GrandChild {
              }

              @Component({
                selector: 'child',
                template: '<grand-child><ng-content></ng-content></grand-child>'
              })
              class Child {
              }

              @Component({selector: 'parent', template: `<child i18n><b>Hello</b> World!</child>`})
              class Parent {
                name: string = 'Parent';
              }

              TestBed.configureTestingModule({declarations: [Parent, Child, GrandChild]});
              loadTranslations({

                '{$START_BOLD_TEXT}Hello{$CLOSE_BOLD_TEXT} World!':
                    '{$START_BOLD_TEXT}Bonjour{$CLOSE_BOLD_TEXT} monde!'
              });
              const fixture = TestBed.createComponent(Parent);
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(
                      '<child><grand-child><div><b>Bonjour</b> monde!</div></grand-child></child>');
            });

            it('should be able to remove projected placeholders', () => {
              @Component(
                  {selector: 'grand-child', template: '<div><ng-content></ng-content></div>'})
              class GrandChild {
              }

              @Component({
                selector: 'child',
                template: '<grand-child><ng-content></ng-content></grand-child>'
              })
              class Child {
              }

              @Component({selector: 'parent', template: `<child i18n><b>Hello</b> World!</child>`})
              class Parent {
                name: string = 'Parent';
              }

              TestBed.configureTestingModule({declarations: [Parent, Child, GrandChild]});
              loadTranslations(
                  {'{$START_BOLD_TEXT}Hello{$CLOSE_BOLD_TEXT} World!': 'Bonjour monde!'});
              const fixture = TestBed.createComponent(Parent);
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual('<child><grand-child><div>Bonjour monde!</div></grand-child></child>');
            });

            it('should project translations with selectors', () => {
              @Component({selector: 'child', template: `<ng-content select="span"></ng-content>`})
              class Child {
              }

              @Component({
                selector: 'parent',
                template: `
          <child i18n>
            <span title="keepMe"></span>
            <span title="deleteMe"></span>
          </child>
        `
              })
              class Parent {
              }

              TestBed.configureTestingModule({declarations: [Parent, Child]});
              loadTranslations({

                '{$START_TAG_SPAN}{$CLOSE_TAG_SPAN}{$START_TAG_SPAN_1}{$CLOSE_TAG_SPAN}':
                    '{$START_TAG_SPAN}Contenu{$CLOSE_TAG_SPAN}'
              });
              const fixture = TestBed.createComponent(Parent);
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual('<child><span title="keepMe">Contenu</span></child>');
            });

            it('should project content in i18n blocks', () => {
              @Component({
                selector: 'child',
                template: `<div i18n>Content projected from <ng-content></ng-content></div>`
              })
              class Child {
              }

              @Component({selector: 'parent', template: `<child>{{name}}</child>`})
              class Parent {
                name: string = 'Parent';
              }
              TestBed.configureTestingModule({declarations: [Parent, Child]});
              loadTranslations({

                'Content projected from {$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT}':
                    'Contenu projeté depuis {$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT}'
              });

              const fixture = TestBed.createComponent(Parent);
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(`<child><div>Contenu projeté depuis Parent</div></child>`);

              fixture.componentRef.instance.name = 'Parent component';
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(`<child><div>Contenu projeté depuis Parent component</div></child>`);
            });

            it('should project content in i18n blocks with placeholders', () => {
              @Component({
                selector: 'child',
                template: `<div i18n>Content projected from <ng-content></ng-content></div>`
              })
              class Child {
              }

              @Component({selector: 'parent', template: `<child><b>{{name}}</b></child>`})
              class Parent {
                name: string = 'Parent';
              }
              TestBed.configureTestingModule({declarations: [Parent, Child]});
              loadTranslations({

                'Content projected from {$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT}':
                    '{$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT} a projeté le contenu'
              });
              const fixture = TestBed.createComponent(Parent);
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(`<child><div><b>Parent</b> a projeté le contenu</div></child>`);
            });

            it('should project translated content in i18n blocks', () => {
              @Component({
                selector: 'child',
                template: `<div i18n>Child content <ng-content></ng-content></div>`
              })
              class Child {
              }

              @Component({
                selector: 'parent',
                template: `<child i18n>and projection from {{name}}</child>`
              })
              class Parent {
                name: string = 'Parent';
              }
              TestBed.configureTestingModule({declarations: [Parent, Child]});
              loadTranslations({

                'Child content {$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT}':
                    'Contenu enfant {$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT}',
                'and projection from {$INTERPOLATION}': 'et projection depuis {$INTERPOLATION}'
              });
              const fixture = TestBed.createComponent(Parent);
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(`<child><div>Contenu enfant et projection depuis Parent</div></child>`);
            });

            it('should project bare ICU expressions', () => {
              @Component({selector: 'child', template: '<div><ng-content></ng-content></div>'})
              class Child {
              }

              @Component({
                selector: 'parent',
                template: `
      <child i18n>{
        value // i18n(ph = "blah"),
        plural,
         =1 {one}
        other {at least {{value}} .}
      }</child>`
              })
              class Parent {
                value = 3;
              }
              TestBed.configureTestingModule({declarations: [Parent, Child]});
              loadTranslations({});

              const fixture = TestBed.createComponent(Parent);
              fixture.detectChanges();

              expect(fixture.nativeElement.innerHTML).toContain('at least');
            });

            it('should project ICUs in i18n blocks', () => {
              @Component({
                selector: 'child',
                template: `<div i18n>Child content <ng-content></ng-content></div>`
              })
              class Child {
              }

              @Component({
                selector: 'parent',
                template:
                    `<child i18n>and projection from {name, select, angular {Angular} other {{{name}}}}</child>`
              })
              class Parent {
                name: string = 'Parent';
              }
              TestBed.configureTestingModule({declarations: [Parent, Child]});
              loadTranslations({

                'Child content {$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT}':
                    'Contenu enfant {$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT}',
                'and projection from {$ICU}': 'et projection depuis {$ICU}'
              });
              const fixture = TestBed.createComponent(Parent);
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(
                      `<child><div>Contenu enfant et projection depuis Parent<!--ICU 15--></div></child>`);

              fixture.componentRef.instance.name = 'angular';
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(
                      `<child><div>Contenu enfant et projection depuis Angular<!--ICU 15--></div></child>`);
            });

            it(`shouldn't project deleted projections in i18n blocks`, () => {
              @Component({
                selector: 'child',
                template: `<div i18n>Child content <ng-content></ng-content></div>`
              })
              class Child {
              }

              @Component({
                selector: 'parent',
                template: `<child i18n>and projection from {{name}}</child>`
              })
              class Parent {
                name: string = 'Parent';
              }
              TestBed.configureTestingModule({declarations: [Parent, Child]});
              loadTranslations({

                'Child content {$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT}': 'Contenu enfant',
                'and projection from {$INTERPOLATION}': 'et projection depuis {$INTERPOLATION}'
              });
              const fixture = TestBed.createComponent(Parent);
              fixture.detectChanges();
              expect(fixture.nativeElement.innerHTML)
                  .toEqual(`<child><div>Contenu enfant</div></child>`);
            });

            it('should display/destroy projected i18n content', () => {

              @Component({
                selector: 'app',
                template: `
            <ng-container>(<ng-content></ng-content>)</ng-container>
        `
              })
              class MyContentApp {
              }

              @Component({
                selector: 'my-app',
                template: `
          <app i18n *ngIf="condition">{type, select, A {A} B {B} other {other}}</app>
        `
              })
              class MyApp {
                type = 'A';
                condition = true;
              }

              TestBed.configureTestingModule({declarations: [MyApp, MyContentApp]});

              const fixture = TestBed.createComponent(MyApp);
              fixture.detectChanges();

              expect(fixture.nativeElement.textContent).toContain('(A)');

              // change `condition` to remove <app>
              fixture.componentInstance.condition = false;
              fixture.detectChanges();

              // should not contain 'A'
              expect(fixture.nativeElement.textContent).toBe('');

              // display <app> again
              fixture.componentInstance.type = 'B';
              fixture.componentInstance.condition = true;
              fixture.detectChanges();

              // expect that 'B' is now displayed
              expect(fixture.nativeElement.textContent).toContain('(B)');
            });
          });

          describe('queries', () => {
            function toHtml(element: Element): string {
              return element.innerHTML.replace(/\sng-reflect-\S*="[^"]*"/g, '')
                  .replace(/<!--bindings=\{(\W.*\W\s*)?\}-->/g, '');
            }

            it('detached nodes should still be part of query', () => {
              @Directive({selector: '[text]', inputs: ['text'], exportAs: 'textDir'})
              class TextDirective {
                // TODO(issue/24571): remove '!'.
                text !: string;
                constructor() {}
              }

              @Component({selector: 'div-query', template: '<ng-container #vc></ng-container>'})
              class DivQuery {
                // TODO(issue/24571): remove '!'.
                @ContentChild(TemplateRef, {static: true}) template !: TemplateRef<any>;

                // TODO(issue/24571): remove '!'.
                @ViewChild('vc', {read: ViewContainerRef, static: true})
                vc !: ViewContainerRef;

                // TODO(issue/24571): remove '!'.
                @ContentChildren(TextDirective, {descendants: true})
                query !: QueryList<TextDirective>;

                create() { this.vc.createEmbeddedView(this.template); }

                destroy() { this.vc.clear(); }
              }

              TestBed.configureTestingModule({declarations: [TextDirective, DivQuery]});
              loadTranslations({

                '{$START_TAG_NG_TEMPLATE}{$START_TAG_DIV_1}{$START_TAG_DIV}{$START_TAG_SPAN}Content{$CLOSE_TAG_SPAN}{$CLOSE_TAG_DIV}{$CLOSE_TAG_DIV}{$CLOSE_TAG_NG_TEMPLATE}':
                    '{$START_TAG_NG_TEMPLATE}Contenu{$CLOSE_TAG_NG_TEMPLATE}'
              });
              const fixture = initWithTemplate(AppComp, `
          <div-query #q i18n>
            <ng-template>
              <div>
                <div *ngIf="visible">
                  <span text="1">Content</span>
                </div>
              </div>
            </ng-template>
          </div-query>
        `);
              const q = fixture.debugElement.children[0].references.q;
              expect(q.query.length).toEqual(0);

              // Create embedded view
              q.create();
              fixture.detectChanges();
              expect(q.query.length).toEqual(1);
              expect(toHtml(fixture.nativeElement))
                  .toEqual(`<div-query>Contenu<!--ng-container--></div-query>`);

              // Disable ng-if
              fixture.componentInstance.visible = false;
              fixture.detectChanges();
              expect(q.query.length).toEqual(0);
              expect(toHtml(fixture.nativeElement))
                  .toEqual(`<div-query>Contenu<!--ng-container--></div-query>`);
            });
          });

          it('should not alloc expando slots when there is no new variable to create', () => {
            @Component({
              template: `
      <div dialog i18n>
          <div *ngIf="data">
              Some content
          </div>
      </div>
      <button [close]="true">Button label</button>
  `
            })
            class ContentElementDialog {
              data = false;
            }

            TestBed.configureTestingModule(
                {declarations: [DialogDir, CloseBtn, ContentElementDialog]});

            const fixture = TestBed.createComponent(ContentElementDialog);
            fixture.detectChanges();
            expect(fixture.nativeElement.innerHTML).toEqual(`<div dialog=""><!--bindings={
  "ng-reflect-ng-if": "false"
}--></div><button ng-reflect-dialog-result="true" title="Close dialog">Button label</button>`);
          });
        });

function initWithTemplate(compType: Type<any>, template: string) {
  TestBed.overrideComponent(compType, {set: {template}});
  const fixture = TestBed.createComponent(compType);
  fixture.detectChanges();
  return fixture;
}

@Component({selector: 'app-comp', template: ``})
class AppComp {
  name = `Angular`;
  visible = true;
  count = 0;
}

@Component({
  selector: 'app-comp-with-whitespaces',
  template: ``,
  preserveWhitespaces: true,
})
class AppCompWithWhitespaces {
}

@Directive({
  selector: '[tplRef]',
})
class DirectiveWithTplRef {
  constructor(public vcRef: ViewContainerRef, public tplRef: TemplateRef<{}>) {}
  ngOnInit() { this.vcRef.createEmbeddedView(this.tplRef, {}); }
}

@Pipe({name: 'uppercase'})
class UppercasePipe implements PipeTransform {
  transform(value: string) { return value.toUpperCase(); }
}

@Directive({selector: `[dialog]`})
export class DialogDir {
}

@Directive({selector: `button[close]`, host: {'[title]': 'name'}})
export class CloseBtn {
  @Input('close') dialogResult: any;
  name: string = 'Close dialog';
}
