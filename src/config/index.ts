export interface Config {
  analyticsEnabled: boolean;
  uiPort: number;
}

const defaultConfig: Config = {
  analyticsEnabled: true,
  uiPort: 3009,
};

let userConfig: Partial<Config> = {};

export const config = {
  setConfig: (config: Partial<Config>) => {
    userConfig = { ...userConfig, ...config };
  },
  get analyticsEnabled() {
    return userConfig.analyticsEnabled ?? defaultConfig.analyticsEnabled;
  },
  get uiPort() {
    return userConfig.uiPort ?? defaultConfig.uiPort;
  },
};
