import { ChangeDetectionStrategy } from './constants';
export class ChangeDetectorRef {
}
export class ChangeDetectorRef_ extends ChangeDetectorRef {
    constructor(_cd) {
        super();
        this._cd = _cd;
    }
    markForCheck() { this._cd.markPathToRootAsCheckOnce(); }
    detach() { this._cd.mode = ChangeDetectionStrategy.Detached; }
    detectChanges() { this._cd.detectChanges(); }
    checkNoChanges() { this._cd.checkNoChanges(); }
    reattach() {
        this._cd.mode = ChangeDetectionStrategy.CheckAlways;
        this.markForCheck();
    }
}
//# sourceMappingURL=change_detector_ref.js.map