import {Component, NgModule, Pipe} from '@angular/core';

@Component({
    selector: 'host-binding-comp',
    template: `
    <div [attr.style]="{} | my_forward_pipe">...</div>
  `,
    standalone: false
})
export class HostBindingComp {
}

@Pipe({
    name: 'my_forward_pipe',
    standalone: false
})
class MyForwardPipe {
  transform() {}
}

@NgModule({declarations: [HostBindingComp, MyForwardPipe]})
export class MyModule {
}
