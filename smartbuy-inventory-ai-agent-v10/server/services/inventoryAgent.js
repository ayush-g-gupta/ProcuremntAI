import { getInventorySnapshot } from "../data/inventory.js";

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function evaluateInventoryRisk(snapshot) {
  const projected14d = snapshot.currentInventory - snapshot.forecastDemand14d;
  const projected30d = snapshot.currentInventory - snapshot.forecastDemand30d;
  const daysOfCover = snapshot.currentInventory / Math.max(snapshot.dailyDemand, 1);
  const reorderPoint = snapshot.safetyStock + snapshot.dailyDemand * snapshot.leadTimeDays;
  const signals = [];

  if (projected14d < snapshot.safetyStock) signals.push("14-day forecast crosses the safety-stock threshold");
  if (projected30d < 0) signals.push("30-day forecast indicates a potential stockout");
  if (daysOfCover <= snapshot.leadTimeDays + 5) signals.push("days of cover is close to supplier lead time");
  if (snapshot.supplierRating < 90) signals.push("supplier score is below the preferred 90/100 threshold");

  let riskLevel = "low";
  if (projected14d < snapshot.safetyStock || snapshot.currentInventory < reorderPoint) riskLevel = "medium";
  if (projected14d < 0 || projected30d < 0 || daysOfCover < snapshot.leadTimeDays) riskLevel = "high";

  const recommendedQuantity = Math.max(
    0,
    Math.ceil(snapshot.forecastDemand30d + snapshot.safetyStock - snapshot.currentInventory),
  );

  return {
    sku: snapshot.sku,
    riskLevel,
    projected14d,
    projected30d,
    daysOfCover: Number(daysOfCover.toFixed(1)),
    reorderPoint: Math.ceil(reorderPoint),
    recommendedQuantity,
    signals,
  };
}

function parseModelContent(content) {
  if (!content) return null;

  // Some OpenAI-compatible providers return a string, while others can return
  // an array of content parts. Normalize both forms before parsing JSON.
  if (Array.isArray(content)) {
    content = content
      .map((part) => {
        if (typeof part === "string") return part;
        if (typeof part?.text === "string") return part.text;
        if (typeof part?.content === "string") return part.content;
        if (typeof part?.content?.text === "string") return part.content.text;
        return "";
      })
      .join("");
  }

  if (content && typeof content === "object" && !Array.isArray(content)) {
    if (typeof content.text === "string") content = content.text;
    else if (typeof content.content === "string") content = content.content;
  }

  if (typeof content !== "string") {
    if (typeof content === "object") return content;
    return null;
  }

  const cleaned = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Be tolerant if the provider adds a sentence before/after the JSON.
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

async function askCapgemini(snapshot, assessment) {
  const apiKey = process.env.GENERATIVE_ENGINE_API_KEY;
  const baseUrl = process.env.GENERATIVE_ENGINE_BASE_URL;
  const model = process.env.GENERATIVE_ENGINE_MODEL;
  const provider = process.env.GENERATIVE_ENGINE_PROVIDER || "bedrock";
  const modelInterface = process.env.GENERATIVE_ENGINE_INTERFACE || "multimodal";
  const timeoutMs = Number(process.env.GENERATIVE_ENGINE_TIMEOUT_MS || 30000);

  if (!apiKey || !baseUrl || !model) {
    return {
      used: false,
      confidence: null,
      riskLevel: null,
      explanation: null,
      error: "Capgemini API credentials are not configured",
    };
  }

  const endpoint = `${baseUrl.replace(/\/+$/, "")}/v2/llm/invoke`;

  const prompt = `You are the Inventory Check AI Agent inside a B2B procurement platform.

Analyze the inventory facts and supporting rule-based signals below. The rule-based assessment is evidence, not the final AI decision.

Your job is to independently assess:
1. inventory risk: low, medium, or high
2. your confidence in that assessment from 0 to 100
3. a concise business explanation
4. 2 to 4 practical procurement actions

Return ONLY valid JSON. Do not use markdown or code fences.

Required JSON:
{
  "riskLevel": "low" | "medium" | "high",
  "confidence": 0,
  "summary": "string",
  "actions": ["string"],
  "assumptions": ["string"]
}

Confidence rules:
- confidence must be an integer from 0 to 100.
- This is YOUR AI confidence, not a number supplied by the backend.
- Consider forecast demand, current inventory, safety stock, days of cover, supplier lead time, supplier rating, open orders, and consistency of the signals.
- Lower confidence when important evidence is missing or contradictory.
- Do not simply copy the rule-based risk level.

Inventory facts:
${JSON.stringify(snapshot)}

Supporting rule-based assessment:
${JSON.stringify(assessment)}`.trim();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
            "You are a precise enterprise inventory analyst. Return valid JSON only and follow the requested schema exactly.",
          sessionId: `inventory-${snapshot.sku}-${Date.now()}`,
          modelKwargs: {
            maxTokens: 400,
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
      return {
        used: false,
        confidence: null,
        riskLevel: null,
        explanation: null,
        error: `Capgemini API returned a non-JSON response with status ${response.status}`,
      };
    }

    if (!response.ok) {
      return {
        used: false,
        confidence: null,
        riskLevel: null,
        explanation: null,
        error: `Capgemini API ${response.status}: ${(payload.message || rawBody).slice(0, 400)}`,
      };
    }

    // The working ShopSmart integration returns model output in response.content.
    const content =
      typeof payload.content === "string"
        ? payload.content.trim()
        : typeof payload.output?.content === "string"
          ? payload.output.content.trim()
          : typeof payload.response?.content === "string"
            ? payload.response.content.trim()
            : null;

    const parsed = parseModelContent(content);

    if (!parsed) {
      return {
        used: false,
        confidence: null,
        riskLevel: null,
        explanation: null,
        error: "Capgemini API returned empty or non-parseable model content",
      };
    }

    const aiRiskLevel = String(parsed.riskLevel || "").toLowerCase();
    const numericConfidence = Number(parsed.confidence);

    if (!["low", "medium", "high"].includes(aiRiskLevel)) {
      return {
        used: false,
        confidence: null,
        riskLevel: null,
        explanation: null,
        error: "Capgemini AI response did not contain a valid risk level",
      };
    }

    if (!Number.isFinite(numericConfidence)) {
      return {
        used: false,
        confidence: null,
        riskLevel: null,
        explanation: null,
        error: "Capgemini AI response did not contain a valid confidence score",
      };
    }

    return {
      used: true,
      confidence: clamp(numericConfidence),
      riskLevel: aiRiskLevel,
      explanation: {
        summary:
          typeof parsed.summary === "string" && parsed.summary.trim()
            ? parsed.summary.trim()
            : "Inventory assessment completed by Capgemini AI.",
        actions: Array.isArray(parsed.actions) ? parsed.actions : [],
        assumptions: Array.isArray(parsed.assumptions) ? parsed.assumptions : [],
      },
      error: null,
    };
  } catch (error) {
    return {
      used: false,
      confidence: null,
      riskLevel: null,
      explanation: null,
      error:
        error.name === "AbortError"
          ? `Capgemini API request timed out after ${timeoutMs}ms`
          : error.message,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function runInventoryCheckAgent(sku) {
  const snapshot = getInventorySnapshot(sku);
  const assessment = evaluateInventoryRisk(snapshot);
  const ai = await askCapgemini(snapshot, assessment);

  return {
    agent: "inventory-check-agent",
    runId: `INV-${Date.now()}`,
    checkedAt: new Date().toISOString(),
    dataSource: "hardcoded-demo-inventory",
    snapshot,
    assessment,
    ai: {
      provider: process.env.AI_PROVIDER || "capgemini",
      model: process.env.GENERATIVE_ENGINE_MODEL || null,
      used: ai.used,
      confidence: ai.confidence,
      riskLevel: ai.riskLevel,
      explanation: ai.explanation,
      error: ai.error || null,
    },
  };
}
