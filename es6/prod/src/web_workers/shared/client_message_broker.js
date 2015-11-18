var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { MessageBus } from "angular2/src/web_workers/shared/message_bus";
import { print, isPresent, DateWrapper, stringify } from "angular2/src/facade/lang";
import { PromiseWrapper, ObservableWrapper } from "angular2/src/facade/async";
import { StringMapWrapper } from "angular2/src/facade/collection";
import { Serializer } from "angular2/src/web_workers/shared/serializer";
import { Injectable } from "angular2/src/core/di";
import { StringWrapper } from "angular2/src/facade/lang";
export { Type } from "angular2/src/facade/lang";
export class ClientMessageBrokerFactory {
}
export let ClientMessageBrokerFactory_ = class extends ClientMessageBrokerFactory {
    constructor(_messageBus, _serializer) {
        super();
        this._messageBus = _messageBus;
        this._serializer = _serializer;
    }
    /**
     * Initializes the given channel and attaches a new {@link ClientMessageBroker} to it.
     */
    createMessageBroker(channel, runInZone = true) {
        this._messageBus.initChannel(channel, runInZone);
        return new ClientMessageBroker_(this._messageBus, this._serializer, channel);
    }
};
ClientMessageBrokerFactory_ = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [MessageBus, Serializer])
], ClientMessageBrokerFactory_);
export class ClientMessageBroker {
}
export class ClientMessageBroker_ extends ClientMessageBroker {
    constructor(messageBus, _serializer, channel) {
        super();
        this.channel = channel;
        this._pending = new Map();
        this._sink = messageBus.to(channel);
        this._serializer = _serializer;
        var source = messageBus.from(channel);
        ObservableWrapper.subscribe(source, (message) => this._handleMessage(message));
    }
    _generateMessageId(name) {
        var time = stringify(DateWrapper.toMillis(DateWrapper.now()));
        var iteration = 0;
        var id = name + time + stringify(iteration);
        while (isPresent(this._pending[id])) {
            id = `${name}${time}${iteration}`;
            iteration++;
        }
        return id;
    }
    runOnService(args, returnType) {
        var fnArgs = [];
        if (isPresent(args.args)) {
            args.args.forEach(argument => {
                if (argument.type != null) {
                    fnArgs.push(this._serializer.serialize(argument.value, argument.type));
                }
                else {
                    fnArgs.push(argument.value);
                }
            });
        }
        var promise;
        var id = null;
        if (returnType != null) {
            var completer = PromiseWrapper.completer();
            id = this._generateMessageId(args.method);
            this._pending.set(id, completer);
            PromiseWrapper.catchError(completer.promise, (err, stack) => {
                print(err);
                completer.reject(err, stack);
            });
            promise = PromiseWrapper.then(completer.promise, (value) => {
                if (this._serializer == null) {
                    return value;
                }
                else {
                    return this._serializer.deserialize(value, returnType);
                }
            });
        }
        else {
            promise = null;
        }
        // TODO(jteplitz602): Create a class for these messages so we don't keep using StringMap #3685
        var message = { 'method': args.method, 'args': fnArgs };
        if (id != null) {
            message['id'] = id;
        }
        ObservableWrapper.callNext(this._sink, message);
        return promise;
    }
    _handleMessage(message) {
        var data = new MessageData(message);
        // TODO(jteplitz602): replace these strings with messaging constants #3685
        if (StringWrapper.equals(data.type, "result") || StringWrapper.equals(data.type, "error")) {
            var id = data.id;
            if (this._pending.has(id)) {
                if (StringWrapper.equals(data.type, "result")) {
                    this._pending.get(id).resolve(data.value);
                }
                else {
                    this._pending.get(id).reject(data.value, null);
                }
                this._pending.delete(id);
            }
        }
    }
}
class MessageData {
    constructor(data) {
        this.type = StringMapWrapper.get(data, "type");
        this.id = this._getValueIfPresent(data, "id");
        this.value = this._getValueIfPresent(data, "value");
    }
    /**
     * Returns the value from the StringMap if present. Otherwise returns null
     * @internal
     */
    _getValueIfPresent(data, key) {
        if (StringMapWrapper.contains(data, key)) {
            return StringMapWrapper.get(data, key);
        }
        else {
            return null;
        }
    }
}
export class FnArg {
    constructor(value, type) {
        this.value = value;
        this.type = type;
    }
}
export class UiArguments {
    constructor(method, args) {
        this.method = method;
        this.args = args;
    }
}
//# sourceMappingURL=client_message_broker.js.map