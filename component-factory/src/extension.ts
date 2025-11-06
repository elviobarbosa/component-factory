import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "component-factory.createComponent",
    async (uri: vscode.Uri) => {
      if (!uri || !uri.fsPath) {
        vscode.window.showWarningMessage(
          "Selecione a pasta do componente modelo."
        );
        return;
      }

      // nome kebab-case do novo componente (ex: user-profile)
      const newKebab = await vscode.window.showInputBox({
        prompt: "Nome do novo componente (em kebab-case, ex: user-profile)",
        placeHolder: "user-profile",
      });
      if (!newKebab) return;

      const oldKebab = path.basename(uri.fsPath); // ex: voice-form
      const oldPascal = toPascalCase(oldKebab);
      const oldCamel = toCamelCase(oldKebab);

      const newPascal = toPascalCase(newKebab);
      const newCamel = toCamelCase(newKebab);

      const output = vscode.window.createOutputChannel("Component Factory");
      output.show(true);
      output.appendLine(`📁 Pasta modelo: ${uri.fsPath}`);
      output.appendLine(
        `🔍 Substituindo:\n  ${oldKebab} → ${newKebab}\n  ${oldPascal} → ${newPascal}\n  ${oldCamel} → ${newCamel}`
      );

      const srcFolder = uri.fsPath;
      const parentDir = path.dirname(srcFolder);
      const newFolder = path.join(parentDir, newKebab);

      if (!fs.existsSync(newFolder)) fs.mkdirSync(newFolder);

      copyAndReplaceRecursive(
        srcFolder,
        newFolder,
        { oldKebab, oldPascal, oldCamel },
        { newKebab, newPascal, newCamel },
        output
      );

      vscode.window.showInformationMessage(
        `✅ Componente '${newPascal}' criado com sucesso!`
      );
    }
  );

  context.subscriptions.push(disposable);
}

/**
 * Copia todos os arquivos e subpastas com substituição em nome e conteúdo.
 */
function copyAndReplaceRecursive(
  src: string,
  dest: string,
  oldNames: { oldKebab: string; oldPascal: string; oldCamel: string },
  newNames: { newKebab: string; newPascal: string; newCamel: string },
  output: vscode.OutputChannel
) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);

    // renomeia arquivos
    const destName = entry.name.replace(
      new RegExp(oldNames.oldKebab, "g"),
      newNames.newKebab
    );
    const destPath = path.join(dest, destName);

    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) fs.mkdirSync(destPath);
      copyAndReplaceRecursive(srcPath, destPath, oldNames, newNames, output);
    } else {
      let content = fs.readFileSync(srcPath, "utf8");

      // PascalCase, camelCase e kebab-case
      content = content
        .replace(new RegExp(oldNames.oldPascal, "g"), newNames.newPascal)
        .replace(new RegExp(oldNames.oldCamel, "g"), newNames.newCamel)
        .replace(new RegExp(oldNames.oldKebab, "g"), newNames.newKebab);

      // selector Angular
      content = content.replace(
        new RegExp(`app-${oldNames.oldKebab}`, "g"),
        `app-${newNames.newKebab}`
      );

      // imports relativos
      content = content.replace(
        new RegExp(`(['"]\\.\\/[^'"]*?)${oldNames.oldKebab}`, "gi"),
        `$1${newNames.newKebab}`
      );

      fs.writeFileSync(destPath, content, "utf8");
      output.appendLine(`✏️ ${path.relative(dest, destPath)}`);
    }
  }
}

/**
 * 'voice-form' → 'VoiceForm'
 */
function toPascalCase(kebab: string): string {
  return kebab
    .split(/[-_]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

/**
 * 'voice-form' → 'voiceForm'
 */
function toCamelCase(kebab: string): string {
  const pascal = toPascalCase(kebab);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}
