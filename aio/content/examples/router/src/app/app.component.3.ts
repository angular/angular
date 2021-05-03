/* tslint:disable:no-unused-variable */
// #docplaster
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  /* Typical link
  // #docregion h-anchor
  <a [routerLink]="['/heroes']">Heroes</a>
  // #enddocregion h-anchor
  */
  /* Incomplete Crisis Center link when CC lacks a default
  // The link now fails with a "non-terminal link" error
  // #docregion cc-anchor-w-default
  <a [routerLink]="['/crisis-center']">Crisis Center</a>
  // #enddocregion cc-anchor-w-default
  */
  /* Crisis Center link when CC lacks a default
  <a [routerLink]="['/crisis-center/']">Crisis Center</a>
  */
  /* Crisis Center Detail link
  // #docregion Dragon-anchor
  <a [routerLink]="['/crisis-center', 1]">Dragon Crisis</a>
  // #enddocregion Dragon-anchor
  */
  /* Crisis Center link with optional query params
  // #docregion cc-query-params
  <a [routerLink]="['/crisis-center', { foo: 'foo' }]">Crisis Center</a>
  // #enddocregion cc-query-params
  */
// #docregion template
  template: `
    <h1 class="title">Angular Router</h1>
    <nav>
      <a [routerLink]="['/crisis-center']">Crisis Center</a>
      <a [routerLink]="['/crisis-center/1', { foo: 'foo' }]">Dragon Crisis</a>
      <a [routerLink]="['/crisis-center/2']">Shark Crisis</a>
    </nav>
    <router-outlet></router-outlet>
  `
// #enddocregion template
})
export class AppComponent { }
