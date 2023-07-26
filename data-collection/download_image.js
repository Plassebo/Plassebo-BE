import fs from 'fs';
import axios from 'axios';

const file = fs.readFileSync('busan_attractions.json');
const json = JSON.parse(file);
const item = json.item;

for (const place of item) {
  const contentId = place.contentid;
  const imageUrl = place.firstimage;
  const fileName = `./images/${contentId}.jpg`;

  if (imageUrl === '') {
    continue;
  }

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    fs.writeFileSync(fileName, response.data);
  } catch (exception) {
    console.log(`Error occured at ${contentId}`);
  }
}
