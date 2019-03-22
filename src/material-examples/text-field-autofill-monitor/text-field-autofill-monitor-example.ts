import {AutofillMonitor} from '@angular/cdk/text-field';
import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';

/** @title Monitoring autofill state with AutofillMonitor */
@Component({
  selector: 'text-field-autofill-monitor-example',
  templateUrl: './text-field-autofill-monitor-example.html',
  styleUrls: ['./text-field-autofill-monitor-example.css'],
})
export class TextFieldAutofillMonitorExample implements AfterViewInit, OnDestroy {
  @ViewChild('first', {read: ElementRef}) firstName: ElementRef<HTMLElement>;
  @ViewChild('last', {read: ElementRef}) lastName: ElementRef<HTMLElement>;
  firstNameAutofilled: boolean;
  lastNameAutofilled: boolean;

  constructor(private autofill: AutofillMonitor) {}

  ngAfterViewInit() {
    this.autofill.monitor(this.firstName)
        .subscribe(e => this.firstNameAutofilled = e.isAutofilled);
    this.autofill.monitor(this.lastName)
        .subscribe(e => this.lastNameAutofilled = e.isAutofilled);
  }

  ngOnDestroy() {
    this.autofill.stopMonitoring(this.firstName);
    this.autofill.stopMonitoring(this.lastName);
  }
}
