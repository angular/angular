/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Container, Icu, IcuPlaceholder, Message, Node, Placeholder, Serializer, TagPlaceholder, Text, Visitor, digest} from '@angular/compiler';

class CustomSerializer extends Serializer {
  constructor() { super(); }

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

module.exports = CustomSerializer;
