import { Base } from '../../interface';
import * as epub from 'epub';
import { open, template } from '../../../utils';

module.exports = class Reader implements Base {
  constructor() {
  }

  public hasChapter () {
    return true;
  }

  public getChapter (path: string) {
    return new Promise((resolve) => {
      var book = new epub(path);
      book.on('end', function () {
        resolve(book.flow.map(function (e) {
          return {
            label: e.title || e.id,
            children: undefined,
            fileInfo: {
              path: [path, e.id],
            }
          };
        }));
      });
      book.parse();
    });
  }

  public getContent (extensionPath: string, path: Array<string>) {
    return new Promise((resolve, reject) => {
      var book = new epub(path[0]);
      book.on('end', () => {
        book.getChapter(path[1], (error, text) => {
          if (error) {
            reject(error);
          }
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
      book.parse();
    });
  }
};