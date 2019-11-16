import { Base } from '../../interface';
import * as Fs from 'fs';
import { template } from '../../../utils';
import * as config from '../../../utils/config';

module.exports = class Reader implements Base {
  constructor() {

  }

  hasChapter () {
    return false;
  }
  getChapter (path: string) {
    return new Promise((resolve) => { resolve([]); });
  }
  getContent (extensionPath: string, path: Array<string>) {
    return new Promise((resolve) => {
      const p = typeof path === 'string' ? path : path[0];
      resolve(template(
        extensionPath,
        'static/template/default/index.html',
        {
          progress: config.get(p, 'progress'),
          contentType: 'html',
          content: Fs.readFileSync(p, 'utf-8')
        },
      ));
    });

  }
};