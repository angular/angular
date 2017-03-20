import { Component, ElementRef, Input, Output, OnInit } from '@angular/core';

@Component({
  selector: 'c-comp',
  template: `
    <p>{{id}}: {{name}}</p>
  `
})
export class CComponent implements OnInit {
  static nextId = 1;
  id = CComponent.nextId++;
  @Input() name = 'My name is C-' + this.id;

  ngOnInit() {
    console.log(this.name);
  }
}

@Component({
  selector: 'c-alone',
  template: `
    <p>The cheese named {{name}} stands alone.</p>
  `
})
export class CaloneComponent {
  @Input() name; // Doesn't work because DocViewer doesn't set @Input properties

  constructor( elementRef: ElementRef ) {
    // extract from the attributes of the host element
    this.name = elementRef.nativeElement.attributes[0].value;
  }
}

@Component({
  selector: 'b-comp',
  template: `
    <h3>B-{{id}}<h3>
    <c-comp *ngFor="let n of names" [name]="n"></c-comp>
  `
})
export class BComponent {
  static nextId = 1;
  id = BComponent.nextId++;
  names = ['Eeny', 'Meany', 'Miney', 'Moe'];
}

@Component({
  selector: 'a-comp',
  template: `
    <h2>A-{{id}}</h2>
    <b-comp></b-comp>
  `
})
export class AComponent {
  static nextId = 1;
  id = AComponent.nextId++;
}

@Component({
  selector: 'dummy',
  template: `
    <h1>Dummy</h1>
    <a-comp></a-comp>
  `
})
export class DummyComponent {}

export const dummyComponents = [AComponent, BComponent, CComponent, CaloneComponent, DummyComponent];
