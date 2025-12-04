import { Card } from "../components/layout/Card";
import { ChatWindow } from "../components/chat/ChatWindow";

export function ChatAssistant() {
  return (
    <div className="space-y-4 h-full">
      <h1 className="text-2xl font-semibold">Chat Assistant</h1>
      <Card subtitle="Backed by your local Ollama model. Conversations never leave your machine.">
        <div className="h-[480px] flex flex-col">
          <ChatWindow />
        </div>
      </Card>
    </div>
  );
}


