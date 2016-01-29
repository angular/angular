import {analyze} from '../../tools/build/dart_analyzer';
import {detect} from '../../tools/build/dart';


const command = detect()['ANALYZER'];

analyze('dist/dart', command, true)
  .then(() => {
    console.log('Done.');
  }, (err) => {
    console.error('Error:', err);
  });
