'use strict';// TODO: vsavkin rename it into TemplateLoader
/**
 * An interface for retrieving documents by URL that the compiler uses
 * to load templates.
 */
var XHR = (function () {
    function XHR() {
    }
    XHR.prototype.get = function (url) { return null; };
    return XHR;
})();
exports.XHR = XHR;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3hoci50cyJdLCJuYW1lcyI6WyJYSFIiLCJYSFIuY29uc3RydWN0b3IiLCJYSFIuZ2V0Il0sIm1hcHBpbmdzIjoiQUFFQSw4Q0FBOEM7QUFDOUM7OztHQUdHO0FBQ0g7SUFBQUE7SUFFQUMsQ0FBQ0E7SUFEQ0QsaUJBQUdBLEdBQUhBLFVBQUlBLEdBQVdBLElBQXFCRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNwREYsVUFBQ0E7QUFBREEsQ0FBQ0EsQUFGRCxJQUVDO0FBRlksV0FBRyxNQUVmLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1Byb21pc2V9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG4vLyBUT0RPOiB2c2F2a2luIHJlbmFtZSBpdCBpbnRvIFRlbXBsYXRlTG9hZGVyXG4vKipcbiAqIEFuIGludGVyZmFjZSBmb3IgcmV0cmlldmluZyBkb2N1bWVudHMgYnkgVVJMIHRoYXQgdGhlIGNvbXBpbGVyIHVzZXNcbiAqIHRvIGxvYWQgdGVtcGxhdGVzLlxuICovXG5leHBvcnQgY2xhc3MgWEhSIHtcbiAgZ2V0KHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+IHsgcmV0dXJuIG51bGw7IH1cbn1cbiJdfQ==