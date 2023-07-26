import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';

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

app.post('/images', upload.single('file'), (req, res, next) => {
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

  // TODO: 모델 돌리는 서버 만들어서 관광지 이름 가져오기, 지금은 모델이 '해운대해수욕장'이라고 추론한 것으로 가정
  const attractionName = '해운대해수욕장';

  // 메모: busan_attraction.json에서 "cat1": "A05" 혹은 "contenttypeid": "39" 는 음식점을 의미
  const attractions = JSON.parse(fs.readFileSync('../data-collection/busan_attractions.json')).item;
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

  const filtered = attractions.filter((attraction) => {
    // 음식점이 아닌 경우 고려대상에서 제외
    if (attraction.cat1 != 'A05') {
      return false;
    }
    const distance = calculateDistance(found.mapy, found.mapx, attraction.mapy, attraction.mapx);

    // 거리가 2km 초과인 경우 제외
    if (distance > 2.0) {
      return false;
    }
    return true;
  });

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
