/**
 * Supported http methods.
 */
export var RequestMethod;
(function (RequestMethod) {
    RequestMethod[RequestMethod["Get"] = 0] = "Get";
    RequestMethod[RequestMethod["Post"] = 1] = "Post";
    RequestMethod[RequestMethod["Put"] = 2] = "Put";
    RequestMethod[RequestMethod["Delete"] = 3] = "Delete";
    RequestMethod[RequestMethod["Options"] = 4] = "Options";
    RequestMethod[RequestMethod["Head"] = 5] = "Head";
    RequestMethod[RequestMethod["Patch"] = 6] = "Patch";
})(RequestMethod || (RequestMethod = {}));
/**
 * All possible states in which a connection can be, based on
 * [States](http://www.w3.org/TR/XMLHttpRequest/#states) from the `XMLHttpRequest` spec, but with an
 * additional "CANCELLED" state.
 */
export var ReadyState;
(function (ReadyState) {
    ReadyState[ReadyState["Unsent"] = 0] = "Unsent";
    ReadyState[ReadyState["Open"] = 1] = "Open";
    ReadyState[ReadyState["HeadersReceived"] = 2] = "HeadersReceived";
    ReadyState[ReadyState["Loading"] = 3] = "Loading";
    ReadyState[ReadyState["Done"] = 4] = "Done";
    ReadyState[ReadyState["Cancelled"] = 5] = "Cancelled";
})(ReadyState || (ReadyState = {}));
/**
 * Acceptable response types to be associated with a {@link Response}, based on
 * [ResponseType](https://fetch.spec.whatwg.org/#responsetype) from the Fetch spec.
 */
export var ResponseType;
(function (ResponseType) {
    ResponseType[ResponseType["Basic"] = 0] = "Basic";
    ResponseType[ResponseType["Cors"] = 1] = "Cors";
    ResponseType[ResponseType["Default"] = 2] = "Default";
    ResponseType[ResponseType["Error"] = 3] = "Error";
    ResponseType[ResponseType["Opaque"] = 4] = "Opaque";
})(ResponseType || (ResponseType = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWd0TTdRaEVuLnRtcC9hbmd1bGFyMi9zcmMvaHR0cC9lbnVtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQTs7R0FFRztBQUNILFdBQVksYUFRWDtBQVJELFdBQVksYUFBYTtJQUN2QiwrQ0FBRyxDQUFBO0lBQ0gsaURBQUksQ0FBQTtJQUNKLCtDQUFHLENBQUE7SUFDSCxxREFBTSxDQUFBO0lBQ04sdURBQU8sQ0FBQTtJQUNQLGlEQUFJLENBQUE7SUFDSixtREFBSyxDQUFBO0FBQ1AsQ0FBQyxFQVJXLGFBQWEsS0FBYixhQUFhLFFBUXhCO0FBRUQ7Ozs7R0FJRztBQUNILFdBQVksVUFPWDtBQVBELFdBQVksVUFBVTtJQUNwQiwrQ0FBTSxDQUFBO0lBQ04sMkNBQUksQ0FBQTtJQUNKLGlFQUFlLENBQUE7SUFDZixpREFBTyxDQUFBO0lBQ1AsMkNBQUksQ0FBQTtJQUNKLHFEQUFTLENBQUE7QUFDWCxDQUFDLEVBUFcsVUFBVSxLQUFWLFVBQVUsUUFPckI7QUFFRDs7O0dBR0c7QUFDSCxXQUFZLFlBTVg7QUFORCxXQUFZLFlBQVk7SUFDdEIsaURBQUssQ0FBQTtJQUNMLCtDQUFJLENBQUE7SUFDSixxREFBTyxDQUFBO0lBQ1AsaURBQUssQ0FBQTtJQUNMLG1EQUFNLENBQUE7QUFDUixDQUFDLEVBTlcsWUFBWSxLQUFaLFlBQVksUUFNdkIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5cbi8qKlxuICogU3VwcG9ydGVkIGh0dHAgbWV0aG9kcy5cbiAqL1xuZXhwb3J0IGVudW0gUmVxdWVzdE1ldGhvZCB7XG4gIEdldCxcbiAgUG9zdCxcbiAgUHV0LFxuICBEZWxldGUsXG4gIE9wdGlvbnMsXG4gIEhlYWQsXG4gIFBhdGNoXG59XG5cbi8qKlxuICogQWxsIHBvc3NpYmxlIHN0YXRlcyBpbiB3aGljaCBhIGNvbm5lY3Rpb24gY2FuIGJlLCBiYXNlZCBvblxuICogW1N0YXRlc10oaHR0cDovL3d3dy53My5vcmcvVFIvWE1MSHR0cFJlcXVlc3QvI3N0YXRlcykgZnJvbSB0aGUgYFhNTEh0dHBSZXF1ZXN0YCBzcGVjLCBidXQgd2l0aCBhblxuICogYWRkaXRpb25hbCBcIkNBTkNFTExFRFwiIHN0YXRlLlxuICovXG5leHBvcnQgZW51bSBSZWFkeVN0YXRlIHtcbiAgVW5zZW50LFxuICBPcGVuLFxuICBIZWFkZXJzUmVjZWl2ZWQsXG4gIExvYWRpbmcsXG4gIERvbmUsXG4gIENhbmNlbGxlZFxufVxuXG4vKipcbiAqIEFjY2VwdGFibGUgcmVzcG9uc2UgdHlwZXMgdG8gYmUgYXNzb2NpYXRlZCB3aXRoIGEge0BsaW5rIFJlc3BvbnNlfSwgYmFzZWQgb25cbiAqIFtSZXNwb25zZVR5cGVdKGh0dHBzOi8vZmV0Y2guc3BlYy53aGF0d2cub3JnLyNyZXNwb25zZXR5cGUpIGZyb20gdGhlIEZldGNoIHNwZWMuXG4gKi9cbmV4cG9ydCBlbnVtIFJlc3BvbnNlVHlwZSB7XG4gIEJhc2ljLFxuICBDb3JzLFxuICBEZWZhdWx0LFxuICBFcnJvcixcbiAgT3BhcXVlXG59XG4iXX0=