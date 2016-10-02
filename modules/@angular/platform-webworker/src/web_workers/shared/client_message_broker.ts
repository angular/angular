/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable, Type} from '@angular/core';

import {EventEmitter} from '../../facade/async';
import {StringWrapper, isPresent, print, stringify} from '../../facade/lang';

import {MessageBus} from './message_bus';
import {Serializer} from './serializer';

/**
 * @experimental WebWorker support in Angular is experimental.
 */
export abstract class ClientMessageBrokerFactory {
  /**
   * Initializes the given channel and attaches a new {@link ClientMessageBroker} to it.
   */
  abstract createMessageBroker(channel: string, runInZone?: boolean): ClientMessageBroker;
}

@Injectable()
export class ClientMessageBrokerFactory_ extends ClientMessageBrokerFactory {
  /** @internal */
  _serializer: Serializer;
  constructor(private _messageBus: MessageBus, _serializer: Serializer) {
    super();
    this._serializer = _serializer;
  }

  /**
   * Initializes the given channel and attaches a new {@link ClientMessageBroker} to it.
   */
  createMessageBroker(channel: string, runInZone: boolean = true): ClientMessageBroker {
    this._messageBus.initChannel(channel, runInZone);
    return new ClientMessageBroker_(this._messageBus, this._serializer, channel);
  }
}

/**
 * @experimental WebWorker support in Angular is experimental.
 */
export abstract class ClientMessageBroker {
  abstract runOnService(args: UiArguments, returnType: Type<any>): Promise<any>;
}

interface PromiseCompleter {
  resolve: (result: any) => void;
  reject: (err: any) => void;
}

export class ClientMessageBroker_ extends ClientMessageBroker {
  private _pending: Map<string, PromiseCompleter> = new Map<string, PromiseCompleter>();
  private _sink: EventEmitter<any>;
  /** @internal */
  public _serializer: Serializer;

  constructor(
      messageBus: MessageBus, _serializer: Serializer, public channel: any /** TODO #9100 */) {
    super();
    this._sink = messageBus.to(channel);
    this._serializer = _serializer;
    var source = messageBus.from(channel);

    source.subscribe({next: (message: {[key: string]: any}) => this._handleMessage(message)});
  }

  private _generateMessageId(name: string): string {
    var time: string = stringify(new Date().getTime());
    var iteration: number = 0;
    var id: string = name + time + stringify(iteration);
    while (isPresent((this as any /** TODO #9100 */)._pending[id])) {
      id = `${name}${time}${iteration}`;
      iteration++;
    }
    return id;
  }

  runOnService(args: UiArguments, returnType: Type<any>): Promise<any> {
    var fnArgs: any[] /** TODO #9100 */ = [];
    if (isPresent(args.args)) {
      args.args.forEach(argument => {
        if (argument.type != null) {
          fnArgs.push(this._serializer.serialize(argument.value, argument.type));
        } else {
          fnArgs.push(argument.value);
        }
      });
    }

    var promise: Promise<any>;
    var id: string = null;
    if (returnType != null) {
      let completer: PromiseCompleter;
      promise = new Promise((resolve, reject) => { completer = {resolve, reject}; });
      id = this._generateMessageId(args.method);
      this._pending.set(id, completer);
      promise.catch((err) => {
        print(err);
        completer.reject(err);
      });

      promise = promise.then((value: any) => {
        if (this._serializer == null) {
          return value;
        } else {
          return this._serializer.deserialize(value, returnType);
        }
      });
    } else {
      promise = null;
    }

    // TODO(jteplitz602): Create a class for these messages so we don't keep using StringMap #3685
    var message = {'method': args.method, 'args': fnArgs};
    if (id != null) {
      (message as any /** TODO #9100 */)['id'] = id;
    }
    this._sink.emit(message);

    return promise;
  }

  private _handleMessage(message: {[key: string]: any}): void {
    var data = new MessageData(message);
    // TODO(jteplitz602): replace these strings with messaging constants #3685
    if (StringWrapper.equals(data.type, 'result') || StringWrapper.equals(data.type, 'error')) {
      var id = data.id;
      if (this._pending.has(id)) {
        if (StringWrapper.equals(data.type, 'result')) {
          this._pending.get(id).resolve(data.value);
        } else {
          this._pending.get(id).reject(data.value);
        }
        this._pending.delete(id);
      }
    }
  }
}

class MessageData {
  type: string;
  value: any;
  id: string;

  constructor(data: {[key: string]: any}) {
    this.type = data['type'];
    this.id = this._getValueIfPresent(data, 'id');
    this.value = this._getValueIfPresent(data, 'value');
  }

  /**
   * Returns the value if present, otherwise returns null
   * @internal
   */
  _getValueIfPresent(data: {[key: string]: any}, key: string) {
    return data.hasOwnProperty(key) ? data[key] : null;
  }
}

/**
 * @experimental WebWorker support in Angular is experimental.
 */
export class FnArg {
  constructor(public value: any /** TODO #9100 */, public type: Type<any>) {}
}

/**
 * @experimental WebWorker support in Angular is experimental.
 */
export class UiArguments {
  constructor(public method: string, public args?: FnArg[]) {}
}
