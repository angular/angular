/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {isPlatformServer, NgComponentOutlet} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EnvironmentInjector,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';
import {IconComponent} from '@angular/docs';
import {forkJoin, switchMap, tap} from 'rxjs';
import {injectAsync} from '../../core/services/inject-async';
import {injectNodeRuntimeSandbox} from '../../editor/index';
import PLAYGROUND_ROUTE_DATA_JSON from '../../../../src/assets/tutorials/playground/routes.json';
let PlaygroundComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'adev-playground',
      imports: [NgComponentOutlet, IconComponent, CdkMenu, CdkMenuItem, CdkMenuTrigger],
      templateUrl: './playground.component.html',
      styleUrls: ['./playground.component.scss', '../tutorial/tutorial-navigation.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var PlaygroundComponent = class {
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
      PlaygroundComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    changeDetectorRef = inject(ChangeDetectorRef);
    environmentInjector = inject(EnvironmentInjector);
    destroyRef = inject(DestroyRef);
    isServer = isPlatformServer(inject(PLATFORM_ID));
    templates = PLAYGROUND_ROUTE_DATA_JSON.templates;
    defaultTemplate = PLAYGROUND_ROUTE_DATA_JSON.defaultTemplate;
    starterTemplate = PLAYGROUND_ROUTE_DATA_JSON.starterTemplate;
    nodeRuntimeSandbox;
    embeddedEditorComponent;
    selectedTemplate = this.defaultTemplate;
    constructor() {
      if (this.isServer) {
        return;
      }
      // If using `async-await`, `this` will be captured until the function is executed
      // and completed, which can lead to a memory leak if the user navigates away from
      // the playground component to another page.
      forkJoin({
        nodeRuntimeSandbox: injectNodeRuntimeSandbox(this.environmentInjector),
        embeddedEditorComponent: import('../../editor/index').then((c) => c.EmbeddedEditor),
      })
        .pipe(
          tap(({nodeRuntimeSandbox, embeddedEditorComponent}) => {
            this.nodeRuntimeSandbox = nodeRuntimeSandbox;
            this.embeddedEditorComponent = embeddedEditorComponent;
          }),
          switchMap(() => this.loadTemplate(this.defaultTemplate.path)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe(() => {
          this.changeDetectorRef.markForCheck();
          this.nodeRuntimeSandbox.init();
        });
    }
    async newProject() {
      await this.loadTemplate(this.starterTemplate.path);
    }
    async changeTemplate(template) {
      this.selectedTemplate = template;
      await this.loadTemplate(template.path);
      await this.nodeRuntimeSandbox.reset();
    }
    async loadTemplate(tutorialPath) {
      const embeddedTutorialManager = await injectAsync(this.environmentInjector, () =>
        import('../../editor/index').then((c) => c.EmbeddedTutorialManager),
      );
      await embeddedTutorialManager.fetchAndSetTutorialFiles(tutorialPath);
    }
  };
  return (PlaygroundComponent = _classThis);
})();
export default PlaygroundComponent;
//# sourceMappingURL=playground.component.js.map
