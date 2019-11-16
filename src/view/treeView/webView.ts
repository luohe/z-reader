
import {
  ViewColumn,
  window,
  WebviewPanel,
  Disposable
} from 'vscode';

export class WebView {

  private panel: WebviewPanel;
  private callback: any = {};

  constructor(listeners: Disposable[], html: string) {
    this.panel = window.createWebviewPanel('reader', 'reader', ViewColumn.Active, {
      enableScripts: true,
      retainContextWhenHidden: true
    });
    this.panel.webview.onDidReceiveMessage(message => this.onDidReceiveMessage(message), undefined, listeners);
    this.panel.webview.html = html;
  }

  public onDidReceiveMessage (message: IWebViewMessage) {
    this.emit(message.command, message.data);
  }
  public postMessage (command: string, data: any) {
    this.panel.webview.postMessage({
      command: command,
      data: data
    });
  }
  public on (name: string, fn: Function) {
    if (!this.callback[name]) {
      this.callback[name] = [];
    }
    this.callback[name].push(fn);
  }
  public emit (name: string, val: any) {
    console.log(name);
    if (this.callback[name]) {
      this.callback[name].map((fn: Function) => {
        fn(val);
      });
    }
  }

  public dispose (): void {
    if (this.panel) {
      this.panel.dispose();
    }
  }
}

interface IWebViewMessage {
  command: string;
  data: any;
}