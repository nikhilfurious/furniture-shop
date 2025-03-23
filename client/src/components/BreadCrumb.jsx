import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.nav 
      className="bg-white shadow-sm"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[30px] flex items-center">
        <div className="flex items-center h-12 space-x-2 text-sm">
          <motion.div variants={itemVariants}>
            <Link 
              to="/" 
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Home className="w-4 h-4" />
            </Link>
          </motion.div>

          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;

            // Format the breadcrumb text
            const formattedName = decodeURIComponent(name)
                    .replace(/-/g, ' ')
                    .replace(/\b\w/g, (char) => char.toUpperCase());

            return (
              <React.Fragment key={name}>
                <motion.div 
                  variants={itemVariants}
                  className="flex items-center text-gray-400"
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>

                <motion.div variants={itemVariants}>
                  {isLast ? (
                    <span className="text-blue-600 font-medium">
                      {formattedName}
                    </span>
                  ) : (
                    <Link
                      to={routeTo}
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {formattedName}
                    </Link>
                  )}
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};

export default Breadcrumb;