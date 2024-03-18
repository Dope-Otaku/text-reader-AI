from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, Body, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
from PyPDF2 import PdfReader
from langchain.text_splitter import CharacterTextSplitter, RecursiveCharacterTextSplitter
from langchain_community.embeddings import OpenAIEmbeddings, HuggingFaceInstructEmbeddings, SentenceTransformerEmbeddings
from InstructorEmbedding import INSTRUCTOR 
from langchain_community.vectorstores import FAISS
from fastapi.responses import JSONResponse
from langchain_community.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
import pymongo
from langchain.llms import HuggingFaceHub
import json

# Load environment variables from .env file (if any)
load_dotenv()


origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3000"
]

UPLOAD_DIR = Path("./uploads") 

app = FastAPI()
app.vectorstore = None
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_pdf_text(pdf_docs):
    text = ""
    for pdf in pdf_docs:
        pdf_reader = PdfReader(pdf.file)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    chunks = text_splitter.split_text(text)
    return chunks

def get_vectorstore(chunks):
    embeddings = SentenceTransformerEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectorstore = FAISS.from_texts(chunks, embeddings)
    print(vectorstore)
    return vectorstore

def get_conversation_chain(vectorstore):
    # llm = ChatOpenAI()
    llm = HuggingFaceHub(repo_id="google/flan-t5-xl", model_kwargs={"temperature":0.5, "max_length": 512})
    memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)
    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(),
        memory=memory,
    )
    return conversation_chain


@app.post("/uploadfile/")
async def upload_pdf(file_upload: UploadFile, background_tasks: BackgroundTasks):
    try:
        # Save the uploaded file
        data = await file_upload.read()
        save_to = UPLOAD_DIR / file_upload.filename
        with open(save_to, "wb") as f:
            f.write(data)
        
        # Read the text from the uploaded PDF file
        pdf_text = get_pdf_text([file_upload])
        
        # Get text chunks
        text_chunks = get_text_chunks(pdf_text)
        
        # Process vectorstore in the background
        background_tasks.add_task(process_vectorstore, text_chunks)
        
        return {
            "filename": file_upload.filename,
            "text_chunks": text_chunks
        }
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

async def process_vectorstore(text_chunks):
    try:
        # Create vector store
        vectorstore = get_vectorstore(text_chunks)
        
        # Option 1: Store in global variable
        app.vectorstore = vectorstore

    except Exception as e:
        print(f"Error processing vectorstore: {e}")

def get_conversation_chain(vectorstore):
    llm = ChatOpenAI()
    memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)
    conversation_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=vectorstore.as_retriever(),
        memory=memory,
    )
    return conversation_chain

@app.post("/ask_question/")
async def ask_question(request_body: dict = Body(...)):
    user_question = request_body.get("user_question")
    response = handle_userinput(user_question)
    return {"response": response}

def handle_userinput(user_question):
    if app.vectorstore is None:
        return "Vectorstore not initialized. Please upload a file first."

    # Embed the user question
    question_embeddings = SentenceTransformerEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    query_embedding = question_embeddings.embed_query(user_question)

    if not hasattr(handle_userinput, "conversation_chain"):
        # Initialize the conversation chain only once
        handle_userinput.conversation_chain = get_conversation_chain(app.vectorstore)

    response = handle_userinput.conversation_chain({"question": user_question})
    response_message = response['chat_history'][-1].content
    return response_message