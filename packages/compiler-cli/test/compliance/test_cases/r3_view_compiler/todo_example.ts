import {Component, Input, NgModule} from '@angular/core';

@Component({
    selector: 'my-app', template: '<todo [data]="list"></todo>',
    standalone: false
})
export class MyApp {
  list: any[] = [];
}

@Component({
    selector: 'todo',
    template: '<ul class="list" [title]="myTitle"><li *ngFor="let item of data">{{data}}</li></ul>',
    standalone: false
})
export class TodoComponent {
  @Input() data: any[] = [];

  myTitle!: string;
}

@NgModule({
  declarations: [TodoComponent, MyApp],
})
export class TodoModule {
}
