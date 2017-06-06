'use strict';"use strict";
var lang_1 = require('../facade/lang');
var exceptions_1 = require('../facade/exceptions');
function assertArrayOfStrings(identifier, value) {
    if (!lang_1.assertionsEnabled() || lang_1.isBlank(value)) {
        return;
    }
    if (!lang_1.isArray(value)) {
        throw new exceptions_1.BaseException("Expected '" + identifier + "' to be an array of strings.");
    }
    for (var i = 0; i < value.length; i += 1) {
        if (!lang_1.isString(value[i])) {
            throw new exceptions_1.BaseException("Expected '" + identifier + "' to be an array of strings.");
        }
    }
}
exports.assertArrayOfStrings = assertArrayOfStrings;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXNzZXJ0aW9ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb21waWxlci9hc3NlcnRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxQkFBNEQsZ0JBQWdCLENBQUMsQ0FBQTtBQUM3RSwyQkFBNEIsc0JBQXNCLENBQUMsQ0FBQTtBQUVuRCw4QkFBcUMsVUFBa0IsRUFBRSxLQUFVO0lBQ2pFLEVBQUUsQ0FBQyxDQUFDLENBQUMsd0JBQWlCLEVBQUUsSUFBSSxjQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzNDLE1BQU0sQ0FBQztJQUNULENBQUM7SUFDRCxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDcEIsTUFBTSxJQUFJLDBCQUFhLENBQUMsZUFBYSxVQUFVLGlDQUE4QixDQUFDLENBQUM7SUFDakYsQ0FBQztJQUNELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDekMsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hCLE1BQU0sSUFBSSwwQkFBYSxDQUFDLGVBQWEsVUFBVSxpQ0FBOEIsQ0FBQyxDQUFDO1FBQ2pGLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQVplLDRCQUFvQix1QkFZbkMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNBcnJheSwgaXNTdHJpbmcsIGlzQmxhbmssIGFzc2VydGlvbnNFbmFibGVkfSBmcm9tICcuLi9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJy4uL2ZhY2FkZS9leGNlcHRpb25zJztcblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydEFycmF5T2ZTdHJpbmdzKGlkZW50aWZpZXI6IHN0cmluZywgdmFsdWU6IGFueSkge1xuICBpZiAoIWFzc2VydGlvbnNFbmFibGVkKCkgfHwgaXNCbGFuayh2YWx1ZSkpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKCFpc0FycmF5KHZhbHVlKSkge1xuICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBFeHBlY3RlZCAnJHtpZGVudGlmaWVyfScgdG8gYmUgYW4gYXJyYXkgb2Ygc3RyaW5ncy5gKTtcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgaWYgKCFpc1N0cmluZyh2YWx1ZVtpXSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBFeHBlY3RlZCAnJHtpZGVudGlmaWVyfScgdG8gYmUgYW4gYXJyYXkgb2Ygc3RyaW5ncy5gKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==