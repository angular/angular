import {Component} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {Clipboard} from './clipboard';
import {ClipboardModule} from './clipboard-module';
import {PendingCopy} from './pending-copy';

const COPY_CONTENT = 'copy content';

@Component({
  selector: 'copy-to-clipboard-host',
  template: `
    <button
    [cdkCopyToClipboard]="content"
    [cdkCopyToClipboardAttempts]="attempts"
    (cdkCopyToClipboardCopied)="copied($event)"></button>`,
})
class CopyToClipboardHost {
  content = '';
  attempts = 1;
  copied = jasmine.createSpy('copied spy');
}

describe('CdkCopyToClipboard', () => {
  let fixture: ComponentFixture<CopyToClipboardHost>;
  let clipboard: Clipboard;

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
    clipboard = TestBed.get(Clipboard);
    fixture.detectChanges();
  });

  it('copies content to clipboard upon click', () => {
    spyOn(clipboard, 'copy');
    fixture.nativeElement.querySelector('button')!.click();
    expect(clipboard.copy).toHaveBeenCalledWith(COPY_CONTENT);
  });

  it('emits copied event true when copy succeeds', fakeAsync(() => {
    spyOn(clipboard, 'copy').and.returnValue(true);
    fixture.nativeElement.querySelector('button')!.click();

    expect(fixture.componentInstance.copied).toHaveBeenCalledWith(true);
  }));

  it('emits copied event false when copy fails', fakeAsync(() => {
    spyOn(clipboard, 'copy').and.returnValue(false);
    fixture.nativeElement.querySelector('button')!.click();
    tick();

    expect(fixture.componentInstance.copied).toHaveBeenCalledWith(false);
  }));

  it('should be able to attempt multiple times before succeeding', fakeAsync(() => {
    const maxAttempts = 3;
    let attempts = 0;
    spyOn(clipboard, 'beginCopy').and.returnValue({
      copy: () => ++attempts >= maxAttempts,
      destroy: () => {}
    } as PendingCopy);
    fixture.componentInstance.attempts = maxAttempts;
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button')!.click();
    fixture.detectChanges();
    tick();

    expect(attempts).toBe(maxAttempts);
    expect(fixture.componentInstance.copied).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.copied).toHaveBeenCalledWith(true);
  }));

  it('should be able to attempt multiple times before failing', fakeAsync(() => {
    const maxAttempts = 3;
    let attempts = 0;
    spyOn(clipboard, 'beginCopy').and.returnValue({
      copy: () => {
        attempts++;
        return false;
      },
      destroy: () => {}
    } as PendingCopy);
    fixture.componentInstance.attempts = maxAttempts;
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button')!.click();
    fixture.detectChanges();
    tick();

    expect(attempts).toBe(maxAttempts);
    expect(fixture.componentInstance.copied).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.copied).toHaveBeenCalledWith(false);
  }));
});
