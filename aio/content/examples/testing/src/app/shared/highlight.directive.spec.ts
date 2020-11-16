import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { HighlightDirective } from './highlight.directive';

// #docregion test-component
@Component({
  template: `
  <h2 highlight="yellow">Something Yellow</h2>
  <h2 highlight>The Default (Gray)</h2>
  <h2>No Highlight</h2>
  <input #box [highlight]="box.value" value="cyan"/>`
})
class TestComponent { }
// #enddocregion test-component

describe('HighlightDirective', () => {

  let fixture: ComponentFixture<TestComponent>;
  let des: DebugElement[];  // the three elements w/ the directive
  let bareH2: DebugElement; // the <h2> w/o the directive

  // #docregion selected-tests
  beforeEach(() => {
    fixture = TestBed.configureTestingModule({
      declarations: [ HighlightDirective, TestComponent ]
    })
    .createComponent(TestComponent);

    fixture.detectChanges(); // 초기 바인딩

    // HighlightDirective를 사용한 엘리먼트를 모두 쿼리합니다.
    des = fixture.debugElement.queryAll(By.directive(HighlightDirective));

    // HighlightDirective를 사용하지 않은 h2를 쿼리합니다.
    bareH2 = fixture.debugElement.query(By.css('h2:not([highlight])'));
  });

  // 색상 테스트
  it('should have three highlighted elements', () => {
    expect(des.length).toBe(3);
  });

  it('should color 1st <h2> background "yellow"', () => {
    const bgColor = des[0].nativeElement.style.backgroundColor;
    expect(bgColor).toBe('yellow');
  });

  it('should color 2nd <h2> background w/ default color', () => {
    const dir = des[1].injector.get(HighlightDirective) as HighlightDirective;
    const bgColor = des[1].nativeElement.style.backgroundColor;
    expect(bgColor).toBe(dir.defaultColor);
  });

  it('should bind <input> background to value color', () => {
    // nativeElement를 사용하면 편합니다.
    const input = des[2].nativeElement as HTMLInputElement;
    expect(input.style.backgroundColor).toBe('cyan', 'initial backgroundColor');

    input.value = 'green';

    // 입력 필드의 값을 변경하고 DOM 이벤트를 보내면 Angular가 이 이벤트에 반응합니다.
    // IE와 같이 오래된 브라우저에서는 CustomEvent 를 사용해야 합니다. 아래 문서를 참고하세요.
    // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.style.backgroundColor).toBe('green', 'changed backgroundColor');
  });


  it('bare <h2> should not have a customProperty', () => {
    expect(bareH2.properties.customProperty).toBeUndefined();
  });
  // #enddocregion selected-tests

  // Removed on 12/02/2016 when ceased public discussion of the `Renderer`. Revive in future?
  // // customProperty tests
  // it('all highlighted elements should have a true customProperty', () => {
  //   const allTrue = des.map(de => !!de.properties['customProperty']).every(v => v === true);
  //   expect(allTrue).toBe(true);
  // });

  // injected directive
  // attached HighlightDirective can be injected
  it('can inject `HighlightDirective` in 1st <h2>', () => {
    const dir = des[0].injector.get(HighlightDirective);
    expect(dir).toBeTruthy();
  });

  it('cannot inject `HighlightDirective` in 3rd <h2>', () => {
    const dir = bareH2.injector.get(HighlightDirective, null);
    expect(dir).toBe(null);
  });

  // DebugElement.providerTokens
  // attached HighlightDirective should be listed in the providerTokens
  it('should have `HighlightDirective` in 1st <h2> providerTokens', () => {
    expect(des[0].providerTokens).toContain(HighlightDirective);
  });

  it('should not have `HighlightDirective` in 3rd <h2> providerTokens', () => {
    expect(bareH2.providerTokens).not.toContain(HighlightDirective);
  });
});
