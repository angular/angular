import {Component} from '@angular/core';

@Component({
  template: `
    <mat-radio-group labelPosition="end"></mat-radio-group>
    <mat-radio-group [labelPosition]="myAlign">
      <mat-radio-button [labelPosition]="myAlign"></mat-radio-button>
      <mat-radio-button labelPosition="start"></mat-radio-button>
    </mat-radio-group>
  `
})
class A {}

@Component({
  template: `
    <mat-drawer position="end"></mat-drawer>
    <mat-drawer [position]="myAlign"></mat-drawer>
    <mat-sidenav [position]="myAlign"></mat-sidenav>
  `
})
class B {}

@Component({
  template: `
    <mat-form-field color="primary"></mat-form-field>
    <mat-form-field [color]="myColor"></mat-form-field>
    <mat-form-field floatLabel="always"></mat-form-field>
    <mat-form-field [floatLabel]="floatState"></mat-form-field>
  `
})
class C {}

@Component({
  template: `
    <mat-tab-group [dynamicHeight]="myHeight"></mat-tab-group>
    <mat-checkbox labelPosition="end"></mat-checkbox>
    <div matTooltip [matTooltipPosition]="end"></div>
    <mat-slider [tickInterval]="interval"></mat-slider>
    <mat-slider [thumbLabel]="myLabel"></mat-slider>
  `
})
class D {}
