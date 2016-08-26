import {ProcessIBazelEnvironment} from 'ibazel/environment';

describe('ProcessIBazelEnvironment', () => {
  it('should parse "bazel help completion" in getFlags correctly', () => {
    const env = new ProcessIBazelEnvironment();
    spyOn(env, 'execute').and.returnValue({
      stdout: `SOME_ARGS="foo bar"
SOME_FLAGS="
--max_idle_secs=
--color={yes,no,auto}
--verbose_failures
"
`
    });

    expect(env.getFlags())
        .toEqual(jasmine.objectContaining(
            {'--max_idle_secs': false, '--color': false, '--verbose_failures': true}));
  });
});
