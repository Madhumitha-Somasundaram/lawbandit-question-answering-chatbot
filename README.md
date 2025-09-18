# ⚖️ Lawbandit Question Answering Chatbot – How It Works

This AI-powered system helps users ask questions on legal documents (PDFs) efficiently using LangChain, LangGraph, Pinecone, and user-driven summarization.

---
## 📝 Features

- 📤 Upload Documents – Upload one or multiple PDFs.

- 💬 Interactive Chat – Ask questions or request summaries of uploaded documents.

- 🔍 Document Retrieval & Summarization – Retrieves relevant chunks via embeddings; generates concise, user-driven summaries.

- 🧠 Memory – Chat remembers previous interactions for context-aware answers.

- 🚪 End Chat – Finalize session while keeping files and chat memory for future reference.

---

## 🧱 Tech Stack

| Component             | Tools/Frameworks                           |
|----------------------|--------------------------------------------|
| **Frontend**         | TypeScript, React / Next.js (.tsx)                                 |
| **Backend**          | TypeScript, Node.js / Next.js API (.ts), LangGraph                          |
| **AI & Retrieval** | RAG, LangChain, LangGraph, Pinecone                            |
| **Deployment**       | Vercel                            |

---
## 🔧 Components

| Component             | Note                          |
|----------------------|--------------------------------------------|
| **FileUpload.tsx**         | Upload multiple files for processing.                                 |
| **upload/route.ts**         | API endpoint handling file uploads.                                 |
| **vectorStore.ts**         | Store & retrieve document embeddings.                                 |
| **pinecone.ts**         | Pinecone client setup for vector DB.                                 |
| **ChatBox.tsx**         | Interactive chat interface.                                 |
| **chat/route.ts**         | Backend chat logic with retrieval & LLM.                                 |
| **tools.ts / utils.ts**         | Helper functions for parsing, cleaning, OpenAI embeddings.                                 |

---
## 🚀 Setup Instructions

- Clone the repository

    - git clone https://github.com/your-username/lawbandit-question-answering-chatbot.git
    - cd lawbandit-question-answering-chatbot

- Install dependencies

    - npm install

- Set environment variables (create .env file)

    - OPENAI_API_KEY=your_openai_api_key
    - PINECONE_API_KEY=your_pinecone_api_key
    - PINECONE_ENV=your_pinecone_env
      
- Run the app locally

    - npm run dev

- Visit the app
    - Open http://localhost:3000 in your browser.

- Deploy to Vercel

    - Connect your GitHub repo to Vercel.

    - Configure environment variables on Vercel dashboard.

    - Deploy.

---

## ⚙️ Workflow

- 📤 **Upload Documents**

        - Users can upload one or multiple legal documents (PDFs).

        - Each file is processed and stored in Pinecone for efficient retrieval.

- 💬 **Chat Interface**

        - After uploading, users enter a chat interface to ask any questions or request PDF summaries related to the uploaded documents.

        - The system leverages LangChain + LangGraph for intelligent retrieval and reasoning.

        - Memory is maintained, allowing the bot to reference past interactions for context-aware answers.

- 🔍 **Document Retrieval**

        - Pinecone is used to store embeddings of PDF chunks for fast similarity search.

        - The bot retrieves relevant sections of documents in real time to answer questions accurately.

- 🚪 **End Chat**

        - Clicking "End Chat" terminates the session.

## 🤝 Contributions
Pull requests and feature suggestions are welcome!
Feel free to fork the repo and submit your ideas.

## 📄 License
This project is licensed under the MIT License.
You are free to use, modify, and distribute it.

## 🌐 Live App
👉 [Try the QA Chatbot](https://lawbandit-question-answering-chatbo.vercel.app/)

## 👤 Creator
Madhumitha Somasundaram  
Aspiring Data Scientist | AI & NLP Enthusiast | Full-stack Developer

🔗 [LinkedIn](www.linkedin.com/in/madhumitha-somasundaram)
