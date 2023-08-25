import stream from 'stream'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

interface CollectionClientConfig {
  axios?: AxiosInstance
  pageBufferSize?: number
  itemBufferSize?: number
  pagination?: {
    start?: () => AxiosRequestConfig
    end?: (res: AxiosResponse) => boolean
    next?: (res: AxiosResponse) => AxiosRequestConfig
    items?: (res: AxiosResponse, error: any) => any[]
    break?: (res: AxiosResponse, errorAccumulator: number) => boolean
  }
}

class CollectionClient {
  config: any
  constructor(config = {}) {
    const defaultConfig = {
      axios: axios.create(),
      pageBufferSize: 5,
      itemBufferSize: 5,
      pagination: {
        start: () => ({}),
        end: (res: AxiosResponse) => false,
        next: (res: AxiosResponse) => ({ page: res.data.next }),
        items: (res: AxiosResponse) => res.data.items,
        break: (res: AxiosResponse, count: number) => false
      }
    }
    this.config = {
      ...defaultConfig,
      ...config
    }
  }

  _ag2rs(gen: AsyncGenerator<any, any, any>, hwm: number): stream.Readable {
    return stream.Readable.from(gen, {
      highWaterMark: hwm,
      objectMode: true
    })
  }

  async *pageGen(params: AxiosRequestConfig) {
    let axiosConfig = { ...params, ...this.config.pagination.start() }
    let errorAccumulator = 0
    while (true) {
      let response
      let responseError
      try {
        response = await this.config.axios(axiosConfig)
        responseError = null
      } catch (error) {
        response = null
        responseError = error
        errorAccumulator += 1
      }
      if (responseError) {
        yield {
          axiosConfig: axiosConfig,
          type: 'error',
          response: responseError
        }
      } else {
        errorAccumulator = 0
        yield {
          axiosConfig: axiosConfig,
          type: 'page',
          response,
          items: this.config.pagination.items(response, responseError)
        }
      }
      if (this.config.pagination.break(response, errorAccumulator)) break
      if (this.config.pagination.end(response)) break
      const nextParams = this.config.pagination.next(response)
      axiosConfig = {
        ...axiosConfig,
        ...nextParams
      }
    }
  }

  async pageStream(params: AxiosRequestConfig) {
    const generator = await this.pageGen(params)
    return this._ag2rs(generator, this.config.pageBufferSize)
  }

  async *itemGen(params: AxiosRequestConfig) {
    const stream = await this.pageStream(params)
    for await (const chunk of stream) {
      yield chunk
      yield* chunk.items.map((item: any) => ({ type: 'item', item }))
    }
  }

  async itemStream(params: AxiosRequestConfig): Promise<stream.Readable> {
    const generator = await this.itemGen(params)
    return this._ag2rs(generator, this.config.itemBufferSize)
  }
}

export { CollectionClient, CollectionClientConfig }
