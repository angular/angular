import { MessageBus, Events } from 'protocol';
import { subscribeToClientEvents } from './client-event-subscribers';

export const initialize = (messageBus: MessageBus<Events>) => {
  subscribeToClientEvents(messageBus);
};
