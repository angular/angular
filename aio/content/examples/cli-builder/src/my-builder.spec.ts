// #docregion
import { Architect } from '@angular-devkit/architect';
import { TestingArchitectHost } from '@angular-devkit/architect/testing';
import { logging, schema } from '@angular-devkit/core';

describe('Command Runner Builder', () => {
  let architect: Architect;
  let architectHost: TestingArchitectHost;

  beforeEach(async () => {
    const registry = new schema.CoreSchemaRegistry();
    registry.addPostTransform(schema.transforms.addUndefinedDefaults);

    // TestingArchitectHost()를 실행하려면 워크스페이스와 현재 폴더 위치를 인자로 전달해야 합니다.
    // 이 예제에서는 사용하지 않지만 일단 같은 경로로 지정합니다.
    architectHost = new TestingArchitectHost(__dirname, __dirname);
    architect = new Architect(architectHost, registry);

    // addBuilderFromPackage() 메소드는 Node 패키지의 이름이나 경로를 인자로 받습니다.
    // 경로는 package.json 파일이 있는 폴더를 기준으로 지정합니다.
    await architectHost.addBuilderFromPackage('..');
  });

  it('can run node', async () => {
    // 모든 메시지를 출력하는 로거 인스턴스를 생성합니다.
    const logger = new logging.Logger('');
    const logs = [];
    logger.subscribe(ev => logs.push(ev.message));

    // 진행상황이나 결과값은 "run"으로 여러번 전달될 수 있습니다.
    const run = await architect.scheduleBuilder('@example/command-runner:command', {
      command: 'node',
      args: ['--print', '\'foo\''],
    }, { logger });  // 나중에 검사하기 위해 로거로 연결합니다.

    // BuilderOutput 객체의 "result" 멤버가 다음에 사용되는 결과값입니다.
    const output = await run.result;

    // 빌더를 멈춥니다. 빌드 실행을 멈추면 메모리에서 빌더와 관련된 상태값이 모두 사라지고 이후 실행 스케쥴을 기다립니다.
    await run.stop();

    // foo가 로그 안에 있는지 확인합니다.
    expect(logs).toContain('foo');
  });
});
// #enddocregion
