// #docplaster
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
// #docregion imports
import { ReactiveFormsModule } from '@angular/forms';

// #enddocregion imports
import { AppComponent } from './app.component';
import { NameEditorComponent } from './name-editor/name-editor.component';
import { ProfileEditorComponent } from './profile-editor/profile-editor.component';

// #docregion imports
@NgModule({
// #enddocregion imports
  declarations: [
    AppComponent,
    NameEditorComponent,
    ProfileEditorComponent
  ],
// #docregion imports
  imports: [
// #enddocregion imports
    BrowserModule,
// #docregion imports
    // other imports ...
    ReactiveFormsModule
  ],
// #enddocregion imports
  providers: [],
  bootstrap: [AppComponent]
// #docregion imports
})
export class AppModule { }
// #enddocregion imports
