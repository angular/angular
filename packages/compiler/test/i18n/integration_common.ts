/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {NgLocalization} from '@angular/common';
import {Serializer} from '@angular/compiler/src/i18n';
import {MessageBundle} from '@angular/compiler/src/i18n/message_bundle';
import {HtmlParser} from '@angular/compiler/src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '@angular/compiler/src/ml_parser/interpolation_config';
import {ResourceLoader} from '@angular/compiler/src/resource_loader';
import {Component, DebugElement, TRANSLATIONS, TRANSLATIONS_FORMAT} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {stringifyElement} from '@angular/platform-browser/testing/src/browser_util';
import {expect} from '@angular/platform-browser/testing/src/matchers';

@Component({
  selector: 'i18n-cmp',
  template: '',
})
export class I18nComponent {
  count?: number;
  sex?: string;
  sexB?: string;
  response: any = {getItemsList: (): any[] => []};
}

export class FrLocalization extends NgLocalization {
  public static PROVIDE = {provide: NgLocalization, useClass: FrLocalization, deps: []};
  override getPluralCategory(value: number): string {
    switch (value) {
      case 0:
      case 1:
        return 'one';
      default:
        return 'other';
    }
  }
}

export function validateHtml(
    tb: ComponentFixture<I18nComponent>, cmp: I18nComponent, el: DebugElement) {
  expectHtml(el, 'h1').toBe('<h1>attributs i18n sur les balises</h1>');
  expectHtml(el, '#i18n-1').toBe('<div id="i18n-1"><p>imbriqué</p></div>');
  expectHtml(el, '#i18n-2').toBe('<div id="i18n-2"><p>imbriqué</p></div>');
  expectHtml(el, '#i18n-3').toBe('<div id="i18n-3"><p><i>avec des espaces réservés</i></p></div>');
  expectHtml(el, '#i18n-3b')
      .toBe(
          '<div id="i18n-3b"><p><i class="preserved-on-placeholders">avec des espaces réservés</i></p></div>');
  expectHtml(el, '#i18n-4')
      .toBe('<p data-html="<b>gras</b>" id="i18n-4" title="sur des balises non traductibles"></p>');
  expectHtml(el, '#i18n-5').toBe('<p id="i18n-5" title="sur des balises traductibles"></p>');
  expectHtml(el, '#i18n-6').toBe('<p id="i18n-6" title=""></p>');

  cmp.count = 0;
  tb.detectChanges();
  expect(el.query(By.css('#i18n-7')).nativeElement).toHaveText('zero');
  expect(el.query(By.css('#i18n-14')).nativeElement).toHaveText('zero');
  cmp.count = 1;
  tb.detectChanges();
  expect(el.query(By.css('#i18n-7')).nativeElement).toHaveText('un');
  expect(el.query(By.css('#i18n-14')).nativeElement).toHaveText('un');
  expect(el.query(By.css('#i18n-17')).nativeElement).toHaveText('un');
  cmp.count = 2;
  tb.detectChanges();
  expect(el.query(By.css('#i18n-7')).nativeElement).toHaveText('deux');
  expect(el.query(By.css('#i18n-14')).nativeElement).toHaveText('deux');
  expect(el.query(By.css('#i18n-17')).nativeElement).toHaveText('deux');
  cmp.count = 3;
  tb.detectChanges();
  expect(el.query(By.css('#i18n-7')).nativeElement).toHaveText('beaucoup');
  expect(el.query(By.css('#i18n-14')).nativeElement).toHaveText('beaucoup');
  expect(el.query(By.css('#i18n-17')).nativeElement).toHaveText('beaucoup');

  cmp.sex = 'male';
  cmp.sexB = 'female';
  tb.detectChanges();
  expect(el.query(By.css('#i18n-8')).nativeElement).toHaveText('homme');
  expect(el.query(By.css('#i18n-8b')).nativeElement).toHaveText('femme');
  cmp.sex = 'female';
  tb.detectChanges();
  expect(el.query(By.css('#i18n-8')).nativeElement).toHaveText('femme');
  cmp.sex = '0';
  tb.detectChanges();
  expect(el.query(By.css('#i18n-8')).nativeElement).toHaveText('autre');

  cmp.count = 123;
  tb.detectChanges();
  expectHtml(el, '#i18n-9').toEqual('<div id="i18n-9">count = 123</div>');

  cmp.sex = 'f';
  tb.detectChanges();
  expectHtml(el, '#i18n-10').toEqual('<div id="i18n-10">sexe = f</div>');

  expectHtml(el, '#i18n-11').toEqual('<div id="i18n-11">custom name</div>');
  expectHtml(el, '#i18n-12').toEqual('<h1 id="i18n-12">Balises dans les commentaires html</h1>');
  expectHtml(el, '#i18n-13').toBe('<div id="i18n-13" title="dans une section traductible"></div>');
  expectHtml(el, '#i18n-15').toMatch(/ca <b>devrait<\/b> marcher/);
  expectHtml(el, '#i18n-16').toMatch(/avec un ID explicite/);

  expectHtml(el, '#i18n-17-5').toContain('Pas de réponse');
  cmp.response.getItemsList = () => ['a'];
  tb.detectChanges();
  expectHtml(el, '#i18n-17-5').toContain('Une réponse');
  cmp.response.getItemsList = () => ['a', 'b'];
  tb.detectChanges();
  expectHtml(el, '#i18n-17-5').toContain('2 réponses');

  expectHtml(el, '#i18n-18')
      .toEqual('<div id="i18n-18">FOO<a title="dans une section traductible">BAR</a></div>');
}

function expectHtml(el: DebugElement, cssSelector: string): any {
  return expect(stringifyElement(el.query(By.css(cssSelector)).nativeElement));
}

export const HTML = `
<div>
    <h1 i18n>i18n attribute on tags</h1>

    <div id="i18n-1"><p i18n>nested</p></div>

    <div id="i18n-2"><p i18n="different meaning|">nested</p></div>

    <div id="i18n-3"><p i18n><i>with placeholders</i></p></div>
    <div id="i18n-3b"><p i18n><i class="preserved-on-placeholders">with placeholders</i></p></div>
    <div id="i18n-3c"><div i18n><div>with <div>nested</div> placeholders</div></div></div>

    <div>
        <p id="i18n-4" i18n-title title="on not translatable node" i18n-data-html data-html="<b>bold</b>"></p>
        <p id="i18n-5" i18n i18n-title title="on translatable node"></p>
        <p id="i18n-6" i18n-title title></p>
    </div>

    <!-- no ph below because the ICU node is the only child of the div, i.e. no text nodes -->
    <div i18n id="i18n-7">{count, plural, =0 {zero} =1 {one} =2 {two} other {<b>many</b>}}</div>

    <div i18n id="i18n-8">
        {sex, select, male {m} female {f} other {other}}
    </div>
    <div i18n id="i18n-8b">
        {sexB, select, male {m} female {f}}
    </div>

    <div i18n id="i18n-9">{{ "count = " + count }}</div>
    <div i18n id="i18n-10">sex = {{ sex }}</div>
    <div i18n id="i18n-11">{{ "custom name" //i18n(ph="CUSTOM_NAME") }}</div>
</div>

<!-- i18n -->
    <h1 id="i18n-12" >Markers in html comments</h1>
    <div id="i18n-13" i18n-title title="in a translatable section"></div>
    <div id="i18n-14">{count, plural, =0 {zero} =1 {one} =2 {two} other {<b>many</b>}}</div>
<!-- /i18n -->

<div id="i18n-15"><ng-container i18n>it <b>should</b> work</ng-container></div>

<div id="i18n-16" i18n="@@i18n16">with an explicit ID</div>
<div id="i18n-17" i18n="@@i18n17">{count, plural, =0 {zero} =1 {one} =2 {two} other {<b>many</b>}}</div>

<!-- make sure that ICU messages are not treated as text nodes -->
<div id="i18n-17-5" i18n="desc">{
    response.getItemsList().length,
    plural,
    =0 {Found no results}
    =1 {Found one result}
    other {Found {{response.getItemsList().length}} results}
}</div>

<div i18n id="i18n-18">foo<a i18n-title title="in a translatable section">bar</a></div>

<div id="i18n-19" i18n>{{ 'test' //i18n(ph="map name") }}</div>
`;

export async function configureCompiler(translationsToMerge: string, format: string) {
  TestBed.configureCompiler({
    providers: [
      {provide: ResourceLoader, useValue: jasmine.createSpyObj('ResourceLoader', ['get'])},
      FrLocalization.PROVIDE,
      {provide: TRANSLATIONS, useValue: translationsToMerge},
      {provide: TRANSLATIONS_FORMAT, useValue: format},
    ]
  });
  TestBed.configureTestingModule({declarations: [I18nComponent]});
}

export function createComponent(html: string) {
  const tb: ComponentFixture<I18nComponent> =
      TestBed.overrideTemplate(I18nComponent, html).createComponent(I18nComponent);
  return {tb, cmp: tb.componentInstance, el: tb.debugElement};
}

export function serializeTranslations(html: string, serializer: Serializer) {
  const catalog = new MessageBundle(new HtmlParser, [], {});
  catalog.updateFromTemplate(html, 'file.ts', DEFAULT_INTERPOLATION_CONFIG);
  return catalog.write(serializer);
}
