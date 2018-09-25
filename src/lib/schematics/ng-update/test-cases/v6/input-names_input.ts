import {Component} from '@angular/core';

@Component({
  template: `
    <mat-radio-group align="end"></mat-radio-group>
    <mat-radio-group [align]="myAlign">
      <mat-radio-button [align]="myAlign"></mat-radio-button>
      <mat-radio-button align="start"></mat-radio-button>
    </mat-radio-group>
  `
})
class A {}

@Component({
  template: `
    <mat-drawer align="end"></mat-drawer>
    <mat-drawer [align]="myAlign"></mat-drawer>
    <mat-sidenav [align]="myAlign"></mat-sidenav>
  `
})
class B {}

@Component({
  template: `
    <mat-form-field dividerColor="primary"></mat-form-field>
    <mat-form-field [dividerColor]="myColor"></mat-form-field>
    <mat-form-field floatPlaceholder="always"></mat-form-field>
    <mat-form-field [floatPlaceholder]="floatState"></mat-form-field>
  `
})
class C {}

@Component({
  template: `
    <mat-tab-group [mat-dynamic-height]="myHeight"></mat-tab-group>
    <mat-checkbox align="end"></mat-checkbox>
    <div matTooltip [tooltip-position]="end"></div>
    <mat-slider [tick-interval]="interval"></mat-slider>
    <mat-slider [thumb-label]="myLabel"></mat-slider>
  `
})
class D {}
