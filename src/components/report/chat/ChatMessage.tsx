'use client';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export type Message = {
  role: 'user' | 'model';
  content: string;
};

const markdownComponents = {
    p: ({...props}: React.HTMLAttributes<HTMLParagraphElement>) => <p className="mb-2 last:mb-0" {...props} />,
    ul: ({...props}: React.HTMLAttributes<HTMLUListElement>) => <ul className="list-disc list-inside" {...props} />,
    ol: ({...props}: React.HTMLAttributes<HTMLOListElement>) => <ol className="list-decimal list-inside" {...props} />,
    li: ({...props}: React.HTMLAttributes<HTMLLIElement>) => <li className="mb-1" {...props} />,
    a: ({...props}: React.HTMLAttributes<HTMLAnchorElement>) => <a className="underline" {...props} />,
    strong: ({...props}: React.HTMLAttributes<HTMLElement>) => <strong className="font-bold" {...props} />,
  }
  

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  return (
    <div
      className={cn(
        'flex items-start gap-4',
        isUser ? 'justify-end' : ''
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
          <Bot className="h-5 w-5" />
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-md rounded-lg p-3 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground'
        )}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
        </ReactMarkdown>
      </div>
      {isUser && (
        <Avatar className="h-8 w-8 bg-secondary flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5" />
        </Avatar>
      )}
    </div>
  );
}
