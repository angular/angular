import {Directive, Input, SimpleChanges, TemplateRef, ViewContainerRef} from '@angular/core';

export interface ForOfContext {
  $implicit: any;
  index: number;
  even: boolean;
  odd: boolean;
}

@Directive({selector: '[forOf]'})
export class ForOfDirective {
  private previous!: any[];

  constructor(private view: ViewContainerRef, private template: TemplateRef<any>) {}

  @Input() forOf!: any[];

  ngOnChanges(simpleChanges: SimpleChanges) {}
}
