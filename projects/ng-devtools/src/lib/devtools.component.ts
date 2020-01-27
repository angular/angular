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
  @Input() messageBus: MessageBus<Events>;

  private _interval$ = interval(500).subscribe(() => this.messageBus.emit('queryNgAvailability'));

  ngOnInit() {
    console.log('Initialized the devtools UI');

    this.messageBus.once('ngAvailability', ({ version }) => {
      if (version) {
        this.angularExists = true;
      }
      this._interval$.unsubscribe();
    });
  }

  ngOnDestroy() {
    this._interval$.unsubscribe();
  }
}
