// const parseString = require('xml2js').parseString
import { parseString } from 'xml2js';
import zlib from 'zlib';
// xml2js.is
import * as _ from 'lodash';
export default {
    // 解析xml
    async parseXml(xml:string) {
        return new Promise((resolve, reject) => {
            parseString(xml, function (err:any, result:any) {
                if (err) {
                    reject(err)
                }
                resolve(result);
            });
        })
    },
    parseXml2(xml:string) {
        return new Promise((resolve, reject) => {
            const options = {
                explicitArray: false,  // 不强制创建数组
                ignoreAttrs: false,    // 不忽略属性
                mergeAttrs: true       // 合并属性到对象中
            };
            parseString(xml, options, function (err:any, result:any) {
                if (err) {
                    reject(err)
                }
                resolve(result);
            });
        })
    },
    formatPankouNum(num:any){
        let arr = num.split("/");
        if(arr.length==1){
            return arr[0].replace("+",'');
        }else{

            let a=0;
            let b=0
            arr[0] = arr[0].replace("+",'')
            let fuhao = arr[0][0] == '-' ? '-' : ''
            arr[0]=arr[0].replace("-",'')
            if(arr[0]!=0){
                a= arr[0]/2;
            }
            b = arr[1]/2;
            return  fuhao+(a+b)
        }
    },
    // 只判定上半场
    isAvailableTime(reTime = '') {
    const [half, time] = reTime.split(/[\^\']/)
    const [mins] = (time || '').split(':')
    if (!_.includes(['1H'], half)) {
        return false
    }
    return true;
    // return mins<'45';

    // const ruleData = rule.logic === 'MIX' ? rule.mix1 : rule
    // switch (ruleData.time_range) {
    //     case 'full':
    //         return true
    //     case 'first-half':
    //         return half === '1H'
    //     case 'second-half':
    //         return half === '2H'
    //     case 'inner':
    //         return ruleData.time_mins > mins
    //     case 'outer':
    //         return ruleData.time_mins <= mins
    // }
    },

    // 压缩 JSON 字符串（移除所有空格和换行）
    compressJson(obj: any): string {
        return JSON.stringify(obj);
    },
    
    // 压缩 JSON 并转换为 Buffer（更小的体积）
    compressJsonToBuffer(obj: any): Buffer {
        return Buffer.from(JSON.stringify(obj));
    },
    
    // 压缩 JSON 并 Base64 编码
    compressJsonToBase64(obj: any): string {
        return Buffer.from(JSON.stringify(obj)).toString('base64');
    },
    
    // 从 Base64 解码 JSON
    decompressJsonFromBase64(base64Str: string): any {
        return JSON.parse(Buffer.from(base64Str, 'base64').toString());
    },
    
    // 压缩 JSON 并 Gzip 压缩（需要 zlib）
    async compressJsonGzip(obj: any): Promise<Buffer> {
        const jsonStr = JSON.stringify(obj);
        return new Promise((resolve, reject) => {
            zlib.gzip(jsonStr, (err: any, buffer: Buffer) => {
                if (err) reject(err);
                else resolve(buffer);
            });
        });
    },
    
    // 从 Gzip 解压 JSON
    async decompressJsonFromGzip(buffer: Buffer): Promise<any> {
      
        return new Promise((resolve, reject) => {
            zlib.gunzip(buffer, (err: any, data: Buffer) => {
                if (err) reject(err);
                else resolve(JSON.parse(data.toString()));
            });
        });
    },
    async compressJsonGzipBase64(obj: any): Promise<string> {
        const buffer = await this.compressJsonGzip(obj);
        return buffer.toString('base64');
    },
    decompressJsonFromGzipBase64(base64Str: string): any {
        const buffer = Buffer.from(base64Str, 'base64');
        return this.decompressJsonFromGzip(buffer);
    }

}