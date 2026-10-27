/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {MessageBus} from './message-bus';
import {Events, Topic} from './messages';

type ThrottleTopicDuration = {
  [method in Topic]?: number;
};

type ThrottledTopics = {
  [method in Topic]?: boolean;
};

type TopicsInProgress = {
  [method in Topic]?: boolean;
};

const THROTTLE_METHODS: ThrottleTopicDuration = {
  getLatestComponentExplorerView: 100,
};

type TopicBlockSequence = {
  [method in Topic]?: Topic[];
};

// We can't refresh the view until we've received
// a response with the latest nested properties.
const TOPIC_BLOCK_SEQUENCE: TopicBlockSequence = {
  getLatestComponentExplorerView: ['getNestedProperties'],
};

type TopicSequence = {
  [method in Topic]?: Topic;
};

const TOPIC_RESPONSE: TopicSequence = {
  getNestedProperties: 'nestedProperties',
};

const TOPIC_REQUEST: TopicSequence = {
  nestedProperties: 'getNestedProperties',
};

export class PriorityAwareMessageBus extends MessageBus<Events> {
  private throttled: ThrottledTopics = {};
  private inProgress: TopicsInProgress = {};

  constructor(
    private bus: MessageBus<Events>,
    // Binding is necessary to ensure that `setTimeout` is called in the global context.
    // an doesn't throw "Illegal invocation" error.
    private setTimeout: typeof globalThis.setTimeout = globalThis.setTimeout.bind(globalThis),
  ) {
    super();
  }

  override on<E extends Topic>(topic: E, cb: Events[E]): () => void {
    return this.bus.on(topic, (...args: any) => {
      (cb as any)(...args);
      this.afterMessage(topic);
    });
  }

  override once<E extends Topic>(topic: E, cb: Events[E]): void {
    return this.bus.once(topic, (...args: any) => {
      (cb as any)(...args);
      this.afterMessage(topic);
    });
  }

  override emit<E extends Topic>(topic: E, args?: Parameters<Events[E]>): boolean {
    if (this.throttled[topic]) {
      return false;
    }
    if (TOPIC_RESPONSE[topic]) {
      this.inProgress[topic] = true;
    }
    const blockedBy = TOPIC_BLOCK_SEQUENCE[topic];
    if (blockedBy) {
      // The source code here is safe.
      // TypeScript type inference ignores the null check here.
      for (const blocker of blockedBy!) {
        if (this.inProgress[blocker]) {
          return false;
        }
      }
    }
    if (THROTTLE_METHODS[topic]) {
      this.throttled[topic] = true;
      this.setTimeout(() => (this.throttled[topic] = false), THROTTLE_METHODS[topic]);
    }
    return this.bus.emit(topic, args);
  }

  override destroy(): void {
    this.bus.destroy();
  }

  private afterMessage(topic: Topic): void {
    const request = TOPIC_REQUEST[topic];
    if (!request) {
      return;
    }
    if (this.inProgress[request]) {
      this.inProgress[request] = false;
    }
  }
}
