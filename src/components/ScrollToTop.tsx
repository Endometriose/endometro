import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Garante que ao trocar de rota a página sempre comece no topo,
 * respeitando âncoras (#) quando presentes.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return null;
}
