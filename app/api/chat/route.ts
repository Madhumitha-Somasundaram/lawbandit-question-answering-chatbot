// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MessagesAnnotation, StateGraph, MemorySaver } from "@langchain/langgraph";
import { AIMessage, HumanMessage, SystemMessage, ToolMessage } from "@langchain/core/messages";
import { toolsCondition, ToolNode } from "@langchain/langgraph/prebuilt";
import { retrieve, summarize } from "../../lib/tools";
import { llm, getUniquePDFs } from "../../lib/vectorStore"; // ✅ include getUniquePDFs

// -------------------- Build Graph --------------------

// Cast tools as any to avoid deep TS recursion
const toolsNode = new ToolNode([retrieve, summarize] as any);
const uniquePDFs=await getUniquePDFs()

async function queryOrRespond(state: typeof MessagesAnnotation.State) {
  const llmWithTools = llm.bindTools([retrieve, summarize]);
  const response = await llmWithTools.invoke(state.messages);
  return { messages: [response] };
}

async function generate(state: typeof MessagesAnnotation.State) {
  const toolMessages: ToolMessage[] = state.messages.filter(
    (msg) => msg instanceof ToolMessage
  ) as ToolMessage[];

  const docsContent = toolMessages.map((doc) => doc.content).join("\n");
  const systemMessageContent = `
You are a helpful assistant for PDF question-answering or summarization.

Available PDFs: ${uniquePDFs.join(", ")}

Tools:
- 'retrieve': Use to answer a question (filter by pdfIds if mentioned)
- 'summarize': Use to summarize PDFs (multiple PDFs supported)

Rules:
1. Questions:
   - If the user asks a question, call 'retrieve' on the relevant PDFs.
   - If no PDF is specified, retrieve from all PDFs.
   - Answer only based on retrieved documents.
   - If no relevant info is found, politely reply: "I don't know."

2. Summaries:
   - If the user asks for a summary, call 'summarize'.
   - Summarize each PDF separately.
   - Each PDF summary should start with a heading:
     ### Summary for PDF_NAME
   - Use bullet points for important dates, tasks, and key points.
   - Include all relevant details if available.
   - Always indicate the source at the end:
     **Source:** PDF_NAME

3. Formatting:
   - Maintain Markdown formatting.
   - Use headings, paragraphs, bullet points correctly.
   - If there is a newline, include \n in markdown format.
   - Separate multiple PDF summaries clearly with newlines(\n).

Documents retrieved so far:
${docsContent}

Return your final answer in Markdown format.
`;


  const conversationMessages = state.messages.filter(
    (msg) =>
      msg instanceof HumanMessage ||
      msg instanceof SystemMessage ||
      (msg instanceof AIMessage && msg.tool_calls.length === 0)
  );

  const prompt = [new SystemMessage(systemMessageContent), ...conversationMessages];
  const response = await llm.invoke(prompt);

  return { messages: [response] };
}



const graphBuilder = new StateGraph(MessagesAnnotation)
  .addNode("queryOrRespond", queryOrRespond)
  .addNode("tools", toolsNode)
  .addNode("generate", generate)
  .addEdge("__start__", "queryOrRespond")
  .addConditionalEdges("queryOrRespond", toolsCondition, {
    __end__: "__end__",
    tools: "tools",
  })
  .addEdge("tools", "generate")
  .addEdge("generate", "__end__");

const memory = new MemorySaver();
const graphWithMemory = graphBuilder.compile({ checkpointer: memory });

// -------------------- API Route --------------------
export async function POST(req: NextRequest) {
  try {
    const { question } = await req.json();
    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Invalid question" }, { status: 400 });
    }
    console.log("uniquePDFs : ",uniquePDFs)
    const systemMsg = new SystemMessage(
      `You have access to PDFs with IDs: ${uniquePDFs.join(
        ", "
      )}. Users can refer to them by pdfId for retrieval or summarization.`
    );

    const initialState = { messages: [systemMsg, new HumanMessage(question)] };
    const output = await graphWithMemory.invoke(initialState, {
      configurable: { thread_id: "abc123" },
      streamMode: "values" as const,
    });

    const answerMessage = output.messages.filter(
      (msg) => msg instanceof AIMessage && msg.content
    ).pop();
    
    return NextResponse.json({
      answer: answerMessage?.content || "I don’t know.",
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
