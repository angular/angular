type CustomLauncher = {
  base: string;
  browserName: string;
  platformName: string;
  platformVersion: string;
  deviceName: string;
  appiumVersion: string;
  extendedDebugging: boolean;
}

type CustomLaunchers = {
  [key: string]: CustomLauncher;
};

type SauceAliases = {
  [key: string]: string[];
};

export const customLaunchers: CustomLaunchers;
export const sauceAliases: SauceAliases;
