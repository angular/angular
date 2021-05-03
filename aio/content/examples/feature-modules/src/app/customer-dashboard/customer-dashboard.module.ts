// #docplaster
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// #docregion customer-dashboard-component
// import the new component
import { CustomerDashboardComponent } from './customer-dashboard/customer-dashboard.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    CustomerDashboardComponent
  ],
  // #enddocregion customer-dashboard-component
  // #docregion component-exports
  exports: [
    CustomerDashboardComponent
  ]
  // #enddocregion component-exports
  // #docregion customer-dashboard-component
})

// #enddocregion customer-dashboard-component

export class CustomerDashboardModule { }
