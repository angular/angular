# Zone.js 종합 예제

Angular의 `Zone.js`를 심층 분석하고, `NgZone` API를 활용하여 성능을 최적화하는 완전한 가이드입니다.

## 목차

1. [개요](#개요)
2. [프로젝트 구조](#프로젝트-구조)
3. [주요 개념](#주요-개념)
4. [파일 설명](#파일-설명)
5. [시작하기](#시작하기)
6. [예제 설명](#예제-설명)
7. [성능 최적화 팁](#성능-최적화-팁)

## 개요

Zone.js는 Angular의 변경 감지 메커니즘의 핵심입니다. 이 프로젝트는 다음을 다룹니다:

- **Zone.js의 기본 개념**: Zone이 무엇이고 어떻게 작동하는지
- **NgZone API**: Angular에서 Zone을 제어하는 방법
- **runOutsideAngular**: 성능 최적화를 위한 핵심 기법
- **변경 감지 추적**: 언제 변경 감지가 실행되는지 이해하기
- **실전 최적화**: 마우스, 스크롤, 타이머, WebSocket 등의 최적화 방법

## 프로젝트 구조

```
06-zone/
├── src/
│   ├── app/
│   │   ├── app.component.ts          # 메인 컴포넌트 - Zone 기본 개념
│   │   ├── outside-zone.component.ts # runOutsideAngular 데모
│   │   └── performance.component.ts  # 성능 최적화 실전 예제
│   ├── index.html                    # 진입점
│   ├── main.ts                       # 부트스트랩 코드
│   └── styles.css                    # 전역 스타일
├── angular.json                      # Angular CLI 설정
├── tsconfig.json                     # TypeScript 설정
├── tsconfig.app.json                 # 앱 TypeScript 설정
├── package.json                      # 의존성
├── .gitignore                        # Git 무시 파일
├── .nvmrc                            # Node.js 버전 명시
└── README.md                         # 이 파일
```

## 주요 개념

### Zone.js란?

Zone.js는 비동기 작업을 추적하는 라이브러리입니다:

- **Promise**: 마이크로태스크
- **setTimeout/setInterval**: 매크로태스크
- **이벤트 리스너**: DOM 이벤트
- **XHR/Fetch**: HTTP 요청

### NgZone의 역할

```typescript
constructor(private ngZone: NgZone) {}

// Zone 내부에서 실행 (변경 감지 발생)
this.ngZone.run(() => {
  // 작업
});

// Zone 외부에서 실행 (변경 감지 안 함)
this.ngZone.runOutsideAngular(() => {
  // 작업
});

// Zone 이벤트 모니터링
this.ngZone.onStable.subscribe(() => {
  // 모든 작업 완료
});

this.ngZone.onUnstable.subscribe(() => {
  // 새 작업 시작
});
```

### 변경 감지 흐름

```
비동기 작업 발생 (Promise, setTimeout 등)
    ↓
onUnstable 이벤트 발생
    ↓
비동기 작업 완료
    ↓
onStable 이벤트 발생
    ↓
변경 감지 실행
    ↓
DOM 업데이트
```

## 파일 설명

### src/app/app.component.ts

메인 컴포넌트로 Zone.js의 기본 개념을 시연합니다:

- **Zone 상태 추적**: 현재 Zone 내부/외부 상태 표시
- **비동기 작업**: Promise, setTimeout, 이벤트 핸들러
- **변경 감지 추적**: onStable 이벤트 모니터링
- **Zone API**: onStable, onUnstable 구독
- **마이크로/매크로 태스크**: 실행 순서 이해
- **실시간 로깅**: 모든 Zone 이벤트 추적

```typescript
// 예제 1: Promise는 변경 감지를 트리거합니다
Promise.resolve().then(() => {
  this.data = 'Updated';
  // 변경 감지 자동 실행
});

// 예제 2: onStable 이벤트 구독
this.ngZone.onStable.subscribe(() => {
  console.log('변경 감지 완료');
});
```

### src/app/outside-zone.component.ts

`runOutsideAngular`를 사용한 성능 최적화:

- **기본 비교**: Zone 내부 vs 외부 작업의 차이
- **마우스 추적**: 고빈도 이벤트 처리
- **Zone 재진입**: runOutsideAngular 내에서 run()으로 다시 들어가기
- **성능 비교**: 정량적인 성능 개선 측정

```typescript
// 성능 최적화: Zone 외부에서 마우스 추적
this.ngZone.runOutsideAngular(() => {
  document.addEventListener('mousemove', (e) => {
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
    // 변경 감지 안 함!
  });
});

// 필요할 때만 Zone으로 복귀
this.ngZone.run(() => {
  this.updateUI();
});
```

### src/app/performance.component.ts

실전 성능 최적화 기법:

#### 1. 고빈도 이벤트 최적화
- 스크롤 이벤트: runOutsideAngular + 배치 업데이트
- 마우스/터치: Zone 외부에서 처리

#### 2. RequestAnimationFrame (RAF) 최적화
- Zone 외부에서 RAF 실행
- 필요할 때만 Zone으로 복귀
- 프레임 드롭 방지

```typescript
this.ngZone.runOutsideAngular(() => {
  const animate = () => {
    // 애니메이션 로직
    requestAnimationFrame(animate);
  };
  animate();
});
```

#### 3. 타이머 기반 업데이트
- setInterval을 Zone 외부에서 실행
- 배치 처리로 변경 감지 최소화
- 게임 루프 등에 적용 가능

#### 4. WebSocket/Server-Sent Events
- 메시지를 Zone 외부에서 수신
- N개씩 배치 처리하여 UI 업데이트
- 네트워크 부하와 렌더링 분리

#### 5. Best Practices 및 메모리 관리
- 구독 해제 필수
- 리소스 정리 패턴

## 시작하기

### 1. 프로젝트 설정

```bash
cd 06-zone
npm install
```

### 2. 개발 서버 시작

```bash
npm start
```

브라우저에서 `http://localhost:4200`으로 접속합니다.

### 3. 프로덕션 빌드

```bash
npm run build
```

## 예제 설명

### 섹션 1: Zone.js 기본 개념

**목표**: Zone이 비동기 작업을 어떻게 추적하는지 이해하기

- 간단한 Promise 작업
- setTimeout 작업
- 이벤트 리스너
- 변경 감지 자동 트리거 확인

### 섹션 2: NgZone API 상세

**목표**: NgZone의 주요 메서드 학습

```typescript
// 동기 작업 실행
this.ngZone.run(() => {});

// 비동기 작업 실행
this.ngZone.runOutsideAngular(() => {});

// Zone 상태 모니터링
this.ngZone.onStable.subscribe(() => {});
this.ngZone.onUnstable.subscribe(() => {});
this.ngZone.hasPendingAsyncActions; // 대기 중인 작업
this.ngZone.hasPendingMicrotasks;    // 마이크로태스크 대기
```

### 섹션 3: 변경 감지 추적

**목표**: 변경 감지가 언제 실행되는지 추적

- onStable 이벤트로 변경 감지 완료 감지
- 변경 감지 횟수 카운팅
- 성능 메트릭 수집

### 섹션 4: runOutsideAngular 데모

**목표**: 성능 최적화의 핵심 기법 학습

```typescript
// 나쁜 예: 매우 느림
document.addEventListener('mousemove', (e) => {
  this.mouseX = e.clientX; // 변경 감지 발생!
});

// 좋은 예: 빠름
this.ngZone.runOutsideAngular(() => {
  document.addEventListener('mousemove', (e) => {
    this.mouseX = e.clientX; // 변경 감지 안 함
  });
});
```

### 섹션 5: 성능 최적화 비교

**목표**: 정량적인 성능 개선 확인

각 시나리오에서 Zone 내/외 성능 비교:
- 마우스 이벤트: 50-100배 성능 개선
- 스크롤 이벤트: 변경 감지 99% 감소
- RAF 애니메이션: 프레임 드롭 해소
- WebSocket: 변경 감지 90% 감소

## 성능 최적화 팁

### 1. Zone 외부로 옮길 작업들

```typescript
// 마우스/터치 이벤트
this.ngZone.runOutsideAngular(() => {
  element.addEventListener('mousemove', handler);
});

// 스크롤 이벤트
this.ngZone.runOutsideAngular(() => {
  window.addEventListener('scroll', handler);
});

// 애니메이션
this.ngZone.runOutsideAngular(() => {
  (function animate() {
    requestAnimationFrame(animate);
  })();
});

// 실시간 데이터
this.ngZone.runOutsideAngular(() => {
  this.websocket.onmessage = (event) => {
    this.processData(event.data);
  };
});
```

### 2. 배치 처리 패턴

```typescript
// 배치 큐 구현
private messageQueue: any[] = [];

this.ngZone.runOutsideAngular(() => {
  this.websocket.onmessage = (event) => {
    this.messageQueue.push(event.data);

    // 배치 크기에 도달하거나 타임아웃 시 처리
    if (this.messageQueue.length >= 10) {
      this.processBatch();
    }
  };
});

private processBatch() {
  this.ngZone.run(() => {
    // 배치 처리
    this.data.push(...this.messageQueue);
    this.messageQueue = [];
  });
}
```

### 3. 구독 정리 패턴

```typescript
export class MyComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];

  constructor(private ngZone: NgZone) {}

  ngOnInit() {
    const sub = this.ngZone.onStable.subscribe(() => {});
    this.subscriptions.push(sub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
```

### 4. ChangeDetectionStrategy.OnPush와 함께 사용

```typescript
@Component({
  selector: 'app-performance',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PerformanceComponent {
  constructor(
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  onDataUpdate() {
    // Zone 외부에서 데이터 업데이트
    this.ngZone.runOutsideAngular(() => {
      this.data = newData;
    });

    // 수동으로 변경 감지 트리거
    this.cdr.markForCheck();
  }
}
```

### 5. Zone.current 확인

```typescript
// 현재 Zone 확인
const currentZone = (Zone as any).current;
console.log(currentZone.name); // 'Angular Zone' 또는 다른 Zone

// Zone 외부인지 확인
if (currentZone.name !== 'angular') {
  // Zone 외부에서 실행 중
}
```

## 성능 메트릭

이 프로젝트에서는 다음 메트릭을 측정합니다:

| 메트릭 | 설명 |
|--------|------|
| 마우스 이벤트 횟수 | 발생한 마우스 이벤트 총 개수 |
| 변경 감지 횟수 | 실행된 변경 감지 총 개수 |
| 효율성 % | (마우스 이벤트 - CD) / 마우스 이벤트 |
| 프레임 수 | RAF로 처리된 프레임 |
| 메시지 처리 | WebSocket 메시지 수신 및 처리 |
| CD 비율 | 메시지당 실행된 변경 감지 수 |

## 주요 학습 포인트

1. **Zone.js는 Angular 변경 감지의 핵심**
   - 비동기 작업 추적
   - onStable/onUnstable 이벤트

2. **runOutsideAngular는 성능 최적화의 필수 도구**
   - 고빈도 이벤트는 Zone 외부에서 처리
   - 필요한 시점에만 Zone으로 돌아가기

3. **배치 처리로 변경 감지 최소화**
   - 여러 작업을 모아서 한 번에 처리
   - 특히 실시간 데이터에 효과적

4. **메모리 누수 방지**
   - Zone 리스너는 반드시 구독 해제
   - OnDestroy에서 정리

5. **성능 측정의 중요성**
   - 최적화 전후 비교
   - 정량적 개선 확인

## 참고 자료

- [Angular Zone.js Documentation](https://angular.io/api/core/NgZone)
- [Zone.js GitHub Repository](https://github.com/angular/zone.js)
- [Angular Change Detection Guide](https://angular.io/guide/change-detection)
- [Angular Performance Guide](https://angular.io/guide/performance-best-practices)

## 라이선스

MIT License

## 기여

이 프로젝트에 대한 개선 사항이나 피드백은 환영합니다.

---

**마지막 업데이트**: 2025년 11월
**Angular 버전**: 18+
**Node.js 버전**: 22
