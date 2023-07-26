import express from 'express';
import cors from 'cors';
import multer from 'multer';

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

  // TODO: 모델 돌리는 서버 만들어서 관광지 이름 가져오기, 지금은 모델이 '해운대'라고 추론한 것으로 가정

  const attractionName = '해운대';

  // TODO: attractionName 근처에 있는 음식점들 json으로 가져오기
  // 메모: busan_attraction.json에서 "cat1": "A05" 혹은 "contenttypeid": "39" 는 음식점을 의미

  res.json({
    attractionName,
    restaurants: [
      {
        name: '미우 숯불갈비',
        address: '부산 해운대구 구남로 22 2층',
        phoneNumber: '0507-1389-8983',
      },
      {
        name: '미우 숯불갈비',
        address: '부산 해운대구 구남로 22 2층',
        phoneNumber: '0507-1389-8983',
      },
      {
        name: '미우 숯불갈비',
        address: '부산 해운대구 구남로 22 2층',
        phoneNumber: '0507-1389-8983',
      },
    ],
  });
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// 서버 시작
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
