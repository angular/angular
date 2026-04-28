import {Directive, NgModule} from '@angular/core';

@Directive({
  selector: '[hostBindingDir]',
  host: {'[id]': 'getData()?.id'},
  standalone: false,
})
export class HostBindingDir {
  getData: () =>
    | {
        id: number;
      }
    | undefined = () => undefined;
}

@NgModule({declarations: [HostBindingDir]})
export class MyModule {}
