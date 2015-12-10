var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { CONST } from 'angular2/src/facade/lang';
/**
 * Creates a token that can be used in a DI Provider.
 *
 * ### Example ([live demo](http://plnkr.co/edit/Ys9ezXpj2Mnoy3Uc8KBp?p=preview))
 *
 * ```typescript
 * var t = new OpaqueToken("value");
 *
 * var injector = Injector.resolveAndCreate([
 *   provide(t, {useValue: "providedValue"})
 * ]);
 *
 * expect(injector.get(t)).toEqual("bindingValue");
 * ```
 *
 * Using an `OpaqueToken` is preferable to using strings as tokens because of possible collisions
 * caused by multiple providers using the same string as two different tokens.
 *
 * Using an `OpaqueToken` is preferable to using an `Object` as tokens because it provides better
 * error messages.
 */
export let OpaqueToken = class {
    constructor(_desc) {
        this._desc = _desc;
    }
    toString() { return `Token ${this._desc}`; }
};
OpaqueToken = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String])
], OpaqueToken);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3BhcXVlX3Rva2VuLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvc3JjL2NvcmUvZGkvb3BhcXVlX3Rva2VuLnRzIl0sIm5hbWVzIjpbIk9wYXF1ZVRva2VuIiwiT3BhcXVlVG9rZW4uY29uc3RydWN0b3IiLCJPcGFxdWVUb2tlbi50b1N0cmluZyJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7T0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLDBCQUEwQjtBQUU5Qzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FvQkc7QUFDSDtJQUVFQSxZQUFvQkEsS0FBYUE7UUFBYkMsVUFBS0EsR0FBTEEsS0FBS0EsQ0FBUUE7SUFBR0EsQ0FBQ0E7SUFFckNELFFBQVFBLEtBQWFFLE1BQU1BLENBQUNBLFNBQVNBLElBQUlBLENBQUNBLEtBQUtBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBO0FBQ3RERixDQUFDQTtBQUxEO0lBQUMsS0FBSyxFQUFFOztnQkFLUDtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtDT05TVH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBDcmVhdGVzIGEgdG9rZW4gdGhhdCBjYW4gYmUgdXNlZCBpbiBhIERJIFByb3ZpZGVyLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9ZczllelhwajJNbm95M1VjOEtCcD9wPXByZXZpZXcpKVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIHZhciB0ID0gbmV3IE9wYXF1ZVRva2VuKFwidmFsdWVcIik7XG4gKlxuICogdmFyIGluamVjdG9yID0gSW5qZWN0b3IucmVzb2x2ZUFuZENyZWF0ZShbXG4gKiAgIHByb3ZpZGUodCwge3VzZVZhbHVlOiBcInByb3ZpZGVkVmFsdWVcIn0pXG4gKiBdKTtcbiAqXG4gKiBleHBlY3QoaW5qZWN0b3IuZ2V0KHQpKS50b0VxdWFsKFwiYmluZGluZ1ZhbHVlXCIpO1xuICogYGBgXG4gKlxuICogVXNpbmcgYW4gYE9wYXF1ZVRva2VuYCBpcyBwcmVmZXJhYmxlIHRvIHVzaW5nIHN0cmluZ3MgYXMgdG9rZW5zIGJlY2F1c2Ugb2YgcG9zc2libGUgY29sbGlzaW9uc1xuICogY2F1c2VkIGJ5IG11bHRpcGxlIHByb3ZpZGVycyB1c2luZyB0aGUgc2FtZSBzdHJpbmcgYXMgdHdvIGRpZmZlcmVudCB0b2tlbnMuXG4gKlxuICogVXNpbmcgYW4gYE9wYXF1ZVRva2VuYCBpcyBwcmVmZXJhYmxlIHRvIHVzaW5nIGFuIGBPYmplY3RgIGFzIHRva2VucyBiZWNhdXNlIGl0IHByb3ZpZGVzIGJldHRlclxuICogZXJyb3IgbWVzc2FnZXMuXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgT3BhcXVlVG9rZW4ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9kZXNjOiBzdHJpbmcpIHt9XG5cbiAgdG9TdHJpbmcoKTogc3RyaW5nIHsgcmV0dXJuIGBUb2tlbiAke3RoaXMuX2Rlc2N9YDsgfVxufVxuIl19