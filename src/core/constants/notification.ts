import dotenv from 'dotenv';
dotenv.config();

export const LOGO_APP = process.env.LOGO_APP;

export const LOGO_ICON = process.env.LOGO_ICON;

export const URL_WEB = process.env.URL_WEB;

export function NOTIFICATION_LIST_WISH() {
  return {
    notification: {
      title: 'Sus libros pueden haber bajado de precio',
      icon: LOGO_ICON,
      data: {
        url: URL_WEB,
      },
      body: 'Revise sus productos en Sky Scrapper',
      vibrate: [1000, 1000, 1000],
      image: LOGO_APP,
      actions: [
        {
          action: 'Explorar',
          title: 'Visitar',
        },
      ],
    },
  };
}
