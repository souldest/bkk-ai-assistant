#!/usr/bin/env bash
set -e

echo "=== AI Search Index erstellen ==="

databricks vector-search-indexes create-index \
  workspace.healthcare_ai.document_chunks_index \
  bkk-ai-search \
  chunk_id \
  DELTA_SYNC \
  --index-subtype HYBRID \
  --json '{
    "delta_sync_index_spec": {
      "source_table": "workspace.healthcare_ai.document_chunks",
      "pipeline_type": "TRIGGERED",
      "embedding_vector_columns": [
        {
          "name": "embedding",
          "embedding_dimension": 384
        }
      ]
    }
  }'

echo "=== Index synchronisieren ==="

databricks vector-search-indexes sync-index \
  workspace.healthcare_ai.document_chunks_index

echo "=== App starten ==="

databricks apps start bkk-ai-assistant

echo "=== Fertig ==="

databricks apps get bkk-ai-assistant
