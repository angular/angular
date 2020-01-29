import { MessageBus, Events } from 'protocol';
import { generateEvents } from './event-generators';

export const initialize = (messageBus: MessageBus<Events>) => {
  generateEvents(messageBus);
};
