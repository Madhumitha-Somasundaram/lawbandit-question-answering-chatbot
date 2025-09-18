import { NextRequest, NextResponse } from "next/server";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { pdfToText } from "pdf-ts";
import { cleanPdfText } from "@/lib/utils";


export async function POST(req: NextRequest) {
    
    try {
    const formData = await req.formData();
    const files = formData.getAll("files") as any[];

    if (!files.length) return NextResponse.json({ error: "No files uploaded" }, { status: 400 });

    
   
    const indexName=process.env.PINECONE_INDEX;
    const embeddingDim = 3072;
    const pinecone = new PineconeClient({apiKey: process.env.PINECONE_API_KEY!});
    const indexes = await pinecone.listIndexes();
    if (!indexes.indexes?.some((idx) => idx.name === indexName)) {
      await pinecone.createIndex({
        name: indexName,
        dimension: embeddingDim,
        metric: "cosine",
        spec: { serverless: { cloud: "aws", region: "us-east-1" } },
      });
    }

    const pineconeIndex = pinecone.index(indexName);
    if (!process.env.OPENAI_API_KEY) throw new Error("API key missing");

    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
      openAIApiKey: process.env.OPENAI_API_KEY!,
    });
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      maxConcurrency: 2,
    });
    try {
      
      const stats = await pineconeIndex.describeIndexStats();
      const totalVectors=stats.totalRecordCount

      if (totalVectors > 0) {
        await pineconeIndex.deleteAll();
        
      } else {
        console.log(`No vectors found in index: ${indexName}. Skipping delete.`);
      }
    } catch (err: any) {
      console.error("Error checking or deleting vectors:", err.message);
    }

   let counter = 1;
   for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      let fullText = await pdfToText(buffer);
      fullText = cleanPdfText(fullText);
      const metadata = {
        fileName: `pdf${counter}`
      };
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 2000,
        chunkOverlap: 100,
      });

      const docs = await splitter.createDocuments([fullText], [metadata]);
      
      await vectorStore.addDocuments(docs);
      counter++;
    }
    
    return NextResponse.json({ success: true, message: "POST received with files" });
  } catch (err: any) {
    console.error("Error in POST:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  
}