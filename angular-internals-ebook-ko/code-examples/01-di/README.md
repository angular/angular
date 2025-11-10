# 1장 코드 예제: 의존성 주입

이 예제는 Angular의 의존성 주입 시스템 내부 구조를 보여줍니다.

## 포함 내용

### 1. 플러그인 시스템 (`plugin-system/`)
계층적 DI와 multi-providers를 보여줍니다:
- `providedIn: 'root'`를 사용한 기본 `PluginService`
- Multi-provider 패턴을 통한 여러 플러그인
- 설정을 위한 InjectionToken
- 플러그인 등록 및 실행

### 2. 인젝터 계층 구조 (`injector-hierarchy/`)
인젝터 트리를 시각화합니다:
- Root 인젝터
- 모듈 레벨 인젝터
- 컴포넌트 레벨 인젝터 (NodeInjector)
- 프로바이더 해결 과정

### 3. 프로바이더 타입 (`provider-types/`)
모든 프로바이더 설정을 보여줍니다:
- Value providers
- Class providers
- Factory providers
- Existing providers (별칭)
- Multi-providers

## 주요 파일

```
01-di/
├── src/
│   ├── app/
│   │   ├── plugin-system/
│   │   │   ├── plugin.service.ts       # 핵심 플러그인 서비스
│   │   │   ├── plugin.token.ts         # InjectionToken
│   │   │   └── plugins/
│   │   │       ├── csv-export.plugin.ts
│   │   │       └── pdf-export.plugin.ts
│   │   │
│   │   ├── injector-hierarchy/
│   │   │   ├── parent.component.ts
│   │   │   ├── child.component.ts
│   │   │   └── visualizer.component.ts # 인젝터 트리 표시
│   │   │
│   │   └── provider-types/
│   │       └── examples.component.ts    # 모든 프로바이더 타입
│   │
│   └── main.ts                          # 프로바이더와 함께 부트스트랩
│
└── README.md                            # 이 파일
```

## 예제 실행

```bash
npm install
npm start
```

http://localhost:4200 열기

## 연습 문제

1. **새 플러그인 추가**: JSON export 플러그인 만들기
2. **프로바이더 스코프 변경**: 서비스를 'root'에서 컴포넌트 레벨로 이동
3. **DI 디버그**: Angular DevTools를 사용하여 인젝터 트리 검사
4. **순환 의존성 생성**: 순환 의존성을 만들고 에러 확인

## 학습 목표

이 예제를 실행한 후, 다음을 이해해야 합니다:

- ✅ 프로바이더 해결이 어떻게 작동하는지
- ✅ 언제 다른 프로바이더 타입을 사용하는지
- ✅ 확장성을 위한 Multi-provider 패턴
- ✅ 클래스가 아닌 의존성을 위한 InjectionToken
- ✅ 인젝터 계층 구조와 스코프

## 소스 코드 참조

- `packages/core/src/di/r3_injector.ts` - R3Injector 구현
- `packages/core/src/di/injector.ts` - Injector 기본 클래스
- `packages/core/src/di/injection_token.ts` - InjectionToken
- `packages/core/src/render3/di.ts` - NodeInjector (컴포넌트 레벨)

## 다음 단계

[2장: 변경 감지](../02-change-detection/README.md)로 계속하세요
