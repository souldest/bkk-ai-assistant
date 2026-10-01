import { createApp, server } from '@databricks/appkit';
import { aiSearch } from '@databricks/appkit/beta';
import { WorkspaceClient } from '@databricks/sdk-experimental';

const workspace = new WorkspaceClient({});

const EMBEDDING_ENDPOINT =
  process.env.DATABRICKS_EMBEDDING_ENDPOINT ?? 'minilm-embedding';

const LLM_ENDPOINT =
  process.env.DATABRICKS_LLM_ENDPOINT ?? 'databricks-gpt-oss-120b';

type Match = {
  chunk_id: string;
  document_id: string;
  content: string;
  score: number;
};

function buildPrompt(question: string, matches: Match[]): string {
  const context = matches.length === 0
    ? 'KEIN RELEVANTER KONTEXT GEFUNDEN.'
    : matches
        .map(
          (item) =>
            `[Quelle: ${item.document_id} | ` +
            `Chunk: ${item.chunk_id} | ` +
            `Relevanz: ${item.score.toFixed(3)}]\n` +
            item.content,
        )
        .join('\n\n');

  return `
Du bist ein Assistent für eine Krankenkasse.

Beantworte die Frage ausschließlich anhand des bereitgestellten
Kontexts.

WICHTIGE REGELN:

1. Verwende ausschließlich Informationen aus dem Kontext.

2. Erfinde keine Leistungen, Beträge, Fristen,
   Voraussetzungen, gesetzlichen Regelungen oder Prozesse.

3. Wenn der Kontext die Frage nicht ausreichend beantwortet,
   sage ausdrücklich:
   "Die vorhandenen Informationen reichen für eine
   verlässliche Antwort nicht aus."

4. Vermische niemals Informationen aus fachlich unterschiedlichen
   Themenbereichen.

5. Wenn die Frage Krankengeld, Krankheit, Krankschreibung,
   Arbeitsunfähigkeit oder Entgeltfortzahlung betrifft,
   verwende nur Kontext, der tatsächlich zu diesem Themenbereich
   gehört.

6. Informationen zu Bonusprogrammen, Bonuspunkten, Pflege,
   Zuzahlungen, Zahnbehandlungen oder anderen Leistungen dürfen
   NICHT als Begründung für eine Krankheits- oder
   Krankengeld-Antwort verwendet werden.

7. Erfinde keine Beispiele mit Ärzten, Entgeltabrechnungen,
   Patienten oder Krankengeldsummen, wenn diese nicht
   ausdrücklich im Kontext stehen.

8. Wenn keine ausreichende Information vorhanden ist,
   gib keine Vermutung und keine allgemeine Erklärung aus.

9. Antworte präzise und möglichst kurz.

10. Antworte auf Deutsch.

11. Gib keine Quellenangaben im Antworttext aus; die Quellen werden separat von der Anwendung angezeigt.

Frage:
${question}

Kontext:
${context}
`.trim();
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await workspace.servingEndpoints.query({
    name: EMBEDDING_ENDPOINT,
    dataframe_records: [{ text }],
  });

  const predictions = response.predictions as number[][];

  if (!predictions?.[0]) {
    throw new Error('Embedding Serving Endpoint returned no prediction.');
  }

  const embedding = predictions[0];

  if (embedding.length !== 384) {
    throw new Error(
      `Expected embedding dimension 384, got ${embedding.length}`,
    );
  }

  return embedding;
}

async function askLLM(prompt: string): Promise<string> {
  const response = await workspace.servingEndpoints.query({
    name: LLM_ENDPOINT,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    max_tokens: 500,
    temperature: 0.2,
  });

  if (!response.choices?.length) {
    return '';
  }

  const message = response.choices[0]?.message;

  if (!message?.content) {
    return '';
  }

  if (typeof message.content === 'string') {
    return message.content.trim();
  }

  const texts: string[] = [];

  for (const block of message.content as unknown[]) {
    if (
      typeof block === 'object' &&
      block !== null &&
      'type' in block &&
      'text' in block &&
      (block as { type?: unknown }).type === 'text'
    ) {
      texts.push(String((block as { text?: unknown }).text ?? ''));
    }
  }

  return texts.join('').trim();
}

createApp({
  plugins: [
    aiSearch({
      indexes: {
        default: {
          indexName: 'workspace.healthcare_ai.document_chunks_index',
          columns: ['chunk_id', 'document_id', 'content'],
          queryType: 'ann',
          embeddingFn: getEmbedding,
        },
      },
    }),
    server(),
  ],
  onPluginsReady(appkit) {
    appkit.server.extend((app) => {
      app.post('/api/embed-test', async (req, res) => {
        try {
          const text = req.body?.text?.trim();

          if (!text) {
            return res.status(400).json({
              error: 'Text must not be empty.',
            });
          }

          const embedding = await getEmbedding(text);

          return res.status(200).json({
            embedding,
          });
        } catch (error) {
          console.error('Databricks Embedding Serving API error:', error);

          return res.status(500).json({
            error:
              'Databricks Embedding Serving Endpoint konnte nicht erreicht werden.',
          });
        }
      });

      app.post('/api/ask', async (req, res) => {
        try {
          const question = req.body?.question?.trim();

          if (!question) {
            return res.status(400).json({
              error: 'Question must not be empty.',
            });
          }

          const searchData = await appkit.aiSearch.query<{
            chunk_id: string;
            document_id: string;
            content: string;
          }>('default', {
            queryText: question,
            numResults: 4,
          });

          const matches: Match[] = searchData.results.map((result) => ({
            ...result.data,
            score: result.score,
          }));

          const prompt = buildPrompt(question, matches);
          const answer = await askLLM(prompt);

          if (!answer) {
            throw new Error('LLM returned an empty response.');
          }

          return res.status(200).json({
            question,
            answer,
            sources: matches.map((item) => ({
              document_id: item.document_id,
              chunk_id: item.chunk_id,
              score: item.score,
            })),
          });
        } catch (error) {
          console.error('AI Search / LLM error:', error);

          return res.status(500).json({
            error: 'AI Search oder Databricks LLM konnte nicht erreicht werden.',
          });
        }
      });
    });
  },
}).catch(console.error);
