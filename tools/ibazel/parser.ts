import {IBAZEL, IBazelEnvironment} from './environment';

export interface ParseResult {
  fullCommand: string[];
  startupArgs: string[];
  commandType: string;
  commandArgs: string[];
  targets: string[];
}

export function parse(env: IBazelEnvironment, argv: string[]): ParseResult {
  const flagIsBoolean = env.getFlags();

  const fullCommand: string[] = [];
  const targets: string[] = [];

  let dashDash: boolean = false;

  let commandType: string = '';
  let commandTypePos: number = null;

  while (argv.length) {
    const arg = argv.shift();
    fullCommand.push(arg);

    if (!dashDash) {
      if (arg === '--') {
        dashDash = true;
      } else if (arg[0] === '-') {
        const [key, value] = arg.split('=');

        // If the arg is specified using --foo=yes, then we are done; else:
        if (!value) {
          // Flag is not boolean or flag is unknown
          if (!flagIsBoolean[key]) {
            fullCommand.push(argv.shift()); // discard flag value
            if (!(key in flagIsBoolean)) {
              env.log(`Recognized option ${key}. ibazel may identify targets erronously.`);
            }
          }
        }
      } else if (!commandType) {
        commandType = arg;
        commandTypePos = fullCommand.length - 1;
      } else {
        targets.push(arg);
      }
    } else {
      // If command is "run", non-first arg after -- are arguments to command;
      // Otherwise, they are targets.
      if (commandType === 'run') {
        if (!targets.length) {
          targets.push(arg);
        }
      } else {
        targets.push(arg);
      }
    }
  }

  return {
    fullCommand,
    targets,
    commandType,
    startupArgs: fullCommand.slice(0, commandTypePos),
    commandArgs: fullCommand.slice(commandTypePos + 1)
  };
}
