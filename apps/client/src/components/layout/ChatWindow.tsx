import { Button } from '@/components/ui/button';

export function ChatWindow() {
  return (
    <>
      {/* Spacer div */}
      <div className="flex-1" />
      <div className="flex justify-end">
        <Button size="lg">Send</Button>
      </div>
    </>
  );
}
