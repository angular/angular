'use strict';/**
 * Supported http methods.
 */
(function (RequestMethod) {
    RequestMethod[RequestMethod["Get"] = 0] = "Get";
    RequestMethod[RequestMethod["Post"] = 1] = "Post";
    RequestMethod[RequestMethod["Put"] = 2] = "Put";
    RequestMethod[RequestMethod["Delete"] = 3] = "Delete";
    RequestMethod[RequestMethod["Options"] = 4] = "Options";
    RequestMethod[RequestMethod["Head"] = 5] = "Head";
    RequestMethod[RequestMethod["Patch"] = 6] = "Patch";
})(exports.RequestMethod || (exports.RequestMethod = {}));
var RequestMethod = exports.RequestMethod;
/**
 * All possible states in which a connection can be, based on
 * [States](http://www.w3.org/TR/XMLHttpRequest/#states) from the `XMLHttpRequest` spec, but with an
 * additional "CANCELLED" state.
 */
(function (ReadyState) {
    ReadyState[ReadyState["Unsent"] = 0] = "Unsent";
    ReadyState[ReadyState["Open"] = 1] = "Open";
    ReadyState[ReadyState["HeadersReceived"] = 2] = "HeadersReceived";
    ReadyState[ReadyState["Loading"] = 3] = "Loading";
    ReadyState[ReadyState["Done"] = 4] = "Done";
    ReadyState[ReadyState["Cancelled"] = 5] = "Cancelled";
})(exports.ReadyState || (exports.ReadyState = {}));
var ReadyState = exports.ReadyState;
/**
 * Acceptable response types to be associated with a {@link Response}, based on
 * [ResponseType](https://fetch.spec.whatwg.org/#responsetype) from the Fetch spec.
 */
(function (ResponseType) {
    ResponseType[ResponseType["Basic"] = 0] = "Basic";
    ResponseType[ResponseType["Cors"] = 1] = "Cors";
    ResponseType[ResponseType["Default"] = 2] = "Default";
    ResponseType[ResponseType["Error"] = 3] = "Error";
    ResponseType[ResponseType["Opaque"] = 4] = "Opaque";
})(exports.ResponseType || (exports.ResponseType = {}));
var ResponseType = exports.ResponseType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvaHR0cC9lbnVtcy50cyJdLCJuYW1lcyI6WyJSZXF1ZXN0TWV0aG9kIiwiUmVhZHlTdGF0ZSIsIlJlc3BvbnNlVHlwZSJdLCJtYXBwaW5ncyI6IkFBRUE7O0dBRUc7QUFDSCxXQUFZLGFBQWE7SUFDdkJBLCtDQUFHQSxDQUFBQTtJQUNIQSxpREFBSUEsQ0FBQUE7SUFDSkEsK0NBQUdBLENBQUFBO0lBQ0hBLHFEQUFNQSxDQUFBQTtJQUNOQSx1REFBT0EsQ0FBQUE7SUFDUEEsaURBQUlBLENBQUFBO0lBQ0pBLG1EQUFLQSxDQUFBQTtBQUNQQSxDQUFDQSxFQVJXLHFCQUFhLEtBQWIscUJBQWEsUUFReEI7QUFSRCxJQUFZLGFBQWEsR0FBYixxQkFRWCxDQUFBO0FBRUQ7Ozs7R0FJRztBQUNILFdBQVksVUFBVTtJQUNwQkMsK0NBQU1BLENBQUFBO0lBQ05BLDJDQUFJQSxDQUFBQTtJQUNKQSxpRUFBZUEsQ0FBQUE7SUFDZkEsaURBQU9BLENBQUFBO0lBQ1BBLDJDQUFJQSxDQUFBQTtJQUNKQSxxREFBU0EsQ0FBQUE7QUFDWEEsQ0FBQ0EsRUFQVyxrQkFBVSxLQUFWLGtCQUFVLFFBT3JCO0FBUEQsSUFBWSxVQUFVLEdBQVYsa0JBT1gsQ0FBQTtBQUVEOzs7R0FHRztBQUNILFdBQVksWUFBWTtJQUN0QkMsaURBQUtBLENBQUFBO0lBQ0xBLCtDQUFJQSxDQUFBQTtJQUNKQSxxREFBT0EsQ0FBQUE7SUFDUEEsaURBQUtBLENBQUFBO0lBQ0xBLG1EQUFNQSxDQUFBQTtBQUNSQSxDQUFDQSxFQU5XLG9CQUFZLEtBQVosb0JBQVksUUFNdkI7QUFORCxJQUFZLFlBQVksR0FBWixvQkFNWCxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuXG4vKipcbiAqIFN1cHBvcnRlZCBodHRwIG1ldGhvZHMuXG4gKi9cbmV4cG9ydCBlbnVtIFJlcXVlc3RNZXRob2Qge1xuICBHZXQsXG4gIFBvc3QsXG4gIFB1dCxcbiAgRGVsZXRlLFxuICBPcHRpb25zLFxuICBIZWFkLFxuICBQYXRjaFxufVxuXG4vKipcbiAqIEFsbCBwb3NzaWJsZSBzdGF0ZXMgaW4gd2hpY2ggYSBjb25uZWN0aW9uIGNhbiBiZSwgYmFzZWQgb25cbiAqIFtTdGF0ZXNdKGh0dHA6Ly93d3cudzMub3JnL1RSL1hNTEh0dHBSZXF1ZXN0LyNzdGF0ZXMpIGZyb20gdGhlIGBYTUxIdHRwUmVxdWVzdGAgc3BlYywgYnV0IHdpdGggYW5cbiAqIGFkZGl0aW9uYWwgXCJDQU5DRUxMRURcIiBzdGF0ZS5cbiAqL1xuZXhwb3J0IGVudW0gUmVhZHlTdGF0ZSB7XG4gIFVuc2VudCxcbiAgT3BlbixcbiAgSGVhZGVyc1JlY2VpdmVkLFxuICBMb2FkaW5nLFxuICBEb25lLFxuICBDYW5jZWxsZWRcbn1cblxuLyoqXG4gKiBBY2NlcHRhYmxlIHJlc3BvbnNlIHR5cGVzIHRvIGJlIGFzc29jaWF0ZWQgd2l0aCBhIHtAbGluayBSZXNwb25zZX0sIGJhc2VkIG9uXG4gKiBbUmVzcG9uc2VUeXBlXShodHRwczovL2ZldGNoLnNwZWMud2hhdHdnLm9yZy8jcmVzcG9uc2V0eXBlKSBmcm9tIHRoZSBGZXRjaCBzcGVjLlxuICovXG5leHBvcnQgZW51bSBSZXNwb25zZVR5cGUge1xuICBCYXNpYyxcbiAgQ29ycyxcbiAgRGVmYXVsdCxcbiAgRXJyb3IsXG4gIE9wYXF1ZVxufVxuIl19