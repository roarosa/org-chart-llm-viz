import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function ChatWindow() {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (value: string) => {
    setMessage(value);

    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    // Clear and then recalculate the height based on scroll height
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  };

  return (
    <div className="flex h-full flex-col gap-2">
      {/* Spacer div */}
      <div className="flex-1" />
      <Textarea
        className="min-h-0 max-h-32 w-full max-w-lg resize-none overflow-y-auto"
        onChange={(event) => handleChange(event.target.value)}
        ref={textareaRef}
        rows={1}
        value={message}
      />
      <div className="flex justify-end">
        <Button>Send</Button>
      </div>
    </div>
  );
}
