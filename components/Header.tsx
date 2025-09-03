import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import TicketIcon from './icons/TicketIcon';
import MenuIcon from './icons/MenuIcon';
import XIcon from './icons/XIcon';
import { SiteConfig, User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import ChevronDownIcon from './icons/ChevronDownIcon';

interface HeaderProps {
  loggedInUser: User | null;
  handleLogout: () => void;
  siteConfig: SiteConfig;
}

const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const changeLanguage = (lang: 'en' | 'ar') => {
        setLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-200"
            >
                <span>{language === 'en' ? 'English' : 'العربية'}</span>
                <ChevronDownIcon className="w-4 h-4" />
            </button>
            {isOpen && (
                <div className="absolute end-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                        <button
                            onClick={() => changeLanguage('en')}
                            className="block w-full text-start px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            role="menuitem"
                        >
                            English
                        </button>
                        <button
                            onClick={() => changeLanguage('ar')}
                            className="block w-full text-start px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            role="menuitem"
                        >
                            العربية
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


const Header: React.FC<HeaderProps> = ({ loggedInUser, handleLogout, siteConfig }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onLogout = () => {
    handleLogout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const navLinkClasses = (path: string, isMobile: boolean = false) => {
    const baseClasses = isMobile 
      ? 'block px-3 py-2 rounded-md text-base font-medium'
      : 'px-3 py-2 rounded-md text-sm font-medium transition-colors';
    
    return `${baseClasses} ${
      location.pathname === path
        ? (isMobile ? 'bg-blue-700 text-white' : 'bg-blue-600 text-white')
        : 'text-slate-700 hover:bg-slate-200'
    }`;
  }
  
  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2" onClick={() => setIsMenuOpen(false)}>
              {siteConfig.logo ? (
                <img src={siteConfig.logo} alt={`${siteConfig.name} logo`} className="h-8 w-auto" />
              ) : (
                <TicketIcon className="h-8 w-8 text-blue-600"/>
              )}
              <span className="font-bold text-xl text-slate-800">{siteConfig.name}</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="ms-10 flex items-baseline space-x-4">
              <Link to="/" className={navLinkClasses('/')}>
                {t('faqs')}
              </Link>
              <Link to="/check-ticket" className={navLinkClasses('/check-ticket')}>
                {t('check_ticket')}
              </Link>
              {loggedInUser ? (
                <>
                  <Link to="/admin" className={navLinkClasses('/admin')}>
                    {t('dashboard')}
                  </Link>
                  <button onClick={onLogout} className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-200">
                    {t('logout')}
                  </button>
                </>
              ) : (
                 <Link to="/login" className={navLinkClasses('/login')}>
                  {t('admin_login')}
                </Link>
              )}
              <LanguageSwitcher />
            </div>
          </div>
          <div className="-me-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              type="button"
              className="bg-slate-100 inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-800 hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-200 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden border-t border-slate-200`} id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" className={navLinkClasses('/', true)} onClick={() => setIsMenuOpen(false)}>{t('faqs')}</Link>
          <Link to="/check-ticket" className={navLinkClasses('/check-ticket', true)} onClick={() => setIsMenuOpen(false)}>{t('check_ticket')}</Link>
           {loggedInUser ? (
            <>
              <Link to="/admin" className={navLinkClasses('/admin', true)} onClick={() => setIsMenuOpen(false)}>{t('dashboard')}</Link>
              <button onClick={onLogout} className="w-full text-start block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-200">
                {t('logout')}
              </button>
            </>
          ) : (
             <Link to="/login" className={navLinkClasses('/login', true)} onClick={() => setIsMenuOpen(false)}>{t('admin_login')}</Link>
          )}
           <div className="p-2">
                <LanguageSwitcher />
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;