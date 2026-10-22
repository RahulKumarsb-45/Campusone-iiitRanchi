import { NextRequest, NextResponse } from "next/server"
import { generateGroundedAnswer } from "@/lib/ai-assistant"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "A valid message string is required." },
        { status: 400 }
      )
    }

    const trimmed = message.trim()
    if (trimmed.length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty." },
        { status: 400 }
      )
    }

    if (trimmed.length > 1000) {
      return NextResponse.json(
        { error: "Message exceeds 1000 characters limit." },
        { status: 400 }
      )
    }

    const response = await generateGroundedAnswer(trimmed)
    return NextResponse.json(response)
  } catch (err: any) {
    console.error("Assistant API Route error:", err)
    return NextResponse.json(
      { error: "An error occurred while generating the assistant response." },
      { status: 500 }
    )
  }
}
