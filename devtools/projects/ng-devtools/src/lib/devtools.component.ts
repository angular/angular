import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageBus, Events } from 'protocol';
import { interval } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';
import { ThemeService } from './theme-service';

@Component({
  selector: 'ng-devtools',
  templateUrl: './devtools.component.html',
  styleUrls: ['./devtools.component.scss'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [style({ opacity: 0 }), animate('200ms', style({ opacity: 1 }))]),
      transition(':leave', [style({ opacity: 1 }), animate('200ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class DevToolsComponent implements OnInit, OnDestroy {
  angularExists: boolean | null = null;
  angularVersion: string | boolean | undefined = undefined;
  angularIsInDevMode = true;
  ivy: boolean;

  constructor(private _messageBus: MessageBus<Events>, private _themeService: ThemeService) {}

  private _interval$ = interval(500).subscribe((attempt) => {
    if (attempt === 10) {
      this.angularExists = false;
    }
    this._messageBus.emit('queryNgAvailability');
  });

  ngOnInit(): void {
    this._themeService.initializeThemeWatcher();

    this._messageBus.once('ngAvailability', ({ version, devMode, ivy }) => {
      this.angularExists = !!version;
      this.angularVersion = version;
      this.angularIsInDevMode = devMode;
      this.ivy = ivy;
      this._interval$.unsubscribe();
    });
  }

  get majorAngularVersion(): number {
    if (!this.angularVersion) {
      return -1;
    }
    return parseInt(this.angularVersion.toString().split('.')[0], 10);
  }

  get supportedVersion(): boolean {
    return (this.majorAngularVersion >= 9 || this.majorAngularVersion === 0) && this.ivy;
  }

  ngOnDestroy(): void {
    this._interval$.unsubscribe();
  }
}
