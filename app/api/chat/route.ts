import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import Document from "@/models/Document";
import { ChatGroq } from "@langchain/groq";
import { StateGraph, END, MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

const rawKeys = process.env.GROQ_API_KEYS || "";
const groqApiKeys = rawKeys.split(/[\n,]+/).map(k => k.trim()).filter(k => k.length > 0);
let currentKeyIndex = 0;

async function callModel(state: typeof MessagesAnnotation.State) {
  const apiKey = groqApiKeys.length > 0 ? groqApiKeys[currentKeyIndex % groqApiKeys.length] : undefined;
  currentKeyIndex++;
  
  const model = new ChatGroq({
    apiKey: apiKey,
    model: "llama-3.3-70b-versatile",
  });

  const response = await model.invoke(state.messages);
  return { messages: [response] };
}

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", callModel)
  .addEdge("__start__", "agent")
  .addEdge("agent", END);

const app = workflow.compile();

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message, chatId } = await req.json();

    await dbConnect();
    let dbUser = await User.findOne({ clerkId: userId });
    
    if (!dbUser) {
      const clerkUser = await currentUser();
      dbUser = await User.create({
        clerkId: userId,
        email: clerkUser?.emailAddresses[0]?.emailAddress || "unknown",
        name: clerkUser?.fullName || clerkUser?.firstName || "Student",
        onboardingCompleted: false
      });
    }

    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
    } else {
      chat = await Chat.create({ userId: dbUser._id, title: message.substring(0, 30) + "..." });
    }

    // Save User message
    await Message.create({ chatId: chat._id, role: "user", content: message });

    // Get past messages
    const history = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 }).limit(10);
    
    // Get document context for RAG
    let context = "";
    const documents = await Document.find({ chatId: chat._id });
    if (documents.length > 0) {
      const totalLength = documents.reduce((acc, doc) => acc + doc.content.length, 0);
      if (totalLength < 50000) {
        context = documents.map(d => `--- DOCUMENT: ${d.name} ---\n${d.content}`).join("\n\n");
      } else {
        const searchTerms = message
          .toLowerCase()
          .replace(/[^\w\s]/g, "")
          .split(/\s+/)
          .filter((w: string) => w.length > 2);
          
        const allChunks: { text: string; score: number }[] = [];
        for (const doc of documents) {
          for (const chunk of doc.chunks || []) {
            let score = 0;
            const lowerChunk = chunk.toLowerCase();
            for (const term of searchTerms) {
              if (lowerChunk.includes(term)) score += 1;
            }
            if (score > 0) {
              allChunks.push({ text: `From ${doc.name}: ${chunk}`, score });
            }
          }
        }
        allChunks.sort((a, b) => b.score - a.score);
        const topChunks = allChunks.slice(0, 5).map(c => c.text);
        if (topChunks.length > 0) {
          context = topChunks.join("\n\n");
        } else {
          context = (documents[0].chunks || []).slice(0, 3).map(c => `From ${documents[0].name}: ${c}`).join("\n\n");
        }
      }
    }

    let systemInstruction = `You are EduVerse, a premium AI study agent and academic mentor. 
Your goal is to provide extremely clean, structured, and visually stunning explanations using Markdown and LaTeX.

Follow these strict formatting guidelines:
1. **Typography**: Use bolding, italics, and lists (bulleted/numbered) to make the text highly scannable and easy to read.
2. **Headings**: Organize explanations with logical headings. Avoid using # or ##. Use ### for main sections and #### for subsections.
3. **LaTeX Math Formulas**:
   - Wrap ALL inline math formulas in single dollar signs like $E = mc^2$.
   - Wrap ALL block/display math equations in double dollar signs like:
     $$
     f(x) = \int_{-\infty}^{\infty} e^{-x^2} dx
     $$
   - Ensure all symbols and variables in text are wrapped in math mode if they are mathematical (e.g. use $x$, not x).
4. **Code Blocks**: Always specify the programming language for syntax highlighting in code blocks (e.g., \`\`\`python).
5. **Tables & Comparisons**: Use Markdown tables for comparisons, feature lists, and structured data.
6. **Highlights**: Use blockquotes (>) for key takeaways or definitions.
7. **Tone**: Be encouraging, academic, yet accessible. The user's major is ${dbUser.major || 'Unknown'} and their study goals are ${dbUser.studyGoals || 'Unknown'}.

If document context is provided below, prioritize answering based on that context. Cite the document name where appropriate.`;

    if (context) {
      systemInstruction += `\n\n[DOCUMENT CONTEXT]\n${context}`;
    }

    const lcMessages = [
      new SystemMessage(systemInstruction),
      ...history.map((m) => 
        m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
      )
    ];

    // Run graph
    const result = await app.invoke({ messages: lcMessages });
    
    const aiResponse = result.messages[result.messages.length - 1].content as string;

    // Save AI message
    const aiMessageDb = await Message.create({ chatId: chat._id, role: "assistant", content: aiResponse });

    return NextResponse.json({ 
      message: aiMessageDb,
      chatId: chat._id
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
