/* eslint-disable space-before-function-paren */
// #docplaster
// #docregion
import {Component, forwardRef, Optional, SkipSelf} from '@angular/core';

// A component base class (see AlexComponent)
export abstract class Base {
  name = 'Count Basie';
}

// Marker class, used as an interface
// #docregion parent
export abstract class Parent {
  abstract name: string;
}
// #enddocregion parent

const DifferentParent = Parent;

// Helper method to provide the current component instance in the name of a `parentType`.
// The `parentType` defaults to `Parent` when omitting the second parameter.
export function provideParent(component: any, parentType?: any) {
  return {provide: parentType || Parent, useExisting: forwardRef(() => component)};
}

// Simpler syntax version that always provides the component in the name of `Parent`.
export function provideTheParent(component: any) {
  return {provide: Parent, useExisting: forwardRef(() => component)};
}

///////// C - Child //////////
const templateC = `
  <div class="c">
    <h3>{{name}}</h3>
    <p>My parent is {{parent?.name}}</p>
  </div>`;

@Component({
  standalone: true,
  selector: 'carol',
  template: templateC,
})
// #docregion carol-class
export class CarolComponent {
  name = 'Carol';
  // #docregion carol-ctor
  constructor(@Optional() public parent?: Parent) {}
  // #enddocregion carol-ctor
}
// #enddocregion carol-class

@Component({
  standalone: true,
  selector: 'chris',
  template: templateC,
})
export class ChrisComponent {
  name = 'Chris';
  constructor(@Optional() public parent?: Parent) {}
}

//////  Craig ///////////
/**
 * Show we cannot inject a parent by its base class.
 */
// #docregion craig
@Component({
  standalone: true,
  selector: 'craig',
  template: `
  <div class="c">
    <h3>Craig</h3>
    {{alex ? 'Found' : 'Did not find'}} Alex via the base class.
  </div>`,
})
export class CraigComponent {
  constructor(@Optional() public alex?: Base) {}
}
// #enddocregion craig

//////// B - Parent /////////
// #docregion barry
const templateB = `
  <div class="b">
    <div>
      <h3>{{name}}</h3>
      <p>My parent is {{parent?.name}}</p>
    </div>
    <carol></carol>
    <chris></chris>
  </div>`;

@Component({
  standalone: true,
  selector: 'barry',
  template: templateB,
  providers: [{provide: Parent, useExisting: forwardRef(() => BarryComponent)}],
  imports: [CarolComponent, ChrisComponent],
})
export class BarryComponent implements Parent {
  name = 'Barry';
  // #docregion barry-ctor
  constructor(@SkipSelf() @Optional() public parent?: Parent) {}
  // #enddocregion barry-ctor
}
// #enddocregion barry

@Component({
  standalone: true,
  selector: 'bob',
  template: templateB,
  providers: [provideParent(BobComponent)],
  imports: [CarolComponent, ChrisComponent],
})
export class BobComponent implements Parent {
  name = 'Bob';
  constructor(@SkipSelf() @Optional() public parent?: Parent) {}
}

@Component({
  standalone: true,
  selector: 'beth',
  template: templateB,
  providers: [provideParent(BethComponent, DifferentParent)],
  imports: [CarolComponent, ChrisComponent],
})
export class BethComponent implements Parent {
  name = 'Beth';
  constructor(@SkipSelf() @Optional() public parent?: Parent) {}
}

//////  Cathy ///////////
/**
 * Show we can inject a parent by component type
 */
// #docregion cathy
@Component({
  standalone: true,
  selector: 'cathy',
  template: `
  <div class="c">
    <h3>Cathy</h3>
    {{alex ? 'Found' : 'Did not find'}} Alex via the component class.<br>
  </div>`,
})
export class CathyComponent {
  constructor(@Optional() public alex?: AlexComponent) {}
}
// #enddocregion cathy

///////// A - Grandparent //////

// #docregion alex-1
@Component({
  standalone: true,
  selector: 'alex',
  template: `
    <div class="a">
      <h3>{{name}}</h3>
      <cathy></cathy>
      <craig></craig>
      <carol></carol>
    </div>`,
  // #enddocregion alex-1
  // #docregion alex-providers
  providers: [{provide: Parent, useExisting: forwardRef(() => AlexComponent)}],
  // #enddocregion alex-providers
  // #docregion alex-1
  imports: [CathyComponent, CraigComponent, CarolComponent],
})
// #enddocregion alex-1
// TODO: Add `... implements Parent` to class signature
// #docregion alex-1
// #docregion alex-class-signature
// #enddocregion alex-class-signature
export class AlexComponent extends Base {
  override name = 'Alex';
}
// #enddocregion alex-1

/////

@Component({
  standalone: true,
  selector: 'alice',
  template: `
    <div class="a">
      <h3>{{name}}</h3>
      <barry></barry>
      <beth></beth>
      <bob></bob>
      <carol></carol>
    </div> `,
  providers: [provideParent(AliceComponent)],
  imports: [BarryComponent, BethComponent, BobComponent, CarolComponent],
})
// #docregion alice-class-signature
// #enddocregion alice-class-signature
export class AliceComponent implements Parent {
  name = 'Alice';
}

///////// ParentFinder //////
@Component({
  standalone: true,
  selector: 'app-parent-finder',
  template: `
    <h2>Parent Finder</h2>
    <alex></alex>
    <alice></alice>`,
  imports: [AlexComponent, AliceComponent],
})
export class ParentFinderComponent {}
