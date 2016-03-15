import {isPresent} from 'angular2/src/facade/lang';
import {Message, id} from './message';

export function serialize(messages: Message[]): string {
  let ms = messages.map((m) => _serializeMessage(m)).join("");
  return `<message-bundle>${ms}</message-bundle>`;
}

function _serializeMessage(m: Message): string {
  let desc = isPresent(m.description) ? ` desc='${m.description}'` : "";
  return `<msg id='${id(m)}'${desc}>${m.content}</msg>`;
}