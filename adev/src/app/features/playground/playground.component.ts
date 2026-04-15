/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';
import {isPlatformServer, NgComponentOutlet} from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  effect,
  EnvironmentInjector,
  inject,
  input,
  PLATFORM_ID,
  signal,
  Type,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {IconComponent, PlaygroundTemplate} from '@angular/docs';
import {forkJoin, switchMap, tap} from 'rxjs';

import {injectAsync} from '../../core/services/inject-async';
import {injectNodeRuntimeSandbox} from '../../editor/index';
import type {NodeRuntimeSandbox} from '../../editor/node-runtime-sandbox.service';

import {ActivatedRoute, Router} from '@angular/router';
import PLAYGROUND_ROUTE_DATA_JSON from '../../../../src/assets/tutorials/playground/routes.json';

@Component({
  selector: 'adev-playground',
  imports: [NgComponentOutlet, IconComponent, CdkMenu, CdkMenuItem, CdkMenuTrigger],
  templateUrl: './playground.component.html',
  styleUrls: ['./playground.component.scss', '../tutorial/tutorial-navigation.scss'],
})
export default class PlaygroundComponent {
  readonly templateId = input<string | undefined>();

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly templates: PlaygroundTemplate[] = PLAYGROUND_ROUTE_DATA_JSON.templates;
  readonly defaultTemplate = PLAYGROUND_ROUTE_DATA_JSON.defaultTemplate;
  readonly starterTemplate = PLAYGROUND_ROUTE_DATA_JSON.starterTemplate;

  protected nodeRuntimeSandbox?: NodeRuntimeSandbox;
  protected embeddedEditorComponent?: Type<unknown>;
  protected selectedTemplate: PlaygroundTemplate = this.defaultTemplate;
  private readonly isSandboxReady = signal(false);

  constructor() {
    if (this.isServer) {
      return;
    }

    effect(() => {
      const foundTemplate = this.templates.find((t) => t.id === this.templateId());
      this.changeTemplate(foundTemplate ?? this.defaultTemplate);
    });

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
        switchMap(() => this.loadTemplate(this.selectedTemplate.path)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
        this.nodeRuntimeSandbox?.init();
        this.isSandboxReady.set(true);
      });
  }

  async newProject() {
    await this.loadTemplate(this.starterTemplate.path);
  }

  async changeTemplate(template: PlaygroundTemplate): Promise<void> {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {templateId: template.id},
      replaceUrl: true,
    });
    this.selectedTemplate = template;
    await this.loadTemplate(template.path);
    if (this.isSandboxReady()) {
      await this.nodeRuntimeSandbox?.reset();
    }
  }

  private async loadTemplate(tutorialPath: string) {
    const embeddedTutorialManager = await injectAsync(this.environmentInjector, () =>
      import('../../editor/index').then((c) => c.EmbeddedTutorialManager),
    );

    await embeddedTutorialManager.fetchAndSetTutorialFiles(tutorialPath);
  }
}
