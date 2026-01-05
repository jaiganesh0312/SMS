
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
    <footer className="bg-primary-800 dark:bg-primary-900 text-white mt-auto relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <circle cx="30" cy="30" r="2" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-pattern)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Icon icon="mdi:school" className="text-2xl text-primary-900" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">School Management</span>
                <span className="text-xs text-primary-300 tracking-wider uppercase">Education Excellence</span>
              </div>
            </div>
            <p className="text-sm text-primary-200 mb-6 leading-relaxed">
              Comprehensive school management platform for streamlining administration, academics, and learning outcomes.
            </p>
            <div className="flex gap-3">
              {social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="w-10 h-10 rounded-xl bg-primary-700/50 hover:bg-secondary-500 flex items-center justify-center text-primary-300 hover:text-primary-900 transition-all duration-300 hover:scale-110"
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
            <h4 className="font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-secondary-500 rounded-full"></span>
              Quick Links
            </h4>
            <ul className="space-y-4">
              {links.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.to}
                    className="flex items-center gap-3 text-sm text-primary-200 hover:text-secondary-400 transition-colors group"
                  >
                    <Icon icon={link.icon} className="text-base text-primary-400 group-hover:text-secondary-400 group-hover:scale-110 transition-all" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-secondary-500 rounded-full"></span>
              Resources
            </h4>
            <ul className="space-y-4">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <Link
                    to={resource.to}
                    className="flex items-center gap-3 text-sm text-primary-200 hover:text-secondary-400 transition-colors group"
                  >
                    <Icon icon={resource.icon} className="text-base text-primary-400 group-hover:text-secondary-400 group-hover:scale-110 transition-all" />
                    {resource.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-secondary-500 rounded-full"></span>
              Get in Touch
            </h4>
            <div className="space-y-4">
              <a href="mailto:support@schoolms.com" className="flex items-start gap-3 text-sm text-primary-200 hover:text-secondary-400 transition-colors group">
                <div className="w-8 h-8 bg-primary-700/50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-secondary-500/20 transition-colors">
                  <Icon icon="mdi:email" className="text-lg text-secondary-400" />
                </div>
                <span className="mt-1">support@schoolms.com</span>
              </a>
              <a href="tel:+18007677435" className="flex items-start gap-3 text-sm text-primary-200 hover:text-secondary-400 transition-colors group">
                <div className="w-8 h-8 bg-primary-700/50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-secondary-500/20 transition-colors">
                  <Icon icon="mdi:phone" className="text-lg text-secondary-400" />
                </div>
                <span className="mt-1">+1 (800) SMS-HELP</span>
              </a>
              <div className="flex items-start gap-3 text-sm text-primary-200">
                <div className="w-8 h-8 bg-primary-700/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon icon="mdi:map-marker" className="text-lg text-secondary-400" />
                </div>
                <span className="mt-1">123 Learning Street, Education City</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-primary-300 text-center md:text-left">
              &copy; {currentYear} School Management System. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/privacy" className="text-primary-300 hover:text-secondary-400 transition-colors">
                Privacy
              </Link>
              <span className="text-primary-600">•</span>
              <Link to="/terms" className="text-primary-300 hover:text-secondary-400 transition-colors">
                Terms
              </Link>
              <span className="text-primary-600">•</span>
              <Link to="/cookies" className="text-primary-300 hover:text-secondary-400 transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
