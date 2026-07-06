import { useEffect, useState } from 'react';
import { useResultStore } from '@/stores/resultStore'
import { SearchIcon, ResetIcon } from '../../components/Icons'

const STATUS_OPTIONS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'Pending approval', label: 'En attente d\'approbation' },
  { value: 'Approved', label: 'Approuvé' },
  { value: 'Rejected', label: 'Refusé' },
  { value: 'Assigned', label: 'Assigné' },
];

const TEST_CATEGORIES = [
  { value: '', label: 'Toutes les catégories' },
  { value: 'FORCE', label: 'Force' },
  { value: 'ENDURANCE', label: 'Endurance' },
  { value: 'VITESSE', label: 'Vitesse' },
  { value: 'AGILITE', label: 'Agilité' },
  { value: 'SOUPLESSE', label: 'Souplesse' },
];

export const ResultFilters = ({ totalCount = 0 }) => {
  const filters = useResultStore((state) => state.filters);
  const setFilter = useResultStore((state) => state.setFilter);
  const resetFilters = useResultStore((state) => state.resetFilters); 

  const [searchTerm, setSearchTerm] = useState(filters.search || '');

  // Handle input changes using a built-in debounce
  useEffect(() => {
    if (searchTerm === '' && !filters.search) return;

    const delayDebounceFn = setTimeout(() => {
      setFilter('search', searchTerm); // This now triggers fetchResults() under the hood
    }, 400); 

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, setFilter, filters.search]);

  // Keep local search field synced if filters reset globally
  useEffect(() => {
    setSearchTerm(filters.search || '');
  }, [filters.search]);

  return (
    <>
      <div className="list-page__top">
        <p className="tests-count">
          {`${totalCount} résultat(s) trouvé(s)`}
        </p>
        <button type="button" className="create-btn" onClick={() => window.print()}>
          <span>Exporter les résultats</span>
        </button>
      </div>

      <div className="list-filters">
        <label className="list-search">
          <input
            type="search"
            placeholder="Rechercher un résultat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon />
        </label>

        <div className="list-filter">
          <span>Statut</span>
          <select 
            value={filters.status || ''} 
            onChange={(e) => setFilter('status', e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="list-filter list-filter--wide">
          <span>Catégorie de test</span>
          <select 
            value={filters.category || ''} 
            onChange={(e) => setFilter('category', e.target.value)}
          >
            {TEST_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <button type="button" className="list-reset-btn" onClick={resetFilters}>
          <ResetIcon />
          <span>Réinitialiser</span>
        </button>
      </div>
    </>
  );
};