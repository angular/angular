// #docregion
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { TodoAppComponent }   from './todo_app';
import { TodoListComponent }  from './todo_list';
import { TodoFormComponent }  from './todo_form';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule
  ],
  declarations: [
    TodoAppComponent,
    TodoListComponent,
    TodoFormComponent
  ],
  bootstrap: [ TodoAppComponent ]
})
export class AppModule { }
