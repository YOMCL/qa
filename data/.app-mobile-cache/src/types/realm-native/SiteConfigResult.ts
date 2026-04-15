import { SiteConfig } from './SiteConfig';

export type SiteConfigResult = {
  success: boolean;
  config: SiteConfig;
  error?: string;
};
