import {Component} from '@angular/core';

@Component({
  template: `
    <ng-template cdkConnectedOverlay
                 [cdkConnectedOverlayOrigin]="myOrigin"
                 [cdkConnectedOverlayPositions]="myPositions"
                 [cdkConnectedOverlayOffsetX]="myOffsetX"
                 [cdkConnectedOverlayOffsetY]="myOffsetY"
                 [cdkConnectedOverlayWidth]="myWidth"
                 [cdkConnectedOverlayHeight]="myHeight"
                 [cdkConnectedOverlayMinWidth]="myMinWidth"
                 [cdkConnectedOverlayMinHeight]="myMinHeight"
                 [cdkConnectedOverlayBackdropClass]="myBackdropClass"
                 [cdkConnectedOverlayScrollStrategy]="myScrollStrategy"
                 [cdkConnectedOverlayOpen]="isOpen"
                 [cdkConnectedOverlayHasBackdrop]="hasBackdrop">
    </ng-template>
  `
})
class A {}

@Component({
  template: `
    <mat-radio-group labelPosition="end"></mat-radio-group>
    <mat-radio-group [labelPosition]="myAlign">
      <mat-radio-button [labelPosition]="myAlign"></mat-radio-button>
      <mat-radio-button labelPosition="start"></mat-radio-button>
    </mat-radio-group>
  `
})
class B {}

@Component({
  template: `
    <mat-drawer position="end"></mat-drawer>
    <mat-drawer [position]="myAlign"></mat-drawer>
    <mat-sidenav [position]="myAlign"></mat-sidenav>
  `
})
class C {}

@Component({
  template: `
    <mat-form-field color="primary"></mat-form-field>
    <mat-form-field [color]="myColor"></mat-form-field>
    <mat-form-field floatLabel="always"></mat-form-field>
    <mat-form-field [floatLabel]="floatState"></mat-form-field>
  `
})
class D {}

@Component({
  template: `
    <mat-tab-group [dynamicHeight]="myHeight"></mat-tab-group>
    <mat-checkbox labelPosition="end"></mat-checkbox>
    <div matTooltip [matTooltipPosition]="end"></div>
    <mat-slider [tickInterval]="interval"></mat-slider>
    <mat-slider [thumbLabel]="myLabel"></mat-slider>
  `
})
class E {}
