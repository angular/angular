import {_computeAriaAccessibleName} from './aria-accessible-name';

describe('_computeAriaAccessibleName', () => {
  let rootElement: HTMLSpanElement;

  beforeEach(() => {
    rootElement = document.createElement('span');
    document.body.appendChild(rootElement);
  });

  afterEach(() => {
    rootElement.remove();
  });

  it('uses aria-labelledby over aria-label', () => {
    rootElement.innerHTML = `
      <label id='test-label'>Aria Labelledby</label>
      <input id='test-el' aria-labelledby='test-label' aria-label='Aria Label'/>
    `;

    const input = rootElement.querySelector('#test-el')!;
    expect(_computeAriaAccessibleName(input as HTMLInputElement)).toBe('Aria Labelledby');
  });

  it('uses aria-label over for/id', () => {
    rootElement.innerHTML = `
      <label for='test-el'>For</label>
      <input id='test-el' aria-label='Aria Label'/>
    `;

    const input = rootElement.querySelector('#test-el')!;
    expect(_computeAriaAccessibleName(input as HTMLInputElement)).toBe('Aria Label');
  });

  it('uses a label with for/id over a title attribute', () => {
    rootElement.innerHTML = `
      <label for='test-el'>For</label>
      <input id='test-el' title='Title'/>
    `;

    const input = rootElement.querySelector('#test-el')!;
    expect(_computeAriaAccessibleName(input as HTMLInputElement)).toBe('For');
  });

  it('returns title when argument has a specified title', () => {
    rootElement.innerHTML = `<input id="test-el" title='Title'/>`;

    const input = rootElement.querySelector('#test-el')!;
    expect(_computeAriaAccessibleName(input as HTMLInputElement)).toBe('Title');
  });

  // match browser behavior of giving placeholder attribute preference over title attribute
  it('uses placeholder over title', () => {
    rootElement.innerHTML = `<input id="test-el" title='Title' placeholder='Placeholder'/>`;

    const input = rootElement.querySelector('#test-el')!;
    expect(_computeAriaAccessibleName(input as HTMLInputElement)).toBe('Placeholder');
  });

  it('uses aria-label over title and placeholder', () => {
    rootElement.innerHTML = `<input id="test-el" title='Title' placeholder='Placeholder'
      aria-label="Aria Label"/>`;

    const input = rootElement.querySelector('#test-el')!;
    expect(_computeAriaAccessibleName(input as HTMLInputElement)).toBe('Aria Label');
  });

  it('includes both textnode and element children of label with for/id', () => {
    rootElement.innerHTML = `
    <label for="test-el">
        Hello
        <span>
          Wo
          <span><span>r</span></span>
          <span>  ld </span>
        </span>
        !
      </label>
      <input id='test-el'/>
    `;

    const input = rootElement.querySelector('#test-el')!;
    expect(_computeAriaAccessibleName(input as HTMLInputElement)).toBe('Hello Wo r ld !');
  });

  it('return computed name of hidden label which has for/id', () => {
    rootElement.innerHTML = `
    <label for="test-el" aria-hidden="true" style="display: none;">For</label>
    <input id='test-el'/>
    `;

    const input = rootElement.querySelector('#test-el')!;
    expect(_computeAriaAccessibleName(input as HTMLInputElement)).toBe('For');
  });

  it('returns computed names of existing elements when 2 of 3 targets of aria-labelledby exist', () => {
    rootElement.innerHTML = `
      <label id="label-1-of-2" aria-hidden="true" style="display: none;">Label1</label>
      <label id="label-2-of-2" aria-hidden="true" style="display: none;">Label2</label>
      <input id="test-el" aria-labelledby="label-1-of-2 label-2-of-2 non-existant-label"/>
    `;

    const input = rootElement.querySelector('#test-el')!;
    expect(_computeAriaAccessibleName(input as HTMLInputElement)).toBe('Label1 Label2');
  });

  it('returns repeated label when there are duplicate ids in aria-labelledby', () => {
    rootElement.innerHTML = `
      <label id="label-1-of-1" aria-hidden="true" style="display: none;">Label1</label>
      <input id="test-el" aria-labelledby="label-1-of-1 label-1-of-1"/>
    `;

    const input = rootElement.querySelector('#test-el')!;
    expect(_computeAriaAccessibleName(input as HTMLInputElement)).toBe('Label1 Label1');
  });

  it('returns empty string when passed `<input id="test-el"/>`', () => {
    rootElement.innerHTML = `<input id="test-el"/>`;

    const input = rootElement.querySelector('#test-el')!;
    expect(_computeAriaAccessibleName(input as HTMLInputElement)).toBe('');
  });

  it('ignores the aria-labelledby of an aria-labelledby', () => {
    rootElement.innerHTML = `
      <label id="label" aria-labelledby="transitive-label">Label</label>
      <label id="transitive-label" aria-labelled-by="transitive-label">Transitive Label</div>
      <input id="test-el" aria-labelledby="label"/>
    `;

    const input = rootElement.querySelector('#test-el')!;
    const label = rootElement.querySelector('#label')!;
    expect(_computeAriaAccessibleName(label as any)).toBe('Transitive Label');
    expect(_computeAriaAccessibleName(input as HTMLInputElement)).toBe('Label');
  });

  it('ignores the aria-labelledby on a label with for/id', () => {
    rootElement.innerHTML = `
      <label for="transitive2-label" aria-labelledby="transitive2-div"></label>
      <div id="transitive2-div">Div</div>
      <input id="test-el" aria-labelled-by="transitive2-label"/>
    `;

    const input = rootElement.querySelector('#test-el')!;
    expect(_computeAriaAccessibleName(input as HTMLInputElement)).toBe('');
  });

  it('returns empty string when argument input is aria-labelledby itself', () => {
    rootElement.innerHTML = `
      <input id="test-el" aria-labelled-by="test-el"/>
    `;

    const input = rootElement.querySelector('#test-el')!;
    const computedName = _computeAriaAccessibleName(input as HTMLInputElement);
    expect(typeof computedName)
      .withContext('should return value of type string')
      .toBe('string');
  });
});
