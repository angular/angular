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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvaHR0cC9lbnVtcy50cyJdLCJuYW1lcyI6WyJSZXF1ZXN0TWV0aG9kcyIsIlJlYWR5U3RhdGVzIiwiUmVzcG9uc2VUeXBlcyJdLCJtYXBwaW5ncyI6IkFBRUE7O0dBRUc7QUFDSCxXQUFZLGNBUVg7QUFSRCxXQUFZLGNBQWM7SUFDeEJBLGlEQUFHQSxDQUFBQTtJQUNIQSxtREFBSUEsQ0FBQUE7SUFDSkEsaURBQUdBLENBQUFBO0lBQ0hBLHVEQUFNQSxDQUFBQTtJQUNOQSx5REFBT0EsQ0FBQUE7SUFDUEEsbURBQUlBLENBQUFBO0lBQ0pBLHFEQUFLQSxDQUFBQTtBQUNQQSxDQUFDQSxFQVJXLGNBQWMsS0FBZCxjQUFjLFFBUXpCO0FBRUQ7Ozs7R0FJRztBQUNILFdBQVksV0FPWDtBQVBELFdBQVksV0FBVztJQUNyQkMsaURBQU1BLENBQUFBO0lBQ05BLDZDQUFJQSxDQUFBQTtJQUNKQSxtRUFBZUEsQ0FBQUE7SUFDZkEsbURBQU9BLENBQUFBO0lBQ1BBLDZDQUFJQSxDQUFBQTtJQUNKQSx1REFBU0EsQ0FBQUE7QUFDWEEsQ0FBQ0EsRUFQVyxXQUFXLEtBQVgsV0FBVyxRQU90QjtBQUVEOzs7R0FHRztBQUNILFdBQVksYUFNWDtBQU5ELFdBQVksYUFBYTtJQUN2QkMsbURBQUtBLENBQUFBO0lBQ0xBLGlEQUFJQSxDQUFBQTtJQUNKQSx1REFBT0EsQ0FBQUE7SUFDUEEsbURBQUtBLENBQUFBO0lBQ0xBLHFEQUFNQSxDQUFBQTtBQUNSQSxDQUFDQSxFQU5XLGFBQWEsS0FBYixhQUFhLFFBTXhCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG4vKipcbiAqIFN1cHBvcnRlZCBodHRwIG1ldGhvZHMuXG4gKi9cbmV4cG9ydCBlbnVtIFJlcXVlc3RNZXRob2RzIHtcbiAgR2V0LFxuICBQb3N0LFxuICBQdXQsXG4gIERlbGV0ZSxcbiAgT3B0aW9ucyxcbiAgSGVhZCxcbiAgUGF0Y2hcbn1cblxuLyoqXG4gKiBBbGwgcG9zc2libGUgc3RhdGVzIGluIHdoaWNoIGEgY29ubmVjdGlvbiBjYW4gYmUsIGJhc2VkIG9uXG4gKiBbU3RhdGVzXShodHRwOi8vd3d3LnczLm9yZy9UUi9YTUxIdHRwUmVxdWVzdC8jc3RhdGVzKSBmcm9tIHRoZSBgWE1MSHR0cFJlcXVlc3RgIHNwZWMsIGJ1dCB3aXRoIGFuXG4gKiBhZGRpdGlvbmFsIFwiQ0FOQ0VMTEVEXCIgc3RhdGUuXG4gKi9cbmV4cG9ydCBlbnVtIFJlYWR5U3RhdGVzIHtcbiAgVW5zZW50LFxuICBPcGVuLFxuICBIZWFkZXJzUmVjZWl2ZWQsXG4gIExvYWRpbmcsXG4gIERvbmUsXG4gIENhbmNlbGxlZFxufVxuXG4vKipcbiAqIEFjY2VwdGFibGUgcmVzcG9uc2UgdHlwZXMgdG8gYmUgYXNzb2NpYXRlZCB3aXRoIGEge0BsaW5rIFJlc3BvbnNlfSwgYmFzZWQgb25cbiAqIFtSZXNwb25zZVR5cGVdKGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnLyNyZXNwb25zZXR5cGUpIGZyb20gdGhlIEZldGNoIHNwZWMuXG4gKi9cbmV4cG9ydCBlbnVtIFJlc3BvbnNlVHlwZXMge1xuICBCYXNpYyxcbiAgQ29ycyxcbiAgRGVmYXVsdCxcbiAgRXJyb3IsXG4gIE9wYXF1ZVxufVxuIl19