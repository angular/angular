'use strict';"use strict";
(function (ViewType) {
    // A view that contains the host element with bound component directive.
    // Contains a COMPONENT view
    ViewType[ViewType["HOST"] = 0] = "HOST";
    // The view of the component
    // Can contain 0 to n EMBEDDED views
    ViewType[ViewType["COMPONENT"] = 1] = "COMPONENT";
    // A view that is embedded into another View via a <template> element
    // inside of a COMPONENT view
    ViewType[ViewType["EMBEDDED"] = 2] = "EMBEDDED";
})(exports.ViewType || (exports.ViewType = {}));
var ViewType = exports.ViewType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld190eXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfdHlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsV0FBWSxRQUFRO0lBQ2xCLHdFQUF3RTtJQUN4RSw0QkFBNEI7SUFDNUIsdUNBQUksQ0FBQTtJQUNKLDRCQUE0QjtJQUM1QixvQ0FBb0M7SUFDcEMsaURBQVMsQ0FBQTtJQUNULHFFQUFxRTtJQUNyRSw2QkFBNkI7SUFDN0IsK0NBQVEsQ0FBQTtBQUNWLENBQUMsRUFWVyxnQkFBUSxLQUFSLGdCQUFRLFFBVW5CO0FBVkQsSUFBWSxRQUFRLEdBQVIsZ0JBVVgsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBlbnVtIFZpZXdUeXBlIHtcbiAgLy8gQSB2aWV3IHRoYXQgY29udGFpbnMgdGhlIGhvc3QgZWxlbWVudCB3aXRoIGJvdW5kIGNvbXBvbmVudCBkaXJlY3RpdmUuXG4gIC8vIENvbnRhaW5zIGEgQ09NUE9ORU5UIHZpZXdcbiAgSE9TVCxcbiAgLy8gVGhlIHZpZXcgb2YgdGhlIGNvbXBvbmVudFxuICAvLyBDYW4gY29udGFpbiAwIHRvIG4gRU1CRURERUQgdmlld3NcbiAgQ09NUE9ORU5ULFxuICAvLyBBIHZpZXcgdGhhdCBpcyBlbWJlZGRlZCBpbnRvIGFub3RoZXIgVmlldyB2aWEgYSA8dGVtcGxhdGU+IGVsZW1lbnRcbiAgLy8gaW5zaWRlIG9mIGEgQ09NUE9ORU5UIHZpZXdcbiAgRU1CRURERURcbn1cbiJdfQ==