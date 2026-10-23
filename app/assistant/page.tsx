"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import Link from "next/link"
import {
  Bot,
  Send,
  Sparkles,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  FileText,
  Clock,
  Building,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { type AssistantResponse } from "@/lib/ai-assistant"

type ChatMessage = {
  id: string
  sender: "user" | "assistant"
  text: string
  citations?: AssistantResponse["citations"]
  confidence?: number
  isRefusal?: boolean
  latencyMs?: number
  feedback?: "helpful" | "not-helpful"
  timestamp: string
}

const SUGGESTED_PROMPTS = [
  "What is the mid-semester examination attendance policy?",
  "How do I lodge a hostel room repair complaint?",
  "What are the central library opening and closing hours?",
  "What are the eligibility criteria for campus placement drives?",
  "How do summer research internship credits work?",
  "What are the emergency medical and health center contacts?",
]

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: "Hello! I am the **CampusOne AI Assistant**.\n\nI can answer questions regarding IIIT Ranchi academic regulations, hostel maintenance, library hours, examination policies, and placement guidelines using **approved campus records**.\n\nHow can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading])

  const handleSendMessage = useCallback(async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || loading) return

    const now = Date.now()
    const userMsg: ChatMessage = {
      id: `user-${now}`,
      sender: "user",
      text,
      timestamp: new Date(now).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMsg])
    if (!textToSend) setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`)
      }

      const data: AssistantResponse = await res.json()

      const assistantNow = Date.now()
      const assistantMsg: ChatMessage = {
        id: `assistant-${assistantNow}`,
        sender: "assistant",
        text: data.answer,
        citations: data.citations,
        confidence: data.confidence,
        isRefusal: data.isRefusal,
        latencyMs: data.latencyMs,
        timestamp: new Date(assistantNow).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prev) => [...prev, assistantMsg])
    } catch (err: any) {
      toast({
        title: "Assistant Error",
        description: err.message || "Could not retrieve response",
        variant: "destructive",
      })
      const errNow = Date.now()
      const errorMsg: ChatMessage = {
        id: `assistant-err-${errNow}`,
        sender: "assistant",
        text: "I encountered a network issue communicating with the campus verification service. Please try again.",
        timestamp: new Date(errNow).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }, [input, loading])

  const handleFeedback = (msgId: string, type: "helpful" | "not-helpful") => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, feedback: type } : m))
    )
    toast({
      title: type === "helpful" ? "Feedback recorded" : "Feedback submitted",
      description:
        type === "helpful"
          ? "Thank you! Your feedback helps evaluate model citation precision."
          : "Noted. This query will be reviewed in the next AI evaluation cycle.",
    })
  }

  const handleClear = () => {
    setMessages([
      {
        id: "welcome-reset",
        sender: "assistant",
        text: "Conversation reset. What campus question would you like answered?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ])
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
      {/* Top Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2 gap-1.5 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
                <Bot className="h-5 w-5" />
              </span>
              CampusOne AI Assistant
            </h1>
            <Badge variant="outline" className="text-[10px] font-bold border-blue-500/50 text-blue-600 dark:text-blue-400">
              RAG Grounded
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Grounded in approved IIIT Ranchi policies, circulars, and hostel regulations
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="self-start sm:self-auto gap-1.5 text-xs border-border"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear Conversation
        </Button>
      </div>

      {/* Safety & Groundedness Banner */}
      <div className="mb-4 rounded-xl border border-border bg-neutral-50/70 dark:bg-neutral-900/50 p-3.5 text-xs text-muted-foreground flex items-center gap-2.5">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>
          <strong>AI Safety Notice:</strong> Answers are retrieved strictly from official documents. Unverified claims and confidential records are safely refused to prevent hallucination.
        </span>
      </div>

      {/* Chat Area Card */}
      <Card className="border-border flex flex-col h-[560px] shadow-sm">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm ${
                  m.sender === "user"
                    ? "bg-black text-white dark:bg-white dark:text-black rounded-tr-none"
                    : "bg-neutral-100 text-foreground dark:bg-neutral-900 rounded-tl-none border border-border/60"
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed font-sans">{m.text}</div>

                {/* Citations if available */}
                {m.citations && m.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-border/40 text-xs">
                    <p className="font-semibold text-muted-foreground flex items-center gap-1.5 mb-1.5">
                      <BookOpen className="h-3.5 w-3.5" /> Verified Sources:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.citations.map((c) => (
                        <span
                          key={c.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-background border border-border text-[11px] font-medium"
                        >
                          <FileText className="h-3 w-3 text-muted-foreground" />
                          {c.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Latency & Confidence metadata */}
                {m.sender === "assistant" && m.latencyMs !== undefined && (
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                    <div className="flex items-center gap-2">
                      <span>Latency: {m.latencyMs}ms</span>
                      {m.confidence !== undefined && (
                        <span>Confidence: {(m.confidence * 100).toFixed(0)}%</span>
                      )}
                    </div>

                    {/* Feedback Thumbs */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleFeedback(m.id, "helpful")}
                        className={`p-1 rounded hover:bg-muted transition-colors ${
                          m.feedback === "helpful" ? "text-emerald-600 font-bold" : ""
                        }`}
                        title="Helpful"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleFeedback(m.id, "not-helpful")}
                        className={`p-1 rounded hover:bg-muted transition-colors ${
                          m.feedback === "not-helpful" ? "text-red-600 font-bold" : ""
                        }`}
                        title="Not helpful"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-muted-foreground mt-1 px-1">
                {m.timestamp}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-2">
              <div className="bg-neutral-100 dark:bg-neutral-900 border border-border/60 rounded-2xl rounded-tl-none p-3.5 text-xs text-muted-foreground flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 rounded-full bg-foreground/60 animate-bounce" />
                  <div className="h-2 w-2 rounded-full bg-foreground/60 animate-bounce [animation-delay:0.2s]" />
                  <div className="h-2 w-2 rounded-full bg-foreground/60 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Retrieving verified campus documents...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {/* Suggested Prompts pills */}
        <div className="px-4 py-2 border-t border-border/60 bg-neutral-50/40 dark:bg-neutral-900/20 overflow-x-auto">
          <div className="flex gap-2 text-xs">
            {SUGGESTED_PROMPTS.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="whitespace-nowrap rounded-full border border-border bg-background px-3 py-1 text-[11px] font-medium text-foreground/80 hover:bg-muted hover:text-foreground transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <CardFooter className="p-3 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex w-full items-center gap-2"
          >
            <Input
              placeholder="Ask a campus question (e.g. library hours, hostel repair, exam policy)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="text-xs sm:text-sm bg-background border-border"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black shrink-0 px-3.5"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
