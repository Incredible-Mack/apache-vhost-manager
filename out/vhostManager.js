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
exports.VHostManager = void 0;
const fs = require("fs");
const path = require("path");
const child_process_1 = require("child_process");
const vscode = require("vscode");
class VHostManager {
    // Normalize path for consistent comparison
    static normalizePath(inputPath) {
        return path.normalize(inputPath).replace(/\\/g, "/").toLowerCase();
    }
    static isInWwwDirectory(fullPath) {
        const normalizedPath = this.normalizePath(fullPath);
        const normalizedWwwRoot = this.normalizePath(this.PROJECTS_ROOT + path.sep);
        return normalizedPath.startsWith(normalizedWwwRoot);
    }
    static createVHost(projectName) {
        return __awaiter(this, void 0, void 0, function* () {
            const projectPath = path.join(this.PROJECTS_ROOT, projectName);
            const artisanPath = path.join(projectPath, "artisan");
            const isLaravel = fs.existsSync(artisanPath);
            const documentRoot = isLaravel
                ? path.join(projectPath, "public")
                : projectPath;
            if (!fs.existsSync(documentRoot)) {
                throw new Error(`Path '${documentRoot}' does not exist.`);
            }
            const vhostConfig = this.generateVHostConfig(projectName, documentRoot, projectPath);
            yield this.updateApacheConfig(vhostConfig, projectName); // Pass projectName here
            yield this.updateHostsFile(projectName);
            yield this.restartApache();
            this.showSuccess(projectName, isLaravel);
        });
    }
    static generateVHostConfig(projectName, documentRoot, projectPath) {
        return `
<VirtualHost *:80>
    ServerName ${projectName}.test
    DocumentRoot "${documentRoot}"
    <Directory "${projectPath}">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    ErrorLog "logs/${projectName}-error.log"
    CustomLog "logs/${projectName}-access.log" common
</VirtualHost>`;
    }
    static updateApacheConfig(vhostConfig, projectName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Read existing config
                let configContent = fs.readFileSync(this.APACHE_CONF_PATH, "utf8");
                // Check for existing vhost with same ServerName
                const serverNamePattern = new RegExp(`ServerName\\s+${projectName}\\.test`, "i");
                if (serverNamePattern.test(configContent)) {
                    throw new Error(`Virtual host for ${projectName}.test already exists`);
                }
                // Make backup
                fs.copyFileSync(this.APACHE_CONF_PATH, `${this.APACHE_CONF_PATH}.bak`);
                // Append new config
                fs.appendFileSync(this.APACHE_CONF_PATH, `\n${vhostConfig}`);
            }
            catch (err) {
                throw new Error(`Error modifying Apache config: ${err}`);
            }
        });
    }
    static updateHostsFile(projectName) {
        return __awaiter(this, void 0, void 0, function* () {
            const hostsEntry = `127.0.0.1    ${projectName}.test`;
            try {
                let hostsContent = fs.readFileSync(this.HOSTS_FILE_PATH, "utf8");
                // Remove existing entries if any
                hostsContent = hostsContent.replace(new RegExp(`^.*${projectName}\\.test.*$`, "gm"), "");
                // Add new entry
                fs.writeFileSync(this.HOSTS_FILE_PATH, `${hostsContent.trim()}\n${hostsEntry}`);
            }
            catch (err) {
                throw new Error(`Failed to modify hosts file: ${err}`);
            }
        });
    }
    static restartApache() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                (0, child_process_1.exec)('powershell -Command "Restart-Service -Name Apache2.4 -Force"', (error) => {
                    if (error) {
                        vscode.window.showWarningMessage("Apache service not running. Trying to start...");
                        (0, child_process_1.exec)('powershell -Command "Start-Service -Name Apache2.4"', (err) => {
                            if (err) {
                                reject(new Error("Failed to start Apache2.4. Is it installed?"));
                            }
                            else {
                                resolve();
                            }
                        });
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    static showSuccess(projectName, isLaravel) {
        vscode.window.showInformationMessage(`✅ ${projectName}.test configured successfully.`);
        vscode.window.showInformationMessage(`Laravel Detected: ${isLaravel}`);
        vscode.env.openExternal(vscode.Uri.parse(`http://${projectName}.test`));
    }
}
exports.VHostManager = VHostManager;
VHostManager.APACHE_CONF_PATH = "C:\\Apache24\\conf\\extra\\httpd-vhosts.conf";
VHostManager.HOSTS_FILE_PATH = "C:\\Windows\\System32\\drivers\\etc\\hosts";
VHostManager.PROJECTS_ROOT = "C:\\www";
//# sourceMappingURL=vhostManager.js.map