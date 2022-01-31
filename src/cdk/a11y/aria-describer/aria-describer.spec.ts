import {A11yModule, CDK_DESCRIBEDBY_HOST_ATTRIBUTE} from '../index';
import {AriaDescriber} from './aria-describer';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ElementRef, ViewChild, Provider} from '@angular/core';

describe('AriaDescriber', () => {
  let ariaDescriber: AriaDescriber;
  let component: TestApp;
  let fixture: ComponentFixture<TestApp>;

  function createFixture(providers: Provider[] = []) {
    TestBed.configureTestingModule({
      imports: [A11yModule],
      declarations: [TestApp],
      providers: [AriaDescriber, ...providers],
    }).compileComponents();

    fixture = TestBed.createComponent(TestApp);
    component = fixture.componentInstance;
    ariaDescriber = component.ariaDescriber;
    fixture.detectChanges();
  }

  it('should initialize without the message container', () => {
    createFixture();
    expect(getMessagesContainer()).toBeNull();
  });

  it('should be able to create a message element', () => {
    createFixture();
    ariaDescriber.describe(component.element1, 'My Message');
    expectMessages(['My Message']);
  });

  it('should be able to describe using an element', () => {
    createFixture();
    const descriptionNode = fixture.nativeElement.querySelector('#description-with-existing-id');
    ariaDescriber.describe(component.element1, descriptionNode);
    expectMessage(component.element1, 'Hello');
  });

  it('should hide the message container', () => {
    createFixture();
    ariaDescriber.describe(component.element1, 'My Message');
    expect(getMessagesContainer().classList).toContain('cdk-visually-hidden');
  });

  it('should have visibility hidden', () => {
    createFixture();
    ariaDescriber.describe(component.element1, 'My Message');
    expect((getMessagesContainer() as HTMLElement).style.visibility).toBe('hidden');
  });

  it('should not register empty strings', () => {
    createFixture();
    ariaDescriber.describe(component.element1, '');
    expect(getMessageElements()).toBe(null);
  });

  it('should not register non-string values', () => {
    createFixture();
    expect(() => ariaDescriber.describe(component.element1, null!)).not.toThrow();
    expect(getMessageElements()).toBe(null);
  });

  it('should not throw when trying to remove non-string value', () => {
    createFixture();
    expect(() => ariaDescriber.removeDescription(component.element1, null!)).not.toThrow();
  });

  it('should de-dupe a message registered multiple times', () => {
    createFixture();
    ariaDescriber.describe(component.element1, 'My Message');
    ariaDescriber.describe(component.element2, 'My Message');
    ariaDescriber.describe(component.element3, 'My Message');
    expectMessages(['My Message']);
    expectMessage(component.element1, 'My Message');
    expectMessage(component.element2, 'My Message');
    expectMessage(component.element3, 'My Message');
  });

  it('should de-dupe a message registered multiple via an element node', () => {
    createFixture();
    const descriptionNode = fixture.nativeElement.querySelector('#description-with-existing-id');
    ariaDescriber.describe(component.element1, descriptionNode);
    ariaDescriber.describe(component.element2, descriptionNode);
    ariaDescriber.describe(component.element3, descriptionNode);
    expectMessage(component.element1, 'Hello');
    expectMessage(component.element2, 'Hello');
    expectMessage(component.element3, 'Hello');
  });

  it('should be able to register multiple messages', () => {
    createFixture();
    ariaDescriber.describe(component.element1, 'First Message');
    ariaDescriber.describe(component.element2, 'Second Message');
    expectMessages(['First Message', 'Second Message']);
    expectMessage(component.element1, 'First Message');
    expectMessage(component.element2, 'Second Message');
  });

  it('should be able to unregister messages', () => {
    createFixture();
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
    createFixture();
    const descriptionNode = fixture.nativeElement.querySelector('#description-with-existing-id');

    expect(document.body.contains(descriptionNode))
      .withContext('Expected node to be inside the document to begin with.')
      .toBe(true);
    expect(getMessagesContainer())
      .withContext('Expected no messages container on init.')
      .toBeNull();

    ariaDescriber.describe(component.element1, descriptionNode);

    expectMessage(component.element1, 'Hello');
    expect(getMessagesContainer())
      .withContext('Expected no messages container after the element was described.')
      .toBeNull();

    ariaDescriber.removeDescription(component.element1, descriptionNode);

    expect(document.body.contains(descriptionNode))
      .withContext(
        'Expected description node to still be in the DOM after it is' + 'no longer being used.',
      )
      .toBe(true);
  });

  it('should keep nodes set as descriptions inside their original position in the DOM', () => {
    createFixture();
    const descriptionNode = fixture.nativeElement.querySelector('#description-with-existing-id');
    const initialParent = descriptionNode.parentNode;

    expect(initialParent).withContext('Expected node to have a parent initially.').toBeTruthy();

    ariaDescriber.describe(component.element1, descriptionNode);

    expectMessage(component.element1, 'Hello');
    expect(descriptionNode.parentNode)
      .withContext('Expected node to stay inside the same parent when used as a description.')
      .toBe(initialParent);

    ariaDescriber.removeDescription(component.element1, descriptionNode);

    expect(descriptionNode.parentNode)
      .withContext(
        'Expected node to stay inside the same parent after not ' + 'being used as a description.',
      )
      .toBe(initialParent);
  });

  it('should be able to unregister messages while having others registered', () => {
    createFixture();
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
    createFixture();
    ariaDescriber.describe(component.element4, 'My Message');
    expectMessages(['My Message']);
    expectMessage(component.element4, 'My Message');
  });

  it('should be able to handle multiple regisitrations of the same message to an element', () => {
    createFixture();
    ariaDescriber.describe(component.element1, 'My Message');
    ariaDescriber.describe(component.element1, 'My Message');
    expectMessages(['My Message']);
    expectMessage(component.element1, 'My Message');
  });

  it('should not throw when attempting to describe a non-element node', () => {
    createFixture();
    const node: any = document.createComment('Not an element node');
    expect(() => ariaDescriber.describe(node, 'This looks like an element')).not.toThrow();
  });

  it('should clear any pre-existing containers coming in from the server', () => {
    createFixture();
    const extraContainer = document.createElement('div');
    extraContainer.classList.add('cdk-describedby-message-container');
    extraContainer.setAttribute('platform', 'server');
    document.body.appendChild(extraContainer);

    ariaDescriber.describe(component.element1, 'Hello');

    expect(document.querySelectorAll('.cdk-describedby-message-container').length).toBe(1);
    extraContainer.remove();
  });

  it('should not clear any pre-existing containers coming from the browser', () => {
    createFixture();
    const extraContainer = document.createElement('div');
    extraContainer.classList.add('cdk-describedby-message-container');
    document.body.appendChild(extraContainer);

    ariaDescriber.describe(component.element1, 'Hello');

    expect(document.querySelectorAll('.cdk-describedby-message-container').length).toBe(2);
    extraContainer.remove();
  });

  it('should not describe messages that match up with the aria-label of the element', () => {
    createFixture();
    component.element1.setAttribute('aria-label', 'Hello');
    ariaDescriber.describe(component.element1, 'Hello');
    ariaDescriber.describe(component.element1, 'Hi');
    expectMessages(['Hi']);
  });

  it('should assign an id to the description element, if it does not have one', () => {
    createFixture();
    const descriptionNode = fixture.nativeElement.querySelector('[description-without-id]');
    expect(descriptionNode.getAttribute('id')).toBeFalsy();
    ariaDescriber.describe(component.element1, descriptionNode);
    expect(descriptionNode.getAttribute('id')).toBeTruthy();
  });

  it('should not overwrite the existing id of the description element', () => {
    createFixture();
    const descriptionNode = fixture.nativeElement.querySelector('#description-with-existing-id');
    expect(descriptionNode.id).toBe('description-with-existing-id');
    ariaDescriber.describe(component.element1, descriptionNode);
    expect(descriptionNode.id).toBe('description-with-existing-id');
  });

  it('should not remove pre-existing description nodes on destroy', () => {
    createFixture();
    const descriptionNode = fixture.nativeElement.querySelector('#description-with-existing-id');

    expect(document.body.contains(descriptionNode))
      .withContext('Expected node to be inside the document to begin with.')
      .toBe(true);

    ariaDescriber.describe(component.element1, descriptionNode);

    expectMessage(component.element1, 'Hello');
    expect(component.element1.hasAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE)).toBe(true);

    ariaDescriber.ngOnDestroy();

    expect(component.element1.hasAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE)).toBe(false);
    expect(document.body.contains(descriptionNode))
      .withContext(
        'Expected description node to still be in the DOM after ' + 'it is no longer being used.',
      )
      .toBe(true);
  });

  it('should remove the aria-describedby attribute if there are no more messages', () => {
    createFixture();
    const element = component.element1;

    expect(element.hasAttribute('aria-describedby')).toBe(false);

    ariaDescriber.describe(component.element1, 'Message');
    expect(element.hasAttribute('aria-describedby')).toBe(true);

    ariaDescriber.removeDescription(component.element1, 'Message');
    expect(element.hasAttribute('aria-describedby')).toBe(false);
  });

  it('should be able to register the same message with different roles', () => {
    createFixture();
    ariaDescriber.describe(component.element1, 'My Message', 'tooltip');
    ariaDescriber.describe(component.element2, 'My Message', 'button');
    ariaDescriber.describe(component.element3, 'My Message', 'presentation');
    expectMessages(['tooltip/My Message', 'button/My Message', 'presentation/My Message']);
    expectMessage(component.element1, 'tooltip/My Message');
    expectMessage(component.element2, 'button/My Message');
    expectMessage(component.element3, 'presentation/My Message');
  });

  it('should de-dupe a message if it has been registered with the same role', () => {
    createFixture();
    ariaDescriber.describe(component.element1, 'My Message', 'tooltip');
    ariaDescriber.describe(component.element2, 'My Message', 'tooltip');
    ariaDescriber.describe(component.element3, 'My Message', 'tooltip');
    expectMessages(['tooltip/My Message']);
    expectMessage(component.element1, 'tooltip/My Message');
    expectMessage(component.element2, 'tooltip/My Message');
    expectMessage(component.element3, 'tooltip/My Message');
  });

  it('should be able to unregister messages with a particular role', () => {
    createFixture();
    ariaDescriber.describe(component.element1, 'My Message', 'tooltip');
    expectMessages(['tooltip/My Message']);

    // Register again to check dedupe
    ariaDescriber.describe(component.element2, 'My Message', 'tooltip');
    expectMessages(['tooltip/My Message']);

    // Unregister one message and make sure the message is still present in the container
    ariaDescriber.removeDescription(component.element1, 'My Message', 'tooltip');
    expect(component.element1.hasAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE)).toBeFalsy();
    expectMessages(['tooltip/My Message']);

    // Unregister the second message, message container should be gone
    ariaDescriber.removeDescription(component.element2, 'My Message', 'tooltip');
    expect(component.element2.hasAttribute(CDK_DESCRIBEDBY_HOST_ATTRIBUTE)).toBeFalsy();
    expect(getMessagesContainer()).toBeNull();
  });

  it('should not remove element if it is registered with same text, but different role', () => {
    createFixture();
    ariaDescriber.describe(component.element1, 'My Message', 'tooltip');
    ariaDescriber.describe(component.element2, 'My Message', 'button');
    expectMessages(['tooltip/My Message', 'button/My Message']);
    ariaDescriber.removeDescription(component.element2, 'My Message', 'button');
    expectMessages(['tooltip/My Message']);
    ariaDescriber.removeDescription(component.element1, 'My Message', 'tooltip');
    expect(getMessageElements()).toBeNull();
  });
});

function getMessagesContainer() {
  return document.querySelector('.cdk-describedby-message-container')!;
}

function getMessageElements(): Element[] | null {
  const messagesContainer = getMessagesContainer();
  if (!messagesContainer) {
    return null;
  }

  return messagesContainer ? Array.prototype.slice.call(messagesContainer.children) : null;
}

/** Checks that the messages array matches the existing created message elements. */
function expectMessages(messages: string[]) {
  const messageElements = getMessageElements();
  expect(messageElements).toBeDefined();

  expect(messages.length).toBe(messageElements!.length);
  messages.forEach((message, i) => {
    const element = messageElements![i];
    const role = element.getAttribute('role');
    expect((role ? role + '/' : '') + element.textContent).toBe(message);
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
    const role = messageElement?.getAttribute('role');
    const prefix = role ? role + '/' : '';
    return messageElement ? prefix + messageElement.textContent : '';
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
  @ViewChild('element1') _element1: ElementRef<HTMLElement>;
  get element1(): Element {
    return this._element1.nativeElement;
  }

  @ViewChild('element2') _element2: ElementRef<HTMLElement>;
  get element2(): Element {
    return this._element2.nativeElement;
  }

  @ViewChild('element3') _element3: ElementRef<HTMLElement>;
  get element3(): Element {
    return this._element3.nativeElement;
  }

  @ViewChild('element4') _element4: ElementRef<HTMLElement>;
  get element4(): Element {
    return this._element4.nativeElement;
  }

  constructor(public ariaDescriber: AriaDescriber) {}
}
