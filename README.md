# Reed Intel Markdown

Reed Intel Markdown is a Windows desktop Markdown editor designed for focused long-form writing, structured notes, and local file-based knowledge work. The application combines a clean Notepad-like writing surface with more advanced Markdown features normally found in dedicated Markdown and knowledge-base tools.

The product goal is simple: give Reed Intel a branded, local-first editor that stores everything as standard Markdown while offering a polished writing experience, folder navigation, formatting assistance, recovery, and packaging as a Windows application.

## Product Overview

Reed Intel Markdown is built for users who want to write and manage Markdown files without giving up familiar desktop application behavior. It supports both syntax-level editing and formatted Markdown editing, so users can choose between seeing raw Markdown symbols or working in a more readable formatted view.

The app is intended for:

- Writing and editing Markdown documents stored on the local computer.
- Managing notes and documents inside folders using an Obsidian-style file tree.
- Quickly applying Markdown formatting through toolbar buttons.
- Viewing and navigating document structure through an outline panel.
- Searching within a document or across an open folder.
- Protecting work through autosave, backup copies, and recovery support.
- Running as a branded Reed Intel Windows desktop application.

## Current Capabilities

- Windows desktop app built with Electron.
- Reed Intel branding with light-mode and dark-mode logo handling.
- Light and dark display modes.
- Formatted and Syntax editing modes.
- CodeMirror 6 support for Syntax mode.
- ProseMirror-based formatted editing.
- Markdown stored underneath as plain Markdown text.
- File menu actions for Open, Save, Save As, and Close.
- Safe app close behavior with save, discard, or cancel choices for unsaved changes.
- Collapsible left folder panel.
- Obsidian-style folder/file navigation.
- Multiple open folder support with folder switching.
- Files, Outline, and Search sidebar panels.
- Heading-based outline with indentation by heading level.
- Global search across the active open folder.
- Find and replace within the current file.
- Markdown formatting toolbar for headings, bold, italic, quote, lists, checklist, code, tables, horizontal rules, links, and images.
- Responsive toolbar behavior for narrower windows.
- Collapsible top toolbar while preserving the file name and save status.
- Autosave toggle and autosave interval control.
- Backup folder selection.
- Unsaved recovery support after restart.
- Dirty-file indicators and saved/unsaved state display.
- Word count, character count, and reading-time estimates.
- Focus mode, Typewriter mode, and fullscreen/distraction-free mode.
- Spellcheck controls and spelling suggestion replacement.
- Add-to-dictionary support.
- Mermaid diagram rendering support.
- Line number toggle for Syntax mode.
- In-app Markdown Help reference.
- About dialog with Reed Intel logo, version number, build date, and release history.
- Windows installer packaging with Start Menu and Desktop shortcuts.

## Version History

### Version 1.2

- Added a collapsible top toolbar so formatting buttons, view controls, font choices, autosave controls, and display controls can be hidden while the file name and save status remain visible.
- Moved the toolbar collapse button to the left of the file name.
- Added a visual separator line below the File, Edit, and View menu area.
- Extended the separator across the full app width, including above the Reed Intel logo and sidebar.
- Improved responsive behavior for the top toolbar so controls wrap instead of moving offscreen when the window is narrowed.
- Improved the Find and Replace row so its fields and buttons wrap more gracefully in narrower windows.
- Changed the folder selection area so clicking No folder open opens the folder picker immediately.
- Updated the About dialog to list version 1.2 changes and fixes.
- Created the version 1.2 Windows installer.

### Version 1.1

- Added an About option under the View menu.
- Added Reed Intel logo, build version, build date, and a running change log to the About dialog.
- Added File > Close for closing the full app.
- Added unsaved-change handling when closing the app.
- Added a collapsible left folder panel.
- Added a focus-mode exit button in the upper-right corner.
- Added display of the current folder name below the New, Open, and Folder buttons.
- Added support for multiple open folders and folder switching.
- Fixed the table button so it inserts a proper multiline Markdown table block.
- Created the version 1.1 Windows installer.

### Version 1.0

- Created the initial Reed Intel Markdown desktop application.
- Added Reed Intel branding and logo handling for light and dark modes.
- Added light and dark themes.
- Added Markdown file opening, editing, saving, and Save As workflows.
- Added left-side file navigation.
- Added Markdown syntax and formatted editing modes.
- Added CodeMirror 6 for Syntax mode.
- Added ProseMirror-based formatted editing.
- Added Markdown toolbar actions.
- Added in-app Markdown Help.
- Added autosave, backup copies, recovery behavior, and dirty-file indicators.
- Added outline/table-of-contents panel.
- Added folder search and current-file find/replace.
- Added word count, character count, and reading-time estimates.
- Added focus mode, typewriter mode, fullscreen mode, spellcheck controls, Mermaid support, and line-number controls.
- Fixed dark-mode Syntax cursor visibility.
- Added Windows app icon and installer packaging.

## Development

Install dependencies:

```powershell
npm.cmd install
```

Run the app in development mode:

```powershell
npm.cmd start
```

Build the renderer bundle:

```powershell
npm.cmd run build
```

Create the Windows installer:

```powershell
npm.cmd run dist
```

## Repository Notes

The source repository intentionally excludes generated dependency and release-output folders such as `node_modules`, `release`, and `.git`. These can be recreated from the tracked source files with `npm.cmd install` and the build commands above.
