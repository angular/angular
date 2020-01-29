import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MessageBus, Events } from 'protocol';
import { interval } from 'rxjs';

@Component({
  selector: 'ng-devtools',
  templateUrl: './devtools.component.html',
  styleUrls: ['./devtools.component.css'],
})
export class DevToolsComponent implements OnInit, OnDestroy {
  angularExists: boolean | null = null;
  angularVersion: string | undefined = undefined;
  @Input() messageBus: MessageBus<Events>;

  private _interval$ = interval(500).subscribe(() => this.messageBus.emit('queryNgAvailability'));

  ngOnInit(): void {
    console.log('Initialized the devtools UI');

    this.messageBus.once('ngAvailability', ({ version }) => {
      this.angularExists = !!version;
      this.angularVersion = version;
      this._interval$.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    this._interval$.unsubscribe();
  }
}
