import {Component} from '@angular/core';

@Component({
  template: `
    <mat-select (selectionChange)="onChange($event)"></mat-select>
    <mat-select (closed)="onClose($event)"></mat-select>
    <mat-select (opened)="onOpen($event)"></mat-select>
  `
})
class A {}

@Component({
  template: `
    <mat-drawer (positionChanged)="onAlignChanged()"></mat-drawer>
    <mat-drawer (closed)="onClose()" (opened)="onOpen()"></mat-drawer>
    <mat-tab-group (selectedTabChange)="onSelectionChange()"></mat-tab-group>
  `
})
class B {}

@Component({
  template: `
    <mat-chip (removed)="removeFromList()"></mat-chip>
    <mat-basic-chip (removed)="removeFromList()"></mat-basic-chip>
    <mat-chip (destroyed)="onDestroy()"></mat-chip>
    <mat-basic-chip (destroyed)="onDestroy()"></mat-basic-chip>
  `
})
class C {}
