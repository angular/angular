/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Make the `$localize()` global function available to the compiled templates, and the direct calls
// below. This would normally be done inside the application `polyfills.ts` file.
import '@angular/localize/init';

import {CommonModule, DOCUMENT, registerLocaleData} from '@angular/common';
import localeEs from '@angular/common/locales/es';
import localeRo from '@angular/common/locales/ro';
import {computeMsgId} from '@angular/compiler';
import {Attribute, Component, ContentChild, ContentChildren, Directive, ElementRef, HostBinding, Input, LOCALE_ID, NO_ERRORS_SCHEMA, Pipe, PipeTransform, QueryList, RendererFactory2, TemplateRef, Type, ViewChild, ViewContainerRef, ɵsetDocument} from '@angular/core';
import {DebugNode, HEADER_OFFSET, TVIEW} from '@angular/core/src/render3/interfaces/view';
import {getComponentLView} from '@angular/core/src/render3/util/discovery_utils';
import {TestBed} from '@angular/core/testing';
import {clearTranslations, loadTranslations} from '@angular/localize';
import {By, ɵDomRendererFactory2 as DomRendererFactory2} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';
import {onlyInIvy} from '@angular/private/testing';
import {BehaviorSubject} from 'rxjs';



onlyInIvy('Ivy i18n logic').describe('runtime i18n', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppComp, DirectiveWithTplRef, UppercasePipe],
      // In some of the tests we use made-up tag names for better readability, however
      // they'll cause validation errors. Add the `NO_ERRORS_SCHEMA` so that we don't have
      // to declare dummy components for each one of them.
      schemas: [NO_ERRORS_SCHEMA],
    });
  });

  afterEach(() => {
    clearTranslations();
  });

  it('should translate text', () => {
    loadTranslations({[computeMsgId('text')]: 'texte'});
    const fixture = initWithTemplate(AppComp, `<div i18n>text</div>`);
    expect(fixture.nativeElement.innerHTML).toEqual(`<div>texte</div>`);
  });

  it('should support interpolations', () => {
    loadTranslations({[computeMsgId('Hello {$INTERPOLATION}!')]: 'Bonjour {$INTERPOLATION}!'});
    const fixture = initWithTemplate(AppComp, `<div i18n>Hello {{name}}!</div>`);
    expect(fixture.nativeElement.innerHTML).toEqual(`<div>Bonjour Angular!</div>`);
    fixture.componentRef.instance.name = `John`;
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual(`<div>Bonjour John!</div>`);
  });

  it('should support named interpolations', () => {
    loadTranslations({
      [computeMsgId(' Hello {$USER_NAME}! Emails: {$AMOUNT_OF_EMAILS_RECEIVED} ')]:
          ' Bonjour {$USER_NAME}! Emails: {$AMOUNT_OF_EMAILS_RECEIVED} '
    });
    const fixture = initWithTemplate(AppComp, `
      <div i18n>
        Hello {{ name // i18n(ph="user_name") }}!
        Emails: {{ count // i18n(ph="amount of emails received") }}
      </div>
    `);
    expect(fixture.nativeElement.innerHTML).toEqual(`<div> Bonjour Angular! Emails: 0 </div>`);
    fixture.componentRef.instance.name = `John`;
    fixture.componentRef.instance.count = 5;
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual(`<div> Bonjour John! Emails: 5 </div>`);
  });

  it('should support interpolations with custom interpolation config', () => {
    loadTranslations({[computeMsgId('Hello {$INTERPOLATION}')]: 'Bonjour {$INTERPOLATION}'});
    const interpolation = ['{%', '%}'] as [string, string];
    TestBed.overrideComponent(AppComp, {set: {interpolation}});
    const fixture = initWithTemplate(AppComp, `<div i18n>Hello {% name %}</div>`);

    expect(fixture.nativeElement.innerHTML).toBe('<div>Bonjour Angular</div>');
  });

  it('should support &ngsp; in translatable sections', () => {
    // note: the `` unicode symbol represents the `&ngsp;` in translations
    loadTranslations({[computeMsgId('text ||')]: 'texte ||'});
    const fixture = initWithTemplate(AppCompWithWhitespaces, `<div i18n>text |&ngsp;|</div>`);

    expect(fixture.nativeElement.innerHTML).toEqual(`<div>texte | |</div>`);
  });

  it('should support interpolations with complex expressions', () => {
    loadTranslations({
      [computeMsgId(' {$INTERPOLATION} - {$INTERPOLATION_1} - {$INTERPOLATION_2} ')]:
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
      [computeMsgId(
          'Hello {$START_TAG_SPAN}world{$CLOSE_TAG_SPAN} and {$START_TAG_DIV}universe{$CLOSE_TAG_DIV}!',
          '')]:
          'Bonjour {$START_TAG_SPAN}monde{$CLOSE_TAG_SPAN} et {$START_TAG_DIV}univers{$CLOSE_TAG_DIV}!'
    });
    const fixture = initWithTemplate(
        AppComp, `<div i18n>Hello <span>world</span> and <div>universe</div>!</div>`);
    expect(fixture.nativeElement.innerHTML)
        .toEqual(`<div>Bonjour <span>monde</span> et <div>univers</div>!</div>`);
  });

  it('should support removing elements', () => {
    loadTranslations({
      [computeMsgId(
          'Hello {$START_BOLD_TEXT}my{$CLOSE_BOLD_TEXT}{$START_TAG_SPAN}world{$CLOSE_TAG_SPAN}',
          '')]: 'Bonjour {$START_TAG_SPAN}monde{$CLOSE_TAG_SPAN}'
    });
    const fixture =
        initWithTemplate(AppComp, `<div i18n>Hello <b>my</b><span>world</span></div><div>!</div>`);
    expect(fixture.nativeElement.innerHTML)
        .toEqual(`<div>Bonjour <span>monde</span></div><div>!</div>`);
  });

  it('should support moving elements', () => {
    loadTranslations({
      [computeMsgId(
          'Hello {$START_TAG_SPAN}world{$CLOSE_TAG_SPAN} and {$START_TAG_DIV}universe{$CLOSE_TAG_DIV}!',
          '')]:
          'Bonjour {$START_TAG_DIV}univers{$CLOSE_TAG_DIV} et {$START_TAG_SPAN}monde{$CLOSE_TAG_SPAN}!'
    });
    const fixture = initWithTemplate(
        AppComp, `<div i18n>Hello <span>world</span> and <div>universe</div>!</div>`);
    expect(fixture.nativeElement.innerHTML)
        .toEqual(`<div>Bonjour <div>univers</div> et <span>monde</span>!</div>`);
  });

  it('should support template directives', () => {
    loadTranslations({
      [computeMsgId(
          'Content: {$START_TAG_DIV}before{$START_TAG_SPAN}middle{$CLOSE_TAG_SPAN}after{$CLOSE_TAG_DIV}!',
          '')]:
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
      [computeMsgId('trad {$INTERPOLATION}')]: 'traduction {$INTERPOLATION}',
      [computeMsgId('start {$INTERPOLATION} middle {$INTERPOLATION_1} end')]:
          'start {$INTERPOLATION_1} middle {$INTERPOLATION} end',
      [computeMsgId(
          '{$START_TAG_C}trad{$CLOSE_TAG_C}{$START_TAG_D}{$CLOSE_TAG_D}{$START_TAG_E}{$CLOSE_TAG_E}',
          '')]: '{$START_TAG_E}{$CLOSE_TAG_E}{$START_TAG_C}traduction{$CLOSE_TAG_C}'
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
      [computeMsgId('Section 1')]: 'Section un',
      [computeMsgId('Section 2')]: 'Section deux',
      [computeMsgId('Section 3')]: 'Section trois',
    });
    const fixture = initWithTemplate(AppComp, `
      <div>
        <div i18n>Section 1</div>
        <div i18n>Section 2</div>
        <div i18n>Section 3</div>
      </div>`);
    expect(fixture.nativeElement.innerHTML)
        .toEqual(`<div><div>Section un</div><div>Section deux</div><div>Section trois</div></div>`);
  });

  it('should support multiple sibling i18n blocks inside of a template directive', () => {
    loadTranslations({
      [computeMsgId('Section 1')]: 'Section un',
      [computeMsgId('Section 2')]: 'Section deux',
      [computeMsgId('Section 3')]: 'Section trois',
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
      [computeMsgId('\'Single quotes\' and "Double quotes"')]:
          '\'Guillemets simples\' et "Guillemets doubles"'
    });
    const fixture =
        initWithTemplate(AppComp, `<div i18n>'Single quotes' and "Double quotes"</div>`);

    expect(fixture.nativeElement.innerHTML)
        .toEqual('<div>\'Guillemets simples\' et "Guillemets doubles"</div>');
  });

  it('should correctly bind to context in nested template', () => {
    loadTranslations({[computeMsgId('Item {$INTERPOLATION}')]: 'Article {$INTERPOLATION}'});
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
    loadTranslations({[computeMsgId('Hello {$INTERPOLATION}')]: 'Bonjour {$INTERPOLATION}'});
    const fixture = initWithTemplate(AppComp, `<div *ngIf="visible" i18n>Hello {{ name }}</div>`);
    expect(fixture.nativeElement.firstChild).toHaveText('Bonjour Angular');
  });

  it('should work correctly with event listeners', () => {
    loadTranslations({[computeMsgId('Hello {$INTERPOLATION}')]: 'Bonjour {$INTERPOLATION}'});

    @Component(
        {selector: 'app-comp', template: `<div i18n (click)="onClick()">Hello {{ name }}</div>`})
    class ListenerComp {
      name = `Angular`;
      clicks = 0;

      onClick() {
        this.clicks++;
      }
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

  it('should support local refs inside i18n block', () => {
    loadTranslations({
      [computeMsgId(
          '{$START_TAG_NG_CONTAINER} One {$CLOSE_TAG_NG_CONTAINER}' +
          '{$START_TAG_DIV} Two {$CLOSE_TAG_DIV}' +
          '{$START_TAG_SPAN} Three {$CLOSE_TAG_SPAN}' +
          '{$START_TAG_NG_TEMPLATE} Four {$CLOSE_TAG_NG_TEMPLATE}' +
          '{$START_TAG_NG_CONTAINER_1}{$CLOSE_TAG_NG_CONTAINER}')]:

          '{$START_TAG_NG_CONTAINER} Une {$CLOSE_TAG_NG_CONTAINER}' +
          '{$START_TAG_DIV} Deux {$CLOSE_TAG_DIV}' +
          '{$START_TAG_SPAN} Trois {$CLOSE_TAG_SPAN}' +
          '{$START_TAG_NG_TEMPLATE} Quatre {$CLOSE_TAG_NG_TEMPLATE}' +
          '{$START_TAG_NG_CONTAINER_1}{$CLOSE_TAG_NG_CONTAINER}'

    });
    const fixture = initWithTemplate(AppComp, `
      <div i18n>
        <ng-container #localRefA> One </ng-container>
        <div #localRefB> Two </div>
        <span #localRefC> Three </span>

        <ng-template #localRefD> Four </ng-template>
        <ng-container *ngTemplateOutlet="localRefD"></ng-container>
      </div>
    `);
    expect(fixture.nativeElement.textContent).toBe(' Une  Deux  Trois  Quatre ');
  });

  it('should handle local refs correctly in case an element is removed in translation', () => {
    loadTranslations({
      [computeMsgId(
          '{$START_TAG_NG_CONTAINER} One {$CLOSE_TAG_NG_CONTAINER}' +
          '{$START_TAG_DIV} Two {$CLOSE_TAG_DIV}' +
          '{$START_TAG_SPAN} Three {$CLOSE_TAG_SPAN}')]: '{$START_TAG_DIV} Deux {$CLOSE_TAG_DIV}'
    });
    const fixture = initWithTemplate(AppComp, `
      <div i18n>
        <ng-container #localRefA> One </ng-container>
        <div #localRefB> Two </div>
        <span #localRefC> Three </span>
      </div>
    `);
    expect(fixture.nativeElement.textContent).toBe(' Deux ');
  });

  describe('ng-container and ng-template support', () => {
    it('should support ng-container', () => {
      loadTranslations({[computeMsgId('text')]: 'texte'});
      const fixture = initWithTemplate(AppComp, `<ng-container i18n>text</ng-container>`);
      expect(fixture.nativeElement.innerHTML).toEqual(`texte<!--ng-container-->`);
    });

    it('should handle single translation message within ng-template', () => {
      loadTranslations({[computeMsgId('Hello {$INTERPOLATION}')]: 'Bonjour {$INTERPOLATION}'});
      const fixture =
          initWithTemplate(AppComp, `<ng-template i18n tplRef>Hello {{ name }}</ng-template>`);

      const element = fixture.nativeElement;
      expect(element).toHaveText('Bonjour Angular');
    });

    // Note: applying structural directives to <ng-template> is typically user error, but it
    // is technically allowed, so we need to support it.
    it('should handle structural directives on ng-template', () => {
      loadTranslations({[computeMsgId('Hello {$INTERPOLATION}')]: 'Bonjour {$INTERPOLATION}'});
      const fixture = initWithTemplate(
          AppComp, `<ng-template *ngIf="name" i18n tplRef>Hello {{ name }}</ng-template>`);

      const element = fixture.nativeElement;
      expect(element).toHaveText('Bonjour Angular');
    });

    it('should be able to act as child elements inside i18n block (plain text content)', () => {
      loadTranslations({
        [computeMsgId(
            '{$START_TAG_NG_TEMPLATE} Hello {$CLOSE_TAG_NG_TEMPLATE}{$START_TAG_NG_CONTAINER} Bye {$CLOSE_TAG_NG_CONTAINER}',
            '')]:
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
        [computeMsgId(
            '{$START_TAG_NG_TEMPLATE}{$START_TAG_SPAN}Hello{$CLOSE_TAG_SPAN}{$CLOSE_TAG_NG_TEMPLATE}{$START_TAG_NG_CONTAINER}{$START_TAG_SPAN}Hello{$CLOSE_TAG_SPAN}{$CLOSE_TAG_NG_CONTAINER}',
            '')]:
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
      loadTranslations({
        [computeMsgId(
            '{$START_TAG_NG_TEMPLATE}Hello {$INTERPOLATION}{$CLOSE_TAG_NG_TEMPLATE}{$START_TAG_NG_CONTAINER}Bye {$INTERPOLATION}{$CLOSE_TAG_NG_CONTAINER}',
            '')]:
            '{$START_TAG_NG_TEMPLATE}Hej {$INTERPOLATION}{$CLOSE_TAG_NG_TEMPLATE}{$START_TAG_NG_CONTAINER}Vi ses {$INTERPOLATION}{$CLOSE_TAG_NG_CONTAINER}'
      });
      const fixture = initWithTemplate(AppComp, `
        <div i18n>
          <ng-template tplRef>Hello {{name | uppercase}}</ng-template>
          <ng-container>Bye {{name | uppercase}}</ng-container>
        </div>
      `);

      const element = fixture.nativeElement.firstChild;
      expect(element.textContent.replace(/\s+/g, ' ').trim()).toBe('Hej ANGULARVi ses ANGULAR');
    });

    it('should be able to handle deep nested levels with templates', () => {
      loadTranslations({
        [computeMsgId(
            '{$START_TAG_SPAN} Hello - 1 {$CLOSE_TAG_SPAN}{$START_TAG_SPAN_1} Hello - 2 {$START_TAG_SPAN_1} Hello - 3 {$START_TAG_SPAN_1} Hello - 4 {$CLOSE_TAG_SPAN}{$CLOSE_TAG_SPAN}{$CLOSE_TAG_SPAN}{$START_TAG_SPAN} Hello - 5 {$CLOSE_TAG_SPAN}',
            '')]:
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
        [computeMsgId('{$START_TAG_SPAN}My logo{$TAG_IMG}{$CLOSE_TAG_SPAN}')]:
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

    it('should correctly find context for an element inside i18n section in <ng-template>', () => {
      loadTranslations({
        [computeMsgId('{$START_LINK}Not logged in{$CLOSE_LINK}')]:
            '{$START_LINK}Not logged in{$CLOSE_LINK}'
      });
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

  describe('should work correctly with namespaces', () => {
    beforeEach(() => {
      function _document(): any {
        // Tell Ivy about the global document
        ɵsetDocument(document);
        return document;
      }

      TestBed.configureTestingModule({
        providers: [
          {provide: DOCUMENT, useFactory: _document, deps: []},
          // TODO(FW-811): switch back to default server renderer (i.e. remove the line
          // below) once it starts to support Ivy namespace format (URIs) correctly. For
          // now, use `DomRenderer` that supports Ivy namespace format.
          {provide: RendererFactory2, useClass: DomRendererFactory2}
        ],
      });
    });

    it('should handle namespaces inside i18n blocks', () => {
      loadTranslations({
        [computeMsgId(
            '{$START_TAG__XHTML_DIV} Hello ' +
            '{$START_TAG__XHTML_SPAN}world{$CLOSE_TAG__XHTML_SPAN}{$CLOSE_TAG__XHTML_DIV}')]:
            '{$START_TAG__XHTML_DIV} Bonjour ' +
            '{$START_TAG__XHTML_SPAN}monde{$CLOSE_TAG__XHTML_SPAN}{$CLOSE_TAG__XHTML_DIV}'
      });

      const fixture = initWithTemplate(AppComp, `
        <svg xmlns="http://www.w3.org/2000/svg">
          <foreignObject i18n>
            <xhtml:div xmlns="http://www.w3.org/1999/xhtml">
              Hello <span>world</span>
            </xhtml:div>
          </foreignObject>
        </svg>
      `);

      const element = fixture.nativeElement;
      expect(element.textContent.trim()).toBe('Bonjour monde');
      expect(element.querySelector('svg').namespaceURI).toBe('http://www.w3.org/2000/svg');
      expect(element.querySelector('div').namespaceURI).toBe('http://www.w3.org/1999/xhtml');
      expect(element.querySelector('span').namespaceURI).toBe('http://www.w3.org/1999/xhtml');
    });

    it('should handle namespaces on i18n block containers', () => {
      loadTranslations({
        [computeMsgId(' Hello {$START_TAG__XHTML_SPAN}world{$CLOSE_TAG__XHTML_SPAN}')]:
            ' Bonjour {$START_TAG__XHTML_SPAN}monde{$CLOSE_TAG__XHTML_SPAN}'
      });

      const fixture = initWithTemplate(AppComp, `
        <svg xmlns="http://www.w3.org/2000/svg">
          <foreignObject>
            <xhtml:div xmlns="http://www.w3.org/1999/xhtml" i18n>
              Hello <span>world</span>
            </xhtml:div>
          </foreignObject>
        </svg>
      `);

      const element = fixture.nativeElement;
      expect(element.textContent.trim()).toBe('Bonjour monde');
      expect(element.querySelector('svg').namespaceURI).toBe('http://www.w3.org/2000/svg');
      expect(element.querySelector('div').namespaceURI).toBe('http://www.w3.org/1999/xhtml');
      expect(element.querySelector('span').namespaceURI).toBe('http://www.w3.org/1999/xhtml');
    });
  });

  describe('dynamic TNodes', () => {
    // When translation occurs the i18n system needs to create dynamic TNodes for the text
    // nodes so that they can be correctly processed by the `addRemoveViewFromContainer`.

    function toTypeContent(n: DebugNode): string {
      return `${n.type}(${n.html})`;
    }

    it('should not create dynamic TNode when no i18n', () => {
      const fixture = initWithTemplate(AppComp, `Hello <b>World</b>!`);
      const lView = getComponentLView(fixture.componentInstance);
      const hello_ = (fixture.nativeElement as Element).firstChild!;
      const b = hello_.nextSibling!;
      const world = b.firstChild!;
      const exclamation = b.nextSibling!;
      const lViewDebug = lView.debug!;
      expect(lViewDebug.nodes.map(toTypeContent)).toEqual([
        'Text(Hello )', 'Element(<b>)', 'Text(!)'
      ]);
      expect(lViewDebug.decls).toEqual({
        start: HEADER_OFFSET,
        end: HEADER_OFFSET + 4,
        length: 4,
        content: [
          jasmine.objectContaining({index: HEADER_OFFSET + 0, l: hello_}),
          jasmine.objectContaining({index: HEADER_OFFSET + 1, l: b}),
          jasmine.objectContaining({index: HEADER_OFFSET + 2, l: world}),
          jasmine.objectContaining({index: HEADER_OFFSET + 3, l: exclamation}),
        ]
      });
      expect(lViewDebug.expando)
          .toEqual(
              {start: lViewDebug.vars.end, end: lViewDebug.expando.start, length: 0, content: []});
    });

    describe('ICU', () => {
      // In the case of ICUs we can't create TNodes for each ICU part, as different ICU
      // instances may have different selections active and hence have different shape. In
      // such a case a single `TIcuContainerNode` should be generated only.
      it('should create a single dynamic TNode for ICU', () => {
        const fixture = initWithTemplate(AppComp, `
          {count, plural,
            =0 {just now}
            =1 {one minute ago}
            other {{{count}} minutes ago}
          }
        `.trim());
        const lView = getComponentLView(fixture.componentInstance);
        const lViewDebug = lView.debug!;
        fixture.detectChanges();
        expect((fixture.nativeElement as Element).textContent).toEqual('just now');
        expect(lViewDebug.nodes.map(toTypeContent)).toEqual([
          `IcuContainer(<!--ICU ${HEADER_OFFSET + 0}:0-->)`
        ]);
        // We want to ensure that the ICU container does not have any content!
        // This is because the content is instance dependent and therefore can't be shared
        // across `TNode`s.
        expect(lViewDebug.nodes[0].children.map(toTypeContent)).toEqual([]);
        expect(fixture.nativeElement.innerHTML)
            .toEqual(`just now<!--ICU ${HEADER_OFFSET + 0}:0-->`);
      });

      it('should support multiple ICUs', () => {
        const fixture = initWithTemplate(AppComp, `
          {count, plural,
            =0 {just now}
            =1 {one minute ago}
            other {{{count}} minutes ago}
          }
          {name, select,
            Angular {Mr. Angular}
            other {Sir}
          }
        `);
        const lView = getComponentLView(fixture.componentInstance);
        expect(lView.debug!.nodes.map(toTypeContent)).toEqual([
          `IcuContainer(<!--ICU ${HEADER_OFFSET + 0}:0-->)`,
          `IcuContainer(<!--ICU ${HEADER_OFFSET + 1}:0-->)`,
        ]);
        // We want to ensure that the ICU container does not have any content!
        // This is because the content is instance dependent and therefore can't be shared
        // across `TNode`s.
        expect(lView.debug!.nodes[0].children.map(toTypeContent)).toEqual([]);
        expect(fixture.nativeElement.innerHTML)
            .toEqual(`just now<!--ICU ${HEADER_OFFSET + 0}:0-->Mr. Angular<!--ICU ${
                HEADER_OFFSET + 1}:0-->`);
      });
    });
  });

  describe('should support ICU expressions', () => {
    it('with no root node', () => {
      loadTranslations({
        [computeMsgId('{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}')]:
            '{VAR_SELECT, select, 10 {dix} 20 {vingt} other {autre}}'
      });
      const fixture =
          initWithTemplate(AppComp, `{count, select, 10 {ten} 20 {twenty} other {other}}`);

      const element = fixture.nativeElement;
      expect(element).toHaveText('autre');
    });

    it('with no root node and text surrounding ICU', () => {
      loadTranslations({
        [computeMsgId('{VAR_SELECT, select, 10 {Ten} 20 {Twenty} other {Other}}')]:
            '{VAR_SELECT, select, 10 {Dix} 20 {Vingt} other {Autre}}'
      });
      const fixture = initWithTemplate(AppComp, `
        ICU start -->
        {count, select, 10 {Ten} 20 {Twenty} other {Other}}
        <-- ICU end
      `);

      const element = fixture.nativeElement;
      expect(element.textContent).toContain('ICU start --> Autre <-- ICU end');
    });

    it('when `select` or `plural` keywords have spaces after them', () => {
      loadTranslations({
        [computeMsgId('{VAR_SELECT , select , 10 {ten} 20 {twenty} other {other}}')]:
            '{VAR_SELECT , select , 10 {dix} 20 {vingt} other {autre}}',
        [computeMsgId('{VAR_PLURAL , plural , =0 {zero} =1 {one} other {other}}')]:
            '{VAR_PLURAL , plural , =0 {zéro} =1 {une} other {autre}}'
      });
      const fixture = initWithTemplate(AppComp, `
        <div i18n>
          {count, select , 10 {ten} 20 {twenty} other {other}} -
          {count, plural , =0 {zero} =1 {one} other {other}}
        </div>
      `);

      const element = fixture.nativeElement;
      expect(element.textContent).toContain('autre - zéro');
    });

    it('with no root node and text and DOM nodes surrounding ICU', () => {
      loadTranslations({
        [computeMsgId('{VAR_SELECT, select, 10 {Ten} 20 {Twenty} other {Other}}')]:
            '{VAR_SELECT, select, 10 {Dix} 20 {Vingt} other {Autre}}'
      });
      const fixture = initWithTemplate(AppComp, `
        <span>ICU start --> </span>
        {count, select, 10 {Ten} 20 {Twenty} other {Other}}
        <-- ICU end
      `);

      const element = fixture.nativeElement;
      expect(element.textContent).toContain('ICU start --> Autre <-- ICU end');
    });

    it('with no i18n tag', () => {
      loadTranslations({
        [computeMsgId('{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}')]:
            '{VAR_SELECT, select, 10 {dix} 20 {vingt} other {autre}}'
      });
      const fixture = initWithTemplate(
          AppComp, `<div>{count, select, 10 {ten} 20 {twenty} other {other}}</div>`);

      const element = fixture.nativeElement;
      expect(element).toHaveText('autre');
    });

    it('multiple', () => {
      loadTranslations({
        [computeMsgId(
            '{VAR_PLURAL, plural, =0 {no {START_BOLD_TEXT}emails{CLOSE_BOLD_TEXT}!} =1 {one {START_ITALIC_TEXT}email{CLOSE_ITALIC_TEXT}} other {{INTERPOLATION} {START_TAG_SPAN}emails{CLOSE_TAG_SPAN}}}',
            '')]:
            '{VAR_PLURAL, plural, =0 {aucun {START_BOLD_TEXT}email{CLOSE_BOLD_TEXT}!} =1 {un {START_ITALIC_TEXT}email{CLOSE_ITALIC_TEXT}} other {{INTERPOLATION} {START_TAG_SPAN}emails{CLOSE_TAG_SPAN}}}',
        [computeMsgId('{VAR_SELECT, select, other {({INTERPOLATION})}}')]:
            '{VAR_SELECT, select, other {({INTERPOLATION})}}',
        [computeMsgId('{$ICU} - {$ICU_1}')]: '{$ICU} - {$ICU_1}',
      });
      const fixture = initWithTemplate(AppComp, `<div i18n>{count, plural,
        =0 {no <b>emails</b>!}
        =1 {one <i>email</i>}
        other {{{count}} <span title="{{name}}">emails</span>}
      } - {name, select,
        other {({{name}})}
      }</div>`);
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`<div>aucun <b>email</b>!<!--ICU ${HEADER_OFFSET + 1}:0--> - (Angular)<!--ICU ${
              HEADER_OFFSET + 1}:3--></div>`);

      fixture.componentRef.instance.count = 4;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`<div>4 <span title="Angular">emails</span><!--ICU ${
              HEADER_OFFSET + 1}:0--> - (Angular)<!--ICU ${HEADER_OFFSET + 1}:3--></div>`);

      fixture.componentRef.instance.count = 0;
      fixture.componentRef.instance.name = 'John';
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`<div>aucun <b>email</b>!<!--ICU ${HEADER_OFFSET + 1}:0--> - (John)<!--ICU ${
              HEADER_OFFSET + 1}:3--></div>`);
    });

    it('with custom interpolation config', () => {
      loadTranslations({
        [computeMsgId('{VAR_SELECT, select, 10 {ten} other {{INTERPOLATION}}}')]:
            '{VAR_SELECT, select, 10 {dix} other {{INTERPOLATION}}}'
      });
      const interpolation = ['{%', '%}'] as [string, string];
      TestBed.overrideComponent(AppComp, {set: {interpolation}});
      const fixture =
          initWithTemplate(AppComp, `<div i18n>{count, select, 10 {ten} other {{% name %}}}</div>`);

      expect(fixture.nativeElement).toHaveText(`Angular`);
    });

    it('inside HTML elements', () => {
      loadTranslations({
        [computeMsgId(
            '{VAR_PLURAL, plural, =0 {no {START_BOLD_TEXT}emails{CLOSE_BOLD_TEXT}!} =1 {one {START_ITALIC_TEXT}email{CLOSE_ITALIC_TEXT}} other {{INTERPOLATION} {START_TAG_SPAN}emails{CLOSE_TAG_SPAN}}}',
            '')]:
            '{VAR_PLURAL, plural, =0 {aucun {START_BOLD_TEXT}email{CLOSE_BOLD_TEXT}!} =1 {un {START_ITALIC_TEXT}email{CLOSE_ITALIC_TEXT}} other {{INTERPOLATION} {START_TAG_SPAN}emails{CLOSE_TAG_SPAN}}}',
        [computeMsgId('{VAR_SELECT, select, other {({INTERPOLATION})}}')]:
            '{VAR_SELECT, select, other {({INTERPOLATION})}}',
        [computeMsgId(
            '{$START_TAG_SPAN_1}{$ICU}{$CLOSE_TAG_SPAN} - ' +
            '{$START_TAG_SPAN_1}{$ICU_1}{$CLOSE_TAG_SPAN}')]:
            '{$START_TAG_SPAN_1}{$ICU}{$CLOSE_TAG_SPAN} - {$START_TAG_SPAN_1}{$ICU_1}{$CLOSE_TAG_SPAN}',
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
              `<div>` +
              `<span>aucun <b>email</b>!<!--ICU ${HEADER_OFFSET + 1}:0--></span>` +
              ` - ` +
              `<span>(Angular)<!--ICU ${HEADER_OFFSET + 1}:3--></span>` +
              `</div>`);

      fixture.componentRef.instance.count = 4;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(
              `<div>` +
              `<span>4 <span title="Angular">emails</span><!--ICU ${
                  HEADER_OFFSET + 1}:0--></span>` +
              ` - ` +
              `<span>(Angular)<!--ICU ${HEADER_OFFSET + 1}:3--></span>` +
              `</div>`);

      fixture.componentRef.instance.count = 0;
      fixture.componentRef.instance.name = 'John';
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(
              `<div>` +
              `<span>aucun <b>email</b>!<!--ICU ${HEADER_OFFSET + 1}:0--></span>` +
              ` - ` +
              `<span>(John)<!--ICU ${HEADER_OFFSET + 1}:3--></span>` +
              `</div>`);
    });

    it('inside template directives', () => {
      loadTranslations({
        [computeMsgId('{$START_TAG_SPAN}{$ICU}{$CLOSE_TAG_SPAN}')]:
            '{$START_TAG_SPAN}{$ICU}{$CLOSE_TAG_SPAN}',
        [computeMsgId('{VAR_SELECT, select, other {({INTERPOLATION})}}')]:
            '{VAR_SELECT, select, other {({INTERPOLATION})}}'
      });
      const fixture = initWithTemplate(AppComp, `<div i18n><span *ngIf="visible">{name, select,
        other {({{name}})}
      }</span></div>`);
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`<div><span>(Angular)<!--ICU ${HEADER_OFFSET + 0}:0--></span><!--bindings={
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
        [computeMsgId('{VAR_SELECT, select, other {({INTERPOLATION})}}')]:
            '{VAR_SELECT, select, other {({INTERPOLATION})}}'
      });
      const fixture = initWithTemplate(AppComp, `<ng-container i18n>{name, select,
        other {({{name}})}
      }</ng-container>`);
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`(Angular)<!--ICU ${HEADER_OFFSET + 1}:0--><!--ng-container-->`);
    });

    it('inside <ng-template>', () => {
      loadTranslations({
        [computeMsgId('{VAR_SELECT, select, 10 {ten} 20 {twenty} other {other}}')]:
            '{VAR_SELECT, select, 10 {dix} 20 {vingt} other {autre}}'
      });
      const fixture = initWithTemplate(
          AppComp,
          `
        <ng-template i18n tplRef>` +
              `{count, select, 10 {ten} 20 {twenty} other {other}}` +
              `</ng-template>
      `);

      const element = fixture.nativeElement;
      expect(element).toHaveText('autre');
    });

    it('nested', () => {
      loadTranslations({
        [computeMsgId(
            '{VAR_PLURAL, plural, =0 {zero} other {{INTERPOLATION} {VAR_SELECT, select, cat {cats} dog {dogs} other {animals}}!}}',
            '')]:
            '{VAR_PLURAL, plural, =0 {zero} other {{INTERPOLATION} {VAR_SELECT, select, cat {chats} dog {chiens} other {animaux}}!}}'
      });
      const fixture = initWithTemplate(AppComp, `<div i18n>{count, plural,
        =0 {zero}
        other {{{count}} {name, select,
                       cat {cats}
                       dog {dogs}
                       other {animals}
                     }!}
      }</div>`);
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`<div>zero<!--ICU ${HEADER_OFFSET + 1}:1--></div>`);

      fixture.componentRef.instance.count = 4;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`<div>4 animaux<!--nested ICU 0-->!<!--ICU ${HEADER_OFFSET + 1}:1--></div>`);
    });

    it('nested with interpolations in "other" blocks', () => {
      loadTranslations({
        [computeMsgId(
            '{VAR_PLURAL, plural, =0 {zero} =2 {{INTERPOLATION} {VAR_SELECT, select, cat {cats} dog {dogs} other {animals}}!} other {other - {INTERPOLATION}}}',
            '')]:
            '{VAR_PLURAL, plural, =0 {zero} =2 {{INTERPOLATION} {VAR_SELECT, select, cat {chats} dog {chiens} other {animaux}}!} other {autre - {INTERPOLATION}}}'
      });

      const fixture = initWithTemplate(AppComp, `<div i18n>{count, plural,
        =0 {zero}
        =2 {{{count}} {name, select,
                       cat {cats}
                       dog {dogs}
                       other {animals}
                     }!}
        other {other - {{count}}}
      }</div>`);
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`<div>zero<!--ICU ${HEADER_OFFSET + 1}:1--></div>`);

      fixture.componentRef.instance.count = 2;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`<div>2 animaux<!--nested ICU 0-->!<!--ICU ${HEADER_OFFSET + 1}:1--></div>`);

      fixture.componentRef.instance.count = 4;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`<div>autre - 4<!--ICU ${HEADER_OFFSET + 1}:1--></div>`);
    });

    it('should return the correct plural form for ICU expressions when using "ro" locale', () => {
      // The "ro" locale has a complex plural function that can handle muliple options
      // (and string inputs)
      //
      // function plural(n: number): number {
      //   let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
      //   if (i === 1 && v === 0) return 1;
      //   if (!(v === 0) || n === 0 ||
      //       !(n === 1) && n % 100 === Math.floor(n % 100) && n % 100 >= 1 && n % 100 <= 19)
      //     return 3;
      //   return 5;
      // }
      //
      // Compare this to the "es" locale in the next test
      loadTranslations({
        [computeMsgId(
            '{VAR_PLURAL, plural, =0 {no email} =one {one email} =few {a few emails} =other {lots of emails}}')]:
            '{VAR_PLURAL, plural, =0 {no email} =one {one email} =few {a few emails} =other {lots of emails}}'
      });
      registerLocaleData(localeRo);
      TestBed.configureTestingModule({providers: [{provide: LOCALE_ID, useValue: 'ro'}]});
      // We could also use `TestBed.overrideProvider(LOCALE_ID, {useValue: 'ro'});`
      const fixture = initWithTemplate(AppComp, `
          {count, plural,
            =0 {no email}
            =one {one email}
            =few {a few emails}
            =other {lots of emails}
          }`);

      expect(fixture.nativeElement.innerHTML).toEqual(`no email<!--ICU ${HEADER_OFFSET + 0}:0-->`);

      // Change detection cycle, no model changes
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual(`no email<!--ICU ${HEADER_OFFSET + 0}:0-->`);

      fixture.componentInstance.count = 3;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`a few emails<!--ICU ${HEADER_OFFSET + 0}:0-->`);

      fixture.componentInstance.count = 1;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual(`one email<!--ICU ${HEADER_OFFSET + 0}:0-->`);

      fixture.componentInstance.count = 10;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`a few emails<!--ICU ${HEADER_OFFSET + 0}:0-->`);

      fixture.componentInstance.count = 20;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`lots of emails<!--ICU ${HEADER_OFFSET + 0}:0-->`);

      fixture.componentInstance.count = 0;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual(`no email<!--ICU ${HEADER_OFFSET + 0}:0-->`);
    });

    it(`should return the correct plural form for ICU expressions when using "es" locale`, () => {
      // The "es" locale has a simple plural function that can only handle a few options
      // (and not string inputs)
      //
      // function plural(n: number): number {
      //   if (n === 1) return 1;
      //   return 5;
      // }
      //
      // Compare this to the "ro" locale in the previous test
      const icuMessage = '{VAR_PLURAL, plural, =0 {no email} =one ' +
          '{one email} =few {a few emails} =other {lots of emails}}';
      loadTranslations({[computeMsgId(icuMessage)]: icuMessage});
      registerLocaleData(localeEs);
      TestBed.configureTestingModule({providers: [{provide: LOCALE_ID, useValue: 'es'}]});
      // We could also use `TestBed.overrideProvider(LOCALE_ID, {useValue: 'es'});`
      const fixture = initWithTemplate(AppComp, `
          {count, plural,
            =0 {no email}
            =one {one email}
            =few {a few emails}
            =other {lots of emails}
          }`);

      expect(fixture.nativeElement.innerHTML).toEqual(`no email<!--ICU ${HEADER_OFFSET + 0}:0-->`);

      // Change detection cycle, no model changes
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual(`no email<!--ICU ${HEADER_OFFSET + 0}:0-->`);

      fixture.componentInstance.count = 3;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`lots of emails<!--ICU ${HEADER_OFFSET + 0}:0-->`);

      fixture.componentInstance.count = 1;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual(`one email<!--ICU ${HEADER_OFFSET + 0}:0-->`);

      fixture.componentInstance.count = 10;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`lots of emails<!--ICU ${HEADER_OFFSET + 0}:0-->`);

      fixture.componentInstance.count = 20;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`lots of emails<!--ICU ${HEADER_OFFSET + 0}:0-->`);

      fixture.componentInstance.count = 0;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual(`no email<!--ICU ${HEADER_OFFSET + 0}:0-->`);
    });

    it('projection', () => {
      loadTranslations({
        [computeMsgId('{VAR_PLURAL, plural, =1 {one} other {at least {INTERPOLATION} .}}')]:
            '{VAR_PLURAL, plural, =1 {one} other {at least {INTERPOLATION} .}}'
      });
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

      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toContain('at least');
    });

    it('with empty values', () => {
      loadTranslations({
        [computeMsgId('{VAR_SELECT, select, 10 {} 20 {twenty} other {other}}')]:
            '{VAR_SELECT, select, 10 {} 20 {twenty} other {other}}'
      });
      const fixture = initWithTemplate(AppComp, `{count, select, 10 {} 20 {twenty} other {other}}`);

      const element = fixture.nativeElement;
      expect(element).toHaveText('other');
    });

    it('inside a container when creating a view via vcr.createEmbeddedView', () => {
      loadTranslations({
        [computeMsgId('{VAR_PLURAL, plural, =1 {ONE} other {OTHER}}')]:
            '{VAR_PLURAL, plural, =1 {ONE} other {OTHER}}'
      });
      @Directive({
        selector: '[someDir]',
      })
      class Dir {
        constructor(
            private readonly viewContainerRef: ViewContainerRef,
            private readonly templateRef: TemplateRef<any>) {}

        ngOnInit() {
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
          .toContain(
              `<my-cmp><div>ONE<!--ICU ${HEADER_OFFSET + 1}:0--></div><!--container--></my-cmp>`);

      fixture.componentRef.instance.count = 2;
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.innerHTML)
          .toContain(
              `<my-cmp><div>OTHER<!--ICU ${HEADER_OFFSET + 1}:0--></div><!--container--></my-cmp>`);

      // destroy component
      fixture.componentInstance.condition = false;
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.textContent).toBe('');

      // render it again and also change ICU case
      fixture.componentInstance.condition = true;
      fixture.componentInstance.count = 1;
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.innerHTML)
          .toContain(
              `<my-cmp><div>ONE<!--ICU ${HEADER_OFFSET + 1}:0--></div><!--container--></my-cmp>`);
    });

    it('with nested ICU expression and inside a container when creating a view via vcr.createEmbeddedView',
       () => {
         loadTranslations({
           [computeMsgId(
               '{VAR_PLURAL, plural, =1 {ONE} other {{INTERPOLATION} ' +
               '{VAR_SELECT, select, cat {cats} dog {dogs} other {animals}}!}}')]:
               '{VAR_PLURAL, plural, =1 {ONE} other {{INTERPOLATION} ' +
               '{VAR_SELECT, select, cat {cats} dog {dogs} other {animals}}!}}'
         });

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

         dir!.attachEmbeddedView();
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement.innerHTML)
             .toBe(`<my-cmp><div>2 animals<!--nested ICU 0-->!<!--ICU ${
                 HEADER_OFFSET + 1}:1--></div><!--container--></my-cmp>`);

         fixture.componentRef.instance.count = 1;
         fixture.detectChanges();
         expect(fixture.debugElement.nativeElement.innerHTML)
             .toBe(`<my-cmp><div>ONE<!--ICU ${
                 HEADER_OFFSET + 1}:1--></div><!--container--></my-cmp>`);
       });

    it('with nested containers', () => {
      loadTranslations({
        [computeMsgId('{VAR_SELECT, select, A {A } B {B } other {C }}')]:
            '{VAR_SELECT, select, A {A } B {B } other {C }}',
        [computeMsgId('{VAR_SELECT, select, A1 {A1 } B1 {B1 } other {C1 }}')]:
            '{VAR_SELECT, select, A1 {A1 } B1 {B1 } other {C1 }}',
        [computeMsgId(' {$ICU} ')]: ' {$ICU} ',
      });
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
        isVisible() {
          return true;
        }
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
      loadTranslations({
        [computeMsgId(
            '{VAR_SELECT, select, A {A - {PH_A}} ' +
            'B {B - {PH_B}} other {other - {PH_WITH_SPACES}}}')]:
            '{VAR_SELECT, select, A {A (translated) - {PH_A}} ' +
            'B {B (translated) - {PH_B}} other {other (translated) - {PH_WITH_SPACES}}}',
      });
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

      expect(fixture.debugElement.nativeElement.innerHTML).toContain('A (translated) - Type A');

      fixture.componentInstance.type = 'C';  // trigger "other" case
      fixture.detectChanges();

      expect(fixture.debugElement.nativeElement.innerHTML).not.toContain('A (translated) - Type A');
      expect(fixture.debugElement.nativeElement.innerHTML).toContain('other (translated) - Type C');
    });

    it('should work inside an ngTemplateOutlet inside an ngFor', () => {
      loadTranslations({
        [computeMsgId('{VAR_SELECT, select, A {A } B {B } other {other - {PH_WITH_SPACES}}}')]:
            '{VAR_SELECT, select, A {A } B {B } other {other - {PH_WITH_SPACES}}}',
        [computeMsgId('{$ICU} ')]: '{$ICU} '
      });

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

    it('should use metadata from container element if a message is a single ICU', () => {
      loadTranslations({idA: '{VAR_SELECT, select, 1 {un} other {plus d\'un}}'});

      @Component({
        selector: 'app',
        template: `
          <div i18n="@@idA">{count, select, 1 {one} other {more than one}}</div>
        `
      })
      class AppComponent {
        count = 2;
      }

      TestBed.configureTestingModule({declarations: [AppComponent]});

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.debugElement.nativeElement.innerHTML).toContain('plus d\'un');
    });

    it('should support ICUs without "other" cases', () => {
      loadTranslations({
        idA: '{VAR_SELECT, select, 1 {un (select)} 2 {deux (select)}}',
        idB: '{VAR_PLURAL, plural, =1 {un (plural)} =2 {deux (plural)}}',
      });

      @Component({
        selector: 'app',
        template: `
          <div i18n="@@idA">{count, select, 1 {one (select)} 2 {two (select)}}</div> -
          <div i18n="@@idB">{count, plural, =1 {one (plural)} =2 {two (plural)}}</div>
        `
      })
      class AppComponent {
        count = 1;
      }

      TestBed.configureTestingModule({declarations: [AppComponent]});

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('un (select) - un (plural)');

      fixture.componentInstance.count = 3;
      fixture.detectChanges();
      // there is no ICU case for count=3
      expect(fixture.nativeElement.textContent.trim()).toBe('-');

      fixture.componentInstance.count = 4;
      fixture.detectChanges();
      // there is no ICU case for count=4, making sure content is still empty
      expect(fixture.nativeElement.textContent.trim()).toBe('-');

      fixture.componentInstance.count = 2;
      fixture.detectChanges();
      // check switching to an existing case after processing an ICU without matching case
      expect(fixture.nativeElement.textContent.trim()).toBe('deux (select) - deux (plural)');

      fixture.componentInstance.count = 1;
      fixture.detectChanges();
      // check that we can go back to the first ICU case
      expect(fixture.nativeElement.textContent).toBe('un (select) - un (plural)');
    });

    it('should support nested ICUs without "other" cases', () => {
      loadTranslations({
        idA: '{VAR_SELECT_1, select, A {{VAR_SELECT, select, ' +
            '1 {un (select)} 2 {deux (select)}}} other {}}',
        idB: '{VAR_SELECT, select, A {{VAR_PLURAL, plural, ' +
            '=1 {un (plural)} =2 {deux (plural)}}} other {}}',
      });

      @Component({
        selector: 'app',
        template: `
          <div i18n="@@idA">{
            type, select,
              A {{count, select, 1 {one (select)} 2 {two (select)}}}
              other {}
          }</div> -
          <div i18n="@@idB">{
            type, select,
              A {{count, plural, =1 {one (plural)} =2 {two (plural)}}}
              other {}
          }</div>
        `
      })
      class AppComponent {
        type = 'A';
        count = 1;
      }

      TestBed.configureTestingModule({declarations: [AppComponent]});

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('un (select) - un (plural)');

      fixture.componentInstance.count = 3;
      fixture.detectChanges();
      // there is no case for count=3 in nested ICU
      expect(fixture.nativeElement.textContent.trim()).toBe('-');

      fixture.componentInstance.count = 4;
      fixture.detectChanges();
      // there is no case for count=4 in nested ICU, making sure content is still empty
      expect(fixture.nativeElement.textContent.trim()).toBe('-');

      fixture.componentInstance.count = 2;
      fixture.detectChanges();
      // check switching to an existing case after processing nested ICU without matching
      // case
      expect(fixture.nativeElement.textContent.trim()).toBe('deux (select) - deux (plural)');

      fixture.componentInstance.count = 1;
      fixture.detectChanges();
      // check that we can go back to the first case in nested ICU
      expect(fixture.nativeElement.textContent).toBe('un (select) - un (plural)');

      fixture.componentInstance.type = 'B';
      fixture.detectChanges();
      // check that nested ICU is removed if root ICU case has changed
      expect(fixture.nativeElement.textContent.trim()).toBe('-');
    });

    it('should support ICUs with pipes', () => {
      loadTranslations({
        idA: '{VAR_SELECT, select, 1 {{INTERPOLATION} article} 2 {deux articles}}',
      });

      @Component({
        selector: 'app',
        template: `
          <div i18n="@@idA">{count$ | async, select, 1 {{{count$ | async}} item} 2 {two items}}</div>
        `
      })
      class AppComponent {
        count$ = new BehaviorSubject<number>(1);
      }

      TestBed.configureTestingModule({
        imports: [CommonModule],
        declarations: [AppComponent],
      });

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toBe('1 article');

      fixture.componentInstance.count$.next(3);
      fixture.detectChanges();
      // there is no ICU case for count=3, expecting empty content
      expect(fixture.nativeElement.textContent.trim()).toBe('');

      fixture.componentInstance.count$.next(2);
      fixture.detectChanges();
      // checking the second ICU case
      expect(fixture.nativeElement.textContent.trim()).toBe('deux articles');
    });

    it('should handle select expressions without an `other` parameter inside a template', () => {
      const fixture = initWithTemplate(AppComp, `
        <ng-container *ngFor="let item of items">{item.value, select, 0 {A} 1 {B} 2 {C}}</ng-container>
      `);
      fixture.componentInstance.items = [{value: 0}, {value: 1}, {value: 1337}];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('AB');

      fixture.componentInstance.items[0].value = 2;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('CB');
    });

    it('should render an element whose case did not match initially', () => {
      const fixture = initWithTemplate(AppComp, `
        <p *ngFor="let item of items">{item.value, select, 0 {A} 1 {B} 2 {C}}</p>
      `);
      fixture.componentInstance.items = [{value: 0}, {value: 1}, {value: 1337}];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('AB');

      fixture.componentInstance.items[2].value = 2;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('ABC');
    });

    it('should remove an element whose case matched initially, but does not anymore', () => {
      const fixture = initWithTemplate(AppComp, `
        <p *ngFor="let item of items">{item.value, select, 0 {A} 1 {B} 2 {C}}</p>
      `);
      fixture.componentInstance.items = [{value: 0}, {value: 1}];
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('AB');

      fixture.componentInstance.items[0].value = 1337;
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent.trim()).toBe('B');
    });
  });

  describe('should support attributes', () => {
    it('text', () => {
      loadTranslations({[computeMsgId('text')]: 'texte'});
      const fixture = initWithTemplate(AppComp, `<div i18n i18n-title title='text'></div>`);
      expect(fixture.nativeElement.innerHTML).toEqual(`<div title="texte"></div>`);
    });

    it('interpolations', () => {
      loadTranslations({[computeMsgId('hello {$INTERPOLATION}')]: 'bonjour {$INTERPOLATION}'});
      const fixture =
          initWithTemplate(AppComp, `<div i18n i18n-title title="hello {{name}}"></div>`);
      expect(fixture.nativeElement.innerHTML).toEqual(`<div title="bonjour Angular"></div>`);

      fixture.componentRef.instance.name = 'John';
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual(`<div title="bonjour John"></div>`);
    });

    it('with pipes', () => {
      loadTranslations({[computeMsgId('hello {$INTERPOLATION}')]: 'bonjour {$INTERPOLATION}'});
      const fixture = initWithTemplate(
          AppComp, `<div i18n i18n-title title="hello {{name | uppercase}}"></div>`);
      expect(fixture.nativeElement.innerHTML).toEqual(`<div title="bonjour ANGULAR"></div>`);
    });

    it('multiple attributes', () => {
      loadTranslations({
        [computeMsgId('hello {$INTERPOLATION} - {$INTERPOLATION_1}')]:
            'bonjour {$INTERPOLATION} - {$INTERPOLATION_1}',
        [computeMsgId('bye {$INTERPOLATION} - {$INTERPOLATION_1}')]:
            'au revoir {$INTERPOLATION} - {$INTERPOLATION_1}',
      });
      const fixture = initWithTemplate(
          AppComp,
          `<input i18n i18n-title title="hello {{name}} - {{count}}" i18n-placeholder placeholder="bye {{count}} - {{name}}">`);
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`<input title="bonjour Angular - 0" placeholder="au revoir 0 - Angular">`);

      fixture.componentRef.instance.name = 'John';
      fixture.componentRef.instance.count = 5;
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`<input title="bonjour John - 5" placeholder="au revoir 5 - John">`);
    });

    it('on removed elements', () => {
      loadTranslations({
        [computeMsgId('text')]: 'texte',
        [computeMsgId('{$START_TAG_SPAN}content{$CLOSE_TAG_SPAN}')]: 'contenu',
      });
      const fixture =
          initWithTemplate(AppComp, `<div i18n><span i18n-title title="text">content</span></div>`);
      expect(fixture.nativeElement.innerHTML).toEqual(`<div>contenu</div>`);
    });

    it('with custom interpolation config', () => {
      loadTranslations({[computeMsgId('Hello {$INTERPOLATION}', 'm')]: 'Bonjour {$INTERPOLATION}'});
      const interpolation = ['{%', '%}'] as [string, string];
      TestBed.overrideComponent(AppComp, {set: {interpolation}});
      const fixture =
          initWithTemplate(AppComp, `<div i18n-title="m|d" title="Hello {% name %}"></div>`);

      const element = fixture.nativeElement.firstChild;
      expect(element.title).toBe('Bonjour Angular');
    });

    it('in nested template', () => {
      loadTranslations({[computeMsgId('Item {$INTERPOLATION}', 'm')]: 'Article {$INTERPOLATION}'});
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
      loadTranslations({[computeMsgId('Hello {$INTERPOLATION}')]: 'Bonjour {$INTERPOLATION}'});
      const fixture =
          initWithTemplate(AppComp, `<img src="logo.png" i18n-title title="Hello {{ name }}">`);

      const element = fixture.nativeElement.firstChild;
      expect(element.title).toBe('Bonjour Angular');
    });

    it('should process i18n attributes on explicit <ng-template> elements', () => {
      const titleDirInstances: TitleDir[] = [];
      loadTranslations({[computeMsgId('Hello')]: 'Bonjour'});

      @Directive({
        selector: '[title]',
      })
      class TitleDir {
        @Input() title = '';
        constructor() {
          titleDirInstances.push(this);
        }
      }

      @Component({
        selector: 'comp',
        template: '<ng-template i18n-title title="Hello"></ng-template>',
      })
      class Comp {
      }

      TestBed.configureTestingModule({
        declarations: [Comp, TitleDir],
      });

      const fixture = TestBed.createComponent(Comp);
      fixture.detectChanges();

      // make sure we only match `TitleDir` once
      expect(titleDirInstances.length).toBe(1);

      expect(titleDirInstances[0].title).toBe('Bonjour');
    });

    it('should match directive only once in case i18n attrs are present on inline template', () => {
      const titleDirInstances: TitleDir[] = [];
      loadTranslations({[computeMsgId('Hello')]: 'Bonjour'});

      @Directive({selector: '[title]'})
      class TitleDir {
        @Input() title: string = '';
        constructor(public elRef: ElementRef) {
          titleDirInstances.push(this);
        }
      }

      @Component({
        selector: 'my-cmp',
        template: `
          <button *ngIf="true" i18n-title title="Hello"></button>
        `,
      })
      class Cmp {
      }

      TestBed.configureTestingModule({
        imports: [CommonModule],
        declarations: [Cmp, TitleDir],
      });
      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      // make sure we only match `TitleDir` once and on the right element
      expect(titleDirInstances.length).toBe(1);
      expect(titleDirInstances[0].elRef.nativeElement instanceof HTMLButtonElement).toBeTruthy();

      expect(titleDirInstances[0].title).toBe('Bonjour');
    });

    it('should support static i18n attributes on inline templates', () => {
      loadTranslations({[computeMsgId('Hello')]: 'Bonjour'});
      @Component({
        selector: 'my-cmp',
        template: `
          <div *ngIf="true" i18n-title title="Hello"></div>
        `,
      })
      class Cmp {
      }

      TestBed.configureTestingModule({
        imports: [CommonModule],
        declarations: [Cmp],
      });
      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      expect(fixture.nativeElement.firstChild.title).toBe('Bonjour');
    });

    it('should allow directive inputs (as an interpolated prop) on <ng-template>', () => {
      loadTranslations({[computeMsgId('Hello {$INTERPOLATION}')]: 'Bonjour {$INTERPOLATION}'});

      let dirInstance: WithInput;
      @Directive({selector: '[dir]'})
      class WithInput {
        constructor() {
          dirInstance = this;
        }
        @Input() dir: string = '';
      }

      @Component({
        selector: 'my-app',
        template: '<ng-template i18n-dir dir="Hello {{ name }}"></ng-template>',
      })
      class TestComp {
        name = 'Angular';
      }

      TestBed.configureTestingModule({declarations: [TestComp, WithInput]});
      const fixture = TestBed.createComponent(TestComp);
      fixture.detectChanges();

      expect(dirInstance!.dir).toBe('Bonjour Angular');
    });

    it('should allow directive inputs (as interpolated props)' +
           'on <ng-template> with structural directives present',
       () => {
         loadTranslations({[computeMsgId('Hello {$INTERPOLATION}')]: 'Bonjour {$INTERPOLATION}'});

         let dirInstance: WithInput;
         @Directive({selector: '[dir]'})
         class WithInput {
           constructor() {
             dirInstance = this;
           }
           @Input() dir: string = '';
         }

         @Component({
           selector: 'my-app',
           template: '<ng-template *ngIf="true" i18n-dir dir="Hello {{ name }}"></ng-template>',
         })
         class TestComp {
           name = 'Angular';
         }

         TestBed.configureTestingModule({declarations: [TestComp, WithInput]});
         const fixture = TestBed.createComponent(TestComp);
         fixture.detectChanges();

         expect(dirInstance!.dir).toBe('Bonjour Angular');
       });

    it('should apply i18n attributes during second template pass', () => {
      loadTranslations({[computeMsgId('Set')]: 'Set'});
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
        [computeMsgId('{$INTERPOLATION} - {$INTERPOLATION_1} - {$INTERPOLATION_2}')]:
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
      expect(fixture.nativeElement.firstChild.title).toEqual(`ANGULAR - value 1 - value 2 (fr)`);
    });

    it('should support i18n attributes on <ng-container> elements', () => {
      loadTranslations({[computeMsgId('Hello', 'meaning')]: 'Bonjour'});

      @Directive({selector: '[mydir]'})
      class Dir {
        @Input() mydir: string = '';
      }

      @Component({
        selector: 'my-cmp',
        template: `
          <ng-container i18n-mydir="meaning|description" mydir="Hello"></ng-container>
        `,
      })
      class Cmp {
      }

      TestBed.configureTestingModule({
        declarations: [Cmp, Dir],
      });
      const fixture = TestBed.createComponent(Cmp);
      fixture.detectChanges();

      const dir = fixture.debugElement.childNodes[0].injector.get(Dir);
      expect(dir.mydir).toEqual('Bonjour');
    });
  });

  describe('empty translations', () => {
    it('should replace existing text content with empty translation', () => {
      loadTranslations({[computeMsgId('Some Text')]: ''});
      const fixture = initWithTemplate(AppComp, '<div i18n>Some Text</div>');
      expect(fixture.nativeElement.textContent).toBe('');
    });

    it('should replace existing DOM elements with empty translation', () => {
      loadTranslations({
        [computeMsgId(
            ' Start {$START_TAG_DIV}DIV{$CLOSE_TAG_DIV}' +
            '{$START_TAG_SPAN}SPAN{$CLOSE_TAG_SPAN} End ')]: '',
      });
      const fixture = initWithTemplate(AppComp, `
        <div i18n>
          Start
          <div>DIV</div>
          <span>SPAN</span>
          End
        </div>
      `);
      expect(fixture.nativeElement.textContent).toBe('');
    });

    it('should replace existing ICU content with empty translation', () => {
      loadTranslations({
        [computeMsgId('{VAR_PLURAL, plural, =0 {zero} other {more than zero}}')]: '',
      });
      const fixture = initWithTemplate(AppComp, `
        <div i18n>{count, plural, =0 {zero} other {more than zero}}</div>
      `);
      expect(fixture.nativeElement.textContent).toBe('');
    });
  });

  it('should work with directives and host bindings', () => {
    let directiveInstances: ClsDir[] = [];

    @Directive({selector: '[test]'})
    class ClsDir {
      @HostBinding('className') klass = 'foo';

      constructor() {
        directiveInstances.push(this);
      }
    }

    @Component({
      selector: `my-app`,
      template: `
      <div i18n test i18n-title title="start {{exp1}} middle {{exp2}} end" outer>
         trad: {exp1, plural,
              =0 {no <b title="none">emails</b>!}
              =1 {one <i>email</i>}
              other {{{exp1}} emails}
         }
      </div><div test inner></div>`
    })
    class MyApp {
      exp1 = 1;
      exp2 = 2;
    }

    TestBed.configureTestingModule({declarations: [ClsDir, MyApp]});
    loadTranslations({
      // Note that this translation switches the order of the expressions!
      [computeMsgId('start {$INTERPOLATION} middle {$INTERPOLATION_1} end')]:
          'début {$INTERPOLATION_1} milieu {$INTERPOLATION} fin',
      [computeMsgId(
          '{VAR_PLURAL, plural, =0 {no {START_BOLD_TEXT}emails{CLOSE_BOLD_TEXT}!} =1 {one {START_ITALIC_TEXT}email{CLOSE_ITALIC_TEXT}} other {{INTERPOLATION} emails}}')]:
          '{VAR_PLURAL, plural, =0 {aucun {START_BOLD_TEXT}email{CLOSE_BOLD_TEXT}!} =1 {un {START_ITALIC_TEXT}email{CLOSE_ITALIC_TEXT}} other {{INTERPOLATION} emails}}',
      [computeMsgId(' trad: {$ICU} ')]: ' traduction: {$ICU} '
    });
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();

    const outerDiv: HTMLElement = fixture.nativeElement.querySelector('div[outer]');
    const innerDiv: HTMLElement = fixture.nativeElement.querySelector('div[inner]');

    // Note that ideally we'd just compare the innerHTML here, but different browsers return
    // the order of attributes differently. E.g. most browsers preserve the declaration
    // order, but IE does not.
    expect(outerDiv.getAttribute('title')).toBe('début 2 milieu 1 fin');
    expect(outerDiv.getAttribute('class')).toBe('foo');
    expect(outerDiv.textContent!.trim()).toBe('traduction: un email');
    expect(innerDiv.getAttribute('class')).toBe('foo');

    directiveInstances.forEach(instance => instance.klass = 'bar');
    fixture.componentRef.instance.exp1 = 2;
    fixture.componentRef.instance.exp2 = 3;
    fixture.detectChanges();

    expect(outerDiv.getAttribute('title')).toBe('début 3 milieu 2 fin');
    expect(outerDiv.getAttribute('class')).toBe('bar');
    expect(outerDiv.textContent!.trim()).toBe('traduction: 2 emails');
    expect(innerDiv.getAttribute('class')).toBe('bar');
  });

  it('should handle i18n attribute with directive inputs', () => {
    let calledTitle = false;
    let calledValue = false;
    @Component({selector: 'my-comp', template: ''})
    class MyComp {
      t!: string;
      @Input()
      get title() {
        return this.t;
      }
      set title(title) {
        calledTitle = true;
        this.t = title;
      }

      @Input()
      get value() {
        return this.val;
      }
      set value(value: string) {
        calledValue = true;
        this.val = value;
      }
      val!: string;
    }

    TestBed.configureTestingModule({declarations: [AppComp, MyComp]});
    loadTranslations({
      [computeMsgId('Hello {$INTERPOLATION}')]: 'Bonjour {$INTERPOLATION}',
      [computeMsgId('works')]: 'fonctionne',
    });
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
      [computeMsgId(
          '{$START_TAG_DIV2}{$CLOSE_TAG_DIV2}' +
          '{$START_TAG_DIV3}{$CLOSE_TAG_DIV3}' +
          '{$START_TAG_DIV4}{$CLOSE_TAG_DIV4}' +
          '{$START_TAG_DIV5}{$CLOSE_TAG_DIV5}' +
          '{$START_TAG_DIV6}{$CLOSE_TAG_DIV6}' +
          '{$START_TAG_DIV7}{$CLOSE_TAG_DIV7}' +
          '{$START_TAG_DIV8}{$CLOSE_TAG_DIV8}')]: '{$START_TAG_DIV2}{$CLOSE_TAG_DIV2}' +
          '{$START_TAG_DIV8}{$CLOSE_TAG_DIV8}' +
          '{$START_TAG_DIV4}{$CLOSE_TAG_DIV4}' +
          '{$START_TAG_DIV5}{$CLOSE_TAG_DIV5}Bonjour monde' +
          '{$START_TAG_DIV3}{$CLOSE_TAG_DIV3}' +
          '{$START_TAG_DIV7}{$CLOSE_TAG_DIV7}'
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
        [computeMsgId('Child of {$INTERPOLATION}')]: 'Enfant de {$INTERPOLATION}',
        [computeMsgId(
            '{$START_TAG_CHILD}I am projected from' +
            ' {$START_BOLD_TEXT}{$INTERPOLATION}{$START_TAG_REMOVE_ME_1}{$CLOSE_TAG_REMOVE_ME_1}{$CLOSE_BOLD_TEXT}' +
            '{$START_TAG_REMOVE_ME_2}{$CLOSE_TAG_REMOVE_ME_2}' +
            '{$CLOSE_TAG_CHILD}' +
            '{$START_TAG_REMOVE_ME_3}{$CLOSE_TAG_REMOVE_ME_3}')]:
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
        [computeMsgId('Child of {$INTERPOLATION}')]: 'Enfant de {$INTERPOLATION}',
        [computeMsgId('I am projected from {$INTERPOLATION}')]:
            'Je suis projeté depuis {$INTERPOLATION}'
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
      @Component({selector: 'grand-child', template: '<div><ng-content></ng-content></div>'})
      class GrandChild {
      }

      @Component(
          {selector: 'child', template: '<grand-child><ng-content></ng-content></grand-child>'})
      class Child {
      }

      @Component({selector: 'parent', template: `<child i18n><b>Hello</b> World!</child>`})
      class Parent {
        name: string = 'Parent';
      }

      TestBed.configureTestingModule({declarations: [Parent, Child, GrandChild]});
      loadTranslations({
        [computeMsgId('{$START_BOLD_TEXT}Hello{$CLOSE_BOLD_TEXT} World!')]:
            '{$START_BOLD_TEXT}Bonjour{$CLOSE_BOLD_TEXT} monde!'
      });
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual('<child><grand-child><div><b>Bonjour</b> monde!</div></grand-child></child>');
    });

    it('should be able to remove projected placeholders', () => {
      @Component({selector: 'grand-child', template: '<div><ng-content></ng-content></div>'})
      class GrandChild {
      }

      @Component(
          {selector: 'child', template: '<grand-child><ng-content></ng-content></grand-child>'})
      class Child {
      }

      @Component({selector: 'parent', template: `<child i18n><b>Hello</b> World!</child>`})
      class Parent {
        name: string = 'Parent';
      }

      TestBed.configureTestingModule({declarations: [Parent, Child, GrandChild]});
      loadTranslations(
          {[computeMsgId('{$START_BOLD_TEXT}Hello{$CLOSE_BOLD_TEXT} World!')]: 'Bonjour monde!'});
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual('<child><grand-child><div>Bonjour monde!</div></grand-child></child>');
    });

    it('should project translations with selectors', () => {
      @Component({selector: 'child', template: `<ng-content select='span'></ng-content>`})
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
        [computeMsgId('{$START_TAG_SPAN}{$CLOSE_TAG_SPAN}{$START_TAG_SPAN_1}{$CLOSE_TAG_SPAN}')]:
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
        [computeMsgId('Content projected from {$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT}')]:
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
        [computeMsgId('Content projected from {$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT}')]:
            '{$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT} a projeté le contenu'
      });
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`<child><div><b>Parent</b> a projeté le contenu</div></child>`);
    });

    it('should project translated content in i18n blocks', () => {
      @Component(
          {selector: 'child', template: `<div i18n>Child content <ng-content></ng-content></div>`})
      class Child {
      }

      @Component({selector: 'parent', template: `<child i18n>and projection from {{name}}</child>`})
      class Parent {
        name: string = 'Parent';
      }
      TestBed.configureTestingModule({declarations: [Parent, Child]});
      loadTranslations({
        [computeMsgId('Child content {$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT}')]:
            'Contenu enfant {$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT}',
        [computeMsgId('and projection from {$INTERPOLATION}')]:
            'et projection depuis {$INTERPOLATION}'
      });
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`<child><div>Contenu enfant et projection depuis Parent</div></child>`);
    });

    it('should project bare ICU expressions', () => {
      loadTranslations({
        [computeMsgId('{VAR_PLURAL, plural, =1 {one} other {at least {INTERPOLATION} .}}')]:
            '{VAR_PLURAL, plural, =1 {one} other {at least {INTERPOLATION} .}}'
      });
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

      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toContain('at least');
    });

    it('should project ICUs in i18n blocks', () => {
      @Component(
          {selector: 'child', template: `<div i18n>Child content <ng-content></ng-content></div>`})
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
        [computeMsgId('{VAR_SELECT, select, angular {Angular} other {{INTERPOLATION}}}')]:
            '{VAR_SELECT, select, angular {Angular} other {{INTERPOLATION}}}',
        [computeMsgId('Child content {$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT}')]:
            'Contenu enfant {$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT}',
        [computeMsgId('and projection from {$ICU}')]: 'et projection depuis {$ICU}'
      });
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`<child><div>Contenu enfant et projection depuis Parent<!--ICU ${
              HEADER_OFFSET + 1}:0--></div></child>`);

      fixture.componentRef.instance.name = 'angular';
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML)
          .toEqual(`<child><div>Contenu enfant et projection depuis Angular<!--ICU ${
              HEADER_OFFSET + 1}:0--></div></child>`);
    });

    it(`shouldn't project deleted projections in i18n blocks`, () => {
      @Component(
          {selector: 'child', template: `<div i18n>Child content <ng-content></ng-content></div>`})
      class Child {
      }

      @Component({selector: 'parent', template: `<child i18n>and projection from {{name}}</child>`})
      class Parent {
        name: string = 'Parent';
      }
      TestBed.configureTestingModule({declarations: [Parent, Child]});
      loadTranslations({
        [computeMsgId('Child content {$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT}')]:
            'Contenu enfant',
        [computeMsgId('and projection from {$INTERPOLATION}')]:
            'et projection depuis {$INTERPOLATION}'
      });
      const fixture = TestBed.createComponent(Parent);
      fixture.detectChanges();
      expect(fixture.nativeElement.innerHTML).toEqual(`<child><div>Contenu enfant</div></child>`);
    });

    it('should display/destroy projected i18n content', () => {
      loadTranslations({
        [computeMsgId('{VAR_SELECT, select, A {A} B {B} other {other}}')]:
            '{VAR_SELECT, select, A {A} B {B} other {other}}'
      });
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
        text!: string;
        constructor() {}
      }

      @Component({selector: 'div-query', template: '<ng-container #vc></ng-container>'})
      class DivQuery {
        // TODO(issue/24571): remove '!'.
        @ContentChild(TemplateRef, {static: true}) template !: TemplateRef<any>;

        // TODO(issue/24571): remove '!'.
        @ViewChild('vc', {read: ViewContainerRef, static: true}) vc!: ViewContainerRef;

        // TODO(issue/24571): remove '!'.
        @ContentChildren(TextDirective, {descendants: true}) query!: QueryList<TextDirective>;

        create() {
          this.vc.createEmbeddedView(this.template);
        }

        destroy() {
          this.vc.clear();
        }
      }

      TestBed.configureTestingModule({declarations: [TextDirective, DivQuery]});
      loadTranslations({
        [computeMsgId(
            '{$START_TAG_NG_TEMPLATE}{$START_TAG_DIV_1}' +
            '{$START_TAG_DIV}' +
            '{$START_TAG_SPAN}Content{$CLOSE_TAG_SPAN}' +
            '{$CLOSE_TAG_DIV}' +
            '{$CLOSE_TAG_DIV}{$CLOSE_TAG_NG_TEMPLATE}')]:
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

  describe('invalid translations handling', () => {
    it('should throw in case invalid ICU is present in a template', () => {
      // Error message is produced by Compiler.
      expect(() => initWithTemplate(AppComp, '{count, select, 10 {ten} other {other}'))
          .toThrowError(
              /Invalid ICU message. Missing '}'. \("{count, select, 10 {ten} other {other}\[ERROR ->\]"\)/);
    });

    it('should throw in case invalid ICU is present in translation', () => {
      loadTranslations({
        [computeMsgId('{VAR_SELECT, select, 10 {ten} other {other}}')]:
            // Missing "}" at the end of translation.
            '{VAR_SELECT, select, 10 {dix} other {autre}'
      });

      // Error message is produced at runtime.
      expect(() => initWithTemplate(AppComp, '{count, select, 10 {ten} other {other}}'))
          .toThrowError(
              /Unable to parse ICU expression in "{�0�, select, 10 {dix} other {autre}" message./);
    });

    it('should throw in case unescaped curly braces are present in a template', () => {
      // Error message is produced by Compiler.
      expect(() => initWithTemplate(AppComp, 'Text { count }'))
          .toThrowError(
              /Do you have an unescaped "{" in your template\? Use "{{ '{' }}"\) to escape it/);
    });

    it('should throw in case curly braces are added into translation', () => {
      loadTranslations({
        // Curly braces which were not present in a template were added into translation.
        [computeMsgId('Text')]: 'Text { count }',
      });
      expect(() => initWithTemplate(AppComp, '<div i18n>Text</div>'))
          .toThrowError(/Unable to parse ICU expression in "Text { count }" message./);
    });
  });

  it('should handle extra HTML in translation as plain text', () => {
    loadTranslations({
      // Translation contains HTML tags that were not present in original message.
      [computeMsgId('Text')]: 'Text <div *ngIf="true">Extra content</div>',
    });
    const fixture = initWithTemplate(AppComp, '<div i18n>Text</div>');

    const element = fixture.nativeElement;
    expect(element).toHaveText('Text <div *ngIf="true">Extra content</div>');
  });

  it('should reflect lifecycle hook changes in text interpolations in i18n block', () => {
    @Directive({selector: 'input'})
    class InputsDir {
      constructor(private elementRef: ElementRef) {}
      ngOnInit() {
        this.elementRef.nativeElement.value = 'value set in Directive.ngOnInit';
      }
    }

    @Component({
      template: `
        <input #myinput>
        <div i18n>{{myinput.value}}</div>
      `
    })
    class App {
    }

    TestBed.configureTestingModule({declarations: [App, InputsDir]});

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('value set in Directive.ngOnInit');
  });

  it('should reflect lifecycle hook changes in text interpolations in i18n attributes', () => {
    @Directive({selector: 'input'})
    class InputsDir {
      constructor(private elementRef: ElementRef) {}
      ngOnInit() {
        this.elementRef.nativeElement.value = 'value set in Directive.ngOnInit';
      }
    }

    @Component({
      template: `
        <input #myinput>
        <div i18n-title title="{{myinput.value}}"></div>
      `
    })
    class App {
    }

    TestBed.configureTestingModule({declarations: [App, InputsDir]});

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('div').title)
        .toContain('value set in Directive.ngOnInit');
  });

  it('should not alloc expando slots when there is no new variable to create', () => {
    loadTranslations({
      [computeMsgId('{$START_TAG_DIV} Some content {$CLOSE_TAG_DIV}')]:
          '{$START_TAG_DIV} Some content {$CLOSE_TAG_DIV}',
      [computeMsgId(
          '{$START_TAG_SPAN_1}{$ICU}{$CLOSE_TAG_SPAN} - {$START_TAG_SPAN_1}{$ICU_1}{$CLOSE_TAG_SPAN}')]:
          '{$START_TAG_SPAN_1}{$ICU}{$CLOSE_TAG_SPAN} - {$START_TAG_SPAN_1}{$ICU_1}{$CLOSE_TAG_SPAN}',
    });
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

    TestBed.configureTestingModule({declarations: [DialogDir, CloseBtn, ContentElementDialog]});

    const fixture = TestBed.createComponent(ContentElementDialog);
    fixture.detectChanges();

    // Remove the reflect attribute, because the attribute order in innerHTML
    // isn't guaranteed in different browsers so it could throw off our assertions.
    const button = fixture.nativeElement.querySelector('button');
    button.removeAttribute('ng-reflect-dialog-result');

    expect(fixture.nativeElement.innerHTML).toEqual(`<div dialog=""><!--bindings={
  "ng-reflect-ng-if": "false"
}--></div><button title="Close dialog">Button label</button>`);
  });

  describe('ngTemplateOutlet', () => {
    it('should work with i18n content that includes elements', () => {
      loadTranslations({
        [computeMsgId('{$START_TAG_SPAN}A{$CLOSE_TAG_SPAN} B ')]:
            '{$START_TAG_SPAN}a{$CLOSE_TAG_SPAN} b',
      });

      const fixture = initWithTemplate(AppComp, `
        <ng-container *ngTemplateOutlet="tmpl"></ng-container>
        <ng-template #tmpl i18n>
          <span>A</span> B
        </ng-template>
      `);
      expect(fixture.nativeElement.textContent).toContain('a b');
    });

    it('should work with i18n content that includes other templates (*ngIf)', () => {
      loadTranslations({
        [computeMsgId('{$START_TAG_SPAN}A{$CLOSE_TAG_SPAN} B ')]:
            '{$START_TAG_SPAN}a{$CLOSE_TAG_SPAN} b',
      });

      const fixture = initWithTemplate(AppComp, `
        <ng-container *ngTemplateOutlet="tmpl"></ng-container>
        <ng-template #tmpl i18n>
          <span *ngIf="visible">A</span> B
        </ng-template>
      `);
      expect(fixture.nativeElement.textContent).toContain('a b');
    });

    it('should work with i18n content that includes projection', () => {
      loadTranslations({
        [computeMsgId('{$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT} B ')]:
            '{$START_TAG_NG_CONTENT}{$CLOSE_TAG_NG_CONTENT} b',
      });

      @Component({
        selector: 'projector',
        template: `
          <ng-container *ngTemplateOutlet="tmpl"></ng-container>
          <ng-template #tmpl i18n>
            <ng-content></ng-content> B
          </ng-template>
        `
      })
      class Projector {
      }

      @Component({
        selector: 'app',
        template: `
          <projector>a</projector>
        `
      })
      class AppComponent {
      }

      TestBed.configureTestingModule({declarations: [AppComponent, Projector]});

      const fixture = TestBed.createComponent(AppComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('a b');
    });
  });

  describe('viewContainerRef with i18n', () => {
    it('should create ViewContainerRef with i18n', () => {
      // This test demonstrates an issue with creating a `ViewContainerRef` and having i18n at the
      // parent element. The reason this broke is that in this case the `ViewContainerRef` creates
      // an dynamic anchor comment but uses `HostTNode` for it which is incorrect. `appendChild`
      // then tries to add internationalization to the comment node and fails.
      @Component({
        template: `
            <div i18n>before|<div myDir>inside</div>|after</div>
          `
      })
      class MyApp {
      }

      @Directive({selector: '[myDir]'})
      class MyDir {
        constructor(vcRef: ViewContainerRef) {
          myDir = this;
        }
      }
      let myDir!: MyDir;


      TestBed.configureTestingModule({declarations: [MyApp, MyDir]});
      const fixture = TestBed.createComponent(MyApp);
      fixture.detectChanges();
      expect(myDir).toBeDefined();
      expect(fixture.nativeElement.textContent).toEqual(`before|inside|after`);
    });
  });

  it('should create ICU with attributes', () => {
    // This test demonstrates an issue with setting attributes on ICU elements.
    // NOTE: This test is extracted from g3.
    @Component({
      template: `
            <h1 class="num-cart-items" i18n *ngIf="true">{
              registerItemCount, plural,
              =0 {Your cart}
              =1 {Your cart <span class="item-count">(1 item)</span>}
              other {
                Your cart <span class="item-count">({{
                  registerItemCount
                }} items)</span>
              }
          }</h1>`
    })
    class MyApp {
      registerItemCount = 1;
    }

    TestBed.configureTestingModule({declarations: [MyApp]});
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toEqual(`Your cart (1 item)`);
  });

  it('should not insertBeforeIndex non-projected content text', () => {
    // This test demonstrates an issue with setting attributes on ICU elements.
    // NOTE: This test is extracted from g3.
    @Component({template: `<div i18n>before|<child>TextNotProjected</child>|after</div>`})
    class MyApp {
    }

    @Component({
      selector: 'child',
      template: 'CHILD',
    })
    class Child {
    }

    TestBed.configureTestingModule({declarations: [MyApp, Child]});
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toEqual(`before|CHILD|after`);
  });

  it('should create a pipe inside i18n block', () => {
    // This test demonstrates an issue with i18n messing up `getCurrentTNode` which subsequently
    // breaks the DI. The issue is that the `i18nStartFirstCreatePass` would create placeholder
    // NODES, and than leave `getCurrentTNode` in undetermined state which would then break DI.
    // NOTE: This test is extracted from g3.
    @Component({
      template: `
      <div i18n [title]="null | async"><div>A</div></div>
      <div i18n>{{(null | async)||'B'}}<div></div></div>`
    })
    class MyApp {
    }

    TestBed.configureTestingModule({declarations: [MyApp]});
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toEqual(`AB`);
  });


  it('should copy injector information unto placeholder', () => {
    // This test demonstrates an issue with i18n Placeholders loosing `injectorIndex` information.
    // NOTE: This test is extracted from g3.
    @Component({
      template: `
        <parent i18n>
          <middle>
            <child>Text</child>
          </middle>
        </parent>`
    })
    class MyApp {
    }

    @Component({selector: 'parent'})
    class Parent {
    }

    @Component({selector: 'middle'})
    class Middle {
    }
    @Component({selector: 'child'})
    class Child {
      constructor(public middle: Middle) {
        child = this;
      }
    }
    let child!: Child;


    TestBed.configureTestingModule({declarations: [MyApp, Parent, Middle, Child]});
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();
    expect(child.middle).toBeInstanceOf(Middle);
  });

  it('should allow container in gotClosestRElement', () => {
    // A second iteration of the loop will have `Container` `TNode`s pass through the system.
    // NOTE: This test is extracted from g3.
    @Component({
      template: `
      <div *ngFor="let i of [1,2]">
        <ng-template #tmpl i18n><span *ngIf="true">X</span></ng-template>
        <span [ngTemplateOutlet]="tmpl"></span>
      </div>`
    })
    class MyApp {
    }

    TestBed.configureTestingModule({declarations: [MyApp]});
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toEqual(`XX`);
  });


  it('should link text after ICU', () => {
    // i18n block must restore the current `currentTNode` so that trailing text node can link to it.
    // NOTE: This test is extracted from g3.
    @Component({
      template: `
        <ng-container *ngFor="let index of [1, 2]">
          {{'['}}
          {index, plural, =1 {1} other {*}}
          {index, plural, =1 {one} other {many}}
          {{'-'}}
          <span>+</span>
          {{'-'}}
          {index, plural, =1 {first} other {rest}}
          {{']'}}
        </ng-container>
        /
        <ng-container *ngFor="let index of [1, 2]" i18n>
          {{'['}}
          {index, plural, =1 {1} other {*}}
          {index, plural, =1 {one} other {many}}
          {{'-'}}
          <span>+</span>
          {{'-'}}
          {index, plural, =1 {first} other {rest}}
          {{']'}}
        </ng-container>
      `
    })
    class MyApp {
    }

    TestBed.configureTestingModule({declarations: [MyApp]});
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();
    const textContent = fixture.nativeElement.textContent as string;
    expect(textContent.split('/').map(s => s.trim())).toEqual([
      '[ 1 one - + - first ]  [ * many - + - rest ]',
      '[ 1 one - + - first ]  [ * many - + - rest ]',
    ]);
  });

  it('should ignore non-instantiated ICUs on update', () => {
    // Demonstrates an issue of same selector expression used in nested ICUs, causes non
    // instantiated nested ICUs to be updated.
    // NOTE: This test is extracted from g3.
    @Component({
      template: `
        before|
        { retention.unit, select,
          SECONDS {
              {retention.durationInUnits, plural,
                  =1 {1 second}
                  other {{{retention.durationInUnits}} seconds}
                  }
              }
          DAYS {
              {retention.durationInUnits, plural,
                  =1 {1 day}
                  other {{{retention.durationInUnits}} days}
                  }
              }
          MONTHS {
              {retention.durationInUnits, plural,
                  =1 {1 month}
                  other {{{retention.durationInUnits}} months}
                  }
              }
          YEARS {
              {retention.durationInUnits, plural,
                  =1 {1 year}
                  other {{{retention.durationInUnits}} years}
                  }
              }
          other {}
          }
        |after.
      `
    })
    class MyApp {
      retention = {
        durationInUnits: 10,
        unit: 'SECONDS',
      };
    }

    TestBed.configureTestingModule({declarations: [MyApp]});
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();
    const textContent = fixture.nativeElement.textContent as string;
    expect(textContent.replace(/\s+/g, ' ').trim()).toEqual(`before| 10 seconds |after.`);
  });

  it('should render attributes defined in ICUs', () => {
    // NOTE: This test is extracted from g3.
    @Component({
      template: `
        <div i18n>{
          parameters.length,
          plural,
          =1 {Affects parameter <span class="parameter-name" attr="should_be_present">{{parameters[0].name}}</span>}
          other {Affects {{parameters.length}} parameters, including <span
              class="parameter-name">{{parameters[0].name}}</span>}
          }</div>
        `
    })
    class MyApp {
      parameters = [{name: 'void_abt_param'}];
    }

    TestBed.configureTestingModule({declarations: [MyApp]});
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();
    const span = (fixture.nativeElement as HTMLElement).querySelector('span')!;
    expect(span.getAttribute('attr')).toEqual('should_be_present');
    expect(span.getAttribute('class')).toEqual('parameter-name');
  });

  it('should support different ICUs cases for each *ngFor iteration', () => {
    @Component({
      template: `
      <ul i18n>
        <li *ngFor="let item of items">{
          item, plural,
          =1 {<b>one</b>}
          =2 {<i>two</i>}
      },</li>
      </ul>`
    })
    class MyApp {
      items = [1, 2];
    }

    TestBed.configureTestingModule({declarations: [MyApp]});
    const fixture = TestBed.createComponent(MyApp);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toEqual(`one,two,`);

    fixture.componentInstance.items = [2, 1];
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toEqual(`two,one,`);
  });

  it('should be able to inject a static i18n attribute', () => {
    loadTranslations({[computeMsgId('text')]: 'translatedText'});

    @Directive({selector: '[injectTitle]'})
    class InjectTitleDir {
      constructor(@Attribute('title') public title: string) {}
    }

    @Component({template: `<div i18n-title title="text" injectTitle></div>`})
    class App {
      @ViewChild(InjectTitleDir) dir!: InjectTitleDir;
    }

    TestBed.configureTestingModule({declarations: [App, InjectTitleDir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance.dir.title).toBe('translatedText');
    expect(fixture.nativeElement.querySelector('div').getAttribute('title')).toBe('translatedText');
  });

  it('should inject `null` for an i18n attribute with an interpolation', () => {
    loadTranslations({[computeMsgId('text {$INTERPOLATION}')]: 'translatedText {$INTERPOLATION}'});

    @Directive({selector: '[injectTitle]'})
    class InjectTitleDir {
      constructor(@Attribute('title') public title: string) {}
    }

    @Component({template: `<div i18n-title title="text {{ value }}" injectTitle></div>`})
    class App {
      @ViewChild(InjectTitleDir) dir!: InjectTitleDir;
      value = 'value';
    }

    TestBed.configureTestingModule({declarations: [App, InjectTitleDir]});
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance.dir.title).toBeNull();
    expect(fixture.nativeElement.querySelector('div').getAttribute('title'))
        .toBe('translatedText value');
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
  ngOnInit() {
    this.vcRef.createEmbeddedView(this.tplRef, {});
  }
}

@Pipe({name: 'uppercase'})
class UppercasePipe implements PipeTransform {
  transform(value: string) {
    return value.toUpperCase();
  }
}

@Directive({selector: `[dialog]`})
export class DialogDir {
}

@Directive({selector: `button[close]`, host: {'[title]': 'name'}})
export class CloseBtn {
  @Input('close') dialogResult: any;
  name: string = 'Close dialog';
}
