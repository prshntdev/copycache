import * as vscode from 'vscode';
import { ClipboardManager } from './clipboardManager';
import { CopyCacheTreeDataProvider } from './copyCacheTreeDataProvider';

let clipboardManager: ClipboardManager;

export function activate(context: vscode.ExtensionContext) {
	console.log('CopyCache extension is now active!');

	clipboardManager = new ClipboardManager(context.globalState);

	const treeDataProvider = new CopyCacheTreeDataProvider(clipboardManager);
	const treeView = vscode.window.createTreeView('copycacheView', { 
		treeDataProvider: treeDataProvider,
		showCollapseAll: false
	});

	context.subscriptions.push(treeView);

	// Override default copy command
	const disposable = vscode.commands.registerTextEditorCommand('editor.action.clipboardCopyAction', async (textEditor, edit) => {
		const document = textEditor.document;
		const selection = textEditor.selection;

		const text = document.getText(selection);
		await vscode.env.clipboard.writeText(text);
		clipboardManager.addSnippet(text, document.languageId);
		treeDataProvider.refresh();
	});

	context.subscriptions.push(disposable);

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand('copycache.copySnippet', async (item) => {
			await vscode.env.clipboard.writeText(item.snippet.snippet);
			vscode.window.showInformationMessage('Snippet copied to clipboard');
		}),

		vscode.commands.registerCommand('copycache.pinSnippet', (item) => {
			clipboardManager.pinSnippet(item.snippet.id);
			treeDataProvider.refresh();
		}),

		vscode.commands.registerCommand('copycache.editSnippet', async (item) => {
			const newText = await vscode.window.showInputBox({ value: item.snippet.snippet });
			if (newText !== undefined) {
				clipboardManager.editSnippet(item.snippet.id, newText);
				treeDataProvider.refresh();
			}
		}),

		vscode.commands.registerCommand('copycache.deleteSnippet', (item) => {
			clipboardManager.deleteSnippet(item.snippet.id);
			treeDataProvider.refresh();
		}),

		vscode.commands.registerCommand('copycache.clearAll', () => {
			clipboardManager.clearAll();
			treeDataProvider.refresh();
		})
	);

	// Create status bar item
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.text = "$(clippy) CopyCache";
	statusBarItem.command = 'copycache.searchSnippets';
	statusBarItem.show();
	context.subscriptions.push(statusBarItem);
}

export function deactivate() {}
