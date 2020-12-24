import {DocsSiteTheme, ThemeStorageService} from './theme-storage.service';


const testStorageKey = ThemeStorageService.storageKey;
const testTheme: DocsSiteTheme = {
  primary: '#000000',
  accent: '#ffffff',
  name: 'test-theme',
  icon: 'test-icon'
};

describe('ThemeStorage Service', () => {
  const service = new ThemeStorageService();
  const getCurrTheme = () => window.localStorage.getItem(testStorageKey);
  const secondTestTheme = {
    primary: '#666666',
    accent: '#333333',
    name: 'other-test-theme',
    icon: 'other-test-icon'
  };

  beforeEach(() => {
    window.localStorage[testStorageKey] = testTheme.name;
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('should set the current theme name', () => {
    expect(getCurrTheme()).toEqual(testTheme.name);
    service.storeTheme(secondTestTheme);
    expect(getCurrTheme()).toEqual(secondTestTheme.name);
  });

  it('should get the current theme name', () => {
    const theme = service.getStoredThemeName();
    expect(theme).toEqual(testTheme.name);
  });

  it('should clear the stored theme data', () => {
    expect(getCurrTheme()).not.toBeNull();
    service.clearStorage();
    expect(getCurrTheme()).toBeNull();
  });
});
