#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const COMMANDS_DIR = "commands/gh";

function getClaudeHome() {
  const home = process.env.HOME || process.env.USERPROFILE;
  return path.join(home, ".claude");
}

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`  Copied: ${entry.name}`);
    }
  }
}

function install() {
  const args = process.argv.slice(2);
  const isLocal = args.includes("--local");
  const isForce = args.includes("--force");

  let targetBase;
  if (isLocal) {
    targetBase = path.join(process.cwd(), ".claude");
  } else {
    targetBase = getClaudeHome();
  }

  const packageRoot = path.resolve(__dirname, "..");
  const commandsSrc = path.join(packageRoot, COMMANDS_DIR);
  const commandsDest = path.join(targetBase, COMMANDS_DIR);
  const versionFile = path.join(commandsDest, ".version");

  if (!fs.existsSync(commandsSrc)) {
    console.error("Error: commands directory not found at", commandsSrc);
    process.exit(1);
  }

  const pkg = require(path.join(packageRoot, "package.json"));
  const currentVersion = pkg.version;

  // Check installed version
  if (!isForce && fs.existsSync(versionFile)) {
    try {
      const installedVersion = fs.readFileSync(versionFile, "utf-8").trim();
      if (installedVersion === currentVersion) {
        console.log(`\n  claude-github-skills v${currentVersion} is already up to date.\n`);
        console.log("  Use --force to reinstall.\n");
        return;
      }
      console.log(`\n  claude-github-skills installer\n`);
      console.log(`  Updating from v${installedVersion} to v${currentVersion}\n`);
    } catch {
      console.log("\n  claude-github-skills installer\n");
      console.log(`  Installing v${currentVersion} to: ${targetBase}\n`);
    }
  } else {
    console.log("\n  claude-github-skills installer\n");
    console.log(`  Installing v${currentVersion} to: ${targetBase}\n`);
  }

  console.log("  Installing commands...");
  copyDirRecursive(commandsSrc, commandsDest);

  // Write version file
  fs.writeFileSync(versionFile, currentVersion, "utf-8");

  console.log("\n  Installation complete!");
  console.log("\n  Available commands:");
  console.log("    /gh:setup       - Set up project (run this first)");
  console.log("    /gh:work <#>    - Work on a GitHub issue");
  console.log("    /gh:review-pr <#> - Review a pull request");
  console.log("    /gh:fix-pr <#>  - Fix PR review feedback");
  console.log("    /gh:create-ticket <prompt> - Create a structured issue");
  console.log("\n  Prerequisites:");
  console.log("    - GitHub CLI (gh) installed and authenticated");
  console.log("    - Run /gh:setup in your project first\n");
}

install();
