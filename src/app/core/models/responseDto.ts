import { ErrorDto } from "./errorDto";

export interface ResponseDto<T> {
    data: T;
    statusCode: number;
    error: ErrorDto;
}


export interface ResponseListDto<T> {
    data: T[];
    statusCode: number;
    error: ErrorDto;
}


export interface ResponseListWithCountDto<T> {
    data: T[];
    statusCode: number;
    error: ErrorDto;
    totalCount:number

}
