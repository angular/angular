// tslint:disable

import {WithSettersAndGetters} from './with_getters';

class WithGettersExternalRef {
  instance: WithSettersAndGetters = null!;

  test() {
    if (this.instance.accessor) {
      console.log(this.instance.accessor);
    }
  }
}
