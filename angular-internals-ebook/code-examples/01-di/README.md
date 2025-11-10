# Chapter 1 Code Examples: Dependency Injection

This example demonstrates Angular's dependency injection system internals.

## What's Included

### 1. Plugin System (`plugin-system/`)
Demonstrates hierarchical DI and multi-providers:
- Base `PluginService` with `providedIn: 'root'`
- Multiple plugins via multi-provider pattern
- InjectionToken for configuration
- Plugin registration and execution

### 2. Injector Hierarchy (`injector-hierarchy/`)
Visualizes the injector tree:
- Root injector
- Module-level injectors
- Component-level injectors (NodeInjector)
- Provider resolution walkthrough

### 3. Provider Types (`provider-types/`)
Shows all provider configurations:
- Value providers
- Class providers
- Factory providers
- Existing providers (aliases)
- Multi-providers

### 4. Circular Dependency Detection (`circular-deps/`)
Demonstrates how Angular detects circular dependencies:
- Intentional circular dependency
- Error handling
- Resolution strategies

## Key Files

```
01-di/
├── src/
│   ├── app/
│   │   ├── plugin-system/
│   │   │   ├── plugin.service.ts       # Core plugin service
│   │   │   ├── plugin.token.ts         # InjectionToken
│   │   │   └── plugins/
│   │   │       ├── csv-export.plugin.ts
│   │   │       └── pdf-export.plugin.ts
│   │   │
│   │   ├── injector-hierarchy/
│   │   │   ├── parent.component.ts
│   │   │   ├── child.component.ts
│   │   │   └── visualizer.component.ts # Shows injector tree
│   │   │
│   │   └── provider-types/
│   │       └── examples.component.ts    # All provider types
│   │
│   └── main.ts                          # Bootstrap with providers
│
└── README.md                            # This file
```

## Running the Example

```bash
npm install
npm start
```

Open http://localhost:4200

## Exercises

1. **Add a New Plugin**: Create a JSON export plugin
2. **Change Provider Scope**: Move a service from 'root' to component level
3. **Debug DI**: Use Angular DevTools to inspect the injector tree
4. **Create Circular Dep**: Try to create a circular dependency and see the error

## Learning Objectives

After running this example, you should understand:

- ✅ How provider resolution works
- ✅ When to use different provider types
- ✅ Multi-provider patterns for extensibility
- ✅ InjectionToken for non-class dependencies
- ✅ Injector hierarchy and scope

## Source Code References

- `packages/core/src/di/r3_injector.ts` - R3Injector implementation
- `packages/core/src/di/injector.ts` - Injector base class
- `packages/core/src/di/injection_token.ts` - InjectionToken
- `packages/core/src/render3/di.ts` - NodeInjector (component-level)

## Next Steps

Continue to [Chapter 2: Change Detection](../02-change-detection/README.md)
