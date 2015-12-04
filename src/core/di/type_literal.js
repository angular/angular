'use strict';/**
 * Type literals is a Dart-only feature. This is here only so we can x-compile
 * to multiple languages.
 */
var TypeLiteral = (function () {
    function TypeLiteral() {
    }
    Object.defineProperty(TypeLiteral.prototype, "type", {
        get: function () { throw new Error("Type literals are only supported in Dart"); },
        enumerable: true,
        configurable: true
    });
    return TypeLiteral;
})();
exports.TypeLiteral = TypeLiteral;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZV9saXRlcmFsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvZGkvdHlwZV9saXRlcmFsLnRzIl0sIm5hbWVzIjpbIlR5cGVMaXRlcmFsIiwiVHlwZUxpdGVyYWwuY29uc3RydWN0b3IiLCJUeXBlTGl0ZXJhbC50eXBlIl0sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFDSDtJQUFBQTtJQUVBQyxDQUFDQTtJQURDRCxzQkFBSUEsNkJBQUlBO2FBQVJBLGNBQWtCRSxNQUFNQSxJQUFJQSxLQUFLQSxDQUFDQSwwQ0FBMENBLENBQUNBLENBQUNBLENBQUNBLENBQUNBOzs7T0FBQUY7SUFDbEZBLGtCQUFDQTtBQUFEQSxDQUFDQSxBQUZELElBRUM7QUFGWSxtQkFBVyxjQUV2QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUeXBlIGxpdGVyYWxzIGlzIGEgRGFydC1vbmx5IGZlYXR1cmUuIFRoaXMgaXMgaGVyZSBvbmx5IHNvIHdlIGNhbiB4LWNvbXBpbGVcbiAqIHRvIG11bHRpcGxlIGxhbmd1YWdlcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFR5cGVMaXRlcmFsIHtcbiAgZ2V0IHR5cGUoKTogYW55IHsgdGhyb3cgbmV3IEVycm9yKFwiVHlwZSBsaXRlcmFscyBhcmUgb25seSBzdXBwb3J0ZWQgaW4gRGFydFwiKTsgfVxufVxuIl19