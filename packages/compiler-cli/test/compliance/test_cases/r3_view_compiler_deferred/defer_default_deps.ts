import {Component} from '@angular/core';

import CmpA from './defer_default_deps_ext';

@Component({
  selector: 'local-dep',
  standalone: true,
  template: 'Local dependency',
})
export class LocalDep {
}

@Component({
  selector: 'test-cmp',
  standalone: true,
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
