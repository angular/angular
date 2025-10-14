import {__esDecorate, __runInitializers} from 'tslib';
import {CdkDrag, CdkDropList, moveItemInArray} from '@angular/cdk/drag-drop';
import {Component} from '@angular/core';
/**
 * @title Drag&Drop sorting
 */
let CdkDragDropSortingExample = (() => {
  let _classDecorators = [
    Component({
      selector: 'cdk-drag-drop-sorting-example',
      templateUrl: 'app.component.html',
      styleUrl: 'app.component.css',
      standalone: true,
      imports: [CdkDropList, CdkDrag],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CdkDragDropSortingExample = class {
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
      CdkDragDropSortingExample = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    movies = [
      'Episode I - The Phantom Menace',
      'Episode II - Attack of the Clones',
      'Episode III - Revenge of the Sith',
      'Episode IV - A New Hope',
      'Episode V - The Empire Strikes Back',
      'Episode VI - Return of the Jedi',
      'Episode VII - The Force Awakens',
      'Episode VIII - The Last Jedi',
      'Episode IX – The Rise of Skywalker',
    ];
    drop(event) {
      moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
    }
  };
  return (CdkDragDropSortingExample = _classThis);
})();
export {CdkDragDropSortingExample};
//# sourceMappingURL=app.component.js.map
