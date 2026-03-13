import { useUserContext } from '../context/UserContext';

const STORAGE_KEY = 'wt_pseudonym';

export function usePseudonym() {
  const { pseudonym, setPseudonym, clearPseudonym } = useUserContext();

  function savePseudonym(value: string) {
    localStorage.setItem(STORAGE_KEY, value);
    setPseudonym(value);
  }

  function removePseudonym() {
    localStorage.removeItem(STORAGE_KEY);
    clearPseudonym();
  }

  return { pseudonym, savePseudonym, removePseudonym };
}
