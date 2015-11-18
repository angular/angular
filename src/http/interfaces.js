'use strict';/**
 * Abstract class from which real backends are derived.
 *
 * The primary purpose of a `ConnectionBackend` is to create new connections to fulfill a given
 * {@link Request}.
 */
var ConnectionBackend = (function () {
    function ConnectionBackend() {
    }
    return ConnectionBackend;
})();
exports.ConnectionBackend = ConnectionBackend;
/**
 * Abstract class from which real connections are derived.
 */
var Connection = (function () {
    function Connection() {
    }
    return Connection;
})();
exports.Connection = Connection;
//# sourceMappingURL=interfaces.js.map