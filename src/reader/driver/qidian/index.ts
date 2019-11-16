import { Base } from '../../interface';
import { template } from '../../../utils';
import * as qidian from './api';

module.exports = class Reader implements Base {
  constructor() {
  }

  public hasChapter () {
    return true;
  }

  // bookId
  public getChapter (path: string) {
    return new Promise((resolve) => {
      qidian.getChapter(path.replace('.qidian', '')).then(data => {
        resolve(data.map((e: any) => {
          return {
            label: e.label,
            children: undefined,
            fileInfo: {
              path: [path, e.bookUrl],
            }
          };
        }));
      });
    });
  }

  // bookUrl
  public getContent (extensionPath: string, path: Array<string>) {
    return new Promise((resolve, reject) => {
      qidian.read(path[1]).then(text => {
        resolve(template(
          extensionPath,
          'static/template/default/index.html',
          {
            contentType: 'html',
            content: text
          },
        ));
      });
    });
  }
};
