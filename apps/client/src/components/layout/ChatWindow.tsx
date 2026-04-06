import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Message } from '@/types';

type ChatWindowProps = {
  messages: Message[];
  sendMessage: (message: string) => Promise<void>;
};

export function ChatWindow({ messages, sendMessage }: ChatWindowProps) {
  const [draftMessage, setDraftMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submitMessage = async () => {
    const trimmedMessage = draftMessage.trim();
    if (!trimmedMessage) {
      return;
    }

    await sendMessage(trimmedMessage);
    setDraftMessage('');

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
  };

  const handleChange = (value: string) => {
    setDraftMessage(value);

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    // Clear and then recalculate the height based on scroll height
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Spacer div */}
      <div className="flex-1" />
      {messages.map((message, index) => (
        <div
          className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
          key={index}
        >
          <p
            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
              message.role === 'assistant'
                ? 'bg-muted text-foreground'
                : 'bg-primary text-primary-foreground'
            }`}
          >
            {message.content}
          </p>
        </div>
      ))}
      <div className="flex justify-end">
        <div className="w-full max-w-2xl">
          <Textarea
            className="min-h-0 max-h-32 resize-none overflow-y-auto"
            onChange={(event) => handleChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void submitMessage();
              }
            }}
            ref={textareaRef}
            rows={1}
            value={draftMessage}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={() => void submitMessage()}>Send</Button>
      </div>
    </div>
  );
}
