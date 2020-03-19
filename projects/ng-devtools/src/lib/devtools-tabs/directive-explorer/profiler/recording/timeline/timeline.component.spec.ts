import { TimelineComponent } from './timeline.component';

describe('TimelineComponent', () => {
  let comp: TimelineComponent;
  const sanitizer = {};

  beforeEach(() => {
    comp = new TimelineComponent(sanitizer as any);
  });

  it('should calculate the framerate from passed duration', () => {
    expect(comp.frameRate(0)).toBe(64);
    expect(comp.frameRate(16)).toBe(64);
    expect(comp.frameRate(17)).toBe(32);
    expect(comp.frameRate(31)).toBe(32);
    expect(comp.frameRate(32)).toBe(32);
    expect(comp.frameRate(33)).toBe(16);
    expect(comp.frameRate(48)).toBe(16);
    expect(comp.frameRate(49)).toBe(8);
    expect(comp.frameRate(2000)).toBe(0);
  });
});
