import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { adaptCodeWithLLM } from "./llmService";

/**
 * Clona e adapta o conteúdo dos arquivos de um componente modelo
 */
export async function cloneTemplateFiles(
  srcFolder: string,
  newName: string,
  output: vscode.OutputChannel
) {
  const parentDir = path.dirname(srcFolder);
  const newFolder = path.join(parentDir, newName.toLowerCase());

  if (!fs.existsSync(newFolder)) {
    fs.mkdirSync(newFolder);
  }

  const files = fs.readdirSync(srcFolder);
  for (const file of files) {
    const srcPath = path.join(srcFolder, file);
    const destPath = path.join(
      newFolder,
      file.replace(/button/gi, newName.toLowerCase())
    );

    const content = fs.readFileSync(srcPath, "utf-8");

    // Substituições básicas
    let newContent = content
      .replace(/Button/g, newName)
      .replace(/button/g, newName.toLowerCase());

    // Adaptação opcional via LLM
    output.appendLine(`🤖 Adaptando '${file}' com LLM...`);
    newContent = await adaptCodeWithLLM(newContent, newName);

    fs.writeFileSync(destPath, newContent, "utf-8");

    output.appendLine(`✅ Gerado: ${path.basename(destPath)}`);
  }
}
