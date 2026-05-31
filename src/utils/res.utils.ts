
/**
 * 通用返回数据结构
 */
// export interface IHttpRes {
//     /** 错误码 */
//     code?: number;
//     /** 返回的错误信息 */
//     msg?: string;
//     /** 返回的数据 */
//     data?: any;
//     /** 请求时的url */
//     url?: string;
//     timestamp?:string|Date
// }


export enum ResCode {
    SUCCESS = 200,
    FAIL = 500,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    METHOD_NOT_ALLOWED = 405,
    REQUEST_TIMEOUT = 408,
    CONFLICT = 409,
    GONE = 410,
}



export class ResType<T> {
    code?:ResCode=ResCode.SUCCESS;
    data?:T;
    msg?:string;
    url?:string;
    timestamp?:string|Date;
}
export class ResUtils {
    public static success<T>(res:ResType<T>):ResType<T>{
        return {
            code:res.code||ResCode.SUCCESS,
            data:res.data,
            msg:res.msg,
            url:res.url,
            timestamp:res.timestamp||new Date().toISOString(),
        }
    }
    public static fail<T>(res:ResType<T>):ResType<T>{
        return {
            code:res.code||ResCode.FAIL,
            data:res.data,
            msg:res.msg,
            url:res.url,
            timestamp:res.timestamp||new Date().toISOString(),
        }
    }   
}
