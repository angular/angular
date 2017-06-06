'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
/**
 * A message extracted from a template.
 *
 * The identity of a message is comprised of `content` and `meaning`.
 *
 * `description` is additional information provided to the translator.
 */
var Message = (function () {
    function Message(content, meaning, description) {
        if (description === void 0) { description = null; }
        this.content = content;
        this.meaning = meaning;
        this.description = description;
    }
    return Message;
}());
exports.Message = Message;
/**
 * Computes the id of a message
 */
function id(m) {
    var meaning = lang_1.isPresent(m.meaning) ? m.meaning : "";
    var content = lang_1.isPresent(m.content) ? m.content : "";
    return lang_1.escape("$ng|" + meaning + "|" + content);
}
exports.id = id;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVzc2FnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9pMThuL21lc3NhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHFCQUFnQywwQkFBMEIsQ0FBQyxDQUFBO0FBRTNEOzs7Ozs7R0FNRztBQUNIO0lBQ0UsaUJBQW1CLE9BQWUsRUFBUyxPQUFlLEVBQVMsV0FBMEI7UUFBakMsMkJBQWlDLEdBQWpDLGtCQUFpQztRQUExRSxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQVMsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUFTLGdCQUFXLEdBQVgsV0FBVyxDQUFlO0lBQUcsQ0FBQztJQUNuRyxjQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFGWSxlQUFPLFVBRW5CLENBQUE7QUFFRDs7R0FFRztBQUNILFlBQW1CLENBQVU7SUFDM0IsSUFBSSxPQUFPLEdBQUcsZ0JBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDcEQsSUFBSSxPQUFPLEdBQUcsZ0JBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7SUFDcEQsTUFBTSxDQUFDLGFBQU0sQ0FBQyxTQUFPLE9BQU8sU0FBSSxPQUFTLENBQUMsQ0FBQztBQUM3QyxDQUFDO0FBSmUsVUFBRSxLQUlqQixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnQsIGVzY2FwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBBIG1lc3NhZ2UgZXh0cmFjdGVkIGZyb20gYSB0ZW1wbGF0ZS5cbiAqXG4gKiBUaGUgaWRlbnRpdHkgb2YgYSBtZXNzYWdlIGlzIGNvbXByaXNlZCBvZiBgY29udGVudGAgYW5kIGBtZWFuaW5nYC5cbiAqXG4gKiBgZGVzY3JpcHRpb25gIGlzIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24gcHJvdmlkZWQgdG8gdGhlIHRyYW5zbGF0b3IuXG4gKi9cbmV4cG9ydCBjbGFzcyBNZXNzYWdlIHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbnRlbnQ6IHN0cmluZywgcHVibGljIG1lYW5pbmc6IHN0cmluZywgcHVibGljIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSBudWxsKSB7fVxufVxuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBpZCBvZiBhIG1lc3NhZ2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlkKG06IE1lc3NhZ2UpOiBzdHJpbmcge1xuICBsZXQgbWVhbmluZyA9IGlzUHJlc2VudChtLm1lYW5pbmcpID8gbS5tZWFuaW5nIDogXCJcIjtcbiAgbGV0IGNvbnRlbnQgPSBpc1ByZXNlbnQobS5jb250ZW50KSA/IG0uY29udGVudCA6IFwiXCI7XG4gIHJldHVybiBlc2NhcGUoYCRuZ3wke21lYW5pbmd9fCR7Y29udGVudH1gKTtcbn0iXX0=