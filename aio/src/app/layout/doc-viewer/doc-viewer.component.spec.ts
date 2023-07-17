import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';

import { Observable, asapScheduler, of, lastValueFrom } from 'rxjs';
import { EMPTY_HTML, htmlEscape } from 'safevalues';
import { htmlSafeByReview } from 'safevalues/restricted/reviewed';

import { FILE_NOT_FOUND_ID, FETCHING_ERROR_ID } from 'app/documents/document.service';
import { CustomElementsModule } from 'app/custom-elements/custom-elements.module';
import { ElementsLoader } from 'app/custom-elements/elements-loader';
import { Logger } from 'app/shared/logger.service';
import { fromOuterHTML } from 'app/shared/security';
import { TocService } from 'app/shared/toc.service';
import {
MockTitle, MockTocService, ObservableWithSubscriptionSpies,
TestDocViewerComponent, TestModule, TestParentComponent, MockElementsLoader
} from 'testing/doc-viewer-utils';
import { MockLogger } from 'testing/logger.service';
import { DocViewerComponent, NO_ANIMATIONS } from './doc-viewer.component';

describe('DocViewerComponent', () => {
  let parentFixture: ComponentFixture<TestParentComponent>;
  let parentComponent: TestParentComponent;
  let docViewerEl: HTMLElement;
  let docViewer: TestDocViewerComponent;

  const safeFlushAsapScheduler = () => asapScheduler.actions.length && asapScheduler.flush();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CustomElementsModule, TestModule],
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

  describe('#doc', () => {
    let renderSpy: jasmine.Spy;

    const setCurrentDoc = (newDoc: TestParentComponent['currentDoc']) => {
      parentComponent.currentDoc = newDoc;
      parentFixture.detectChanges();  // Run change detection to propagate the new doc to `DocViewer`.
      safeFlushAsapScheduler();  // Flush `asapScheduler` to trigger `DocViewer#render()`.
    };

    beforeEach(() => renderSpy = spyOn(docViewer, 'render').and.callFake(() => of(undefined)));

    it('should render the new document', () => {
      const contents = htmlEscape('foo');
      setCurrentDoc({contents, id: 'bar'});
      expect(renderSpy).toHaveBeenCalledTimes(1);
      expect(renderSpy.calls.mostRecent().args).toEqual([{id: 'bar', contents}]);

      setCurrentDoc({contents: null, id: 'baz'});
      expect(renderSpy).toHaveBeenCalledTimes(2);
      expect(renderSpy.calls.mostRecent().args).toEqual([{id: 'baz', contents: null}]);
    });

    it('should unsubscribe from the previous "render" observable upon new document', () => {
      const obs = new ObservableWithSubscriptionSpies();
      renderSpy.and.returnValue(obs);

      setCurrentDoc({contents: htmlEscape('foo'), id: 'bar'});
      expect(obs.subscribeSpy).toHaveBeenCalledTimes(1);
      expect(obs.unsubscribeSpies[0]).not.toHaveBeenCalled();

      setCurrentDoc({contents: htmlEscape('baz'), id: 'qux'});
      expect(obs.subscribeSpy).toHaveBeenCalledTimes(2);
      expect(obs.unsubscribeSpies[0]).toHaveBeenCalledTimes(1);
    });

    it('should ignore falsy document values', () => {
      setCurrentDoc(null);
      expect(renderSpy).not.toHaveBeenCalled();

      setCurrentDoc(undefined);
      expect(renderSpy).not.toHaveBeenCalled();
    });
  });

  describe('#ngOnDestroy()', () => {
    it('should stop responding to document changes', () => {
      const renderSpy = spyOn(docViewer, 'render').and.callFake(() => of(undefined));

      expect(renderSpy).not.toHaveBeenCalled();

      docViewer.doc = {contents: htmlEscape('Some content'), id: 'some-id'};
      safeFlushAsapScheduler();
      expect(renderSpy).toHaveBeenCalledTimes(1);

      docViewer.ngOnDestroy();

      docViewer.doc = {contents: htmlEscape('Other content'), id: 'other-id'};
      safeFlushAsapScheduler();
      expect(renderSpy).toHaveBeenCalledTimes(1);

      docViewer.doc = {contents: htmlEscape('More content'), id: 'more-id'};
      safeFlushAsapScheduler();
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('#prepareTitleAndToc()', () => {
    const EMPTY_DOC = '';
    const DOC_WITHOUT_H1 = 'Some content';
    const DOC_WITH_H1 = '<h1>Features</h1>Some content';
    const DOC_WITH_NO_TOC_H1 = '<h1 class="no-toc">Features</h1>Some content';
    const DOC_WITH_EMBEDDED_TOC = '<h1>Features</h1><aio-toc class="embedded"></aio-toc>Some content';
    const DOC_WITH_EMBEDDED_TOC_WITHOUT_H1 = '<aio-toc class="embedded"></aio-toc>Some content';
    const DOC_WITH_EMBEDDED_TOC_WITH_NO_TOC_H1 = '<aio-toc class="embedded"></aio-toc>Some content';
    const DOC_WITH_HIDDEN_H1_CONTENT = '<h1><i style="visibility: hidden">link</i>Features</h1>Some content';
    let titleService: MockTitle;
    let tocService: MockTocService;
    let targetEl: HTMLElement;

    const getTocEl = () => targetEl.querySelector('aio-toc');
    const doPrepareTitleAndToc = (contents: string, docId = '') => {
      targetEl.innerHTML = contents;
      return docViewer.prepareTitleAndToc(targetEl, docId);
    };
    const doAddTitleAndToc = (contents: string, docId = '') => {
      const addTitleAndToc = doPrepareTitleAndToc(contents, docId);
      return addTitleAndToc();
    };

    beforeEach(() => {
      titleService = TestBed.inject(Title) as unknown as MockTitle;
      tocService = TestBed.inject(TocService) as unknown as MockTocService;

      targetEl = document.createElement('div');
      document.body.appendChild(targetEl);  // Required for `innerText` to work as expected.
    });

    afterEach(() => document.body.removeChild(targetEl));

    it('should return a function for doing the actual work', () => {
      const addTitleAndToc = doPrepareTitleAndToc(DOC_WITH_H1);

      expect(getTocEl()).toBeTruthy();
      expect(titleService.setTitle).not.toHaveBeenCalled();
      expect(tocService.reset).not.toHaveBeenCalled();
      expect(tocService.genToc).not.toHaveBeenCalled();

      addTitleAndToc();

      expect(titleService.setTitle).toHaveBeenCalledTimes(1);
      expect(tocService.reset).toHaveBeenCalledTimes(1);
      expect(tocService.genToc).toHaveBeenCalledTimes(1);
    });

    describe('(title)', () => {
      it('should set the title if there is an `<h1>` heading', () => {
        doAddTitleAndToc(DOC_WITH_H1);
        expect(titleService.setTitle).toHaveBeenCalledWith('Angular - Features');
      });

      it('should set the title if there is a `.no-toc` `<h1>` heading', () => {
        doAddTitleAndToc(DOC_WITH_NO_TOC_H1);
        expect(titleService.setTitle).toHaveBeenCalledWith('Angular - Features');
      });

      it('should set the default title if there is no `<h1>` heading', () => {
        doAddTitleAndToc(DOC_WITHOUT_H1);
        expect(titleService.setTitle).toHaveBeenCalledWith('Angular');

        doAddTitleAndToc(EMPTY_DOC);
        expect(titleService.setTitle).toHaveBeenCalledWith('Angular');
      });

      it('should not include hidden content of the `<h1>` heading in the title', () => {
        doAddTitleAndToc(DOC_WITH_HIDDEN_H1_CONTENT);
        expect(titleService.setTitle).toHaveBeenCalledWith('Angular - Features');
      });

      it('should fall back to `textContent` if `innerText` is not available', () => {
        const querySelector = targetEl.querySelector;
        spyOn(targetEl, 'querySelector').and.callFake((selector: string) => {
          const elem = querySelector.call(targetEl, selector);
          return elem && Object.defineProperties(elem, {
            innerText: {value: undefined},
            textContent: {value: 'Text Content'},
          });
        });

        doAddTitleAndToc(DOC_WITH_HIDDEN_H1_CONTENT);

        expect(titleService.setTitle).toHaveBeenCalledWith('Angular - Text Content');
      });

      it('should still use `innerText` if available but empty', () => {
        const querySelector = targetEl.querySelector;
        spyOn(targetEl, 'querySelector').and.callFake((selector: string) => {
          const elem = querySelector.call(targetEl, selector);
          return elem && Object.defineProperties(elem, {
            innerText: { value: '' },
            textContent: { value: 'Text Content' }
          });
        });

        doAddTitleAndToc(DOC_WITH_HIDDEN_H1_CONTENT);

        expect(titleService.setTitle).toHaveBeenCalledWith('Angular');
      });
    });

    describe('(ToC)', () => {
      describe('needed', () => {
        it('should add an embedded ToC element if there is an `<h1>` heading', () => {
          doPrepareTitleAndToc(DOC_WITH_H1);
          const tocEl = getTocEl();

          expect(tocEl).toBeTruthy();
          expect(tocEl?.classList.contains('embedded')).toBe(true);
        });

        it('should not add a second ToC element if there a hard coded one in place', () => {
          doPrepareTitleAndToc(DOC_WITH_EMBEDDED_TOC);
          expect(targetEl.querySelectorAll('aio-toc').length).toEqual(1);
        });
      });


      describe('not needed', () => {
        it('should not add a ToC element if there is a `.no-toc` `<h1>` heading', () => {
          doPrepareTitleAndToc(DOC_WITH_NO_TOC_H1);
          expect(getTocEl()).toBeFalsy();
        });

        it('should not add a ToC element if there is no `<h1>` heading', () => {
          doPrepareTitleAndToc(DOC_WITHOUT_H1);
          expect(getTocEl()).toBeFalsy();

          doPrepareTitleAndToc(EMPTY_DOC);
          expect(getTocEl()).toBeFalsy();
        });

        it('should remove ToC a hard coded one', () => {
          doPrepareTitleAndToc(DOC_WITH_EMBEDDED_TOC_WITHOUT_H1);
          expect(getTocEl()).toBeFalsy();

          doPrepareTitleAndToc(DOC_WITH_EMBEDDED_TOC_WITH_NO_TOC_H1);
          expect(getTocEl()).toBeFalsy();
        });
      });


      it('should generate ToC entries if there is an `<h1>` heading', () => {
        doAddTitleAndToc(DOC_WITH_H1, 'foo');

        expect(tocService.genToc).toHaveBeenCalledTimes(1);
        expect(tocService.genToc).toHaveBeenCalledWith(targetEl, 'foo');
      });

      it('should not generate ToC entries if there is a `.no-toc` `<h1>` heading', () => {
        doAddTitleAndToc(DOC_WITH_NO_TOC_H1);
        expect(tocService.genToc).not.toHaveBeenCalled();
      });

      it('should not generate ToC entries if there is no `<h1>` heading', () => {
        doAddTitleAndToc(DOC_WITHOUT_H1);
        doAddTitleAndToc(EMPTY_DOC);

        expect(tocService.genToc).not.toHaveBeenCalled();
      });

      it('should always reset the ToC (before generating the new one)', () => {
        doAddTitleAndToc(DOC_WITH_H1, 'foo');
        expect(tocService.reset).toHaveBeenCalledTimes(1);
        expect(tocService.reset).toHaveBeenCalledBefore(tocService.genToc);
        expect(tocService.genToc).toHaveBeenCalledWith(targetEl, 'foo');

        tocService.genToc.calls.reset();

        doAddTitleAndToc(DOC_WITH_NO_TOC_H1, 'bar');
        expect(tocService.reset).toHaveBeenCalledTimes(2);
        expect(tocService.genToc).not.toHaveBeenCalled();

        doAddTitleAndToc(DOC_WITHOUT_H1, 'baz');
        expect(tocService.reset).toHaveBeenCalledTimes(3);
        expect(tocService.genToc).not.toHaveBeenCalled();

        doAddTitleAndToc(EMPTY_DOC, 'qux');
        expect(tocService.reset).toHaveBeenCalledTimes(4);
        expect(tocService.genToc).not.toHaveBeenCalled();
      });
    });
  });

  describe('#render()', () => {
    let prepareTitleAndTocSpy: jasmine.Spy;
    let swapViewsSpy: jasmine.Spy;
    let loadElementsSpy: jasmine.Spy;

    const doRender = (contents: TrustedHTML | null, id = 'foo') =>
      lastValueFrom(docViewer.render({contents, id}));

    beforeEach(() => {
      const elementsLoader = TestBed.inject(ElementsLoader) as Partial<ElementsLoader> as MockElementsLoader;
      loadElementsSpy = elementsLoader.loadContainedCustomElements.and.callFake(() => of(undefined));
      prepareTitleAndTocSpy = spyOn(docViewer, 'prepareTitleAndToc');
      swapViewsSpy = spyOn(docViewer, 'swapViews').and.callFake(() => of(undefined));
    });

    it('should return an `Observable`', () => {
      expect(docViewer.render({contents: EMPTY_HTML, id: ''})).toEqual(jasmine.any(Observable));
    });

    describe('(contents, title, ToC)', () => {
      beforeEach(() => swapViewsSpy.and.callThrough());

      it('should display the document contents', async () => {
        const contents = htmlSafeByReview('<h1>Hello,</h1> <div>world!</div>', 'constant HTML');
        await doRender(contents);

        expect(docViewerEl.innerHTML).toContain(contents.toString());
        expect(docViewerEl.textContent).toBe('Hello, world!');
      });

      it('should display nothing if the document has no contents', async () => {
        await doRender(htmlEscape('Test'));
        expect(docViewerEl.textContent).toBe('Test');

        await doRender(EMPTY_HTML);
        expect(docViewerEl.textContent).toBe('');

        docViewer.currViewContainer.innerHTML = 'Test';
        expect(docViewerEl.textContent).toBe('Test');

        await doRender(null);
        expect(docViewerEl.textContent).toBe('');
      });

      it('should prepare the title and ToC (before embedding components)', async () => {
        prepareTitleAndTocSpy.and.callFake((targetEl: HTMLElement, docId: string) => {
          expect(targetEl.innerHTML).toBe('Some content');
          expect(docId).toBe('foo');
        });

        await doRender(htmlEscape('Some content'), 'foo');

        expect(prepareTitleAndTocSpy).toHaveBeenCalledTimes(1);
        expect(prepareTitleAndTocSpy).toHaveBeenCalledBefore(loadElementsSpy);
      });

      it('should set the title and ToC (after the content has been set)', async () => {
        const addTitleAndTocSpy = jasmine.createSpy('addTitleAndToc');
        prepareTitleAndTocSpy.and.returnValue(addTitleAndTocSpy);

        addTitleAndTocSpy.and.callFake(() => expect(docViewerEl.textContent).toBe('Foo content'));
        await doRender(htmlEscape('Foo content'));
        expect(addTitleAndTocSpy).toHaveBeenCalledTimes(1);

        addTitleAndTocSpy.and.callFake(() => expect(docViewerEl.textContent).toBe('Bar content'));
        await doRender(htmlEscape('Bar content'));
        expect(addTitleAndTocSpy).toHaveBeenCalledTimes(2);

        addTitleAndTocSpy.and.callFake(() => expect(docViewerEl.textContent).toBe(''));
        await doRender(EMPTY_HTML);
        expect(addTitleAndTocSpy).toHaveBeenCalledTimes(3);

        addTitleAndTocSpy.and.callFake(() => expect(docViewerEl.textContent).toBe('Qux content'));
        await doRender(htmlEscape('Qux content'));
        expect(addTitleAndTocSpy).toHaveBeenCalledTimes(4);
      });

      it('should remove the "noindex" meta tag if the document is valid', async () => {
        await doRender(htmlEscape('foo'), 'bar');
        expect(TestBed.inject(Meta).removeTag).toHaveBeenCalledWith('name="robots"');
      });

      it('should add the "noindex" meta tag if the document is 404', async () => {
        await doRender(htmlEscape('missing'), FILE_NOT_FOUND_ID);
        expect(TestBed.inject(Meta).addTag).toHaveBeenCalledWith({ name: 'robots', content: 'noindex' });
      });

      it('should add a "noindex" meta tag if the document fetching fails', async () => {
        await doRender(htmlEscape('error'), FETCHING_ERROR_ID);
        expect(TestBed.inject(Meta).addTag).toHaveBeenCalledWith({ name: 'robots', content: 'noindex' });
      });
    });

    describe('(embedding components)', () => {
      it('should embed components', async () => {
        await doRender(htmlEscape('Some content'));
        expect(loadElementsSpy).toHaveBeenCalledTimes(1);
        expect(loadElementsSpy).toHaveBeenCalledWith(docViewer.nextViewContainer);
      });

      it('should attempt to embed components even if the document is empty', async () => {
        await doRender(EMPTY_HTML);
        await doRender(null);

        expect(loadElementsSpy).toHaveBeenCalledTimes(2);
        expect(loadElementsSpy.calls.argsFor(0)).toEqual([docViewer.nextViewContainer]);
        expect(loadElementsSpy.calls.argsFor(1)).toEqual([docViewer.nextViewContainer]);
      });

      it('should unsubscribe from the previous "embed" observable when unsubscribed from', () => {
        const obs = new ObservableWithSubscriptionSpies();
        loadElementsSpy.and.returnValue(obs);

        const renderObservable = docViewer.render({contents: htmlEscape('Some content'), id: 'foo'});
        const subscription = renderObservable.subscribe();

        expect(obs.subscribeSpy).toHaveBeenCalledTimes(1);
        expect(obs.unsubscribeSpies[0]).not.toHaveBeenCalled();

        subscription.unsubscribe();

        expect(obs.subscribeSpy).toHaveBeenCalledTimes(1);
        expect(obs.unsubscribeSpies[0]).toHaveBeenCalledTimes(1);
      });
    });

    describe('(swapping views)', () => {
      it('should still swap the views if the document is empty', async () => {
        await doRender(EMPTY_HTML);
        expect(swapViewsSpy).toHaveBeenCalledTimes(1);

        await doRender(null);
        expect(swapViewsSpy).toHaveBeenCalledTimes(2);
      });

      it('should pass the `addTitleAndToc` callback', async () => {
        const addTitleAndTocSpy = jasmine.createSpy('addTitleAndToc');
        prepareTitleAndTocSpy.and.returnValue(addTitleAndTocSpy);

        const el = document.createElement('div');
        await doRender(fromOuterHTML(el));

        expect(swapViewsSpy).toHaveBeenCalledWith(addTitleAndTocSpy);
      });

      it('should unsubscribe from the previous "swap" observable when unsubscribed from', () => {
        const obs = new ObservableWithSubscriptionSpies();
        swapViewsSpy.and.returnValue(obs);

        const renderObservable = docViewer.render({contents: htmlEscape('Hello, world!'), id: 'foo'});
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

      beforeEach(() => {
        logger = TestBed.inject(Logger) as unknown as MockLogger;
      });

      it('when `prepareTitleAndTocSpy()` fails', async () => {
        const error = Error('Typical `prepareTitleAndToc()` error');
        prepareTitleAndTocSpy.and.callFake(() => {
          expect(docViewer.nextViewContainer.innerHTML).not.toBe('');
          throw error;
        });

        await doRender(htmlEscape('Some content'), 'foo');

        expect(prepareTitleAndTocSpy).toHaveBeenCalledTimes(1);
        expect(swapViewsSpy).not.toHaveBeenCalled();
        expect(docViewer.nextViewContainer.innerHTML).toBe('');
        expect(logger.output.error).toEqual([
          [jasmine.any(Error)]
        ]);
        expect(logger.output.error[0][0].message).toEqual(`[DocViewer] Error preparing document 'foo': ${error.stack}`);
        expect(TestBed.inject(Meta).addTag).toHaveBeenCalledWith({ name: 'robots', content: 'noindex' });
      });

      it('when `EmbedComponentsService.embedInto()` fails', async () => {
        const error = Error('Typical `embedInto()` error');
        loadElementsSpy.and.callFake(() => {
          expect(docViewer.nextViewContainer.innerHTML).not.toBe('');
          throw error;
        });

        await doRender(htmlEscape('Some content'), 'bar');

        expect(prepareTitleAndTocSpy).toHaveBeenCalledTimes(1);
        expect(loadElementsSpy).toHaveBeenCalledTimes(1);
        expect(swapViewsSpy).not.toHaveBeenCalled();
        expect(docViewer.nextViewContainer.innerHTML).toBe('');
        expect(logger.output.error).toEqual([
          [jasmine.any(Error)]
        ]);
        expect(TestBed.inject(Meta).addTag).toHaveBeenCalledWith({ name: 'robots', content: 'noindex' });
      });

      it('when `swapViews()` fails', async () => {
        const error = Error('Typical `swapViews()` error');
        swapViewsSpy.and.callFake(() => {
          expect(docViewer.nextViewContainer.innerHTML).not.toBe('');
          throw error;
        });

        await doRender(htmlEscape('Some content'), 'qux');

        expect(prepareTitleAndTocSpy).toHaveBeenCalledTimes(1);
        expect(swapViewsSpy).toHaveBeenCalledTimes(1);
        expect(docViewer.nextViewContainer.innerHTML).toBe('');
        expect(logger.output.error).toEqual([
          [jasmine.any(Error)]
        ]);
        expect(logger.output.error[0][0].message).toEqual(`[DocViewer] Error preparing document 'qux': ${error.stack}`);
        expect(TestBed.inject(Meta).addTag).toHaveBeenCalledWith({ name: 'robots', content: 'noindex' });
      });

      it('when something fails with non-Error', async () => {
        const error = 'Typical string error';
        swapViewsSpy.and.callFake(() => {
          expect(docViewer.nextViewContainer.innerHTML).not.toBe('');
          throw error;
        });

        await doRender(htmlEscape('Some content'), 'qux');

        expect(swapViewsSpy).toHaveBeenCalledTimes(1);
        expect(docViewer.nextViewContainer.innerHTML).toBe('');
        expect(logger.output.error).toEqual([
          [jasmine.any(Error)]
        ]);
        expect(logger.output.error[0][0].message).toEqual(`[DocViewer] Error preparing document 'qux': ${error}`);
        expect(TestBed.inject(Meta).addTag).toHaveBeenCalledWith({ name: 'robots', content: 'noindex' });
      });
    });

    describe('(events)', () => {
      it('should emit `docReady` after loading elements', async () => {
        const onDocReadySpy = jasmine.createSpy('onDocReady');
        docViewer.docReady.subscribe(onDocReadySpy);

        await doRender(htmlEscape('Some content'));

        expect(onDocReadySpy).toHaveBeenCalledTimes(1);
        expect(loadElementsSpy).toHaveBeenCalledBefore(onDocReadySpy);
      });

      it('should emit `docReady` before swapping views', async () => {
        const onDocReadySpy = jasmine.createSpy('onDocReady');
        docViewer.docReady.subscribe(onDocReadySpy);

        await doRender(htmlEscape('Some content'));

        expect(onDocReadySpy).toHaveBeenCalledTimes(1);
        expect(onDocReadySpy).toHaveBeenCalledBefore(swapViewsSpy);
      });

      it('should emit `docRendered` after swapping views', async () => {
        const onDocRenderedSpy = jasmine.createSpy('onDocRendered');
        docViewer.docRendered.subscribe(onDocRenderedSpy);

        await doRender(htmlEscape('Some content'));

        expect(onDocRenderedSpy).toHaveBeenCalledTimes(1);
        expect(swapViewsSpy).toHaveBeenCalledBefore(onDocRenderedSpy);
      });
    });
  });

  describe('#swapViews()', () => {
    let oldCurrViewContainer: HTMLElement;
    let oldNextViewContainer: HTMLElement;

    const doSwapViews = (cb?: () => void) => lastValueFrom(docViewer.swapViews(cb));

    beforeEach(() => {
      oldCurrViewContainer = docViewer.currViewContainer;
      oldNextViewContainer = docViewer.nextViewContainer;

      oldCurrViewContainer.innerHTML = 'Current view';
      oldNextViewContainer.innerHTML = 'Next view';

      docViewerEl.appendChild(oldCurrViewContainer);

      expect(docViewerEl.contains(oldCurrViewContainer)).toBe(true);
      expect(docViewerEl.contains(oldNextViewContainer)).toBe(false);
    });

    [true, false].forEach(animationsEnabled => {
      describe(`(animations enabled: ${animationsEnabled})`, () => {
        beforeEach(() => docViewerEl.classList[animationsEnabled ? 'remove' : 'add'](NO_ANIMATIONS));

        it('should return an observable', done => {
          docViewer.swapViews().subscribe({ next: done, error: done.fail });
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

        it('should emit `docRemoved` after removing the leaving view', async () => {
          const onDocRemovedSpy = jasmine.createSpy('onDocRemoved').and.callFake(() => {
            expect(docViewerEl.contains(oldCurrViewContainer)).toBe(false);
            expect(docViewerEl.contains(oldNextViewContainer)).toBe(false);
          });

          docViewer.docRemoved.subscribe(onDocRemovedSpy);

          expect(docViewerEl.contains(oldCurrViewContainer)).toBe(true);
          expect(docViewerEl.contains(oldNextViewContainer)).toBe(false);

          await doSwapViews();

          expect(onDocRemovedSpy).toHaveBeenCalledTimes(1);
          expect(docViewerEl.contains(oldCurrViewContainer)).toBe(false);
          expect(docViewerEl.contains(oldNextViewContainer)).toBe(true);
        });

        it('should not emit `docRemoved` if the leaving view is already removed', async () => {
          const onDocRemovedSpy = jasmine.createSpy('onDocRemoved');

          docViewer.docRemoved.subscribe(onDocRemovedSpy);
          docViewerEl.removeChild(oldCurrViewContainer);

          await doSwapViews();

          expect(onDocRemovedSpy).not.toHaveBeenCalled();
        });

        it('should emit `docInserted` after inserting the entering view', async () => {
          const onDocInsertedSpy = jasmine.createSpy('onDocInserted').and.callFake(() => {
            expect(docViewerEl.contains(oldCurrViewContainer)).toBe(false);
            expect(docViewerEl.contains(oldNextViewContainer)).toBe(true);
          });

          docViewer.docInserted.subscribe(onDocInsertedSpy);

          expect(docViewerEl.contains(oldCurrViewContainer)).toBe(true);
          expect(docViewerEl.contains(oldNextViewContainer)).toBe(false);

          await doSwapViews();

          expect(onDocInsertedSpy).toHaveBeenCalledTimes(1);
          expect(docViewerEl.contains(oldCurrViewContainer)).toBe(false);
          expect(docViewerEl.contains(oldNextViewContainer)).toBe(true);
        });

        it('should call the callback after inserting the entering view', async () => {
          const onInsertedCb = jasmine.createSpy('onInsertedCb').and.callFake(() => {
            expect(docViewerEl.contains(oldCurrViewContainer)).toBe(false);
            expect(docViewerEl.contains(oldNextViewContainer)).toBe(true);
          });
          const onDocInsertedSpy = jasmine.createSpy('onDocInserted');

          docViewer.docInserted.subscribe(onDocInsertedSpy);

          expect(docViewerEl.contains(oldCurrViewContainer)).toBe(true);
          expect(docViewerEl.contains(oldNextViewContainer)).toBe(false);

          await doSwapViews(onInsertedCb);

          expect(onInsertedCb).toHaveBeenCalledTimes(1);
          expect(onInsertedCb).toHaveBeenCalledBefore(onDocInsertedSpy);
          expect(docViewerEl.contains(oldCurrViewContainer)).toBe(false);
          expect(docViewerEl.contains(oldNextViewContainer)).toBe(true);
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
          // Only test this when there are animations. Without animations, the views are swapped
          // synchronously, so there is no need (or way) to abort.
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
        } else {
          it('should swap views synchronously when animations are disabled', () => {
            const cbSpy = jasmine.createSpy('cb');

            docViewer.swapViews(cbSpy).subscribe();

            expect(cbSpy).toHaveBeenCalledTimes(1);
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
