'use client';

import { useState } from 'react';
import { askQuestion } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ section_name: string; page_number: number; excerpt: string }>;
  ragas_scores?: { faithfulness: number; answer_relevancy: number; context_precision: number };
}

interface QAChatProps {
  documentId: string;
  suggestedQuestions?: string[];
}

export default function QAChat({ documentId, suggestedQuestions = [] }: QAChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (question: string) => {
    if (!question.trim() || loading) return;
    setLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setInput('');

    try {
      const result = await askQuestion(documentId, question);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.answer,
          sources: result.sources,
          ragas_scores: result.ragas_scores,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I could not answer that question.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card flex flex-col p-6">
      {suggestedQuestions.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {suggestedQuestions.map((q) => (
            <button
              key={q}
              onClick={() => submit(q)}
              className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300 transition hover:bg-cyan-400/20"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <div className="mb-4 max-h-96 space-y-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-sky-500 to-amber-500 text-white'
                  : 'border border-white/10 bg-white/[0.05] text-white/80 backdrop-blur-md'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              {msg.ragas_scores && (
                <div className="mt-2 flex gap-2">
                  <span className="badge badge-neutral">F: {msg.ragas_scores.faithfulness}</span>
                  <span className="badge badge-neutral">R: {msg.ragas_scores.answer_relevancy}</span>
                  <span className="badge badge-neutral">P: {msg.ragas_scores.context_precision}</span>
                </div>
              )}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 border-t border-white/10 pt-2 text-xs muted">
                  {msg.sources.slice(0, 2).map((s, j) => (
                    <p key={j}>{s.section_name}, p.{s.page_number}: {s.excerpt.slice(0, 100)}...</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); submit(input); }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="input-glass flex-1 rounded-full"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-sky-500 to-amber-500 px-6 py-2.5 text-sm font-medium text-white transition hover:from-sky-400 hover:to-amber-400 disabled:opacity-50"
        >
          {loading ? '...' : 'Ask'}
        </button>
      </form>
    </div>
  );
}
