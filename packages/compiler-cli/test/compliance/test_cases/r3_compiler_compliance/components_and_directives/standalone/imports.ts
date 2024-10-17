import {Component, Directive, NgModule, Pipe} from '@angular/core';

@Directive({
    selector: '[not-standalone]',
    standalone: false
})
export class NotStandaloneDir {
}

@Pipe({
    name: 'nspipe',
    standalone: false
})
export class NotStandalonePipe {
  transform(value: any): any {}
}

@NgModule({
  declarations: [NotStandaloneDir, NotStandalonePipe],
  exports: [NotStandaloneDir, NotStandalonePipe],
})
export class NotStandaloneStuffModule {
}

@Directive({
  selector: '[indirect]',
})
export class IndirectDir {
}

@Pipe({
  name: 'indirectpipe',
})
export class IndirectPipe {
  transform(value: any): any {}
}

@NgModule({
  imports: [IndirectDir, IndirectPipe],
  exports: [NotStandaloneStuffModule, IndirectDir, IndirectPipe],
})
export class SomeModule {
}


@Directive({
  selector: '[direct]',
})
export class DirectDir {
}

@Pipe({
  name: 'directpipe',
})
export class DirectPipe {
  transform(value: any): any {}
}

@Component({
    selector: 'test-cmp',
    template: `
    <p>Reference some non-standalone things:<span not-standalone>{{data | nspipe}}</span></p>
    <p>Reference some indirect standalone things:<span indirect>{{data | indirectpipe}}</span></p>
    <p>Reference some standalone things directly:<span direct>{{data | directpipe}}</span></p>
  `,
  imports: [SomeModule, DirectDir, DirectPipe],
})
export class TestCmp {
  data = true;
}
