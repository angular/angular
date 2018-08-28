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

/** @title Monitoring focus with FocusMonitor */
@Component({
  selector: 'focus-monitor-overview-example',
  templateUrl: 'focus-monitor-overview-example.html',
  styleUrls: ['focus-monitor-overview-example.css']
})
export class FocusMonitorOverviewExample implements OnDestroy, OnInit {
  @ViewChild('element') element: ElementRef<HTMLElement>;
  @ViewChild('subtree') subtree: ElementRef<HTMLElement>;

  elementOrigin = this.formatOrigin(null);
  subtreeOrigin = this.formatOrigin(null);

  constructor(private focusMonitor: FocusMonitor,
              private cdr: ChangeDetectorRef,
              private ngZone: NgZone) {}

  ngOnInit() {
    this.focusMonitor.monitor(this.element)
        .subscribe(origin => this.ngZone.run(() => {
          this.elementOrigin = this.formatOrigin(origin);
          this.cdr.markForCheck();
        }));
    this.focusMonitor.monitor(this.subtree, true)
        .subscribe(origin => this.ngZone.run(() => {
          this.subtreeOrigin = this.formatOrigin(origin);
          this.cdr.markForCheck();
        }));
  }

  ngOnDestroy() {
    this.focusMonitor.stopMonitoring(this.element);
    this.focusMonitor.stopMonitoring(this.subtree);
  }

  formatOrigin(origin: FocusOrigin): string {
    return origin ? origin + ' focused' : 'blurred';
  }
}
