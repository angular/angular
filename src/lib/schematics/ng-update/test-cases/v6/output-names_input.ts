import {Component} from '@angular/core';

@Component({
  template: `
    <mat-select (change)="onChange($event)"></mat-select>
    <mat-select (onClose)="onClose($event)"></mat-select>
    <mat-select (onOpen)="onOpen($event)"></mat-select>
  `
})
class A {}

@Component({
  template: `
    <mat-drawer (align-changed)="onAlignChanged()"></mat-drawer>
    <mat-drawer (close)="onClose()" (open)="onOpen()"></mat-drawer>
    <mat-tab-group (selectChange)="onSelectionChange()"></mat-tab-group>
  `
})
class B {}

@Component({
  template: `
    <mat-chip (remove)="removeFromList()"></mat-chip>
    <mat-basic-chip (remove)="removeFromList()"></mat-basic-chip>
    <mat-chip (destroy)="onDestroy()"></mat-chip>
    <mat-basic-chip (destroy)="onDestroy()"></mat-basic-chip>
  `
})
class C {}
