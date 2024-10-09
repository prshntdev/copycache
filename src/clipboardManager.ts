import * as vscode from 'vscode';

interface Snippet {
    id: string;
    snippet: string;
    language: string;
    timestamp: number;
    pinned: boolean;
}

export class ClipboardManager {
    private snippets: Snippet[] = [];
    private readonly storageKey = 'copycache.snippets';

    constructor(private storage: vscode.Memento) {
        this.loadSnippets();
    }

    private loadSnippets() {
        this.snippets = this.storage.get<Snippet[]>(this.storageKey, []);
    }

    private saveSnippets() {
        this.storage.update(this.storageKey, this.snippets);
    }

    addSnippet(text: string, language: string) {
        const snippet: Snippet = {
            id: Date.now().toString(),
            snippet: text,
            language,
            timestamp: Date.now(),
            pinned: false
        };
        this.snippets.unshift(snippet);
        this.saveSnippets();
    }

    getSnippets(): Snippet[] {
        return this.snippets;
    }

    pinSnippet(id: string) {
        const snippet = this.snippets.find(s => s.id === id);
        if (snippet) {
            snippet.pinned = !snippet.pinned;
            this.snippets.sort((a, b) => {
                if (a.pinned === b.pinned) {
                    return b.timestamp - a.timestamp;
                }
                return a.pinned ? -1 : 1;
            });
            this.saveSnippets();
        }
    }

    editSnippet(id: string, newText: string) {
        const snippet = this.snippets.find(s => s.id === id);
        if (snippet) {
            snippet.snippet = newText;
            snippet.timestamp = Date.now();
            this.saveSnippets();
        }
    }

    searchSnippets(term: string): Snippet[] {
        return this.snippets.filter(s => 
            s.snippet.toLowerCase().includes(term.toLowerCase()) ||
            s.language.toLowerCase().includes(term.toLowerCase())
        );
    }

    deleteSnippet(id: string) {
        this.snippets = this.snippets.filter(s => s.id !== id);
        this.saveSnippets();
    }

    clearAll() {
        this.snippets = [];
        this.saveSnippets();
    }
}