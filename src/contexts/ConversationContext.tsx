import React, { createContext, useContext, useState } from 'react';
import { ConversationMessage } from '../types';

interface ConversationContextType {
  messages: ConversationMessage[];
  addMessage: (sender: 'speaker' | 'user', text: string, method: 'speech' | 'typing' | 'sign', senderName?: string) => void;
  clearMessages: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

const INITIAL_DEMO_MESSAGES: ConversationMessage[] = [
  {
    id: 'msg-1',
    sender: 'speaker',
    senderName: 'Receptionist (Speaking)',
    method: 'speech',
    text: 'Good afternoon! Your appointment with Dr. Ramanathan is scheduled at 3:00 PM.',
    timestamp: Date.now() - 120000
  },
  {
    id: 'msg-2',
    sender: 'user',
    senderName: 'You (Typing / Sign)',
    method: 'typing',
    text: 'Thank you. Do I need to wait in Room 2B or at the main desk?',
    timestamp: Date.now() - 60000
  },
  {
    id: 'msg-3',
    sender: 'speaker',
    senderName: 'Receptionist (Speaking)',
    method: 'speech',
    text: 'Please wait directly in front of Room 2B. They will call your token number on the display screen.',
    timestamp: Date.now() - 20000
  }
];

export const ConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ConversationMessage[]>(INITIAL_DEMO_MESSAGES);

  const addMessage = (sender: 'speaker' | 'user', text: string, method: 'speech' | 'typing' | 'sign', senderName?: string) => {
    if (!text.trim()) return;

    const newMessage: ConversationMessage = {
      id: 'msg-' + Date.now(),
      sender,
      senderName: senderName || (sender === 'speaker' ? 'Speaker' : 'You'),
      method,
      text: text.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return (
    <ConversationContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within a ConversationProvider');
  }
  return context;
};
