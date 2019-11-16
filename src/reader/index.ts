
import * as Path from 'path';
import { Base } from './interface';

function reader (path: string): Base {
  const fileType = Path.extname(path);
  let driver;
  switch (fileType) {
    case '.txt':
      driver = require('./driver/txt');
      return new driver(...arguments);
    case '.epub':
      driver = require('./driver/epub');
      return new driver(...arguments);
    case '.qidian':
      driver = require('./driver/qidian');
      return new driver(...arguments);
    default:
      driver = require('./driver/txt');
      return new driver(...arguments);
  }
}

export default reader;
