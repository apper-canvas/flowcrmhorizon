import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routes } from '@/config/routes';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    routes.dashboard,
    routes.contacts,
    routes.companies,
    routes.leads,
    routes.tasks
  ];

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-surface-200 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <ApperIcon name="Zap" className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-surface-900">FlowCRM</h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-surface-100 transition-colors"
        >
          <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} className="w-6 h-6" />
        </button>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-surface-200 flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-surface-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <ApperIcon name="Zap" className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-surface-900">FlowCRM</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 border border-primary-200'
                      : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'
                  }`
                }
              >
                <ApperIcon name={item.icon} className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-surface-200">
            <div className="flex items-center space-x-3 p-3 rounded-xl hover:bg-surface-50 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-accent-400 to-accent-600 rounded-full flex items-center justify-center">
                <ApperIcon name="User" className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 truncate">John Doe</p>
                <p className="text-xs text-surface-500 truncate">john@company.com</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 bg-black/50 z-40"
                onClick={closeMobileMenu}
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 flex flex-col"
              >
                {/* Mobile Logo */}
                <div className="p-6 border-b border-surface-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                      <ApperIcon name="Zap" className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-semibold text-surface-900">FlowCRM</h1>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                  {navigationItems.map((item) => (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      onClick={closeMobileMenu}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-primary-50 to-secondary-50 text-primary-700 border border-primary-200'
                            : 'text-surface-600 hover:text-surface-900 hover:bg-surface-50'
                        }`
                      }
                    >
                      <ApperIcon name={item.icon} className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-surface-50">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;