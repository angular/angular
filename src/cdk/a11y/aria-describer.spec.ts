import {A11yModule, CDK_DESCRIBEDBY_HOST_ATTRIBUTE} from './index';
import {AriaDescriber, MESSAGES_CONTAINER_ID} from './aria-describer';
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ElementRef, ViewChild} from '@angular/core';

describe('AriaDescriber', () => {
  let ariaDescriber: AriaDescriber;
  let component: TestApp;
  let fixture: ComponentFixture<TestApp>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [A11yModule],
      declarations: [TestApp],
      providers: [AriaDescriber],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestApp);
    component = fixture.componentInstance;
    ariaDescriber = component.ariaDescriber;
  });

  afterEach(() => {
    ariaDescriber.ngOnDestroy();
  });

  it('should initialize without the message container', () => {
    expect(getMessagesContainer()).toBeNull();
  });

  it('should be able to create a message element', () => {
    ariaDescriber.describe(component.element1, 'My Message');
    expectMessages(['My Message']);
  });

  it('should not register empty strings', () => {
    ariaDescriber.describe(component.element1, '');
    expect(getMessageElements()).toBe(null);
  });

  it('should de-dupe a message registered multiple times', () => {
    ariaDescriber.describe(component.element1, 'My Message');
    ariaDescriber.describe(component.element2, 'My Message');
    ariaDescriber.describe(component.element3, 'My Message');
    expectMessages(['My Message']);
    expectMessage(component.element1, 'My Message');
    expectMessage(component.element2, 'My Message');
    expectMessage(component.element3, 'My Message');
  });

  it('should be able to register multiple messages', () => {
    ariaDescriber.describe(component.element1, 'First Message');
    ariaDescriber.describe(component.element2, 'Second Message');
    expectMessages(['First Message', 'Second Message']);
    expectMessage(component.element1, 'First Message');
    expectMessage(component.element2, 'Second Message');
  });

  it('should be able to unregister messages', () => {
    ariaDescriber.describe(component.element1, 'My Message');
    expectMessages(['My Message']);

    // Register again to check dedupe
    ariaDescriber.describe(component.element2, 'My Message');
    expectMessages(['My Message']);

    // Unregister one message and make sure the message is still present in the container
    ariaDescriber.removeDescription(component.element1, 'My Message');
    expect(component.element1.hasAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE)).toBeFalsy();
    expectMessages(['My Message']);

    // Unregister the second message, message container should be gone
    ariaDescriber.removeDescription(component.element2, 'My Message');
    expect(component.element2.hasAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE)).toBeFalsy();
    expect(getMessagesContainer()).toBeNull();
  });

  it('should be able to unregister messages while having others registered', () => {
    ariaDescriber.describe(component.element1, 'Persistent Message');
    ariaDescriber.describe(component.element2, 'My Message');
    expectMessages(['Persistent Message', 'My Message']);

    // Register again to check dedupe
    ariaDescriber.describe(component.element3, 'My Message');
    expectMessages(['Persistent Message', 'My Message']);

    // Unregister one message and make sure the message is still present in the container
    ariaDescriber.removeDescription(component.element2, 'My Message');
    expectMessages(['Persistent Message', 'My Message']);

    // Unregister the second message, message container should be gone
    ariaDescriber.removeDescription(component.element3, 'My Message');
    expectMessages(['Persistent Message']);
  });

  it('should be able to append to an existing list of aria describedby', () => {
    ariaDescriber.describe(component.element4, 'My Message');
    expectMessages(['My Message']);
    expectMessage(component.element4, 'My Message');
  });

  it('should be able to handle multiple regisitrations of the same message to an element', () => {
    ariaDescriber.describe(component.element1, 'My Message');
    ariaDescriber.describe(component.element1, 'My Message');
    expectMessages(['My Message']);
    expectMessage(component.element1, 'My Message');
  });
});

function getMessagesContainer() {
  return document.querySelector(`#${MESSAGES_CONTAINER_ID}`);
}

function getMessageElements(): Node[] | null {
  const messagesContainer = getMessagesContainer();
  if (!messagesContainer) { return null; }

  return messagesContainer ?  Array.prototype.slice.call(messagesContainer.children) : null;
}

/** Checks that the messages array matches the existing created message elements. */
function expectMessages(messages: string[]) {
  const messageElements = getMessageElements();
  expect(messageElements).toBeDefined();

  expect(messages.length).toBe(messageElements!.length);
  messages.forEach((message, i) => {
    expect(messageElements![i].textContent).toBe(message);
  });
}

/** Checks that an element points to a message element that contains the message. */
function expectMessage(el: Element, message: string) {
  const ariaDescribedBy = el.getAttribute('aria-describedby');
  expect(ariaDescribedBy).toBeDefined();

  const cdkDescribedBy = el.getAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE);
  expect(cdkDescribedBy).toBeDefined();

  const messages = ariaDescribedBy!.split(' ').map(referenceId => {
    const messageElement = document.querySelector(`#${referenceId}`);
    return messageElement ? messageElement.textContent : '';
  });

  expect(messages).toContain(message);
}

@Component({
  template: `
    <div #element1></div>
    <div #element2></div>
    <div #element3></div>
    <div #element4 aria-describedby="existing-aria-describedby1 existing-aria-describedby2"></div>
  `,
})
class TestApp {
  @ViewChild('element1') _element1: ElementRef;
  get element1(): Element { return this._element1.nativeElement; }

  @ViewChild('element2') _element2: ElementRef;
  get element2(): Element { return this._element2.nativeElement; }

  @ViewChild('element3') _element3: ElementRef;
  get element3(): Element { return this._element3.nativeElement; }

  @ViewChild('element4') _element4: ElementRef;
  get element4(): Element { return this._element4.nativeElement; }


  constructor(public ariaDescriber: AriaDescriber) { }
}
