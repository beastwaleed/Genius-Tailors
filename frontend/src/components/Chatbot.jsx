import React, { useState, useRef, useEffect } from 'react';
import api from '../api';
import ReactMarkdown from 'react-markdown';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi there! I am the Genius Tailors AI Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const { data } = await api.post('/api/chat', { message: userMessage });
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', text: error.response?.data?.reply || 'Sorry, I am having trouble connecting to the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        className="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#C9A96E',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 10px 25px rgba(201, 169, 110, 0.4)',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'transform 0.2s',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)'
        }}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        )}
      </div>

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '24px',
          width: '350px',
          height: '500px',
          maxWidth: 'calc(100vw - 48px)',
          maxHeight: 'calc(100vh - 120px)',
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1A1A1A, #2C3E50)',
            color: 'white',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4ade80' }}></div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontFamily: 'var(--font-serif)' }}>Genius AI Support</h3>
          </div>

          <div style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: '#f8fafc'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                borderBottomRightRadius: msg.sender === 'user' ? '0' : '1rem',
                borderBottomLeftRadius: msg.sender === 'bot' ? '0' : '1rem',
                backgroundColor: msg.sender === 'user' ? '#1A1A1A' : 'white',
                color: msg.sender === 'user' ? 'white' : '#1e293b',
                boxShadow: msg.sender === 'bot' ? '0 2px 5px rgba(0,0,0,0.05)' : 'none',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                wordBreak: 'break-word'
              }}>
                {msg.sender === 'bot' ? (
                  <div className="markdown-body">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            {loading && (
              <div style={{
                alignSelf: 'flex-start',
                padding: '0.75rem 1rem',
                borderRadius: '1rem',
                borderBottomLeftRadius: '0',
                backgroundColor: 'white',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                display: 'flex',
                gap: '4px'
              }}>
                <span className="typing-dot">.</span><span className="typing-dot" style={{animationDelay: '0.2s'}}>.</span><span className="typing-dot" style={{animationDelay: '0.4s'}}>.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{
            padding: '1rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            gap: '0.5rem',
            backgroundColor: 'white'
          }}>
            <input 
              type="text" 
              placeholder="Type your question..."
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '2rem',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: '#C9A96E',
                color: 'white',
                border: 'none',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer',
                opacity: (loading || !input.trim()) ? 0.6 : 1
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </form>
        </div>
      )}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes typing {
          0%, 100% { opacity: 0.2; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-2px); }
        }
        .typing-dot {
          display: inline-block;
          animation: typing 1s infinite;
          font-weight: bold;
          font-size: 1.2rem;
          color: #94a3b8;
        }

        .markdown-body p { margin: 0 0 0.5rem 0; line-height: 1.6; }
        .markdown-body p:last-child { margin-bottom: 0; }
        .markdown-body strong { color: #111827; font-weight: 600; }
        .markdown-body ul, .markdown-body ol { margin: 0.5rem 0 0.5rem 1rem; padding-left: 0.5rem; }
        .markdown-body li { margin-bottom: 0.25rem; line-height: 1.5; }
        .markdown-body a { color: #C9A96E; text-decoration: none; font-weight: 500; }
        .markdown-body a:hover { text-decoration: underline; }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { margin: 0.5rem 0; font-size: 1.05rem; }
      `}</style>
    </>
  );
}
