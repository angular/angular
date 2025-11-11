# 3장: 생명주기 연대기

> *"정확히 언제 데이터를 로드해야 할까?"*

## 문제

Alex는 사용자 데이터를 로드해야 했지만, 로딩 로직을 어디에 넣어야 할지 확신이 서지 않았습니다. 생성자에 넣어야 할까요? `ngOnInit`? `ngAfterViewInit`? 각각 작동하는 것 같았지만... 때때로만 그랬습니다.

## 8가지 생명주기 훅

```typescript
// 완전한 생명주기 순서
export class LifecycleComponent implements
  OnChanges, OnInit, DoCheck,
  AfterContentInit, AfterContentChecked,
  AfterViewInit, AfterViewChecked, OnDestroy {

  constructor() { }                      // 0. DI가 여기서 발생
  ngOnChanges(changes: SimpleChanges) {} // 1. Input 변경
  ngOnInit() {}                          // 2. 컴포넌트 초기화됨
  ngDoCheck() {}                         // 3. 커스텀 변경 감지
  ngAfterContentInit() {}                // 4. 콘텐츠 자식 준비됨
  ngAfterContentChecked() {}             // 5. 콘텐츠 확인됨
  ngAfterViewInit() {}                   // 6. 뷰 자식 준비됨
  ngAfterViewChecked() {}                // 7. 뷰 확인됨
  ngOnDestroy() {}                       // 8. 정리
}
```

## 언제 각 훅을 사용할까

### Constructor: DI만
```typescript
constructor(private service: MyService) {
  // ✅ 의존성 주입
  // ❌ 여기서 @Input() 접근하지 마세요 (아직 설정되지 않음!)
  // ❌ ViewChild 접근하지 마세요 (아직 사용 불가!)
}
```

### ngOnInit: 데이터 로딩
```typescript
ngOnInit() {
  // ✅ 서비스에서 데이터 로드
  // ✅ 컴포넌트 상태 초기화
  // ✅ @Input() 값 사용 가능
  this.loadData();
}
```

### ngAfterViewInit: DOM 접근
```typescript
@ViewChild('canvas') canvas!: ElementRef;

ngAfterViewInit() {
  // ✅ ViewChild/ViewChildren 접근
  // ✅ 직접 DOM 조작
  const ctx = this.canvas.nativeElement.getContext('2d');
}
```

## 심층 분석

완전한 구현 세부사항은 `packages/core/src/render3/interfaces/lifecycle_hooks.ts`의 소스 코드를 참조하세요.

**[4장: 렌더링 엔진으로 계속 →](04-rendering-engine.md)**
