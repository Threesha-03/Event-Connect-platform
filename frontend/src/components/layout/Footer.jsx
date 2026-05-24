import { Link } from 'react-router-dom';
import { FiTwitter, FiInstagram, FiLinkedin, FiGithub, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { MdEventNote } from 'react-icons/md';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <MdEventNote className="text-white text-xl" />
              </div>
              <span className="text-xl font-bold text-white">EventFlow</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Discover, book, and experience amazing events near you. Your gateway to unforgettable moments.
            </p>
            <div className="flex gap-3">
              {[
                { icon: FiTwitter, href: '#', label: 'Twitter' },
                { icon: FiInstagram, href: '#', label: 'Instagram' },
                { icon: FiLinkedin, href: '#', label: 'LinkedIn' },
                { icon: FiGithub, href: '#', label: 'GitHub' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/events', label: 'Browse Events' },
                { to: '/events?category=Music', label: 'Music Events' },
                { to: '/events?category=Technology', label: 'Tech Events' },
                { to: '/events?category=Workshop', label: 'Workshops' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              {[
                { label: 'Help Center', href: '#' },
                { label: 'Contact Us', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Refund Policy', href: '#' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <FiMail className="text-primary-400 flex-shrink-0" />
                <span>support@eventflow.com</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <FiPhone className="text-primary-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <FiMapPin className="text-primary-400 flex-shrink-0 mt-0.5" />
                <span>123 Event Street, Mumbai, Maharashtra 400001</span>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-sm text-white font-medium mb-2">Subscribe to newsletter</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                />
                <button className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors font-medium">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {currentYear} EventFlow. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Built with ❤️ for event lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
