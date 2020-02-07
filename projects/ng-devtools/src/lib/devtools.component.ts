import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MessageBus, Events } from 'protocol';
import { interval } from 'rxjs';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'ng-devtools',
  templateUrl: './devtools.component.html',
  styleUrls: ['./devtools.component.css'],
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('200ms', style({ opacity: 1 }))
        ]),
        transition(':leave', [
          style({ opacity: 1 }),
          animate('200ms', style({ opacity: 0 }))
        ])
      ]
    )
  ]
})
export class DevToolsComponent implements OnInit, OnDestroy {
  angularExists: boolean | null = null;
  angularVersion: string | boolean | undefined = undefined;
  prodMode: boolean;
  @Input() messageBus: MessageBus<Events>;

  private _interval$ = interval(500).subscribe(() => this.messageBus.emit('queryNgAvailability'));

  ngOnInit(): void {
    console.log('Initialized the devtools UI');

    this.messageBus.once('ngAvailability', ({ version, prodMode }) => {
      this.angularExists = !!version;
      this.angularVersion = version;
      this.prodMode = prodMode;
      this._interval$.unsubscribe();
    });
  }

  majorAngularVersion(): number {
    return +this.angularVersion.toString().split('.')[0];
  }

  get supportedVersion(): boolean {
    return this.majorAngularVersion() >= 9 && !this.prodMode;
  }

  ngOnDestroy(): void {
    this._interval$.unsubscribe();
  }
}
