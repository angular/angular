import {Component, Input, NgModule} from '@angular/core';

let events: string[] = [];

@Component({selector: 'lifecycle-comp', template: ''})
export class LifecycleComp {
  @Input('name') nameMin!: string;

  ngOnChanges() {
    events.push('changes' + this.nameMin);
  }

  ngOnInit() {
    events.push('init' + this.nameMin);
  }
  ngDoCheck() {
    events.push('check' + this.nameMin);
  }

  ngAfterContentInit() {
    events.push('content init' + this.nameMin);
  }
  ngAfterContentChecked() {
    events.push('content check' + this.nameMin);
  }

  ngAfterViewInit() {
    events.push('view init' + this.nameMin);
  }
  ngAfterViewChecked() {
    events.push('view check' + this.nameMin);
  }

  ngOnDestroy() {
    events.push(this.nameMin);
  }
}

@Component({
  selector: 'simple-layout',
  template: `
    <lifecycle-comp [name]="name1"></lifecycle-comp>
    <lifecycle-comp [name]="name2"></lifecycle-comp>
  `
})
export class SimpleLayout {
  name1 = '1';
  name2 = '2';
}

@NgModule({declarations: [LifecycleComp, SimpleLayout]})
export class LifecycleModule {
}
