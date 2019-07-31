import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {YouTubePlayerModule} from './index';
import {YouTubePlayer} from './youtube-player';
import {createFakeYtNamespace} from './fake-youtube-player';

const VIDEO_ID = 'a12345';

declare global {
  interface Window { YT: typeof YT | undefined; }
}

describe('YoutubePlayer', () => {
  let playerCtorSpy: jasmine.Spy;
  let playerSpy: jasmine.SpyObj<YT.Player>;
  let onPlayerReady: () => void;
  let fixture: ComponentFixture<TestApp>;
  let testComponent: TestApp;

  beforeEach(async(() => {
    const fake = createFakeYtNamespace();
    playerCtorSpy = fake.playerCtorSpy;
    playerSpy = fake.playerSpy;
    onPlayerReady = fake.onPlayerReady;
    window.YT = fake.namespace;

    TestBed.configureTestingModule({
      imports: [YouTubePlayerModule],
      declarations: [TestApp],
    });

    TestBed.compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestApp);
    testComponent = fixture.debugElement.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    window.YT = undefined;
  });

  it('initializes a youtube player', () => {
    let containerElement = fixture.nativeElement.querySelector('div');

    expect(playerCtorSpy).toHaveBeenCalledWith(
      containerElement, jasmine.objectContaining({
        videoId: VIDEO_ID,
      }));
  });

  it('destroys the iframe when the component is destroyed', () => {
    onPlayerReady();

    testComponent.visible = false;
    fixture.detectChanges();

    expect(playerSpy.destroy).toHaveBeenCalled();
  });

  it('responds to changes in video id', () => {
    let containerElement = fixture.nativeElement.querySelector('div');

    testComponent.videoId = 'otherId';
    fixture.detectChanges();

    expect(playerSpy.cueVideoById).not.toHaveBeenCalled();

    onPlayerReady();

    expect(playerSpy.cueVideoById).toHaveBeenCalledWith(
      jasmine.objectContaining({videoId: 'otherId'}));

    testComponent.videoId = undefined;
    fixture.detectChanges();

    expect(playerSpy.destroy).toHaveBeenCalled();

    testComponent.videoId = 'otherId2';
    fixture.detectChanges();

    expect(playerCtorSpy).toHaveBeenCalledWith(
      containerElement, jasmine.objectContaining({videoId: 'otherId2'}));
  });
});

/** Test component that contains a YouTubePlayer. */
@Component({
  selector: 'test-app',
  template: `
    <youtube-player #player [videoId]="videoId" *ngIf="visible">
    </youtube-player>
  `
})
class TestApp {
  videoId: string | undefined = VIDEO_ID;
  visible = true;
  @ViewChild('player', {static: true}) youtubePlayer: YouTubePlayer;
}
