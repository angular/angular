import {analyze} from '../../tools/build/dart_analyzer';
import {detect} from '../../tools/build/dart';


const command = detect()['ANALYZER'];

analyze('dist/dart', command, true)
  .then((err) => {
    if (err) {
      throw err;
    }
    console.log('Done.');
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
