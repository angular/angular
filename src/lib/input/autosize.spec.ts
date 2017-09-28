import {Component, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ComponentFixture, TestBed, async, fakeAsync, flushMicrotasks} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MatInputModule} from './index';
import {MatTextareaAutosize} from './autosize';


describe('MatTextareaAutosize', () => {
  let fixture: ComponentFixture<AutosizeTextAreaWithContent>;
  let textarea: HTMLTextAreaElement;
  let autosize: MatTextareaAutosize;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatInputModule, FormsModule],
      declarations: [
        AutosizeTextAreaWithContent,
        AutosizeTextAreaWithValue,
        AutosizeTextareaWithNgModel
      ],
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutosizeTextAreaWithContent);
    fixture.detectChanges();

    textarea = fixture.nativeElement.querySelector('textarea');
    autosize = fixture.debugElement.query(
        By.directive(MatTextareaAutosize)).injector.get<MatTextareaAutosize>(MatTextareaAutosize);
  });

  it('should resize the textarea based on its content', () => {
    let previousHeight = textarea.clientHeight;

    fixture.componentInstance.content = `
    Once upon a midnight dreary, while I pondered, weak and weary,
    Over many a quaint and curious volume of forgotten lore—
        While I nodded, nearly napping, suddenly there came a tapping,
    As of some one gently rapping, rapping at my chamber door.
    “’Tis some visitor,” I muttered, “tapping at my chamber door—
                Only this and nothing more.”`;

    // Manually call resizeToFitContent instead of faking an `input` event.
    fixture.detectChanges();
    autosize.resizeToFitContent();

    expect(textarea.clientHeight)
        .toBeGreaterThan(previousHeight, 'Expected textarea to have grown with added content.');
    expect(textarea.clientHeight)
        .toBe(textarea.scrollHeight, 'Expected textarea height to match its scrollHeight');

    previousHeight = textarea.clientHeight;
    fixture.componentInstance.content += `
        Ah, distinctly I remember it was in the bleak December;
    And each separate dying ember wrought its ghost upon the floor.
        Eagerly I wished the morrow;—vainly I had sought to borrow
        From my books surcease of sorrow—sorrow for the lost Lenore—
    For the rare and radiant maiden whom the angels name Lenore—
                Nameless here for evermore.`;

    fixture.detectChanges();
    autosize.resizeToFitContent();

    expect(textarea.clientHeight)
        .toBeGreaterThan(previousHeight, 'Expected textarea to have grown with added content.');
    expect(textarea.clientHeight)
        .toBe(textarea.scrollHeight, 'Expected textarea height to match its scrollHeight');
  });

  it('should set a min-width based on minRows', () => {
    expect(textarea.style.minHeight).toBeFalsy();

    fixture.componentInstance.minRows = 4;
    fixture.detectChanges();

    expect(textarea.style.minHeight).toBeDefined('Expected a min-height to be set via minRows.');

    let previousMinHeight = parseInt(textarea.style.minHeight as string);
    fixture.componentInstance.minRows = 6;
    fixture.detectChanges();

    expect(parseInt(textarea.style.minHeight as string))
        .toBeGreaterThan(previousMinHeight, 'Expected increased min-height with minRows increase.');
  });

  it('should set a max-width based on maxRows', () => {
    expect(textarea.style.maxHeight).toBeFalsy();

    fixture.componentInstance.maxRows = 4;
    fixture.detectChanges();

    expect(textarea.style.maxHeight).toBeDefined('Expected a max-height to be set via maxRows.');

    let previousMaxHeight = parseInt(textarea.style.maxHeight as string);
    fixture.componentInstance.maxRows = 6;
    fixture.detectChanges();

    expect(parseInt(textarea.style.maxHeight as string))
        .toBeGreaterThan(previousMaxHeight, 'Expected increased max-height with maxRows increase.');
  });

  it('should export the matAutosize reference', () => {
    expect(fixture.componentInstance.autosize).toBeTruthy();
    expect(fixture.componentInstance.autosize.resizeToFitContent).toBeTruthy();
  });

  it('should initially set the rows of a textarea to one', () => {
    expect(textarea.rows)
      .toBe(1, 'Expected the directive to initially set the rows property to one.');

    fixture.componentInstance.minRows = 1;
    fixture.detectChanges();

    expect(textarea.rows)
      .toBe(1, 'Expected the textarea to have the rows property set to one.');

    const previousMinHeight = parseInt(textarea.style.minHeight as string);

    fixture.componentInstance.minRows = 2;
    fixture.detectChanges();

    expect(textarea.rows).toBe(1, 'Expected the rows property to be set to one. ' +
      'The amount of rows will be specified using CSS.');

    expect(parseInt(textarea.style.minHeight as string))
      .toBeGreaterThan(previousMinHeight, 'Expected the textarea to grow to two rows.');
  });

  it('should calculate the proper height based on the specified amount of max rows', () => {
    fixture.componentInstance.content = [1, 2, 3, 4, 5, 6, 7, 8].join('\n');
    fixture.detectChanges();
    autosize.resizeToFitContent();

    expect(textarea.clientHeight)
      .toBe(textarea.scrollHeight, 'Expected textarea to not have a vertical scrollbar.');

    fixture.componentInstance.maxRows = 5;
    fixture.detectChanges();

    expect(textarea.clientHeight)
      .toBeLessThan(textarea.scrollHeight, 'Expected textarea to have a vertical scrollbar.');
  });

  it('should properly resize to content on init', () => {
    // Manually create the test component in this test, because in this test the first change
    // detection should be triggered after a multiline content is set.
    fixture = TestBed.createComponent(AutosizeTextAreaWithContent);
    textarea = fixture.nativeElement.querySelector('textarea');
    autosize = fixture.debugElement.query(By.css('textarea')).injector.get(MatTextareaAutosize);

    fixture.componentInstance.content = `
      Line
      Line
      Line
      Line
      Line`;

    fixture.detectChanges();

    expect(textarea.clientHeight)
      .toBe(textarea.scrollHeight, 'Expected textarea height to match its scrollHeight');
  });

  it('should resize when an associated form control value changes', fakeAsync(() => {
    const fixtureWithForms = TestBed.createComponent(AutosizeTextareaWithNgModel);
    textarea = fixtureWithForms.nativeElement.querySelector('textarea');
    fixtureWithForms.detectChanges();

    const previousHeight = textarea.clientHeight;

    fixtureWithForms.componentInstance.model = `
        And the silken, sad, uncertain rustling of each purple curtain
    Thrilled me—filled me with fantastic terrors never felt before;
        So that now, to still the beating of my heart, I stood repeating
        “’Tis some visitor entreating entrance at my chamber door—
    Some late visitor entreating entrance at my chamber door;—
                This it is and nothing more.” `;
    fixtureWithForms.detectChanges();
    flushMicrotasks();
    fixtureWithForms.detectChanges();

    expect(textarea.clientHeight)
        .toBeGreaterThan(previousHeight, 'Expected increased height when ngModel is updated.');
  }));

  it('should resize when the textarea value is changed programmatically', fakeAsync(() => {
    const previousHeight = textarea.clientHeight;

    textarea.value = `
      How much wood would a woodchuck chuck
      if a woodchuck could chuck wood?
    `;

    fixture.detectChanges();
    flushMicrotasks();
    fixture.detectChanges();

    expect(textarea.clientHeight)
        .toBeGreaterThan(previousHeight, 'Expected the textarea height to have increased.');
  }));
});


// Styles to reset padding and border to make measurement comparisons easier.
const textareaStyleReset = `
    textarea {
      padding: 0;
      border: none;
      overflow: auto;
    }`;

@Component({
  template: `
    <textarea matTextareaAutosize [matAutosizeMinRows]="minRows" [matAutosizeMaxRows]="maxRows"
        #autosize="matTextareaAutosize">
      {{content}}
    </textarea>`,
  styles: [textareaStyleReset],
})
class AutosizeTextAreaWithContent {
  @ViewChild('autosize') autosize: MatTextareaAutosize;
  minRows: number | null = null;
  maxRows: number | null = null;
  content: string = '';
}

@Component({
  template: `<textarea matTextareaAutosize [value]="value"></textarea>`,
  styles: [textareaStyleReset],
})
class AutosizeTextAreaWithValue {
  value: string = '';
}

@Component({
  template: `<textarea matTextareaAutosize [(ngModel)]="model"></textarea>`,
  styles: [textareaStyleReset],
})
class AutosizeTextareaWithNgModel {
  model = '';
}
