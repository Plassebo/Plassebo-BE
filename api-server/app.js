import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

const app = express();
const port = 8080;

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './uploads/');
  },
  filename: (req, file, callback) => {
    callback(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(cors());

app.post('/images', upload.single('file'), async (req, res, next) => {
  const { fieldname, originalname, encoding, mimetype, destination, filename, path, size } = req.file;
  const { name } = req.body;

  console.log('body 데이터 : ', name);
  console.log('폼에 정의된 필드명 : ', fieldname);
  console.log('사용자가 업로드한 파일 명 : ', originalname);
  console.log('파일의 엔코딩 타입 : ', encoding);
  console.log('파일의 Mime 타입 : ', mimetype);
  console.log('파일이 저장된 폴더 : ', destination);
  console.log('destinatin에 저장된 파일 명 : ', filename);
  console.log('업로드된 파일의 전체 경로 ', path);
  console.log('파일의 바이트(byte 사이즈)', size);

  // buffer를 FormData로 감쌈
  const formData = new FormData();
  formData.append('image', fs.createReadStream(`./uploads/${filename}`));

  // 다른 서버로 전송
  const result = await axios.post('http://localhost:5000/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      // ...formData.getHeaders(),
      // 'Content-Length': formData.getLengthSync(),
    },
  });

  console.log(result.data);

  // 모델 돌리는 서버 만들어서 관광지 이름 가져오기
  const attractionName = result.data;

  // 메모: busan_attraction.json에서 "cat1": "A05" 혹은 "contenttypeid": "39" 는 음식점을 의미
  const attractions = JSON.parse(fs.readFileSync('../data-collection/data_crawl.json')).item;
  const found = attractions.filter((attraction) => attraction.title == attractionName)[0];

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const deg2rad = (deg) => {
      return deg * (Math.PI / 180);
    };

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1); // deg2rad below
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  const filtered = attractions
    .filter((attraction) => attraction.cat1 == 'A05')
    .map((attraction) => {
      // 음식점이 아닌 경우 고려대상에서 제외
      const distance = calculateDistance(found.mapy, found.mapx, attraction.mapy, attraction.mapx);

      attraction.distance = distance;

      return attraction;
    })
    .filter((attraction) => (attraction.distance > 1.0 ? false : true));

  filtered.sort((a, b) => a.distance - b.distance);

  res.json({
    attractionName,
    restaurants: filtered,
  });
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
