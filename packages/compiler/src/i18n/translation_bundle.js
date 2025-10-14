/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {MissingTranslationStrategy} from '../core';
import {HtmlParser} from '../ml_parser/html_parser';
import {ParseError} from '../parse_util';
import {escapeXml} from './serializers/xml_helper';
/**
 * A container for translated messages
 */
export class TranslationBundle {
  constructor(
    _i18nNodesByMsgId = {},
    locale,
    digest,
    mapperFactory,
    missingTranslationStrategy = MissingTranslationStrategy.Warning,
    console,
  ) {
    this._i18nNodesByMsgId = _i18nNodesByMsgId;
    this.digest = digest;
    this.mapperFactory = mapperFactory;
    this._i18nToHtml = new I18nToHtmlVisitor(
      _i18nNodesByMsgId,
      locale,
      digest,
      mapperFactory,
      missingTranslationStrategy,
      console,
    );
  }
  // Creates a `TranslationBundle` by parsing the given `content` with the `serializer`.
  static load(content, url, serializer, missingTranslationStrategy, console) {
    const {locale, i18nNodesByMsgId} = serializer.load(content, url);
    const digestFn = (m) => serializer.digest(m);
    const mapperFactory = (m) => serializer.createNameMapper(m);
    return new TranslationBundle(
      i18nNodesByMsgId,
      locale,
      digestFn,
      mapperFactory,
      missingTranslationStrategy,
      console,
    );
  }
  // Returns the translation as HTML nodes from the given source message.
  get(srcMsg) {
    const html = this._i18nToHtml.convert(srcMsg);
    if (html.errors.length) {
      throw new Error(html.errors.join('\n'));
    }
    return html.nodes;
  }
  has(srcMsg) {
    return this.digest(srcMsg) in this._i18nNodesByMsgId;
  }
}
class I18nToHtmlVisitor {
  constructor(
    _i18nNodesByMsgId = {},
    _locale,
    _digest,
    _mapperFactory,
    _missingTranslationStrategy,
    _console,
  ) {
    this._i18nNodesByMsgId = _i18nNodesByMsgId;
    this._locale = _locale;
    this._digest = _digest;
    this._mapperFactory = _mapperFactory;
    this._missingTranslationStrategy = _missingTranslationStrategy;
    this._console = _console;
    this._errors = [];
    this._contextStack = [];
  }
  convert(srcMsg) {
    this._contextStack.length = 0;
    this._errors.length = 0;
    // i18n to text
    const text = this._convertToText(srcMsg);
    // text to html
    const url = srcMsg.nodes[0].sourceSpan.start.file.url;
    const html = new HtmlParser().parse(text, url, {tokenizeExpansionForms: true});
    return {
      nodes: html.rootNodes,
      errors: [...this._errors, ...html.errors],
    };
  }
  visitText(text, context) {
    // `convert()` uses an `HtmlParser` to return `html.Node`s
    // we should then make sure that any special characters are escaped
    return escapeXml(text.value);
  }
  visitContainer(container, context) {
    return container.children.map((n) => n.visit(this)).join('');
  }
  visitIcu(icu, context) {
    const cases = Object.keys(icu.cases).map((k) => `${k} {${icu.cases[k].visit(this)}}`);
    // TODO(vicb): Once all format switch to using expression placeholders
    // we should throw when the placeholder is not in the source message
    const exp = this._srcMsg.placeholders.hasOwnProperty(icu.expression)
      ? this._srcMsg.placeholders[icu.expression].text
      : icu.expression;
    return `{${exp}, ${icu.type}, ${cases.join(' ')}}`;
  }
  visitPlaceholder(ph, context) {
    const phName = this._mapper(ph.name);
    if (this._srcMsg.placeholders.hasOwnProperty(phName)) {
      return this._srcMsg.placeholders[phName].text;
    }
    if (this._srcMsg.placeholderToMessage.hasOwnProperty(phName)) {
      return this._convertToText(this._srcMsg.placeholderToMessage[phName]);
    }
    this._addError(ph, `Unknown placeholder "${ph.name}"`);
    return '';
  }
  // Loaded message contains only placeholders (vs tag and icu placeholders).
  // However when a translation can not be found, we need to serialize the source message
  // which can contain tag placeholders
  visitTagPlaceholder(ph, context) {
    const tag = `${ph.tag}`;
    const attrs = Object.keys(ph.attrs)
      .map((name) => `${name}="${ph.attrs[name]}"`)
      .join(' ');
    if (ph.isVoid) {
      return `<${tag} ${attrs}/>`;
    }
    const children = ph.children.map((c) => c.visit(this)).join('');
    return `<${tag} ${attrs}>${children}</${tag}>`;
  }
  // Loaded message contains only placeholders (vs tag and icu placeholders).
  // However when a translation can not be found, we need to serialize the source message
  // which can contain tag placeholders
  visitIcuPlaceholder(ph, context) {
    // An ICU placeholder references the source message to be serialized
    return this._convertToText(this._srcMsg.placeholderToMessage[ph.name]);
  }
  visitBlockPlaceholder(ph, context) {
    const params = ph.parameters.length === 0 ? '' : ` (${ph.parameters.join('; ')})`;
    const children = ph.children.map((c) => c.visit(this)).join('');
    return `@${ph.name}${params} {${children}}`;
  }
  /**
   * Convert a source message to a translated text string:
   * - text nodes are replaced with their translation,
   * - placeholders are replaced with their content,
   * - ICU nodes are converted to ICU expressions.
   */
  _convertToText(srcMsg) {
    const id = this._digest(srcMsg);
    const mapper = this._mapperFactory ? this._mapperFactory(srcMsg) : null;
    let nodes;
    this._contextStack.push({msg: this._srcMsg, mapper: this._mapper});
    this._srcMsg = srcMsg;
    if (this._i18nNodesByMsgId.hasOwnProperty(id)) {
      // When there is a translation use its nodes as the source
      // And create a mapper to convert serialized placeholder names to internal names
      nodes = this._i18nNodesByMsgId[id];
      this._mapper = (name) => (mapper ? mapper.toInternalName(name) : name);
    } else {
      // When no translation has been found
      // - report an error / a warning / nothing,
      // - use the nodes from the original message
      // - placeholders are already internal and need no mapper
      if (this._missingTranslationStrategy === MissingTranslationStrategy.Error) {
        const ctx = this._locale ? ` for locale "${this._locale}"` : '';
        this._addError(srcMsg.nodes[0], `Missing translation for message "${id}"${ctx}`);
      } else if (
        this._console &&
        this._missingTranslationStrategy === MissingTranslationStrategy.Warning
      ) {
        const ctx = this._locale ? ` for locale "${this._locale}"` : '';
        this._console.warn(`Missing translation for message "${id}"${ctx}`);
      }
      nodes = srcMsg.nodes;
      this._mapper = (name) => name;
    }
    const text = nodes.map((node) => node.visit(this)).join('');
    const context = this._contextStack.pop();
    this._srcMsg = context.msg;
    this._mapper = context.mapper;
    return text;
  }
  _addError(el, msg) {
    this._errors.push(new ParseError(el.sourceSpan, msg));
  }
}
//# sourceMappingURL=translation_bundle.js.map
