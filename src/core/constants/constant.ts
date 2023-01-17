export const MSG_OK = 'OK';

export const JWT_TOKEN = 'JWT_TOKEN';

export const SCRAPPER_HOUR_INIT = 'SCRAPPER_HOUR_INIT';

export const SCRAPPER_HOUR_NOTIFICATION = 'SCRAPPER_HOUR_NOTIFICATION';

export const SCRAPPER_INIT = 'SCRAPPER_INIT';

export const SCRAPPER_MINUTE_INIT = 'SCRAPPER_MINUTE_INIT';

// we can block by resrouce type like fonts, images etc.
export const BLOCK_RESOURCE_TYPE: readonly string[] = [
  'beacon',
  'csp_report',
  'font',
  'image',
  'imageset',
  'media',
  'object',
  'texttrack',
];
// we can also block by domains, like google-analytics etc.
export const BLOCK_SOURCE_NAME: readonly string[] = [
  'adition',
  'adzerk',
  'analytics',
  'cdn.api.twitter',
  'clicksor',
  'clicktale',
  'doubleclick',
  'exelator',
  'facebook',
  'fontawesome',
  'google',
  'google-analytics',
  'googletagmanager',
  'mixpanel',
  'optimizely',
  'quantserve',
  'sharethrough',
  'tiqcdn',
  'zedo',
];
