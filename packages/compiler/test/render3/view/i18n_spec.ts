/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import * as i18n from '../../../src/i18n/i18n_ast';
import * as o from '../../../src/output/output_ast';
import {ParseSourceSpan} from '../../../src/parse_util';
import * as t from '../../../src/render3/r3_ast';
import {serializeI18nMessageForGetMsg} from '../../../src/render3/view/i18n/get_msg_utils';
import {serializeIcuNode} from '../../../src/render3/view/i18n/icu_serializer';
import {serializeI18nMessageForLocalize} from '../../../src/render3/view/i18n/localize_utils';
import {I18nMeta, i18nMetaToJSDoc, parseI18nMeta} from '../../../src/render3/view/i18n/meta';
import {formatI18nPlaceholderName} from '../../../src/render3/view/i18n/util';
import {LEADING_TRIVIA_CHARS} from '../../../src/render3/view/template';

import {parseR3 as parse} from './util';

describe('Utils', () => {
  it('formatI18nPlaceholderName', () => {
    const cases = [
      // input, output
      ['', ''],
      ['ICU', 'icu'],
      ['ICU_1', 'icu_1'],
      ['ICU_1000', 'icu_1000'],
      ['START_TAG_NG-CONTAINER', 'startTagNgContainer'],
      ['START_TAG_NG-CONTAINER_1', 'startTagNgContainer_1'],
      ['CLOSE_TAG_ITALIC', 'closeTagItalic'],
      ['CLOSE_TAG_BOLD_1', 'closeTagBold_1'],
    ];
    cases.forEach(([input, output]) => {
      expect(formatI18nPlaceholderName(input)).toEqual(output);
    });
  });

  describe('metadata serialization', () => {
    it('parseI18nMeta()', () => {
      expect(parseI18nMeta('')).toEqual(meta());
      expect(parseI18nMeta('desc')).toEqual(meta('', '', 'desc'));
      expect(parseI18nMeta('desc@@id')).toEqual(meta('id', '', 'desc'));
      expect(parseI18nMeta('meaning|desc')).toEqual(meta('', 'meaning', 'desc'));
      expect(parseI18nMeta('meaning|desc@@id')).toEqual(meta('id', 'meaning', 'desc'));
      expect(parseI18nMeta('@@id')).toEqual(meta('id', '', ''));

      expect(parseI18nMeta('\n   ')).toEqual(meta());
      expect(parseI18nMeta('\n   desc\n   ')).toEqual(meta('', '', 'desc'));
      expect(parseI18nMeta('\n   desc@@id\n   ')).toEqual(meta('id', '', 'desc'));
      expect(parseI18nMeta('\n   meaning|desc\n   ')).toEqual(meta('', 'meaning', 'desc'));
      expect(parseI18nMeta('\n   meaning|desc@@id\n   ')).toEqual(meta('id', 'meaning', 'desc'));
      expect(parseI18nMeta('\n   @@id\n   ')).toEqual(meta('id', '', ''));
    });

    it('serializeI18nHead()', () => {
      expect(o.localizedString(meta(), [literal('')], [], []).serializeI18nHead()).toEqual({
        cooked: '',
        raw: '',
        range: jasmine.any(ParseSourceSpan),
      });
      expect(
        o.localizedString(meta('', '', 'desc'), [literal('')], [], []).serializeI18nHead(),
      ).toEqual({cooked: ':desc:', raw: ':desc:', range: jasmine.any(ParseSourceSpan)});
      expect(
        o.localizedString(meta('id', '', 'desc'), [literal('')], [], []).serializeI18nHead(),
      ).toEqual({cooked: ':desc@@id:', raw: ':desc@@id:', range: jasmine.any(ParseSourceSpan)});
      expect(
        o.localizedString(meta('', 'meaning', 'desc'), [literal('')], [], []).serializeI18nHead(),
      ).toEqual({
        cooked: ':meaning|desc:',
        raw: ':meaning|desc:',
        range: jasmine.any(ParseSourceSpan),
      });
      expect(
        o.localizedString(meta('id', 'meaning', 'desc'), [literal('')], [], []).serializeI18nHead(),
      ).toEqual({
        cooked: ':meaning|desc@@id:',
        raw: ':meaning|desc@@id:',
        range: jasmine.any(ParseSourceSpan),
      });
      expect(
        o.localizedString(meta('id', '', ''), [literal('')], [], []).serializeI18nHead(),
      ).toEqual({cooked: ':@@id:', raw: ':@@id:', range: jasmine.any(ParseSourceSpan)});

      // Escaping colons (block markers)
      expect(
        o
          .localizedString(meta('id:sub_id', 'meaning', 'desc'), [literal('')], [], [])
          .serializeI18nHead(),
      ).toEqual({
        cooked: ':meaning|desc@@id:sub_id:',
        raw: ':meaning|desc@@id\\:sub_id:',
        range: jasmine.any(ParseSourceSpan),
      });
      expect(
        o
          .localizedString(meta('id', 'meaning:sub_meaning', 'desc'), [literal('')], [], [])
          .serializeI18nHead(),
      ).toEqual({
        cooked: ':meaning:sub_meaning|desc@@id:',
        raw: ':meaning\\:sub_meaning|desc@@id:',
        range: jasmine.any(ParseSourceSpan),
      });
      expect(
        o
          .localizedString(meta('id', 'meaning', 'desc:sub_desc'), [literal('')], [], [])
          .serializeI18nHead(),
      ).toEqual({
        cooked: ':meaning|desc:sub_desc@@id:',
        raw: ':meaning|desc\\:sub_desc@@id:',
        range: jasmine.any(ParseSourceSpan),
      });
      expect(
        o
          .localizedString(meta('id', 'meaning', 'desc'), [literal('message source')], [], [])
          .serializeI18nHead(),
      ).toEqual({
        cooked: ':meaning|desc@@id:message source',
        raw: ':meaning|desc@@id:message source',
        range: jasmine.any(ParseSourceSpan),
      });
      expect(
        o
          .localizedString(meta('id', 'meaning', 'desc'), [literal(':message source')], [], [])
          .serializeI18nHead(),
      ).toEqual({
        cooked: ':meaning|desc@@id::message source',
        raw: ':meaning|desc@@id::message source',
        range: jasmine.any(ParseSourceSpan),
      });
      expect(
        o
          .localizedString(meta('', '', ''), [literal('message source')], [], [])
          .serializeI18nHead(),
      ).toEqual({
        cooked: 'message source',
        raw: 'message source',
        range: jasmine.any(ParseSourceSpan),
      });
      expect(
        o
          .localizedString(meta('', '', ''), [literal(':message source')], [], [])
          .serializeI18nHead(),
      ).toEqual({
        cooked: ':message source',
        raw: '\\:message source',
        range: jasmine.any(ParseSourceSpan),
      });
    });

    it('serializeI18nPlaceholderBlock()', () => {
      expect(
        o
          .localizedString(meta('', '', ''), [literal(''), literal('')], [literal('')], [])
          .serializeI18nTemplatePart(1),
      ).toEqual({cooked: '', raw: '', range: jasmine.any(ParseSourceSpan)});
      expect(
        o
          .localizedString(
            meta('', '', ''),
            [literal(''), literal('')],
            [new o.LiteralPiece('abc', {} as any)],
            [],
          )
          .serializeI18nTemplatePart(1),
      ).toEqual({cooked: ':abc:', raw: ':abc:', range: jasmine.any(ParseSourceSpan)});
      expect(
        o
          .localizedString(meta('', '', ''), [literal(''), literal('message')], [literal('')], [])
          .serializeI18nTemplatePart(1),
      ).toEqual({cooked: 'message', raw: 'message', range: jasmine.any(ParseSourceSpan)});
      expect(
        o
          .localizedString(
            meta('', '', ''),
            [literal(''), literal('message')],
            [literal('abc')],
            [],
          )
          .serializeI18nTemplatePart(1),
      ).toEqual({cooked: ':abc:message', raw: ':abc:message', range: jasmine.any(ParseSourceSpan)});
      expect(
        o
          .localizedString(meta('', '', ''), [literal(''), literal(':message')], [literal('')], [])
          .serializeI18nTemplatePart(1),
      ).toEqual({cooked: ':message', raw: '\\:message', range: jasmine.any(ParseSourceSpan)});
      expect(
        o
          .localizedString(
            meta('', '', ''),
            [literal(''), literal(':message')],
            [literal('abc')],
            [],
          )
          .serializeI18nTemplatePart(1),
      ).toEqual({
        cooked: ':abc::message',
        raw: ':abc::message',
        range: jasmine.any(ParseSourceSpan),
      });
    });
  });

  describe('jsdoc generation', () => {
    it('generates with description', () => {
      const docComment = i18nMetaToJSDoc(meta('', '', 'desc'));

      expect(docComment.tags.length).toBe(1);
      expect(docComment.tags[0]).toEqual({tagName: o.JSDocTagName.Desc, text: 'desc'});
    });

    it('generates with no description suppressed', () => {
      const docComment = i18nMetaToJSDoc(meta('', '', ''));

      expect(docComment.tags.length).toBe(1);
      expect(docComment.tags[0]).toEqual({
        tagName: o.JSDocTagName.Suppress,
        text: '{msgDescriptions}',
      });
    });

    it('generates with description and meaning', () => {
      const docComment = i18nMetaToJSDoc(meta('', 'meaning', ''));

      expect(docComment.tags).toContain({tagName: o.JSDocTagName.Meaning, text: 'meaning'});
    });
  });

  function meta(customId?: string, meaning?: string, description?: string): I18nMeta {
    return {customId, meaning, description};
  }
});

describe('serializeI18nMessageForGetMsg', () => {
  const serialize = (input: string): string => {
    const tree = parse(`<div i18n>${input}</div>`);
    const root = tree.nodes[0] as t.Element;
    return serializeI18nMessageForGetMsg(root.i18n as i18n.Message);
  };

  it('should serialize plain text for `GetMsg()`', () => {
    expect(serialize('Some text')).toEqual('Some text');
  });

  it('should serialize text with interpolation for `GetMsg()`', () => {
    expect(serialize('Some text {{ valueA }} and {{ valueB + valueC }}')).toEqual(
      'Some text {$interpolation} and {$interpolation_1}',
    );
  });

  it('should serialize interpolation with named placeholder for `GetMsg()`', () => {
    expect(serialize('{{ valueB + valueC // i18n(ph="PLACEHOLDER NAME") }}')).toEqual(
      '{$placeholderName}',
    );
  });

  it('should serialize content with HTML tags for `GetMsg()`', () => {
    expect(serialize('A <span>B<div>C</div></span> D')).toEqual(
      'A {$startTagSpan}B{$startTagDiv}C{$closeTagDiv}{$closeTagSpan} D',
    );
  });

  it('should serialize simple ICU for `GetMsg()`', () => {
    expect(serialize('{age, plural, 10 {ten} other {other}}')).toEqual(
      '{VAR_PLURAL, plural, 10 {ten} other {other}}',
    );
  });

  it('should serialize nested ICUs for `GetMsg()`', () => {
    expect(
      serialize('{age, plural, 10 {ten {size, select, 1 {one} 2 {two} other {2+}}} other {other}}'),
    ).toEqual(
      '{VAR_PLURAL, plural, 10 {ten {VAR_SELECT, select, 1 {one} 2 {two} other {2+}}} other {other}}',
    );
  });

  it('should serialize ICU with nested HTML for `GetMsg()`', () => {
    expect(serialize('{age, plural, 10 {<b>ten</b>} other {<div class="A">other</div>}}')).toEqual(
      '{VAR_PLURAL, plural, 10 {{START_BOLD_TEXT}ten{CLOSE_BOLD_TEXT}} other {{START_TAG_DIV}other{CLOSE_TAG_DIV}}}',
    );
  });

  it('should serialize ICU with nested HTML containing further ICUs for `GetMsg()`', () => {
    expect(
      serialize(
        '{gender, select, male {male} female {female} other {other}}<div>{gender, select, male {male} female {female} other {other}}</div>',
      ),
    ).toEqual('{$icu}{$startTagDiv}{$icu}{$closeTagDiv}');
  });
});

describe('serializeI18nMessageForLocalize', () => {
  const serialize = (input: string) => {
    const tree = parse(`<div i18n>${input}</div>`, {leadingTriviaChars: LEADING_TRIVIA_CHARS});
    const root = tree.nodes[0] as t.Element;
    return serializeI18nMessageForLocalize(root.i18n as i18n.Message);
  };

  it('should serialize plain text for `$localize()`', () => {
    expect(serialize('Some text')).toEqual({
      messageParts: [literal('Some text')],
      placeHolders: [],
    });
  });

  it('should serialize text with interpolation for `$localize()`', () => {
    expect(serialize('Some text {{ valueA }} and {{ valueB + valueC }} done')).toEqual({
      messageParts: [literal('Some text '), literal(' and '), literal(' done')],
      placeHolders: [placeholder('INTERPOLATION'), placeholder('INTERPOLATION_1')],
    });
  });

  it('should compute source-spans when serializing text with interpolation for `$localize()`', () => {
    const {messageParts, placeHolders} = serialize(
      'Some text {{ valueA }} and {{ valueB + valueC }} done',
    );

    expect(messageParts[0].text).toEqual('Some text ');
    expect(messageParts[0].sourceSpan.toString()).toEqual('Some text ');
    expect(messageParts[1].text).toEqual(' and ');
    expect(messageParts[1].sourceSpan.toString()).toEqual(' and ');
    expect(messageParts[2].text).toEqual(' done');
    expect(messageParts[2].sourceSpan.toString()).toEqual(' done');

    expect(placeHolders[0].text).toEqual('INTERPOLATION');
    expect(placeHolders[0].sourceSpan.toString()).toEqual('{{ valueA }}');
    expect(placeHolders[1].text).toEqual('INTERPOLATION_1');
    expect(placeHolders[1].sourceSpan.toString()).toEqual('{{ valueB + valueC }}');
  });

  it('should serialize text with interpolation at start for `$localize()`', () => {
    expect(serialize('{{ valueA }} and {{ valueB + valueC }} done')).toEqual({
      messageParts: [literal(''), literal(' and '), literal(' done')],
      placeHolders: [placeholder('INTERPOLATION'), placeholder('INTERPOLATION_1')],
    });
  });

  it('should serialize text with interpolation at end for `$localize()`', () => {
    expect(serialize('Some text {{ valueA }} and {{ valueB + valueC }}')).toEqual({
      messageParts: [literal('Some text '), literal(' and '), literal('')],
      placeHolders: [placeholder('INTERPOLATION'), placeholder('INTERPOLATION_1')],
    });
  });

  it('should serialize only interpolation for `$localize()`', () => {
    expect(serialize('{{ valueB + valueC }}')).toEqual({
      messageParts: [literal(''), literal('')],
      placeHolders: [placeholder('INTERPOLATION')],
    });
  });

  it('should serialize interpolation with named placeholder for `$localize()`', () => {
    expect(serialize('{{ valueB + valueC // i18n(ph="PLACEHOLDER NAME") }}')).toEqual({
      messageParts: [literal(''), literal('')],
      placeHolders: [placeholder('PLACEHOLDER_NAME')],
    });
  });

  it('should serialize content with HTML tags for `$localize()`', () => {
    expect(serialize('A <span>B<div>C</div></span> D')).toEqual({
      messageParts: [literal('A '), literal('B'), literal('C'), literal(''), literal(' D')],
      placeHolders: [
        placeholder('START_TAG_SPAN'),
        placeholder('START_TAG_DIV'),
        placeholder('CLOSE_TAG_DIV'),
        placeholder('CLOSE_TAG_SPAN'),
      ],
    });
  });

  it('should compute source-spans when serializing content with HTML tags for `$localize()`', () => {
    const {messageParts, placeHolders} = serialize('A <span>B<div>C</div></span> D');

    expect(messageParts[0].text).toEqual('A ');
    expect(messageParts[0].sourceSpan.toString()).toEqual('A ');
    expect(messageParts[1].text).toEqual('B');
    expect(messageParts[1].sourceSpan.toString()).toEqual('B');
    expect(messageParts[2].text).toEqual('C');
    expect(messageParts[2].sourceSpan.toString()).toEqual('C');
    expect(messageParts[3].text).toEqual('');
    expect(messageParts[3].sourceSpan.toString()).toEqual('');
    expect(messageParts[4].text).toEqual(' D');
    expect(messageParts[4].sourceSpan.toString()).toEqual(' D');

    expect(placeHolders[0].text).toEqual('START_TAG_SPAN');
    expect(placeHolders[0].sourceSpan.toString()).toEqual('<span>');
    expect(placeHolders[1].text).toEqual('START_TAG_DIV');
    expect(placeHolders[1].sourceSpan.toString()).toEqual('<div>');
    expect(placeHolders[2].text).toEqual('CLOSE_TAG_DIV');
    expect(placeHolders[2].sourceSpan.toString()).toEqual('</div>');
    expect(placeHolders[3].text).toEqual('CLOSE_TAG_SPAN');
    expect(placeHolders[3].sourceSpan.toString()).toEqual('</span>');
  });

  it('should create the correct source-spans when there are two placeholders next to each other', () => {
    const {messageParts, placeHolders} = serialize('<b>{{value}}</b>');
    expect(messageParts[0].text).toEqual('');
    expect(humanizeSourceSpan(messageParts[0].sourceSpan)).toEqual('"" (10-10)');
    expect(messageParts[1].text).toEqual('');
    expect(humanizeSourceSpan(messageParts[1].sourceSpan)).toEqual('"" (13-13)');
    expect(messageParts[2].text).toEqual('');
    expect(humanizeSourceSpan(messageParts[2].sourceSpan)).toEqual('"" (22-22)');
    expect(messageParts[3].text).toEqual('');
    expect(humanizeSourceSpan(messageParts[3].sourceSpan)).toEqual('"" (26-26)');

    expect(placeHolders[0].text).toEqual('START_BOLD_TEXT');
    expect(humanizeSourceSpan(placeHolders[0].sourceSpan)).toEqual('"<b>" (10-13)');
    expect(placeHolders[1].text).toEqual('INTERPOLATION');
    expect(humanizeSourceSpan(placeHolders[1].sourceSpan)).toEqual('"{{value}}" (13-22)');
    expect(placeHolders[2].text).toEqual('CLOSE_BOLD_TEXT');
    expect(humanizeSourceSpan(placeHolders[2].sourceSpan)).toEqual('"</b>" (22-26)');
  });

  it('should create the correct placeholder source-spans when there is skipped leading whitespace', () => {
    const {messageParts, placeHolders} = serialize('<b>   {{value}}</b>');
    expect(messageParts[0].text).toEqual('');
    expect(humanizeSourceSpan(messageParts[0].sourceSpan)).toEqual('"" (10-10)');
    expect(messageParts[1].text).toEqual('   ');
    expect(humanizeSourceSpan(messageParts[1].sourceSpan)).toEqual('"   " (13-16)');
    expect(messageParts[2].text).toEqual('');
    expect(humanizeSourceSpan(messageParts[2].sourceSpan)).toEqual('"" (25-25)');
    expect(messageParts[3].text).toEqual('');
    expect(humanizeSourceSpan(messageParts[3].sourceSpan)).toEqual('"" (29-29)');

    expect(placeHolders[0].text).toEqual('START_BOLD_TEXT');
    expect(humanizeSourceSpan(placeHolders[0].sourceSpan)).toEqual('"<b>" (10-13)');
    expect(placeHolders[1].text).toEqual('INTERPOLATION');
    expect(humanizeSourceSpan(placeHolders[1].sourceSpan)).toEqual('"{{value}}" (16-25)');
    expect(placeHolders[2].text).toEqual('CLOSE_BOLD_TEXT');
    expect(humanizeSourceSpan(placeHolders[2].sourceSpan)).toEqual('"</b>" (25-29)');
  });

  it('should serialize simple ICU for `$localize()`', () => {
    expect(serialize('{age, plural, 10 {ten} other {other}}')).toEqual({
      messageParts: [literal('{VAR_PLURAL, plural, 10 {ten} other {other}}')],
      placeHolders: [],
    });
  });

  it('should serialize nested ICUs for `$localize()`', () => {
    expect(
      serialize('{age, plural, 10 {ten {size, select, 1 {one} 2 {two} other {2+}}} other {other}}'),
    ).toEqual({
      messageParts: [
        literal(
          '{VAR_PLURAL, plural, 10 {ten {VAR_SELECT, select, 1 {one} 2 {two} other {2+}}} other {other}}',
        ),
      ],
      placeHolders: [],
    });
  });

  it('should serialize ICU with embedded HTML for `$localize()`', () => {
    expect(serialize('{age, plural, 10 {<b>ten</b>} other {<div class="A">other</div>}}')).toEqual({
      messageParts: [
        literal(
          '{VAR_PLURAL, plural, 10 {{START_BOLD_TEXT}ten{CLOSE_BOLD_TEXT}} other {{START_TAG_DIV}other{CLOSE_TAG_DIV}}}',
        ),
      ],
      placeHolders: [],
    });
  });

  it('should serialize ICU with embedded interpolation for `$localize()`', () => {
    expect(serialize('{age, plural, 10 {<b>ten</b>} other {{{age}} years old}}')).toEqual({
      messageParts: [
        literal(
          '{VAR_PLURAL, plural, 10 {{START_BOLD_TEXT}ten{CLOSE_BOLD_TEXT}} other {{INTERPOLATION} years old}}',
        ),
      ],
      placeHolders: [],
    });
  });

  it('should serialize ICU with nested HTML containing further ICUs for `$localize()`', () => {
    const icu = placeholder('ICU');
    icu.associatedMessage = jasmine.any(i18n.Message) as unknown as i18n.Message;
    expect(
      serialize(
        '{gender, select, male {male} female {female} other {other}}<div>{gender, select, male {male} female {female} other {other}}</div>',
      ),
    ).toEqual({
      messageParts: [literal(''), literal(''), literal(''), literal(''), literal('')],
      placeHolders: [icu, placeholder('START_TAG_DIV'), icu, placeholder('CLOSE_TAG_DIV')],
    });
  });

  it('should serialize nested ICUs with embedded interpolation for `$localize()`', () => {
    expect(
      serialize(
        '{age, plural, 10 {ten {size, select, 1 {{{ varOne }}} 2 {{{ varTwo }}} other {2+}}} other {other}}',
      ),
    ).toEqual({
      messageParts: [
        literal(
          '{VAR_PLURAL, plural, 10 {ten {VAR_SELECT, select, 1 {{INTERPOLATION}} 2 {{INTERPOLATION_1}} other {2+}}} other {other}}',
        ),
      ],
      placeHolders: [],
    });
  });
});

describe('serializeIcuNode', () => {
  const serialize = (input: string) => {
    const tree = parse(`<div i18n>${input}</div>`);
    const rooti18n = (tree.nodes[0] as t.Element).i18n as i18n.Message;
    return serializeIcuNode(rooti18n.nodes[0] as i18n.Icu);
  };

  it('should serialize a simple ICU', () => {
    expect(serialize('{age, plural, 10 {ten} other {other}}')).toEqual(
      '{VAR_PLURAL, plural, 10 {ten} other {other}}',
    );
  });

  it('should serialize a nested ICU', () => {
    expect(
      serialize('{age, plural, 10 {ten {size, select, 1 {one} 2 {two} other {2+}}} other {other}}'),
    ).toEqual(
      '{VAR_PLURAL, plural, 10 {ten {VAR_SELECT, select, 1 {one} 2 {two} other {2+}}} other {other}}',
    );
  });

  it('should serialize ICU with nested HTML', () => {
    expect(serialize('{age, plural, 10 {<b>ten</b>} other {<div class="A">other</div>}}')).toEqual(
      '{VAR_PLURAL, plural, 10 {{START_BOLD_TEXT}ten{CLOSE_BOLD_TEXT}} other {{START_TAG_DIV}other{CLOSE_TAG_DIV}}}',
    );
  });

  it('should serialize an ICU with embedded interpolations', () => {
    expect(serialize('{age, select, 10 {ten} other {{{age}} years old}}')).toEqual(
      '{VAR_SELECT, select, 10 {ten} other {{INTERPOLATION} years old}}',
    );
  });
});

function literal(text: string, span: any = jasmine.any(ParseSourceSpan)): o.LiteralPiece {
  return new o.LiteralPiece(text, span);
}

function placeholder(name: string, span: any = jasmine.any(ParseSourceSpan)): o.PlaceholderPiece {
  return new o.PlaceholderPiece(name, span);
}

function humanizeSourceSpan(span: ParseSourceSpan): string {
  return `"${span.toString()}" (${span.start.offset}-${span.end.offset})`;
}
