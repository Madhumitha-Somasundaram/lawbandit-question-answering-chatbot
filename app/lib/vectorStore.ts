// app/lib/vectorStore.ts
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";

// LLM for tools and summaries
export const llm = new ChatOpenAI({
  model: "gpt-4o-mini",
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY!,
});

// Embeddings
export const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-large",
  openAIApiKey: process.env.OPENAI_API_KEY!,
});

// Pinecone client & index
export const pineconeClient = new PineconeClient({ apiKey: process.env.PINECONE_API_KEY! });
export const index = pineconeClient.Index(process.env.PINECONE_INDEX!);

// Vector store
export const vectorStore = new PineconeStore(embeddings, {
  pineconeIndex: index,
  maxConcurrency: 5,
});

// Get unique PDFs dynamically
export async function getUniquePDFs(){
  const queryVector = new Array(3072).fill(0); 
  const results = await index.query({
    vector: queryVector,
    topK: 1000,
    includeMetadata: true,
  });

  return Array.from(new Set(results.matches.map((m) => m.metadata.fileName)));
}

