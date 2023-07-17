import {Component, Directive, NgModule, Pipe} from '@angular/core';

@Directive({selector: '[not-standalone]'})
export class NotStandaloneDir {
}

@Pipe({name: 'nspipe'})
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
  standalone: true,
  selector: '[indirect]',
})
export class IndirectDir {
}

@Pipe({
  standalone: true,
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
  standalone: true,
  selector: '[direct]',
})
export class DirectDir {
}

@Pipe({
  standalone: true,
  name: 'directpipe',
})
export class DirectPipe {
  transform(value: any): any {}
}

@Component({
  standalone: true,
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
