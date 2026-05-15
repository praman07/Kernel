import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { Send, User as UserIcon, Terminal } from 'lucide-react';
import moment from 'moment';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function Messages() {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const activeChatRef = useRef(null); // Critical for real-time listener

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Initialize socket once
    socket.current = io(SOCKET_URL);
    
    if (user) {
      socket.current.emit('register', user._id);
    }

    socket.current.on('receive_message', (msg) => {
      const active = activeChatRef.current;
      // If we are currently chatting with the sender
      if (active && (msg.sender === active._id || msg.sender?._id === active._id)) {
        setMessages(prev => [...prev, msg]);
        // Also hit backend to mark this specific message as read
        api.get(`/messages/${active._id}`).catch(() => {});
      }
      fetchConversations();
    });

    socket.current.on('message_sent', (msg) => {
      const active = activeChatRef.current;
      if (active && (msg.receiver === active._id || msg.receiver?._id === active._id)) {
        setMessages(prev => [...prev, msg]);
      }
      fetchConversations();
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [user]); // Only re-run if user changes (e.g. login/logout)

  useEffect(() => {
    const initChat = async () => {
      await fetchConversations();
      if (userId) {
        try {
          const { data } = await api.get(`/users/${userId}`);
          setActiveChat(data);
        } catch (err) { console.error(err); }
      }
    };
    initChat();
  }, [userId]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/messages/conversations');
      setConversations(data);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async (userId) => {
    try {
      const { data } = await api.get(`/messages/${userId}`);
      setMessages(data);
    } catch (err) { console.error(err); }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    socket.current.emit('send_message', {
      sender: user._id,
      receiver: activeChat._id,
      text: newMessage
    });
    setNewMessage('');
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-kernel-950 font-mono">
      {/* Sidebar */}
      <div className="w-80 border-r border-kernel-800 flex flex-col">
        <div className="p-4 border-b border-kernel-800 bg-kernel-900">
          <h2 className="text-sm font-bold text-kernel-100 flex items-center gap-2">
            <Terminal size={14} /> CHAT_DAEMON
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? conversations.map((conv) => (
            <div
              key={conv.user._id}
              onClick={() => {
                setActiveChat(conv.user);
                setConversations(prev => prev.map(c => c.user._id === conv.user._id ? { ...c, isUnread: false } : c));
              }}
              className={`p-4 border-b border-kernel-800 cursor-pointer transition-colors relative ${activeChat?._id === conv.user._id ? 'bg-kernel-900 border-l-2 border-l-blue-500' : 'hover:bg-kernel-900/50'}`}
            >
              {conv.isUnread && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              )}
              <div className="flex gap-3">
                {conv.user.profilePicture ? (
                  <img src={conv.user.profilePicture} alt="" className="w-10 h-10 border border-kernel-700" />
                ) : (
                  <div className="w-10 h-10 bg-kernel-800 border border-kernel-700 flex items-center justify-center">
                    <UserIcon size={20} className="text-kernel-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs truncate ${conv.isUnread ? 'font-bold text-kernel-100' : 'text-kernel-300'}`}>{conv.user.name}</span>
                    <span className="text-[10px] text-kernel-600">{moment(conv.time).fromNow(true)}</span>
                  </div>
                  <p className={`text-[10px] truncate ${conv.isUnread ? 'text-kernel-100 font-medium' : 'text-kernel-500'}`}>{conv.lastMessage}</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="p-8 text-center text-kernel-600 text-[10px]">
              NO_ACTIVE_CONVERSATIONS
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-kernel-950/50 relative">
        {!activeChat ? (
          <div className="flex-1 flex items-center justify-center text-kernel-700 flex-col gap-4">
            <Terminal size={48} className="opacity-20" />
            <span className="text-xs tracking-widest animate-pulse">SELECT_TARGET_FOR_HANDSHAKE</span>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-kernel-800 bg-kernel-900 flex items-center gap-3">
               <span className="text-xs font-bold text-kernel-100">$ chatting_with --user @{activeChat.name.toLowerCase().replace(/\s+/g, '_')}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => {
                const isMine = (msg.sender === user._id || msg.sender?._id === user._id);
                return (
                  <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 border ${isMine ? 'bg-blue-900/20 border-blue-800 text-blue-100' : 'bg-kernel-900 border-kernel-800 text-kernel-200'}`}>
                      <p className="text-xs leading-relaxed">{msg.text}</p>
                      <span className="text-[9px] text-kernel-600 mt-1 block text-right">
                        {moment(msg.createdAt).format('HH:mm')}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 border-t border-kernel-800 bg-kernel-900">
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Type message..."
                  className="flex-1 bg-kernel-950 border border-kernel-800 p-2 text-xs text-kernel-100 font-mono focus:outline-none focus:border-blue-500"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="p-2 bg-blue-600 text-white hover:bg-blue-500 transition-colors">
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
