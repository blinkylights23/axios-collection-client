import axios, { AxiosInstance } from 'axios'
import { CollectionClient, CollectionClientConfig } from '../src/index.js'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'https://newsapi.org/v2/everything',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': process.env.NEWSAPI_KEY
  }
})
const options: CollectionClientConfig = {
  axios: axiosInstance,
  pagination: {
    items: res => res.data.articles,
  }
}

const cclient = new CollectionClient(options)
cclient.itemStream({ params: { q: 'Trump'}}).then(rs => {
  console.log(rs)
})

