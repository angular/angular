'use strict';var async_1 = require('angular2/src/facade/async');
exports.EventEmitter = async_1.EventEmitter;
exports.Observable = async_1.Observable;
/**
 * Message Bus is a low level API used to communicate between the UI and the background.
 * Communication is based on a channel abstraction. Messages published in a
 * given channel to one MessageBusSink are received on the same channel
 * by the corresponding MessageBusSource.
 */
var MessageBus = (function () {
    function MessageBus() {
    }
    return MessageBus;
})();
exports.MessageBus = MessageBus;
//# sourceMappingURL=message_bus.js.map