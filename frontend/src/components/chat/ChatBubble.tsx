type Props = {
  role: "user" | "assistant";
  content: string;
};

export function ChatBubble({ role, content }: Props) {
  const isUser = role === "user";
  return (
    <div
      className={[
        "max-w-xl rounded-2xl px-4 py-2 text-sm",
        isUser
          ? "ml-auto bg-emerald-500 text-slate-950"
          : "mr-auto bg-slate-900 border border-slate-800 text-slate-50"
      ].join(" ")}
    >
      <div className="text-[11px] uppercase tracking-wide mb-1 opacity-60">
        {isUser ? "You" : "Assistant"}
      </div>
      <p className="whitespace-pre-wrap">{content}</p>
    </div>
  );
}


