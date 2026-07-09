import { NextResponse } from "next/server";
import { getMarketEngine } from "../../../../../../lib/engines.js";

const SUPPORTED_TIMEFRAMES = new Set(["1m", "5m", "15m", "1h"]);

const DEFAULT_TIMEFRAME = "5m";
const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

export async function GET(req, { params }) {
  try {
    const id = params.id;
    const { searchParams } = new URL(req.url);

    const timeframe =
      searchParams.get("timeframe") ?? DEFAULT_TIMEFRAME;

    const limitRaw =
      searchParams.get("limit") ?? String(DEFAULT_LIMIT);

    if (!SUPPORTED_TIMEFRAMES.has(timeframe)) {
      return NextResponse.json(
        {
          error:
            "Invalid timeframe. Supported values are: 1m, 5m, 15m, 1h",
        },
        { status: 400 },
      );
    }

    if (!/^\d+$/.test(limitRaw)) {
      return NextResponse.json(
        {
          error:
            "Invalid limit. Limit must be an integer between 1 and 500.",
        },
        { status: 400 },
      );
    }

    const limit = Number(limitRaw);

    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
      return NextResponse.json(
        {
          error:
            "Invalid limit. Limit must be an integer between 1 and 500.",
        },
        { status: 400 },
      );
    }

    const engine = getMarketEngine();

    console.log("[candles route] market id:", id);
    console.log("[candles route] engine exists:", Boolean(engine));
    console.log(
      "[candles route] candles method:",
      typeof engine.candles,
    );

    const market = engine.detail(id);

    if (!market) {
      return NextResponse.json(
        {
          error: `Unknown market: ${id}`,
        },
        { status: 404 },
      );
    }

    const candles = engine.candles(id, timeframe, limit);

    return NextResponse.json({
      market_id: id,
      timeframe,
      limit,
      count: candles.length,
      candles,
    });
  } catch (error) {
    console.error("[candles route error]", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}