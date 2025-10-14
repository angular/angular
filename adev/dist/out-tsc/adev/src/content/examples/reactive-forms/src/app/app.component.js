import {__esDecorate, __runInitializers} from 'tslib';
import {Component, computed, signal} from '@angular/core';
import {NameEditorComponent} from './name-editor/name-editor.component';
import {ProfileEditorComponent} from './profile-editor/profile-editor.component';
let AppComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css'],
      imports: [NameEditorComponent, ProfileEditorComponent],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AppComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      AppComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    editor = signal('name');
    showNameEditor = computed(() => this.editor() === 'name');
    showProfileEditor = computed(() => this.editor() === 'profile');
    toggleEditor(type) {
      this.editor.set(type);
    }
  };
  return (AppComponent = _classThis);
})();
export {AppComponent};
//# sourceMappingURL=app.component.js.map
