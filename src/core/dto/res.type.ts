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