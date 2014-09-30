import {MultiTransformer} from 'traceur/src/codegeneration/MultiTransformer';
import {UniqueIdentifierGenerator} from 'traceur/src/codegeneration/UniqueIdentifierGenerator';
import {options} from 'traceur/src/Options';

import {ClassTransformer} from './ClassTransformer';
import {InstanceOfTransformer} from './InstanceOfTransformer';
import {MultiVarTransformer} from './MultiVarTransformer';
import {StrictEqualityTransformer} from './StrictEqualityTransformer';
import {NamedParamsTransformer} from './NamedParamsTransformer';

/**
 * Transforms ES6 + annotations to Dart code.
 */
export class DartTransformer extends MultiTransformer {
  constructor(reporter, idGenerator = new UniqueIdentifierGenerator()) {
    super(reporter, options.validate);

    var append = (transformer) => {
      this.append((tree) => {
        return new transformer(idGenerator, reporter).transformAny(tree);
      });
    };

    append(NamedParamsTransformer);
    append(MultiVarTransformer);
    append(InstanceOfTransformer);
    append(StrictEqualityTransformer);
    append(ClassTransformer);
  }
}
