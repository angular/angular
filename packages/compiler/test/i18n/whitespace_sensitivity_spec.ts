/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as i18n from '../../src/i18n/i18n_ast';
import {MessageBundle} from '../../src/i18n/message_bundle';
import {DEFAULT_INTERPOLATION_CONFIG} from '../../src/ml_parser/defaults';
import {HtmlParser} from '../../src/ml_parser/html_parser';
import {Xmb} from '../../src/i18n/serializers/xmb';

describe('preserveWhitespace', () => {
  describe('ignores whitespace changes when disabled', () => {
    it('from converting one-line messages to block messages', () => {
      const initial = extractMessages(
        `
<div i18n>Hello, World!</div>
<div i18n>{{ abc }}</div>
<div i18n>Start {{ abc }} End</div>
<div i18n>{{ first }} middle {{ end }}</div>
<div i18n><a href="/foo">Foo</a></div>
<div i18n>Before <a href="/foo">Link</a> After</div>
<div i18n><input type="text" /></div>
<div i18n>Before <input type="text" /> After</div>
        `.trim(),
        false /* preserveWhitespace */,
      );
      const multiLine = extractMessages(
        `
<div i18n>
  Hello, World!
</div>
<div i18n>
  {{ abc }}
</div>
<div i18n>
  Start {{ abc }} End
</div>
<div i18n>
  {{ first }} middle {{ end }}
</div>
<div i18n>
  <a href="/foo">
    Foo
  </a>
</div>
<div i18n>
  Before
  <a href="/foo">Link</a>
  After
</div>
<div i18n>
  <input type="text" />
</div>
<div i18n>
  Before
  <input type="text" />
  After
</div>
        `.trim(),
        false /* preserveWhitespace */,
      );

      expect(multiLine).toEqual(initial);
    });

    it('from indenting a message', () => {
      const initial = extractMessages(
        `
<div i18n>
  Hello, World!
</div>
<div i18n>
  {{ abc }}
</div>
<div i18n>
  Start {{ abc }} End
</div>
<div i18n>
  {{ first }} middle {{ end }}
</div>
<div i18n>
  <a href="/foo">
    Foo
  </a>
</div>
<div i18n>
  Before
  <a href="/foo">Link</a>
  After
</div>
<div i18n>
  <input type="text" />
</div>
<div i18n>
  Before <input type="text" /> After
</div>
        `.trim(),
        false /* preserveWhitespace */,
      );
      const indented = extractMessages(
        `
<div id="container">
  <div i18n>
    Hello, World!
  </div>
  <div i18n>
    {{ abc }}
  </div>
  <div i18n>
    Start {{ abc }} End
  </div>
  <div i18n>
    {{ first }} middle {{ end }}
  </div>
  <div i18n>
    <a href="/foo">
      Foo
    </a>
  </div>
  <div i18n>
    Before
    <a href="/foo">Link</a>
    After
  </div>
  <div i18n>
    <input type="text" />
  </div>
  <div i18n>
    Before <input type="text" /> After
  </div>
</div>
        `.trim(),
        false /* preserveWhitespace */,
      );

      expect(indented).toEqual(initial);
    });

    it('from adjusting line wrapping', () => {
      const initial = extractMessages(
        `
<div i18n>
  This is a long message which maybe
  exceeds line length.
</div>
<div i18n>
  {{ veryLongExpressionWhichMaybeExceedsLineLength | async }}
</div>
<div i18n>
  This is a long {{ abc }} which maybe
  exceeds line length.
</div>
<div i18n>
  {{ first }} long message {{ end }}
</div>
<div i18n>
  <a href="/foo" veryLongAttributeWhichMaybeExceedsLineLength>
    This is a long message which maybe
    exceeds line length.
  </a>
</div>
<div i18n>
  This is a
  long <a href="/foo" veryLongAttributeWhichMaybeExceedsLineLength>message</a> which
  maybe exceeds line length.
</div>
<div i18n>
  <input type="text" veryLongAttributeWhichMaybeExceedsLineLength />
</div>
<div i18n>
  Before <input type="text" veryLongAttributeWhichMaybeExceedsLineLength /> After
</div>
        `.trim(),
        false /* preserveWhitespace */,
      );
      const adjusted = extractMessages(
        `
<div i18n>
  This is a long message which
  maybe exceeds line length.
</div>
<div i18n>
  {{
    veryLongExpressionWhichMaybeExceedsLineLength
    | async
  }}
</div>
<div i18n>
  This is a long {{ abc }} which
  maybe exceeds line length.
</div>
<div i18n>
  {{ first }}
  long message
  {{ end }}
</div>
<div i18n>
  <a
      href="/foo"
      veryLongAttributeWhichMaybeExceedsLineLength>
    This is a long message which
    maybe exceeds line length.
  </a>
</div>
<div i18n>
  This is a long
  <a
      href="/foo"
      veryLongAttributeWhichMaybeExceedsLineLength>
    message
  </a>
  which maybe exceeds line length.
</div>
<div i18n>
  <input
    type="text"
    veryLongAttributeWhichMaybeExceedsLineLength
  />
</div>
<div i18n>
  Before
  <input
    type="text"
    veryLongAttributeWhichMaybeExceedsLineLength
  />
  After
</div>
        `.trim(),
        false /* preserveWhitespace */,
      );

      expect(adjusted).toEqual(initial);
    });

    it('from trimming significant whitespace', () => {
      const initial = extractMessages(
        `
<div i18n> Hello, World! </div>
<div i18n> {{ abc }} </div>
<div i18n> Start {{ abc }} End </div>
<div i18n> {{ first }} middle {{ end }} </div>
<div i18n> <a href="/foo">Foo</a> </div>
<div i18n><a href="/foo"> Foo </a></div>
<div i18n> Before <a href="/foo">Link</a> After </div>
<div i18n> <input type="text" /> </div>
<div i18n> Before <input type="text" /> After </div>
        `.trim(),
        false /* preserveWhitespace */,
      );
      const trimmed = extractMessages(
        `
<div i18n>Hello, World!</div>
<div i18n>{{ abc }}</div>
<div i18n>Start {{ abc }} End</div>
<div i18n>{{ first }} middle {{ end }}</div>
<div i18n><a href="/foo">Foo</a></div>
<div i18n><a href="/foo">Foo</a></div>
<div i18n>Before <a href="/foo">Link</a> After</div>
<div i18n><input type="text" /></div>
<div i18n>Before <input type="text" /> After</div>
        `.trim(),
        false /* preserveWhitespace */,
      );

      expect(trimmed).toEqual(initial);
    });
  });
});

interface AssertableMessage {
  id: string;
  text: string;
}

/**
 * Serializes a message for easy assertion that the meaningful text did not change.
 * For example: This does not include expression source, because that is allowed to
 * change without affecting message IDs or extracted placeholders.
 */
const debugSerializer = new (class implements i18n.Visitor {
  visitText(text: i18n.Text): string {
    return text.value;
  }

  visitContainer(container: i18n.Container): string {
    return `[${container.children.map((child) => child.visit(this)).join(', ')}]`;
  }

  visitIcu(icu: i18n.Icu): string {
    const strCases = Object.keys(icu.cases).map(
      (k: string) => `${k} {${icu.cases[k].visit(this)}}`,
    );
    return `{${icu.expression}, ${icu.type}, ${strCases.join(', ')}}`;
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder): string {
    return ph.isVoid
      ? `<ph tag name="${ph.startName}"/>`
      : `<ph tag name="${ph.startName}">${ph.children
          .map((child) => child.visit(this))
          .join(', ')}</ph name="${ph.closeName}">`;
  }

  visitPlaceholder(ph: i18n.Placeholder): string {
    return `<ph name="${ph.name}"/>`;
  }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder): string {
    return `<ph icu name="${ph.name}"/>`;
  }

  visitBlockPlaceholder(ph: i18n.BlockPlaceholder): string {
    return `<ph block name="${ph.startName}">${ph.children
      .map((child) => child.visit(this))
      .join(', ')}</ph name="${ph.closeName}">`;
  }
})();

function extractMessages(source: string, preserveWhitespace: boolean): AssertableMessage[] {
  const bundle = new MessageBundle(
    new HtmlParser(),
    [] /* implicitTags */,
    {} /* implicitAttrs */,
    undefined /* locale */,
    preserveWhitespace,
  );
  bundle.updateFromTemplate(source, 'url', DEFAULT_INTERPOLATION_CONFIG);
  const messages = bundle.getMessages();

  const xmbSerializer = new Xmb(preserveWhitespace /* preservePlaceholders */);
  return messages.map((message) => ({
    id: xmbSerializer.digest(message),
    text: message.nodes.map((node) => node.visit(debugSerializer)).join(''),
  }));
}
