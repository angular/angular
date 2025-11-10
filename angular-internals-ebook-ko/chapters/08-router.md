# 8장: 라우터 심층 분석

> *"네비게이션은 실제로 어떻게 작동할까?"*

## 네비게이션 플로우

```
URL 변경
  ↓
URL 파싱
  ↓
라우트 매칭
  ↓
Guards 실행 (canActivate, canActivateChild)
  ↓
데이터 Resolve (resolvers)
  ↓
컴포넌트 활성화
  ↓
URL 업데이트
  ↓
완료
```

## 함수형 Guards (Angular 15+)

```typescript
// 새로운 방식 (함수형)
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};

// 사용
{
  path: 'admin',
  canActivate: [authGuard],
  loadChildren: () => import('./admin/admin.routes')
}
```

**다음**: [9장: TaskMaster 구축하기](09-building-taskmaster.md)
