import { MessageBus, Events } from 'protocol';
import { subscribeToClientEvents } from './client-event-subscribers';
import { observeDOM } from './dom-observer';

export const initializeMessageBus = (messageBus: MessageBus<Events>) => {
  observeDOM();
  subscribeToClientEvents(messageBus);
};
