# Apache VHost Manager ⚡

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/incredible-mack.apache-vhost-manager?color=blue&label=Marketplace)](https://marketplace.visualstudio.com/items?itemName=incredible-mack.apache-vhost-manager)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> One-click Apache virtual host configuration for local development

![Demo: Creating a VHost in 3 clicks](https://i.imgur.com/T7CRySu.gif)


## Features ✨
- 🚀 **Instant setup** - Create vhosts without touching config files
- 🔍 **Laravel detection** - Automatically points to `/public` for Laravel projects
- 📝 **Hosts file sync** - Updates `C:\Windows\System32\drivers\etc\hosts` automatically
- ♻️ **Apache service control** - Restarts Apache automatically

## Prerequisites
- [VS Code](https://code.visualstudio.com/) (v1.80+)
- Apache installed at `C:\Apache24` (default path)
- Projects located in `C:\www`

## Installation
1. Install via VS Code Marketplace  
   [![Install](https://img.shields.io/badge/-Install%20in%20VS%20Code-blue?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=incredible-mack.apache-vhost-manager)

2. Or clone this repository:
   ```bash
   git clone https://github.com/incredible-mack/apache-vhost-manager.git
   cd apache-vhost-manager
   npm install
   npm run package
   Then install the .vsix file via VS Code's extensions view

## Configuration 
1. Customize paths in VS Code settings (Ctrl+,):
   Search for Apache then update
   "apacheVhostManager.apachePath": "C:/Apache24",
   "apacheVhostManager.projectsRoot": "C:/www"

## Shortcut
   Platform	        Keybinding	    Condition
   Windows/Linux	ctrl+shift+a	When folder is selected
   Mac	            ctrl+shift+a	When folder is selected

   Users can change the shortcut via:
    Ctrl+K Ctrl+S (Keyboard Shortcuts)
    Search for "Create Apache VHost"
    Right-click → "Change Keybinding"

   The shortcut only works when: A folder is selected in Explorer and Not in other views like search or debug