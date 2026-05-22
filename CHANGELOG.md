# Changelog

All notable changes to the "superpowers-vscode-extension" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-05-22

### Added
- **Native Copilot Chat Participant (`@superpowers`)**: Integrate advanced AI capabilities natively within the VS Code Copilot Chat interface. Includes commands for `/brainstorm`, `/tdd`, and `/debug`.
- **Interactive Sidebar Dashboard**: A rich React-based webview (`Superpowers Dashboard`) hosted inside a new VS Code View Container. Features real-time state tracking and matches VS Code native themes via CSS variables.
- **Model Context Protocol (MCP) Server**: A standard `stdio` MCP server allowing external AI agents to securely interact with the workspace to list files, parse ASTs, and manage workflow states.
- **Action Buttons**: Embedded VS Code command execution directly inside Copilot Chat responses (e.g. for creating files and running tests).

### Changed
- Monorepo architecture initialized with `core`, `mcp-server`, and `vscode-extension` packages.

### Fixed
- Initial release. No prior bugs.
