/**
 * Supported http methods.
 */
export var RequestMethods;
(function (RequestMethods) {
    RequestMethods[RequestMethods["Get"] = 0] = "Get";
    RequestMethods[RequestMethods["Post"] = 1] = "Post";
    RequestMethods[RequestMethods["Put"] = 2] = "Put";
    RequestMethods[RequestMethods["Delete"] = 3] = "Delete";
    RequestMethods[RequestMethods["Options"] = 4] = "Options";
    RequestMethods[RequestMethods["Head"] = 5] = "Head";
    RequestMethods[RequestMethods["Patch"] = 6] = "Patch";
})(RequestMethods || (RequestMethods = {}));
/**
 * All possible states in which a connection can be, based on
 * [States](http://www.w3.org/TR/XMLHttpRequest/#states) from the `XMLHttpRequest` spec, but with an
 * additional "CANCELLED" state.
 */
export var ReadyStates;
(function (ReadyStates) {
    ReadyStates[ReadyStates["Unsent"] = 0] = "Unsent";
    ReadyStates[ReadyStates["Open"] = 1] = "Open";
    ReadyStates[ReadyStates["HeadersReceived"] = 2] = "HeadersReceived";
    ReadyStates[ReadyStates["Loading"] = 3] = "Loading";
    ReadyStates[ReadyStates["Done"] = 4] = "Done";
    ReadyStates[ReadyStates["Cancelled"] = 5] = "Cancelled";
})(ReadyStates || (ReadyStates = {}));
/**
 * Acceptable response types to be associated with a {@link Response}, based on
 * [ResponseType](https://fetch.spec.whatwg.org/#responsetype) from the Fetch spec.
 */
export var ResponseTypes;
(function (ResponseTypes) {
    ResponseTypes[ResponseTypes["Basic"] = 0] = "Basic";
    ResponseTypes[ResponseTypes["Cors"] = 1] = "Cors";
    ResponseTypes[ResponseTypes["Default"] = 2] = "Default";
    ResponseTypes[ResponseTypes["Error"] = 3] = "Error";
    ResponseTypes[ResponseTypes["Opaque"] = 4] = "Opaque";
})(ResponseTypes || (ResponseTypes = {}));
//# sourceMappingURL=enums.js.map