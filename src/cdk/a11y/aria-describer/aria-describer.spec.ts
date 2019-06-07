import {A11yModule, CDK_DESCRIBEDBY_HOST_ATTRIBUTE} from '../index';
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
    fixture.detectChanges();
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

  it('should be able to describe using an element', () => {
    const descriptionNode = fixture.nativeElement.querySelector('#description-with-existing-id');
    ariaDescriber.describe(component.element1, descriptionNode);
    expectMessage(component.element1, 'Hello');
  });

  it('should not register empty strings', () => {
    ariaDescriber.describe(component.element1, '');
    expect(getMessageElements()).toBe(null);
  });

  it('should not register non-string values', () => {
    expect(() => ariaDescriber.describe(component.element1, null!)).not.toThrow();
    expect(getMessageElements()).toBe(null);
  });

  it('should not throw when trying to remove non-string value', () => {
    expect(() => ariaDescriber.removeDescription(component.element1, null!)).not.toThrow();
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

  it('should de-dupe a message registered multiple via an element node', () => {
    const descriptionNode = fixture.nativeElement.querySelector('#description-with-existing-id');
    ariaDescriber.describe(component.element1, descriptionNode);
    ariaDescriber.describe(component.element2, descriptionNode);
    ariaDescriber.describe(component.element3, descriptionNode);
    expectMessage(component.element1, 'Hello');
    expectMessage(component.element2, 'Hello');
    expectMessage(component.element3, 'Hello');
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

  it('should not remove nodes that were set as messages when unregistering', () => {
    const descriptionNode = fixture.nativeElement.querySelector('#description-with-existing-id');

    expect(document.body.contains(descriptionNode))
        .toBe(true, 'Expected node to be inside the document to begin with.');
    expect(getMessagesContainer()).toBeNull('Expected no messages container on init.');

    ariaDescriber.describe(component.element1, descriptionNode);

    expectMessage(component.element1, 'Hello');
    expect(getMessagesContainer())
        .toBeNull('Expected no messages container after the element was described.');

    ariaDescriber.removeDescription(component.element1, descriptionNode);

    expect(document.body.contains(descriptionNode)).toBe(true,
        'Expected description node to still be in the DOM after it is no longer being used.');
  });

  it('should keep nodes set as descriptions inside their original position in the DOM', () => {
    const descriptionNode = fixture.nativeElement.querySelector('#description-with-existing-id');
    const initialParent = descriptionNode.parentNode;

    expect(initialParent).toBeTruthy('Expected node to have a parent initially.');

    ariaDescriber.describe(component.element1, descriptionNode);

    expectMessage(component.element1, 'Hello');
    expect(descriptionNode.parentNode).toBe(initialParent,
        'Expected node to stay inside the same parent when used as a description.');

    ariaDescriber.removeDescription(component.element1, descriptionNode);

    expect(descriptionNode.parentNode).toBe(initialParent,
      'Expected node to stay inside the same parent after not being used as a description.');
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

  it('should not throw when attempting to describe a non-element node', () => {
    const node: any = document.createComment('Not an element node');
    expect(() => ariaDescriber.describe(node, 'This looks like an element')).not.toThrow();
  });

  it('should clear any pre-existing containers', () => {
    const extraContainer = document.createElement('div');
    extraContainer.id = MESSAGES_CONTAINER_ID;
    document.body.appendChild(extraContainer);

    ariaDescriber.describe(component.element1, 'Hello');

    // Use `querySelectorAll` with an attribute since `getElementById` will stop at the first match.
    expect(document.querySelectorAll(`[id='${MESSAGES_CONTAINER_ID}']`).length).toBe(1);
  });

  it('should not describe messages that match up with the aria-label of the element', () => {
    component.element1.setAttribute('aria-label', 'Hello');
    ariaDescriber.describe(component.element1, 'Hello');
    ariaDescriber.describe(component.element1, 'Hi');
    expectMessages(['Hi']);
  });

  it('should assign an id to the description element, if it does not have one', () => {
    const descriptionNode = fixture.nativeElement.querySelector('[description-without-id]');
    expect(descriptionNode.getAttribute('id')).toBeFalsy();
    ariaDescriber.describe(component.element1, descriptionNode);
    expect(descriptionNode.getAttribute('id')).toBeTruthy();
  });

  it('should not overwrite the existing id of the description element', () => {
    const descriptionNode = fixture.nativeElement.querySelector('#description-with-existing-id');
    expect(descriptionNode.id).toBe('description-with-existing-id');
    ariaDescriber.describe(component.element1, descriptionNode);
    expect(descriptionNode.id).toBe('description-with-existing-id');
  });

  it('should not remove pre-existing description nodes on destroy', () => {
    const descriptionNode = fixture.nativeElement.querySelector('#description-with-existing-id');

    expect(document.body.contains(descriptionNode))
        .toBe(true, 'Expected node to be inside the document to begin with.');

    ariaDescriber.describe(component.element1, descriptionNode);

    expectMessage(component.element1, 'Hello');
    expect(component.element1.hasAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE)).toBe(true);

    ariaDescriber.ngOnDestroy();

    expect(component.element1.hasAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE)).toBe(false);
    expect(document.body.contains(descriptionNode)).toBe(true,
        'Expected description node to still be in the DOM after it is no longer being used.');
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
    <div id="description-with-existing-id">Hello</div>
    <div description-without-id>Hey</div>
  `,
})
class TestApp {
  @ViewChild('element1', {static: false}) _element1: ElementRef<HTMLElement>;
  get element1(): Element { return this._element1.nativeElement; }

  @ViewChild('element2', {static: false}) _element2: ElementRef<HTMLElement>;
  get element2(): Element { return this._element2.nativeElement; }

  @ViewChild('element3', {static: false}) _element3: ElementRef<HTMLElement>;
  get element3(): Element { return this._element3.nativeElement; }

  @ViewChild('element4', {static: false}) _element4: ElementRef<HTMLElement>;
  get element4(): Element { return this._element4.nativeElement; }


  constructor(public ariaDescriber: AriaDescriber) { }
}
