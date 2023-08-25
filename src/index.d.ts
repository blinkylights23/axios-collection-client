/// <reference types="node" resolution-mode="require"/>
import stream from 'stream';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
interface CollectionClientConfig {
    axios?: AxiosInstance;
    pageBufferSize?: number;
    itemBufferSize?: number;
    pagination?: {
        start?: () => AxiosRequestConfig;
        end?: (res: AxiosResponse) => boolean;
        next?: (res: AxiosResponse) => AxiosRequestConfig;
        items?: (res: AxiosResponse, error: any) => any[];
        break?: (res: AxiosResponse, errorAccumulator: number) => boolean;
    };
}
declare class CollectionClient {
    config: any;
    constructor(config?: {});
    _ag2rs(gen: AsyncGenerator<any, any, any>, hwm: number): stream.Readable;
    pageGen(params: AxiosRequestConfig): AsyncGenerator<{
        axiosConfig: any;
        type: string;
        response: {};
        items?: undefined;
    } | {
        axiosConfig: any;
        type: string;
        response: any;
        items: any;
    }, void, unknown>;
    pageStream(params: AxiosRequestConfig): Promise<stream.Readable>;
    itemGen(params: AxiosRequestConfig): AsyncGenerator<any, void, any>;
    itemStream(params: AxiosRequestConfig): Promise<stream.Readable>;
}
export { CollectionClient, CollectionClientConfig };
