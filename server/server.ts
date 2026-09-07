import { createApp, server } from '@databricks/appkit';
import { aiSearch } from '@databricks/appkit/beta';

createApp({
  plugins: [
    aiSearch({
      indexes: {
        default: {
          indexName: 'workspace.healthcare_ai.document_chunks_index',
          columns: ['chunk_id', 'document_id', 'content'],
          queryType: 'ann',
          embeddingFn: async (text) => {
            const response = await fetch('http://localhost:8081/embed', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ text }),
            });

            if (!response.ok) {
              throw new Error(`Embedding API returned ${response.status}`);
            }

            const data = (await response.json()) as { embedding: number[] };
            return data.embedding;
          },
        },
      },
    }),
    server(),
  ],
  onPluginsReady(appkit) {
    appkit.server.extend((app) => {
      app.post('/api/embed-test', async (req, res) => {
        try {
          const response = await fetch('http://localhost:8081/embed', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              text: req.body?.text,
            }),
          });

          const data = (await response.json()) as { embedding: number[] };
          return res.status(response.status).json(data);
        } catch (error) {
          console.error('Python embedding API error:', error);

          return res.status(500).json({
            error: 'Python-Embedding-Service konnte nicht erreicht werden.',
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

          const host = req.get('host');
          const protocol = req.protocol;

          const searchResponse = await fetch(
            `${protocol}://${host}/api/ai-search/default/query`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                queryText: question,
                numResults: 4,
              }),
            },
          );

          const searchData = (await searchResponse.json()) as {
            results?: Array<{
              score: number;
              data: {
                chunk_id: string;
                document_id: string;
                content: string;
              };
            }>;
          };

          if (!searchResponse.ok) {
            return res.status(searchResponse.status).json(searchData);
          }

          const matches = (searchData.results ?? []).map((result) => ({
            ...result.data,
            score: result.score,
          }));

          const response = await fetch(
            'http://localhost:8081/answer-with-context',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                question,
                matches,
              }),
            },
          );

          const data = await response.json();

          return res.status(response.status).json(data);
        } catch (error) {
          console.error('AI Search / Python API error:', error);

          return res.status(500).json({
            error:
              'AI Search oder Python-RAG-Service konnte nicht erreicht werden.',
          });
        }
      });
    });

  },
}).catch(console.error);
