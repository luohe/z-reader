import {
  TreeItem,
  TreeItemCollapsibleState,
} from 'vscode';

export class DataItem extends TreeItem {
  public children: DataItem[] | undefined;
  public fileInfo: FileInfo;

  constructor(Item: DataItemConstructor) {
    super(Item.label, Item.children === undefined ? TreeItemCollapsibleState.None : TreeItemCollapsibleState.Collapsed);
    this.children = Item.children;
    this.fileInfo = Item.fileInfo;
    this.command = {
      title: this.label || '',
      command: 'z-reader.local.itemClick',
      tooltip: this.label,
      arguments: [
        this.fileInfo
      ]
    };
  }
}

interface DataItemConstructor {
  label: string;
  children: DataItem[] | undefined;
  fileInfo: FileInfo;
}

export interface FileInfo {
  sup?: DataItem;
  path: Array<string>;
}