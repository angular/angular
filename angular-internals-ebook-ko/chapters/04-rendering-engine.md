# 4장: 렌더링 엔진의 비밀

> *"Angular는 어떻게 DOM을 생성하고 업데이트할까?"*

## LView 구조

Angular의 Ivy 렌더링 엔진은 배열 기반 뷰 구조를 사용합니다:

```typescript
// 단순화된 LView 구조
[
  // HEADER (27 슬롯)
  HOST,                    // 0
  TVIEW,                   // 1
  FLAGS,                   // 2
  PARENT,                  // 3
  NEXT,                    // 4
  TRANSPLANTED_VIEWS_TO_REFRESH, // 5
  T_HOST,                  // 6
  CLEANUP,                 // 7
  CONTEXT,                 // 8
  INJECTOR,                // 9
  ENVIRONMENT,             // 10
  RENDERER,                // 11
  // ... 더 많은 헤더 슬롯 ...
  HEADER_OFFSET,           // 27

  // CONTENT (동적)
  <first element>,         // 27
  <text node>,             // 28
  <component instance>,    // 29
  // ...
]
```

## 명령어 기반 VM

템플릿은 명령어 호출로 컴파일됩니다:

```html
<!-- 템플릿 -->
<div class="card">
  <h2>{{ title }}</h2>
  <p>{{ description }}</p>
</div>
```

```typescript
// 컴파일된 출력
function Template_MyComponent(rf: RenderFlags, ctx: MyComponent) {
  if (rf & RenderFlags.Create) {
    ɵɵelementStart(0, 'div');
    ɵɵelementStart(1, 'h2');
    ɵɵtext(2);
    ɵɵelementEnd();
    ɵɵelementStart(3, 'p');
    ɵɵtext(4);
    ɵɵelementEnd();
    ɵɵelementEnd();
  }
  if (rf & RenderFlags.Update) {
    ɵɵadvance(2);
    ɵɵtextInterpolate(ctx.title);
    ɵɵadvance(2);
    ɵɵtextInterpolate(ctx.description);
  }
}
```

## 핵심 통찰

1. **2단계 렌더링**: Create 단계 (한 번) + Update 단계 (변경 시)
2. **인덱스 기반**: 모든 것이 숫자 인덱스로 접근됨
3. **VM과 유사**: 명령어 호출의 시퀀스
4. **최적화 가능**: 컴파일러가 명령어를 병합/축소할 수 있음

**[5장: 컴파일러의 마법으로 계속 →](05-compiler.md)**
