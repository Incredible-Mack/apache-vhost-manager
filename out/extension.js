"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const path = require("path");
const vhostManager_1 = require("./vhostManager");
function activate(context) {
    // Command from Command Palette
    const commandPalette = vscode.commands.registerCommand("apache-vhost.createVHost", () => __awaiter(this, void 0, void 0, function* () {
        const projectName = yield vscode.window.showInputBox({
            prompt: `Enter the project name (folder must exist in ${vhostManager_1.VHostManager.PROJECTS_ROOT})`,
            placeHolder: "myproject",
        });
        if (!projectName) {
            vscode.window.showErrorMessage("Project name is required.");
            return;
        }
        try {
            yield vhostManager_1.VHostManager.createVHost(projectName);
        }
        catch (error) {
            vscode.window.showErrorMessage(error.message);
        }
    }));
    // Context Menu for Folders in Explorer
    const explorerContextMenu = vscode.commands.registerCommand("apache-vhost.createVHostFromExplorer", (uri) => __awaiter(this, void 0, void 0, function* () {
        const fullPath = uri.fsPath;
        if (!vhostManager_1.VHostManager.isInWwwDirectory(fullPath)) {
            vscode.window.showErrorMessage(`Project must be located in ${vhostManager_1.VHostManager.PROJECTS_ROOT} directory.\n` +
                `Detected path: ${fullPath}`);
            return;
        }
        const relativePath = path.relative(vhostManager_1.VHostManager.PROJECTS_ROOT, fullPath);
        const projectName = relativePath.split(path.sep)[0];
        try {
            yield vhostManager_1.VHostManager.createVHost(projectName);
        }
        catch (error) {
            vscode.window.showErrorMessage(error.message);
        }
    }));
    // Status Bar Item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = "apache-vhost.createVHost";
    statusBarItem.text = "$(server) Create VHost";
    statusBarItem.tooltip = "Create Apache Virtual Host";
    statusBarItem.show();
    context.subscriptions.push(commandPalette, explorerContextMenu, statusBarItem);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map