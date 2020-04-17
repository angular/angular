import { Component, OnInit, OnDestroy } from '@angular/core';
import { MessageBus, Events } from 'protocol';
import { interval } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

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
  prodMode: boolean;

  constructor(private _messageBus: MessageBus<Events>) {}

  private _interval$ = interval(500).subscribe((attempt) => {
    if (attempt === 10) {
      this.angularExists = false;
    }
    this._messageBus.emit('queryNgAvailability');
  });

  ngOnInit(): void {
    console.log('Initialized the devtools UI');

    this._messageBus.once('ngAvailability', ({ version, prodMode }) => {
      this.angularExists = !!version;
      this.angularVersion = version;
      this.prodMode = prodMode;
      this._interval$.unsubscribe();
    });
  }

  majorAngularVersion(): number {
    if (!this.angularVersion) {
      return -1;
    }
    return +this.angularVersion.toString().split('.')[0];
  }

  get supportedVersion(): boolean {
    return (this.majorAngularVersion() >= 9 || this.majorAngularVersion() === 0) && !this.prodMode;
  }

  ngOnDestroy(): void {
    this._interval$.unsubscribe();
  }
}
