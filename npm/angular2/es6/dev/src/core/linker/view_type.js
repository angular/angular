export var ViewType;
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
})(ViewType || (ViewType = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld190eXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfdHlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFZLFFBVVg7QUFWRCxXQUFZLFFBQVE7SUFDbEIsd0VBQXdFO0lBQ3hFLDRCQUE0QjtJQUM1Qix1Q0FBSSxDQUFBO0lBQ0osNEJBQTRCO0lBQzVCLG9DQUFvQztJQUNwQyxpREFBUyxDQUFBO0lBQ1QscUVBQXFFO0lBQ3JFLDZCQUE2QjtJQUM3QiwrQ0FBUSxDQUFBO0FBQ1YsQ0FBQyxFQVZXLFFBQVEsS0FBUixRQUFRLFFBVW5CIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gVmlld1R5cGUge1xuICAvLyBBIHZpZXcgdGhhdCBjb250YWlucyB0aGUgaG9zdCBlbGVtZW50IHdpdGggYm91bmQgY29tcG9uZW50IGRpcmVjdGl2ZS5cbiAgLy8gQ29udGFpbnMgYSBDT01QT05FTlQgdmlld1xuICBIT1NULFxuICAvLyBUaGUgdmlldyBvZiB0aGUgY29tcG9uZW50XG4gIC8vIENhbiBjb250YWluIDAgdG8gbiBFTUJFRERFRCB2aWV3c1xuICBDT01QT05FTlQsXG4gIC8vIEEgdmlldyB0aGF0IGlzIGVtYmVkZGVkIGludG8gYW5vdGhlciBWaWV3IHZpYSBhIDx0ZW1wbGF0ZT4gZWxlbWVudFxuICAvLyBpbnNpZGUgb2YgYSBDT01QT05FTlQgdmlld1xuICBFTUJFRERFRFxufVxuIl19