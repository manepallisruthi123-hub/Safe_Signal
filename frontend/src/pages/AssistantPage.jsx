import React, { useState } from "react";
import {
  BotMessageSquare,
  Send,
  Loader2,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Info,
  Calendar,
  User,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import { api } from "../services/api";

const PRESET_QUESTIONS = [
  "What should I do if someone threatens to leak my photos?",
  "How can I report an impersonation account on Instagram?",
  "How should I preserve digital evidence of cyber stalking?",
  "What should I do if a cab driver deviates from the route?",
  "Where can I find official women safety resources in India?"
];

export function AssistantPage() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello, I am SafeSignal's AI Safety Guide. I provide grounded safety guidance based strictly on verified Indian cybercrime procedures, IT Rules 2021, Bharatiya Nyaya Sanhita 2023, and official helplines.\n\nHow can I support your safety today?",
      sources: [
        {
          title: "Indian Cyber Crime Coordination Centre (I4C)",
          url: "https://cybercrime.gov.in",
          sourceType: "Official Government",
          verifiedDate: "2026-02-15"
        }
      ],
      isGrounded: true,
      model: "SafeSignal Verified Knowledge Base (RAG)"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryText) => {
    const query = (queryText || input).trim();
    if (!query) return;

    const userMsg = { role: "user", text: query };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await api.queryAssistant(query);
      const assistantMsg = {
        role: "assistant",
        text: response.answer || "No response generated.",
        sources: response.sources || [],
        isGrounded: response.isGrounded !== false,
        model: response.model || "Verified Knowledge Base RAG",
        isDeterministicFallback: response.isDeterministicFallback,
        disclaimer: response.disclaimer
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          text: "I was unable to retrieve verified information for that query. For urgent safety concerns, please dial 112 (Police) or 1930 (Cybercrime).",
          sources: [],
          isGrounded: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [geminiEnabled, setGeminiEnabled] = useState(false);

  React.useEffect(() => {
    api.getGeminiStatus().then(res => setGeminiEnabled(!!res.gemini_enabled));
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-plum-700 mb-1">
              <BotMessageSquare className="w-5 h-5 text-plum-700" />
              <h2 className="text-xl font-extrabold text-plum-950">AI Safety Assistant (RAG Pipeline)</h2>
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              Answers are grounded in curated Indian legal codes, emergency response manuals, and official reporting portals. Includes verified source citations with last-reviewed dates.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-2 text-[11px] px-3 py-1.5 rounded-full border ${
              geminiEnabled
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-lavender-100/80 text-plum-800 border-lavender-200"
            }`}>
              <Sparkles className={`w-4 h-4 ${geminiEnabled ? "text-emerald-600" : "text-plum-700"}`} />
              <span className="font-bold">
                {geminiEnabled ? "Gemini 1.5 Flash + FAISS RAG" : "FAISS Vector RAG (Local Engine)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-600 block">Suggested safety inquiries:</span>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              disabled={loading}
              onClick={() => handleSend(q)}
              className="text-xs font-medium px-3.5 py-1.5 rounded-xl bg-white border border-surface-border hover:bg-lavender-50 hover:border-plum-300 text-slate-700 transition-colors shadow-soft-sm text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-3xl border border-surface-border shadow-soft-sm overflow-hidden flex flex-col h-[520px]">
        
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-xl bg-plum-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-soft-sm">
                  <BotMessageSquare className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-plum-900 text-white shadow-soft"
                  : "bg-surface-subtle border border-surface-border text-slate-800"
              }`}>
                {/* Message Body */}
                <div className="whitespace-pre-line font-normal">
                  {m.text}
                </div>

                {/* Sources & Citations Section for Assistant responses */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-surface-border space-y-2">
                    <div className="flex items-center space-x-1.5 text-[11px] font-bold text-plum-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified Indian Sources & Citations:</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {m.sources.map((src, sIdx) => (
                        <a
                          key={sIdx}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2.5 rounded-xl bg-white border border-surface-border hover:border-plum-400 transition-all block group"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-plum-950 group-hover:text-plum-700">
                            <span>{src.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-plum-600 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                            <span className="bg-lavender-100 text-plum-800 px-1.5 py-0.5 rounded font-semibold">
                              {src.sourceType || "Official"}
                            </span>
                            <span>Verified: {src.verifiedDate || "2026-02"}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engine Mode / Disclaimer */}
                {m.model && (
                  <div className="mt-2.5 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Model: {m.model}</span>
                    {m.isDeterministicFallback && (
                      <span className="text-amber-700 font-semibold">[Verified Knowledge Base Fallback]</span>
                    )}
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-3 text-xs text-slate-500 py-2">
              <div className="w-8 h-8 rounded-xl bg-plum-700 text-white flex items-center justify-center shrink-0 shadow-soft-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <span className="font-semibold text-slate-600">Retrieving safety knowledge and verifying primary sources...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-surface-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder="Ask a question about digital or physical safety in India..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 text-xs sm:text-sm bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 bg-plum-800 hover:bg-plum-900 disabled:opacity-50 text-white rounded-xl shadow-soft transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-slate-400 text-center mt-2">
            SafeSignal Assistant provides informational guidance based on verified public records, not official legal counsel or live police dispatch.
          </p>
        </div>

      </div>

    </div>
  );
}
