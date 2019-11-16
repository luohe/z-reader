import { ExtensionContext, window, StatusBarAlignment } from 'vscode';
import * as statusBarItem from './view/statusBar';

export function activate (context: ExtensionContext) {
	console.log('activate');
	require('./view/treeView')(context);
	// 状态栏
	statusBarItem.setStatusBarItem(window.createStatusBarItem(StatusBarAlignment.Right, 100));
	context.subscriptions.push(statusBarItem.statusBarItem);
	statusBarItem.setText(`z-reader`);
	statusBarItem.statusBarItem.show();
}
export function deactivate () {
	console.log('eactivate.');
}
