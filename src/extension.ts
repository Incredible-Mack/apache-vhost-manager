import * as vscode from "vscode";
import * as path from "path";
import { VHostManager } from "./vhostManager";

export function activate(context: vscode.ExtensionContext) {
  // Command from Command Palette
  const commandPalette = vscode.commands.registerCommand(
    "apache-vhost.createVHost",
    async () => {
      const projectName = await vscode.window.showInputBox({
        prompt: `Enter the project name (folder must exist in ${VHostManager.PROJECTS_ROOT})`,
        placeHolder: "myproject",
      });

      if (!projectName) {
        vscode.window.showErrorMessage("Project name is required.");
        return;
      }

      try {
        await VHostManager.createVHost(projectName);
      } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
      }
    }
  );

  // Context Menu for Folders in Explorer
  const explorerContextMenu = vscode.commands.registerCommand(
    "apache-vhost.createVHostFromExplorer",
    async (uri: vscode.Uri) => {
      const fullPath = uri.fsPath;

      if (!VHostManager.isInWwwDirectory(fullPath)) {
        vscode.window.showErrorMessage(
          `Project must be located in ${VHostManager.PROJECTS_ROOT} directory.\n` +
            `Detected path: ${fullPath}`
        );
        return;
      }

      const relativePath = path.relative(VHostManager.PROJECTS_ROOT, fullPath);
      const projectName = relativePath.split(path.sep)[0];

      try {
        await VHostManager.createVHost(projectName);
      } catch (error: any) {
        vscode.window.showErrorMessage(error.message);
      }
    }
  );

  // Status Bar Item
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = "apache-vhost.createVHost";
  statusBarItem.text = "$(server) Create VHost";
  statusBarItem.tooltip = "Create Apache Virtual Host";
  statusBarItem.show();

  context.subscriptions.push(
    commandPalette,
    explorerContextMenu,
    statusBarItem
  );
}

export function deactivate() {}
