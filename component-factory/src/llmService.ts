// MOCK inicial — evita carregar o modelo pesado no começo
export async function adaptCodeWithLLM(
  content: string,
  newName: string
): Promise<string> {
  // Aqui apenas devolvemos o texto ajustando variáveis básicas
  // Depois integraremos com WebLLM real
  return content.replace(/TODO_AUTO_REVIEW/g, `Adaptado para ${newName}`);
}

/* 
  Para ativar o WebLLM de verdade, substitua acima por algo como:

  import * as webllm from "@mlc-ai/web-llm";

  const engine = await webllm.CreateMLCEngine("gemma-2b-it", {
    model_url: "https://huggingface.co/mlc-ai/gemma-2b-it/resolve/main/",
  });

  const prompt = `Adapte o seguinte código Angular para usar o nome ${newName} ...`;
  const response = await engine.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0].message.content;
*/
