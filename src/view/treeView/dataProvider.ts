

import {
  TreeDataProvider,
  TreeItem,
  EventEmitter,
} from 'vscode';
import { DataItem } from './dataItem';
import { default as Reader } from '../../reader';

export class DataProvider implements TreeDataProvider<DataItem> {
  private _onDidChangeTreeData: EventEmitter<DataItem | undefined> = new EventEmitter<DataItem | undefined>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  data: Array<DataItem> = [];
  constructor() {

  }

  refresh (): void {
    this._onDidChangeTreeData.fire();
  }
  setData (data: DataItem[]) {
    this.data = data;
  }
  getTreeItem (element: DataItem): TreeItem | Thenable<TreeItem> {
    return element;
  }

  async getChildren (element?: DataItem | undefined): Promise<any> {
    if (element === undefined) {
      return this.data;
    }
    const reader = Reader(element.fileInfo.path[0]);
    if (reader.hasChapter()) {
      const children = await reader.getChapter(element.fileInfo.path[0]);
      if (children) {
        element.children = children.map((e: any) => new DataItem(e));
      }
    }
    return element.children;
  }
}

