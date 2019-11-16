
import {
  ExtensionContext,
  window,
  commands,
  workspace,
  ProgressLocation
} from 'vscode';
import { open } from '../../utils';
import { default as Notification } from '../../utils/notification';
import { DataProvider } from './dataProvider';
import { FileInfo, DataItem } from './dataItem';
import { WebView } from './webView';
import { default as Reader } from '../../reader';
import * as Fs from 'fs';
import * as Path from 'path';
import * as statusBar from '../statusBar';
import * as qidian from '../../reader/driver/qidian/api';
import * as config from '../../utils/config';

let mContext: ExtensionContext;
let mDataProvider: DataProvider;

module.exports = function (c: ExtensionContext) {
  mContext = c;
  mDataProvider = new DataProvider();
  window.createTreeView('local', {
    treeDataProvider: mDataProvider,
    showCollapseAll: true
  });
  // 注册元素被点击事件
  mContext.subscriptions.push(commands.registerCommand('z-reader.local.itemClick', itemClick));
  // 注册刷新事件
  mContext.subscriptions.push(commands.registerCommand('z-reader.local.refresh', localRefresh));
  // 注册打开文件事件
  mContext.subscriptions.push(commands.registerCommand('z-reader.local.directory', openLocalDirectory));
  // 注册搜索事件
  mContext.subscriptions.push(commands.registerCommand('z-reader.local.search', () => {
    qidianSearch().then((data: any) => {
      if (data.length === 0) {
        window.showInformationMessage('没有找到小说!');
        return;
      }
      mDataProvider.setData(data);
      mDataProvider.refresh();
    });
  }));
  if (!Fs.existsSync(Path.join(mContext.extensionPath, 'book'))) {
    Fs.mkdirSync(Path.join(mContext.extensionPath, 'book'));
  }
};

const itemClick = async function (file: FileInfo, arg: any) {
  const path = file.path;
  // 解析文件
  const reader = Reader(typeof path === 'string' ? path : path[0]);
  const notification = new Notification({
    location: ProgressLocation.Notification,
    title: '加载中...'
  });

  notification.start();
  const webView = new WebView(mContext.subscriptions, await reader.getContent(mContext.extensionPath, path));
  notification.stop();
  webView.on('progress:update', function (data: any) {
    progressUpdate(path, data);
  });
  // 进度跳转
  webView.on('goProgress', function () {
    window.showInputBox(
      {
        password: false,
        ignoreFocusOut: false,
        placeHolder: '请输入进度: 0-100',
        validateInput: (text: string) => /^\d+(\.\d+)?$/.test(text) ? undefined : '请输入数字'
      }).then((msg: any) => {
        webView.postMessage('goProgress', {
          progress: Number(msg) * 0.01
        });
      });
  });
  // 编辑样式
  webView.on('editStyle', function () {
    const notification = new Notification({
      location: ProgressLocation.Notification,
      title: '加载中...'
    });

    notification.start();
    openTextDocument(mContext.extensionPath + '\\src\\view\\template\\default\\style.css');
    notification.stop();
  });
  // 编辑HTML
  webView.on('editHtml', function () {
    const notification = new Notification({
      location: ProgressLocation.Notification,
      title: '加载中...'
    });
    notification.start();
    openTextDocument(mContext.extensionPath + '\\src\\view\\template\\default\\index.html');
    notification.stop();
  });
};

// 刷新侧边栏数据
const localRefresh = function () {
  const notification = new Notification({
    location: ProgressLocation.Notification,
    title: '加载中...'
  });
  notification.start();
  getBooks(Path.join(mContext.extensionPath, 'book'))
    .then(data => {
      if (data.length === 0) {
        window.showInformationMessage('没有找到本地小说,建议您阅读在线小说,或者把下载好的小说放到本地小说目录!');
        return;
      }
      mDataProvider.setData(data);
      mDataProvider.refresh();
    })
    .catch((err: Error) => {
      window.showErrorMessage(err.message);
    })
    .finally(() => {
      notification.stop();
    });
};

// 打开文件目录
const openLocalDirectory = function () {
  open(Path.join(mContext.extensionPath, 'book'));
};

// ======================================================================
// 进度保存
const progressUpdate = function (path: Array<string>, data: any) {
  statusBar.setText((data.progress * 100).toFixed(2) + '%');
  config.set(path[0], 'progress', data.progress);
};
// 打开文档
const openTextDocument = function (path: string) {
  workspace.openTextDocument(path).then(res => {
    window.showTextDocument(res, {
      preview: false
    });
  });
};
const getBooks = (path: string): Promise<DataItem[]> => {
  return new Promise(function (resolve, reject) {
    Fs.readdir(path, (err: any, files: string[]) => {
      if (err || !files) {
        reject(err);
      }
      resolve(files.filter((file: string) => {
        return ['.txt', '.epub'].includes(Path.extname(file));
      }).map((file: string) => {
        return new DataItem({
          label: file,
          children: ['.epub'].includes(Path.extname(file)) ? [] : undefined,
          fileInfo: {
            path: [path + '\\' + file]
          }
        });
      }));
    });
  });
};

// 搜索小说
const qidianSearch = function () {
  return new Promise(function (resolve) {
    window.showInputBox(
      {
        password: false,
        ignoreFocusOut: false,
        placeHolder: '请输入小说的名字',
        prompt: ''
      }).then(async (msg: any) => {
        const notification = new Notification({
          location: ProgressLocation.Notification,
          title: `搜索: ${msg}`
        });
        notification.start();
        qidian.search(msg).then(res => {
          notification.stop();
          resolve(res.map((e: any) => {
            return new DataItem({
              label: e.title + ' - ' + e.author,
              children: [],
              fileInfo: {
                path: [e.bookId + '.qidian']
              }
            });
          }));
        });
      });
  });
};