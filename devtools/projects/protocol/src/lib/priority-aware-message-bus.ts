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
  private _throttled: ThrottledTopics = {};
  private _inProgress: TopicsInProgress = {};

  constructor(
    private _bus: MessageBus<Events>,
    // Binding is necessary to ensure that `setTimeout` is called in the global context.
    // an doesn't throw "Illegal invocation" error.
    private _setTimeout: typeof setTimeout = setTimeout.bind(globalThis),
  ) {
    super();
  }

  override on<E extends Topic>(topic: E, cb: Events[E]): void {
    return this._bus.on(topic, (...args: any) => {
      (cb as any)(...args);
      this._afterMessage(topic);
    });
  }

  override once<E extends Topic>(topic: E, cb: Events[E]): void {
    return this._bus.once(topic, (...args: any) => {
      (cb as any)(...args);
      this._afterMessage(topic);
    });
  }

  override emit<E extends Topic>(topic: E, args?: Parameters<Events[E]>): boolean {
    if (this._throttled[topic]) {
      return false;
    }
    if (TOPIC_RESPONSE[topic]) {
      this._inProgress[topic] = true;
    }
    const blockedBy = TOPIC_BLOCK_SEQUENCE[topic];
    if (blockedBy) {
      // The source code here is safe.
      // TypeScript type inference ignores the null check here.
      for (const blocker of blockedBy!) {
        if (this._inProgress[blocker]) {
          return false;
        }
      }
    }
    if (THROTTLE_METHODS[topic]) {
      this._throttled[topic] = true;
      this._setTimeout(() => (this._throttled[topic] = false), THROTTLE_METHODS[topic]);
    }
    return this._bus.emit(topic, args);
  }

  override destroy(): void {
    this._bus.destroy();
  }

  private _afterMessage(topic: Topic): void {
    const request = TOPIC_REQUEST[topic];
    if (!request) {
      return;
    }
    if (this._inProgress[request]) {
      this._inProgress[request] = false;
    }
  }
}
