'use strict';(function (RecordType) {
    RecordType[RecordType["Self"] = 0] = "Self";
    RecordType[RecordType["Const"] = 1] = "Const";
    RecordType[RecordType["PrimitiveOp"] = 2] = "PrimitiveOp";
    RecordType[RecordType["PropertyRead"] = 3] = "PropertyRead";
    RecordType[RecordType["PropertyWrite"] = 4] = "PropertyWrite";
    RecordType[RecordType["Local"] = 5] = "Local";
    RecordType[RecordType["InvokeMethod"] = 6] = "InvokeMethod";
    RecordType[RecordType["InvokeClosure"] = 7] = "InvokeClosure";
    RecordType[RecordType["KeyedRead"] = 8] = "KeyedRead";
    RecordType[RecordType["KeyedWrite"] = 9] = "KeyedWrite";
    RecordType[RecordType["Pipe"] = 10] = "Pipe";
    RecordType[RecordType["Interpolate"] = 11] = "Interpolate";
    RecordType[RecordType["SafeProperty"] = 12] = "SafeProperty";
    RecordType[RecordType["CollectionLiteral"] = 13] = "CollectionLiteral";
    RecordType[RecordType["SafeMethodInvoke"] = 14] = "SafeMethodInvoke";
    RecordType[RecordType["DirectiveLifecycle"] = 15] = "DirectiveLifecycle";
    RecordType[RecordType["Chain"] = 16] = "Chain";
    RecordType[RecordType["SkipRecordsIf"] = 17] = "SkipRecordsIf";
    RecordType[RecordType["SkipRecordsIfNot"] = 18] = "SkipRecordsIfNot";
    RecordType[RecordType["SkipRecords"] = 19] = "SkipRecords"; // Skip records unconditionally
})(exports.RecordType || (exports.RecordType = {}));
var RecordType = exports.RecordType;
var ProtoRecord = (function () {
    function ProtoRecord(mode, name, funcOrValue, args, fixedArgs, contextIndex, directiveIndex, selfIndex, bindingRecord, lastInBinding, lastInDirective, argumentToPureFunction, referencedBySelf, propertyBindingIndex) {
        this.mode = mode;
        this.name = name;
        this.funcOrValue = funcOrValue;
        this.args = args;
        this.fixedArgs = fixedArgs;
        this.contextIndex = contextIndex;
        this.directiveIndex = directiveIndex;
        this.selfIndex = selfIndex;
        this.bindingRecord = bindingRecord;
        this.lastInBinding = lastInBinding;
        this.lastInDirective = lastInDirective;
        this.argumentToPureFunction = argumentToPureFunction;
        this.referencedBySelf = referencedBySelf;
        this.propertyBindingIndex = propertyBindingIndex;
    }
    ProtoRecord.prototype.isPureFunction = function () {
        return this.mode === RecordType.Interpolate || this.mode === RecordType.CollectionLiteral;
    };
    ProtoRecord.prototype.isUsedByOtherRecord = function () { return !this.lastInBinding || this.referencedBySelf; };
    ProtoRecord.prototype.shouldBeChecked = function () {
        return this.argumentToPureFunction || this.lastInBinding || this.isPureFunction() ||
            this.isPipeRecord();
    };
    ProtoRecord.prototype.isPipeRecord = function () { return this.mode === RecordType.Pipe; };
    ProtoRecord.prototype.isConditionalSkipRecord = function () {
        return this.mode === RecordType.SkipRecordsIfNot || this.mode === RecordType.SkipRecordsIf;
    };
    ProtoRecord.prototype.isUnconditionalSkipRecord = function () { return this.mode === RecordType.SkipRecords; };
    ProtoRecord.prototype.isSkipRecord = function () {
        return this.isConditionalSkipRecord() || this.isUnconditionalSkipRecord();
    };
    ProtoRecord.prototype.isLifeCycleRecord = function () { return this.mode === RecordType.DirectiveLifecycle; };
    return ProtoRecord;
})();
exports.ProtoRecord = ProtoRecord;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9fcmVjb3JkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9wcm90b19yZWNvcmQudHMiXSwibmFtZXMiOlsiUmVjb3JkVHlwZSIsIlByb3RvUmVjb3JkIiwiUHJvdG9SZWNvcmQuY29uc3RydWN0b3IiLCJQcm90b1JlY29yZC5pc1B1cmVGdW5jdGlvbiIsIlByb3RvUmVjb3JkLmlzVXNlZEJ5T3RoZXJSZWNvcmQiLCJQcm90b1JlY29yZC5zaG91bGRCZUNoZWNrZWQiLCJQcm90b1JlY29yZC5pc1BpcGVSZWNvcmQiLCJQcm90b1JlY29yZC5pc0NvbmRpdGlvbmFsU2tpcFJlY29yZCIsIlByb3RvUmVjb3JkLmlzVW5jb25kaXRpb25hbFNraXBSZWNvcmQiLCJQcm90b1JlY29yZC5pc1NraXBSZWNvcmQiLCJQcm90b1JlY29yZC5pc0xpZmVDeWNsZVJlY29yZCJdLCJtYXBwaW5ncyI6IkFBR0EsV0FBWSxVQUFVO0lBQ3BCQSwyQ0FBSUEsQ0FBQUE7SUFDSkEsNkNBQUtBLENBQUFBO0lBQ0xBLHlEQUFXQSxDQUFBQTtJQUNYQSwyREFBWUEsQ0FBQUE7SUFDWkEsNkRBQWFBLENBQUFBO0lBQ2JBLDZDQUFLQSxDQUFBQTtJQUNMQSwyREFBWUEsQ0FBQUE7SUFDWkEsNkRBQWFBLENBQUFBO0lBQ2JBLHFEQUFTQSxDQUFBQTtJQUNUQSx1REFBVUEsQ0FBQUE7SUFDVkEsNENBQUlBLENBQUFBO0lBQ0pBLDBEQUFXQSxDQUFBQTtJQUNYQSw0REFBWUEsQ0FBQUE7SUFDWkEsc0VBQWlCQSxDQUFBQTtJQUNqQkEsb0VBQWdCQSxDQUFBQTtJQUNoQkEsd0VBQWtCQSxDQUFBQTtJQUNsQkEsOENBQUtBLENBQUFBO0lBQ0xBLDhEQUFhQSxDQUFBQTtJQUNiQSxvRUFBZ0JBLENBQUFBO0lBQ2hCQSwwREFBV0EsQ0FBQUEsQ0FBUUEsK0JBQStCQTtBQUNwREEsQ0FBQ0EsRUFyQlcsa0JBQVUsS0FBVixr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Jy4vYmluZGluZ19yZWNvcmQnO1xuaW1wb3J0IHtEaXJlY3RpdmVJbmRleH0gZnJvbSAnLi9kaXJlY3RpdmVfcmVjb3JkJztcblxuZXhwb3J0IGVudW0gUmVjb3JkVHlwZSB7XG4gIFNlbGYsXG4gIENvbnN0LFxuICBQcmltaXRpdmVPcCxcbiAgUHJvcGVydHlSZWFkLFxuICBQcm9wZXJ0eVdyaXRlLFxuICBMb2NhbCxcbiAgSW52b2tlTWV0aG9kLFxuICBJbnZva2VDbG9zdXJlLFxuICBLZXllZFJlYWQsXG4gIEtleWVkV3JpdGUsXG4gIFBpcGUsXG4gIEludGVycG9sYXRlLFxuICBTYWZlUHJvcGVydHksXG4gIENvbGxlY3Rpb25MaXRlcmFsLFxuICBTYWZlTWV0aG9kSW52b2tlLFxuICBEaXJlY3RpdmVMaWZlY3ljbGUsXG4gIENoYWluLFxuICBTa2lwUmVjb3Jkc0lmLCAgICAgLy8gU2tpcCByZWNvcmRzIHdoZW4gdGhlIGNvbmRpdGlvbiBpcyB0cnVlXG4gIFNraXBSZWNvcmRzSWZOb3QsICAvLyBTa2lwIHJlY29yZHMgd2hlbiB0aGUgY29uZGl0aW9uIGlzIGZhbHNlXG4gIFNraXBSZWNvcmRzICAgICAgICAvLyBTa2lwIHJlY29yZHMgdW5jb25kaXRpb25hbGx5XG59XG5cbmV4cG9ydCBjbGFzcyBQcm90b1JlY29yZCB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBtb2RlOiBSZWNvcmRUeXBlLCBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgZnVuY09yVmFsdWUsIHB1YmxpYyBhcmdzOiBhbnlbXSxcbiAgICAgICAgICAgICAgcHVibGljIGZpeGVkQXJnczogYW55W10sIHB1YmxpYyBjb250ZXh0SW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgcHVibGljIGRpcmVjdGl2ZUluZGV4OiBEaXJlY3RpdmVJbmRleCwgcHVibGljIHNlbGZJbmRleDogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgYmluZGluZ1JlY29yZDogQmluZGluZ1JlY29yZCwgcHVibGljIGxhc3RJbkJpbmRpbmc6IGJvb2xlYW4sXG4gICAgICAgICAgICAgIHB1YmxpYyBsYXN0SW5EaXJlY3RpdmU6IGJvb2xlYW4sIHB1YmxpYyBhcmd1bWVudFRvUHVyZUZ1bmN0aW9uOiBib29sZWFuLFxuICAgICAgICAgICAgICBwdWJsaWMgcmVmZXJlbmNlZEJ5U2VsZjogYm9vbGVhbiwgcHVibGljIHByb3BlcnR5QmluZGluZ0luZGV4OiBudW1iZXIpIHt9XG5cbiAgaXNQdXJlRnVuY3Rpb24oKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubW9kZSA9PT0gUmVjb3JkVHlwZS5JbnRlcnBvbGF0ZSB8fCB0aGlzLm1vZGUgPT09IFJlY29yZFR5cGUuQ29sbGVjdGlvbkxpdGVyYWw7XG4gIH1cblxuICBpc1VzZWRCeU90aGVyUmVjb3JkKCk6IGJvb2xlYW4geyByZXR1cm4gIXRoaXMubGFzdEluQmluZGluZyB8fCB0aGlzLnJlZmVyZW5jZWRCeVNlbGY7IH1cblxuICBzaG91bGRCZUNoZWNrZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuYXJndW1lbnRUb1B1cmVGdW5jdGlvbiB8fCB0aGlzLmxhc3RJbkJpbmRpbmcgfHwgdGhpcy5pc1B1cmVGdW5jdGlvbigpIHx8XG4gICAgICAgICAgIHRoaXMuaXNQaXBlUmVjb3JkKCk7XG4gIH1cblxuICBpc1BpcGVSZWNvcmQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLm1vZGUgPT09IFJlY29yZFR5cGUuUGlwZTsgfVxuXG4gIGlzQ29uZGl0aW9uYWxTa2lwUmVjb3JkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm1vZGUgPT09IFJlY29yZFR5cGUuU2tpcFJlY29yZHNJZk5vdCB8fCB0aGlzLm1vZGUgPT09IFJlY29yZFR5cGUuU2tpcFJlY29yZHNJZjtcbiAgfVxuXG4gIGlzVW5jb25kaXRpb25hbFNraXBSZWNvcmQoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLm1vZGUgPT09IFJlY29yZFR5cGUuU2tpcFJlY29yZHM7IH1cblxuICBpc1NraXBSZWNvcmQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuaXNDb25kaXRpb25hbFNraXBSZWNvcmQoKSB8fCB0aGlzLmlzVW5jb25kaXRpb25hbFNraXBSZWNvcmQoKTtcbiAgfVxuXG4gIGlzTGlmZUN5Y2xlUmVjb3JkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5tb2RlID09PSBSZWNvcmRUeXBlLkRpcmVjdGl2ZUxpZmVjeWNsZTsgfVxufVxuIl19