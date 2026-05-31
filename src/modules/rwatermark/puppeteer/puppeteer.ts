// const puppeteer = require('puppeteer-core')
// const puppeteer = require('puppeteer')
// import puppeteer, { KnownDevices } from 'puppeteer-core';
import puppeteer from 'puppeteer-core';
import chromeFinder from 'chrome-finder'
// const StealthPlugin = require('puppeteer-extra-plugin-stealth')
// import config from '../config';
// let {CHROME_PATH} = config
let browserWSEndpoint;
// puppeteer.use(StealthPlugin())
// console.log("CHROME_PATH",CHROME_PATH);
// console.log("chromeFinder", chromeFinder());
let chromeFinderPath=process.env.CHROME_PATH||chromeFinder();
async function getBrowserInstance(getNew,  executablePath?) {
  if (browserWSEndpoint && !getNew) {
    return browserWSEndpoint
  }
  console.log("account=-====>", typeof process.env.PUPPETEER_HEADLESS,process.env.PUPPETEER_HEADLESS);
  // const executablePath = CHROME_PATH
  const browser = await puppeteer.launch({
    executablePath: executablePath ? executablePath : chromeFinderPath,
    // headless: account?.type == 0 ? true : false,
    headless: true,
    // slowMo: 0,
    // ignoreHTTPSErrors: true,
    // protocolTimeout: 0,
   
    // defaultViewport: KnownDevices[account.emulate] ? KnownDevices[account.emulate].viewport : null,
    // args: [
    //   // '--disable-printing', 
    //   // "--disable-setuid-sandbox", 
    //   // '--disable-gpu', 
    //   // '--no-sandbox', 
    //   // "--disable-extensions", 
    //   // '--disable-dev-shm-usage', 
    //   // '--disable-web-security', 
    //   '--lang=zh-CN', 
    //   // '--allow-running-insecure-content',
    //   // '--start-minimized',
    //   // '--memory-pressure-off', // 关闭内存压力管理
    //   // // '--js-flags=--expose-gc', // 暴露GC接口
    //   //  '--mute-audio', // 静音
    //   // '--disable-default-apps', // 禁用默认应用
    //   // '--disable-background-networking', // 禁用后台网络活动
    //   // '--disable-software-rasterizer', // 禁用软件光栅化器
    //   // '--max-old-space-size=4096', // 设置最大旧空间大小
    //   // '--disable-dev-tools',
    //   // "-disable-plugins"

    // ], //
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // 防止 /dev/shm 空间不足
      '--disable-gpu',
      '--disable-software-rasterizer',
      '--disable-extensions',
    ], //
    
    // args: [
    //   '--disable-printing', 
    //   "--disable-setuid-sandbox", 
    //   '--disable-gpu', 
    //   '--no-sandbox', 
    //   "--disable-extensions", 
    //   '--disable-dev-shm-usage', 
    //   '--disable-web-security', 
    //   '--lang=zh-CN', 
    //   '--allow-running-insecure-content', 
    //   '--start-minimized', 
    //   '--window-size=1680,1050', // 使用正常屏幕分辨率
    //   '--disable-features=VizDisplayCompositor',
    //   '--disable-background-timer-throttling',
    //   '--disable-backgrounding-occluded-windows',
    //   '--disable-renderer-backgrounding',
    //   '--disable-background-networking',
    //   '--disable-default-apps',
    //   '--disable-sync',
    //   '--disable-translate',
    //   '--hide-scrollbars',
    //   '--mute-audio',
    //   '--no-first-run',
    //   '--disable-ipc-flooding-protection',
    //   // 反检测参数
    //   '--disable-blink-features=AutomationControlled',
    //   // '--disable-dev-tools',
    //   '--disable-extensions-except',
    //   '--disable-plugins-discovery',
    //   '--disable-component-extensions-with-background-pages'
    // ], //
   
  });

  browserWSEndpoint = browser.wsEndpoint();
  // let pages = await browser.pages();
  // const page = await browser.newPage();
  // const session = await page.target().createCDPSession();
  // const { windowId } = await session.send('Browser.getWindowForTarget');
  // await session.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'minimized' } });
  return browserWSEndpoint;
}

async function getBrowser(getNew?: boolean,  executablePath?) {
  // return getBrowserInstance(getNew, executablePath);
  const browserWSEndpoint = await getBrowserInstance(getNew, executablePath);
  const browser = await puppeteer.connect({
    browserWSEndpoint,
    protocolTimeout: 0,
    // protocolError: "ignore",
    //  ignoreHTTPSErrors: true,
    // defaultViewport: null,
    // defaultViewport: null
    // defaultViewport: KnownDevices[account.emulate] ? KnownDevices[account.emulate].viewport : null,
  })
  return browser
}

async function connectBrowser(browserWS) {
  const browser = await puppeteer.connect({
    browserWSEndpoint: browserWS,
    protocolTimeout: 0,
    // defaultViewport: null,
    defaultViewport: null
  })
  return browser
}
// module.exports = {
//   getEndpoint: getBrowserInstance,
//   getBrowser: getBrowser
// }
export const getEndpoint = getBrowserInstance
export { getBrowser, connectBrowser }