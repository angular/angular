import {IBazelEnvironment} from 'ibazel/environment';
import {parse} from 'ibazel/parser';

import {createMockIBazelEnvironment} from './environment_mock';


describe('parse', () => {
  let env: IBazelEnvironment;

  beforeEach(() => {
    env = createMockIBazelEnvironment({
      getFlags: () => ({
                  '--foo': false,
                  '--bool': true,
                  '--do-sth': true,
                })
    });
  });

  it('should classify arguments correctly', () => {
    const parsed = parse(env, ['--bool', 'build', '--foo', 'sth', ':core']);
    expect(parsed.fullCommand).toEqual(['--bool', 'build', '--foo', 'sth', ':core']);
    expect(parsed.startupArgs).toEqual(['--bool']);
    expect(parsed.commandType).toEqual('build');
    expect(parsed.commandArgs).toEqual(['--foo', 'sth', ':core']);
  });

  it('should classify -- correctly', () => {
    const parsed = parse(env, ['--bool', 'run', '--', ':core', '--do-sth']);
    expect(parsed.fullCommand).toEqual(['--bool', 'run', '--', ':core', '--do-sth']);
    expect(parsed.startupArgs).toEqual(['--bool']);
    expect(parsed.commandType).toEqual('run');
    expect(parsed.commandArgs).toEqual(['--', ':core', '--do-sth']);
  })

  it('should not add the command to targets', () => {
    const parsed = parse(env, ['build', ':core']);
    expect(parsed.targets).toEqual([':core']);
  });

  it('should add argument after boolean flag to targets', () => {
    const parsed = parse(env, ['build', '--bool', ':core']);
    expect(parsed.targets).toEqual([':core']);
  });

  it('should not add argument after value flag to targets', () => {
    const parsed = parse(env, ['build', '--foo', ':core', ':common']);
    expect(parsed.targets).toEqual([':common']);
  });

  it('should add argument after value flag specified with = to targets', () => {
    const parsed = parse(env, ['build', '--foo=yes', ':common']);
    expect(parsed.targets).toEqual([':common']);
  });

  it('should add all arguments to targets after -- if command is not "run"', () => {
    const parsed = parse(env, ['build', '--', '--verbose_failures', '--core']);
    expect(parsed.targets).toEqual(['--verbose_failures', '--core']);
  });

  it('should not add non-first arguments to targets after -- if command is "run"', () => {
    const parsed = parse(env, ['run', ':core', '--', ':do_sth', '--core']);
    expect(parsed.targets).toEqual([':core']);
  });

  it('should add first argument to targets after -- if command is "run"', () => {
    const parsed = parse(env, ['run', '--', ':core', '--verbose_failures', '--core']);
    expect(parsed.targets).toEqual([':core']);
  });
})
