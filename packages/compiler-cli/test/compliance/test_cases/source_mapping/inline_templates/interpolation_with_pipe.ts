import {Component, NgModule, Pipe, PipeTransform} from '@angular/core';

@Component({
    selector: 'test-cmp',
    template: '<div>{{200.3 | percent : 2 }}</div>',
    standalone: false
})
export class TestCmp {
}

@Pipe({
    name: 'percent',
    standalone: false
})
export class PercentPipe implements PipeTransform {
  transform() {}
}

@NgModule({declarations: [TestCmp, PercentPipe]})
export class AppModule {
}