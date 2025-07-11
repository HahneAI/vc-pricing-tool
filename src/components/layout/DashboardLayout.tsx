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
    <div className="h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header title={title} />
        
        {/* Main content area - uses remaining height without creating page scroll */}
        <main className="flex-1 p-4 md:p-6 overflow-hidden">
          <div className="h-full">
            {children}
          </div>
        </main>
        
        <footer className="py-2 px-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <p>© {new Date().getFullYear()} FieldSync. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;