import type { ReactNode } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

type ChatWindowProps = {
  messages: Message[];
  sendMessage: (message: string) => Promise<void>;
};

const BOTTOM_SCROLL_THRESHOLD = 32;

export function ChatWindow({ messages, sendMessage }: ChatWindowProps) {
  const [draftMessage, setDraftMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shouldStickToBottomRef = useRef(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer || !shouldStickToBottomRef.current) {
      return;
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, [isSubmitting, messages]);

  const handleMessagesScroll = () => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) {
      return;
    }

    const distanceFromBottom =
      messagesContainer.scrollHeight - messagesContainer.clientHeight - messagesContainer.scrollTop;
    shouldStickToBottomRef.current = distanceFromBottom <= BOTTOM_SCROLL_THRESHOLD;
  };

  const submitMessage = async () => {
    const trimmedMessage = draftMessage.trim();
    if (!trimmedMessage || isSubmitting) {
      return;
    }

    setDraftMessage('');
    setIsSubmitting(true);

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
    }

    try {
      await sendMessage(trimmedMessage);
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1"
        onScroll={handleMessagesScroll}
        ref={messagesContainerRef}
      >
        {messages.map((message, index) => (
          <div key={index}>
            <MessageBubble role={message.role}>{message.content}</MessageBubble>
          </div>
        ))}
        {isSubmitting ? (
          <MessageBubble>
            <LoadingDots />
          </MessageBubble>
        ) : null}
      </div>
      <div className="mt-auto flex justify-end">
        <div className="w-full max-w-2xl">
          <Textarea
            className="min-h-0 max-h-32 resize-none overflow-y-auto"
            disabled={isSubmitting}
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
        <Button disabled={isSubmitting} onClick={() => void submitMessage()}>
          Send
        </Button>
      </div>
    </div>
  );
}

function MessageBubble({
  children,
  role = 'assistant',
  className,
}: {
  children: ReactNode;
  role?: 'assistant' | 'user';
  className?: string;
}) {
  return (
    <div className={cn('flex', role === 'assistant' ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm',
          role === 'assistant' ? 'bg-muted text-foreground' : 'bg-primary text-primary-foreground',
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

function LoadingDots() {
  return (
    <span aria-hidden="true" className="inline-flex items-center gap-1.5">
      {[0, 150, 300].map((delay) => (
        <span className="relative block size-1.5" key={delay}>
          <span className="absolute inset-0 rounded-full bg-muted-foreground/10" />
          <span
            className="absolute inset-0 rounded-full bg-primary animate-pulse"
            style={{ animationDelay: `${delay}ms` }}
          />
        </span>
      ))}
    </span>
  );
}
