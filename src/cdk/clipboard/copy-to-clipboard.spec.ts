import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {Clipboard} from './clipboard';
import {ClipboardModule} from './clipboard-module';

const COPY_CONTENT = 'copy content';

@Component({
  selector: 'copy-to-clipboard-host',
  template: `<button [cdkCopyToClipboard]="content" (copied)="copied.emit($event)"></button>`,
})
class CopyToClipboardHost {
  @Input() content = '';
  @Output() copied = new EventEmitter<boolean>();
}

describe('CdkCopyToClipboard', () => {
  let fixture: ComponentFixture<CopyToClipboardHost>;
  let mockCopy: jasmine.Spy;
  let copiedOutput: jasmine.Spy;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CopyToClipboardHost],
      imports: [ClipboardModule],
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyToClipboardHost);

    const host = fixture.componentInstance;
    host.content = COPY_CONTENT;
    copiedOutput = jasmine.createSpy('copied');
    host.copied.subscribe(copiedOutput);
    mockCopy = spyOn(TestBed.get(Clipboard), 'copy');

    fixture.detectChanges();
  });

  it('copies content to clipboard upon click', () => {
    fixture.nativeElement.querySelector('button')!.click();

    expect(mockCopy).toHaveBeenCalledWith(COPY_CONTENT);
  });

  it('emits copied event true when copy succeeds', fakeAsync(() => {
       mockCopy.and.returnValue(true);
       fixture.nativeElement.querySelector('button')!.click();

       expect(copiedOutput).toHaveBeenCalledWith(true);
     }));

  it('emits copied event false when copy fails', fakeAsync(() => {
       mockCopy.and.returnValue(false);
       fixture.nativeElement.querySelector('button')!.click();
       tick();

       expect(copiedOutput).toHaveBeenCalledWith(false);
     }));
});
