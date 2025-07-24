import {Component} from '@angular/core';

import {CmpA} from './defer_deps_ext';

@Component({
  selector: 'local-dep',
  template: 'Local dependency',
})
export class LocalDep {
}

@Component({
  selector: 'test-cmp',
  imports: [CmpA, LocalDep],
  template: `
	@defer {
	<cmp-a />
	<local-dep />
	}
`,
})
export class TestCmp {
}