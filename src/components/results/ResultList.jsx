import { useState, useMemo } from 'react'
import { useResultStore } from '@/stores/resultStore'
import { ResultDetailModal } from './ResultDetailModal'

const STATUS_CONFIG = {
  'Approved': { label: 'Approuvé', bg: '#e8f5e9', color: '#2e7d32' },
  'Rejected': { label: 'Refusé', bg: '#ffebee', color: '#d32f2f' },
  'Refused': { label: 'Refusé', bg: '#ffebee', color: '#d32f2f' },
  'Pending approval': { label: "En attente d'approbation", bg: '#fff3e0', color: '#ed6c02' },
  'Assigned': { label: 'Assigné', bg: '#e1f5fe', color: '#0288d1' }
}

const UNIT_SUFFIXES = {
  'kg': ' kg',
  'repetitions': ' reps',
  'seconds': ' s',
  'metres': ' m',
  'SECONDES': ' s',
  'KILOGRAMMES': ' kg',
  'METRES': ' m',
  'REPETITIONS': ' reps'
}

export const ResultList = ({ onCancelResult }) => {
  const results = useResultStore((state) => state.results)
  const filters = useResultStore((state) => state.filters)
  
  const [selectedResult, setSelectedResult] = useState(null)

  const filteredResults = useMemo(() => {
    const search = (filters.search || '').trim().toLowerCase()
    const status = filters.status || ''
    const category = filters.category || ''
 
    return results.filter((result) => {
      if (status && result.status !== status) return false
      if (category && result.category !== category) return false
      if (search) {
        const name = (result.physicalTestName || '').toLowerCase()
        if (!name.includes(search)) return false
      }
      return true
    })
  }, [results, filters])

  if (filteredResults.length === 0) {
    return <p className="list-empty">Aucun résultat trouvé pour ces critères.</p>
  }

  const formatResultValue = (resultValue, testUnit) => {
    if (!resultValue) return <span className="cell--muted">—</span>
    const normalizedUnit = testUnit ? testUnit.trim() : ''
    const suffix = UNIT_SUFFIXES[normalizedUnit] || UNIT_SUFFIXES[normalizedUnit.toLowerCase()] || ''
    return <strong>{resultValue}{suffix}</strong>
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Nom du test</th>
            <th>Résultat</th>
            <th>Statut</th>
            {onCancelResult && <th style={{ textAlign: 'right' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredResults.map((result) => {
            const statusInfo = STATUS_CONFIG[result.status] || STATUS_CONFIG['Assigned']
            
            return (
              <tr 
                key={result.id} 
                onClick={() => setSelectedResult(result)} 
                style={{ cursor: 'pointer' }}
                className="clickable-row"
              >
                <td className="cell--name">
                  {result.physicalTestName || 'Nom du Test'}
                </td>
                
                <td>
                  {formatResultValue(result.resultValue, result.unit)}
                </td>
                
                <td>
                  <span 
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      fontWeight: '500',
                      backgroundColor: statusInfo.bg,
                      color: statusInfo.color,
                      border: `1px solid ${statusInfo.color}`
                    }}
                  >
                    {statusInfo.label}
                  </span>
                </td>

                {onCancelResult && (
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    {result.status === 'Pending approval' || result.status === 'Assigned' ? (
                      <button 
                        type="button" 
                        className="list-reset-btn" 
                        style={{ margin: 0, padding: '4px 8px', fontSize: '0.85rem' }}
                        onClick={() => onCancelResult(result.id)}
                      >
                        Annuler
                      </button>
                    ) : (
                      <span className="cell--muted">—</span>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>

      {selectedResult && (
        <ResultDetailModal 
          result={selectedResult} 
          onClose={() => setSelectedResult(null)} 
        />
      )}
    </div>
  )
}