/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Xliff2} from '@angular/compiler/src/i18n/serializers/xliff2';
import {beforeEach, describe, expect, it} from '@angular/core/testing/testing_internal';
import {MessageBundle} from '../../../src/i18n/message_bundle';
import {HtmlParser} from '../../../src/ml_parser/html_parser';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../../src/ml_parser/interpolation_config';
import {serializeNodes} from '../../ml_parser/ast_serializer_spec';

const HTML = `
<p i18n-title title="translatable attribute">not translatable</p>
<p i18n>translatable element <b>with placeholders</b> {{ interpolation}}</p>
<p i18n="m|d">foo</p>
<p i18n="nested"><b><u>{{interpolation}} Text</u></b></p>
<p i18n="ph names"><br><img src="1.jpg"><img src="2.jpg"></p>
<p i18n="empty element">hello <span></span></p>
`;

const WRITE_XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file original="ng2.template" id="ngi18n">
    <unit id="983775b9a51ce14b036be72d4cfd65d68d64e231">
      <segment>
        <source>translatable attribute</source>
      </segment>
    </unit>
    <unit id="ec1d033f2436133c14ab038286c4f5df4697484a">
      <segment>
        <source>translatable element <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" subType="xlf:b" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;" canCopy="no" canDelete="no">with placeholders</pc> <ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}" canCopy="no" canDelete="no"/></source>
      </segment>
    </unit>
    <unit id="db3e0a6a5a96481f60aec61d98c3eecddef5ac23">
      <notes>
        <note category="description">d</note>
        <note category="meaning">m</note>
      </notes>
      <segment>
        <source>foo</source>
      </segment>
    </unit>
    <unit id="6766186b23e26e46114f5b05a263c1aa2aae08bc">
      <notes>
        <note category="description">nested</note>
      </notes>
      <segment>
        <source><pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" subType="xlf:b" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;" canCopy="no" canDelete="no"><pc id="1" equivStart="START_UNDERLINED_TEXT" equivEnd="CLOSE_UNDERLINED_TEXT" type="fmt" subType="xlf:u" dispStart="&lt;u&gt;" dispEnd="&lt;/u&gt;" canCopy="no" canDelete="no"><ph id="2" equiv="INTERPOLATION" disp="{{interpolation}}" canCopy="no" canDelete="no"/> Text</pc></pc></source>
      </segment>
    </unit>
    <unit id="5111eec79a97de6b483081a9a4258fa50e252b02">
      <notes>
        <note category="description">ph names</note>
      </notes>
      <segment>
        <source><ph id="0" equiv="LINE_BREAK" type="fmt" subType="xlf:lb" disp="&lt;br/&gt;" canCopy="no" canDelete="no"/><ph id="1" equiv="TAG_IMG" type="image" subType="other:img" disp="&lt;img/&gt;" canCopy="no" canDelete="no"/><ph id="2" equiv="TAG_IMG_1" type="image" subType="other:img" disp="&lt;img/&gt;" canCopy="no" canDelete="no"/></source>
      </segment>
    </unit>
    <unit id="52e40be15fbdc88ac4ce36b63899b88d779022ba">
      <notes>
        <note category="description">empty element</note>
      </notes>
      <segment>
        <source>hello <pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" subType="other:span" dispStart="&lt;span&gt;" dispEnd="&lt;/span&gt;" canCopy="no" canDelete="no"></pc></source>
      </segment>
    </unit>
  </file>
</xliff>
`;

const LOAD_XLIFF = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en" trgLang="fr">
  <file original="ng2.template" id="ngi18n">
    <unit id="983775b9a51ce14b036be72d4cfd65d68d64e231">
      <segment>
        <source>translatable attribute</source>
        <target>etubirtta elbatalsnart</target>
      </segment>
    </unit>
    <unit id="ec1d033f2436133c14ab038286c4f5df4697484a">
      <segment>
        <source>translatable element <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" subType="xlf:b" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;" canCopy="no" canDelete="no">with placeholders</pc> <ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}" canCopy="no" canDelete="no"/></source>
        <target><ph id="1" equiv="INTERPOLATION" disp="{{ interpolation}}" canCopy="no" canDelete="no"/> <pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" subType="xlf:b" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;" canCopy="no" canDelete="no">sredlohecalp htiw</pc> tnemele elbatalsnart</target>
      </segment>
    </unit>
    <unit id="db3e0a6a5a96481f60aec61d98c3eecddef5ac23">
      <notes>
        <note category="description">d</note>
        <note category="meaning">m</note>
      </notes>
      <segment>
        <source>foo</source>
        <target>oof</target>
      </segment>
    </unit>
    <unit id="6766186b23e26e46114f5b05a263c1aa2aae08bc">
      <notes>
        <note category="description">nested</note>
      </notes>
      <segment>
        <source><pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" subType="xlf:b" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;" canCopy="no" canDelete="no"><pc id="1" equivStart="START_UNDERLINED_TEXT" equivEnd="CLOSE_UNDERLINED_TEXT" type="fmt" subType="xlf:u" dispStart="&lt;u&gt;" dispEnd="&lt;/u&gt;" canCopy="no" canDelete="no"><ph id="2" equiv="INTERPOLATION" disp="{{interpolation}}" canCopy="no" canDelete="no"/> Text</pc></pc></source>
        <target><pc id="0" equivStart="START_BOLD_TEXT" equivEnd="CLOSE_BOLD_TEXT" type="fmt" subType="xlf:b" dispStart="&lt;b&gt;" dispEnd="&lt;/b&gt;" canCopy="no" canDelete="no"><pc id="1" equivStart="START_UNDERLINED_TEXT" equivEnd="CLOSE_UNDERLINED_TEXT" type="fmt" subType="xlf:u" dispStart="&lt;u&gt;" dispEnd="&lt;/u&gt;" canCopy="no" canDelete="no">txeT <ph id="2" equiv="INTERPOLATION" disp="{{interpolation}}" canCopy="no" canDelete="no"/></pc></pc></target>
      </segment>
    </unit>
    <unit id="5111eec79a97de6b483081a9a4258fa50e252b02">
      <notes>
        <note category="description">ph names</note>
      </notes>
      <segment>
        <source><ph id="0" equiv="LINE_BREAK" type="fmt" subType="xlf:lb" disp="&lt;br/&gt;" canCopy="no" canDelete="no"/><ph id="1" equiv="TAG_IMG" type="image" subType="other:img" disp="&lt;img/&gt;" canCopy="no" canDelete="no"/><ph id="2" equiv="TAG_IMG_1" type="image" subType="other:img" disp="&lt;img/&gt;" canCopy="no" canDelete="no"/></source>
        <target><ph id="2" equiv="TAG_IMG_1" type="image" subType="other:img" disp="&lt;img/&gt;" canCopy="no" canDelete="no"/><ph id="1" equiv="TAG_IMG" type="image" subType="other:img" disp="&lt;img/&gt;" canCopy="no" canDelete="no"/><ph id="0" equiv="LINE_BREAK" type="fmt" subType="xlf:lb" disp="&lt;br/&gt;" canCopy="no" canDelete="no"/></target>
      </segment>
    </unit>
    <unit id="52e40be15fbdc88ac4ce36b63899b88d779022ba">
      <notes>
        <note category="description">empty element</note>
      </notes>
      <segment>
        <source>hello <pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" subType="other:span" dispStart="&lt;span&gt;" dispEnd="&lt;/span&gt;" canCopy="no" canDelete="no"></pc></source>
        <target><pc id="0" equivStart="START_TAG_SPAN" equivEnd="CLOSE_TAG_SPAN" type="other" subType="other:span" dispStart="&lt;span&gt;" dispEnd="&lt;/span&gt;" canCopy="no" canDelete="no"></pc> olleh</target>
      </segment>
    </unit>
  </file>
</xliff>
`;

export function main(): void {
  let serializer: Xliff2;
  let htmlParser: HtmlParser;

  function toXliff(html: string): string {
    let catalog = new MessageBundle(new HtmlParser, [], {});
    catalog.updateFromTemplate(html, '', DEFAULT_INTERPOLATION_CONFIG);
    return catalog.write(serializer);
  }

  function loadAsText(template: string, xliff: string): {[id: string]: string} {
    let messageBundle = new MessageBundle(htmlParser, [], {});
    messageBundle.updateFromTemplate(template, 'url', DEFAULT_INTERPOLATION_CONFIG);

    const asAst = serializer.load(xliff, 'url', messageBundle);
    let asText: {[id: string]: string} = {};
    Object.keys(asAst).forEach(id => { asText[id] = serializeNodes(asAst[id]).join(''); });

    return asText;
  }

  describe('XLIFF 2.0 serializer', () => {

    beforeEach(() => {
      htmlParser = new HtmlParser();
      serializer = new Xliff2(htmlParser, DEFAULT_INTERPOLATION_CONFIG);
    });


    describe('write', () => {
      it('should write a valid xliff 2.0 file',
         () => { expect(toXliff(HTML)).toEqual(WRITE_XLIFF); });
    });

    describe('load', () => {
      it('should load XLIFF files', () => {
        expect(loadAsText(HTML, LOAD_XLIFF)).toEqual({
          '983775b9a51ce14b036be72d4cfd65d68d64e231': 'etubirtta elbatalsnart',
          'ec1d033f2436133c14ab038286c4f5df4697484a':
              '{{ interpolation}} <b>sredlohecalp htiw</b> tnemele elbatalsnart',
          'db3e0a6a5a96481f60aec61d98c3eecddef5ac23': 'oof',
          '6766186b23e26e46114f5b05a263c1aa2aae08bc': '<b><u>txeT {{interpolation}}</u></b>',
          '5111eec79a97de6b483081a9a4258fa50e252b02': '<img src="2.jpg"/><img src="1.jpg"/><br/>',
          '52e40be15fbdc88ac4ce36b63899b88d779022ba': '<span></span> olleh'
        });
      });
    });
  });
}
