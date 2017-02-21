/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Container, Icu, IcuPlaceholder, Message, Node, Placeholder, ResourceLoader, Serializer, TagPlaceholder, Text, Visitor, digest} from '@angular/compiler';
import {MessageBundle} from '@angular/compiler/src/i18n/message_bundle';
import {HtmlParser} from '@angular/compiler/src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '@angular/compiler/src/ml_parser/interpolation_config';
import {Component, DebugElement, TRANSLATIONS, TRANSLATIONS_SERIALIZER} from '@angular/core';
import {TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser/src/dom/debug/by';
import {stringifyElement} from '@angular/platform-browser/testing/browser_util';
import {expect} from '@angular/platform-browser/testing/matchers';

import {SpyResourceLoader} from '../spies';

export function main() {
  describe('i18n integration spec with custom serializer', () => {

    beforeEach(async(() => {
      TestBed.configureCompiler({
        providers: [
          {provide: ResourceLoader, useClass: SpyResourceLoader},
          {provide: TRANSLATIONS, useValue: JSON_TB},
          {provide: TRANSLATIONS_SERIALIZER, useClass: CustomSerializer},
        ]
      });

      TestBed.configureTestingModule({declarations: [I18nComponent]});
    }));

    it('should extract from templates', () => {
      const catalog = new MessageBundle(new HtmlParser, [], {});
      const serializer = new CustomSerializer();
      catalog.updateFromTemplate(HTML, '', DEFAULT_INTERPOLATION_CONFIG);

      expect(catalog.write(serializer)).toContain(JSON_MB);
    });

    it('should translate templates', () => {
      const tb = TestBed.overrideTemplate(I18nComponent, HTML).createComponent(I18nComponent);
      const el = tb.debugElement;

      expectHtml(el, 'h1').toBe('<h1>attributs i18n sur les balises</h1>');
    });
  });
}

function expectHtml(el: DebugElement, cssSelector: string): any {
  return expect(stringifyElement(el.query(By.css(cssSelector)).nativeElement));
}

@Component({
  selector: 'i18n-cmp',
  template: '',
})
class I18nComponent {
}

class CustomSerializer extends Serializer {
  write(messages: Message[]): string {
    const visitor = new _WriteVisitor();
    let result: {[id: string]: string} = {};
    messages.forEach(message => { result[message.id] = visitor.serialize(message.nodes); });
    return JSON.stringify(result);
  }

  load(content: string, url: string):
      {locale: string | null, i18nNodesByMsgId: {[msgId: string]: Node[]}} {
    const data = JSON.parse(content);
    const i18nNodesByMsgId: {[msgId: string]: Node[]} = {};
    Object.keys(data).forEach(
        msgId => { i18nNodesByMsgId[msgId] = [new Text(data[msgId], null)]; });
    return {locale: null, i18nNodesByMsgId: i18nNodesByMsgId};
  }

  digest(message: Message): string { return digest(message); }

  getExtension(): string { return 'json'; }
}

class _WriteVisitor implements Visitor {
  visitText(text: Text, context?: any): string { return text.value; }
  visitContainer(container: Container, context?: any): string { return ''; }
  visitIcu(icu: Icu, context?: any): string { return ''; }
  visitTagPlaceholder(ph: TagPlaceholder, context?: any): string { return ''; }
  visitPlaceholder(ph: Placeholder, context?: any): string { return ''; }
  visitIcuPlaceholder(ph: IcuPlaceholder, context?: any): string { return ''; }
  serialize(nodes: Node[]): string { return '' + nodes.map(node => node.visit(this)).join(''); }
}

const JSON_TB = `{"3cb04208df1c2f62553ed48e75939cf7107f9dad":"attributs i18n sur les balises"}`;

const JSON_MB = `{"3cb04208df1c2f62553ed48e75939cf7107f9dad":"i18n attribute on tags"}`;

const HTML = `
<div>
    <h1 i18n>i18n attribute on tags</h1>
</div>
`;
