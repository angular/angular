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

/** @title Monitoring focus with FocusMonitor */
@Component({
  selector: 'focus-monitor-overview-example',
  templateUrl: 'focus-monitor-overview-example.html',
  styleUrls: ['focus-monitor-overview-example.css']
})
export class FocusMonitorOverviewExample implements OnDestroy, AfterViewInit {
  @ViewChild('element', {static: false}) element: ElementRef<HTMLElement>;
  @ViewChild('subtree', {static: false}) subtree: ElementRef<HTMLElement>;

  elementOrigin = this.formatOrigin(null);
  subtreeOrigin = this.formatOrigin(null);

  constructor(private _focusMonitor: FocusMonitor,
              private _cdr: ChangeDetectorRef,
              private _ngZone: NgZone) {}

  ngAfterViewInit() {
    this._focusMonitor.monitor(this.element)
        .subscribe(origin => this._ngZone.run(() => {
          this.elementOrigin = this.formatOrigin(origin);
          this._cdr.markForCheck();
        }));
    this._focusMonitor.monitor(this.subtree, true)
        .subscribe(origin => this._ngZone.run(() => {
          this.subtreeOrigin = this.formatOrigin(origin);
          this._cdr.markForCheck();
        }));
  }

  ngOnDestroy() {
    this._focusMonitor.stopMonitoring(this.element);
    this._focusMonitor.stopMonitoring(this.subtree);
  }

  formatOrigin(origin: FocusOrigin): string {
    return origin ? origin + ' focused' : 'blurred';
  }
}
