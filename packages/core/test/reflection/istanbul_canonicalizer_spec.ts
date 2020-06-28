/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {stripIstanbulInstrumentationStatements} from '../../src/reflection/istanbul_canonicalizer';

describe('stripIstanbulInstrumentationStatements()', () => {
  it('should remove statements in ES2015', () => {
    const result = stripIstanbulInstrumentationStatements([
      `class TestService extends BaseService {`,  //
      `  constructor() {`,                        //
      `    cov_8nt6qq5zt().f[2]++;`,              //
      `    cov_8nt6qq5zt().s[6]++;`,              //
      `    super(...arguments);`,                 //
      `    cov_8nt6qq5zt().s[7]++;`,              //
      `    this.foo = 'bar';`,                    //
      `  }`,                                      //
      `}`                                         //
    ].join('\n'));
    expect(result).toEqual([
      `class TestService extends BaseService {`,  //
      `  constructor() {`,                        //
      `    `,                                     //
      `    `,                                     //
      `    super(...arguments);`,                 //
      `    `,                                     //
      `    this.foo = 'bar';`,                    //
      `  }`,                                      //
      `}`                                         //
    ].join('\n'));
  });

  it('should remove statements in ES5', () => {
    const result = stripIstanbulInstrumentationStatements([
      `function TestService() {`,   //
      `  cov_8nt6qq5zt().f[4]++;`,  //
      `  var _this = (cov_8nt6qq5zt().s[8]++, (cov_8nt6qq5zt().b[0][0]++, _super !== null) && (cov_8nt6qq5zt().b[0][1]++, _super.apply(this, arguments)) || (cov_8nt6qq5zt().b[0][2]++, this));`,  //
      `  cov_8nt6qq5zt().s[9]++;`,   //
      `  _this.foo = 'bar';`,        //
      `  cov_8nt6qq5zt().s[10]++;`,  //
      `  return _this;`,             //
      `}`                            //
    ].join('\n'));
    expect(result).toEqual([
      `function TestService() {`,                                                             //
      `  `,                                                                                   //
      `  var _this = ( ( _super !== null) && ( _super.apply(this, arguments)) || ( this));`,  //
      `  `,                                                                                   //
      `  _this.foo = 'bar';`,                                                                 //
      `  `,                                                                                   //
      `  return _this;`,                                                                      //
      `}`                                                                                     //
    ].join('\n'));
  });
});
