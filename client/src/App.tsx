import { useState } from 'react';

type Source = {
  document_id: string;
  chunk_id: string;
  score?: number;
};

function HomePage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);

  async function askQuestion() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      return;
    }

    setLoading(true);
    setAnswer('');
    setSources([]);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: trimmedQuestion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Die Anfrage ist fehlgeschlagen.');
      }

      setAnswer(data.answer || '');
      setSources(data.sources || []);
    } catch (error) {
      setAnswer(
        error instanceof Error
          ? error.message
          : 'Es ist ein unbekannter Fehler aufgetreten.',
      );
      setSources([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold">
          BKK Mitarbeiter-Assistent
        </h1>

        <p className="text-lg opacity-70">
          Stellen Sie Ihre Frage zu den internen BKK-Informationen.
        </p>
      </div>

      <section className="border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold">
          Ihre Frage
        </h2>

        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Zum Beispiel: Welche Informationen gibt es zum Bonusprogramm?"
          className="min-h-32 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none"
        />

        <div className="flex justify-end">
          <button
            type="button"
            disabled={!question.trim() || loading}
            onClick={askQuestion}
            className="rounded-md border px-4 py-2 font-medium disabled:opacity-50"
          >
            {loading ? 'Antwort wird erstellt...' : 'Frage stellen'}
          </button>
        </div>
      </section>

      {answer && (
        <section className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            Antwort
          </h2>

          <div className="whitespace-pre-wrap text-sm leading-7">
            {answer}
          </div>
        </section>
      )}

      {sources.length > 0 && (
        <section className="border rounded-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">
            Quellen
          </h2>

          <ul className="space-y-2">
            {sources.map((source) => (
              <li
                key={`${source.document_id}-${source.chunk_id}`}
                className="border rounded-md px-3 py-3"
              >
                <div className="font-medium">
                  {source.document_id}
                </div>

                <div className="mt-1 text-sm opacity-70">
                  {source.chunk_id}
                  {typeof source.score === 'number' && (
                    <>
                      {' · '}Relevanz:{' '}
                      <span className="font-medium opacity-100">
                        {source.score.toFixed(3)}
                      </span>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-center text-xs opacity-60">
        Antworten werden auf Basis der bereitgestellten BKK-Wissensbasis erzeugt.
      </p>
    </main>
  );
}

export default function App() {
  return <HomePage />;
}
