import { Events, MessageBus } from 'protocol';

export const initializeRefreshSubscriber = (messageBus: MessageBus<Events>): void => {
  window.addEventListener('beforeunload', () => {
    messageBus.emit('reload');
  });
};
