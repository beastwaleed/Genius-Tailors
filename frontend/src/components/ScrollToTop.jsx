import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Try scrolling the internal workspace if we are in the CustomerLayout
    const workspace = document.querySelector('.luxury-workspace');
    if (workspace) {
      workspace.scrollTo({ top: 0, behavior: 'instant' });
    }

    // Also scroll the main window for generic pages (Home, About, etc)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);

  return null;
}
