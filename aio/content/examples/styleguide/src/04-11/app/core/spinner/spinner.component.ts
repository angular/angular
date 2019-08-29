// #docregion
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { LoggerService } from '../logger.service';
import { SpinnerState, SpinnerService } from './spinner.service';

@Component({
  selector: 'toh-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent implements OnDestroy, OnInit {
  visible = false;

  private spinnerStateChanged: Subscription;

  constructor(
    private loggerService: LoggerService,
    private spinnerService: SpinnerService
  ) { }

  ngOnInit() {
    console.log(this.visible);
    this.spinnerStateChanged = this.spinnerService.spinnerState
      .subscribe((state: SpinnerState) => {
        this.visible = state.show;
        this.loggerService.log(`visible=${this.visible}`);
      });
  }

  ngOnDestroy() {
    this.spinnerStateChanged.unsubscribe();
  }
}
