import {task} from 'gulp';
import chalk from 'chalk';

task('default', ['help']);

task('help', function() {
  console.log();
  console.log('Please specify a gulp task you want to run.');
  console.log(`You're probably looking for ${chalk.yellow('test')} or ` +
      `${chalk.yellow('serve:devapp')}.`);
  console.log();
});

