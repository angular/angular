# 1장: 의존성 주입의 미스터리

> *"왜 내 서비스가 주입되지 않을까?"*

## 문제

간단해 보이는 작업으로 시작되었습니다. Alex는 회사의 이커머스 플랫폼에 새로운 기능을 추가해야 했습니다: 타사 개발자가 결제 기능을 확장할 수 있는 플러그인 시스템입니다.

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
  }

  getPlugins(): Plugin[] {
    return this.plugins;
  }
}
```

그리고 앱을 실행했더니...

```
ERROR NullInjectorError: R3InjectorError(PaymentModule)[PluginService -> PluginService]:
  NullInjectorError: No provider for PluginService!
```

**"하지만 난 제공했는데!"** Alex가 화면을 향해 소리쳤습니다. "`providedIn: 'root'`라고 되어있잖아!"

## 조사 시작

Alex는 무슨 일이 일어나고 있는지 진짜로 이해하기로 결정했습니다. 단순히 고치는 것이 아니라 - *왜* 작동하지 않는지 이해하는 것입니다.

### 첫 번째 발견: 인젝터 계층 구조

Angular 저장소를 클론하고 `packages/core/src/di/`를 열었습니다.

```typescript
// packages/core/src/di/injector.ts

export abstract class Injector {
  static THROW_IF_NOT_FOUND = THROW_IF_NOT_FOUND;
  static NULL: Injector = new NullInjector();

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

### 두 번째 발견: R3Injector 구현

```typescript
// packages/core/src/di/r3_injector.ts (단순화)

export class R3Injector extends EnvironmentInjector {
  private records = new Map<ProviderToken<any>, Record<any> | null>();
  readonly parent: Injector;

  get<T>(token: ProviderToken<T>, notFoundValue: any = THROW_IF_NOT_FOUND): T {
    // 현재 인젝터에서 프로바이더 확인
    const record = this.records.get(token);

    if (record === undefined) {
      // 이 인젝터에서 찾지 못함
      // 부모 인젝터 시도
      const parent = this.parent;

      if (parent === Injector.NULL) {
        // 루트에 도달했지만 여전히 찾지 못함
        if (notFoundValue === THROW_IF_NOT_FOUND) {
          throw new NullInjectorError(token);
        }
        return notFoundValue;
      }

      // 트리를 위로 재귀적으로 검색
      return parent.get(token, notFoundValue);
    }

    // 레코드가 있음! 이제 인스턴스화
    return this.hydrate(token, record);
  }
}
```

💡 **핵심 통찰 #2**: 프로바이더 해결은 인젝터 트리를 올라갑니다!

알고리즘:
1. 현재 인젝터에 프로바이더가 있는지 확인
2. 없으면 부모 인젝터 확인
3. 찾거나 NullInjector에 도달할 때까지 반복
4. NullInjector가 `NullInjectorError` throw

### 세 번째 발견: 인젝터 트리 구조

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

## 근본 원인

Alex는 문제를 깨달았습니다: **lazy-loaded 모듈은 자신의 인젝터 스코프를 만듭니다**, 그리고 서비스가 해당 스코프에서 접근할 수 없으면 주입이 실패합니다.

하지만 `providedIn: 'root'`는 모든 곳에서 사용 가능하게 해야 하는데... 맞죠?

### `providedIn: 'root'` 이해하기

```typescript
// packages/core/src/di/injectable.ts

export function Injectable(options?: InjectableOptions): TypeDecorator {
  return makeDecorator(
    'Injectable',
    undefined,
    undefined,
    undefined,
    (type: Type<any>, meta: Injectable) => {
      // 지정된 경우 루트 인젝터에 등록
      if (meta.providedIn !== undefined) {
        type.ɵprov = defineInjectable({
          token: type,
          providedIn: meta.providedIn,
          factory: meta.factory || (() => new type())
        });
      }
    }
  );
}
```

`providedIn: 'root'`는 Angular에게 서비스를 루트 인젝터에 자동으로 등록하라고 알려줍니다. 이것을 **tree-shakable providers**라고 합니다 - 서비스가 사용되지 않으면 번들에 포함되지 않습니다.

## 실제 문제

몇 시간의 디버깅 후, Alex는 문제가 Angular가 아니라 **순환 import**에 있다는 것을 발견했습니다.

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

### 프로바이더 타입

Angular는 의존성을 제공하는 여러 방법을 제공합니다:

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

### InjectionToken

클래스가 아닌 의존성의 경우, Angular는 `InjectionToken`을 제공합니다:

```typescript
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

Angular가 순환 의존성을 감지하는 방법:

```typescript
const NOT_YET = {};
const CIRCULAR = {};

class Record<T> {
  value: T | {} = NOT_YET;
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
  const instance = record.factory!();
  record.value = instance;
  return instance;
}
```

## 플러그인 시스템 구축하기 (올바른 방법)

깊은 이해로 무장한 Alex는 플러그인 시스템을 재구축했습니다:

```typescript
// plugin.interface.ts
export interface Plugin {
  name: string;
  version: string;
  initialize(): void;
  execute(context: any): void;
}

// plugin.tokens.ts
export const PLUGINS = new InjectionToken<Plugin[]>('PLUGINS');

// plugin.service.ts
@Injectable({ providedIn: 'root' })
export class PluginService {
  private plugins = new Map<string, Plugin>();

  constructor(@Optional() @Inject(PLUGINS) registeredPlugins: Plugin[] = []) {
    registeredPlugins.forEach(plugin => this.register(plugin));
  }

  register(plugin: Plugin): void {
    this.plugins.set(plugin.name, plugin);
    plugin.initialize();
  }

  execute(name: string, context: any): void {
    const plugin = this.plugins.get(name);
    if (!plugin) throw new Error(`Plugin not found: ${name}`);
    plugin.execute(context);
  }
}

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: PLUGINS, useClass: CsvExportPlugin, multi: true },
    { provide: PLUGINS, useClass: PdfExportPlugin, multi: true }
  ]
};
```

이 디자인은 다음을 사용합니다:
- ✅ **InjectionToken** for 설정
- ✅ **Multi-providers** for 플러그인 등록
- ✅ **Optional injection** 누락된 플러그인을 우아하게 처리
- ✅ **순환 의존성 없음** 인터페이스 추출을 통해
- ✅ **Tree-shakable providers** 최적 번들 크기를 위해

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

## 다음 단계

Alex는 의존성 주입 미스터리를 해결했습니다. 하지만 새로운 질문이 생겼습니다: **"Angular는 언제 UI를 업데이트해야 하는지 어떻게 알까?"**

Alex가 버튼을 클릭하면 컴포넌트 속성이 변경되고 뷰가 업데이트되었습니다. 마법 같죠?

더 이상은 아닙니다. 다음 챕터에서 Alex는 **변경 감지** 시스템으로 깊이 파고들어 Angular가 변경 사항을 추적하고 DOM을 업데이트하는 방법을 이해합니다.

---

**다음**: [2장: 변경 감지의 수수께끼](02-change-detection.md)

## 추가 읽을거리

- Angular 소스: `packages/core/src/di/`
- DI 문서: https://angular.dev/guide/dependency-injection

## Alex의 일지에서

*"오늘 마침내 의존성 주입을 이해했다. 인젝터 트리, 프로바이더 해결, multi-providers - 이제 모두 이해된다. DI를 3년 동안 사용했는데 어떻게 작동하는지 모르고 있었다니 믿을 수 없다.*

*핵심 통찰: Angular는 '하나의 인젝터'가 아니다 - 전체 트리다! 그래서 스코프가 그렇게 중요한 것이다.*

*다음: 이 변경 감지를 알아내자. Angular는 언제 다시 렌더링해야 하는지 어떻게 알까?"*
