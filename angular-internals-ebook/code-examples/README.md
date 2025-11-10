# Code Examples for Angular Internals

This directory contains runnable code examples for each chapter of the book.

## Structure

Each chapter has its own directory with working code:

```
code-examples/
├── 01-di/                    # Dependency Injection examples
├── 02-change-detection/      # Change Detection optimization
├── 03-lifecycle/             # Component Lifecycle hooks
├── 04-rendering/             # Rendering engine exploration
├── 05-compiler/              # Compiler output analysis
├── 06-zone/                  # Zone.js patterns
├── 07-signals/               # Signals and reactivity
├── 08-router/                # Router internals
└── 09-taskmaster/            # Complete application
```

## Running Examples

Each example is a standalone Angular project:

```bash
cd 01-di/
npm install
npm start
```

Then open http://localhost:4200

## Prerequisites

- Node.js 18+ (preferably 22+)
- npm or pnpm
- Angular CLI (optional, not required for these examples)

## What You'll Learn

### Chapter 1: Dependency Injection
- Hierarchical injectors in action
- Multi-provider patterns
- InjectionToken usage
- Plugin architecture with DI

### Chapter 2: Change Detection
- OnPush vs Default strategy comparison
- Performance optimization techniques
- Manual change detection control
- Zone.js integration

### Chapter 3: Lifecycle
- All 8 lifecycle hooks in order
- When to use each hook
- ViewChild/ContentChild timing
- Signal-based lifecycle with effects

### Chapter 4: Rendering
- LView structure visualization
- Instruction-based rendering
- Performance profiling
- DOM update tracking

### Chapter 5: Compiler
- Template compilation output
- AOT vs JIT comparison
- Bundle size analysis
- Optimization techniques

### Chapter 6: Zone.js
- NgZone API usage
- runOutsideAngular patterns
- Custom zone creation
- Performance optimization

### Chapter 7: Signals
- Signal basics
- Computed signals
- Effects
- RxJS interop

### Chapter 8: Router
- Advanced routing patterns
- Guards and resolvers
- Lazy loading
- Route reuse strategies

### Chapter 9: TaskMaster
- Complete production app
- All concepts integrated
- Best practices
- Performance optimized

## Tips

1. **Start Sequential** - Examples build on previous concepts
2. **Modify Code** - Change values, break things, learn by experimenting
3. **Use DevTools** - Angular DevTools helps visualize concepts
4. **Read Source** - Each example references Angular source code

## Troubleshooting

### Port Already in Use
```bash
npm start -- --port 4201
```

### Node Version Issues
Use Node 22+ (specified in .nvmrc of each project)

### Dependency Issues
```bash
rm -rf node_modules package-lock.json
npm install
```

## Additional Resources

- [Angular Source Code](https://github.com/angular/angular)
- [Angular DevTools](https://angular.dev/tools/devtools)
- [Main Book](../README.md)

Happy coding! 🚀
