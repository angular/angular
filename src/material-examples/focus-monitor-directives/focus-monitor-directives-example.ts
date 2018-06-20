import {FocusOrigin} from '@angular/cdk/a11y';
import {ChangeDetectorRef, Component, NgZone} from '@angular/core';

/** @title Monitoring focus with FocusMonitor */
@Component({
  selector: 'focus-monitor-directives-example',
  templateUrl: 'focus-monitor-directives-example.html',
  styleUrls: ['focus-monitor-directives-example.css']
})
export class FocusMonitorDirectivesExample {
  elementOrigin = this.formatOrigin(null);
  subtreeOrigin = this.formatOrigin(null);

  constructor(private ngZone: NgZone, private cdr: ChangeDetectorRef) {}


  formatOrigin(origin: FocusOrigin): string {
    return origin ? origin + ' focused' : 'blurred';
  }

  // Workaround for the fact that (cdkFocusChange) emits outside NgZone.
  markForCheck() {
    this.ngZone.run(() => this.cdr.markForCheck());
  }
}
