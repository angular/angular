/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MissingTranslationStrategy} from '../core';
import * as html from '../ml_parser/ast';
import {HtmlParser} from '../ml_parser/html_parser';
import {Console} from '../util';

import * as i18n from './i18n_ast';
import {I18nError} from './parse_util';
import {PlaceholderMapper, Serializer} from './serializers/serializer';
import {escapeXml} from './serializers/xml_helper';


/**
 * A container for translated messages
 */
export class TranslationBundle {
  private _i18nToHtml: I18nToHtmlVisitor;

  constructor(
      private _i18nNodesByMsgId: {[msgId: string]: i18n.Node[]} = {}, locale: string|null,
      public digest: (m: i18n.Message) => string,
      public mapperFactory?: (m: i18n.Message) => PlaceholderMapper,
      missingTranslationStrategy: MissingTranslationStrategy = MissingTranslationStrategy.Warning,
      console?: Console) {
    this._i18nToHtml = new I18nToHtmlVisitor(
        _i18nNodesByMsgId, locale, digest, mapperFactory!, missingTranslationStrategy, console);
  }

  // Creates a `TranslationBundle` by parsing the given `content` with the `serializer`.
  static load(
      content: string, url: string, serializer: Serializer,
      missingTranslationStrategy: MissingTranslationStrategy,
      console?: Console): TranslationBundle {
    const {locale, i18nNodesByMsgId} = serializer.load(content, url);
    const digestFn = (m: i18n.Message) => serializer.digest(m);
    const mapperFactory = (m: i18n.Message) => serializer.createNameMapper(m)!;
    return new TranslationBundle(
        i18nNodesByMsgId, locale, digestFn, mapperFactory, missingTranslationStrategy, console);
  }

  // Returns the translation as HTML nodes from the given source message.
  get(srcMsg: i18n.Message): html.Node[] {
    const html = this._i18nToHtml.convert(srcMsg);

    if (html.errors.length) {
      throw new Error(html.errors.join('\n'));
    }

    return html.nodes;
  }

  has(srcMsg: i18n.Message): boolean {
    return this.digest(srcMsg) in this._i18nNodesByMsgId;
  }
}

class I18nToHtmlVisitor implements i18n.Visitor {
  // using non-null assertions because they're (re)set by convert()
  private _srcMsg!: i18n.Message;
  private _errors: I18nError[] = [];
  private _contextStack: {msg: i18n.Message, mapper: (name: string) => string}[] = [];
  private _mapper!: (name: string) => string;

  constructor(
      private _i18nNodesByMsgId: {[msgId: string]: i18n.Node[]} = {}, private _locale: string|null,
      private _digest: (m: i18n.Message) => string,
      private _mapperFactory: (m: i18n.Message) => PlaceholderMapper,
      private _missingTranslationStrategy: MissingTranslationStrategy, private _console?: Console) {
  }

  convert(srcMsg: i18n.Message): {nodes: html.Node[], errors: I18nError[]} {
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

  visitText(text: i18n.Text, context?: any): string {
    // `convert()` uses an `HtmlParser` to return `html.Node`s
    // we should then make sure that any special characters are escaped
    return escapeXml(text.value);
  }

  visitContainer(container: i18n.Container, context?: any): any {
    return container.children.map(n => n.visit(this)).join('');
  }

  visitIcu(icu: i18n.Icu, context?: any): any {
    const cases = Object.keys(icu.cases).map(k => `${k} {${icu.cases[k].visit(this)}}`);

    // TODO(vicb): Once all format switch to using expression placeholders
    // we should throw when the placeholder is not in the source message
    const exp = this._srcMsg.placeholders.hasOwnProperty(icu.expression) ?
        this._srcMsg.placeholders[icu.expression].text :
        icu.expression;

    return `{${exp}, ${icu.type}, ${cases.join(' ')}}`;
  }

  visitPlaceholder(ph: i18n.Placeholder, context?: any): string {
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
  visitTagPlaceholder(ph: i18n.TagPlaceholder, context?: any): string {
    const tag = `${ph.tag}`;
    const attrs = Object.keys(ph.attrs).map(name => `${name}="${ph.attrs[name]}"`).join(' ');
    if (ph.isVoid) {
      return `<${tag} ${attrs}/>`;
    }
    const children = ph.children.map((c: i18n.Node) => c.visit(this)).join('');
    return `<${tag} ${attrs}>${children}</${tag}>`;
  }

  // Loaded message contains only placeholders (vs tag and icu placeholders).
  // However when a translation can not be found, we need to serialize the source message
  // which can contain tag placeholders
  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): string {
    // An ICU placeholder references the source message to be serialized
    return this._convertToText(this._srcMsg.placeholderToMessage[ph.name]);
  }

  /**
   * Convert a source message to a translated text string:
   * - text nodes are replaced with their translation,
   * - placeholders are replaced with their content,
   * - ICU nodes are converted to ICU expressions.
   */
  private _convertToText(srcMsg: i18n.Message): string {
    const id = this._digest(srcMsg);
    const mapper = this._mapperFactory ? this._mapperFactory(srcMsg) : null;
    let nodes: i18n.Node[];

    this._contextStack.push({msg: this._srcMsg, mapper: this._mapper});
    this._srcMsg = srcMsg;

    if (this._i18nNodesByMsgId.hasOwnProperty(id)) {
      // When there is a translation use its nodes as the source
      // And create a mapper to convert serialized placeholder names to internal names
      nodes = this._i18nNodesByMsgId[id];
      this._mapper = (name: string) => mapper ? mapper.toInternalName(name)! : name;
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
          this._missingTranslationStrategy === MissingTranslationStrategy.Warning) {
        const ctx = this._locale ? ` for locale "${this._locale}"` : '';
        this._console.warn(`Missing translation for message "${id}"${ctx}`);
      }
      nodes = srcMsg.nodes;
      this._mapper = (name: string) => name;
    }
    const text = nodes.map(node => node.visit(this)).join('');
    const context = this._contextStack.pop()!;
    this._srcMsg = context.msg;
    this._mapper = context.mapper;
    return text;
  }

  private _addError(el: i18n.Node, msg: string) {
    this._errors.push(new I18nError(el.sourceSpan, msg));
  }
}
