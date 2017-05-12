import {NativeDateAdapter} from './native-date-adapter';
import {Platform} from '../platform/index';


const SUPPORTS_INTL = typeof Intl != 'undefined';


// When constructing a Date, the month is zero-based. This can be confusing, since people are
// used to seeing them one-based. So we create these aliases to make reading the tests easier.
const JAN = 0, FEB = 1, MAR = 2, APR = 3, MAY = 4, JUN = 5, JUL = 6, AUG = 7, SEP = 8, OCT = 9,
      NOV = 10, DEC = 11;


describe('NativeDateAdapter', () => {
  let adapter;
  let platform;

  beforeEach(() => {
    adapter = new NativeDateAdapter();
    platform = new Platform();
  });

  it('should get year', () => {
    expect(adapter.getYear(new Date(2017, JAN, 1))).toBe(2017);
  });

  it('should get month', () => {
    expect(adapter.getMonth(new Date(2017, JAN, 1))).toBe(0);
  });

  it('should get date', () => {
    expect(adapter.getDate(new Date(2017, JAN, 1))).toBe(1);
  });

  it('should get day of week', () => {
    expect(adapter.getDayOfWeek(new Date(2017, JAN, 1))).toBe(0);
  });

  it('should get long month names', () => {
    expect(adapter.getMonthNames('long')).toEqual([
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
      'October', 'November', 'December'
    ]);
  });

  it('should get long month names', () => {
    expect(adapter.getMonthNames('short')).toEqual([
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]);
  });

  it('should get narrow month names', () => {
    // Edge & IE use same value for short and narrow.
    if (platform.EDGE || platform.TRIDENT) {
      expect(adapter.getMonthNames('narrow')).toEqual([
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ]);
    } else {
      expect(adapter.getMonthNames('narrow')).toEqual([
        'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'
      ]);
    }
  });

  it('should get month names in a different locale', () => {
    adapter.setLocale('ja-JP');
    if (SUPPORTS_INTL) {
      expect(adapter.getMonthNames('long')).toEqual([
        '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'
      ]);
    } else {
      expect(adapter.getMonthNames('long')).toEqual([
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
        'October', 'November', 'December'
      ]);
    }
  });

  it('should get date names', () => {
    expect(adapter.getDateNames()).toEqual([
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
      '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
    ]);
  });

  it('should get date names in a different locale', () => {
    adapter.setLocale('ja-JP');
    if (SUPPORTS_INTL) {
      expect(adapter.getDateNames()).toEqual([
        '1日', '2日', '3日', '4日', '5日', '6日', '7日', '8日', '9日', '10日', '11日', '12日',
        '13日', '14日', '15日', '16日', '17日', '18日', '19日', '20日', '21日', '22日', '23日', '24日',
        '25日', '26日', '27日', '28日', '29日', '30日', '31日'
      ]);
    } else {
      expect(adapter.getDateNames()).toEqual([
        '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17',
        '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'
      ]);
    }
  });

  it('should get long day of week names', () => {
    expect(adapter.getDayOfWeekNames('long')).toEqual([
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
    ]);
  });

  it('should get short day of week names', () => {
    expect(adapter.getDayOfWeekNames('short')).toEqual([
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
    ]);
  });

  it('should get narrow day of week names', () => {
    // Edge & IE use two-letter narrow days.
    if (platform.EDGE || platform.TRIDENT) {
      expect(adapter.getDayOfWeekNames('narrow')).toEqual([
        'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'
      ]);
    } else {
      expect(adapter.getDayOfWeekNames('narrow')).toEqual([
        'S', 'M', 'T', 'W', 'T', 'F', 'S'
      ]);
    }
  });

  it('should get day of week names in a different locale', () => {
    adapter.setLocale('ja-JP');
    if (SUPPORTS_INTL) {
      expect(adapter.getDayOfWeekNames('long')).toEqual([
        '日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'
      ]);
    } else {
      expect(adapter.getDayOfWeekNames('long')).toEqual([
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
      ]);
    }
  });

  it('should get year name', () => {
    expect(adapter.getYearName(new Date(2017, JAN, 1))).toBe('2017');
  });

  it('should get year name in a different locale', () => {
    adapter.setLocale('ja-JP');
    if (SUPPORTS_INTL) {
      expect(adapter.getYearName(new Date(2017, JAN, 1))).toBe('2017年');
    } else {
      expect(adapter.getYearName(new Date(2017, JAN, 1))).toBe('2017');
    }
  });

  it('should get first day of week', () => {
    expect(adapter.getFirstDayOfWeek()).toBe(0);
  });

  it('should create Date', () => {
    expect(adapter.createDate(2017, JAN, 1)).toEqual(new Date(2017, JAN, 1));
  });

  it('should not create Date with month over/under-flow', () => {
    expect(adapter.createDate(2017, DEC + 1, 1)).toBeNull();
    expect(adapter.createDate(2017, JAN - 1, 1)).toBeNull();
  });

  it('should not create Date with date over/under-flow', () => {
    expect(adapter.createDate(2017, JAN, 32)).toBeNull();
    expect(adapter.createDate(2017, JAN, 0)).toBeNull();
  });

  it('should create Date with low year number', () => {
    expect(adapter.createDate(-1, JAN, 1).getFullYear()).toBe(-1);
    expect(adapter.createDate(0, JAN, 1).getFullYear()).toBe(0);
    expect(adapter.createDate(50, JAN, 1).getFullYear()).toBe(50);
    expect(adapter.createDate(99, JAN, 1).getFullYear()).toBe(99);
    expect(adapter.createDate(100, JAN, 1).getFullYear()).toBe(100);
  });

  it("should get today's date", () => {
    expect(adapter.sameDate(adapter.today(), new Date()))
        .toBe(true, "should be equal to today's date");
  });

  it('should parse string', () => {
    expect(adapter.parse('1/1/2017')).toEqual(new Date(2017, JAN, 1));
  });

  it('should parse number', () => {
    let timestamp = new Date().getTime();
    expect(adapter.parse(timestamp)).toEqual(new Date(timestamp));
  });

  it ('should parse Date', () => {
    let date = new Date(2017, JAN, 1);
    expect(adapter.parse(date)).toEqual(date);
    expect(adapter.parse(date)).not.toBe(date);
  });

  it('should parse invalid value as null', () => {
    expect(adapter.parse('hello')).toBeNull();
  });

  it('should format', () => {
    if (SUPPORTS_INTL) {
      expect(adapter.format(new Date(2017, JAN, 1))).toEqual('1/1/2017');
    } else {
      expect(adapter.format(new Date(2017, JAN, 1))).toEqual('Sun Jan 01 2017');
    }
  });

  it('should format with custom format', () => {
    if (SUPPORTS_INTL) {
      expect(adapter.format(new Date(2017, JAN, 1), {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })).toEqual('January 1, 2017');
    } else {
      expect(adapter.format(new Date(2017, JAN, 1), {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })).toEqual('Sun Jan 01 2017');
    }
  });

  it('should format with a different locale', () => {
    adapter.setLocale('ja-JP');
    if (SUPPORTS_INTL) {
      // Edge & IE use a different format in Japanese.
      if (platform.EDGE || platform.TRIDENT) {
        expect(adapter.format(new Date(2017, JAN, 1))).toEqual('2017年1月1日');
      } else {
        expect(adapter.format(new Date(2017, JAN, 1))).toEqual('2017/1/1');
      }
    } else {
      expect(adapter.format(new Date(2017, JAN, 1))).toEqual('Sun Jan 01 2017');
    }
  });

  it('should add years', () => {
    expect(adapter.addCalendarYears(new Date(2017, JAN, 1), 1)).toEqual(new Date(2018, JAN, 1));
    expect(adapter.addCalendarYears(new Date(2017, JAN, 1), -1)).toEqual(new Date(2016, JAN, 1));
  });

  it('should respect leap years when adding years', () => {
    expect(adapter.addCalendarYears(new Date(2016, FEB, 29), 1)).toEqual(new Date(2017, FEB, 28));
    expect(adapter.addCalendarYears(new Date(2016, FEB, 29), -1)).toEqual(new Date(2015, FEB, 28));
  });

  it('should add months', () => {
    expect(adapter.addCalendarMonths(new Date(2017, JAN, 1), 1)).toEqual(new Date(2017, FEB, 1));
    expect(adapter.addCalendarMonths(new Date(2017, JAN, 1), -1)).toEqual(new Date(2016, DEC, 1));
  });

  it('should respect month length differences when adding months', () => {
    expect(adapter.addCalendarMonths(new Date(2017, JAN, 31), 1)).toEqual(new Date(2017, FEB, 28));
    expect(adapter.addCalendarMonths(new Date(2017, MAR, 31), -1)).toEqual(new Date(2017, FEB, 28));
  });

  it('should add days', () => {
    expect(adapter.addCalendarDays(new Date(2017, JAN, 1), 1)).toEqual(new Date(2017, JAN, 2));
    expect(adapter.addCalendarDays(new Date(2017, JAN, 1), -1)).toEqual(new Date(2016, DEC, 31));
  });

  it('should clone', () => {
    let date = new Date(2017, JAN, 1);
    expect(adapter.clone(date)).toEqual(date);
    expect(adapter.clone(date)).not.toBe(date);
  });

  it('should compare dates', () => {
    expect(adapter.compareDate(new Date(2017, JAN, 1), new Date(2017, JAN, 2))).toBeLessThan(0);
    expect(adapter.compareDate(new Date(2017, JAN, 1), new Date(2017, FEB, 1))).toBeLessThan(0);
    expect(adapter.compareDate(new Date(2017, JAN, 1), new Date(2018, JAN, 1))).toBeLessThan(0);
    expect(adapter.compareDate(new Date(2017, JAN, 1), new Date(2017, JAN, 1))).toBe(0);
    expect(adapter.compareDate(new Date(2018, JAN, 1), new Date(2017, JAN, 1))).toBeGreaterThan(0);
    expect(adapter.compareDate(new Date(2017, FEB, 1), new Date(2017, JAN, 1))).toBeGreaterThan(0);
    expect(adapter.compareDate(new Date(2017, JAN, 2), new Date(2017, JAN, 1))).toBeGreaterThan(0);
  });

  it('should clamp date at lower bound', () => {
    expect(adapter.clampDate(
        new Date(2017, JAN, 1), new Date(2018, JAN, 1), new Date(2019, JAN, 1)))
        .toEqual(new Date(2018, JAN, 1));
  });

  it('should clamp date at upper bound', () => {
    expect(adapter.clampDate(
        new Date(2020, JAN, 1), new Date(2018, JAN, 1), new Date(2019, JAN, 1)))
        .toEqual(new Date(2019, JAN, 1));
  });

  it('should clamp date already within bounds', () => {
    expect(adapter.clampDate(
        new Date(2018, FEB, 1), new Date(2018, JAN, 1), new Date(2019, JAN, 1)))
        .toEqual(new Date(2018, FEB, 1));
  });
});
