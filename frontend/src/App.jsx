import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import userIcon from "./assets/user.png";
import botIcon from "./assets/bot.jpeg";
import Loader from "./Loader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [userQuestion, setUserQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    if (file) {
      setShowWelcomeMessage(true);
      const timer = setTimeout(() => {
        setChatHistory([
          {
            type: "bot",
            message: "Hello! I'm ready to assist you with your questions.",
          },
        ]);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [file]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleInputFileChange = (event) => {
    const selectedFile = event.target.files[0];
    const error = "Invalid file type. Please select a PDF or DOCX file.";
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (selectedFile && allowedTypes.includes(selectedFile.type)) {
      console.log(selectedFile);
      setFile(selectedFile);
      setErrorMessage("");
    } else {
      console.log(error);
      setErrorMessage(error);
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file_upload", file);
    try {
      const response = await fetch("http://localhost:8000/uploadfile/", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        console.log("File uploaded successfully");
        console.log("text_chunks:", data.text_chunks);
        setIsLoading(false);
        toast.success("File uploaded successfully!");
      } else {
        console.log("Error uploading file");
        setIsLoading(false);
        toast.error("Error uploading file!");
      }
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      toast.error("Error uploading file!");
    }
  };

  const handleChat = async (event) => {
    event.preventDefault();
    try {
      setChatHistory([...chatHistory, { type: "user", message: userQuestion }]);
      setUserQuestion("");
      const response = await fetch("http://localhost:8000/ask_question/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_question: userQuestion }),
      });
      if (response.ok) {
        const data = await response.json();
        setChatHistory([
          ...chatHistory,
          { type: "user", message: userQuestion },
          { type: "bot", message: data.response },
        ]);
      } else {
        throw new Error("Error: " + response.status);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="app">
      <ToastContainer />
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>LLM Assistant</h2>
        </div>
        <div className="sidebar-footer">
          <form onSubmit={handleUpload} className="file-upload-form">
            <input
              type="file"
              onChange={handleInputFileChange}
              className="file-input"
            />
            <button type="submit" className="upload-button">
              {isLoading ? <Loader /> : "Upload"}
            </button>
          </form>
        </div>
      </div>
      <div className="main-content">
        {showWelcomeMessage && (
          <div className="welcome-message">
            <span className="typewriter">
              Hello! I'm ready to assist you with your questions.
            </span>
          </div>
        )}
        <div className="chat-history" ref={chatHistoryRef}>
          {chatHistory.map((message, index) => (
            <div
              key={index}
              className={`message ${message.type === "user" ? "user" : "bot"}`}
            >
              <img
                src={message.type === "user" ? userIcon : botIcon}
                alt={`${message.type} icon`}
                className="message-icon"
              />
              <div className="message-content">
                <p className="message-text">{message.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input-container">
          <form onSubmit={handleChat} className="chat-input-form">
            <input
              type="text"
              value={userQuestion}
              onChange={(event) => setUserQuestion(event.target.value)}
              placeholder="Ask a question..."
              className="chat-input"
            />
            <button type="submit" className="send-button">
              Send
            </button>
          </form>
        </div>
      </div>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
}

export default App;
