/* tslint:disable:no-unused-variable */
// #docplaster
import { Component } from '@angular/core';
import { Router }    from '@angular/router';

@Component({
  selector: 'app-root',
  /* Typical link
  // #docregion h-anchor
  <a [routerLink]="['/items']">Items</a>
  // #enddocregion h-anchor
  */
  /* Incomplete Crisis Center link when CC lacks a default
  // #docregion cc-anchor-fail
  // The link now fails with a "non-terminal link" error
  // #docregion cc-anchor-w-default
  <a [routerLink]="['/clearance-center']">Clearance Center</a>
  // #enddocregion cc-anchor-w-default
  // #enddocregion cc-anchor-fail
  */
  /* Clearance Center link when CC lacks a default
  // #docregion cc-anchor-no-default
  <a [routerLink]="['/clearance-center/']">Clearance Center</a>
  // #enddocregion cc-anchor-no-default
  */
  /* Clearance Center Detail link
  // #docregion Dragon-anchor
  <a [routerLink]="['/clearance-center', 1]">Dresser</a>
  // #enddocregion Dragon-anchor
  */
  /* Crisis Center link with optional query params
  // #docregion cc-query-params
  <a [routerLink]="['/clearance-center', { foo: 'foo' }]">Clearance Center</a>
  // #enddocregion cc-query-params
  */
// #docregion template
  template: `
    <h1 class="title">Angular Router</h1>
    <nav>
      <a [routerLink]="['/clearance-center']">Clearance Center</a>
      <a [routerLink]="['/clearance-center/1', { foo: 'foo' }]">Dresser</a>
      <a [routerLink]="['/clearance-center/2']">Sofa</a>
    </nav>
    <router-outlet></router-outlet>
  `
// #enddocregion template
})
export class AppComponent { }
