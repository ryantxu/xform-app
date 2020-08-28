/**
 * Saved in the app configs
 */
export interface ScreensAppSettings {
  customText?: string;
  customCheckbox?: boolean;
}

/**
 * Identifiying information saved in the browser
 */
export interface LocalScreenConfig {
  name: string;
  tags: string[];
  description?: string;
  uuid: string;
}

export interface ScreenCommand {
  all: boolean; // everyting
  uuid: string[]; // Explicit list of screens
  tags: string[]; // or anything that matches
  path?: string;
}

export interface ChannelMessage {}
