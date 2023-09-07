import React, { useState, useEffect } from "react";
import "./App.css";
import "@fontsource/poppins";

interface Thread {
  threadId: number;
  content: string;
  author: string;
  replies: Reply[];
  isOpen: boolean;
  timestamp: Date;
}
interface Reply {
  replyId: number;
  content: string;
  author: string;
  timestamp: Date;
}

const App: React.FC = () => {
  const [currentPost, setCurrentPost] = useState<string>("");
  const [currentReplies, setCurrentReplies] = useState<{
    [key: number]: string;
  }>({});
  const [author, setAuthor] = useState<string>("");
  const [threads, setThreads] = useState<Thread[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const pathParts = window.location.pathname.split("/");
  const threadIdFromURL = pathParts[pathParts.length - 1];
  const [searchQuery, setSearchQuery] = useState(threadIdFromURL);

  useEffect(() => {
    const wsInstance = new WebSocket(import.meta.env.VITE_APP_WEBSOCKET_URL);

    wsInstance.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    wsInstance.onclose = (event) => {
      console.log("WebSocket Closed:", event);
    };

    wsInstance.onopen = () => {
      wsInstance.send(JSON.stringify({ action: "ghostchat-list-all" }));
      console.log("WebSocket connected!");
    };

    wsInstance.onmessage = (event) => {
      const response = JSON.parse(event.data);

      if (response.action === "ghostchat-list-all") {
        const updatedThreads = response.threads.map((thread: Thread) => {
          if (thread.threadId.toString() === threadIdFromURL) {
            thread.isOpen = true;
          }
          return thread;
        });
        setThreads(updatedThreads);
      }

      // Live thread
      else if (response.threadId && response.content) {
        const newThread = {
          threadId: response.threadId,
          content: response.content,
          author: response.author,
          replies: [],
          isOpen: true,
          timestamp: new Date(response.timestamp),
        };
        setThreads((prevThreads) => {
          const filteredThreads = prevThreads.filter(
            (thread) => thread.threadId !== newThread.threadId
          );
          return [newThread, ...filteredThreads];
        });
      }

      // Live reply
      else if (
        response.action === "new_reply" &&
        response.reply &&
        response.reply.replyId &&
        response.reply.content
      ) {
        const newReply = {
          replyId: response.reply.replyId,
          content: response.reply.content,
          author: response.reply.author,
          timestamp: new Date(response.reply.timestamp),
        };
        setThreads((prevThreads) => {
          return prevThreads.map((thread) =>
            thread.threadId === response.threadId
              ? { ...thread, replies: [...thread.replies, newReply] }
              : thread
          );
        });
      }
    };

    setWs(wsInstance);

    return () => {
      if (wsInstance.readyState === WebSocket.OPEN) {
        wsInstance.close();
      }
    };
  }, []);

  const handlePostSubmit = () => {
    if (currentPost.trim() && ws) {
      const newThread = {
        threadId: Date.now(),
        content: `${currentPost}`,
        replies: [],
        author: author || "Ghost",
        isOpen: true,
        timestamp: new Date(),
      };
      setThreads((prevThreads) => [newThread, ...prevThreads]);
      ws.send(
        JSON.stringify({ action: "ghostchat-new-thread", data: newThread })
      );
      setCurrentPost("");
    }
  };

  const handleReplySubmit = (threadId: number) => {
    const threadReply = currentReplies[threadId] || "";

    if (threadReply.trim() && ws) {
      const newReply = {
        replyId: Date.now(),
        content: `${threadReply}`,
        author: author || "Ghost",
        timestamp: new Date(),
      };

      setThreads((prevThreads) => {
        return prevThreads.map((thread) =>
          thread.threadId === threadId
            ? {
                ...thread,
                replies: [...thread.replies, newReply],
              }
            : thread
        );
      });
      const newReplies = { ...currentReplies };
      newReplies[threadId] = "";
      ws.send(
        JSON.stringify({
          action: "ghostchat-add-reply-to-thread",
          threadId: threadId,
          data: newReply,
        })
      );
      setCurrentReplies(newReplies);
    }
  };

  const toggleThread = (threadId: number) => {
    setThreads((prevThreads) =>
      prevThreads.map((thread) =>
        thread.threadId === threadId
          ? { ...thread, isOpen: !thread.isOpen }
          : thread
      )
    );
  };

  return (
    <div className="container">
      <h1 className="heading-home" onClick={() => (window.location.href = "/")}>
        Ghost Chat
      </h1>

      <div className="post-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search whispers, echoes and ghosts..."
          className="search-input"
        />

        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Name (Ghost if left blank)"
        />
        <textarea
          value={currentPost}
          onChange={(e) => setCurrentPost(e.target.value)}
          placeholder="Start a new whisper..."
        />
        <button onClick={handlePostSubmit}>Whisper</button>
      </div>

      {threads
        .filter((thread) => {
          if (!searchQuery) return true;
          const isThreadContentMatch = thread.content
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const isReplyMatch = thread.replies.some((reply) =>
            reply.content.toLowerCase().includes(searchQuery.toLowerCase())
          );
          const isThreadAuthortMatch = thread.author
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const isThreadIdMatch = thread.threadId
            .toString()
            .includes(searchQuery);
          return (
            isThreadContentMatch ||
            isReplyMatch ||
            isThreadIdMatch ||
            isThreadAuthortMatch
          );
        })
        .map((thread) => (
          <div className="thread" key={thread.threadId}>
            <div
              onClick={() => toggleThread(thread.threadId)}
              style={{ cursor: "pointer" }}
            >
              {thread.author}: {thread.content}
              <br />
              <span className="timestamp">
                {new Date(thread.timestamp).toLocaleString()}
              </span>
            </div>

            {thread.isOpen && (
              <>
                {thread.replies.map((reply) => (
                  <p key={reply.replyId} className="reply">
                    {reply.author}: {reply.content}
                    <br />
                    <span className="timestamp">
                      {new Date(reply.timestamp).toLocaleString()}
                    </span>
                  </p>
                ))}
                <div className="reply-container">
                  <textarea
                    value={currentReplies[thread.threadId] || ""}
                    onChange={(e) =>
                      setCurrentReplies({
                        ...currentReplies,
                        [thread.threadId]: e.target.value,
                      })
                    }
                    placeholder="Echo to this whisper..."
                  />
                  <button onClick={() => handleReplySubmit(thread.threadId)}>
                    Echo
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
    </div>
  );
};

export default App;
