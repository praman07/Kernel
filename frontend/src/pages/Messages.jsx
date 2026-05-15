import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, User as UserIcon, Terminal, Trash2, ArrowLeft, Menu, X } from 'lucide-react';
import moment from 'moment';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export default function Messages() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const socket = useRef(null);
  const messagesEndRef = useRef(null);
  const activeChatRef = useRef(null);

  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user) return;

    socket.current = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true
    });
    
    socket.current.on('connect', () => {
      socket.current.emit('register', user._id);
    });

    socket.current.on('receive_message', (msg) => {
      const active = activeChatRef.current;
      const senderId = (msg.sender?._id || msg.sender)?.toString();
      const activeId = active?._id?.toString();
      
      if (activeId && senderId === activeId) {
        setMessages(prev => [...prev, msg]);
        api.get(`/messages/${activeId}`).catch(() => {});
      }
      fetchConversations();
    });

    socket.current.on('message_sent', (msg) => {
      const active = activeChatRef.current;
      const receiverId = (msg.receiver?._id || msg.receiver)?.toString();
      const activeId = active?._id?.toString();
      
      if (activeId && receiverId === activeId) {
        setMessages(prev => [...prev, msg]);
      }
      fetchConversations();
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [user?._id]);

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

  const deleteConversation = async (userId) => {
    if (!window.confirm('Delete this conversation permanently?')) return;
    try {
      await api.delete(`/messages/${userId}`);
      setMessages([]);
      setActiveChat(null);
      fetchConversations();
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
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-kernel-950 font-mono relative">
      {/* Sidebar - Hidden when chat is active */}
      <div 
        className={`bg-kernel-950 border-r border-kernel-800 flex flex-col transition-all duration-300 ease-in-out
          ${activeChat ? 'hidden' : 'flex w-full'} 
        `}
      >
        <div className="p-4 border-b border-kernel-800 bg-kernel-900 flex justify-between items-center whitespace-nowrap overflow-hidden">
          <h2 className="text-sm font-bold text-kernel-100 flex items-center gap-2">
            <Terminal size={14} /> CHAT_DAEMON
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto whitespace-nowrap">
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
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
              )}
              <div className="flex gap-3">
                {conv.user.profilePicture ? (
                  <img src={conv.user.profilePicture} alt="" className="w-10 h-10 border border-kernel-700 object-cover" />
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

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col ${!activeChat ? 'hidden' : 'flex'}`}>
        {activeChat && (
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-kernel-950/50">
            {/* Chat Header */}
            <div className="p-4 border-b border-kernel-800 bg-kernel-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Back Button: cd.. */}
                <button 
                  onClick={() => setActiveChat(null)} 
                  className="px-2 py-1 bg-kernel-800 border border-kernel-700 text-kernel-400 hover:text-blue-400 font-mono text-xs transition-colors rounded-sm"
                >
                  cd ..
                </button>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-kernel-100">@{activeChat.name.toLowerCase().replace(/\s+/g, '_')}</span>
                  <span className="text-[10px] text-kernel-600 uppercase font-mono">active_session</span>
                </div>
              </div>
               <button 
                 onClick={() => deleteConversation(activeChat._id)}
                 className="text-kernel-600 hover:text-red-500 transition-colors p-1"
                 title="Delete Conversation"
               >
                 <Trash2 size={16} />
               </button>
            </div>
            
            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => {
                const isMine = (msg.sender === user._id || msg.sender?._id === user._id);
                return (
                  <div key={i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] md:max-w-[70%] p-3 border ${isMine ? 'bg-blue-900/20 border-blue-800 text-blue-100' : 'bg-kernel-900 border-kernel-800 text-kernel-200'}`}>
                      <p className="text-xs leading-relaxed break-words">{msg.text}</p>
                      <span className="text-[9px] text-kernel-600 mt-1 block text-right">
                        {moment(msg.createdAt).format('HH:mm')}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 border-t border-kernel-800 bg-kernel-900">
              <div className="flex gap-3 bg-kernel-950 border border-kernel-800 focus-within:border-blue-500 transition-colors p-1 pr-2">
                <input
                  type="text"
                  placeholder="Type message..."
                  className="flex-1 bg-transparent p-2 text-xs text-kernel-100 font-mono focus:outline-none"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button type="submit" className="p-1.5 text-blue-500 hover:text-blue-400 transition-colors">
                  <Send size={20} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
