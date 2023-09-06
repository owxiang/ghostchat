import React, { useState, useEffect } from 'react';
import './App.css';
import "@fontsource/poppins";

interface Reply {
  replyId: number;
  content: string;
  userName: string;
  timestamp: Date;
}

interface Thread {
  threadId: number;
  title: string;
  userName: string;
  replies: Reply[];
  isOpen: boolean;
  timestamp: Date;
}

const App: React.FC = () => {
  const [currentPost, setCurrentPost] = useState<string>('');
  const [currentReplies, setCurrentReplies] = useState<{ [key: number]: string }>({});
  const [userName, setUserName] = useState<string>('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const wsInstance = new WebSocket(import.meta.env.VITE_APP_WEBSOCKET_URL);

    wsInstance.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };
    
    wsInstance.onclose = (event) => {
      console.log("WebSocket Closed:", event);
    };

    wsInstance.onopen = () => {
    console.log("WebSocket connected!");
      wsInstance.send(JSON.stringify({ action: 'ghostchat-list-all' }));

    };

    wsInstance.onmessage = (event) => {
      const response = JSON.parse(event.data);

      if (response.action === 'ghostchat-list-all') {
          setThreads(response.threads);
      } 
      
      else if (response.threadId && response.title) {
        const newThread = {
            threadId: response.threadId,
            title: response.title,
            userName: response.userName,
            replies: [],
            isOpen: true,
            timestamp: new Date(response.timestamp)
        };
        setThreads(prevThreads => {
    if (prevThreads.some(thread => thread.threadId === newThread.threadId)) {
                return [newThread, ...prevThreads];
            }
            return prevThreads;
        });
    }    
    
      else if (response.data && response.data.replyId && response.data.content) {
        const newReply = {
            replyId: response.data.replyId,
            content: response.data.content,
            userName: response.data.userName,
            timestamp: new Date(response.data.timestamp)
        };
        setThreads(prevThreads => {
            return prevThreads.map(thread =>
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
        title: `${userName || 'Ghost'}: ${currentPost}`,
        replies: [],
        userName: userName || 'Ghost',
        isOpen: true,
        timestamp: new Date()
      };
      setThreads(prevThreads => [newThread, ...prevThreads]);
      ws.send(JSON.stringify({ action: 'ghostchat-new-thread', data: newThread }));
      setCurrentPost('');
    }
  };

  const handleReplySubmit = (threadId: number) => {
    const threadReply = currentReplies[threadId] || '';

    if (threadReply.trim() && ws) {
      const newReply = {
        replyId: Date.now(), 
        content: `${userName || 'Ghost'}: ${threadReply}`,
        userName: userName || 'Ghost', 
        timestamp: new Date()
      };

      setThreads(prevThreads => {
        return prevThreads.map(thread =>
          thread.threadId === threadId
            ? {
                ...thread,
                replies: [...thread.replies, newReply],
              }
            : thread
        );
      });
      const newReplies = { ...currentReplies };
      newReplies[threadId] = ''; 
      ws.send(JSON.stringify({ action: 'ghostchat-add-reply-to-thread', threadId: threadId, data: newReply }));
      setCurrentReplies(newReplies);
    }
  };

  const toggleThread = (threadId: number) => {
    setThreads(prevThreads =>
      prevThreads.map(thread =>
        thread.threadId === threadId
          ? { ...thread, isOpen: !thread.isOpen }
          : thread
      )
    );
  };

return (
  <div className="container">

    <h1>Ghost Chat</h1>
    
    <div className="post-container">
    <input 
  type="text" 
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search whispers and echos..."
  className="search-input"
/>

      <input 
        type="text"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Name (Ghost if left blank)"
      />
      <textarea 
        value={currentPost}
        onChange={(e) => setCurrentPost(e.target.value)}
        placeholder="Start a new whisper..."
      />
      <button onClick={handlePostSubmit}>Post</button>
    </div>

    {threads
     .filter(thread => {
      if (!searchQuery) return true;
      const isThreadTitleMatch = thread.title.toLowerCase().includes(searchQuery.toLowerCase());
      const isReplyMatch = thread.replies.some(reply => reply.content.toLowerCase().includes(searchQuery.toLowerCase()));
      return isThreadTitleMatch || isReplyMatch;
    })
    .map(thread => (
      <div className="thread" key={thread.threadId}>
<div onClick={() => toggleThread(thread.threadId)} style={{ cursor: 'pointer' }}>
        {thread.title}
        <br />
        <span className="timestamp"> 
          {/* Safely handling potential undefined timestamp */}
          {thread.timestamp ? new Date(thread.timestamp).toLocaleString() : ''}
        </span>
      </div>
      
      {/* Only render replies and reply input if thread is open */}
      {thread.isOpen && (
        <>
          {thread.replies.map(reply => (
            <p key={reply.replyId} className="reply">{reply.content}
            <br />
            <span className="timestamp"> 
              {/* Safely handling potential undefined timestamp for replies */}
              {reply.timestamp ? new Date(reply.timestamp).toLocaleString() : ''}
            </span>
          </p>
          ))}
          <div className="reply-container">
            <textarea 
    value={currentReplies[thread.threadId] || ''}
    onChange={(e) => setCurrentReplies({ ...currentReplies, [thread.threadId]: e.target.value })}
              placeholder="Echo to this whisper..."
            />
            <button onClick={() => handleReplySubmit(thread.threadId)}>Reply</button>
          </div>
        </>
      )}
    </div>
    ))}
  </div>
);

}

export default App;
