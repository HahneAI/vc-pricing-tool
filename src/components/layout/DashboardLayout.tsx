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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Sidebar - responsive */}
      <Sidebar />
      
      {/* Main content area - properly positioned relative to fixed sidebar */}
      <div className="md:ml-64 min-h-screen flex flex-col">
        <Header title={title} />
        
        {/* Main content - normal scrolling behavior */}
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="py-4 px-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
          <p>© {new Date().getFullYear()} TradeSphere. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;