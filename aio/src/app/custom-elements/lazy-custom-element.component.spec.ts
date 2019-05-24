import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Logger } from 'app/shared/logger.service';
import { MockLogger } from 'testing/logger.service';
import { LazyCustomElementComponent } from './lazy-custom-element.component';
import { ElementsLoader } from './elements-loader';

describe('LazyCustomElementComponent', () => {
  let mockElementsLoader: jasmine.SpyObj<ElementsLoader>;
  let mockLogger: MockLogger;
  let fixture: ComponentFixture<LazyCustomElementComponent>;

  beforeEach(() => {
    mockElementsLoader = jasmine.createSpyObj<ElementsLoader>('ElementsLoader', [
      'loadContainedCustomElements',
      'loadCustomElement',
    ]);

    const injector = TestBed.configureTestingModule({
      declarations: [ LazyCustomElementComponent ],
      providers: [
        { provide: ElementsLoader, useValue: mockElementsLoader },
        { provide: Logger, useClass: MockLogger },
      ],
    });

    mockLogger = injector.get(Logger);
    fixture = TestBed.createComponent(LazyCustomElementComponent);
  });

  it('should set the HTML content based on the selector', () => {
    const elem = fixture.nativeElement;

    expect(elem.innerHTML).toBe('');

    fixture.componentInstance.selector = 'foo-bar';
    fixture.detectChanges();

    expect(elem.innerHTML).toBe('<foo-bar></foo-bar>');
  });

  it('should load the specified custom element', () => {
    expect(mockElementsLoader.loadCustomElement).not.toHaveBeenCalled();

    fixture.componentInstance.selector = 'foo-bar';
    fixture.detectChanges();

    expect(mockElementsLoader.loadCustomElement).toHaveBeenCalledWith('foo-bar');
  });

  it('should log an error (and abort) if the selector is empty', () => {
    fixture.detectChanges();

    expect(mockElementsLoader.loadCustomElement).not.toHaveBeenCalled();
    expect(mockLogger.output.error).toEqual([[jasmine.any(Error)]]);
    expect(mockLogger.output.error[0][0].message).toBe('Invalid selector for \'aio-lazy-ce\': ');
  });

  it('should log an error (and abort) if the selector is invalid', () => {
    fixture.componentInstance.selector = 'foo-bar><script></script><foo-bar';
    fixture.detectChanges();

    expect(mockElementsLoader.loadCustomElement).not.toHaveBeenCalled();
    expect(mockLogger.output.error).toEqual([[jasmine.any(Error)]]);
    expect(mockLogger.output.error[0][0].message).toBe(
        'Invalid selector for \'aio-lazy-ce\': foo-bar><script></script><foo-bar');
  });
});
