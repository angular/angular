# /tsconfig.json
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "esnext",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": false,
    "moduleResolution": "node"
  },
  "files": [
    "lazy_with_blocks.ts"
  ],
  "angularCompilerOptions": {}
}
```

# /lazy_with_blocks.ts
```ts
import {Component} from '@angular/core';


@Component({
  selector: 'my-lazy-cmp',
  template: 'Hi!',
})
class MyLazyCmp {
}

@Component({
  selector: 'app',
  imports: [MyLazyCmp],
  template: `
		Visible: {{ isVisible }}.

		@defer (when isVisible) {
			<my-lazy-cmp />
		} @loading {
			Loading...
		} @placeholder {
			Placeholder!
		} @error {
			Failed to load dependencies :(
		}
	`
})
class SimpleComponent {
  isVisible = false;

  ngOnInit() {
    setTimeout(() => {
      // This changes the triggering condition of the defer block,
      // but it should be ignored and the placeholder content should be visible.
      this.isVisible = true;
    });
  }
}
```
