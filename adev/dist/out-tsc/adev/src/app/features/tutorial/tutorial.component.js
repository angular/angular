/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
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
  signal,
  viewChild,
} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ClickOutside, DocViewer, IconComponent} from '@angular/docs';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {from} from 'rxjs';
import {filter} from 'rxjs/operators';
import {
  EmbeddedTutorialManager,
  LoadingStep,
  NodeRuntimeState,
  injectNodeRuntimeSandbox,
} from '../../editor/index';
import {SplitResizerHandler} from './split-resizer-handler.service';
import {PAGE_PREFIX} from '../../core/constants/pages';
import {TutorialNavigationList} from './tutorial-navigation-list';
const INTRODUCTION_LABEL = 'Introduction';
let Tutorial = (() => {
  let _classDecorators = [
    Component({
      selector: 'adev-tutorial',
      imports: [
        NgComponentOutlet,
        NgTemplateOutlet,
        DocViewer,
        TutorialNavigationList,
        ClickOutside,
        RouterLink,
        IconComponent,
      ],
      templateUrl: './tutorial.component.html',
      styleUrls: ['./tutorial.component.scss', './tutorial-navigation.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
      providers: [SplitResizerHandler],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Tutorial = class {
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
      Tutorial = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    content = viewChild('content');
    editor = viewChild('editor');
    resizer = viewChild.required('resizer');
    revealAnswerButton = viewChild('revealAnswerButton');
    changeDetectorRef = inject(ChangeDetectorRef);
    environmentInjector = inject(EnvironmentInjector);
    elementRef = inject(ElementRef);
    embeddedTutorialManager = inject(EmbeddedTutorialManager);
    nodeRuntimeState = inject(NodeRuntimeState);
    route = inject(ActivatedRoute);
    splitResizerHandler = inject(SplitResizerHandler);
    isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    documentContent = signal(null);
    localTutorialZipUrl = signal(undefined);
    nextTutorialPath = signal(null);
    stepName = signal(null);
    tutorialName = signal(null);
    tutorialNavigationItems = signal([]);
    showNavigationDropdown = signal(false);
    shouldRenderContent = signal(false);
    shouldRenderEmbeddedEditor = signal(false);
    shouldRenderRevealAnswer = signal(false);
    restrictedMode = signal(false);
    nextStepPath;
    previousStepPath;
    embeddedEditorComponent;
    canRevealAnswer = signal(false);
    answerRevealed = signal(false);
    constructor() {
      this.route.data
        .pipe(
          filter(() =>
            Boolean(this.route?.routeConfig?.path?.startsWith(`${PAGE_PREFIX.TUTORIALS}/`)),
          ),
          takeUntilDestroyed(),
        )
        .subscribe((data) => {
          const docContent = data['docContent']?.contents ?? null;
          this.documentContent.set(docContent);
          this.setTutorialData(data);
        });
      const destroyRef = inject(DestroyRef);
      afterNextRender(() => {
        this.splitResizerHandler.init(
          this.elementRef,
          this.content(),
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
    toggleNavigationDropdown($event) {
      // Stop propagation required to avoid detecting click inside ClickOutside
      // directive.
      $event.stopPropagation();
      this.showNavigationDropdown.update((state) => !state);
    }
    hideNavigationDropdown() {
      this.showNavigationDropdown.set(false);
    }
    async handleRevealAnswer() {
      if (!this.canRevealAnswer()) return;
      this.embeddedTutorialManager.revealAnswer();
      const nodeRuntimeSandbox = await injectNodeRuntimeSandbox(this.environmentInjector);
      await Promise.all(
        Object.entries(this.embeddedTutorialManager.answerFiles()).map(([path, contents]) =>
          nodeRuntimeSandbox.writeFile(path, contents),
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
          nodeRuntimeSandbox.writeFile(path, contents),
        ),
      );
      this.answerRevealed.set(false);
    }
    /**
     * Set tutorial data based on current tutorial
     */
    async setTutorialData(tutorialNavigationItem) {
      this.showNavigationDropdown.set(false);
      this.answerRevealed.set(false);
      this.restrictedMode.set(tutorialNavigationItem.tutorialData.restrictedMode);
      this.setRouteData(tutorialNavigationItem);
      const {tutorialData: routeData} = tutorialNavigationItem;
      if (routeData.type === 'local' /* TutorialType.LOCAL */) {
        this.setLocalTutorialData(routeData);
      } else if (
        (routeData.type === 'editor' /* TutorialType.EDITOR */ ||
          routeData.type === 'cli') /* TutorialType.CLI */ &&
        this.isBrowser
      ) {
        await this.setEditorTutorialData(
          tutorialNavigationItem.path.replace(`${PAGE_PREFIX.TUTORIALS}/`, ''),
        );
      }
    }
    /**
     * Set tutorial data from route data
     */
    setRouteData(tutorialNavigationItem) {
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
      this.shouldRenderContent.set(routeData.type !== 'editor-only' /* TutorialType.EDITOR_ONLY */);
      this.nextStepPath = routeData.nextStep ? `/${routeData.nextStep}` : undefined;
      this.previousStepPath = routeData.previousStep ? `/${routeData.previousStep}` : undefined;
      this.nextTutorialPath.set(routeData.nextTutorial ? `/${routeData.nextTutorial}` : null);
    }
    /**
     * Set values for tutorials that do not use the embedded editor
     */
    setLocalTutorialData(routeData) {
      this.localTutorialZipUrl.set(routeData.sourceCodeZipPath);
      this.shouldRenderEmbeddedEditor.set(false);
      this.shouldRenderRevealAnswer.set(false);
    }
    /**
     * Set values for tutorials that use the embedded editor
     */
    async setEditorTutorialData(tutorialPath) {
      this.shouldRenderEmbeddedEditor.set(true);
      const currentTutorial = tutorialPath.replace(`${PAGE_PREFIX.TUTORIALS}/`, '');
      await this.embeddedTutorialManager.fetchAndSetTutorialFiles(currentTutorial);
      const hasAnswers = Object.keys(this.embeddedTutorialManager.answerFiles()).length > 0;
      this.shouldRenderRevealAnswer.set(hasAnswers);
      await this.loadEmbeddedEditor();
    }
    async loadEmbeddedEditor() {
      const nodeRuntimeSandbox = await injectNodeRuntimeSandbox(this.environmentInjector);
      this.canRevealAnswer = computed(() => this.nodeRuntimeState.loadingStep() > LoadingStep.BOOT);
      await nodeRuntimeSandbox.init();
    }
    async loadEmbeddedEditorComponent() {
      return await import('../../editor/index').then((c) => c.EmbeddedEditor);
    }
  };
  return (Tutorial = _classThis);
})();
export default Tutorial;
//# sourceMappingURL=tutorial.component.js.map
