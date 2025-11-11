# 1장: 의존성 주입의 미스터리

> *"왜 내 서비스가 주입되지 않을까?"*

## 문제

간단해 보이는 작업으로 시작되었습니다. Alex는 회사의 이커머스 플랫폼에 새로운 기능을 추가해야 했습니다: 타사 개발자가 결제 기능을 확장할 수 있는 플러그인 시스템이었죠. 충분히 간단해 보였습니다. 맞죠?

아키텍처는 합리적이었습니다:
- 플러그인을 관리하는 `PluginService`
- lazy-loaded 모듈의 개별 플러그인 구현
- 플러그인이 확장할 수 있는 `PaymentProcessor`

Alex는 서비스를 만들었습니다:

```typescript
// plugin.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PluginService {
  private plugins: Plugin[] = [];

  register(plugin: Plugin) {
    this.plugins.push(plugin);
    console.log('Plugin registered:', plugin.name);
  }

  getPlugins(): Plugin[] {
    return this.plugins;
  }
}
```

그리고 lazy-loaded 모듈에 플러그인을 만들었습니다:

```typescript
// payment-plugin/stripe-plugin.component.ts
import { Component, OnInit } from '@angular/core';
import { PluginService } from '../plugin.service';

@Component({
  selector: 'app-stripe-plugin',
  template: '<div>Stripe Plugin Loaded</div>',
  standalone: true
})
export class StripePluginComponent implements OnInit {
  constructor(private pluginService: PluginService) {}

  ngOnInit() {
    this.pluginService.register({
      name: 'Stripe',
      process: (payment) => {/* ... */}
    });
  }
}
```

Alex는 앱을 실행하고 결제 페이지로 이동했는데...

```
ERROR NullInjectorError: R3InjectorError(PaymentModule)[PluginService -> PluginService]:
  NullInjectorError: No provider for PluginService!
```

**"하지만 난 *제공했는데*!"** Alex가 화면을 향해 소리쳤습니다. "`providedIn: 'root'`라고 되어있잖아!"

## 조사 시작

초기 좌절이 가라앉은 후, Alex는 무슨 일이 일어나고 있는지 진짜로 이해하기로 결정했습니다. 단순히 고치는 것이 아니라 - *왜* 작동하지 않는지 이해하는 것이죠.

### 첫 번째 단계: 에러 메시지

에러 메시지를 분해해봅시다:

```
NullInjectorError: R3InjectorError(PaymentModule)[PluginService -> PluginService]:
  NullInjectorError: No provider for PluginService!
```

여기 몇 가지 흥미로운 것들이 있습니다:
- `R3InjectorError` - "R3"는 Ivy(Render3), Angular의 렌더링 엔진을 의미합니다
- `(PaymentModule)` - 프로바이더를 찾지 못한 인젝터
- `[PluginService -> PluginService]` - 의존성 체인
- `No provider for PluginService!` - 실제 문제

하지만 더 많은 질문이 생겼습니다:
- "인젝터"란 무엇일까요?
- 서비스가 'root'에 제공되는데 왜 `PaymentModule` 인젝터가 있을까요?
- Angular는 프로바이더를 어떻게 해결할까요?

소스 코드를 파헤칠 시간입니다.

## Angular 소스 코드 파헤치기

Alex는 Angular 저장소를 클론하고 `packages/core/src/di/`를 열었습니다. 이 디렉토리에는 의존성 주입 시스템이 포함되어 있습니다.

### 발견 1: 인젝터 계층 구조

첫 번째 파일: `injector.ts`

```typescript
// packages/core/src/di/injector.ts (lines 7-50)

/**
 * Concrete injectors implement this interface.
 */
export abstract class Injector {
  /**
   * Marker for NOT_FOUND value
   */
  static THROW_IF_NOT_FOUND = THROW_IF_NOT_FOUND;
  static NULL: Injector = new NullInjector();

  /**
   * Retrieves an instance from the injector based on the provided token.
   */
  abstract get<T>(
    token: ProviderToken<T>,
    notFoundValue?: T,
    options?: InjectOptions
  ): T;
}
```

💡 **핵심 통찰 #1**: `Injector`는 추상 클래스입니다. 여러 인젝터 구현이 있습니다!

Alex는 여러 인젝터 타입을 발견했습니다:
1. **NullInjector** - 모든 인젝터의 루트, 항상 throw함
2. **R3Injector** - 메인 런타임 인젝터 (EnvironmentInjector)
3. **NodeInjector** - 컴포넌트별 인젝터

이것은 **Angular가 계층 구조로 배열된 여러 인젝터를 가지고 있다**는 것을 의미합니다!

### 발견 2: R3Injector 구현

다음으로 Alex는 메인 인젝터 구현인 `r3_injector.ts`를 열었습니다:

```typescript
// packages/core/src/di/r3_injector.ts (단순화)

export class R3Injector extends EnvironmentInjector {
  /**
   * Map from provider token to provider record
   */
  private records = new Map<ProviderToken<any>, Record<any> | null>();

  /**
   * Parent injector (null at root)
   */
  readonly parent: Injector;

  /**
   * Providers scoped to this injector
   */
  readonly source: string | null;

  get<T>(
    token: ProviderToken<T>,
    notFoundValue: any = THROW_IF_NOT_FOUND,
    options: InjectOptions = InjectFlags.Default
  ): T {
    // Check if we have this provider
    const record = this.records.get(token);

    if (record === undefined) {
      // Not found in this injector
      // Try the parent injector
      const parent = this.parent;

      if (parent === Injector.NULL) {
        // We're at the root and still haven't found it
        if (notFoundValue === THROW_IF_NOT_FOUND) {
          throw new NullInjectorError(token);
        }
        return notFoundValue;
      }

      // Recursively search up the tree
      return parent.get(token, notFoundValue);
    }

    // We have a record! Now instantiate it
    return this.hydrate(token, record);
  }

  private hydrate<T>(token: ProviderToken<T>, record: Record<T>): T {
    // Handle circular dependencies
    if (record.value === CIRCULAR) {
      throw new Error('Circular dependency detected!');
    }

    // Mark as being constructed to detect circular deps
    if (record.value === NOT_YET) {
      record.value = CIRCULAR;
      record.value = record.factory!(); // Call the factory
    }

    return record.value;
  }
}
```

💡 **핵심 통찰 #2**: 프로바이더 해결은 인젝터 트리를 올라갑니다!

알고리즘은 다음과 같습니다:
1. 현재 인젝터에 프로바이더가 있는지 확인
2. 없으면 부모 인젝터 확인
3. 찾거나 NullInjector에 도달할 때까지 반복
4. NullInjector가 `NullInjectorError`를 throw함

### 발견 3: 인젝터 트리 구조

Alex는 배운 것을 스케치했습니다:

```
┌─────────────────────┐
│   NullInjector      │ ← 도달하면 에러 throw
└──────────┬──────────┘
           │
┌──────────┴──────────┐
│  Platform Injector  │ ← 플랫폼 레벨 서비스
└──────────┬──────────┘
           │
┌──────────┴──────────┐
│  Root Injector      │ ← providedIn: 'root' 서비스
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
┌───┴────┐   ┌───┴────┐
│Module A│   │Module B│ ← Lazy-loaded 모듈 인젝터
└───┬────┘   └────────┘
    │
┌───┴─────────┐
│  Component  │ ← NodeInjector (viewProviders, providers)
└─────────────┘
```

**이것이 "아하!" 순간이었습니다.**

Alex의 lazy-loaded 모듈이 `PluginService`를 주입하려고 했을 때, Angular는 다음을 찾았습니다:
1. 모듈의 인젝터에서 (찾지 못함)
2. 부모 인젝터에서... 그런데 잠깐, 어떤 부모일까요?

## 근본 원인

Alex는 문제를 깨달았습니다: **lazy-loaded 모듈은 자신의 인젝터 스코프를 만듭니다**, 그리고 서비스가 해당 스코프에서 접근할 수 없으면 주입이 실패합니다.

하지만 `providedIn: 'root'`는 모든 곳에서 사용 가능하게 해야 하는데... 맞죠?

### `providedIn: 'root'` 이해하기

Alex는 `injectable.ts`에서 답을 찾았습니다:

```typescript
// packages/core/src/di/injectable.ts

export interface InjectableOptions<T = any> {
  providedIn?: Type<any> | 'root' | 'platform' | 'any' | null;
  factory?: () => T;
}

/**
 * Injectable decorator and metadata.
 */
export function Injectable(options?: InjectableOptions): TypeDecorator {
  return makeDecorator(
    'Injectable',
    undefined,
    undefined,
    undefined,
    (type: Type<any>, meta: Injectable) => {
      // Register with the root injector if specified
      if (meta.providedIn !== undefined) {
        type.ɵprov = defineInjectable({
          token: type,
          providedIn: meta.providedIn,
          factory: type.prototype.constructor.length > 0
            ? () => new type()
            : meta.factory || (() => new type())
        });
      }
    }
  );
}
```

`providedIn: 'root'`는 Angular에게 서비스를 루트 인젝터에 자동으로 등록하라고 알려줍니다. 이것을 **tree-shakable providers**라고 합니다 - 서비스가 사용되지 않으면 번들에 포함되지 않습니다.

## 실제 문제

몇 시간의 디버깅 후, Alex는 문제가 Angular가 아니라 **순환 import**에 있다는 것을 발견했습니다.

`PluginService`가 lazy-loaded 모듈의 타입을 import했고, 해당 모듈은 `PluginService`를 import했습니다. 이것이 모듈 로딩을 깨뜨리는 순환 의존성을 만들었습니다.

```typescript
// ❌ 이렇게 하지 마세요
// plugin.service.ts
import { StripePayment } from './payment-plugin/stripe'; // 순환!

// payment-plugin/stripe.ts
import { PluginService } from '../plugin.service'; // 순환!
```

해결책은 공유 인터페이스를 별도 파일로 추출하는 것이었습니다:

```typescript
// ✅ 이렇게 하세요
// plugin.interface.ts
export interface Plugin {
  name: string;
  process(payment: any): void;
}

// plugin.service.ts
import { Plugin } from './plugin.interface';

// payment-plugin/stripe.ts
import { Plugin } from '../plugin.interface';
import { PluginService } from '../plugin.service'; // 더 이상 순환 아님!
```

## 심층 분석: DI가 실제로 작동하는 방법

이제 Alex는 즉각적인 문제를 해결했으므로 전체 그림을 이해하고 싶었습니다.

### 프로바이더 해결 알고리즘

Angular가 프로바이더를 해결하는 데 사용하는 완전한 알고리즘은 다음과 같습니다:

```typescript
// r3_injector.ts와 render3/di.ts에서 단순화

function resolveDependency<T>(
  token: ProviderToken<T>,
  flags: InjectFlags,
  lView: LView
): T {
  // 1단계: NodeInjector (컴포넌트 레벨) 시도
  if (!(flags & InjectFlags.SkipSelf)) {
    const nodeInjector = getCurrentNodeInjector();
    const value = nodeInjector.get(token, NOT_FOUND);
    if (value !== NOT_FOUND) {
      return value;
    }
  }

  // 2단계: 컴포넌트 트리를 올라가며 확인
  let currentView = lView;
  while (currentView !== null) {
    const tNode = currentView[TVIEW].node;
    const nodeInjector = new NodeInjector(tNode, currentView);
    const value = nodeInjector.get(token, NOT_FOUND);

    if (value !== NOT_FOUND) {
      return value;
    }

    currentView = currentView[PARENT];
  }

  // 3단계: EnvironmentInjector (모듈/루트 레벨) 시도
  const environmentInjector = lView[ENVIRONMENT_INJECTOR];
  const value = environmentInjector.get(token, NOT_FOUND);

  if (value !== NOT_FOUND) {
    return value;
  }

  // 4단계: 부모 environment 인젝터 시도
  let currentInjector = environmentInjector.parent;
  while (currentInjector !== null) {
    const value = currentInjector.get(token, NOT_FOUND);
    if (value !== NOT_FOUND) {
      return value;
    }
    currentInjector = currentInjector.parent;
  }

  // 5단계: 어디에도 찾지 못함
  throw new NullInjectorError(token);
}
```

### 프로바이더 타입

Alex는 의존성을 제공하는 여러 방법이 있다는 것을 배웠습니다:

```typescript
// 1. Value Provider - 특정 값 제공
{
  provide: API_URL,
  useValue: 'https://api.example.com'
}

// 2. Class Provider - 다른 클래스 제공
{
  provide: Logger,
  useClass: FileLogger
}

// 3. Factory Provider - 팩토리 함수 사용
{
  provide: DataService,
  useFactory: (http: HttpClient) => {
    return environment.production
      ? new ProductionDataService(http)
      : new MockDataService();
  },
  deps: [HttpClient]
}

// 4. Existing Provider - 다른 토큰에 대한 별칭
{
  provide: OldService,
  useExisting: NewService
}

// 5. Type Provider - 클래스 자체
{
  provide: MyService,
  useClass: MyService
}
// 또는 간단하게: MyService (축약형)
```

### Multi-Providers

Alex가 발견한 가장 강력한 기능 중 하나는 **multi-providers**였습니다:

```typescript
// 같은 토큰에 대한 여러 프로바이더
export const HTTP_INTERCEPTORS = new InjectionToken<HttpInterceptor[]>(
  'HTTP_INTERCEPTORS',
  { multi: true }
);

// 여러 interceptor 제공
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: LoggingInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: CacheInterceptor, multi: true }
]

// 주입되면 모든 프로바이더의 배열을 받음
constructor(@Inject(HTTP_INTERCEPTORS) private interceptors: HttpInterceptor[]) {
  // interceptors = [AuthInterceptor, LoggingInterceptor, CacheInterceptor]
}
```

이것이 Angular의 HTTP 인터셉터, 밸리데이터, 라우트 가드가 작동하는 방식입니다!

### Injection Token

클래스가 아닌 의존성의 경우, Angular는 `InjectionToken`을 제공합니다:

```typescript
// packages/core/src/di/injection_token.ts

export class InjectionToken<T> {
  constructor(
    protected _desc: string,
    options?: {
      providedIn?: Type<any> | 'root' | 'platform' | 'any' | null;
      factory: () => T;
    }
  ) {}
}

// 사용법:
export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    baseUrl: 'https://api.example.com',
    timeout: 5000
  })
});

// 주입:
constructor(@Inject(API_CONFIG) private config: ApiConfig) {}
```

### 순환 의존성 감지

Alex는 Angular가 순환 의존성을 감지하는 방법에 매료되었습니다:

```typescript
// r3_injector.ts에서

const NOT_YET = {};
const CIRCULAR = {};

class Record<T> {
  factory: (() => T) | null;
  value: T | {} = NOT_YET;
  multi: boolean = false;
}

private hydrate<T>(token: ProviderToken<T>, record: Record<T>): T {
  // 이미 구성됨
  if (record.value !== NOT_YET && record.value !== CIRCULAR) {
    return record.value as T;
  }

  // 현재 구성 중 - 순환 의존성!
  if (record.value === CIRCULAR) {
    throw new Error(`Circular dependency: ${stringify(token)}`);
  }

  // 구성 중으로 표시
  record.value = CIRCULAR;

  try {
    // 인스턴스 구성
    const instance = record.factory!();
    record.value = instance;
    return instance;
  } catch (e) {
    // 에러 시 리셋
    record.value = NOT_YET;
    throw e;
  }
}
```

알고리즘은 **센티널 값**을 사용합니다:
- `NOT_YET`: 프로바이더가 아직 인스턴스화되지 않음
- `CIRCULAR`: 프로바이더가 현재 인스턴스화되는 중
- 실제 값: 프로바이더가 인스턴스화됨

`CIRCULAR`로 표시된 프로바이더를 요청하면, 그것을 구성하는 중이라는 의미입니다 - 순환 의존성!

## 플러그인 시스템 구축하기 (올바른 방법)

깊은 이해로 무장한 Alex는 플러그인 시스템을 재구축했습니다:

```typescript
// plugin.interface.ts - 공유 인터페이스 (순환 의존성 없음)
export interface Plugin {
  name: string;
  version: string;
  initialize(): void;
  execute(context: any): void;
}

export interface PluginConfig {
  maxPlugins?: number;
  autoInitialize?: boolean;
}

// plugin.tokens.ts - Injection 토큰
import { InjectionToken } from '@angular/core';

export const PLUGIN_CONFIG = new InjectionToken<PluginConfig>('PLUGIN_CONFIG', {
  providedIn: 'root',
  factory: () => ({
    maxPlugins: 10,
    autoInitialize: true
  })
});

export const PLUGINS = new InjectionToken<Plugin[]>('PLUGINS');

// plugin.service.ts - 핵심 서비스
import { Injectable, Inject, Optional } from '@angular/core';
import { Plugin, PluginConfig } from './plugin.interface';
import { PLUGIN_CONFIG, PLUGINS } from './plugin.tokens';

@Injectable({ providedIn: 'root' })
export class PluginService {
  private plugins: Map<string, Plugin> = new Map();

  constructor(
    @Inject(PLUGIN_CONFIG) private config: PluginConfig,
    @Optional() @Inject(PLUGINS) private registeredPlugins: Plugin[] = []
  ) {
    // multi-provider를 통해 제공된 플러그인 자동 등록
    if (this.config.autoInitialize) {
      this.registeredPlugins.forEach(plugin => this.register(plugin));
    }
  }

  register(plugin: Plugin): void {
    if (this.plugins.size >= this.config.maxPlugins!) {
      throw new Error('Maximum plugins reached');
    }

    this.plugins.set(plugin.name, plugin);
    plugin.initialize();
  }

  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  execute(name: string, context: any): void {
    const plugin = this.get(name);
    if (!plugin) {
      throw new Error(`Plugin not found: ${name}`);
    }
    plugin.execute(context);
  }
}

// stripe-plugin/stripe.plugin.ts - 플러그인 구현
import { Injectable } from '@angular/core';
import { Plugin } from '../plugin.interface';

@Injectable()
export class StripePlugin implements Plugin {
  name = 'Stripe';
  version = '1.0.0';

  initialize(): void {
    console.log('Stripe plugin initialized');
  }

  execute(context: any): void {
    console.log('Processing payment with Stripe', context);
  }
}

// stripe-plugin/stripe.module.ts - Lazy-loaded 모듈
import { NgModule } from '@angular/core';
import { StripePlugin } from './stripe.plugin';
import { PLUGINS } from '../plugin.tokens';

@NgModule({
  providers: [
    StripePlugin,
    {
      provide: PLUGINS,
      useExisting: StripePlugin,
      multi: true
    }
  ]
})
export class StripePluginModule {
  // PLUGINS 토큰을 통해 플러그인 자동 등록
}
```

이 디자인은 다음을 사용합니다:
- ✅ **InjectionToken** 설정용
- ✅ **Multi-providers** 플러그인 등록용
- ✅ **Optional injection** 누락된 플러그인을 우아하게 처리
- ✅ **순환 의존성 없음** 인터페이스 추출을 통해
- ✅ **Tree-shakable providers** 최적 번들 크기를 위해

## DI 문제 디버깅하기

Alex는 DI 문제를 디버깅하는 기법 목록을 작성했습니다:

### 1. Angular DevTools 사용

Angular DevTools 브라우저 확장 프로그램은 인젝터 트리를 보여줍니다:

```typescript
// Chrome DevTools 콘솔에서:
ng.getInjector($0) // 선택된 요소의 인젝터 가져오기
ng.getDirectives($0) // 컴포넌트 인스턴스 가져오기
```

### 2. Injector 주입

```typescript
import { Component, Injector } from '@angular/core';

@Component({...})
export class DebugComponent {
  constructor(private injector: Injector) {
    console.log('Current injector:', this.injector);
    console.log('Parent injector:', this.injector.parent);

    // 서비스 가져오기 시도
    const service = this.injector.get(MyService, null);
    console.log('Service:', service);
  }
}
```

### 3. InjectFlags 사용

```typescript
import { Component, inject, InjectFlags } from '@angular/core';

@Component({...})
export class SmartComponent {
  constructor() {
    // 자신은 건너뛰고 부모만 검색
    const service1 = inject(MyService, { skipSelf: true });

    // 자신만 확인하고 부모 검색 안 함
    const service2 = inject(MyService, { self: true });

    // throw하지 않고 null 반환
    const service3 = inject(MyService, { optional: true });

    // 이 컴포넌트의 NodeInjector 건너뛰기
    const service4 = inject(MyService, InjectFlags.SkipSelf);
  }
}
```

### 4. Provider 스코프 확인

```typescript
// ❌ 잘못된 스코프
@Component({
  selector: 'app-parent',
  providers: [SharedService] // 컴포넌트당 새 인스턴스!
})
export class ParentComponent {}

@Component({
  selector: 'app-child'
})
export class ChildComponent {
  // 부모와 다른 인스턴스를 받음!
  constructor(private service: SharedService) {}
}

// ✅ 올바른 스코프
@Injectable({ providedIn: 'root' }) // 싱글톤
export class SharedService {}
```

## 핵심 요점

이 심층 분석 후, Alex는 다음을 이해했습니다:

### 1. **인젝터 계층 구조**
Angular는 트리로 배열된 여러 인젝터를 가지고 있습니다. 해결은 프로바이더를 찾거나 NullInjector가 throw할 때까지 이 트리를 올라갑니다.

### 2. **프로바이더 타입이 중요함**
다른 프로바이더 타입(Value, Class, Factory, Existing)은 다른 목적을 제공합니다. 사용 사례에 맞는 올바른 것을 선택하세요.

### 3. **스코프가 중요함**
서비스를 제공하는 위치가 수명과 가시성을 결정합니다:
- `providedIn: 'root'` → 전체 앱에 대한 싱글톤
- 컴포넌트의 `providers: []` → 컴포넌트당 새 인스턴스
- 컴포넌트의 `viewProviders: []` → 뷰에만 표시 (콘텐츠 자식 제외)

### 4. **Multi-Providers가 확장 포인트를 가능하게 함**
플러그인 시스템, 인터셉터, 밸리데이터에 multi-providers를 사용하세요.

### 5. **순환 의존성은 피해야 함**
공유 인터페이스와 타입을 추출하여 순환 import를 방지하세요.

### 6. **Tree-Shakable Providers가 번들을 최적화함**
`providedIn: 'root'`는 사용되지 않는 서비스를 프로덕션 빌드에서 제거할 수 있게 합니다.

## 실용적 적용

Alex는 이제 이 지식을 다음과 같이 사용합니다:

1. **더 나은 아키텍처 설계** - 주입 스코프를 이해하면 더 나은 서비스 구성으로 이어집니다

2. **더 빠른 디버깅** - DI 에러가 이제 이해됩니다. Alex는 스코프 문제, 순환 의존성, 누락된 프로바이더를 빠르게 식별할 수 있습니다.

3. **확장 가능한 시스템 구축** - Multi-providers는 플러그인 아키텍처와 확장 포인트를 가능하게 합니다.

4. **번들 최적화** - Tree-shakable providers와 적절한 스코핑은 번들 크기를 줄입니다.

5. **더 나은 테스트 작성** - DI를 이해하면 모킹과 의존성 교체가 간단해집니다.

## 코드 예제: 고급 DI 패턴

완전한 작동 예제는 `code-examples/01-di/`를 참조하세요. 다음을 포함합니다:
- 계층적 인젝터 데모
- multi-providers를 사용한 플러그인 시스템
- 의존성이 있는 팩토리 프로바이더
- Injection 토큰 사용
- 순환 의존성 방지
- 테스트 전략

실행하기:
```bash
cd code-examples/01-di/
npm install
npm start
```

## 다음 단계

Alex는 의존성 주입 미스터리를 해결했습니다. 하지만 새로운 질문이 생겼습니다: **"Angular는 언제 UI를 업데이트해야 하는지 어떻게 알까?"**

Alex가 버튼을 클릭하면 컴포넌트 속성이 변경되고 뷰가 업데이트되었습니다. 마법 같죠?

더 이상은 아닙니다. 다음 챕터에서 Alex는 **변경 감지** 시스템으로 깊이 파고들어 Angular가 변경 사항을 추적하고 DOM을 업데이트하는 방법을 이해합니다.

---

**다음**: [2장: 변경 감지의 수수께끼](02-change-detection.md)

## 추가 읽을거리

- Angular 소스: `packages/core/src/di/`
- DI 문서: https://angular.dev/guide/dependency-injection
- Ivy DI 설계: https://github.com/angular/angular/blob/main/packages/core/src/di/README.md
- Tree-shakable Providers: https://angular.dev/guide/dependency-injection-providers#tree-shakable-providers

## Alex의 일지에서

*"오늘 마침내 의존성 주입을 이해했다. 인젝터 트리, 프로바이더 해결, multi-providers - 이제 모두 이해된다. DI를 3년 동안 사용했는데 어떻게 작동하는지 모르고 있었다니 믿을 수 없다.*

*핵심 통찰: Angular는 '하나의 인젝터'가 아니다 - 전체 트리다! 그래서 스코프가 그렇게 중요한 것이다.*

*다음: 이 변경 감지를 알아내자. Angular는 언제 다시 렌더링해야 하는지 어떻게 알까?"*
