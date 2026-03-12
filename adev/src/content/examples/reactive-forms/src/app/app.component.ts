import {Component, computed, signal, WritableSignal} from '@angular/core';
import {NameEditorComponent} from './name-editor/name-editor.component';
import {ProfileEditorComponent} from './profile-editor/profile-editor.component';

export type EditorType = 'name' | 'profile';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [NameEditorComponent, ProfileEditorComponent],
})
export class AppComponent {
  readonly editor: WritableSignal<EditorType> = signal('name');

  readonly showNameEditor = computed(() => this.editor() === 'name');
  readonly showProfileEditor = computed(() => this.editor() === 'profile');

  toggleEditor(type: EditorType) {
    this.editor.set(type);
  }
}
