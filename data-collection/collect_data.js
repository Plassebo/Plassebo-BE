import fs from 'fs';
import axios from 'axios';

const baseUrl = 'http://apis.data.go.kr/B551011/KorService1/areaBasedList1?_type=json';
const serviceKey = 'gQKgneur5xfePe%2BsmWgsd%2FQpaL0swLSBzPyYRUgEU%2FLLRqqv%2BqL%2BDz4sVNGu%2FP2WEnhjub1ekAQwUqEnT5aKoQ%3D%3D';
const MobileApp = 'busan-notifier';
const MobileOS = 'ETC';
const areaCode = '6';
const numOfRows = '2000';

const requestUrl = `${baseUrl}&serviceKey=${serviceKey}&MobileApp=${MobileApp}&MobileOS=${MobileOS}&areaCode=${areaCode}&numOfRows=${numOfRows}`;

const data = (await axios.get(requestUrl)).data;
const items = data.response.body.items;

fs.writeFileSync('data.json', JSON.stringify(items, null, 2));
