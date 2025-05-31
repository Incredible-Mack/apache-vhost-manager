import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import * as vscode from "vscode";

export class VHostManager {
  private static readonly APACHE_CONF_PATH =
    "C:\\Apache24\\conf\\extra\\httpd-vhosts.conf";
  private static readonly HOSTS_FILE_PATH =
    "C:\\Windows\\System32\\drivers\\etc\\hosts";
  public static readonly PROJECTS_ROOT = "C:\\www";

  // Normalize path for consistent comparison
  private static normalizePath(inputPath: string): string {
    return path.normalize(inputPath).replace(/\\/g, "/").toLowerCase();
  }

  public static isInWwwDirectory(fullPath: string): boolean {
    const normalizedPath = this.normalizePath(fullPath);
    const normalizedWwwRoot = this.normalizePath(this.PROJECTS_ROOT + path.sep);
    return normalizedPath.startsWith(normalizedWwwRoot);
  }

  public static async createVHost(projectName: string): Promise<void> {
    const projectPath = path.join(this.PROJECTS_ROOT, projectName);
    const artisanPath = path.join(projectPath, "artisan");
    const isLaravel = fs.existsSync(artisanPath);
    const documentRoot = isLaravel
      ? path.join(projectPath, "public")
      : projectPath;

    if (!fs.existsSync(documentRoot)) {
      throw new Error(`Path '${documentRoot}' does not exist.`);
    }

    const vhostConfig = this.generateVHostConfig(
      projectName,
      documentRoot,
      projectPath
    );
    await this.updateApacheConfig(vhostConfig, projectName); // Pass projectName here
    await this.updateHostsFile(projectName);
    await this.restartApache();

    this.showSuccess(projectName, isLaravel);
  }

  private static generateVHostConfig(
    projectName: string,
    documentRoot: string,
    projectPath: string
  ): string {
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

  private static async updateApacheConfig(
    vhostConfig: string,
    projectName: string
  ): Promise<void> {
    try {
      // Read existing config
      let configContent = fs.readFileSync(this.APACHE_CONF_PATH, "utf8");

      // Check for existing vhost with same ServerName
      const serverNamePattern = new RegExp(
        `ServerName\\s+${projectName}\\.test`,
        "i"
      );
      if (serverNamePattern.test(configContent)) {
        throw new Error(`Virtual host for ${projectName}.test already exists`);
      }

      // Make backup
      fs.copyFileSync(this.APACHE_CONF_PATH, `${this.APACHE_CONF_PATH}.bak`);

      // Append new config
      fs.appendFileSync(this.APACHE_CONF_PATH, `\n${vhostConfig}`);
    } catch (err) {
      throw new Error(`Error modifying Apache config: ${err}`);
    }
  }

  private static async updateHostsFile(projectName: string): Promise<void> {
    const hostsEntry = `127.0.0.1    ${projectName}.test`;
    try {
      let hostsContent = fs.readFileSync(this.HOSTS_FILE_PATH, "utf8");

      // Remove existing entries if any
      hostsContent = hostsContent.replace(
        new RegExp(`^.*${projectName}\\.test.*$`, "gm"),
        ""
      );

      // Add new entry
      fs.writeFileSync(
        this.HOSTS_FILE_PATH,
        `${hostsContent.trim()}\n${hostsEntry}`
      );
    } catch (err) {
      throw new Error(`Failed to modify hosts file: ${err}`);
    }
  }

  private static async restartApache(): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(
        'powershell -Command "Restart-Service -Name Apache2.4 -Force"',
        (error) => {
          if (error) {
            vscode.window.showWarningMessage(
              "Apache service not running. Trying to start..."
            );
            exec(
              'powershell -Command "Start-Service -Name Apache2.4"',
              (err) => {
                if (err) {
                  reject(
                    new Error("Failed to start Apache2.4. Is it installed?")
                  );
                } else {
                  resolve();
                }
              }
            );
          } else {
            resolve();
          }
        }
      );
    });
  }

  private static showSuccess(projectName: string, isLaravel: boolean): void {
    vscode.window.showInformationMessage(
      `✅ ${projectName}.test configured successfully.`
    );
    vscode.window.showInformationMessage(`Laravel Detected: ${isLaravel}`);
    vscode.env.openExternal(vscode.Uri.parse(`http://${projectName}.test`));
  }
}
