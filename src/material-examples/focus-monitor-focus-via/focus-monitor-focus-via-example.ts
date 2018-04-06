import {FocusMonitor, FocusOrigin} from '@angular/cdk/a11y';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';

/** @title Focusing with a specific FocusOrigin */
@Component({
  selector: 'focus-monitor-focus-via-example',
  templateUrl: 'focus-monitor-focus-via-example.html',
  styleUrls: ['focus-monitor-focus-via-example.css']
})
export class FocusMonitorFocusViaExample implements OnDestroy, OnInit {
  @ViewChild('monitored') monitoredEl: ElementRef;

  origin: string = this.formatOrigin(null);

  constructor(public focusMonitor: FocusMonitor,
              private cdr: ChangeDetectorRef,
              private ngZone: NgZone) {}

  ngOnInit() {
    this.focusMonitor.monitor(this.monitoredEl.nativeElement)
        .subscribe(origin => this.ngZone.run(() => {
          this.origin = this.formatOrigin(origin);
          this.cdr.markForCheck();
        }));
  }

  ngOnDestroy() {
    this.focusMonitor.stopMonitoring(this.monitoredEl.nativeElement);
  }

  formatOrigin(origin: FocusOrigin): string {
    return origin ? origin + ' focused' : 'blurred';
  }
}
