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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlld190eXBlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXdfdHlwZS50cyJdLCJuYW1lcyI6WyJWaWV3VHlwZSJdLCJtYXBwaW5ncyI6IkFBQUEsV0FBWSxRQVVYO0FBVkQsV0FBWSxRQUFRO0lBQ2xCQSx3RUFBd0VBO0lBQ3hFQSw0QkFBNEJBO0lBQzVCQSx1Q0FBSUEsQ0FBQUE7SUFDSkEsNEJBQTRCQTtJQUM1QkEsb0NBQW9DQTtJQUNwQ0EsaURBQVNBLENBQUFBO0lBQ1RBLHFFQUFxRUE7SUFDckVBLDZCQUE2QkE7SUFDN0JBLCtDQUFRQSxDQUFBQTtBQUNWQSxDQUFDQSxFQVZXLFFBQVEsS0FBUixRQUFRLFFBVW5CIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGVudW0gVmlld1R5cGUge1xuICAvLyBBIHZpZXcgdGhhdCBjb250YWlucyB0aGUgaG9zdCBlbGVtZW50IHdpdGggYm91bmQgY29tcG9uZW50IGRpcmVjdGl2ZS5cbiAgLy8gQ29udGFpbnMgYSBDT01QT05FTlQgdmlld1xuICBIT1NULFxuICAvLyBUaGUgdmlldyBvZiB0aGUgY29tcG9uZW50XG4gIC8vIENhbiBjb250YWluIDAgdG8gbiBFTUJFRERFRCB2aWV3c1xuICBDT01QT05FTlQsXG4gIC8vIEEgdmlldyB0aGF0IGlzIGVtYmVkZGVkIGludG8gYW5vdGhlciBWaWV3IHZpYSBhIDx0ZW1wbGF0ZT4gZWxlbWVudFxuICAvLyBpbnNpZGUgb2YgYSBDT01QT05FTlQgdmlld1xuICBFTUJFRERFRFxufVxuIl19