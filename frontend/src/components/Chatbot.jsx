import { useState } from 'react';
import api from '../services/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hi! I am your FlavorNest assistant. Ask me about the menu, recommendations, or delivery hours.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = { sender: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chatbot/message', { message: trimmed });
      setMessages((prev) => [...prev, { sender: 'bot', text: response.data.reply || 'I am here to help.' }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, I could not respond right now. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = async (text) => {
    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setLoading(true);

    try {
      const response = await api.post('/chatbot/message', { message: text });
      setMessages((prev) => [...prev, { sender: 'bot', text: response.data.reply || 'I am here to help.' }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'bot', text: 'Sorry, I could not respond right now. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="chatbot-fab" onClick={() => setIsOpen(!isOpen)} aria-label="Open chatbot">
        <i className="bi bi-chat-dots" />
      </button>

      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <strong>FlavorNest Assistant</strong>
            <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
          </div>

          <div className="chatbot-body">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {loading && <div className="chat-message bot typing">Typing...</div>}
          </div>

          <div className="quick-replies">
            {['Show menu', 'Popular dishes', 'Opening hours'].map((item) => (
              <button key={item} onClick={() => handleQuickReply(item)}>{item}</button>
            ))}
          </div>

          <div className="chatbot-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
