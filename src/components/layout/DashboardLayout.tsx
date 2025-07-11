import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../../context/ThemeContext';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Sidebar - responsive */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen md:ml-0">
        <Header title={title} />
        
        {/* Main content - restored normal behavior */}
        <main className="flex-1 p-2 md:p-6">
          {children}
        </main>
        
        {/* Footer - compact on mobile */}
        <footer className="py-2 px-4 text-center text-xs md:text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <p>© {new Date().getFullYear()} TradeSphere. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;