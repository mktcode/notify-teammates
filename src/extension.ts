// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as ignore from 'ignore';
import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';

async function getGitUsername(): Promise<string | undefined> {
  return new Promise((resolve) => {
    cp.exec('git config user.name', (error, stdout) => {
      if (error) {
        resolve(undefined);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

function removeCommentSymbols(line: string): string {
  const commentSymbols = ['// ', ' * ', '# '];
  for (const symbol of commentSymbols) {
    if (line.startsWith(symbol)) {
      line = line.substr(symbol.length);
    }
  }
  return line;
}

async function watchFileChanges(context: vscode.ExtensionContext) {
  const gitignorePath = path.join(vscode.workspace.rootPath || '', '.gitignore');
  const gitignore = ignore.default();
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath).toString();
    gitignore.add(gitignoreContent);
  }

  const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*.*');
  context.subscriptions.push(fileSystemWatcher);

  fileSystemWatcher.onDidChange(async (uri) => {
    const relativePath = vscode.workspace.asRelativePath(uri.fsPath);

    if (gitignore.ignores(relativePath)) {
      return;
    }

    const activeDocument = vscode.window.activeTextEditor?.document;
    if (activeDocument && activeDocument.uri.fsPath === uri.fsPath) {
      return;
    }

    const username = await getGitUsername();
    if (!username) {
      return;
    }

    const fileContent = fs.readFileSync(uri.fsPath).toString();
    const regex = new RegExp(`@${username}:`, 'g');
    let match: RegExpExecArray | null;

    while ((match = regex.exec(fileContent)) !== null) {
      const position = new vscode.Position(fileContent.substr(0, match.index).split('\n').length - 1, match.index);
      const range = new vscode.Range(position, position.translate(0, username.length + 1));
      let mentionedLine = fileContent.split('\n')[position.line];
      mentionedLine = removeCommentSymbols(mentionedLine);
      vscode.window.showInformationMessage(`You were mentioned in ${relativePath}: ${mentionedLine}`, 'Go to mention').then((action) => {
        if (action === 'Go to mention') {
          vscode.workspace.openTextDocument(uri).then((doc) => {
            vscode.window.showTextDocument(doc).then((editor) => {
              editor.selection = new vscode.Selection(range.start, range.end);
              editor.revealRange(range);
            });
          });
        }
      });
    }
  });
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  watchFileChanges(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
