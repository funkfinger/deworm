#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Get staged files
const getStagedFiles = () => {
  try {
    const output = execSync("git diff --staged --name-only").toString().trim();
    return output.split("\n").filter((file) => file);
  } catch (error) {
    console.error("Error getting staged files:", error);
    return [];
  }
};

// Format and check TypeScript files
const formatAndCheck = (files) => {
  const tsFiles = files.filter(
    (file) => file.endsWith(".ts") || file.endsWith(".tsx")
  );

  if (tsFiles.length === 0) {
    console.log("No TypeScript files to check");
    return true;
  }

  try {
    // Format files
    console.log("Formatting files:", tsFiles.join(", "));
    execSync(`npx biome format --write ${tsFiles.join(" ")}`, {
      stdio: "inherit",
    });

    // Check files
    console.log("Checking files:", tsFiles.join(", "));
    execSync(`npx biome check ${tsFiles.join(" ")}`, { stdio: "inherit" });

    // Add formatted files back to staging
    execSync(`git add ${tsFiles.join(" ")}`, { stdio: "inherit" });

    return true;
  } catch (error) {
    console.error("Error during formatting or checking:", error);
    return false;
  }
};

const main = () => {
  // Create scripts directory if it doesn't exist
  const scriptsDir = path.dirname(__filename);
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
  }

  const stagedFiles = getStagedFiles();
  const success = formatAndCheck(stagedFiles);

  process.exit(success ? 0 : 1);
};

main();
