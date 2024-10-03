/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isPlatformBrowser, NgComponentOutlet} from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EnvironmentInjector,
  PLATFORM_ID,
  Type,
  inject,
} from '@angular/core';
import {IconComponent} from '@angular/docs';

import {PlaygroundTemplate} from '@angular/docs';
import {injectAsync} from '../../core/services/inject-async';
import {EmbeddedTutorialManager} from '../../editor/index';

import PLAYGROUND_ROUTE_DATA_JSON from '../../../../src/assets/tutorials/playground/routes.json';
import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';

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
export default class PlaygroundComponent implements AfterViewInit {
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly embeddedTutorialManager = inject(EmbeddedTutorialManager);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly platformId = inject(PLATFORM_ID);

  readonly templates = PLAYGROUND_ROUTE_DATA_JSON.templates;
  readonly defaultTemplate = PLAYGROUND_ROUTE_DATA_JSON.defaultTemplate;
  readonly starterTemplate = PLAYGROUND_ROUTE_DATA_JSON.starterTemplate;

  protected embeddedEditorComponent?: Type<unknown>;
  protected selectedTemplate: PlaygroundTemplate = this.defaultTemplate;

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      const [embeddedEditorComponent, nodeRuntimeSandbox] = await Promise.all([
        import('../../editor/index').then((c) => c.EmbeddedEditor),
        injectAsync(this.environmentInjector, () =>
          import('../../editor/index').then((c) => c.NodeRuntimeSandbox),
        ),
      ]);

      this.embeddedEditorComponent = embeddedEditorComponent;

      this.changeDetectorRef.markForCheck();

      await this.loadTemplate(this.defaultTemplate.path);

      await nodeRuntimeSandbox.init();
    }
  }

  async newProject() {
    await this.loadTemplate(this.starterTemplate.path);
  }

  async changeTemplate(template: PlaygroundTemplate): Promise<void> {
    this.selectedTemplate = template;
    await this.loadTemplate(template.path);
  }

  private async loadTemplate(tutorialPath: string) {
    await this.embeddedTutorialManager.fetchAndSetTutorialFiles(tutorialPath);
  }
}
