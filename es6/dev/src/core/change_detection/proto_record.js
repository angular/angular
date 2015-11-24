export var RecordType;
(function (RecordType) {
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
})(RecordType || (RecordType = {}));
export class ProtoRecord {
    constructor(mode, name, funcOrValue, args, fixedArgs, contextIndex, directiveIndex, selfIndex, bindingRecord, lastInBinding, lastInDirective, argumentToPureFunction, referencedBySelf, propertyBindingIndex) {
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
    isPureFunction() {
        return this.mode === RecordType.Interpolate || this.mode === RecordType.CollectionLiteral;
    }
    isUsedByOtherRecord() { return !this.lastInBinding || this.referencedBySelf; }
    shouldBeChecked() {
        return this.argumentToPureFunction || this.lastInBinding || this.isPureFunction() ||
            this.isPipeRecord();
    }
    isPipeRecord() { return this.mode === RecordType.Pipe; }
    isConditionalSkipRecord() {
        return this.mode === RecordType.SkipRecordsIfNot || this.mode === RecordType.SkipRecordsIf;
    }
    isUnconditionalSkipRecord() { return this.mode === RecordType.SkipRecords; }
    isSkipRecord() {
        return this.isConditionalSkipRecord() || this.isUnconditionalSkipRecord();
    }
    isLifeCycleRecord() { return this.mode === RecordType.DirectiveLifecycle; }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvdG9fcmVjb3JkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbi9wcm90b19yZWNvcmQudHMiXSwibmFtZXMiOlsiUmVjb3JkVHlwZSIsIlByb3RvUmVjb3JkIiwiUHJvdG9SZWNvcmQuY29uc3RydWN0b3IiLCJQcm90b1JlY29yZC5pc1B1cmVGdW5jdGlvbiIsIlByb3RvUmVjb3JkLmlzVXNlZEJ5T3RoZXJSZWNvcmQiLCJQcm90b1JlY29yZC5zaG91bGRCZUNoZWNrZWQiLCJQcm90b1JlY29yZC5pc1BpcGVSZWNvcmQiLCJQcm90b1JlY29yZC5pc0NvbmRpdGlvbmFsU2tpcFJlY29yZCIsIlByb3RvUmVjb3JkLmlzVW5jb25kaXRpb25hbFNraXBSZWNvcmQiLCJQcm90b1JlY29yZC5pc1NraXBSZWNvcmQiLCJQcm90b1JlY29yZC5pc0xpZmVDeWNsZVJlY29yZCJdLCJtYXBwaW5ncyI6IkFBR0EsV0FBWSxVQXFCWDtBQXJCRCxXQUFZLFVBQVU7SUFDcEJBLDJDQUFJQSxDQUFBQTtJQUNKQSw2Q0FBS0EsQ0FBQUE7SUFDTEEseURBQVdBLENBQUFBO0lBQ1hBLDJEQUFZQSxDQUFBQTtJQUNaQSw2REFBYUEsQ0FBQUE7SUFDYkEsNkNBQUtBLENBQUFBO0lBQ0xBLDJEQUFZQSxDQUFBQTtJQUNaQSw2REFBYUEsQ0FBQUE7SUFDYkEscURBQVNBLENBQUFBO0lBQ1RBLHVEQUFVQSxDQUFBQTtJQUNWQSw0Q0FBSUEsQ0FBQUE7SUFDSkEsMERBQVdBLENBQUFBO0lBQ1hBLDREQUFZQSxDQUFBQTtJQUNaQSxzRUFBaUJBLENBQUFBO0lBQ2pCQSxvRUFBZ0JBLENBQUFBO0lBQ2hCQSx3RUFBa0JBLENBQUFBO0lBQ2xCQSw4Q0FBS0EsQ0FBQUE7SUFDTEEsOERBQWFBLENBQUFBO0lBQ2JBLG9FQUFnQkEsQ0FBQUE7SUFDaEJBLDBEQUFXQSxDQUFBQSxDQUFRQSwrQkFBK0JBO0FBQ3BEQSxDQUFDQSxFQXJCVyxVQUFVLEtBQVYsVUFBVSxRQXFCckI7QUFFRDtJQUNFQyxZQUFtQkEsSUFBZ0JBLEVBQVNBLElBQVlBLEVBQVNBLFdBQVdBLEVBQVNBLElBQVdBLEVBQzdFQSxTQUFnQkEsRUFBU0EsWUFBb0JBLEVBQzdDQSxjQUE4QkEsRUFBU0EsU0FBaUJBLEVBQ3hEQSxhQUE0QkEsRUFBU0EsYUFBc0JBLEVBQzNEQSxlQUF3QkEsRUFBU0Esc0JBQStCQSxFQUNoRUEsZ0JBQXlCQSxFQUFTQSxvQkFBNEJBO1FBTDlEQyxTQUFJQSxHQUFKQSxJQUFJQSxDQUFZQTtRQUFTQSxTQUFJQSxHQUFKQSxJQUFJQSxDQUFRQTtRQUFTQSxnQkFBV0EsR0FBWEEsV0FBV0EsQ0FBQUE7UUFBU0EsU0FBSUEsR0FBSkEsSUFBSUEsQ0FBT0E7UUFDN0VBLGNBQVNBLEdBQVRBLFNBQVNBLENBQU9BO1FBQVNBLGlCQUFZQSxHQUFaQSxZQUFZQSxDQUFRQTtRQUM3Q0EsbUJBQWNBLEdBQWRBLGNBQWNBLENBQWdCQTtRQUFTQSxjQUFTQSxHQUFUQSxTQUFTQSxDQUFRQTtRQUN4REEsa0JBQWFBLEdBQWJBLGFBQWFBLENBQWVBO1FBQVNBLGtCQUFhQSxHQUFiQSxhQUFhQSxDQUFTQTtRQUMzREEsb0JBQWVBLEdBQWZBLGVBQWVBLENBQVNBO1FBQVNBLDJCQUFzQkEsR0FBdEJBLHNCQUFzQkEsQ0FBU0E7UUFDaEVBLHFCQUFnQkEsR0FBaEJBLGdCQUFnQkEsQ0FBU0E7UUFBU0EseUJBQW9CQSxHQUFwQkEsb0JBQW9CQSxDQUFRQTtJQUFHQSxDQUFDQTtJQUVyRkQsY0FBY0E7UUFDWkUsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsVUFBVUEsQ0FBQ0EsV0FBV0EsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsVUFBVUEsQ0FBQ0EsaUJBQWlCQSxDQUFDQTtJQUM1RkEsQ0FBQ0E7SUFFREYsbUJBQW1CQSxLQUFjRyxNQUFNQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxhQUFhQSxJQUFJQSxJQUFJQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBLENBQUNBO0lBRXZGSCxlQUFlQTtRQUNiSSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxzQkFBc0JBLElBQUlBLElBQUlBLENBQUNBLGFBQWFBLElBQUlBLElBQUlBLENBQUNBLGNBQWNBLEVBQUVBO1lBQzFFQSxJQUFJQSxDQUFDQSxZQUFZQSxFQUFFQSxDQUFDQTtJQUM3QkEsQ0FBQ0E7SUFFREosWUFBWUEsS0FBY0ssTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsVUFBVUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFakVMLHVCQUF1QkE7UUFDckJNLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLElBQUlBLEtBQUtBLFVBQVVBLENBQUNBLGdCQUFnQkEsSUFBSUEsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsVUFBVUEsQ0FBQ0EsYUFBYUEsQ0FBQ0E7SUFDN0ZBLENBQUNBO0lBRUROLHlCQUF5QkEsS0FBY08sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsS0FBS0EsVUFBVUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFFckZQLFlBQVlBO1FBQ1ZRLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLHVCQUF1QkEsRUFBRUEsSUFBSUEsSUFBSUEsQ0FBQ0EseUJBQXlCQSxFQUFFQSxDQUFDQTtJQUM1RUEsQ0FBQ0E7SUFFRFIsaUJBQWlCQSxLQUFjUyxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxLQUFLQSxVQUFVQSxDQUFDQSxrQkFBa0JBLENBQUNBLENBQUNBLENBQUNBO0FBQ3RGVCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtCaW5kaW5nUmVjb3JkfSBmcm9tICcuL2JpbmRpbmdfcmVjb3JkJztcbmltcG9ydCB7RGlyZWN0aXZlSW5kZXh9IGZyb20gJy4vZGlyZWN0aXZlX3JlY29yZCc7XG5cbmV4cG9ydCBlbnVtIFJlY29yZFR5cGUge1xuICBTZWxmLFxuICBDb25zdCxcbiAgUHJpbWl0aXZlT3AsXG4gIFByb3BlcnR5UmVhZCxcbiAgUHJvcGVydHlXcml0ZSxcbiAgTG9jYWwsXG4gIEludm9rZU1ldGhvZCxcbiAgSW52b2tlQ2xvc3VyZSxcbiAgS2V5ZWRSZWFkLFxuICBLZXllZFdyaXRlLFxuICBQaXBlLFxuICBJbnRlcnBvbGF0ZSxcbiAgU2FmZVByb3BlcnR5LFxuICBDb2xsZWN0aW9uTGl0ZXJhbCxcbiAgU2FmZU1ldGhvZEludm9rZSxcbiAgRGlyZWN0aXZlTGlmZWN5Y2xlLFxuICBDaGFpbixcbiAgU2tpcFJlY29yZHNJZiwgICAgIC8vIFNraXAgcmVjb3JkcyB3aGVuIHRoZSBjb25kaXRpb24gaXMgdHJ1ZVxuICBTa2lwUmVjb3Jkc0lmTm90LCAgLy8gU2tpcCByZWNvcmRzIHdoZW4gdGhlIGNvbmRpdGlvbiBpcyBmYWxzZVxuICBTa2lwUmVjb3JkcyAgICAgICAgLy8gU2tpcCByZWNvcmRzIHVuY29uZGl0aW9uYWxseVxufVxuXG5leHBvcnQgY2xhc3MgUHJvdG9SZWNvcmQge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbW9kZTogUmVjb3JkVHlwZSwgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGZ1bmNPclZhbHVlLCBwdWJsaWMgYXJnczogYW55W10sXG4gICAgICAgICAgICAgIHB1YmxpYyBmaXhlZEFyZ3M6IGFueVtdLCBwdWJsaWMgY29udGV4dEluZGV4OiBudW1iZXIsXG4gICAgICAgICAgICAgIHB1YmxpYyBkaXJlY3RpdmVJbmRleDogRGlyZWN0aXZlSW5kZXgsIHB1YmxpYyBzZWxmSW5kZXg6IG51bWJlcixcbiAgICAgICAgICAgICAgcHVibGljIGJpbmRpbmdSZWNvcmQ6IEJpbmRpbmdSZWNvcmQsIHB1YmxpYyBsYXN0SW5CaW5kaW5nOiBib29sZWFuLFxuICAgICAgICAgICAgICBwdWJsaWMgbGFzdEluRGlyZWN0aXZlOiBib29sZWFuLCBwdWJsaWMgYXJndW1lbnRUb1B1cmVGdW5jdGlvbjogYm9vbGVhbixcbiAgICAgICAgICAgICAgcHVibGljIHJlZmVyZW5jZWRCeVNlbGY6IGJvb2xlYW4sIHB1YmxpYyBwcm9wZXJ0eUJpbmRpbmdJbmRleDogbnVtYmVyKSB7fVxuXG4gIGlzUHVyZUZ1bmN0aW9uKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLm1vZGUgPT09IFJlY29yZFR5cGUuSW50ZXJwb2xhdGUgfHwgdGhpcy5tb2RlID09PSBSZWNvcmRUeXBlLkNvbGxlY3Rpb25MaXRlcmFsO1xuICB9XG5cbiAgaXNVc2VkQnlPdGhlclJlY29yZCgpOiBib29sZWFuIHsgcmV0dXJuICF0aGlzLmxhc3RJbkJpbmRpbmcgfHwgdGhpcy5yZWZlcmVuY2VkQnlTZWxmOyB9XG5cbiAgc2hvdWxkQmVDaGVja2VkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmFyZ3VtZW50VG9QdXJlRnVuY3Rpb24gfHwgdGhpcy5sYXN0SW5CaW5kaW5nIHx8IHRoaXMuaXNQdXJlRnVuY3Rpb24oKSB8fFxuICAgICAgICAgICB0aGlzLmlzUGlwZVJlY29yZCgpO1xuICB9XG5cbiAgaXNQaXBlUmVjb3JkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5tb2RlID09PSBSZWNvcmRUeXBlLlBpcGU7IH1cblxuICBpc0NvbmRpdGlvbmFsU2tpcFJlY29yZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5tb2RlID09PSBSZWNvcmRUeXBlLlNraXBSZWNvcmRzSWZOb3QgfHwgdGhpcy5tb2RlID09PSBSZWNvcmRUeXBlLlNraXBSZWNvcmRzSWY7XG4gIH1cblxuICBpc1VuY29uZGl0aW9uYWxTa2lwUmVjb3JkKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5tb2RlID09PSBSZWNvcmRUeXBlLlNraXBSZWNvcmRzOyB9XG5cbiAgaXNTa2lwUmVjb3JkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmlzQ29uZGl0aW9uYWxTa2lwUmVjb3JkKCkgfHwgdGhpcy5pc1VuY29uZGl0aW9uYWxTa2lwUmVjb3JkKCk7XG4gIH1cblxuICBpc0xpZmVDeWNsZVJlY29yZCgpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMubW9kZSA9PT0gUmVjb3JkVHlwZS5EaXJlY3RpdmVMaWZlY3ljbGU7IH1cbn1cbiJdfQ==