'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50X21lc3NhZ2VfYnJva2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9jbGllbnRfbWVzc2FnZV9icm9rZXIudHMiXSwibmFtZXMiOlsiQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnkiLCJDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeS5jb25zdHJ1Y3RvciIsIkNsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5XyIsIkNsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5Xy5jb25zdHJ1Y3RvciIsIkNsaWVudE1lc3NhZ2VCcm9rZXJGYWN0b3J5Xy5jcmVhdGVNZXNzYWdlQnJva2VyIiwiQ2xpZW50TWVzc2FnZUJyb2tlciIsIkNsaWVudE1lc3NhZ2VCcm9rZXIuY29uc3RydWN0b3IiLCJDbGllbnRNZXNzYWdlQnJva2VyXyIsIkNsaWVudE1lc3NhZ2VCcm9rZXJfLmNvbnN0cnVjdG9yIiwiQ2xpZW50TWVzc2FnZUJyb2tlcl8uX2dlbmVyYXRlTWVzc2FnZUlkIiwiQ2xpZW50TWVzc2FnZUJyb2tlcl8ucnVuT25TZXJ2aWNlIiwiQ2xpZW50TWVzc2FnZUJyb2tlcl8uX2hhbmRsZU1lc3NhZ2UiLCJNZXNzYWdlRGF0YSIsIk1lc3NhZ2VEYXRhLmNvbnN0cnVjdG9yIiwiTWVzc2FnZURhdGEuX2dldFZhbHVlSWZQcmVzZW50IiwiRm5BcmciLCJGbkFyZy5jb25zdHJ1Y3RvciIsIlVpQXJndW1lbnRzIiwiVWlBcmd1bWVudHMuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSw0QkFBeUIsNkNBQTZDLENBQUMsQ0FBQTtBQUN2RSxxQkFBdUQsMEJBQTBCLENBQUMsQ0FBQTtBQUNsRixzQkFNTywyQkFBMkIsQ0FBQyxDQUFBO0FBQ25DLDJCQUEyQyxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzVFLDJCQUF5Qiw0Q0FBNEMsQ0FBQyxDQUFBO0FBQ3RFLG1CQUF5QixzQkFB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QUdBLENBQUNBO0lBQ2pERCxZQUFDQTtBQUFEQSxDQUFDQSxBQUZELElBRUM7QUFGWSxhQUFLLFFBRWpCLENBQUE7QUFFRDtJQUNFRSxxQkFBbUJBLE1BQWNBLEVBQVNBLElBQWNBO1FBQXJDQyxXQUFNQSxHQUFOQSxNQUFNQSxDQUFRQTtRQUFTQSxTQUFJQSxHQUFKQSxJQUFJQSxDQUFVQTtJQUFHQSxDQUFDQTtJQUM5REQsa0JBQUNBO0FBQURBLENBQUNBLEFBRkQsSUFFQztBQUZZLG1CQUFXLGNBRXZCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01lc3NhZ2VCdXN9IGZyb20gXCJhbmd1bGFyMi9zcmMvd2ViX3dvcmtlcnMvc2hhcmVkL21lc3NhZ2VfYnVzXCI7XG5pbXBvcnQge3ByaW50LCBpc1ByZXNlbnQsIERhdGVXcmFwcGVyLCBzdHJpbmdpZnl9IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmdcIjtcbmltcG9ydCB7XG4gIFByb21pc2UsXG4gIFByb21pc2VDb21wbGV0ZXIsXG4gIFByb21pc2VXcmFwcGVyLFxuICBPYnNlcnZhYmxlV3JhcHBlcixcbiAgRXZlbnRFbWl0dGVyXG59IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jXCI7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXIsIE1hcFdyYXBwZXJ9IGZyb20gXCJhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb25cIjtcbmltcG9ydCB7U2VyaWFsaXplcn0gZnJvbSBcImFuZ3VsYXIyL3NyYy93ZWJfd29ya2Vycy9zaGFyZWQvc2VyaWFsaXplclwiO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvZGlcIjtcbmltcG9ydCB7VHlwZSwgU3RyaW5nV3JhcHBlcn0gZnJvbSBcImFuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZ1wiO1xuZXhwb3J0IHtUeXBlfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nXCI7XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBDbGllbnRNZXNzYWdlQnJva2VyRmFjdG9yeSB7XG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgZ2l2ZW4gY2hhbm5lbCBhbmQgYXR0YWNoZXMgYSBuZXcge0BsaW5rIENsaWVudE1lc3NhZ2VCcm9rZXJ9IHRvIGl0LlxuICAgKi9cbiAgYWJzdHJhY3QgY3JlYXRlTWVzc2FnZUJyb2tlcihjaGFubmVsOiBzdHJpbmcsIHJ1bkluWm9uZT86IGJvb2xlYW4pOiBDbGllbnRNZXNzYWdlQnJva2VyO1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQ2xpZW50TWVzc2FnZUJyb2tlckZhY3RvcnlfIGV4dGVuZHMgQ2xpZW50TWVzc2FnZUJyb2tlckZhY3Rvcnkge1xuICAvKiogQGludGVybmFsICovXG4gIHB1YmxpYyBfc2VyaWFsaXplcjogU2VyaWFsaXplcjtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfbWVzc2FnZUJ1czogTWVzc2FnZUJ1cywgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXIpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuX3NlcmlhbGl6ZXIgPSBfc2VyaWFsaXplcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgZ2l2ZW4gY2hhbm5lbCBhbmQgYXR0YWNoZXMgYSBuZXcge0BsaW5rIENsaWVudE1lc3NhZ2VCcm9rZXJ9IHRvIGl0LlxuICAgKi9cbiAgY3JlYXRlTWVzc2FnZUJyb2tlcihjaGFubmVsOiBzdHJpbmcsIHJ1bkluWm9uZTogYm9vbGVhbiA9IHRydWUpOiBDbGllbnRNZXNzYWdlQnJva2VyIHtcbiAgICB0aGlzLl9tZXNzYWdlQnVzLmluaXRDaGFubmVsKGNoYW5uZWwsIHJ1bkluWm9uZSk7XG4gICAgcmV0dXJuIG5ldyBDbGllbnRNZXNzYWdlQnJva2VyXyh0aGlzLl9tZXNzYWdlQnVzLCB0aGlzLl9zZXJpYWxpemVyLCBjaGFubmVsKTtcbiAgfVxufVxuXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgQ2xpZW50TWVzc2FnZUJyb2tlciB7XG4gIGFic3RyYWN0IHJ1bk9uU2VydmljZShhcmdzOiBVaUFyZ3VtZW50cywgcmV0dXJuVHlwZTogVHlwZSk6IFByb21pc2U8YW55Pjtcbn1cblxuZXhwb3J0IGNsYXNzIENsaWVudE1lc3NhZ2VCcm9rZXJfIGV4dGVuZHMgQ2xpZW50TWVzc2FnZUJyb2tlciB7XG4gIHByaXZhdGUgX3BlbmRpbmc6IE1hcDxzdHJpbmcsIFByb21pc2VDb21wbGV0ZXI8YW55Pj4gPSBuZXcgTWFwPHN0cmluZywgUHJvbWlzZUNvbXBsZXRlcjxhbnk+PigpO1xuICBwcml2YXRlIF9zaW5rOiBFdmVudEVtaXR0ZXI8YW55PjtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBwdWJsaWMgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXI7XG5cbiAgY29uc3RydWN0b3IobWVzc2FnZUJ1czogTWVzc2FnZUJ1cywgX3NlcmlhbGl6ZXI6IFNlcmlhbGl6ZXIsIHB1YmxpYyBjaGFubmVsKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9zaW5rID0gbWVzc2FnZUJ1cy50byhjaGFubmVsKTtcbiAgICB0aGlzLl9zZXJpYWxpemVyID0gX3NlcmlhbGl6ZXI7XG4gICAgdmFyIHNvdXJjZSA9IG1lc3NhZ2VCdXMuZnJvbShjaGFubmVsKTtcbiAgICBPYnNlcnZhYmxlV3JhcHBlci5zdWJzY3JpYmUoc291cmNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAobWVzc2FnZToge1trZXk6IHN0cmluZ106IGFueX0pID0+IHRoaXMuX2hhbmRsZU1lc3NhZ2UobWVzc2FnZSkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2VuZXJhdGVNZXNzYWdlSWQobmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB2YXIgdGltZTogc3RyaW5nID0gc3RyaW5naWZ5KERhdGVXcmFwcGVyLnRvTWlsbGlzKERhdGVXcmFwcGVyLm5vdygpKSk7XG4gICAgdmFyIGl0ZXJhdGlvbjogbnVtYmVyID0gMDtcbiAgICB2YXIgaWQ6IHN0cmluZyA9IG5hbWUgKyB0aW1lICsgc3RyaW5naWZ5KGl0ZXJhdGlvbik7XG4gICAgd2hpbGUgKGlzUHJlc2VudCh0aGlzLl9wZW5kaW5nW2lkXSkpIHtcbiAgICAgIGlkID0gYCR7bmFtZX0ke3RpbWV9JHtpdGVyYXRpb259YDtcbiAgICAgIGl0ZXJhdGlvbisrO1xuICAgIH1cbiAgICByZXR1cm4gaWQ7XG4gIH1cblxuICBydW5PblNlcnZpY2UoYXJnczogVWlBcmd1bWVudHMsIHJldHVyblR5cGU6IFR5cGUpOiBQcm9taXNlPGFueT4ge1xuICAgIHZhciBmbkFyZ3MgPSBbXTtcbiAgICBpZiAoaXNQcmVzZW50KGFyZ3MuYXJncykpIHtcbiAgICAgIGFyZ3MuYXJncy5mb3JFYWNoKGFyZ3VtZW50ID0+IHtcbiAgICAgICAgaWYgKGFyZ3VtZW50LnR5cGUgIT0gbnVsbCkge1xuICAgICAgICAgIGZuQXJncy5wdXNoKHRoaXMuX3NlcmlhbGl6ZXIuc2VyaWFsaXplKGFyZ3VtZW50LnZhbHVlLCBhcmd1bWVudC50eXBlKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm5BcmdzLnB1c2goYXJndW1lbnQudmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB2YXIgcHJvbWlzZTogUHJvbWlzZTxhbnk+O1xuICAgIHZhciBpZDogc3RyaW5nID0gbnVsbDtcbiAgICBpZiAocmV0dXJuVHlwZSAhPSBudWxsKSB7XG4gICAgICB2YXIgY29tcGxldGVyOiBQcm9taXNlQ29tcGxldGVyPGFueT4gPSBQcm9taXNlV3JhcHBlci5jb21wbGV0ZXIoKTtcbiAgICAgIGlkID0gdGhpcy5fZ2VuZXJhdGVNZXNzYWdlSWQoYXJncy5tZXRob2QpO1xuICAgICAgdGhpcy5fcGVuZGluZy5zZXQoaWQsIGNvbXBsZXRlcik7XG4gICAgICBQcm9taXNlV3JhcHBlci5jYXRjaEVycm9yKGNvbXBsZXRlci5wcm9taXNlLCAoZXJyLCBzdGFjaz8pID0+IHtcbiAgICAgICAgcHJpbnQoZXJyKTtcbiAgICAgICAgY29tcGxldGVyLnJlamVjdChlcnIsIHN0YWNrKTtcbiAgICAgIH0pO1xuXG4gICAgICBwcm9taXNlID0gUHJvbWlzZVdyYXBwZXIudGhlbihjb21wbGV0ZXIucHJvbWlzZSwgKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX3NlcmlhbGl6ZXIgPT0gbnVsbCkge1xuICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fc2VyaWFsaXplci5kZXNlcmlhbGl6ZSh2YWx1ZSwgcmV0dXJuVHlwZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9taXNlID0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBUT0RPKGp0ZXBsaXR6NjAyKTogQ3JlYXRlIGEgY2xhc3MgZm9yIHRoZXNlIG1lc3NhZ2VzIHNvIHdlIGRvbid0IGtlZXAgdXNpbmcgU3RyaW5nTWFwICMzNjg1XG4gICAgdmFyIG1lc3NhZ2UgPSB7J21ldGhvZCc6IGFyZ3MubWV0aG9kLCAnYXJncyc6IGZuQXJnc307XG4gICAgaWYgKGlkICE9IG51bGwpIHtcbiAgICAgIG1lc3NhZ2VbJ2lkJ10gPSBpZDtcbiAgICB9XG4gICAgT2JzZXJ2YWJsZVdyYXBwZXIuY2FsbEVtaXQodGhpcy5fc2luaywgbWVzc2FnZSk7XG5cbiAgICByZXR1cm4gcHJvbWlzZTtcbiAgfVxuXG4gIHByaXZhdGUgX2hhbmRsZU1lc3NhZ2UobWVzc2FnZToge1trZXk6IHN0cmluZ106IGFueX0pOiB2b2lkIHtcbiAgICB2YXIgZGF0YSA9IG5ldyBNZXNzYWdlRGF0YShtZXNzYWdlKTtcbiAgICAvLyBUT0RPKGp0ZXBsaXR6NjAyKTogcmVwbGFjZSB0aGVzZSBzdHJpbmdzIHdpdGggbWVzc2FnaW5nIGNvbnN0YW50cyAjMzY4NVxuICAgIGlmIChTdHJpbmdXcmFwcGVyLmVxdWFscyhkYXRhLnR5cGUsIFwicmVzdWx0XCIpIHx8IFN0cmluZ1dyYXBwZXIuZXF1YWxzKGRhdGEudHlwZSwgXCJlcnJvclwiKSkge1xuICAgICAgdmFyIGlkID0gZGF0YS5pZDtcbiAgICAgIGlmICh0aGlzLl9wZW5kaW5nLmhhcyhpZCkpIHtcbiAgICAgICAgaWYgKFN0cmluZ1dyYXBwZXIuZXF1YWxzKGRhdGEudHlwZSwgXCJyZXN1bHRcIikpIHtcbiAgICAgICAgICB0aGlzLl9wZW5kaW5nLmdldChpZCkucmVzb2x2ZShkYXRhLnZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9wZW5kaW5nLmdldChpZCkucmVqZWN0KGRhdGEudmFsdWUsIG51bGwpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3BlbmRpbmcuZGVsZXRlKGlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgTWVzc2FnZURhdGEge1xuICB0eXBlOiBzdHJpbmc7XG4gIHZhbHVlOiBhbnk7XG4gIGlkOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoZGF0YToge1trZXk6IHN0cmluZ106IGFueX0pIHtcbiAgICB0aGlzLnR5cGUgPSBTdHJpbmdNYXBXcmFwcGVyLmdldChkYXRhLCBcInR5cGVcIik7XG4gICAgdGhpcy5pZCA9IHRoaXMuX2dldFZhbHVlSWZQcmVzZW50KGRhdGEsIFwiaWRcIik7XG4gICAgdGhpcy52YWx1ZSA9IHRoaXMuX2dldFZhbHVlSWZQcmVzZW50KGRhdGEsIFwidmFsdWVcIik7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgdmFsdWUgZnJvbSB0aGUgU3RyaW5nTWFwIGlmIHByZXNlbnQuIE90aGVyd2lzZSByZXR1cm5zIG51bGxcbiAgICogQGludGVybmFsXG4gICAqL1xuICBfZ2V0VmFsdWVJZlByZXNlbnQoZGF0YToge1trZXk6IHN0cmluZ106IGFueX0sIGtleTogc3RyaW5nKSB7XG4gICAgaWYgKFN0cmluZ01hcFdyYXBwZXIuY29udGFpbnMoZGF0YSwga2V5KSkge1xuICAgICAgcmV0dXJuIFN0cmluZ01hcFdyYXBwZXIuZ2V0KGRhdGEsIGtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRm5Bcmcge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgdmFsdWUsIHB1YmxpYyB0eXBlOiBUeXBlKSB7fVxufVxuXG5leHBvcnQgY2xhc3MgVWlBcmd1bWVudHMge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbWV0aG9kOiBzdHJpbmcsIHB1YmxpYyBhcmdzPzogRm5BcmdbXSkge31cbn1cbiJdfQ==