import React, { useState } from 'react';
import './App.css';
import "@fontsource/poppins";

interface Reply {
  replyId: number;
  content: string;
  author: string;
  timestamp: Date;
}

interface Thread {
  threadId: number;
  content: string;
  author: string;
  replies: Reply[];
  isOpen: boolean;
  timestamp: Date;
}

const AppLocal: React.FC = () => {
  const [currentPost, setCurrentPost] = useState<string>('');
  const [currentReplies, setCurrentReplies] = useState<{ [key: number]: string }>({});
  const [author, setAuthor] = useState<string>('');
  const [threads, setThreads] = useState<Thread[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handlePostSubmit = () => {
    if (currentPost.trim()) {
      const newThread = { 
        threadId: Date.now(), 
        content: `${currentPost}`,
        replies: [],
        author: author || 'Ghost',
        isOpen: true,
        timestamp: new Date()
      };
      setThreads(prevThreads => [newThread, ...prevThreads]);
      setCurrentPost('');
    }
  };

  const handleReplySubmit = (threadId: number) => {
    const threadReply = currentReplies[threadId] || '';
    if (threadReply.trim()) {
      const newReply = {
        replyId: Date.now(), 
        content: `${threadReply}`,
        author: author || 'Ghost', 
        timestamp: new Date()
      };
      setThreads(prevThreads => {
        return prevThreads.map(thread =>
          thread.threadId === threadId
            ? { ...thread, replies: [...thread.replies, newReply] }
            : thread
        );
      });
      const newReplies = { ...currentReplies };
      newReplies[threadId] = ''; 
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

<h1 
    className="heading-home"
    onClick={() => window.location.href = '/'}
>
    Ghost Chat
</h1>

    <div className="post-container">
    <input 
  type="text" 
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search whispers, echos and ghosts..."
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
      <button onClick={handlePostSubmit}>Post</button>
    </div>

    {threads
     .filter(thread => {
      if (!searchQuery) return true;
      const isThreadContentMatch = thread.content.toLowerCase().includes(searchQuery.toLowerCase());
      const isReplyMatch = thread.replies.some(reply => reply.content.toLowerCase().includes(searchQuery.toLowerCase()));
      const isThreadAuthortMatch = thread.author.toLowerCase().includes(searchQuery.toLowerCase());
      const isThreadIdMatch = thread.threadId.toString().includes(searchQuery);
      return isThreadContentMatch || isReplyMatch || isThreadIdMatch || isThreadAuthortMatch;
    })
    .map(thread => (
      <div className="thread" key={thread.threadId}>
<div onClick={() => toggleThread(thread.threadId)} style={{ cursor: 'pointer' }}>
{thread.author}: {thread.content}
        <br />
        <span className="timestamp"> 

          {thread.timestamp ? new Date(thread.timestamp).toLocaleString() : ''}
        </span>
      </div>
      
      {thread.isOpen && (
        <>
          {thread.replies.map(reply => (
            <p key={reply.replyId} className="reply">{reply.author}: {reply.content}
            <br />
            <span className="timestamp"> 
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

export default AppLocal;
