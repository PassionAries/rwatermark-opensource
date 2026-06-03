import { BadRequestException, HttpException, Injectable, OnModuleInit } from '@nestjs/common';
import { In, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as superagent from 'superagent';
import { ShortVideoEntity } from 'src/entities/shortVideo.entity';
import { Browser, KnownDevices, Page } from 'puppeteer-core';
import { getBrowser } from './puppeteer/puppeteer';

@Injectable()
export class DouyinV2Service implements OnModuleInit {
     private browser:Browser|null=null;
    private pagePool: Page[] = []; // 页面池
     private pagePoolSize = 3; // 页面池大小，可根据实际情况调整
     private pagePoolLock = false; // 页面池锁，防止并发创建过多页面
     private userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36";
    // 构造请求头
      headers = {
            'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 Edg/122.0.0.0`
      }
      constructor(
        @InjectRepository(ShortVideoEntity)
        private shortVideoRepository:Repository<ShortVideoEntity>,
        
    ) {}

    async onModuleInit(){
        console.log("DouyinV2Service onModuleInit",process.env.NODE_ENV);
        if(process.env.NODE_ENV=='local'){
            console.log("DouyinV2Service onModuleInit local skip");
            return null;
        }
        this.initBrowser();
        
    }
    async initBrowser(){
       this.browser = await getBrowser(true);
       this.browser.on("disconnected",() => {
            this.log('浏览器连接断开，尝试重新连接...');
            this.browser = null;
            this.initBrowser();
        });
        this.log("get browser success");
        await this.initPagePool();
        console.log("DouyinV2Service onModuleInit success");
    }
    /**
     * 初始化页面池
     */
    private async initPagePool() {
        this.pagePool=[];
        if (!this.browser) return;
        
        try {
            // 预创建几个页面
            let pages = await this.browser.pages();
            for(let i=0;i<pages.length;i++){
                let page = pages[i];
                // await page.setViewport({ width: 1920, height: 1080 });
                // let device = KnownDevices['iPhone 14 Pro Max'];
                // await page.emulate(device);
                await this.enableCache(page);
                // await page.goto("https://www.douyin.com").catch(() => {});
                // await page.setUserAgent(this.userAgent);
                this.pagePool.push(page);
            }
            // for (let i = 0; i < Math.min(this.pagePoolSize, 2); i++) {
            //     const page = await this.browser.newPage();
            //     // 设置一些默认配置
            //     await page.setViewport({ width: 1920, height: 1080 });
            //     await this.enableCache(page);
            //     page.goto("https://www.douyin.com").catch(() => {});
            //     // await page.setUserAgent(this.userAgent);
            //     this.pagePool.push(page);
            // }
            this.log(`页面池初始化完成，当前页面数: ${this.pagePool.length}`);
        } catch (error) {
            this.log('页面池初始化失败:', error);
        }
    }
    // 新增方法：启用页面缓存
    private async enableCache(page: Page) {
        try {
            const client = await page.target().createCDPSession();
            // 启用网络域和缓存
            await client.send('Network.enable');
            await client.send('Network.setCacheDisabled', { cacheDisabled: false });
            // 设置缓存大小（可选）
            await client.send('Network.setBypassServiceWorker', { bypass: false });
        } catch (error) {
            this.log('启用缓存失败:', error);
        }
    }

    
    /**
     * 从页面池获取页面
     */
    private async getPageFromPool(): Promise<Page> {
        // 如果池中有可用页面，直接返回
        if (this.pagePool.length > 0) {
            console.log("getPageFromPool pagePool:",this.pagePool.length);
            const page = this.pagePool.pop()!;
            // 检查页面是否已关闭
            if (page.isClosed()) {
                // 如果页面已关闭，创建新页面
                return await this.createNewPage();
            }
            
            return page;
        }
        
        // 如果池中没有页面，创建新页面
        return await this.createNewPage();
    }
    
    /**
     * 创建新页面
     */
    private async createNewPage(): Promise<Page> {
        if (!this.browser) {
            throw new Error("browser not found");
        }
        
        const page = await this.browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        await this.enableCache(page);
        page.goto("https://www.douyin.com").catch(() => {});
        // await page.setUserAgent(this.userAgent);
        return page;
    }
    
    /**
     * 将页面归还到页面池
     */
    private async returnPageToPool(page: Page) {
        try {

            // 清理页面状态
            if (!page.isClosed()) {
                // 清除所有cookies和缓存
                const client = await page.target().createCDPSession();
                await client.send('Network.clearBrowserCache');
                await client.send('Network.clearBrowserCookies');
                this.log("clearBrowserCache and clearBrowserCookies");
                // 导航到空白页，清理页面状态
                await page.goto('about:blank', { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {});
            }
            
            // 如果页面池未满，且页面未关闭，则归还
            if (this.pagePool.length < this.pagePoolSize && !page.isClosed()) {
                this.pagePool.push(page);
            } else {
                // 如果池已满或页面已关闭，直接关闭页面
                if (!page.isClosed()) {
                    await page.close().catch(() => {});
                }
            }
        } catch (error) {
            // 如果归还失败，尝试关闭页面
            this.log('归还页面到池失败:', error);
            if (!page.isClosed()) {
                await page.close().catch(() => {});
            }
        }
    }
    
    log(...args:any[]){
        console.log("douyin:",...args);
    }
    unescapeDouyinJson(raw:string) {
        const ph = '\u0001';
        return raw
            .replace(/\\\\\\"/g, ph)   // 字符串值内的 \\\" 先保护
            .replace(/\\"/g, '"')       // 结构层的 \" → "
            .replace(new RegExp(ph, 'g'), '\\"')
            .replace(/"\$undefined"/g, 'null')
            .replace(/"\$a"/g, 'null'); // 偶发的占位符
        }
      private isNavigationContextError(err: unknown): boolean {
        const msg = err instanceof Error ? err.message : String(err);
        return msg.includes('Execution context was destroyed')
            || msg.includes('Cannot find context');
    }
         /** 页面跳转中 page.content() 会失败，重试几次 */
    private async safePageContent(page: Page, maxRetries = 3): Promise<string> {
        let lastError: Error;
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                await page.waitForFunction(
                    () => document.readyState === 'complete',
                    { timeout: 12000 },
                ).catch(() => {});
                return await page.content();
            } catch (e) {
                lastError = e instanceof Error ? e : new Error(String(e));
                if (!this.isNavigationContextError(e) || attempt >= maxRetries - 1) {
                    throw lastError;
                }
                this.log(`safePageContent 重试 (${attempt + 1}/${maxRetries}):`, lastError.message);
                await new Promise(resolve => setTimeout(resolve, 800 * (attempt + 1)));
            }
        }
        throw lastError!;
    }
     async parseWatermark(url:string,openid:string,appid:string,originUrl:string){
        if(!this.browser){
            throw new Error("browser not found");
        }
        let page: Page | null = null;
        let shortVideo = new ShortVideoEntity();
        shortVideo.type="douyin";
        shortVideo.openid = openid;
        shortVideo.contentType="video";
        shortVideo.status=0;
        shortVideo.originUrl=originUrl;
        shortVideo.appid = appid;
        let id = await this.extractId(url);
        try{
            this.log("id:",id);

            page = await this.getPageFromPool();
            await page.goto(url,{
                waitUntil: 'domcontentloaded', // 或 'networkidle2'（最多2个连接）
                // timeout: 1000*60 // 增加到60秒
            });
            // await new Promise(resolve => setTimeout(resolve, 350));
            let pageUrl = page.url();
            console.log("pageUrl:",pageUrl);
            // if(!pageUrl.includes("www.douyin.com") && !pageUrl.includes("iesdouyin.com")){
            //     await page.goto(`https://www.douyin.com/video/${id}`,{
            //         waitUntil: 'domcontentloaded', // 或 'networkidle2'（最多2个连接）
            //         // timeout: 1000*60 // 增加到60秒
            //     });
            //     pageUrl = page.url();
            // }
            // if(pageUrl.startsWith("https://www.iesdouyin.com/share/video/")){
            //     // let id = pageUrl.split("/").pop();
            if(pageUrl.startsWith("https://www.douyin.com/video") ){
                    this.log("waitForResponse:aweme/v1/web/aweme/detail/");
                    // 先获取文本内容，然后手动解析 JSON（避免响应体被消费的问题）
                    let textData: string='';
                    let retryCount = 0;
                    const maxRetries = 3;
                    // user-tab-count
                    // let content = await page.content();
                    // console.log("content:",content);
                    while (retryCount < maxRetries) {
                        try {
                            let response2 = await page.waitForResponse(response => {
                                const url = response.url();
                                const method = response.request().method();
                                const isValid = url.includes("/aweme/v1/web/aweme/detail"); 
                                return isValid && method === 'GET' && response.ok();
                            }, {
                                timeout: 1000*15 // 增加到15秒
                            });
                            console.log("pageUrl:",page.url());

                            textData = await response2.text();                                                        
                            this.log(`响应文本长度: ${textData ? textData.length : 0}, 重试次数: ${retryCount}`);
                            // this.log(`响应文本: ${textData}`);
                            // 如果文本不为空，跳出循环
                            if (textData && textData.trim().length > 0) {
                                break;
                            }
                            
                            // 如果文本为空且还有重试机会，等待后重试
                            if (retryCount < maxRetries - 1) {
                                this.log(`响应文本为空，等待 ${(retryCount + 1) * 200}ms 后重试...`);
                                    await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
                                retryCount++;
                            } else {
                                // 最后一次重试仍然为空
                                this.log("响应文本为空，已重试所有次数");
                                // 记录更多调试信息
                                this.log(`响应 URL: ${response2.url()}`);
                                this.log(`响应状态: ${response2.status()}`);
                                throw new HttpException('响应文本为空', 500);
                            }
                        } catch (error) {
                            if (retryCount < maxRetries - 1) {
                                this.log(`获取响应文本失败: ${error.message}，等待 ${(retryCount + 1) * 200}ms 后重试...`);
                                await page.reload();
                                await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 200));
                                retryCount++;
                            } else {
                                this.log(`获取响应文本失败: ${error.message}`);
                                throw new HttpException(`获取响应文本失败: ${error.message}`, 500);
                            }
                        }
                    }
                    
                    // 检查文本是否为空
                    if (!textData || textData.trim().length === 0) {
                        this.log("响应文本为空");
                        throw new HttpException('响应文本为空', 500);
                    }
                    
                    // 手动解析 JSON
                    let data: any;
                    try {
                        data = JSON.parse(textData);
                    } catch (error) {
                        this.log(`JSON 解析失败: ${error.message}`);
                        this.log(`响应文本前500字符: ${textData.substring(0, 500)}`);
                        throw new HttpException(`JSON 解析失败: ${error.message}`, 500);
                    }
                    
                    // 检查数据是否有效
                    if (!data || !data.aweme_detail) {
                        this.log("data", JSON.stringify(data));
                        this.log("响应数据无效或缺少 aweme_detail");
                        throw new HttpException('响应数据无效', 500);
                    }
                    // await page.close(); // 关闭页面
                    // console.log("data", JSON.stringify(data));
                    // let res = await superagent.get(url).redirects(3);
                    // console.log(res.text);
                    // 发送请求获取视频信息
                    // console.log("data", JSON.stringify(data));
                    let url_list = data.aweme_detail?.video?.play_addr?.url_list||[];
                    let play_url = url_list[url_list.length-1]||'';
                    shortVideo.content={
                        user_info: {
                            nickname: data.aweme_detail.author?.nickname || '',
                            unique_id: data.aweme_detail.author?.sec_uid || '',
                            avatar_medium: data.aweme_detail.author?.avatar_thumb?.url_list?.[0] || '',
                        },
                        like: data.aweme_detail.statistics?.digg_count || 0,
                        time: data.aweme_detail.create_time || 0,
                        title: data.aweme_detail?.desc || '',
                        cover: data.aweme_detail?.cover_hd?.cover?.url_list?.[0] || '',
                        images: data.aweme_detail?.images?.length > 0 ? data.aweme_detail?.images : '', //当前为短视频解析模式
                        url: play_url,
                        videos:[
                            {url: play_url,cover: data.aweme_detail?.cover_hd?.cover?.url_list?.[0] || ''}
                        ],
                        music: {
                            title: data.aweme_detail?.music?.title || '',
                            author: data.aweme_detail?.music?.author || '',
                            avatar: data.aweme_detail?.music?.cover_hd?.cover?.url_list?.[0] || '',
                            url: data.aweme_detail?.music?.play_url?.url_list?.[0] || '',
                        }
                    };
                    shortVideo.status=1;
                    shortVideo = await this.shortVideoRepository.save(shortVideo);
                    // 
                    // await page.goto(`https://www.baidu.com`)
                    return {
                        id:shortVideo.id,
                    };
            }else if(pageUrl.startsWith("https://www.douyin.com/note")){ //图文分享
                this.log("waitForResponse:aweme/v1/web/aweme/post");
                let htmlcontent = await this.safePageContent(page);
                // console.log("htmlcontent",htmlcontent);
                htmlcontent = htmlcontent.replace(/\$undefined/g, 'null');
                let out = htmlcontent.match(/\{\\"awemeId.+?<\/script>/)?.[0]||null;
            //    console.log("out",out);
                // .text().match(/\{\"awemeId\"\:".+\n/);
                // let out = htmlcontent.match(/{\"awemeId.+?\}\]<\/script>/s);
                // console.log("out",out);
                // fs.writeFileSync(process.cwd()+"/htmlcontent_"+id+".html",out||'');
                if(!out){
                    this.log("图文分享不存在");
                    return null;
                }
                // let obj = out[0].slice(0, -3);
                let jobj = out.slice(0, -15)
                // console.log("jobj",jobj.toString());
                let aweme = JSON.parse(this.unescapeDouyinJson(jobj.toString())).aweme.detail;
                //  let response2 = await page.waitForResponse(response => {
                //     const url = response.url();
                //     const method = response.request().method();
                //     const isValid = url.includes("aweme/v1/web/aweme/post") 
                //     && method === 'GET' 
                //     && response.ok();
                //     return isValid;
                // }, {
                //     timeout: 1000*15 // 增加到15秒
                // });

                // let textData = await response2.text();                                                        
                // this.log(`note = 响应文本长度: ${textData ? textData.length : 0}`);
                // let aweme_list = JSON.parse(textData).aweme_list;
                // return null;
                let aweme_detail = aweme;//aweme_list.find((item: any) => item.aweme_id === id);
                this.log("aweme_detail",aweme_detail);
                if(!aweme_detail){
                    shortVideo.status=2;
                    shortVideo.msg="图文分享不存在";
                    await this.shortVideoRepository.save(shortVideo);
                    return null;
                }
                let images:string[]=[];
                let videos:{url:string,cover:string,width?:number,height?:number}[]=[];
                let music ={
                    title: aweme_detail?.music?.title||'',
                    author: aweme_detail?.music?.author||'',
                    avatar: aweme_detail?.music?.coverThumb.urlList[0]||'',
                    url: aweme_detail?.music?.playUrl.uri
                }
                let desc =aweme_detail?.desc||''
                if(aweme_detail.images){
                   aweme_detail.images.map((item:any)=>{
                    if(item?.urlList && item?.urlList.length > 0){
                        images.push(item?.urlList?.[0]||'');
                    }
                    if(item.video){
                        // let play_url = item.video.playAddr.find((item:any)=>{
                        //     let url = item.src;
                        //     if(url && url.includes('play')){
                        //         return url;
                        //     }
                        // })
                        let play_url = item.video.playApi||'';
                        // if(!play_url){
                        //     // item.video.playAddr.urlList[item.video.playAddr.urlList.length-1];
                        // }
                        if(play_url){
                            videos.push({
                                url: play_url||'',
                                cover: item.video.cover,
                                width: item.video.width||0,
                                height: item.video.height||0,
                            });
                        }
                    }
                   }) 
                }
                
                shortVideo.content={
                    user_info: {
                        nickname: aweme_detail.author?.nickname || '',
                        unique_id: aweme_detail.author?.unique_id || '',
                        avatar_medium: aweme_detail.author?.avatarThumb.urlList[0] || '',
                    },
                    title: desc|| '',
                    cover: videos?.[0]?.cover||'',
                    images: images,
                    videos: videos||[],
                    music: music,
                    url:videos?.[0]?.url||'',
                    create_time: aweme_detail.createTime || 0,
                };
                shortVideo.status=1;
                shortVideo = await this.shortVideoRepository.save(shortVideo);
                return {
                    id:shortVideo.id,
                };
                // this.log(`响应文本: ${textData}`);
                // 如果文本不为空，跳出循环
               
            }else if(pageUrl.startsWith("https://music.douyin.com")){ //音乐分享

            }else{
                shortVideo.status=2;
                shortVideo.msg="簪不支持该类型。";
                await this.shortVideoRepository.save(shortVideo);
                return null;
            }
            
            // await page.close();
        }catch(err){
            this.log('parseWatermark error:', err);
            throw err;
        }finally{
            if(page){
                await this.returnPageToPool(page);
            }
        }
        
        if(!id){
            shortVideo.msg="视频ID不存在";
            shortVideo.status=2;
            await this.shortVideoRepository.save(shortVideo);
            return null;
        }
        const response = await (await superagent.post('https://www.iesdouyin.com/share/video/' + id).set(this.headers));
        // console.log("response",response.text);
        // console.log(response.text);
                // 提取 window._ROUTER_DATA 的内容
        const pattern = /window\._ROUTER_DATA\s*=\s*(.*?)\<\/script>/s;
        const matches = response.text.match(pattern);

        if (!matches || !matches[1]) {
            shortVideo.msg="解析数据失败";
            shortVideo.status=2
            await this.shortVideoRepository.save(shortVideo);
            return null;
        }
         let videoInfo: any;
        try {
            videoInfo = JSON.parse(matches[1].trim());
            console.log("videoInfo",matches[1].trim());
        } catch (error) {
            console.log('JSON 解析失败: ' + (error instanceof Error ? error.message : String(error)));
            shortVideo.status=2
            shortVideo.msg="JSON 解析失败: " + (error instanceof Error ? error.message : String(error));
            await this.shortVideoRepository.save(shortVideo);
            return null;
            // return { code: 201, msg: 'JSON 解析失败: ' + (error instanceof Error ? error.message : String(error)) };
        }
        // console.log(videoInfo);

        if (!videoInfo?.loaderData) {
            console.log('数据查找失败' + response );
            shortVideo.status=2
            shortVideo.msg="数据查找失败" + response;
            await this.shortVideoRepository.save(shortVideo);
            return null;
        }

        const itemList = videoInfo.loaderData['video_(id)/page']?.videoInfoRes?.item_list?.[0];
        if (!itemList) {
            console.log("视频信息不存在")
            shortVideo.status=2
            shortVideo.msg="视频信息不存在";
            await this.shortVideoRepository.save(shortVideo);
            return null;
            // return { code: 201, msg: '视频信息不存在' };
        }

        // 替换 "playwm" 为 "play" 获取无水印视频 URL
        const videoResUrl = itemList.video?.play_addr?.url_list?.[0]?.replace('playwm', 'play') || '';

        // 处理图片数组
        const imgurljson = itemList.images || [];
        const imgurl: string[] = [];
        if (Array.isArray(imgurljson) && imgurljson.length > 0) {
            imgurljson.forEach((item: any) => {
            if (item?.url_list && Array.isArray(item.url_list) && item.url_list.length > 0) {
                imgurl.push(item.url_list[0]);
            }
            });
        }

        // 处理音乐信息
        let music: {
            title: string;
            author: string;
            avatar: string;
            url: string;
        } | undefined;

        if (itemList.music) {
            music = {
                title: itemList.music.title || '',
                author: itemList.music.author || '',
                avatar: itemList.music.cover_large?.url_list?.[0] || '',
                url: itemList.music?.play_addr?.url_list[0] || '',
            };
        }

        // 检查是否有视频或图片
        if (!videoResUrl && imgurl.length === 0) {
            console.log('当前分享链接已失效！');
            shortVideo.status=2
            shortVideo.msg="当前分享链接已失效！";
            await this.shortVideoRepository.save(shortVideo);
            return null;
        }

        // 构造返回数据
        shortVideo.content={
            author: itemList.author?.nickname || '',
            uid: itemList.author?.unique_id || '',
            avatar: itemList.author?.avatar_medium?.url_list?.[0] || '',
            like: itemList.statistics?.digg_count || 0,
            time: itemList.create_time || 0,
            title: itemList.desc || '',
            cover: itemList.video?.cover?.url_list?.[0] || '',
            images: imgurl.length > 0 ? imgurl : [], //当前为短视频解析模式
            url: videoResUrl,
        };
        if(imgurl.length > 0){
            shortVideo.contentType='image';
        }
        shortVideo.status=1;
        shortVideo = await this.shortVideoRepository.save(shortVideo);
        return {
            id:shortVideo.id,
        };


     }
     /**
     * 从 URL 中提取视频 ID
     * @param url 抖音分享链接
     * @returns 视频 ID 或 null
     */
    async extractId(url: string): Promise<string | null> {
        try {
            // 使用 superagent 获取重定向后的 URL
            const response = await superagent
            .get(url)
            .redirects(30)
            .ok(() => true); // 允许所有状态码
            // this.log("response:",response.text);
            // 获取最终的重定向 URL
            const finalUrl = response.redirects.length > 0 
            ? response.redirects[response.redirects.length - 1]
            : url;

            // 使用正则表达式提取视频 ID
            // console.log("finalUrl:",finalUrl);
            const match = finalUrl.match(/[0-9]+|(?<=video\/)[0-9]+/);
            return match ? match[0] : null;
        } catch (error) {
            console.error("extractId error:",error);
            // 如果请求失败，尝试直接从 URL 中提取
            const match = url.match(/[0-9]+|(?<=video\/)[0-9]+/);
            return match ? match[0] : null;
        }
    }

}



interface DouyinDataResponse {
//   code: number;
//   msg: string;
//   data?: {
    author: string;
    uid: string;
    avatar: string;
    like: number;
    time: number;
    title: string;
    cover: string;
    images: string[] | string;
    url: string;
    music?: {
      title: string;
      author: string;
      avatar: string;
      url: string;
    } | string;
//   };
}