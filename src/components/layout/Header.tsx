import { Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-20">
      <div className="px-4 py-3 md:py-4">
        <div className="flex justify-between items-center">
          {/* Title - responsive sizing */}
          <div className="flex-1 min-w-0 ml-12 md:ml-0">
            <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {title}
            </h1>
          </div>
          
          {/* Action buttons - touch-friendly */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button 
              className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative touch-manipulation transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500"></span>
            </button>
            
            {/* Theme Toggle */}
            <button 
              className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;