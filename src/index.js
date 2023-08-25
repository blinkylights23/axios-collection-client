import stream from 'stream';
import axios from 'axios';
class CollectionClient {
    config;
    constructor(config = {}) {
        const defaultConfig = {
            axios: axios.create(),
            pageBufferSize: 5,
            itemBufferSize: 5,
            pagination: {
                start: () => ({}),
                end: (res) => false,
                next: (res) => ({ page: res.data.next }),
                items: (res) => res.data.items,
                break: (res, count) => false
            }
        };
        this.config = {
            ...defaultConfig,
            ...config
        };
    }
    _ag2rs(gen, hwm) {
        return stream.Readable.from(gen, {
            highWaterMark: hwm,
            objectMode: true
        });
    }
    async *pageGen(params) {
        let axiosConfig = { ...params, ...this.config.pagination.start() };
        let errorAccumulator = 0;
        while (true) {
            let response;
            let responseError;
            try {
                response = await this.config.axios(axiosConfig);
                responseError = null;
            }
            catch (error) {
                response = null;
                responseError = error;
                errorAccumulator += 1;
            }
            if (responseError) {
                yield {
                    axiosConfig: axiosConfig,
                    type: 'error',
                    response: responseError
                };
            }
            else {
                errorAccumulator = 0;
                yield {
                    axiosConfig: axiosConfig,
                    type: 'page',
                    response,
                    items: this.config.pagination.items(response, responseError)
                };
            }
            if (this.config.pagination.break(response, errorAccumulator))
                break;
            if (this.config.pagination.end(response))
                break;
            const nextParams = this.config.pagination.next(response);
            axiosConfig = {
                ...axiosConfig,
                ...nextParams
            };
        }
    }
    async pageStream(params) {
        const generator = await this.pageGen(params);
        return this._ag2rs(generator, this.config.pageBufferSize);
    }
    async *itemGen(params) {
        const stream = await this.pageStream(params);
        for await (const chunk of stream) {
            yield chunk;
            yield* chunk.items.map((item) => ({ type: 'item', item }));
        }
    }
    async itemStream(params) {
        const generator = await this.itemGen(params);
        return this._ag2rs(generator, this.config.itemBufferSize);
    }
}
export { CollectionClient };
