import { AlertCircle, Plus, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";
import { useDateFilter } from "../../../contexts/DateFilterContext";
import { extractApiErrors } from "../../../utils/extractApiErrors";
import {
  useChatInsightsMutation,
  useGetInsightConversationsQuery,
  useGetInsightMessagesQuery,
} from "../api/dashboardApi";

function formatMessageTime(message) {
  const raw = message?.createdAt || message?.timestamp || message?.updatedAt;
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}


function emphasizeNumbers(text) {
  const parts = String(text || "").split(/(\b\d+(?:\.\d+)?%?\b)/g);
  return parts.map((part, index) =>
    /\b\d+(?:\.\d+)?%?\b/.test(part) ? (
      <strong key={`${part}-${index}`} className="font-semibold text-foreground">
        {part}
      </strong>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

export default function AIInsightsPage() {
  const { filterParams, hasFilter } = useDateFilter();
  const [chatInsights, { isLoading: isChatLoading }] = useChatInsightsMutation();
  const [chatMessage, setChatMessage] = useState("");
  const [chatError, setChatError] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [expandedMessages, setExpandedMessages] = useState({});
  const { data: conversationsResponse } = useGetInsightConversationsQuery();
  const conversations = conversationsResponse?.data || [];
  const { data: messagesResponse } = useGetInsightMessagesQuery(activeConversationId, {
    skip: !activeConversationId,
  });
  const messages = messagesResponse?.data || [];
  const visibleMessages = activeConversationId ? messages : [];
  const bottomAnchorRef = useRef(null);
  const pageContainerRef = useRef(null);
  const [composerBounds, setComposerBounds] = useState({ left: 16, width: 0 });

  useEffect(() => {
    bottomAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [visibleMessages, isChatLoading]);

  useEffect(() => {
    const updateComposerBounds = () => {
      const rect = pageContainerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setComposerBounds({
        left: Math.max(8, rect.left),
        width: Math.max(320, rect.width),
      });
    };

    updateComposerBounds();
    const observer = new ResizeObserver(updateComposerBounds);
    if (pageContainerRef.current) {
      observer.observe(pageContainerRef.current);
    }
    window.addEventListener("resize", updateComposerBounds);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateComposerBounds);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    setChatError(null);
    try {
      const body = { message: chatMessage.trim() };
      if (activeConversationId) body.conversationId = activeConversationId;
      if (filterParams?.dateFrom) body.dateFrom = filterParams.dateFrom;
      if (filterParams?.dateTo) body.dateTo = filterParams.dateTo;
      const response = await chatInsights(body).unwrap();
      if (!activeConversationId && response?.data?.conversationId) {
        setActiveConversationId(response.data.conversationId);
      }
      setChatMessage("");
    } catch (err) {
      const { generalErrors, fieldErrors } = extractApiErrors(err);
      const msg = generalErrors[0] || fieldErrors.llm?.[0] || err?.message || "Could not send message.";
      setChatError(String(msg));
    }
  };

  const toggleMessageExpansion = (messageId) => {
    setExpandedMessages((prev) => ({ ...prev, [messageId]: !prev[messageId] }));
  };

  const handleStartNewChat = () => {
    setActiveConversationId(null);
    setChatMessage("");
    setExpandedMessages({});
    setChatError(null);
  };

  return (
    <div ref={pageContainerRef} className="space-y-4 pb-44">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">AI Assistant</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Ask anything about your dashboard metrics, trends, performance, and anomalies.
          {hasFilter ? " Responses respect the date filter in the header." : " Responses use all available data unless you apply a date filter."}
        </p>
      </div>

      <Card className="border-0 bg-transparent shadow-none">
        <CardContent className="space-y-4 p-4 md:p-5">
          {chatError ? (
            <div
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <span>{chatError}</span>
            </div>
          ) : null}

          {conversations.length ? (
            <div className="space-y-3 rounded-2xl bg-slate-100/90 px-3 py-3 shadow-sm dark:bg-slate-900/70 dark:shadow-black/20">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Saved chats</p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {conversations.slice(0, 8).map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation.id)}
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-all ${
                      activeConversationId === conversation.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-slate-200/70 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    }`}
                  >
                    {conversation.title || `Chat ${conversation.id}`}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No saved chats yet. Start with one of the suggested questions.</p>
          )}

          <div className="space-y-3 rounded-2xl bg-muted/10 p-4 pb-28">
            {visibleMessages.length ? (
              visibleMessages.map((message) => (
                <div
                  key={message.id}
                  className={`transition-all duration-300 ${message.role === "assistant" ? "flex justify-start" : "flex justify-end"}`}
                >
                  <div
                    className={`max-w-[94%] rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[86%] ${
                      message.role === "assistant"
                        ? "bg-transparent text-foreground"
                        : "bg-yellow-400 text-yellow-950 shadow-sm"
                    }`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[10px] font-semibold ${
                          message.role === "assistant"
                            ? "bg-blue-500/20 text-blue-300"
                            : "bg-foreground/10 text-foreground"
                        }`}
                      >
                        {message.role === "assistant" ? "AI" : "You"}
                      </span>
                      {formatMessageTime(message) ? (
                        <span
                          className={`text-[11px] ${
                            message.role === "assistant" ? "text-muted-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {formatMessageTime(message)}
                        </span>
                      ) : null}
                    </div>
                    {message.role === "assistant" ? (
                      <div className="text-sm leading-7 text-foreground">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
                            ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
                            li: ({ children }) => <li>{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                          }}
                        >
                          {expandedMessages[message.id] || String(message.content || "").length <= 260
                            ? String(message.content || "")
                            : `${String(message.content).slice(0, 260)}...`}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">
                        {expandedMessages[message.id] || String(message.content || "").length <= 260
                          ? emphasizeNumbers(message.content)
                          : emphasizeNumbers(`${String(message.content).slice(0, 260)}...`)}
                      </p>
                    )}
                    {String(message.content || "").length > 260 ? (
                      <button
                        type="button"
                        onClick={() => toggleMessageExpansion(message.id)}
                        className="mt-2 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        {expandedMessages[message.id] ? "Show less" : "Show more"}
                      </button>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-muted/20 p-5">
                <p className="text-base font-medium text-foreground">Welcome</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Ask anything about your dashboard. Try a suggested question to get started.
                </p>
              </div>
            )}
            {isChatLoading ? (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-card/80 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400 [animation-delay:300ms]" />
                    <span className="ml-1 text-xs text-muted-foreground">AI is typing...</span>
                  </div>
                </div>
              </div>
            ) : null}
            <div ref={bottomAnchorRef} />
          </div>

          <div
            className="fixed bottom-3 z-40 px-1"
            style={{ left: `${composerBounds.left}px`, width: `${composerBounds.width}px` }}
          >
            <div className="rounded-2xl bg-background p-2 shadow-xl ring-1 ring-black/10 dark:ring-white/5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartNewChat}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted/25 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                aria-label="Start new chat"
                title="Start new chat"
              >
                <Plus className="h-4 w-4" />
              </button>
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask about dashboard insights, trends, reps, retention, or anomalies..."
                rows={2}
                className="max-h-36 min-h-10 flex-1 resize-y rounded-xl border-0 bg-transparent px-3 py-2 text-sm leading-6 text-foreground outline-none focus:outline-none"
              />
              <Button
                type="button"
                onClick={handleSendMessage}
                disabled={isChatLoading || !chatMessage.trim()}
                className="h-10 w-10 rounded-xl p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
