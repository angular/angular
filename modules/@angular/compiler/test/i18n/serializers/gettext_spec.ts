/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Gettext} from '@angular/compiler/src/i18n/serializers/gettext';
import {beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';
import {MessageBundle} from '../../../src/i18n/message_bundle';
import {HtmlParser} from '../../../src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../../src/ml_parser/interpolation_config';
import {serializeNodes} from '../../ml_parser/ast_serializer_spec';

const HTML = `
<p i18n-title title="translatable attribute">not translatable</p>
<p i18n>translatable element <b>with placeholders</b> {{ interpolation}}</p>
<p i18n="m|d">foo</p>
<p i18n="ph names"><br><img><div></div></p>
<p i18n>'single' & "double" quotes</p>
<p i18n><b class=one>first</b> <b class=two>second</b> <b class="one two">third</b></p>
<!-- i18n -->{ count, plural, =0 {<p>test</p>}}<!-- /i18n -->
<p i18n>{ count, plural, =0 { { sex, gender, other {<p>deeply nested</p>}} }}</p>
`;

const TEMPLATE_POT = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Project-Id-Version: \\n"

#: 983775b9a51ce14b036be72d4cfd65d68d64e231
msgid "translatable attribute"
msgstr ""

#: ec1d033f2436133c14ab038286c4f5df4697484a
msgid "translatable element <b>with placeholders</b> {{ interpolation}}"
msgstr ""

#. d
#: db3e0a6a5a96481f60aec61d98c3eecddef5ac23
msgctxt "m"
msgid "foo"
msgstr ""

#. ph names
#: d7fa2d59aaedcaa5309f13028c59af8c85b8c49d
msgid "<br><img><div></div>"
msgstr ""

#: e0a80bce57d61503935b2fa6a42f21ac96d692b1
msgid "'single' & \\"double\\" quotes"
msgstr ""

#: bf77d9a5b50dc8bc3ff70158e69ece119522fb7e
msgid "<b class=\\"one\\">first</b> <b class=\\"two\\">second</b> <b class=\\"one two\\">third</b>"
msgstr ""

#: e2ccf3d131b15f54aa1fcf1314b1ca77c14bfcc2
msgid "{ count, plural, =0 {<p>test</p>}}"
msgstr ""

#: 83dd87699b8c1779dd72277ef6e2d46ca58be042
msgid "{ count, plural, =0 {{ sex, gender, other {<p>deeply nested</p>}} }}"
msgstr ""
`;

const LOCALE_PO = `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"Project-Id-Version: \\n"

#: 983775b9a51ce14b036be72d4cfd65d68d64e231
msgid "translatable attribute"
msgstr "etubirtta elbatalsnart"

#: ec1d033f2436133c14ab038286c4f5df4697484a
msgid "translatable element <b>with placeholders</b> {{ interpolation}}"
msgstr "{{ interpolation}} footnemele elbatalsnart <b>sredlohecalp htiw</b>"

#. d
#: db3e0a6a5a96481f60aec61d98c3eecddef5ac23
msgctxt "m"
msgid "foo"
msgstr "oof"

#. ph names
#: d7fa2d59aaedcaa5309f13028c59af8c85b8c49d
msgid "<br><img><div></div>"
msgstr "<div></div><img><br>"

#: e0a80bce57d61503935b2fa6a42f21ac96d692b1
msgid "'single' & \\"double\\" quotes"
msgstr "\\"double\\" and 'single' quotes"

#: bf77d9a5b50dc8bc3ff70158e69ece119522fb7e
msgid ""
"<b class=\\"one\\">first</b> <b class=\\"two\\">second</b> <b class=\\"one "
"two\\">third</b>"
msgstr ""
"<b class=\\"one two\\">third</b> <b class=\\"two\\">second</b> <b "
"class=\\"one\\">first</b>"

#: e2ccf3d131b15f54aa1fcf1314b1ca77c14bfcc2
msgid "{ count, plural, =0 {<p>test</p>}}"
msgstr "{ count, plural, =0 {<p>tset</p>}}"

#: 83dd87699b8c1779dd72277ef6e2d46ca58be042
msgid "{ count, plural, =0 {{ sex, gender, other {<p>deeply nested</p>}} }}"
msgstr "{ count, plural, =0 {{ sex, gender, other {<p>detsen ylpeed</p>}} }}"
`;

export function main(): void {
  let serializer: Gettext;
  let htmlParser: HtmlParser;

  function toGettext(html: string): string {
    let catalog = new MessageBundle(new HtmlParser, [], {});
    catalog.updateFromTemplate(html, '', DEFAULT_INTERPOLATION_CONFIG);
    return catalog.write(serializer);
  }

  function loadAsText(template: string, gettext: string): {[id: string]: string} {
    let messageBundle = new MessageBundle(htmlParser, [], {});
    messageBundle.updateFromTemplate(template, 'url', DEFAULT_INTERPOLATION_CONFIG);

    const asAst = serializer.load(gettext, 'url', messageBundle);
    let asText: {[id: string]: string} = {};
    Object.keys(asAst).forEach(id => { asText[id] = serializeNodes(asAst[id]).join(''); });

    return asText;
  }

  describe('gettext serializer', () => {
    beforeEach(() => {
      htmlParser = new HtmlParser();
      serializer = new Gettext(htmlParser, DEFAULT_INTERPOLATION_CONFIG);
    });

    it('should write a valid gettext file',
       () => { expect(toGettext(HTML)).toEqual(TEMPLATE_POT); });

    it('should load gettext files', () => {
      expect(loadAsText(HTML, LOCALE_PO)).toEqual({
        '983775b9a51ce14b036be72d4cfd65d68d64e231': 'etubirtta elbatalsnart',
        'ec1d033f2436133c14ab038286c4f5df4697484a':
            '{{ interpolation}} footnemele elbatalsnart <b>sredlohecalp htiw</b>',
        'db3e0a6a5a96481f60aec61d98c3eecddef5ac23': 'oof',
        'd7fa2d59aaedcaa5309f13028c59af8c85b8c49d': '<div></div><img/><br/>',
        'e0a80bce57d61503935b2fa6a42f21ac96d692b1': '"double" and \'single\' quotes',
        'bf77d9a5b50dc8bc3ff70158e69ece119522fb7e':
            '<b class="one two">third</b> <b class="two">second</b> <b class="one">first</b>',
        'e2ccf3d131b15f54aa1fcf1314b1ca77c14bfcc2': '{ count, plural, =0 {<p>tset</p>}}',
        '83dd87699b8c1779dd72277ef6e2d46ca58be042':
            '{ count, plural, =0 {{ sex, gender, other {<p>detsen ylpeed</p>}} }}',
      });
    });
  });
}
