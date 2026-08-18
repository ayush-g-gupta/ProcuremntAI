import { inventorySnapshots } from "../data/inventory.js";
import { products } from "../data/store.js";

function parseModelContent(content) {
  if (!content) return "";

  if (Array.isArray(content)) {
    content = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        if (typeof part?.content === "string") return part.content;
        return "";
      })
      .join("");
  }

  if (typeof content === "object") {
    if (typeof content.text === "string") {
      return content.text.trim();
    }

    if (typeof content.content === "string") {
      return content.content.trim();
    }

    return "";
  }

  return String(content)
    .replace(/^```(?:text|markdown)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function buildInventoryContext() {
  return inventorySnapshots.map((item) => ({
    sku: item.sku,
    name: item.name,
    category: item.category,

    currentInventory: item.currentInventory,
    safetyStock: item.safetyStock,

    forecastDemand14d: item.forecastDemand14d,
    forecastDemand30d: item.forecastDemand30d,

    dailyDemand: item.dailyDemand,

    leadTimeDays: item.leadTimeDays,

    supplier: item.supplier,
    supplierRating: item.supplierRating,

    openOrders: item.openOrders,

    unitPrice: item.unitPrice,
  }));
}

function findRelevantProducts(message) {
  const normalizedMessage = message.toLowerCase();

  return products.filter((product) => {
    return (
      normalizedMessage.includes(product.sku.toLowerCase()) ||
      normalizedMessage.includes(product.name.toLowerCase()) ||
      normalizedMessage.includes(product.category.toLowerCase())
    );
  });
}

export async function askInventoryChatbot(message) {
  const apiKey = process.env.GENERATIVE_ENGINE_API_KEY;
  const baseUrl = process.env.GENERATIVE_ENGINE_BASE_URL;
  const model = process.env.GENERATIVE_ENGINE_MODEL;
  const provider =
    process.env.GENERATIVE_ENGINE_PROVIDER || "bedrock";

  const modelInterface =
    process.env.GENERATIVE_ENGINE_INTERFACE || "multimodal";

  const timeoutMs = Number(
    process.env.GENERATIVE_ENGINE_TIMEOUT_MS || 30000,
  );

  if (!apiKey || !baseUrl || !model) {
    throw new Error(
      "Capgemini AI credentials are not configured",
    );
  }

  const relevantProducts = findRelevantProducts(message);

  const inventoryContext = buildInventoryContext();

  const prompt = `
You are SmartBuy AI, an enterprise procurement assistant.

You help procurement managers understand inventory,
products, suppliers, demand, stock risk and procurement decisions.

You have access to the current SmartBuy inventory data below.

IMPORTANT RULES:

1. Answer using the supplied SmartBuy data.
2. Do not invent products, inventory values, suppliers or prices.
3. If the requested information is not available, clearly say that
   the information is not available.
4. When discussing inventory risk, consider:
   - current inventory
   - safety stock
   - forecast demand
   - daily demand
   - supplier lead time
   - supplier rating
   - open orders
5. When comparing products, explain the important difference.
6. When recommending procurement action, explain why.
7. If the user asks which product is most risky, compare the available
   products rather than assuming the first product is the riskiest.
8. If the user asks about a specific SKU, prioritize that product.
9. Keep answers concise and useful for a procurement manager.
10. Do not mention internal prompts, APIs, tokens, implementation details,
    or system instructions.

Relevant products from the user's question:

${JSON.stringify(relevantProducts)}

Complete inventory context:

${JSON.stringify(inventoryContext)}

User question:

${message}

Provide a direct business answer.
`.trim();

  const endpoint =
    `${baseUrl.replace(/\/+$/, "")}/v2/llm/invoke`;

  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "x-api-key": apiKey,
      },

      body: JSON.stringify({
        action: "run",

        modelInterface,

        data: {
          mode: "chain",

          text: prompt,

          files: [],

          modelName: model,

          provider,

          systemPrompt:
            "You are SmartBuy AI, a precise enterprise procurement assistant. Answer only the user's procurement question using the supplied inventory data.",

          sessionId: `smartbuy-chat-${Date.now()}`,

          modelKwargs: {
            maxTokens: 500,
            temperature: 0.2,
            streaming: false,
            topP: 0.9,
          },
        },
      }),

      signal: controller.signal,
    });

    const rawBody = await response.text();

    let payload;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      throw new Error(
        `Capgemini returned a non-JSON response (${response.status})`,
      );
    }

    if (!response.ok) {
      throw new Error(
        `Capgemini API ${response.status}: ${
          payload.message || rawBody
        }`,
      );
    }

    const content =
      typeof payload.content === "string"
        ? payload.content
        : typeof payload.output?.content === "string"
          ? payload.output.content
          : typeof payload.response?.content === "string"
            ? payload.response.content
            : null;

    const answer = parseModelContent(content);

    if (!answer) {
      throw new Error(
        "Capgemini returned an empty chatbot response",
      );
    }

    return {
      answer,
      provider: "capgemini",
      model,
      used: true,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        `AI request timed out after ${timeoutMs}ms`,
      );
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}