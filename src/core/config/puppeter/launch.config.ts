import { PuppeteerLaunchOptions } from 'puppeteer';

export const puppeteerLaunchOptions : PuppeteerLaunchOptions = {
  args: ['--disable-gpu', '--disable-setuid-sandbox', '--no-sandbox'],
  ignoreDefaultArgs: ['--disable-extensions'],
  headless: true,
};
