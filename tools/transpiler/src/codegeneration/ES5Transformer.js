import {MultiTransformer} from 'traceur/src/codegeneration/MultiTransformer';
import {UniqueIdentifierGenerator} from 'traceur/src/codegeneration/UniqueIdentifierGenerator';
import {options} from 'traceur/src/Options';

import {IntTypeTransformer} from './IntTypeTransformer';

/**
 * Transforms ES6 + annotations to ES5 JavaScript code.
 */
export class ES5Transformer extends MultiTransformer {
  constructor(reporter, idGenerator = new UniqueIdentifierGenerator()) {
    super(reporter, options.validate);

    var append = (transformer) => {
      this.append((tree) => {
        return new transformer(idGenerator, reporter).transformAny(tree);
      });
    };

    append(IntTypeTransformer);
  }
}
