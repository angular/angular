var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { MessageBus } from "angular2/src/web_workers/shared/message_bus";
import { print, isPresent, DateWrapper, stringify, StringWrapper } from "angular2/src/facade/lang";
import { PromiseWrapper, ObservableWrapper } from "angular2/src/facade/async";
import { StringMapWrapper } from "angular2/src/facade/collection";
import { Serializer } from "angular2/src/web_workers/shared/serializer";
import { Injectable } from "angular2/src/core/di";
export { Type } from "angular2/src/facade/lang";
export class ClientMessageBrokerFactory {
}
export let ClientMessageBrokerFactory_ = class ClientMessageBrokerFactory_ extends ClientMessageBrokerFactory {
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
        ObservableWrapper.callEmit(this._sink, message);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50X21lc3NhZ2VfYnJva2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9jbGllbnRfbWVzc2FnZV9icm9rZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSw2Q0FBNkM7T0FDL0QsRUFDTCxLQUFLLEVBQ0wsU0FBUyxFQUNULFdBQVcsRUFDWCxTQUFTLEVBRVQsYUFBYSxFQUNkLE1BQU0sMEJBQTBCO09BQzFCLEVBRUwsY0FBYyxFQUNkLGlCQUFpQixFQUVsQixNQUFNLDJCQUEyQjtPQUMzQixFQUFDLGdCQUFnQixFQUFhLE1BQU0sZ0NBQWdDO09BQ3BFLEVBQUMsVUFBVSxFQUFDLE1BQU0sNENBQTRDO09BQzlELEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO0FBQy9DLFNBQVEsSUFBSSxRQUFPLDBCQUEwQixDQUFDO0FBRTlDO0FBS0EsQ0FBQztBQUdELG1GQUFpRCwwQkFBMEI7SUFHekUsWUFBb0IsV0FBdUIsRUFBRSxXQUF1QjtRQUNsRSxPQUFPLENBQUM7UUFEVSxnQkFBVyxHQUFYLFdBQVcsQ0FBWTtRQUV6QyxJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztJQUNqQyxDQUFDO0lBRUQ7O09BRUc7SUFDSCxtQkFBbUIsQ0FBQyxPQUFlLEVBQUUsU0FBUyxHQUFZLElBQUk7UUFDNUQsSUFBSSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQ2pELE1BQU0sQ0FBQyxJQUFJLG9CQUFvQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMvRSxDQUFDO0FBQ0gsQ0FBQztBQWhCRDtJQUFDLFVBQVUsRUFBRTs7K0JB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QUksQ0FBQztRQUNkLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVEO0lBQ0UsWUFBbUIsS0FBSyxFQUFTLElBQVU7UUFBeEIsVUFBSyxHQUFMLEtBQUssQ0FBQTtRQUFTLFNBQUksR0FBSixJQUFJLENBQU07SUFBRyxDQUFDO0FBQ2pELENBQUM7QUFFRDtJQUNFLFlBQW1CLE1BQWMsRUFBUyxJQUFjO1FBQXJDLFdBQU0sR0FBTixNQUFNLENBQVE7UUFBUyxTQUFJLEdBQUosSUFBSSxDQUFVO0lBQUcsQ0FBQztBQUM5RCxDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gXCJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2VfYnVzXCI7XG5pbXBvcnQge1xuICBwcmludCxcbiAgaXNQcmVzZW50LFxuICBEYXRlV3JhcHBlcixcbiAgc3RyaW5naWZ5LFxuICBUeXBlLFxuICBTdHJpbmdXcmFwcGVyXG59IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmdcIjtcbmltcG9ydCB7XG4gIFByb21pc2VDb21wbGV0ZXIsXG4gIFByb21pc2VXcmFwcGVyLFxuICBPYnNlcnZhYmxlV3JhcHBlcixcbiAgRXZlbnRFbWl0dGVyXG59IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jXCI7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXIsIE1hcFdyYXBwZXJ9IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb25cIjtcbmltcG9ydCB7U2VyaWFsaXplcn0gZnJvbSBcImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplclwiO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvZGlcIjtcbmV4cG9ydCB7VHlwZX0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2xpZW50TWVzc2FnZUJyb2tlckZhY3Rvcnkge1xuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGdpdmVuIGNoYW5uZWwgYW5kIGF0dGFjaGVzIGEgbmV3IHtAbGluayBDbGllbnRNZXNzYWdlQnJva2VyfSB0byBpdC5cbiAgICovXG4gIGFic3RyYWN0IGNyZWF0ZU1lc3NhZ2VCcm9rZXIoY2hhbm5lbDogc3RyaW5nLCBydW5JblpvbmU/OiBib29sZWFuKTogQ2xpZW50TWVzc2FnZUJyb2tlcjtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5XyBleHRlbmRzIENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXI7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX21lc3NhZ2VCdXM6IE1lc3NhZ2VCdXMsIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9zZXJpYWxpemVyID0gX3NlcmlhbGl6ZXI7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGdpdmVuIGNoYW5uZWwgYW5kIGF0dGFjaGVzIGEgbmV3IHtAbGluayBDbGllbnRNZXNzYWdlQnJva2VyfSB0byBpdC5cbiAgICovXG4gIGNyZWF0ZU1lc3NhZ2VCcm9rZXIoY2hhbm5lbDogc3RyaW5nLCBydW5JblpvbmU6IGJvb2xlYW4gPSB0cnVlKTogQ2xpZW50TWVzc2FnZUJyb2tlciB7XG4gICAgdGhpcy5fbWVzc2FnZUJ1cy5pbml0Q2hhbm5lbChjaGFubmVsLCBydW5JblpvbmUpO1xuICAgIHJldHVybiBuZXcgQ2xpZW50TWVzc2FnZUJyb2tlcl8odGhpcy5fbWVzc2FnZUJ1cywgdGhpcy5fc2VyaWFsaXplciwgY2hhbm5lbCk7XG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENsaWVudE1lc3NhZ2VCcm9rZXIge1xuICBhYnN0cmFjdCBydW5PblNlcnZpY2UoYXJnczogVWlBcmd1bWVudHMsIHJldHVyblR5cGU6IFR5cGUpOiBQcm9taXNlPGFueT47XG59XG5cbmV4cG9ydCBjbGFzcyBDbGllbnRNZXNzYWdlQnJva2VyXyBleHRlbmRzIENsaWVudE1lc3NhZ2VCcm9rZXIge1xuICBwcml2YXRlIF9wZW5kaW5nOiBNYXA8c3RyaW5nLCBQcm9taXNlQ29tcGxldGVyPGFueT4+ID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2VDb21wbGV0ZXI8YW55Pj4oKTtcbiAgcHJpdmF0ZSBfc2luazogRXZlbnRFbWl0dGVyPGFueT47XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2VCdXM6IE1lc3NhZ2VCdXMsIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyLCBwdWJsaWMgY2hhbm5lbCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fc2luayA9IG1lc3NhZ2VCdXMudG8oY2hhbm5lbCk7XG4gICAgdGhpcy5fc2VyaWFsaXplciA9IF9zZXJpYWxpemVyO1xuICAgIHZhciBzb3VyY2UgPSBtZXNzYWdlQnVzLmZyb20oY2hhbm5lbCk7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKG1lc3NhZ2U6IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiB0aGlzLl9oYW5kbGVNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dlbmVyYXRlTWVzc2FnZUlkKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgdmFyIHRpbWU6IHN0cmluZyA9IHN0cmluZ2lmeShEYXRlV3JhcHBlci50b01pbGxpcyhEYXRlV3JhcHBlci5ub3coKSkpO1xuICAgIHZhciBpdGVyYXRpb246IG51bWJlciA9IDA7XG4gICAgdmFyIGlkOiBzdHJpbmcgPSBuYW1lICsgdGltZSArIHN0cmluZ2lmeShpdGVyYXRpb24pO1xuICAgIHdoaWxlIChpc1ByZXNlbnQodGhpcy5fcGVuZGluZ1tpZF0pKSB7XG4gICAgICBpZCA9IGAke25hbWV9JHt0aW1lfSR7aXRlcmF0aW9ufWA7XG4gICAgICBpdGVyYXRpb24rKztcbiAgICB9XG4gICAgcmV0dXJuIGlkO1xuICB9XG5cbiAgcnVuT25TZXJ2aWNlKGFyZ3M6IFVpQXJndW1lbnRzLCByZXR1cm5UeXBlOiBUeXBlKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgZm5BcmdzID0gW107XG4gICAgaWYgKGlzUHJlc2VudChhcmdzLmFyZ3MpKSB7XG4gICAgICBhcmdzLmFyZ3MuZm9yRWFjaChhcmd1bWVudCA9PiB7XG4gICAgICAgIGlmIChhcmd1bWVudC50eXBlICE9IG51bGwpIHtcbiAgICAgICAgICBmbkFyZ3MucHVzaCh0aGlzLl9zZXJpYWxpemVyLnNlcmlhbGl6ZShhcmd1bWVudC52YWx1ZSwgYXJndW1lbnQudHlwZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZuQXJncy5wdXNoKGFyZ3VtZW50LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIHByb21pc2U6IFByb21pc2U8YW55PjtcbiAgICB2YXIgaWQ6IHN0cmluZyA9IG51bGw7XG4gICAgaWYgKHJldHVyblR5cGUgIT0gbnVsbCkge1xuICAgICAgdmFyIGNvbXBsZXRlcjogUHJvbWlzZUNvbXBsZXRlcjxhbnk+ID0gUHJvbWlzZVdyYXBwZXIuY29tcGxldGVyKCk7XG4gICAgICBpZCA9IHRoaXMuX2dlbmVyYXRlTWVzc2FnZUlkKGFyZ3MubWV0aG9kKTtcbiAgICAgIHRoaXMuX3BlbmRpbmcuc2V0KGlkLCBjb21wbGV0ZXIpO1xuICAgICAgUHJvbWlzZVdyYXBwZXIuY2F0Y2hFcnJvcihjb21wbGV0ZXIucHJvbWlzZSwgKGVyciwgc3RhY2s/KSA9PiB7XG4gICAgICAgIHByaW50KGVycik7XG4gICAgICAgIGNvbXBsZXRlci5yZWplY3QoZXJyLCBzdGFjayk7XG4gICAgICB9KTtcblxuICAgICAgcHJvbWlzZSA9IFByb21pc2VXcmFwcGVyLnRoZW4oY29tcGxldGVyLnByb21pc2UsICh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9zZXJpYWxpemVyID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3NlcmlhbGl6ZXIuZGVzZXJpYWxpemUodmFsdWUsIHJldHVyblR5cGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvbWlzZSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gVE9ETyhqdGVwbGl0ejYwMik6IENyZWF0ZSBhIGNsYXNzIGZvciB0aGVzZSBtZXNzYWdlcyBzbyB3ZSBkb24ndCBrZWVwIHVzaW5nIFN0cmluZ01hcCAjMzY4NVxuICAgIHZhciBtZXNzYWdlID0geydtZXRob2QnOiBhcmdzLm1ldGhvZCwgJ2FyZ3MnOiBmbkFyZ3N9O1xuICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICBtZXNzYWdlWydpZCddID0gaWQ7XG4gICAgfVxuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3NpbmssIG1lc3NhZ2UpO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBwcml2YXRlIF9oYW5kbGVNZXNzYWdlKG1lc3NhZ2U6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogdm9pZCB7XG4gICAgdmFyIGRhdGEgPSBuZXcgTWVzc2FnZURhdGEobWVzc2FnZSk7XG4gICAgLy8gVE9ETyhqdGVwbGl0ejYwMik6IHJlcGxhY2UgdGhlc2Ugc3RyaW5ncyB3aXRoIG1lc3NhZ2luZyBjb25zdGFudHMgIzM2ODVcbiAgICBpZiAoU3RyaW5nV3JhcHBlci5lcXVhbHMoZGF0YS50eXBlLCBcInJlc3VsdFwiKSB8fCBTdHJpbmdXcmFwcGVyLmVxdWFscyhkYXRhLnR5cGUsIFwiZXJyb3JcIikpIHtcbiAgICAgIHZhciBpZCA9IGRhdGEuaWQ7XG4gICAgICBpZiAodGhpcy5fcGVuZGluZy5oYXMoaWQpKSB7XG4gICAgICAgIGlmIChTdHJpbmdXcmFwcGVyLmVxdWFscyhkYXRhLnR5cGUsIFwicmVzdWx0XCIpKSB7XG4gICAgICAgICAgdGhpcy5fcGVuZGluZy5nZXQoaWQpLnJlc29sdmUoZGF0YS52YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcGVuZGluZy5nZXQoaWQpLnJlamVjdChkYXRhLnZhbHVlLCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wZW5kaW5nLmRlbGV0ZShpZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIE1lc3NhZ2VEYXRhIHtcbiAgdHlwZTogc3RyaW5nO1xuICB2YWx1ZTogYW55O1xuICBpZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy50eXBlID0gU3RyaW5nTWFwV3JhcHBlci5nZXQoZGF0YSwgXCJ0eXBlXCIpO1xuICAgIHRoaXMuaWQgPSB0aGlzLl9nZXRWYWx1ZUlmUHJlc2VudChkYXRhLCBcImlkXCIpO1xuICAgIHRoaXMudmFsdWUgPSB0aGlzLl9nZXRWYWx1ZUlmUHJlc2VudChkYXRhLCBcInZhbHVlXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIGZyb20gdGhlIFN0cmluZ01hcCBpZiBwcmVzZW50LiBPdGhlcndpc2UgcmV0dXJucyBudWxsXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX2dldFZhbHVlSWZQcmVzZW50KGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBrZXk6IHN0cmluZykge1xuICAgIGlmIChTdHJpbmdNYXBXcmFwcGVyLmNvbnRhaW5zKGRhdGEsIGtleSkpIHtcbiAgICAgIHJldHVybiBTdHJpbmdNYXBXcmFwcGVyLmdldChkYXRhLCBrZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZuQXJnIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlLCBwdWJsaWMgdHlwZTogVHlwZSkge31cbn1cblxuZXhwb3J0IGNsYXNzIFVpQXJndW1lbnRzIHtcbiAgY29uc3RydWN0b3IocHVibGljIG1ldGhvZDogc3RyaW5nLCBwdWJsaWMgYXJncz86IEZuQXJnW10pIHt9XG59XG4iXX0=