import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';

import { EmbedComponentsService } from 'app/embed-components/embed-components.service';
import { Logger } from 'app/shared/logger.service';
import { TocService } from 'app/shared/toc.service';
import {
  MockEmbedComponentsService, MockTitle, MockTocService, ObservableWithSubscriptionSpies,
  TestDocViewerComponent, TestModule, TestParentComponent
} from 'testing/doc-viewer-utils';
import { MockLogger } from 'testing/logger.service';
import { DocViewerComponent } from './doc-viewer.component';


describe('DocViewerComponent', () => {
  let parentFixture: ComponentFixture<TestParentComponent>;
  let parentComponent: TestParentComponent;
  let docViewerEl: HTMLElement;
  let docViewer: TestDocViewerComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestModule]
    });

    parentFixture = TestBed.createComponent(TestParentComponent);
    parentComponent = parentFixture.componentInstance;

    parentFixture.detectChanges();

    docViewerEl = parentFixture.debugElement.children[0].nativeElement;
    docViewer = parentComponent.docViewer as any;
  });

  it('should create a `DocViewer`', () => {
    expect(docViewer).toEqual(jasmine.any(DocViewerComponent));
  });

  describe('#doc / #docRendered', () => {
    let destroyEmbeddedComponentsSpy: jasmine.Spy;
    let renderSpy: jasmine.Spy;

    const setCurrentDoc = (contents, id = 'fizz/buzz') => {
      parentComponent.currentDoc = {contents, id};
      parentFixture.detectChanges();
    };

    beforeEach(() => {
      destroyEmbeddedComponentsSpy = spyOn(docViewer, 'destroyEmbeddedComponents');
      renderSpy = spyOn(docViewer, 'render').and.returnValue([null]);
    });

    it('should render the new document', () => {
      setCurrentDoc('foo', 'bar');
      expect(renderSpy).toHaveBeenCalledTimes(1);
      expect(renderSpy.calls.mostRecent().args).toEqual([{id: 'bar', contents: 'foo'}]);

      setCurrentDoc(null, 'baz');
      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy.calls.mostRecent().args).toEqual([{id: 'baz', contents: null}]);
    });

    it('should destroy the currently active components (before rendering the new document)', () => {
      setCurrentDoc('foo');
      expect(destroyEmbeddedComponentsSpy).toHaveBeenCalledTimes(1);
      expect(destroyEmbeddedComponentsSpy).toHaveBeenCalledBefore(renderSpy);

      destroyEmbeddedComponentsSpy.calls.reset();
      renderSpy.calls.reset();

      setCurrentDoc(null);
      expect(destroyEmbeddedComponentsSpy).toHaveBeenCalledTimes(1);
      expect(destroyEmbeddedComponentsSpy).toHaveBeenCalledBefore(renderSpy);
    });

    it('should emit `docRendered` after the new document has been rendered', done => {
      let completeRender: () => void;
      renderSpy.and.returnValue(new Promise(resolve => completeRender = resolve));
      docViewer.docRendered.subscribe(done);

      setCurrentDoc('foo');
      expect(renderSpy).toHaveBeenCalledTimes(1);

      completeRender();
    });

    it('should unsubscribe from the previous "render" observable upon new document', () => {
      const obs = new ObservableWithSubscriptionSpies();
      renderSpy.and.returnValue(obs);

      setCurrentDoc('foo', 'bar');
      expect(obs.subscribeSpy).toHaveBeenCalledTimes(1);
      expect(obs.unsubscribeSpies[0]).not.toHaveBeenCalled();

      setCurrentDoc('baz', 'qux');
      expect(obs.subscribeSpy).toHaveBeenCalledTimes(2);
      expect(obs.unsubscribeSpies[0]).toHaveBeenCalledTimes(1);
    });

    it('should ignore falsy document values', () => {
      const onDocRenderedSpy = jasmine.createSpy('onDocRendered');
      docViewer.docRendered.subscribe(onDocRenderedSpy);

      parentComponent.currentDoc = null;
      parentFixture.detectChanges();

      expect(destroyEmbeddedComponentsSpy).not.toHaveBeenCalled();
      expect(renderSpy).not.toHaveBeenCalled();
      expect(onDocRenderedSpy).not.toHaveBeenCalled();

      parentComponent.currentDoc = undefined;
      parentFixture.detectChanges();

      expect(destroyEmbeddedComponentsSpy).not.toHaveBeenCalled();
      expect(renderSpy).not.toHaveBeenCalled();
      expect(onDocRenderedSpy).not.toHaveBeenCalled();
    });
  });

  describe('#ngDoCheck()', () => {
    let componentInstances: ComponentRef<any>[];

    beforeEach(() => {
      componentInstances = [
        {changeDetectorRef: {detectChanges: jasmine.createSpy('detectChanges')}},
        {changeDetectorRef: {detectChanges: jasmine.createSpy('detectChanges')}},
        {changeDetectorRef: {detectChanges: jasmine.createSpy('detectChanges')}},
      ] as any;
      docViewer.embeddedComponentRefs.push(...componentInstances);
    });

    afterEach(() => {
      // Clean up the fake component instances, to avoid error in `ngOnDestroy()`.
      docViewer.embeddedComponentRefs = [];
    });

    it('should detect changes on each active component instance', () => {
      parentFixture.detectChanges();
      componentInstances.forEach(({changeDetectorRef: cd}) => {
        expect(cd.detectChanges).toHaveBeenCalledTimes(1);
      });

      parentFixture.detectChanges();
      componentInstances.forEach(({changeDetectorRef: cd}) => {
        expect(cd.detectChanges).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('#ngOnDestroy()', () => {
    it('should destroy the active embedded component instances', () => {
      const destroyEmbeddedComponentsSpy = spyOn(docViewer, 'destroyEmbeddedComponents');
      docViewer.ngOnDestroy();

      expect(destroyEmbeddedComponentsSpy).toHaveBeenCalledTimes(1);
    });

    it('should stop responding to document changes', () => {
      const destroyEmbeddedComponentsSpy = spyOn(docViewer, 'destroyEmbeddedComponents');
      const renderSpy = spyOn(docViewer, 'render').and.returnValue([undefined]);
      const onDocRenderedSpy = jasmine.createSpy('onDocRendered');
      docViewer.docRendered.subscribe(onDocRenderedSpy);

      expect(destroyEmbeddedComponentsSpy).not.toHaveBeenCalled();
      expect(renderSpy).not.toHaveBeenCalled();
      expect(onDocRenderedSpy).not.toHaveBeenCalled();

      docViewer.doc = {contents: 'Some content', id: 'some-id'};
      expect(destroyEmbeddedComponentsSpy).toHaveBeenCalledTimes(1);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      expect(onDocRenderedSpy).toHaveBeenCalledTimes(1);

      docViewer.ngOnDestroy();  // Also calls `destroyEmbeddedComponents()`.

      docViewer.doc = {contents: 'Other content', id: 'other-id'};
      expect(destroyEmbeddedComponentsSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      expect(onDocRenderedSpy).toHaveBeenCalledTimes(1);

      docViewer.doc = {contents: 'More content', id: 'more-id'};
      expect(destroyEmbeddedComponentsSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy).toHaveBeenCalledTimes(1);
      expect(onDocRenderedSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('#addTitleAndToc()', () => {
    const EMPTY_DOC = '';
    const DOC_WITHOUT_H1 = 'Some content';
    const DOC_WITH_H1 = '<h1>Features</h1>Some content';
    const DOC_WITH_NO_TOC_H1 = '<h1 class="no-toc">Features</h1>Some content';
    const DOC_WITH_HIDDEN_H1_CONTENT = '<h1><i style="visibility: hidden">link</i>Features</h1>Some content';

    const tryDoc = (contents: string, docId = '') => {
      docViewer.currViewContainer.innerHTML = contents;
      docViewer.addTitleAndToc(docId);
    };

    describe('(title)', () => {
      let titleService: MockTitle;

      beforeEach(() => titleService = TestBed.get(Title));

      it('should set the title if there is an `<h1>` heading', () => {
        tryDoc(DOC_WITH_H1);
        expect(titleService.setTitle).toHaveBeenCalledWith('Angular - Features');
      });

      it('should set the title if there is a `.no-toc` `<h1>` heading', () => {
        tryDoc(DOC_WITH_NO_TOC_H1);
        expect(titleService.setTitle).toHaveBeenCalledWith('Angular - Features');
      });

      it('should set the default title if there is no `<h1>` heading', () => {
        tryDoc(DOC_WITHOUT_H1);
        expect(titleService.setTitle).toHaveBeenCalledWith('Angular');

        tryDoc(EMPTY_DOC);
        expect(titleService.setTitle).toHaveBeenCalledWith('Angular');
      });

      it('should not include hidden content of the `<h1>` heading in the title', () => {
        tryDoc(DOC_WITH_HIDDEN_H1_CONTENT);
        expect(titleService.setTitle).toHaveBeenCalledWith('Angular - Features');
      });

      it('should fall back to `textContent` if `innerText` is not available', () => {
        const viewContainer = docViewer.currViewContainer;
        const querySelector_ = viewContainer.querySelector;
        spyOn(viewContainer, 'querySelector').and.callFake((selector: string) => {
          const elem = querySelector_.call(viewContainer, selector);
          return Object.defineProperties(elem, {
            innerText: {value: undefined},
            textContent: {value: 'Text Content'},
          });
        });

        tryDoc(DOC_WITH_HIDDEN_H1_CONTENT);

        expect(titleService.setTitle).toHaveBeenCalledWith('Angular - Text Content');
      });

      it('should still use `innerText` if available but empty', () => {
        const viewContainer = docViewer.currViewContainer;
        const querySelector_ = viewContainer.querySelector;
        spyOn(viewContainer, 'querySelector').and.callFake((selector: string) => {
          const elem = querySelector_.call(viewContainer, selector);
          return Object.defineProperties(elem, {
            innerText: { value: '' },
            textContent: { value: 'Text Content' }
          });
        });

        tryDoc(DOC_WITH_HIDDEN_H1_CONTENT);

        expect(titleService.setTitle).toHaveBeenCalledWith('Angular');
      });
    });

    describe('(ToC)', () => {
      let tocService: MockTocService;

      const getTocEl = () => docViewerEl.querySelector('aio-toc');

      beforeEach(() => tocService = TestBed.get(TocService));

      it('should have an (embedded) ToC if there is an `<h1>` heading', () => {
        tryDoc(DOC_WITH_H1, 'foo');
        const tocEl = getTocEl()!;

        expect(tocEl).toBeTruthy();
        expect(tocEl.classList.contains('embedded')).toBe(true);
        expect(tocService.genToc).toHaveBeenCalledTimes(1);
        expect(tocService.genToc).toHaveBeenCalledWith(docViewer.currViewContainer, 'foo');
      });

      it('should have no ToC if there is a `.no-toc` `<h1>` heading', () => {
        tryDoc(DOC_WITH_NO_TOC_H1);

        expect(getTocEl()).toBeFalsy();
        expect(tocService.genToc).not.toHaveBeenCalled();
      });

      it('should have no ToC if there is no `<h1>` heading', () => {
        tryDoc(DOC_WITHOUT_H1);
        expect(getTocEl()).toBeFalsy();

        tryDoc(EMPTY_DOC);
        expect(getTocEl()).toBeFalsy();

        expect(tocService.genToc).not.toHaveBeenCalled();
      });

      it('should always reset the ToC (before generating the new one)', () => {
        expect(tocService.reset).not.toHaveBeenCalled();
        expect(tocService.genToc).not.toHaveBeenCalled();

        tocService.genToc.calls.reset();
        tryDoc(DOC_WITH_H1, 'foo');
        expect(tocService.reset).toHaveBeenCalledTimes(1);
        expect(tocService.reset).toHaveBeenCalledBefore(tocService.genToc);
        expect(tocService.genToc).toHaveBeenCalledWith(docViewer.currViewContainer, 'foo');

        tocService.genToc.calls.reset();
        tryDoc(DOC_WITH_NO_TOC_H1, 'bar');
        expect(tocService.reset).toHaveBeenCalledTimes(2);
        expect(tocService.genToc).not.toHaveBeenCalled();

        tocService.genToc.calls.reset();
        tryDoc(DOC_WITHOUT_H1, 'baz');
        expect(tocService.reset).toHaveBeenCalledTimes(3);
        expect(tocService.genToc).not.toHaveBeenCalled();

        tocService.genToc.calls.reset();
        tryDoc(EMPTY_DOC, 'qux');
        expect(tocService.reset).toHaveBeenCalledTimes(4);
        expect(tocService.genToc).not.toHaveBeenCalled();
      });
    });
  });

  describe('#destroyEmbeddedComponents()', () => {
    let componentInstances: ComponentRef<any>[];

    beforeEach(() => {
      componentInstances = [
        {destroy: jasmine.createSpy('destroy#1')},
        {destroy: jasmine.createSpy('destroy#2')},
        {destroy: jasmine.createSpy('destroy#3')},
      ] as any;
      docViewer.embeddedComponentRefs.push(...componentInstances);
    });

    it('should destroy each active component instance', () => {
      docViewer.destroyEmbeddedComponents();

      expect(componentInstances.length).toBe(3);
      componentInstances.forEach(comp => expect(comp.destroy).toHaveBeenCalledTimes(1));
    });

    it('should clear the list of active component instances', () => {
      expect(docViewer.embeddedComponentRefs.length).toBeGreaterThan(0);

      docViewer.destroyEmbeddedComponents();
      expect(docViewer.embeddedComponentRefs.length).toBe(0);
    });
  });

  describe('#render()', () => {
    let addTitleAndTocSpy: jasmine.Spy;
    let embedIntoSpy: jasmine.Spy;
    let swapViewsSpy: jasmine.Spy;

    const doRender = (contents: string | null, id = 'foo') =>
      new Promise<void>((resolve, reject) =>
        docViewer.render({contents, id}).subscribe(resolve, reject));

    beforeEach(() => {
      const embedComponentsService = TestBed.get(EmbedComponentsService) as MockEmbedComponentsService;

      addTitleAndTocSpy = spyOn(docViewer, 'addTitleAndToc');
      embedIntoSpy = embedComponentsService.embedInto.and.returnValue(of([]));
      swapViewsSpy = spyOn(docViewer, 'swapViews').and.returnValue(of(undefined));
    });

    it('should return an `Observable`', () => {
      expect(docViewer.render({contents: '', id: ''})).toEqual(jasmine.any(Observable));
    });

    describe('(contents, title, ToC)', () => {
      beforeEach(() => swapViewsSpy.and.callThrough());

      it('should display the document contents', async () => {
        const contents = '<h1>Hello,</h1> <div>world!</div>';
        await doRender(contents);

        expect(docViewerEl.innerHTML).toContain(contents);
        expect(docViewerEl.textContent).toBe('Hello, world!');
      });

      it('should display nothing if the document has no contents', async () => {
        docViewer.currViewContainer.innerHTML = 'Test';
        expect(docViewerEl.textContent).toBe('Test');

        await doRender('');
        expect(docViewerEl.textContent).toBe('');

        docViewer.currViewContainer.innerHTML = 'Test';
        expect(docViewerEl.textContent).toBe('Test');

        await doRender(null);
        expect(docViewerEl.textContent).toBe('');
      });

      it('should set the title and ToC (after the content has been set)', async () => {
        addTitleAndTocSpy.and.callFake(() => expect(docViewerEl.textContent).toBe('Foo content'));
        await doRender('Foo content', 'foo');
        expect(addTitleAndTocSpy).toHaveBeenCalledTimes(1);
        expect(addTitleAndTocSpy).toHaveBeenCalledWith('foo');

        addTitleAndTocSpy.and.callFake(() => expect(docViewerEl.textContent).toBe('Bar content'));
        await doRender('Bar content', 'bar');
        expect(addTitleAndTocSpy).toHaveBeenCalledTimes(2);
        expect(addTitleAndTocSpy).toHaveBeenCalledWith('bar');

        addTitleAndTocSpy.and.callFake(() => expect(docViewerEl.textContent).toBe(''));
        await doRender('', 'baz');
        expect(addTitleAndTocSpy).toHaveBeenCalledTimes(3);
        expect(addTitleAndTocSpy).toHaveBeenCalledWith('baz');

        addTitleAndTocSpy.and.callFake(() => expect(docViewerEl.textContent).toBe('Qux content'));
        await doRender('Qux content', 'qux');
        expect(addTitleAndTocSpy).toHaveBeenCalledTimes(4);
        expect(addTitleAndTocSpy).toHaveBeenCalledWith('qux');
      });
    });

    describe('(embedding components)', () => {
      it('should embed components', async () => {
        await doRender('Some content');
        expect(embedIntoSpy).toHaveBeenCalledTimes(1);
        expect(embedIntoSpy).toHaveBeenCalledWith(docViewer.nextViewContainer);
      });

      it('should attempt to embed components even if the document is empty', async () => {
        await doRender('');
        await doRender(null);

        expect(embedIntoSpy).toHaveBeenCalledTimes(2);
        expect(embedIntoSpy.calls.argsFor(0)).toEqual([docViewer.nextViewContainer]);
        expect(embedIntoSpy.calls.argsFor(1)).toEqual([docViewer.nextViewContainer]);
      });

      it('should store the embedded components', async () => {
        const embeddedComponents = [];
        embedIntoSpy.and.returnValue(of(embeddedComponents));

        await doRender('Some content');

        expect(docViewer.embeddedComponentRefs).toBe(embeddedComponents);
      });

      it('should unsubscribe from the previous "embed" observable when unsubscribed from', () => {
        const obs = new ObservableWithSubscriptionSpies();
        embedIntoSpy.and.returnValue(obs);

        const renderObservable = docViewer.render({contents: 'Some content', id: 'foo'});
        const subscription = renderObservable.subscribe();

        expect(obs.subscribeSpy).toHaveBeenCalledTimes(1);
        expect(obs.unsubscribeSpies[0]).not.toHaveBeenCalled();

        subscription.unsubscribe();

        expect(obs.subscribeSpy).toHaveBeenCalledTimes(1);
        expect(obs.unsubscribeSpies[0]).toHaveBeenCalledTimes(1);
      });
    });

    describe('(swapping views)', () => {
      it('should swap the views after creating embedded components', async () => {
        await doRender('<div></div>');

        expect(swapViewsSpy).toHaveBeenCalledTimes(1);
        expect(embedIntoSpy).toHaveBeenCalledBefore(swapViewsSpy);
      });

      it('should still swap the views if the document is empty', async () => {
        await doRender('');
        expect(swapViewsSpy).toHaveBeenCalledTimes(1);

        await doRender(null);
        expect(swapViewsSpy).toHaveBeenCalledTimes(2);
      });

      it('should unsubscribe from the previous "swap" observable when unsubscribed from', () => {
        const obs = new ObservableWithSubscriptionSpies();
        swapViewsSpy.and.returnValue(obs);

        const renderObservable = docViewer.render({contents: 'Hello, world!', id: 'foo'});
        const subscription = renderObservable.subscribe();

        expect(obs.subscribeSpy).toHaveBeenCalledTimes(1);
        expect(obs.unsubscribeSpies[0]).not.toHaveBeenCalled();

        subscription.unsubscribe();

        expect(obs.subscribeSpy).toHaveBeenCalledTimes(1);
        expect(obs.unsubscribeSpies[0]).toHaveBeenCalledTimes(1);
      });
    });

    describe('(on error) should clean up, log the error and recover', () => {
      let logger: MockLogger;

      beforeEach(() => logger = TestBed.get(Logger));

      it('when `EmbedComponentsService.embedInto()` fails', async () => {
        const error = Error('Typical `embedInto()` error');
        embedIntoSpy.and.callFake(() => {
          expect(docViewer.nextViewContainer.innerHTML).not.toBe('');
          throw error;
        });

        await doRender('Some content', 'foo');

        expect(embedIntoSpy).toHaveBeenCalledTimes(1);
        expect(swapViewsSpy).not.toHaveBeenCalled();
        expect(addTitleAndTocSpy).not.toHaveBeenCalled();
        expect(docViewer.nextViewContainer.innerHTML).toBe('');
        expect(logger.output.error).toEqual([
          ['[DocViewer]: Error preparing document \'foo\'.', error],
        ]);
      });

      it('when `swapViews()` fails', async () => {
        const error = Error('Typical `swapViews()` error');
        swapViewsSpy.and.callFake(() => {
          expect(docViewer.nextViewContainer.innerHTML).not.toBe('');
          throw error;
        });

        await doRender('Some content', 'bar');

        expect(embedIntoSpy).toHaveBeenCalledTimes(1);
        expect(swapViewsSpy).toHaveBeenCalledTimes(1);
        expect(addTitleAndTocSpy).not.toHaveBeenCalled();
        expect(docViewer.nextViewContainer.innerHTML).toBe('');
        expect(logger.output.error).toEqual([
          ['[DocViewer]: Error preparing document \'bar\'.', error],
        ]);
      });

      it('when `addTitleAndTocSpy()` fails', async () => {
        const error = Error('Typical `addTitleAndToc()` error');
        addTitleAndTocSpy.and.callFake(() => {
          expect(docViewer.nextViewContainer.innerHTML).not.toBe('');
          throw error;
        });

        await doRender('Some content', 'baz');

        expect(embedIntoSpy).toHaveBeenCalledTimes(1);
        expect(swapViewsSpy).toHaveBeenCalledTimes(1);
        expect(addTitleAndTocSpy).toHaveBeenCalledTimes(1);
        expect(docViewer.nextViewContainer.innerHTML).toBe('');
        expect(logger.output.error).toEqual([
          ['[DocViewer]: Error preparing document \'baz\'.', error],
        ]);
      });
    });
  });

  describe('#swapViews()', () => {
    let oldCurrViewContainer: HTMLElement;
    let oldNextViewContainer: HTMLElement;

    const doSwapViews = () => new Promise<void>((resolve, reject) =>
      docViewer.swapViews().subscribe(resolve, reject));

    beforeEach(() => {
      oldCurrViewContainer = docViewer.currViewContainer;
      oldNextViewContainer = docViewer.nextViewContainer;

      oldCurrViewContainer.innerHTML = 'Current view';
      oldNextViewContainer.innerHTML = 'Next view';

      expect(docViewerEl.contains(oldCurrViewContainer)).toBe(true);
      expect(docViewerEl.contains(oldNextViewContainer)).toBe(false);
    });

    [true, false].forEach(animationsEnabled => {
      describe(`(animationsEnabled: ${animationsEnabled})`, () => {
        beforeEach(() => DocViewerComponent.animationsEnabled = animationsEnabled);
        afterEach(() => DocViewerComponent.animationsEnabled = true);

        it('should return an observable', done => {
          docViewer.swapViews().subscribe(done, done.fail);
        });

        it('should swap the views', async () => {
          await doSwapViews();

          expect(docViewerEl.contains(oldCurrViewContainer)).toBe(false);
          expect(docViewerEl.contains(oldNextViewContainer)).toBe(true);
          expect(docViewer.currViewContainer).toBe(oldNextViewContainer);
          expect(docViewer.nextViewContainer).toBe(oldCurrViewContainer);

          await doSwapViews();

          expect(docViewerEl.contains(oldCurrViewContainer)).toBe(true);
          expect(docViewerEl.contains(oldNextViewContainer)).toBe(false);
          expect(docViewer.currViewContainer).toBe(oldCurrViewContainer);
          expect(docViewer.nextViewContainer).toBe(oldNextViewContainer);
        });

        it('should empty the previous view', async () => {
          await doSwapViews();

          expect(docViewer.currViewContainer.innerHTML).toBe('Next view');
          expect(docViewer.nextViewContainer.innerHTML).toBe('');

          docViewer.nextViewContainer.innerHTML = 'Next view 2';
          await doSwapViews();

          expect(docViewer.currViewContainer.innerHTML).toBe('Next view 2');
          expect(docViewer.nextViewContainer.innerHTML).toBe('');
        });

        if (animationsEnabled) {
          // Without animations, the views are swapped synchronously,
          // so there is no need (or way) to abort.
          it('should abort swapping if the returned observable is unsubscribed from', async () => {
            docViewer.swapViews().subscribe().unsubscribe();
            await doSwapViews();

            // Since the first call was cancelled, only one swapping should have taken place.
            expect(docViewerEl.contains(oldCurrViewContainer)).toBe(false);
            expect(docViewerEl.contains(oldNextViewContainer)).toBe(true);
            expect(docViewer.currViewContainer).toBe(oldNextViewContainer);
            expect(docViewer.nextViewContainer).toBe(oldCurrViewContainer);
            expect(docViewer.currViewContainer.innerHTML).toBe('Next view');
            expect(docViewer.nextViewContainer.innerHTML).toBe('');
          });
        }
      });
    });
  });
});
