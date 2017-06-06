// import { System } from 'webpack';
declare const System: any;

describe('FileLoaderService', () => {

  fdescribe('System.import', () => {
    const navJsonUrl = 'content/navigation.json';

    it(`should load with literal 'content/navigation.json'`, done => {
      System.import('content/navigation.json').then(
        res => {
          done();
        });
    });

    it(`should load with variable navJsonUrl whose value is also '${navJsonUrl}'`, done => {
      try {
        System.import(navJsonUrl).then(
          res => {
            done();
          },
          err => {
            debugger; // never gets here
          });
      } catch (e) {
        throw e; // perhaps surprisingly, this fails synchronously here ... not in promise
      }
    });

    // COMMENT OUT OR FAILS COMPILE BY WEBPACK
    // it(`should fail to load 'content/xxxnavigation.json' ... in try/catch(!)`, done => {
    //   try {
    //     System.import('content/xxxnavigation.json').then(
    //       res => {
    //         throw new Error('expected to fail but succeeded');
    //       })
    //       .then(null, err => {
    //         // Actually this is where I expect it to fail but it doesn't!
    //         throw new Error('expected to fail but not in the promise');
    //       });
    //   } catch (err) {
    //       expect(err.message).toMatch(/cannot find/i);
    //       done();
    //   }

    // });
  });

});



