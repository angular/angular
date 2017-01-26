import {Component, ViewChild} from '@angular/core';
import {ComponentFixture, TestBed, async} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {MdInputModule} from './index';
import {MdTextareaAutosize} from './autosize';


describe('MdTextareaAutosize', () => {
  let fixture: ComponentFixture<AutosizeTextAreaWithContent>;
  let textarea: HTMLTextAreaElement;
  let autosize: MdTextareaAutosize;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MdInputModule],
      declarations: [AutosizeTextAreaWithContent, AutosizeTextAreaWithValue],
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutosizeTextAreaWithContent);
    fixture.detectChanges();

    textarea = fixture.nativeElement.querySelector('textarea');
    autosize = fixture.debugElement.query(
        By.directive(MdTextareaAutosize)).injector.get(MdTextareaAutosize);
  });

  it('should resize the textarea based on its content', () => {
    let previousHeight = textarea.offsetHeight;

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

    expect(textarea.offsetHeight)
        .toBeGreaterThan(previousHeight, 'Expected textarea to have grown with added content.');
    expect(textarea.offsetHeight)
        .toBe(textarea.scrollHeight, 'Expected textarea height to match its scrollHeight');

    previousHeight = textarea.offsetHeight;
    fixture.componentInstance.content += `
        Ah, distinctly I remember it was in the bleak December;
    And each separate dying ember wrought its ghost upon the floor.
        Eagerly I wished the morrow;—vainly I had sought to borrow
        From my books surcease of sorrow—sorrow for the lost Lenore—
    For the rare and radiant maiden whom the angels name Lenore—
                Nameless here for evermore.`;

    fixture.detectChanges();
    autosize.resizeToFitContent();

    expect(textarea.offsetHeight)
        .toBeGreaterThan(previousHeight, 'Expected textarea to have grown with added content.');
    expect(textarea.offsetHeight)
        .toBe(textarea.scrollHeight, 'Expected textarea height to match its scrollHeight');
  });

  it('should set a min-width based on minRows', () => {
    expect(textarea.style.minHeight).toBeFalsy();

    fixture.componentInstance.minRows = 4;
    fixture.detectChanges();

    expect(textarea.style.minHeight).toBeDefined('Expected a min-height to be set via minRows.');

    let previousMinHeight = parseInt(textarea.style.minHeight);
    fixture.componentInstance.minRows = 6;
    fixture.detectChanges();

    expect(parseInt(textarea.style.minHeight))
        .toBeGreaterThan(previousMinHeight, 'Expected increased min-height with minRows increase.');
  });

  it('should set a max-width based on maxRows', () => {
    expect(textarea.style.maxHeight).toBeFalsy();

    fixture.componentInstance.maxRows = 4;
    fixture.detectChanges();

    expect(textarea.style.maxHeight).toBeDefined('Expected a max-height to be set via maxRows.');

    let previousMaxHeight = parseInt(textarea.style.maxHeight);
    fixture.componentInstance.maxRows = 6;
    fixture.detectChanges();

    expect(parseInt(textarea.style.maxHeight))
        .toBeGreaterThan(previousMaxHeight, 'Expected increased max-height with maxRows increase.');
  });

  it('should export the mdAutosize reference', () => {
    expect(fixture.componentInstance.autosize).toBeTruthy();
    expect(fixture.componentInstance.autosize.resizeToFitContent).toBeTruthy();
  });

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
    <textarea mdTextareaAutosize [mdAutosizeMinRows]="minRows" [mdAutosizeMaxRows]="maxRows" 
        #autosize="mdTextareaAutosize">
      {{content}}
    </textarea>`,
  styles: [textareaStyleReset],
})
class AutosizeTextAreaWithContent {
  @ViewChild('autosize') autosize: MdTextareaAutosize;
  minRows: number = null;
  maxRows: number = null;
  content: string = '';
}

@Component({
  template: `<textarea mdTextareaAutosize [value]="value"></textarea>`,
  styles: [textareaStyleReset],
})
class AutosizeTextAreaWithValue {
  value: string = '';
}
