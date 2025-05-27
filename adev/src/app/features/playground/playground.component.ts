/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isPlatformServer, NgComponentOutlet} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  EnvironmentInjector,
  PLATFORM_ID,
  Type,
  inject,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';
import {IconComponent, PlaygroundTemplate} from '@angular/docs';
import {forkJoin, switchMap, tap} from 'rxjs';

import {injectAsync} from '../../core/services/inject-async';
import {injectNodeRuntimeSandbox} from '../../editor/index';
import type {NodeRuntimeSandbox} from '../../editor/node-runtime-sandbox.service';

import PLAYGROUND_ROUTE_DATA_JSON from '../../../../src/assets/tutorials/playground/routes.json';

@Component({
  selector: 'adev-playground',
  imports: [NgComponentOutlet, IconComponent, CdkMenu, CdkMenuItem, CdkMenuTrigger],
  templateUrl: './playground.component.html',
  styleUrls: [
    './playground.component.scss',
    '../tutorial/tutorial-navigation.scss',
    '../tutorial/tutorial-navigation-list.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PlaygroundComponent {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));

  readonly templates = PLAYGROUND_ROUTE_DATA_JSON.templates;
  readonly defaultTemplate = PLAYGROUND_ROUTE_DATA_JSON.defaultTemplate;
  readonly starterTemplate = PLAYGROUND_ROUTE_DATA_JSON.starterTemplate;

  protected nodeRuntimeSandbox?: NodeRuntimeSandbox;
  protected embeddedEditorComponent?: Type<unknown>;
  protected selectedTemplate: PlaygroundTemplate = this.defaultTemplate;

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
        this.nodeRuntimeSandbox!.init();
      });
  }

  async newProject() {
    await this.loadTemplate(this.starterTemplate.path);
  }

  async changeTemplate(template: PlaygroundTemplate): Promise<void> {
    this.selectedTemplate = template;
    await this.loadTemplate(template.path);
    await this.nodeRuntimeSandbox!.reset();
  }

  private async loadTemplate(tutorialPath: string) {
    const embeddedTutorialManager = await injectAsync(this.environmentInjector, () =>
      import('../../editor/index').then((c) => c.EmbeddedTutorialManager),
    );

    await embeddedTutorialManager.fetchAndSetTutorialFiles(tutorialPath);
  }
}
