/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isPlatformBrowser, NgComponentOutlet, NgTemplateOutlet} from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  EnvironmentInjector,
  inject,
  PLATFORM_ID,
  Signal,
  signal,
  Type,
  viewChild,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {
  ClickOutside,
  DocContent,
  DocViewer,
  IconComponent,
  NavigationItem,
  NavigationList,
  TutorialType,
  TutorialNavigationData,
  TutorialNavigationItem,
} from '@angular/docs';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {from} from 'rxjs';
import {filter} from 'rxjs/operators';

import {PagePrefix} from '../../core/enums/pages';
import {
  EmbeddedTutorialManager,
  LoadingStep,
  NodeRuntimeState,
  EmbeddedEditor,
  injectNodeRuntimeSandbox,
} from '../../editor/index';
import {SplitResizerHandler} from './split-resizer-handler.service';

const INTRODUCTION_LABEL = 'Introduction';

@Component({
  selector: 'adev-tutorial',
  imports: [
    NgComponentOutlet,
    NgTemplateOutlet,
    DocViewer,
    NavigationList,
    ClickOutside,
    RouterLink,
    IconComponent,
  ],
  templateUrl: './tutorial.component.html',
  styleUrls: [
    './tutorial.component.scss',
    './tutorial-navigation.scss',
    './tutorial-navigation-list.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SplitResizerHandler],
})
export default class Tutorial {
  readonly content = viewChild<ElementRef<HTMLDivElement>>('content');
  readonly editor = viewChild<ElementRef<HTMLDivElement>>('editor');
  readonly resizer = viewChild.required<ElementRef<HTMLDivElement>>('resizer');
  readonly revealAnswerButton = viewChild<ElementRef<HTMLButtonElement>>('revealAnswerButton');

  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly environmentInjector = inject(EnvironmentInjector);
  private readonly elementRef = inject(ElementRef<unknown>);
  private readonly embeddedTutorialManager = inject(EmbeddedTutorialManager);
  private readonly nodeRuntimeState = inject(NodeRuntimeState);
  private readonly route = inject(ActivatedRoute);
  private readonly splitResizerHandler = inject(SplitResizerHandler);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly documentContent = signal<string | null>(null);
  readonly localTutorialZipUrl = signal<string | undefined>(undefined);

  readonly nextTutorialPath = signal<string | null>(null);
  readonly stepName = signal<string | null>(null);
  readonly tutorialName = signal<string | null>(null);
  readonly tutorialNavigationItems = signal<NavigationItem[]>([]);
  readonly showNavigationDropdown = signal<boolean>(false);

  readonly shouldRenderContent = signal<boolean>(false);
  readonly shouldRenderEmbeddedEditor = signal<boolean>(false);
  readonly shouldRenderRevealAnswer = signal<boolean>(false);

  nextStepPath: string | undefined;
  previousStepPath: string | undefined;

  embeddedEditorComponent?: Type<unknown>;

  canRevealAnswer: Signal<boolean> = signal(false);
  readonly answerRevealed = signal<boolean>(false);

  constructor() {
    this.route.data
      .pipe(
        filter(() =>
          Boolean(this.route?.routeConfig?.path?.startsWith(`${PagePrefix.TUTORIALS}/`)),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((data) => {
        const docContent = (data['docContent'] as DocContent | undefined)?.contents ?? null;
        this.documentContent.set(docContent);
        this.setTutorialData(data as TutorialNavigationItem);
      });

    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.splitResizerHandler.init(
        this.elementRef,
        this.content()!,
        this.resizer(),
        this.editor(),
      );

      from(this.loadEmbeddedEditorComponent())
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe((editorComponent) => {
          this.embeddedEditorComponent = editorComponent;
          this.changeDetectorRef.markForCheck();
        });
    });
  }

  toggleNavigationDropdown($event: MouseEvent): void {
    // Stop propagation required to avoid detecting click inside ClickOutside
    // directive.
    $event.stopPropagation();
    this.showNavigationDropdown.update((state) => !state);
  }

  hideNavigationDropdown(): void {
    this.showNavigationDropdown.set(false);
  }

  async handleRevealAnswer() {
    if (!this.canRevealAnswer()) return;

    this.embeddedTutorialManager.revealAnswer();

    const nodeRuntimeSandbox = await injectNodeRuntimeSandbox(this.environmentInjector);

    await Promise.all(
      Object.entries(this.embeddedTutorialManager.answerFiles()).map(([path, contents]) =>
        nodeRuntimeSandbox.writeFile(path, contents as string | Uint8Array),
      ),
    );

    this.answerRevealed.set(true);
  }

  async handleResetAnswer() {
    if (!this.canRevealAnswer()) return;

    this.embeddedTutorialManager.resetRevealAnswer();

    const nodeRuntimeSandbox = await injectNodeRuntimeSandbox(this.environmentInjector);

    await Promise.all(
      Object.entries(this.embeddedTutorialManager.tutorialFiles()).map(([path, contents]) =>
        nodeRuntimeSandbox.writeFile(path, contents as string | Uint8Array),
      ),
    );

    this.answerRevealed.set(false);
  }

  /**
   * Set tutorial data based on current tutorial
   */
  private async setTutorialData(tutorialNavigationItem: TutorialNavigationItem): Promise<void> {
    this.showNavigationDropdown.set(false);
    this.answerRevealed.set(false);

    this.setRouteData(tutorialNavigationItem);

    const {tutorialData: routeData} = tutorialNavigationItem;

    if (routeData.type === TutorialType.LOCAL) {
      this.setLocalTutorialData(routeData);
    } else if (
      (routeData.type === TutorialType.EDITOR || routeData.type === TutorialType.CLI) &&
      this.isBrowser
    ) {
      await this.setEditorTutorialData(
        tutorialNavigationItem.path.replace(`${PagePrefix.TUTORIALS}/`, ''),
      );
    }
  }

  /**
   * Set tutorial data from route data
   */
  private setRouteData(tutorialNavigationItem: TutorialNavigationItem) {
    const {tutorialData: routeData} = tutorialNavigationItem;

    const tutorialName = tutorialNavigationItem.parent
      ? tutorialNavigationItem.parent.label
      : tutorialNavigationItem.label;

    const stepName = routeData.title === tutorialName ? INTRODUCTION_LABEL : routeData.title;

    this.tutorialName.set(tutorialName);
    this.stepName.set(stepName);

    this.tutorialNavigationItems.set(
      tutorialNavigationItem.parent
        ? [{...tutorialNavigationItem.parent, label: INTRODUCTION_LABEL}]
        : [{...tutorialNavigationItem, label: INTRODUCTION_LABEL}],
    );

    this.shouldRenderContent.set(routeData.type !== TutorialType.EDITOR_ONLY);

    this.nextStepPath = routeData.nextStep ? `/${routeData.nextStep}` : undefined;
    this.previousStepPath = routeData.previousStep ? `/${routeData.previousStep}` : undefined;

    this.nextTutorialPath.set(routeData.nextTutorial ? `/${routeData.nextTutorial}` : null);
  }

  /**
   * Set values for tutorials that do not use the embedded editor
   */
  private setLocalTutorialData(routeData: TutorialNavigationData) {
    this.localTutorialZipUrl.set(routeData.sourceCodeZipPath);

    this.shouldRenderEmbeddedEditor.set(false);
    this.shouldRenderRevealAnswer.set(false);
  }

  /**
   * Set values for tutorials that use the embedded editor
   */
  private async setEditorTutorialData(tutorialPath: string) {
    this.shouldRenderEmbeddedEditor.set(true);

    const currentTutorial = tutorialPath.replace(`${PagePrefix.TUTORIALS}/`, '');

    await this.embeddedTutorialManager.fetchAndSetTutorialFiles(currentTutorial);

    const hasAnswers = Object.keys(this.embeddedTutorialManager.answerFiles()).length > 0;
    this.shouldRenderRevealAnswer.set(hasAnswers);

    await this.loadEmbeddedEditor();
  }

  private async loadEmbeddedEditor() {
    const nodeRuntimeSandbox = await injectNodeRuntimeSandbox(this.environmentInjector);

    this.canRevealAnswer = computed(() => this.nodeRuntimeState.loadingStep() > LoadingStep.BOOT);

    await nodeRuntimeSandbox.init();
  }

  private async loadEmbeddedEditorComponent(): Promise<typeof EmbeddedEditor> {
    return await import('../../editor/index').then((c) => c.EmbeddedEditor);
  }
}
