/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter, Injectable, Type} from '@angular/core';
import {MessageBus} from '../shared/message_bus';
import {Serializer, SerializerTypes} from '../shared/serializer';


/**
 * @experimental WebWorker support in Angular is currently experimental.
 */
export abstract class ServiceMessageBrokerFactory {
  /**
   * Initializes the given channel and attaches a new {@link ServiceMessageBroker} to it.
   */
  abstract createMessageBroker(channel: string, runInZone?: boolean): ServiceMessageBroker;
}

@Injectable()
export class ServiceMessageBrokerFactory_ extends ServiceMessageBrokerFactory {
  /** @internal */
  _serializer: Serializer;

  constructor(private _messageBus: MessageBus, _serializer: Serializer) {
    super();
    this._serializer = _serializer;
  }

  createMessageBroker(channel: string, runInZone: boolean = true): ServiceMessageBroker {
    this._messageBus.initChannel(channel, runInZone);
    return new ServiceMessageBroker_(this._messageBus, this._serializer, channel);
  }
}

/**
 * Helper class for UIComponents that allows components to register methods.
 * If a registered method message is received from the broker on the worker,
 * the UIMessageBroker deserializes its arguments and calls the registered method.
 * If that method returns a promise, the UIMessageBroker returns the result to the worker.
 *
 * @experimental WebWorker support in Angular is currently experimental.
 */
export abstract class ServiceMessageBroker {
  abstract registerMethod(
      methodName: string, signature: Array<Type<any>|SerializerTypes>|null, method: Function,
      returnType?: Type<any>|SerializerTypes): void;
}

export class ServiceMessageBroker_ extends ServiceMessageBroker {
  private _sink: EventEmitter<any>;
  private _methods = new Map<string, Function>();

  constructor(messageBus: MessageBus, private _serializer: Serializer, public channel: string) {
    super();
    this._sink = messageBus.to(channel);
    const source = messageBus.from(channel);
    source.subscribe({next: (message: any) => this._handleMessage(message)});
  }

  registerMethod(
      methodName: string, signature: Array<Type<any>|SerializerTypes>,
      method: (..._: any[]) => Promise<any>| void, returnType?: Type<any>|SerializerTypes): void {
    this._methods.set(methodName, (message: ReceivedMessage) => {
      const serializedArgs = message.args;
      const numArgs = signature ? signature.length : 0;
      const deserializedArgs = new Array(numArgs);
      for (let i = 0; i < numArgs; i++) {
        const serializedArg = serializedArgs[i];
        deserializedArgs[i] = this._serializer.deserialize(serializedArg, signature[i]);
      }

      const promise = method(...deserializedArgs);
      if (returnType && promise) {
        this._wrapWebWorkerPromise(message.id, promise, returnType);
      }
    });
  }

  private _handleMessage(message: ReceivedMessage): void {
    if (this._methods.has(message.method)) {
      this._methods.get(message.method) !(message);
    }
  }

  private _wrapWebWorkerPromise(id: string, promise: Promise<any>, type: Type<any>|SerializerTypes):
      void {
    promise.then((result: any) => {
      this._sink.emit({
        'type': 'result',
        'value': this._serializer.serialize(result, type),
        'id': id,
      });
    });
  }
}

/**
 * @experimental WebWorker support in Angular is currently experimental.
 */
export interface ReceivedMessage {
  method: string;
  args: any[];
  id: string;
  type: string;
}
