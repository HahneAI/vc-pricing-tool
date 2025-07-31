import { Bot, User } from 'lucide-react';

interface AvatarProps {
  sender: 'user' | 'ai';
}

const Avatar = ({ sender }: AvatarProps) => {
  if (sender === 'ai') {
    return (
      <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-enterprise-gray dark:bg-gray-600 text-white shadow-md">
        <Bot className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-enterprise-blue-light dark:bg-enterprise-blue text-white font-bold shadow-md">
      <User className="w-6 h-6" />
    </div>
  );
};

export default Avatar;
