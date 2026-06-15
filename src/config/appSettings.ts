import sequelize from '../db/sequelize.js';

let settings: Record<string, string> = {};

export const loadSettings = async (): Promise<void> => {
  const [rows] = await sequelize.query(
    'SELECT setting_key, setting_value FROM client_settings_t'
  ) as [Array<{ setting_key: string; setting_value: string }>, unknown];

  settings = Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value]));
  console.log('App settings loaded');
};

export const getSetting = (key: string): string => {
  if (!(key in settings)) throw new Error(`Unknown setting: ${key}`);
  return settings[key];
};

export const getSettingInt = (key: string): number => {
  const val = parseInt(getSetting(key), 10);
  if (isNaN(val)) throw new Error(`Setting ${key} is not a valid integer`);
  return val;
};
