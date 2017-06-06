var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { Math } from 'angular2/src/facade/math';
import { DOM } from 'angular2/src/platform/dom/dom_adapter';
export let BrowserDetails = class BrowserDetails {
    constructor() {
        this.elapsedTimeIncludesDelay = false;
        this.doesElapsedTimeIncludesDelay();
    }
    /**
     * Determines if `event.elapsedTime` includes transition delay in the current browser.  At this
     * time, Chrome and Opera seem to be the only browsers that include this.
     */
    doesElapsedTimeIncludesDelay() {
        var div = DOM.createElement('div');
        DOM.setAttribute(div, 'style', `position: absolute; top: -9999px; left: -9999px; width: 1px;
      height: 1px; transition: all 1ms linear 1ms;`);
        // Firefox requires that we wait for 2 frames for some reason
        this.raf((timestamp) => {
            DOM.on(div, 'transitionend', (event) => {
                var elapsed = Math.round(event.elapsedTime * 1000);
                this.elapsedTimeIncludesDelay = elapsed == 2;
                DOM.remove(div);
            });
            DOM.setStyle(div, 'width', '2px');
        }, 2);
    }
    raf(callback, frames = 1) {
        var queue = new RafQueue(callback, frames);
        return () => queue.cancel();
    }
};
BrowserDetails = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], BrowserDetails);
class RafQueue {
    constructor(callback, frames) {
        this.callback = callback;
        this.frames = frames;
        this._raf();
    }
    _raf() {
        this.currentFrameId =
            DOM.requestAnimationFrame((timestamp) => this._nextFrame(timestamp));
    }
    _nextFrame(timestamp) {
        this.frames--;
        if (this.frames > 0) {
            this._raf();
        }
        else {
            this.callback(timestamp);
        }
    }
    cancel() {
        DOM.cancelAnimationFrame(this.currentFrameId);
        this.currentFrameId = null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlcl9kZXRhaWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1ndE03UWhFbi50bXAvYW5ndWxhcjIvc3JjL2FuaW1hdGUvYnJvd3Nlcl9kZXRhaWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sc0JBQXNCO09BQ3hDLEVBQUMsSUFBSSxFQUFDLE1BQU0sMEJBQTBCO09BQ3RDLEVBQUMsR0FBRyxFQUFDLE1BQU0sdUNBQXVDO0FBR3pEO0lBR0U7UUFGQSw2QkFBd0IsR0FBRyxLQUFLLENBQUM7UUFFakIsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7SUFBQyxDQUFDO0lBRXREOzs7T0FHRztJQUNILDRCQUE0QjtRQUMxQixJQUFJLEdBQUcsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ25DLEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRTttREFDZ0IsQ0FBQyxDQUFDO1FBQ2pELDZEQUE2RDtRQUM3RCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBYztZQUN0QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxlQUFlLEVBQUUsQ0FBQyxLQUFVO2dCQUN0QyxJQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ25ELElBQUksQ0FBQyx3QkFBd0IsR0FBRyxPQUFPLElBQUksQ0FBQyxDQUFDO2dCQUM3QyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3BDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNSLENBQUM7SUFFRCxHQUFHLENBQUMsUUFBa0IsRUFBRSxNQUFNLEdBQVcsQ0FBQztRQUN4QyxJQUFJLEtBQUssR0FBYSxJQUFJLFFBQVEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFDckQsTUFBTSxDQUFDLE1BQU0sS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzlCLENBQUM7QUFDSCxDQUFDO0FBN0JEO0lBQUMsVUFBVSxFQUFFOztrQkFBQTtBQStCYjtJQUVFLFlBQW1CLFFBQWtCLEVBQVMsTUFBYztRQUF6QyxhQUFRLEdBQVIsUUFBUSxDQUFVO1FBQVMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUFJLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUFDLENBQUM7SUFDdEUsSUFBSTtRQUNWLElBQUksQ0FBQyxjQUFjO1lBQ2YsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUMsU0FBaUIsS0FBSyxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7SUFDbkYsQ0FBQztJQUNPLFVBQVUsQ0FBQyxTQUFpQjtRQUNsQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDZCxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDcEIsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1FBQ2QsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzQixDQUFDO0lBQ0gsQ0FBQztJQUNELE1BQU07UUFDSixHQUFHLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO0lBQzdCLENBQUM7QUFDSCxDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0luamVjdGFibGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7TWF0aH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9tYXRoJztcbmltcG9ydCB7RE9NfSBmcm9tICdhbmd1bGFyMi9zcmMvcGxhdGZvcm0vZG9tL2RvbV9hZGFwdGVyJztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEJyb3dzZXJEZXRhaWxzIHtcbiAgZWxhcHNlZFRpbWVJbmNsdWRlc0RlbGF5ID0gZmFsc2U7XG5cbiAgY29uc3RydWN0b3IoKSB7IHRoaXMuZG9lc0VsYXBzZWRUaW1lSW5jbHVkZXNEZWxheSgpOyB9XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgaWYgYGV2ZW50LmVsYXBzZWRUaW1lYCBpbmNsdWRlcyB0cmFuc2l0aW9uIGRlbGF5IGluIHRoZSBjdXJyZW50IGJyb3dzZXIuICBBdCB0aGlzXG4gICAqIHRpbWUsIENocm9tZSBhbmQgT3BlcmEgc2VlbSB0byBiZSB0aGUgb25seSBicm93c2VycyB0aGF0IGluY2x1ZGUgdGhpcy5cbiAgICovXG4gIGRvZXNFbGFwc2VkVGltZUluY2x1ZGVzRGVsYXkoKTogdm9pZCB7XG4gICAgdmFyIGRpdiA9IERPTS5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBET00uc2V0QXR0cmlidXRlKGRpdiwgJ3N0eWxlJywgYHBvc2l0aW9uOiBhYnNvbHV0ZTsgdG9wOiAtOTk5OXB4OyBsZWZ0OiAtOTk5OXB4OyB3aWR0aDogMXB4O1xuICAgICAgaGVpZ2h0OiAxcHg7IHRyYW5zaXRpb246IGFsbCAxbXMgbGluZWFyIDFtcztgKTtcbiAgICAvLyBGaXJlZm94IHJlcXVpcmVzIHRoYXQgd2Ugd2FpdCBmb3IgMiBmcmFtZXMgZm9yIHNvbWUgcmVhc29uXG4gICAgdGhpcy5yYWYoKHRpbWVzdGFtcDogYW55KSA9PiB7XG4gICAgICBET00ub24oZGl2LCAndHJhbnNpdGlvbmVuZCcsIChldmVudDogYW55KSA9PiB7XG4gICAgICAgIHZhciBlbGFwc2VkID0gTWF0aC5yb3VuZChldmVudC5lbGFwc2VkVGltZSAqIDEwMDApO1xuICAgICAgICB0aGlzLmVsYXBzZWRUaW1lSW5jbHVkZXNEZWxheSA9IGVsYXBzZWQgPT0gMjtcbiAgICAgICAgRE9NLnJlbW92ZShkaXYpO1xuICAgICAgfSk7XG4gICAgICBET00uc2V0U3R5bGUoZGl2LCAnd2lkdGgnLCAnMnB4Jyk7XG4gICAgfSwgMik7XG4gIH1cblxuICByYWYoY2FsbGJhY2s6IEZ1bmN0aW9uLCBmcmFtZXM6IG51bWJlciA9IDEpOiBGdW5jdGlvbiB7XG4gICAgdmFyIHF1ZXVlOiBSYWZRdWV1ZSA9IG5ldyBSYWZRdWV1ZShjYWxsYmFjaywgZnJhbWVzKTtcbiAgICByZXR1cm4gKCkgPT4gcXVldWUuY2FuY2VsKCk7XG4gIH1cbn1cblxuY2xhc3MgUmFmUXVldWUge1xuICBjdXJyZW50RnJhbWVJZDogbnVtYmVyO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY2FsbGJhY2s6IEZ1bmN0aW9uLCBwdWJsaWMgZnJhbWVzOiBudW1iZXIpIHsgdGhpcy5fcmFmKCk7IH1cbiAgcHJpdmF0ZSBfcmFmKCkge1xuICAgIHRoaXMuY3VycmVudEZyYW1lSWQgPVxuICAgICAgICBET00ucmVxdWVzdEFuaW1hdGlvbkZyYW1lKCh0aW1lc3RhbXA6IG51bWJlcikgPT4gdGhpcy5fbmV4dEZyYW1lKHRpbWVzdGFtcCkpO1xuICB9XG4gIHByaXZhdGUgX25leHRGcmFtZSh0aW1lc3RhbXA6IG51bWJlcikge1xuICAgIHRoaXMuZnJhbWVzLS07XG4gICAgaWYgKHRoaXMuZnJhbWVzID4gMCkge1xuICAgICAgdGhpcy5fcmFmKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY2FsbGJhY2sodGltZXN0YW1wKTtcbiAgICB9XG4gIH1cbiAgY2FuY2VsKCkge1xuICAgIERPTS5jYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLmN1cnJlbnRGcmFtZUlkKTtcbiAgICB0aGlzLmN1cnJlbnRGcmFtZUlkID0gbnVsbDtcbiAgfVxufVxuIl19