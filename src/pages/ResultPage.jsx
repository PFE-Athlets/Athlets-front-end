import { useEffect } from 'react'
import { useResultStore } from '../stores/resultStore'

export const ResultsDashboard = () => {
  const results = useResultStore((state) => state.results)
  const pagination = useResultStore((state) => state.pagination)
  const isLoading = useResultStore((state) => state.isLoading)
  const error = useResultStore((state) => state.error)
  
  const fetchResults = useResultStore((state) => state.fetchResults)
  const cancelSubmission = useResultStore((state) => state.cancelSubmission)

  useEffect(() => {
    fetchResults()
  }, [fetchResults])

  const handleCancel = async (id) => {
    const res = await cancelSubmission(id)
    if (res.success) {
      alert('Soumission annulée avec succès !')
    }
  }

  if (isLoading) return <div>Chargement des résultats...</div>

  return (
    <div className="p-4">
      <h2>Tableau des Résultats</h2>
      
      {error && <div className="text-red-500">{error}</div>}

      <ul>
        {results.map((result) => (
          <li key={result.id} className="border-b py-2 flex justify-between">
            <span>Athlète ID: {result.athleteId} — Test: {result.testName}</span>
            <button 
              onClick={() => handleCancel(result.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Annuler
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-4 mt-4 items-center">
        <button
          disabled={pagination.page === 0}
          onClick={() => fetchResults(pagination.page - 1)}
          className="border p-2 disabled:opacity-50"
        >
          Précédent
        </button>
        <span>Page {pagination.page + 1} sur {pagination.totalPages}</span>
        <button
          disabled={pagination.page >= pagination.totalPages - 1}
          onClick={() => fetchResults(pagination.page + 1)}
          className="border p-2 disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  )
}