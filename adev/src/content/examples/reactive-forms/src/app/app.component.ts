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
  editor: WritableSignal<EditorType> = signal('name');

  showNameEditor = computed(() => this.editor() === 'name');
  showProfileEditor = computed(() => this.editor() === 'profile');

  toggleEditor(type: EditorType) {
    this.editor.set(type);
  }
}
