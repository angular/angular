/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, Type} from '@angular/core';

import {EventEmitter} from '../../facade/async';
import {FunctionWrapper, isPresent} from '../../facade/lang';
import {MessageBus} from '../shared/message_bus';
import {Serializer} from '../shared/serializer';

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
      methodName: string, signature: Type<any>[], method: Function, returnType?: Type<any>): void;
}

export class ServiceMessageBroker_ extends ServiceMessageBroker {
  private _sink: EventEmitter<any>;
  private _methods: Map<string, Function> = new Map<string, Function>();

  constructor(
      messageBus: MessageBus, private _serializer: Serializer,
      public channel: any /** TODO #9100 */) {
    super();
    this._sink = messageBus.to(channel);
    var source = messageBus.from(channel);
    source.subscribe({next: (message: any) => this._handleMessage(message)});
  }

  registerMethod(
      methodName: string, signature: Type<any>[], method: (..._: any[]) => Promise<any>| void,
      returnType?: Type<any>): void {
    this._methods.set(methodName, (message: ReceivedMessage) => {
      var serializedArgs = message.args;
      let numArgs = signature === null ? 0 : signature.length;
      var deserializedArgs: any[] = new Array(numArgs);
      for (var i = 0; i < numArgs; i++) {
        var serializedArg = serializedArgs[i];
        deserializedArgs[i] = this._serializer.deserialize(serializedArg, signature[i]);
      }

      var promise = FunctionWrapper.apply(method, deserializedArgs);
      if (isPresent(returnType) && isPresent(promise)) {
        this._wrapWebWorkerPromise(message.id, promise, returnType);
      }
    });
  }

  private _handleMessage(map: {[key: string]: any}): void {
    var message = new ReceivedMessage(map);
    if (this._methods.has(message.method)) {
      this._methods.get(message.method)(message);
    }
  }

  private _wrapWebWorkerPromise(id: string, promise: Promise<any>, type: Type<any>): void {
    promise.then((result: any) => {
      this._sink.emit(
          {'type': 'result', 'value': this._serializer.serialize(result, type), 'id': id});
    });
  }
}

/**
 * @experimental WebWorker support in Angular is currently experimental.
 */
export class ReceivedMessage {
  method: string;
  args: any[];
  id: string;
  type: string;

  constructor(data: {[key: string]: any}) {
    this.method = data['method'];
    this.args = data['args'];
    this.id = data['id'];
    this.type = data['type'];
  }
}
