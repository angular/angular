import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild
} from '@angular/core';

/** @title Focusing with a specific FocusOrigin */
@Component({
  selector: 'focus-monitor-focus-via-example',
  templateUrl: 'focus-monitor-focus-via-example.html',
  styleUrls: ['focus-monitor-focus-via-example.css']
})
export class FocusMonitorFocusViaExample implements OnDestroy, AfterViewInit {
  @ViewChild('monitored', {static: false}) monitoredEl: ElementRef<HTMLElement>;

  origin = this.formatOrigin(null);

  constructor(public focusMonitor: FocusMonitor,
              private _cdr: ChangeDetectorRef,
              private _ngZone: NgZone) {}

  ngAfterViewInit() {
    this.focusMonitor.monitor(this.monitoredEl)
        .subscribe(origin => this._ngZone.run(() => {
          this.origin = this.formatOrigin(origin);
          this._cdr.markForCheck();
        }));
  }

  ngOnDestroy() {
    this.focusMonitor.stopMonitoring(this.monitoredEl);
  }

  formatOrigin(origin: FocusOrigin): string {
    return origin ? origin + ' focused' : 'blurred';
  }
}
