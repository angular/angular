# 3장: 생명주기 연대기

> *"정확히 언제 데이터를 로드해야 할까?"*

## 8가지 생명주기 훅

```typescript
export class LifecycleComponent implements
  OnChanges, OnInit, DoCheck,
  AfterContentInit, AfterContentChecked,
  AfterViewInit, AfterViewChecked, OnDestroy {

  constructor() { }                      // 0. DI 발생
  ngOnChanges(changes: SimpleChanges) {} // 1. Input 변경
  ngOnInit() {}                          // 2. 컴포넌트 초기화
  ngDoCheck() {}                         // 3. 커스텀 변경 감지
  ngAfterContentInit() {}                // 4. 콘텐츠 자식 준비
  ngAfterContentChecked() {}             // 5. 콘텐츠 확인됨
  ngAfterViewInit() {}                   // 6. 뷰 자식 준비
  ngAfterViewChecked() {}                // 7. 뷰 확인됨
  ngOnDestroy() {}                       // 8. 정리
}
```

## 언제 각 훅을 사용할까

### Constructor: DI만
```typescript
constructor(private service: MyService) {
  // ✅ 의존성 주입
  // ❌ @Input() 접근 안 됨 (아직 설정 안 됨!)
  // ❌ ViewChild 접근 안 됨 (아직 사용 불가!)
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

**다음**: [4장: 렌더링 엔진의 비밀](04-rendering-engine.md)
