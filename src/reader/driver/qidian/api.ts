import * as got from 'got';
import * as cheerio from 'cheerio';

const DOMAIN = 'https://m.qidian.com';

export function search (name: string): Promise<any[]> {
  return new Promise(function (resolve, reject) {
    got(DOMAIN + '/search?kw=' + encodeURI(name))
      .then((res: any) => {
        const data: any[] = [];
        const $ = cheerio.load(res.body);
        $('.book-li').each(function (i: Number, elem: any) {
          const title = $(elem).find('.book-title').text();
          const author = ($(elem).find('.book-author').children()[0].next.data || '').replace(/[\s]/g, '');
          const bookId = $(elem).find('.book-layout').attr().href.replace(/\/book\//g, '');
          data.push({
            title,
            author,
            bookId
          });
        });
        resolve(data);
      })
      .catch((reason: any) => {
        reject(reason);
      });
  });
}

export function getChapter (bookId: string): Promise<any> {
  return new Promise(function (resolve, reject) {
    got(DOMAIN + '/book/' + bookId + '/catalog')
      .then((res: any) => {
        const newData: any[] = [];
        const regEx = new RegExp('g_data.volumes \= (.*?);').exec(res.body);
        if (regEx) {
          const data: any | null = eval(regEx[1]);
          data.forEach((e: any) => {
            e.cs.forEach((cs: any) => {
              newData.push({
                label: cs.cN,
                bookUrl: DOMAIN + `/book/${bookId}/${cs.id}`
              });
            });
          });
        }
        resolve(newData);
      })
      .catch((reason: any) => {
        reject(reason);
      });
  });
}

export function read (bookUrl: string): Promise<string | null> {
  return new Promise(function (resolve, reject) {
    got(bookUrl)
      .then((res: any) => {
        const $ = cheerio.load(res.body);
        const txt = $('#chapterContent .read-section p').map(function (i, el) {
          return $(el).text();
        }).get().join('\r\n\r\n');
        resolve(txt);
      })
      .catch((reason: any) => {
        reject(reason);
      });
  });
}
