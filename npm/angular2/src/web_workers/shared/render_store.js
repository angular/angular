'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var di_1 = require("angular2/src/core/di");
var RenderStore = (function () {
    function RenderStore() {
        this._nextIndex = 0;
        this._lookupById = new Map();
        this._lookupByObject = new Map();
    }
    RenderStore.prototype.allocateId = function () { return this._nextIndex++; };
    RenderStore.prototype.store = function (obj, id) {
        this._lookupById.set(id, obj);
        this._lookupByObject.set(obj, id);
    };
    RenderStore.prototype.remove = function (obj) {
        var index = this._lookupByObject.get(obj);
        this._lookupByObject.delete(obj);
        this._lookupById.delete(index);
    };
    RenderStore.prototype.deserialize = function (id) {
        if (id == null) {
            return null;
        }
        if (!this._lookupById.has(id)) {
            return null;
        }
        return this._lookupById.get(id);
    };
    RenderStore.prototype.serialize = function (obj) {
        if (obj == null) {
            return null;
        }
        return this._lookupByObject.get(obj);
    };
    RenderStore = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], RenderStore);
    return RenderStore;
}());
exports.RenderStore = RenderStore;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVuZGVyX3N0b3JlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1yNVBySks5aC50bXAvYW5ndWxhcjIvc3JjL3dlYl93b3JrZXJzL3NoYXJlZC9yZW5kZXJfc3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBR2hEO0lBS0U7UUFKUSxlQUFVLEdBQVcsQ0FBQyxDQUFDO1FBSzdCLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxHQUFHLEVBQWUsQ0FBQztRQUMxQyxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksR0FBRyxFQUFlLENBQUM7SUFDaEQsQ0FBQztJQUVELGdDQUFVLEdBQVYsY0FBdUIsTUFBTSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFbEQsMkJBQUssR0FBTCxVQUFNLEdBQVEsRUFBRSxFQUFVO1FBQ3hCLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM5QixJQUFJLENBQUMsZUFBZSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVELDRCQUFNLEdBQU4sVUFBTyxHQUFRO1FBQ2IsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDakMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVELGlDQUFXLEdBQVgsVUFBWSxFQUFVO1FBQ3BCLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFFRCxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM5QixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsK0JBQVMsR0FBVCxVQUFVLEdBQVE7UUFDaEIsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDaEIsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNkLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQXpDSDtRQUFDLGVBQVUsRUFBRTs7bUJBQUE7SUEwQ2Isa0JBQUM7QUFBRCxDQUFDLEFBekNELElBeUNDO0FBekNZLG1CQUFXLGNBeUN2QixDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tIFwiYW5ndWxhcjIvc3JjL2NvcmUvZGlcIjtcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJlbmRlclN0b3JlIHtcbiAgcHJpdmF0ZSBfbmV4dEluZGV4OiBudW1iZXIgPSAwO1xuICBwcml2YXRlIF9sb29rdXBCeUlkOiBNYXA8bnVtYmVyLCBhbnk+O1xuICBwcml2YXRlIF9sb29rdXBCeU9iamVjdDogTWFwPGFueSwgbnVtYmVyPjtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9sb29rdXBCeUlkID0gbmV3IE1hcDxudW1iZXIsIGFueT4oKTtcbiAgICB0aGlzLl9sb29rdXBCeU9iamVjdCA9IG5ldyBNYXA8YW55LCBudW1iZXI+KCk7XG4gIH1cblxuICBhbGxvY2F0ZUlkKCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9uZXh0SW5kZXgrKzsgfVxuXG4gIHN0b3JlKG9iajogYW55LCBpZDogbnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fbG9va3VwQnlJZC5zZXQoaWQsIG9iaik7XG4gICAgdGhpcy5fbG9va3VwQnlPYmplY3Quc2V0KG9iaiwgaWQpO1xuICB9XG5cbiAgcmVtb3ZlKG9iajogYW55KTogdm9pZCB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fbG9va3VwQnlPYmplY3QuZ2V0KG9iaik7XG4gICAgdGhpcy5fbG9va3VwQnlPYmplY3QuZGVsZXRlKG9iaik7XG4gICAgdGhpcy5fbG9va3VwQnlJZC5kZWxldGUoaW5kZXgpO1xuICB9XG5cbiAgZGVzZXJpYWxpemUoaWQ6IG51bWJlcik6IGFueSB7XG4gICAgaWYgKGlkID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fbG9va3VwQnlJZC5oYXMoaWQpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fbG9va3VwQnlJZC5nZXQoaWQpO1xuICB9XG5cbiAgc2VyaWFsaXplKG9iajogYW55KTogbnVtYmVyIHtcbiAgICBpZiAob2JqID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fbG9va3VwQnlPYmplY3QuZ2V0KG9iaik7XG4gIH1cbn1cbiJdfQ==