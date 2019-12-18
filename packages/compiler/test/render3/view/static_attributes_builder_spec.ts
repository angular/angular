/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AttributeMarker} from '../../../src/core';
import * as o from '../../../src/output/output_ast';
import {StaticAttributesBuilder} from '../../../src/render3/view/static_attributes_builder';

describe('StaticAttributesBuilder', () => {
  it('should generate key/value attribute values', () => {
    const b = new StaticAttributesBuilder();
    b.setAttribute('key1', 'value1');
    b.setAttribute('key2', 'value2');

    expectStaticAttributes(b).toEqual([
      'key1',
      'value1',
      'key2',
      'value2',
    ]);
  });

  it('should generate style attribute values', () => {
    const b = new StaticAttributesBuilder();

    b.setStyleAttribute('width:200px; height:400px');
    expectStaticAttributes(b).toEqual(
        [AttributeMarker.Styles, 'width', '200px', 'height', '400px']);

    b.setStyleAttribute('opacity:0.5');
    expectStaticAttributes(b).toEqual([AttributeMarker.Styles, 'opacity', '0.5']);
  });

  it('should generate class attribute values', () => {
    const b = new StaticAttributesBuilder();

    b.setClassAttribute('foo bar baz');
    expectStaticAttributes(b).toEqual([
      AttributeMarker.Classes,
      'foo',
      'bar',
      'baz',
    ]);

    b.setClassAttribute(' oof ');
    expectStaticAttributes(b).toEqual([
      AttributeMarker.Classes,
      'oof',
    ]);

    b.setClassAttribute(' ');
    expectStaticAttributes(b).toEqual([]);
  });

  it('should generate template name attribute values', () => {
    const b = new StaticAttributesBuilder();
    b.registerTemplateName('name1');
    b.registerTemplateName('name2');
    b.registerTemplateName('name3');

    expectStaticAttributes(b).toEqual([
      AttributeMarker.Template,
      'name1',
      'name2',
      'name3',
    ]);
  });

  it('should generate binding name attribute values', () => {
    const b = new StaticAttributesBuilder();
    b.registerBindingName('name1');
    b.registerBindingName('name2');
    b.registerBindingName('name3');

    expectStaticAttributes(b).toEqual([
      AttributeMarker.Bindings,
      'name1',
      'name2',
      'name3',
    ]);
  });

  it('should generate i18n name attribute values', () => {
    const b = new StaticAttributesBuilder();
    b.registerI18nName('name1');
    b.registerI18nName('name2');
    b.registerI18nName('name3');

    expectStaticAttributes(b).toEqual([
      AttributeMarker.I18n,
      'name1',
      'name2',
      'name3',
    ]);
  });

  it('should generate a projectAs selector value', () => {
    const b = new StaticAttributesBuilder();

    b.setProjectAsSelector('.my-app');
    expectStaticAttributes(b).toEqual([
      AttributeMarker.ProjectAs,
      ['.my-app'],
    ]);

    b.setProjectAsSelector('.their-app');
    expectStaticAttributes(b).toEqual([
      AttributeMarker.ProjectAs,
      ['.their-app'],
    ]);
  });

  it('should generate key/value, class, style and template attribute values', () => {
    const b = new StaticAttributesBuilder();
    b.setAttribute('title1', 'titleValue1');
    b.setAttribute(':ns:title2', 'titleValue2');
    b.setAttribute('title3', 'titleValue3');
    b.registerBindingName('name1');
    b.registerBindingName('name2');
    b.registerBindingName('name3');
    b.registerTemplateName('name4');
    b.registerTemplateName('name5');
    b.registerTemplateName('name6');
    b.registerI18nName('name7');
    b.registerI18nName('name8');
    b.registerI18nName('name9');
    b.setClassAttribute('foo bar baz');
    b.setStyleAttribute('width: 200px; height: 400px');
    b.setProjectAsSelector('.my-app');

    expectStaticAttributes(b).toEqual([
      'title1',
      'titleValue1',
      AttributeMarker.NamespaceURI,
      'ns',
      'title2',
      'titleValue2',
      'title3',
      'titleValue3',
      AttributeMarker.Classes,
      'foo',
      'bar',
      'baz',
      AttributeMarker.Styles,
      'width',
      '200px',
      'height',
      '400px',
      AttributeMarker.Bindings,
      'name1',
      'name2',
      'name3',
      AttributeMarker.Template,
      'name4',
      'name5',
      'name6',
      AttributeMarker.ProjectAs,
      ['.my-app'],
      AttributeMarker.I18n,
      'name7',
      'name8',
      'name9',
    ]);
  });
});

function expectStaticAttributes(builder: StaticAttributesBuilder) {
  return expect(expArrayToRawValues(builder.build()));
}

function expArrayToRawValues(exp: (o.LiteralExpr | o.LiteralArrayExpr)[]) {
  return exp.map(entry => {
    if (entry instanceof o.LiteralArrayExpr) {
      return entry.entries.map(e => toRawValue(e as o.LiteralExpr));
    } else {
      return toRawValue(entry);
    }
  });
}

function toRawValue(exp: o.LiteralExpr): any {
  return exp.value;
}
