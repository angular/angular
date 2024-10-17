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
  Component,
  DestroyRef,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CdkMenu, CdkMenuItem, CdkMenuTrigger} from '@angular/cdk/menu';
import {IconComponent, PlaygroundTemplate} from '@angular/docs';
import {from} from 'rxjs';

import {EmbeddedEditor} from '../../editor/embedded-editor.component';
import {NodeRuntimeSandbox} from '../../editor/node-runtime-sandbox.service';
import {EmbeddedTutorialManager} from '../../editor/embedded-tutorial-manager.service';

import PLAYGROUND_ROUTE_DATA_JSON from '../../../../src/assets/tutorials/playground/routes.json';

@Component({
  selector: 'adev-playground',
  standalone: true,
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
  private readonly embeddedTutorialManager = inject(EmbeddedTutorialManager);
  private readonly nodeRuntimeSandbox = inject(NodeRuntimeSandbox);
  private readonly destroyRef = inject(DestroyRef);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly templates = PLAYGROUND_ROUTE_DATA_JSON.templates;
  readonly defaultTemplate = PLAYGROUND_ROUTE_DATA_JSON.defaultTemplate;
  readonly starterTemplate = PLAYGROUND_ROUTE_DATA_JSON.starterTemplate;

  // We don't render the `embedded-editor` on the server.
  protected embeddedEditorComponent = this.isBrowser ? EmbeddedEditor : null;
  protected selectedTemplate: PlaygroundTemplate = this.defaultTemplate;

  ngAfterViewInit(): void {
    if (!this.isBrowser) {
      return;
    }

    // If using `async-await`, `this` will be captured until the function is executed
    // and completed, which can lead to a memory leak if the user navigates away from
    // the playground component to another page.
    from(this.loadTemplate(this.defaultTemplate.path))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.nodeRuntimeSandbox.init());
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
