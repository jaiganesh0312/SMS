
import { Link } from 'react-router-dom';
import { Icon } from "@iconify/react";
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated } = useAuth();

  const links = [
    { name: 'About', to: '/about', icon: 'mdi:information' },
    { name: 'Home', to: '/', icon: 'mdi:home' },
  ];

  const resources = [
    { name: 'Privacy Policy', to: '/privacy', icon: 'mdi:shield-lock' },
    { name: 'Terms of Service', to: '/terms', icon: 'mdi:file-certificate' },
  ];

  const social = [
    { icon: 'mdi:linkedin', href: '#', label: 'LinkedIn' },
    { icon: 'mdi:twitter', href: '#', label: 'Twitter' },
    { icon: 'mdi:facebook', href: '#', label: 'Facebook' },
    { icon: 'mdi:instagram', href: '#', label: 'Instagram' },
  ];

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:check-circle-outline" className="text-2xl text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white">School Management System</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Education Management</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Comprehensive school management platform for streamlining administration, academics, and learning.
            </p>
            <div className="flex gap-3">
              {social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon icon={item.icon} className="text-xl" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                  >
                    <Icon icon={link.icon} className="text-base group-hover:scale-110 transition-transform" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <Link
                    to={resource.to}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                  >
                    <Icon icon={resource.icon} className="text-base group-hover:scale-110 transition-transform" />
                    {resource.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Get in Touch</h4>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <Icon icon="mdi:email" className="text-lg mt-0.5 flex-shrink-0" />
                <span>support@schoolms.com</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <Icon icon="mdi:phone" className="text-lg mt-0.5 flex-shrink-0" />
                <span>+1 (800) SMS-HELP</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <Icon icon="mdi:map-marker" className="text-lg mt-0.5 flex-shrink-0" />
                <span>123 Learning Street, Education City</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-left">
              &copy; {currentYear} School Management System. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <Link to="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Privacy
              </Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Terms
              </Link>
              <span>•</span>
              <Link to="/cookies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
