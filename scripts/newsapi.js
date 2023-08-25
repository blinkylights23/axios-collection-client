import axios from 'axios';
import { CollectionClient } from '../src/index.js';
const axiosInstance = axios.create({
    baseURL: 'https://newsapi.org/v2/everything',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.NEWSAPI_KEY
    }
});
const options = {
    axios: axiosInstance,
    pagination: {
        items: res => res.data.articles,
    }
};
const cclient = new CollectionClient(options);
cclient.itemStream({ params: { q: 'Trump' } }).then(rs => {
    console.log(rs);
});
