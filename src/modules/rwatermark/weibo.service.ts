import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { In, IsNull, Repository } from 'typeorm';
import * as fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { ShortVideoEntity } from 'src/entities/shortVideo.entity';
import * as superagent from 'superagent';
import path from 'path';

@Injectable()
export class WeiboService {
    // 构造请求头
      headers = {
            'User-Agent': `Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 Edg/122.0.0.0`
      }

      constructor(
       
        @InjectRepository(ShortVideoEntity)
        private shortVideoRepository:Repository<ShortVideoEntity>,
        
    ) {}
    log(...args:any[]){
        console.log("weibo:",...args);
    }
    async parseWatermark(url:string,openid:string,appid:string,originUrl:string){
        console.log("url",url);
        let shortVideo = new ShortVideoEntity();
        shortVideo.type="weibo";
        shortVideo.openid = openid;
        shortVideo.contentType="video";
        shortVideo.status=0;
        shortVideo.originUrl=originUrl;
        shortVideo.appid = appid;
        let id = '';
        // 模式1: show?fid=
        if (url.includes('show?fid=')) {
            const match = url.match(/fid=(.*)/);
            if (match && match[1]) {
                id = match[1];
            }
        }else {
            const match = url.match(/\d+:\d+/);
            if (match && match[0]) {
                id = match[0];
            }
        }

        if (!id) {
            shortVideo.status=2;
            shortVideo.msg="解析失败！";
            await this.shortVideoRepository.save(shortVideo);
            return null;
        }
        console.log("id",id);
        try {
            const responseText = await this.weibo_curl(id);
            const arr: WeiboApiResponse = JSON.parse(responseText);
            console.log("arr",arr);
            if (arr && arr.data?.Component_Play_Playinfo) {
            const playInfo = arr.data.Component_Play_Playinfo;
            
            // 获取第一个可用的视频 URL
            const urls = playInfo.urls || {};
            const qualityKeys = Object.keys(urls);
            if (qualityKeys.length === 0) {
                shortVideo.status=2;
                shortVideo.msg="解析失败！";
                await this.shortVideoRepository.save(shortVideo);
                return null;
            }
            
                const one = qualityKeys[0];
                const video_url = urls[one];
                shortVideo.content={
                        author: playInfo.author || '',
                        avatar: ('https:'+(playInfo.avatar || '')),
                        time: playInfo.real_date || '',
                        title: playInfo.text || playInfo.title || '',
                        cover: ('https:' + (playInfo.cover_image || '')),
                        url: ('https:' + video_url)
                }
                shortVideo.status=1;
                shortVideo.msg="解析成功！";
                shortVideo =await this.shortVideoRepository.save(shortVideo);
                return {id:shortVideo.id};

            }

            shortVideo.status=2 ;
            shortVideo.msg="解析失败！";
            await this.shortVideoRepository.save(shortVideo);
            return null;
        } catch (error) {
            console.error('解析失败:', error instanceof Error ? error.message : String(error));
            shortVideo.status=2;
            shortVideo.msg="解析失败！";
            await this.shortVideoRepository.save(shortVideo);
            return shortVideo;
        }
    }
    getCookie(): string {
        const cookiePath = path.join(process.cwd(), 'cookies/weibo.cookie');
        const cookie =fs.readFileSync(cookiePath, 'utf-8');
        if (!cookie) {
            throw new Error('Cookie 文件不存在');
        }
        return cookie;
    }
    /**
         * 发送 HTTP 请求到微博 API
         * @param id 视频 ID
         * @returns API 响应文本
         */
        async weibo_curl(id: string): Promise<string> {
        const cookie = this.getCookie(); // 获取cookie
        const postData = `data={"Component_Play_Playinfo":{"oid":"${id}"}}`;
        const url = `https://weibo.com/tv/api/component?page=/tv/show/${id}`;

        try {
            const response = await superagent
            .post(url)
            .set('Cookie', cookie)
            .set('Referer', `https://weibo.com/tv/show/${id}`)
            .set('Accept-Encoding', 'gzip,deflate')
            .send(postData)
            .timeout(5000)
            .ok(() => true);

            return response.text || '';
        } catch (error) {
            throw new Error(`微博 API 请求失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
   
}

interface WeiboVResponse {
  code: number;
  msg: string;
  data?: {
    author: string;
    avatar: string;
    time: string;
    title: string;
    cover: string;
    url: string;
  };
}

interface WeiboApiResponse {
  code?: number | string;
  data?: {
    Component_Play_Playinfo?: {
      author: string;
      avatar: string;
      real_date: string;
      title: string;
      text: string;
      cover_image: string;
      urls: Record<string, string>;
    };
  };
}