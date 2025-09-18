import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { vectorStore, llm, getUniquePDFs } from "./vectorStore";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
// -------------------- SCHEMAS --------------------
const retrieveSchema = z.object({
  query: z.string(),
  pdfIds: z.array(z.string()).optional(),
});

const summarizeSchema = z.object({
  pdfIds: z.array(z.string()).optional(),
});


export const retrieve = tool(
  async ({ query, pdfIds }: any) => {
    const filter = pdfIds ? { fileName: { $in: pdfIds } } : undefined;
    const retrievedDocs = filter
      ? await vectorStore.similaritySearch(query, 5, filter)
      : await vectorStore.similaritySearch(query, 5);

    return retrievedDocs
      .map(
        (doc) =>
          `**Source:** ${doc.metadata.fileName} (${doc.metadata.pdfId})\n${doc.pageContent}`
      )
      .join("\n");
  },
  {
    name: "retrieve",
    description: "Retrieve information from PDFs. Optionally provide pdfIds.",
    schema: retrieveSchema as any,
    responseFormat: "tool_message",
  }
) as any;



// -------------------- SUMMARIZE TOOL --------------------
export const summarize = tool(
  async ({ pdfIds }) => {
    const pdfsToSummarize =
      pdfIds && pdfIds.length > 0 ? pdfIds : await getUniquePDFs();

    const summaries: Record<string, string> = {};

    for (const pdfId of pdfsToSummarize) {
      const filter = { fileName: { $eq: pdfId } };
      const response = await vectorStore.similaritySearch("", 10, filter);
      const pageContents = response.map((doc) => doc.pageContent).join("\n");

      const summary = await llm.invoke([
        new SystemMessage(
          "Summarize the following content with all important details, including dates, tasks, and key points. Return in Markdown using bullet points."
        ),
        new HumanMessage(pageContents),
      ]);

      summaries[pdfId] =
        typeof summary.content === "string"
          ? summary.content
          : JSON.stringify(summary.content);
    }

    return summaries;
  },
  {
    name: "summarize",
    description: "Summarize PDFs (defaults to all PDFs if none specified).",
    schema: summarizeSchema as any,
    responseFormat: "tool_message",
  }
) as any;