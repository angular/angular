/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MissingTranslationStrategy} from '@angular/core';

import {warn} from '../facade/lang';
import * as html from '../ml_parser/ast';
import {HtmlParser} from '../ml_parser/html_parser';

import {serializeNodes} from './digest';
import * as i18n from './i18n_ast';
import {I18nError, I18nWarning} from './parse_util';
import {Serializer} from './serializers/serializer';



/**
 * A container for translated messages
 */
export class TranslationBundle {
  private _i18nToHtml: I18nToHtmlVisitor;

  constructor(
      private _i18nNodesByMsgId: {[msgId: string]: i18n.Node[]} = {},
      public digest: (m: i18n.Message) => string,
      private _missingTranslationStrategy: MissingTranslationStrategy) {
    this._i18nToHtml =
        new I18nToHtmlVisitor(_i18nNodesByMsgId, digest, _missingTranslationStrategy);
  }

  static load(
      content: string, url: string, serializer: Serializer,
      missingTranslationStrategy: MissingTranslationStrategy): TranslationBundle {
    const i18nNodesByMsgId = serializer.load(content, url);
    const digestFn = (m: i18n.Message) => serializer.digest(m);
    return new TranslationBundle(i18nNodesByMsgId, digestFn, missingTranslationStrategy);
  }

  get(srcMsg: i18n.Message): html.Node[] {
    const html = this._i18nToHtml.convert(srcMsg);

    if (html.warnings.length) {
      warn(html.warnings.join('\n'));
    }

    if (html.errors.length) {
      throw new Error(html.errors.join('\n'));
    }

    return html.nodes;
  }

  has(srcMsg: i18n.Message): boolean { return this.digest(srcMsg) in this._i18nNodesByMsgId; }
}

class I18nToHtmlVisitor implements i18n.Visitor {
  private _srcMsg: i18n.Message;
  private _srcMsgStack: i18n.Message[] = [];
  private _errors: I18nError[] = [];
  private _warnings: I18nWarning[] = [];

  constructor(
      private _i18nNodesByMsgId: {[msgId: string]: i18n.Node[]} = {},
      private _digest: (m: i18n.Message) => string,
      private _missingTranslationStrategy: MissingTranslationStrategy) {}

  convert(srcMsg: i18n.Message):
      {nodes: html.Node[], errors: I18nError[], warnings: I18nWarning[]} {
    this._srcMsgStack.length = 0;
    this._errors.length = 0;
    // i18n to text
    const text = this._convertToText(srcMsg);

    // text to html
    const url = srcMsg.nodes[0].sourceSpan.start.file.url;
    const html = new HtmlParser().parse(text, url, true);

    return {
      nodes: html.rootNodes,
      errors: [...this._errors, ...html.errors],
      warnings: this._warnings
    };
  }

  visitText(text: i18n.Text, context?: any): string { return text.value; }

  visitContainer(container: i18n.Container, context?: any): any {
    return container.children.map(n => n.visit(this)).join('');
  }

  visitIcu(icu: i18n.Icu, context?: any): any {
    const cases = Object.keys(icu.cases).map(k => `${k} {${icu.cases[k].visit(this)}}`);

    // TODO(vicb): Once all format switch to using expression placeholders
    // we should throw when the placeholder is not in the source message
    const exp = this._srcMsg.placeholders.hasOwnProperty(icu.expression) ?
        this._srcMsg.placeholders[icu.expression] :
        icu.expression;

    return `{${exp}, ${icu.type}, ${cases.join(' ')}}`;
  }

  visitPlaceholder(ph: i18n.Placeholder, context?: any): string {
    const phName = ph.name;
    if (this._srcMsg.placeholders.hasOwnProperty(phName)) {
      return this._srcMsg.placeholders[phName];
    }

    if (this._srcMsg.placeholderToMessage.hasOwnProperty(phName)) {
      return this._convertToText(this._srcMsg.placeholderToMessage[phName]);
    }

    this._addError(ph, `Unknown placeholder`);
    return '';
  }

  visitTagPlaceholder(ph: i18n.TagPlaceholder, context?: any): any { throw 'unreachable code'; }

  visitIcuPlaceholder(ph: i18n.IcuPlaceholder, context?: any): any { throw 'unreachable code'; }

  private _convertToText(srcMsg: i18n.Message): string {
    const digest = this._digest(srcMsg);
    if (this._i18nNodesByMsgId.hasOwnProperty(digest)) {
      this._srcMsgStack.push(this._srcMsg);
      this._srcMsg = srcMsg;
      const nodes = this._i18nNodesByMsgId[digest];
      const text = nodes.map(node => node.visit(this)).join('');
      this._srcMsg = this._srcMsgStack.pop();
      return text;
    }

    // No valid translation found
    if (this._missingTranslationStrategy === MissingTranslationStrategy.Error) {
      this._addError(srcMsg.nodes[0], `Missing translation for message ${digest}`);
    } else if (this._missingTranslationStrategy === MissingTranslationStrategy.Warning) {
      this._addWarning(srcMsg.nodes[0], `Missing translation for message ${digest}`);
    }

    // In an case, Warning, Error or Ignore, return the srcMsg without translation
    return serializeNodes(srcMsg.nodes).join('');
  }

  private _addError(el: i18n.Node, msg: string) {
    this._errors.push(new I18nError(el.sourceSpan, msg));
  }

  private _addWarning(el: i18n.Node, msg: string) {
    this._warnings.push(new I18nWarning(el.sourceSpan, msg));
  }
}
