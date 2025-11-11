# 5장: 컴파일러의 마법

> *"내 템플릿에 무슨 일이 일어날까?"*

## 컴파일 파이프라인

```
템플릿 문자열 → 파싱 → 변환 → 생성 → JavaScript
```

### 입력 (템플릿)
```html
<div *ngIf="isVisible" class="container">
  <app-child [data]="items" (click)="handleClick()"></app-child>
</div>
```

### 출력 (생성된 코드)
```typescript
function MyComponent_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, MyComponent_div_0_Template, 2, 0, "div", 0);
  }
  if (rf & 2) {
    ɵɵproperty("ngIf", ctx.isVisible);
  }
}

function MyComponent_div_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 1);
    ɵɵelementStart(1, "app-child", 2);
    ɵɵlistener("click", function() { return ctx.handleClick(); });
    ɵɵelementEnd();
    ɵɵelementEnd();
  }
  if (rf & 2) {
    ɵɵadvance(1);
    ɵɵproperty("data", ctx.items);
  }
}
```

## AOT vs JIT

- **AOT** (Ahead-of-Time): 빌드 중 컴파일 → 작은 번들, 빠른 시작
- **JIT** (Just-in-Time): 브라우저에서 컴파일 → 느림, 번들에 컴파일러 포함

**프로덕션에서는 항상 AOT 사용!**

**[6장: Zone.js 심층 분석으로 계속 →](06-zone-js.md)**
