import * as vscode from 'vscode';
import { ClipboardManager } from './clipboardManager';

export class CopyCacheTreeDataProvider implements vscode.TreeDataProvider<SnippetItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<SnippetItem | undefined | null | void> = new vscode.EventEmitter<SnippetItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<SnippetItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private clipboardManager: ClipboardManager) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: SnippetItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: SnippetItem): Thenable<SnippetItem[]> {
        if (element) {
            return Promise.resolve([]);
        } else {
            const snippets = this.clipboardManager.getSnippets();
            return Promise.resolve(snippets.map(s => new SnippetItem(s)));
        }
    }
}

class SnippetItem extends vscode.TreeItem {
    constructor(private snippet: any) {
        super('', vscode.TreeItemCollapsibleState.None);
        
        const firstLine = snippet.snippet.trim().split('\n')[0].trim();
        this.label = `${firstLine.substring(0, 30)}${firstLine.length > 30 ? '...' : ''}`;
        
        this.iconPath = new vscode.ThemeIcon(this.getLanguageIcon(snippet.language));
        
        this.tooltip = new vscode.MarkdownString(`**${snippet.language}**\n\n\`\`\`${snippet.language}\n${snippet.snippet}\n\`\`\``);
        
        this.description = this.getRelativeTimeString(snippet.timestamp);
        
        this.contextValue = 'snippet';
        this.id = snippet.id;

        this.command = { command: 'copycache.copySnippet', title: "Copy", arguments: [this] };
        this.resourceUri = vscode.Uri.parse(`copycache:${this.id}`);
    }

    private getRelativeTimeString(timestamp: number): string {
        const now = Date.now();
        const diff = now - timestamp;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    private getLanguageIcon(language: string): string {
        // Map common languages to their corresponding file icons
        const iconMap: { [key: string]: string } = {
            'javascript': 'javascript',
            'typescript': 'typescript',
            'python': 'python',
            'java': 'java',
            'c': 'c',
            'cpp': 'cpp',
            'csharp': 'csharp',
            'go': 'go',
            'ruby': 'ruby',
            'php': 'php',
            'html': 'html',
            'css': 'css',
            'json': 'json',
            'markdown': 'markdown',
        };

        return iconMap[language.toLowerCase()] || 'code'; // Default to 'code' icon if language not found
    }
}