'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var message_bus_1 = require("angular2/src/web_workers/shared/message_bus");
var lang_1 = require("angular2/src/facade/lang");
var async_1 = require("angular2/src/facade/async");
var collection_1 = require("angular2/src/facade/collection");
var serializer_1 = require("angular2/src/web_workers/shared/serializer");
var di_1 = require("angular2/src/core/di");
var lang_2 = require("angular2/src/facade/lang");
var lang_3 = require("angular2/src/facade/lang");
exports.Type = lang_3.Type;
var ClientMessageBrokerFactory = (function () {
    function ClientMessageBrokerFactory() {
    }
    return ClientMessageBrokerFactory;
})();
exports.ClientMessageBrokerFactory = ClientMessageBrokerFactory;
var ClientMessageBrokerFactory_ = (function (_super) {
    __extends(ClientMessageBrokerFactory_, _super);
    function ClientMessageBrokerFactory_(_messageBus, _serializer) {
        _super.call(this);
        this._messageBus = _messageBus;
        this._serializer = _serializer;
    }
    /**
     * Initializes the given channel and attaches a new {@link ClientMessageBroker} to it.
     */
    ClientMessageBrokerFactory_.prototype.createMessageBroker = function (channel, runInZone) {
        if (runInZone === void 0) { runInZone = true; }
        this._messageBus.initChannel(channel, runInZone);
        return new ClientMessageBroker_(this._messageBus, this._serializer, channel);
    };
    ClientMessageBrokerFactory_ = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [message_bus_1.MessageBus, serializer_1.Serializer])
    ], ClientMessageBrokerFactory_);
    return ClientMessageBrokerFactory_;
})(ClientMessageBrokerFactory);
exports.ClientMessageBrokerFactory_ = ClientMessageBrokerFactory_;
var ClientMessageBroker = (function () {
    function ClientMessageBroker() {
    }
    return ClientMessageBroker;
})();
exports.ClientMessageBroker = ClientMessageBroker;
var ClientMessageBroker_ = (function (_super) {
    __extends(ClientMessageBroker_, _super);
    function ClientMessageBroker_(messageBus, _serializer, channel) {
        var _this = this;
        _super.call(this);
        this.channel = channel;
        this._pending = new Map();
        this._sink = messageBus.to(channel);
        this._serializer = _serializer;
        var source = messageBus.from(channel);
        async_1.ObservableWrapper.subscribe(source, function (message) { return _this._handleMessage(message); });
    }
    ClientMessageBroker_.prototype._generateMessageId = function (name) {
        var time = lang_1.stringify(lang_1.DateWrapper.toMillis(lang_1.DateWrapper.now()));
        var iteration = 0;
        var id = name + time + lang_1.stringify(iteration);
        while (lang_1.isPresent(this._pending[id])) {
            id = "" + name + time + iteration;
            iteration++;
        }
        return id;
    };
    ClientMessageBroker_.prototype.runOnService = function (args, returnType) {
        var _this = this;
        var fnArgs = [];
        if (lang_1.isPresent(args.args)) {
            args.args.forEach(function (argument) {
                if (argument.type != null) {
                    fnArgs.push(_this._serializer.serialize(argument.value, argument.type));
                }
                else {
                    fnArgs.push(argument.value);
                }
            });
        }
        var promise;
        var id = null;
        if (returnType != null) {
            var completer = async_1.PromiseWrapper.completer();
            id = this._generateMessageId(args.method);
            this._pending.set(id, completer);
            async_1.PromiseWrapper.catchError(completer.promise, function (err, stack) {
                lang_1.print(err);
                completer.reject(err, stack);
            });
            promise = async_1.PromiseWrapper.then(completer.promise, function (value) {
                if (_this._serializer == null) {
                    return value;
                }
                else {
                    return _this._serializer.deserialize(value, returnType);
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
        async_1.ObservableWrapper.callEmit(this._sink, message);
        return promise;
    };
    ClientMessageBroker_.prototype._handleMessage = function (message) {
        var data = new MessageData(message);
        // TODO(jteplitz602): replace these strings with messaging constants #3685
        if (lang_2.StringWrapper.equals(data.type, "result") || lang_2.StringWrapper.equals(data.type, "error")) {
            var id = data.id;
            if (this._pending.has(id)) {
                if (lang_2.StringWrapper.equals(data.type, "result")) {
                    this._pending.get(id).resolve(data.value);
                }
                else {
                    this._pending.get(id).reject(data.value, null);
                }
                this._pending.delete(id);
            }
        }
    };
    return ClientMessageBroker_;
})(ClientMessageBroker);
exports.ClientMessageBroker_ = ClientMessageBroker_;
var MessageData = (function () {
    function MessageData(data) {
        this.type = collection_1.StringMapWrapper.get(data, "type");
        this.id = this._getValueIfPresent(data, "id");
        this.value = this._getValueIfPresent(data, "value");
    }
    /**
     * Returns the value from the StringMap if present. Otherwise returns null
     * @internal
     */
    MessageData.prototype._getValueIfPresent = function (data, key) {
        if (collection_1.StringMapWrapper.contains(data, key)) {
            return collection_1.StringMapWrapper.get(data, key);
        }
        else {
            return null;
        }
    };
    return MessageData;
})();
var FnArg = (function () {
    function FnArg(value, type) {
        this.value = value;
        this.type = type;
    }
    return FnArg;
})();
exports.FnArg = FnArg;
var UiArguments = (function () {
    function UiArguments(method, args) {
        this.method = method;
        this.args = args;
    }
    return UiArguments;
})();
exports.UiArguments = UiArguments;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50X21lc3NhZ2VfYnJva2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9jbGllbnRfbWVzc2FnZV9icm9rZXIudHMiXSwibmFtZXMiOlsiQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnkiLCJDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeS5jb25zdHJ1Y3RvciIsIkNsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5XyIsIkNsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5Xy5jb25zdHJ1Y3RvciIsIkNsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5Xy5jcmVhdGVNZXNzYWdlQnJva2VyIiwiQ2xpZW50TWVzc2FnZUJyb2tlciIsIkNsaWVudE1lc3NhZ2VCcm9rZXIuY29uc3RydWN0b3IiLCJDbGllbnRNZXNzYWdlQnJva2VyXyIsIkNsaWVudE1lc3NhZ2VCcm9rZXJfLmNvbnN0cnVjdG9yIiwiQ2xpZW50TWVzc2FnZUJyb2tlcl8uX2dlbmVyYXRlTWVzc2FnZUlkIiwiQ2xpZW50TWVzc2FnZUJyb2tlcl8ucnVuT25TZXJ2aWNlIiwiQ2xpZW50TWVzc2FnZUJyb2tlcl8uX2hhbmRsZU1lc3NhZ2UiLCJNZXNzYWdlRGF0YSIsIk1lc3NhZ2VEYXRhLmNvbnN0cnVjdG9yIiwiTWVzc2FnZURhdGEuX2dldFZhbHVlSWZQcmVzZW50IiwiRm5BcmciLCJGbkFyZy5jb25zdHJ1Y3RvciIsIlVpQXJndW1lbnRzIiwiVWlBcmd1bWVudHMuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNEJBQXlCLDZDQUE2QyxDQUFDLENBQUE7QUFDdkUscUJBQXVELDBCQUEwQixDQUFDLENBQUE7QUFDbEYsc0JBTU8sMkJBQTJCLENBQUMsQ0FBQTtBQUNuQywyQkFBMkMsZ0NBQWdDLENBQUMsQ0FBQTtBQUM1RSwyQkFBeUIsNENBQTRDLENBQUMsQ0FBQTtBQUN0RSxtQkFBeUIsc0JBQXNC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QSxDQUFDQTtJQUNqREQsWUFBQ0E7QUFBREEsQ0FBQ0EsQUFGRCxJQUVDO0FBRlksYUFBSyxRQUVqQixDQUFBO0FBRUQ7SUFDRUUscUJBQW1CQSxNQUFjQSxFQUFTQSxJQUFjQTtRQUFyQ0MsV0FBTUEsR0FBTkEsTUFBTUEsQ0FBUUE7UUFBU0EsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBVUE7SUFBR0EsQ0FBQ0E7SUFDOURELGtCQUFDQTtBQUFEQSxDQUFDQSxBQUZELElBRUM7QUFGWSxtQkFBVyxjQUV2QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNZXNzYWdlQnVzfSBmcm9tIFwiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9tZXNzYWdlX2J1c1wiO1xuaW1wb3J0IHtwcmludCwgaXNQcmVzZW50LCBEYXRlV3JhcHBlciwgc3RyaW5naWZ5fSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nXCI7XG5pbXBvcnQge1xuICBQcm9taXNlLFxuICBQcm9taXNlQ29tcGxldGVyLFxuICBQcm9taXNlV3JhcHBlcixcbiAgT2JzZXJ2YWJsZVdyYXBwZXIsXG4gIEV2ZW50RW1pdHRlclxufSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luY1wiO1xuaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyLCBNYXBXcmFwcGVyfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uXCI7XG5pbXBvcnQge1NlcmlhbGl6ZXJ9IGZyb20gXCJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL3NlcmlhbGl6ZXJcIjtcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSBcImFuZ3VsYXIyL3NyYy9jb3JlL2RpXCI7XG5pbXBvcnQge1R5cGUsIFN0cmluZ1dyYXBwZXJ9IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmdcIjtcbmV4cG9ydCB7VHlwZX0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2xpZW50TWVzc2FnZUJyb2tlckZhY3Rvcnkge1xuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGdpdmVuIGNoYW5uZWwgYW5kIGF0dGFjaGVzIGEgbmV3IHtAbGluayBDbGllbnRNZXNzYWdlQnJva2VyfSB0byBpdC5cbiAgICovXG4gIGFic3RyYWN0IGNyZWF0ZU1lc3NhZ2VCcm9rZXIoY2hhbm5lbDogc3RyaW5nLCBydW5JblpvbmU/OiBib29sZWFuKTogQ2xpZW50TWVzc2FnZUJyb2tlcjtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5XyBleHRlbmRzIENsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5IHtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXI7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX21lc3NhZ2VCdXM6IE1lc3NhZ2VCdXMsIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9zZXJpYWxpemVyID0gX3NlcmlhbGl6ZXI7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGdpdmVuIGNoYW5uZWwgYW5kIGF0dGFjaGVzIGEgbmV3IHtAbGluayBDbGllbnRNZXNzYWdlQnJva2VyfSB0byBpdC5cbiAgICovXG4gIGNyZWF0ZU1lc3NhZ2VCcm9rZXIoY2hhbm5lbDogc3RyaW5nLCBydW5JblpvbmU6IGJvb2xlYW4gPSB0cnVlKTogQ2xpZW50TWVzc2FnZUJyb2tlciB7XG4gICAgdGhpcy5fbWVzc2FnZUJ1cy5pbml0Q2hhbm5lbChjaGFubmVsLCBydW5JblpvbmUpO1xuICAgIHJldHVybiBuZXcgQ2xpZW50TWVzc2FnZUJyb2tlcl8odGhpcy5fbWVzc2FnZUJ1cywgdGhpcy5fc2VyaWFsaXplciwgY2hhbm5lbCk7XG4gIH1cbn1cblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENsaWVudE1lc3NhZ2VCcm9rZXIge1xuICBhYnN0cmFjdCBydW5PblNlcnZpY2UoYXJnczogVWlBcmd1bWVudHMsIHJldHVyblR5cGU6IFR5cGUpOiBQcm9taXNlPGFueT47XG59XG5cbmV4cG9ydCBjbGFzcyBDbGllbnRNZXNzYWdlQnJva2VyXyBleHRlbmRzIENsaWVudE1lc3NhZ2VCcm9rZXIge1xuICBwcml2YXRlIF9wZW5kaW5nOiBNYXA8c3RyaW5nLCBQcm9taXNlQ29tcGxldGVyPGFueT4+ID0gbmV3IE1hcDxzdHJpbmcsIFByb21pc2VDb21wbGV0ZXI8YW55Pj4oKTtcbiAgcHJpdmF0ZSBfc2luazogRXZlbnRFbWl0dGVyPGFueT47XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgcHVibGljIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyO1xuXG4gIGNvbnN0cnVjdG9yKG1lc3NhZ2VCdXM6IE1lc3NhZ2VCdXMsIF9zZXJpYWxpemVyOiBTZXJpYWxpemVyLCBwdWJsaWMgY2hhbm5lbCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5fc2luayA9IG1lc3NhZ2VCdXMudG8oY2hhbm5lbCk7XG4gICAgdGhpcy5fc2VyaWFsaXplciA9IF9zZXJpYWxpemVyO1xuICAgIHZhciBzb3VyY2UgPSBtZXNzYWdlQnVzLmZyb20oY2hhbm5lbCk7XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuc3Vic2NyaWJlKHNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKG1lc3NhZ2U6IHtba2V5OiBzdHJpbmddOiBhbnl9KSA9PiB0aGlzLl9oYW5kbGVNZXNzYWdlKG1lc3NhZ2UpKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dlbmVyYXRlTWVzc2FnZUlkKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgdmFyIHRpbWU6IHN0cmluZyA9IHN0cmluZ2lmeShEYXRlV3JhcHBlci50b01pbGxpcyhEYXRlV3JhcHBlci5ub3coKSkpO1xuICAgIHZhciBpdGVyYXRpb246IG51bWJlciA9IDA7XG4gICAgdmFyIGlkOiBzdHJpbmcgPSBuYW1lICsgdGltZSArIHN0cmluZ2lmeShpdGVyYXRpb24pO1xuICAgIHdoaWxlIChpc1ByZXNlbnQodGhpcy5fcGVuZGluZ1tpZF0pKSB7XG4gICAgICBpZCA9IGAke25hbWV9JHt0aW1lfSR7aXRlcmF0aW9ufWA7XG4gICAgICBpdGVyYXRpb24rKztcbiAgICB9XG4gICAgcmV0dXJuIGlkO1xuICB9XG5cbiAgcnVuT25TZXJ2aWNlKGFyZ3M6IFVpQXJndW1lbnRzLCByZXR1cm5UeXBlOiBUeXBlKTogUHJvbWlzZTxhbnk+IHtcbiAgICB2YXIgZm5BcmdzID0gW107XG4gICAgaWYgKGlzUHJlc2VudChhcmdzLmFyZ3MpKSB7XG4gICAgICBhcmdzLmFyZ3MuZm9yRWFjaChhcmd1bWVudCA9PiB7XG4gICAgICAgIGlmIChhcmd1bWVudC50eXBlICE9IG51bGwpIHtcbiAgICAgICAgICBmbkFyZ3MucHVzaCh0aGlzLl9zZXJpYWxpemVyLnNlcmlhbGl6ZShhcmd1bWVudC52YWx1ZSwgYXJndW1lbnQudHlwZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZuQXJncy5wdXNoKGFyZ3VtZW50LnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdmFyIHByb21pc2U6IFByb21pc2U8YW55PjtcbiAgICB2YXIgaWQ6IHN0cmluZyA9IG51bGw7XG4gICAgaWYgKHJldHVyblR5cGUgIT0gbnVsbCkge1xuICAgICAgdmFyIGNvbXBsZXRlcjogUHJvbWlzZUNvbXBsZXRlcjxhbnk+ID0gUHJvbWlzZVdyYXBwZXIuY29tcGxldGVyKCk7XG4gICAgICBpZCA9IHRoaXMuX2dlbmVyYXRlTWVzc2FnZUlkKGFyZ3MubWV0aG9kKTtcbiAgICAgIHRoaXMuX3BlbmRpbmcuc2V0KGlkLCBjb21wbGV0ZXIpO1xuICAgICAgUHJvbWlzZVdyYXBwZXIuY2F0Y2hFcnJvcihjb21wbGV0ZXIucHJvbWlzZSwgKGVyciwgc3RhY2s/KSA9PiB7XG4gICAgICAgIHByaW50KGVycik7XG4gICAgICAgIGNvbXBsZXRlci5yZWplY3QoZXJyLCBzdGFjayk7XG4gICAgICB9KTtcblxuICAgICAgcHJvbWlzZSA9IFByb21pc2VXcmFwcGVyLnRoZW4oY29tcGxldGVyLnByb21pc2UsICh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9zZXJpYWxpemVyID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3NlcmlhbGl6ZXIuZGVzZXJpYWxpemUodmFsdWUsIHJldHVyblR5cGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvbWlzZSA9IG51bGw7XG4gICAgfVxuXG4gICAgLy8gVE9ETyhqdGVwbGl0ejYwMik6IENyZWF0ZSBhIGNsYXNzIGZvciB0aGVzZSBtZXNzYWdlcyBzbyB3ZSBkb24ndCBrZWVwIHVzaW5nIFN0cmluZ01hcCAjMzY4NVxuICAgIHZhciBtZXNzYWdlID0geydtZXRob2QnOiBhcmdzLm1ldGhvZCwgJ2FyZ3MnOiBmbkFyZ3N9O1xuICAgIGlmIChpZCAhPSBudWxsKSB7XG4gICAgICBtZXNzYWdlWydpZCddID0gaWQ7XG4gICAgfVxuICAgIE9ic2VydmFibGVXcmFwcGVyLmNhbGxFbWl0KHRoaXMuX3NpbmssIG1lc3NhZ2UpO1xuXG4gICAgcmV0dXJuIHByb21pc2U7XG4gIH1cblxuICBwcml2YXRlIF9oYW5kbGVNZXNzYWdlKG1lc3NhZ2U6IHtba2V5OiBzdHJpbmddOiBhbnl9KTogdm9pZCB7XG4gICAgdmFyIGRhdGEgPSBuZXcgTWVzc2FnZURhdGEobWVzc2FnZSk7XG4gICAgLy8gVE9ETyhqdGVwbGl0ejYwMik6IHJlcGxhY2UgdGhlc2Ugc3RyaW5ncyB3aXRoIG1lc3NhZ2luZyBjb25zdGFudHMgIzM2ODVcbiAgICBpZiAoU3RyaW5nV3JhcHBlci5lcXVhbHMoZGF0YS50eXBlLCBcInJlc3VsdFwiKSB8fCBTdHJpbmdXcmFwcGVyLmVxdWFscyhkYXRhLnR5cGUsIFwiZXJyb3JcIikpIHtcbiAgICAgIHZhciBpZCA9IGRhdGEuaWQ7XG4gICAgICBpZiAodGhpcy5fcGVuZGluZy5oYXMoaWQpKSB7XG4gICAgICAgIGlmIChTdHJpbmdXcmFwcGVyLmVxdWFscyhkYXRhLnR5cGUsIFwicmVzdWx0XCIpKSB7XG4gICAgICAgICAgdGhpcy5fcGVuZGluZy5nZXQoaWQpLnJlc29sdmUoZGF0YS52YWx1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fcGVuZGluZy5nZXQoaWQpLnJlamVjdChkYXRhLnZhbHVlLCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9wZW5kaW5nLmRlbGV0ZShpZCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIE1lc3NhZ2VEYXRhIHtcbiAgdHlwZTogc3RyaW5nO1xuICB2YWx1ZTogYW55O1xuICBpZDogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gICAgdGhpcy50eXBlID0gU3RyaW5nTWFwV3JhcHBlci5nZXQoZGF0YSwgXCJ0eXBlXCIpO1xuICAgIHRoaXMuaWQgPSB0aGlzLl9nZXRWYWx1ZUlmUHJlc2VudChkYXRhLCBcImlkXCIpO1xuICAgIHRoaXMudmFsdWUgPSB0aGlzLl9nZXRWYWx1ZUlmUHJlc2VudChkYXRhLCBcInZhbHVlXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHZhbHVlIGZyb20gdGhlIFN0cmluZ01hcCBpZiBwcmVzZW50LiBPdGhlcndpc2UgcmV0dXJucyBudWxsXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX2dldFZhbHVlSWZQcmVzZW50KGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9LCBrZXk6IHN0cmluZykge1xuICAgIGlmIChTdHJpbmdNYXBXcmFwcGVyLmNvbnRhaW5zKGRhdGEsIGtleSkpIHtcbiAgICAgIHJldHVybiBTdHJpbmdNYXBXcmFwcGVyLmdldChkYXRhLCBrZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZuQXJnIHtcbiAgY29uc3RydWN0b3IocHVibGljIHZhbHVlLCBwdWJsaWMgdHlwZTogVHlwZSkge31cbn1cblxuZXhwb3J0IGNsYXNzIFVpQXJndW1lbnRzIHtcbiAgY29uc3RydWN0b3IocHVibGljIG1ldGhvZDogc3RyaW5nLCBwdWJsaWMgYXJncz86IEZuQXJnW10pIHt9XG59XG4iXX0=