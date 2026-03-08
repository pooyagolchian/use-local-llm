/**
 * Live integration test against a running Ollama instance.
 * Run with: npx tsx scripts/test-live.ts
 */
import { streamChat, streamGenerate } from "../src/utils/streamParser";

const ENDPOINT = "http://localhost:11434";
const MODEL = "gemma3:1b";

async function testStreamGenerate() {
  console.log("=== Testing streamGenerate ===");
  console.log(`Model: ${MODEL}`);
  console.log(`Prompt: "What is TypeScript in one sentence?"\n`);

  let fullText = "";
  let tokenCount = 0;

  const stream = streamGenerate({
    endpoint: ENDPOINT,
    backend: "ollama",
    model: MODEL,
    prompt: "What is TypeScript in one sentence?",
    temperature: 0.3,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.content);
    fullText += chunk.content;
    tokenCount++;
    if (chunk.done) break;
  }

  console.log(`\n\n✅ streamGenerate: ${tokenCount} tokens, ${fullText.length} chars`);
}

async function testStreamChat() {
  console.log("\n=== Testing streamChat ===");
  console.log(`Messages: [system: "Be brief", user: "What are React hooks?"]\n`);

  let fullText = "";
  let tokenCount = 0;

  const stream = streamChat({
    endpoint: ENDPOINT,
    backend: "ollama",
    model: MODEL,
    messages: [
      { role: "system", content: "Answer in one sentence. Be brief." },
      { role: "user", content: "What are React hooks?" },
    ],
    temperature: 0.3,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.content);
    fullText += chunk.content;
    tokenCount++;
    if (chunk.done) break;
  }

  console.log(`\n\n✅ streamChat: ${tokenCount} tokens, ${fullText.length} chars`);
}

async function testModelList() {
  console.log("\n=== Testing model list endpoint ===");
  const res = await fetch(`${ENDPOINT}/api/tags`);
  const data = await res.json();
  console.log(`Found ${data.models.length} models:`);
  data.models.slice(0, 5).forEach((m: { name: string; size: number }) => {
    console.log(`  - ${m.name} (${(m.size / 1e9).toFixed(1)} GB)`);
  });
  if (data.models.length > 5) console.log(`  ... and ${data.models.length - 5} more`);
  console.log("✅ Model list works");
}

async function testAbort() {
  console.log("\n=== Testing abort ===");
  const controller = new AbortController();
  let tokenCount = 0;

  try {
    const stream = streamGenerate({
      endpoint: ENDPOINT,
      backend: "ollama",
      model: MODEL,
      prompt: "Write a long essay about the history of computing",
      signal: controller.signal,
    });

    for await (const chunk of stream) {
      tokenCount++;
      if (tokenCount >= 5) {
        controller.abort();
        break;
      }
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      console.log(`✅ Abort worked after ${tokenCount} tokens (AbortError caught)`);
      return;
    }
    throw err;
  }
  console.log(`✅ Abort worked after ${tokenCount} tokens (stream stopped cleanly)`);
}

async function main() {
  console.log("🔌 use-local-llm — Live Integration Test");
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log("─".repeat(50));

  try {
    await testModelList();
    await testStreamGenerate();
    await testStreamChat();
    await testAbort();

    console.log("\n" + "─".repeat(50));
    console.log("🎉 All live tests passed!");
  } catch (err) {
    console.error("\n❌ Test failed:", err);
    process.exit(1);
  }
}

main();
