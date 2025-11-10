# 4장: 렌더링 엔진의 비밀

> *"Angular는 어떻게 DOM을 생성하고 업데이트할까?"*

## LView 구조

Ivy 렌더링 엔진은 배열 기반 뷰 구조를 사용합니다:

```typescript
[
  // HEADER (27 슬롯)
  HOST,                    // 0
  TVIEW,                   // 1
  FLAGS,                   // 2
  PARENT,                  // 3
  // ...
  HEADER_OFFSET,           // 27

  // CONTENT (동적)
  <first element>,         // 27
  <text node>,             // 28
  <component instance>,    // 29
]
```

## 명령어 기반 VM

템플릿은 명령어 호출로 컴파일됩니다:

```html
<!-- 템플릿 -->
<div class="card">
  <h2>{{ title }}</h2>
</div>
```

```typescript
// 컴파일된 출력
function Template(rf: RenderFlags, ctx: MyComponent) {
  if (rf & RenderFlags.Create) {
    ɵɵelementStart(0, 'div');
    ɵɵelementStart(1, 'h2');
    ɵɵtext(2);
    ɵɵelementEnd();
    ɵɵelementEnd();
  }
  if (rf & RenderFlags.Update) {
    ɵɵadvance(2);
    ɵɵtextInterpolate(ctx.title);
  }
}
```

## 2단계 렌더링

- **Create**: DOM 생성 (한 번)
- **Update**: 바인딩 업데이트 (변경 시마다)

**다음**: [5장: 컴파일러의 마법](05-compiler.md)
