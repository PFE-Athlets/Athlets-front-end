import { useState, useEffect } from 'react'
import { useResultStore } from '@/stores/resultStore'
import './ResultsStyles.css'

export const ResultDetailModal = ({ result, onClose }) => {
  const submitAthleteResult = useResultStore((state) => state.submitAthleteResult)
  const cancelSubmission = useResultStore((state) => state.cancelSubmission)

  const [resultValue, setResultValue] = useState(result.resultValue || '')
  const [videoProof, setVideoProof] = useState(result.videoProof || '')
  const [commentText, setCommentText] = useState(result.commentText || '')
  const [formError, setFormError] = useState('')

  const isAssigned = result.status === 'Assigned'
  const isPending = result.status === 'Pending approval'
  const isRejected = result.status === 'Rejected'
  const isReadOnly = !isAssigned

  useEffect(() => {
    if (result) {
      if (isRejected) {
        alert("Ce résultat a été refusé. En fermant cette fenêtre, son statut repassera à 'Assigné' pour vous permettre de soumettre une nouvelle performance.")
      }
    }
  }, [result, isRejected])

  const handleCloseAndResetRejected = async () => {
    if (isReadOnly && isRejected) {
      await cancelSubmission(result.id)
    }
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (!resultValue.trim()) {
      setFormError('Le champ résultat est requis.')
      return
    }

    const proofRequired = result.proofNeeded?.toLowerCase() === 'oui'
    if (proofRequired && !videoProof.trim()) {
      setFormError('Une preuve vidéo est requise pour ce test physique.')
      return
    }

    const payload = {
      id: result.id,
      resultValue,
      videoProof,
      commentText,
    }

    const response = await submitAthleteResult(payload)
    if (response.success) {
      onClose()
    } else {
      setFormError(response.error || 'Une erreur est survenue lors de la soumission.')
    }
  }

  const handleCancelSubmission = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir annuler cette soumission ?")) {
      const response = await cancelSubmission(result.id)
      if (response.success) {
        onClose()
      }
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleCloseAndResetRejected}>
      <div className="create-athlete-page modal-content" onClick={(e) => e.stopPropagation()}>
  
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
    <h1 style={{ lineHeight: '1.2', margin: '0 0 10px 0' }}>
      Détails du Test : {result.physicalTestName}
    </h1>
    <button type="button" className="list-reset-btn" onClick={handleCloseAndResetRejected}>✕</button>
  </div>

  <p className="status-badge-container">
    Statut actuel : <strong>{result.status}</strong>
  </p>

        <form className="athlete-form" onSubmit={handleSubmit}>
          
          <section className="form-section form-section--notes">
            <h2>Protocole de test</h2>
            <div className="readonly-info text-protocol" style={{ whiteSpace: 'pre-wrap' }}>
              {result.protocol || "Aucun protocole spécifié pour ce test."}
            </div>
          </section>

          <section className="form-section">
            <h2>Performances & Preuves</h2>
            
            {formError && (
              <div className="error-message" style={{ color: '#d32f2f', marginBottom: '1rem', fontWeight: 'bold' }}>
                {formError}
              </div>
            )}

            <div className="form-grid">
              <div className="form-field">
                <label>Résultat ({result.unit || 'Valeur'}) *</label>
                <input 
                  type="text" 
                  placeholder="Ex: 12.5" 
                  value={resultValue}
                  onChange={(e) => setResultValue(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>

              <div className="form-field">
                <label>Lien de la preuve vidéo {result.proofNeeded?.toLowerCase() === 'oui' ? '*' : ''}</label>
                <input 
                  type="url" 
                  placeholder="https://youtube.com/..." 
                  value={videoProof}
                  onChange={(e) => setVideoProof(e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="form-field full-width" style={{ marginTop: '15px' }}>
              <label>Commentaire optionnel</label>
              <textarea 
                placeholder="Ajouter des remarques sur votre performance..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={isReadOnly}
              />
            </div>
          </section>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={handleCloseAndResetRejected}>
              {isReadOnly ? 'Fermer' : 'Annuler'}
            </button>

            {isAssigned && (
              <button type="submit" className="btn-primary">
                Soumettre le test
              </button>
            )}

            {isPending && (
              <button type="button" className="btn-danger" style={{ backgroundColor: '#d32f2f', color: '#fff' }} onClick={handleCancelSubmission}>
                Annuler la soumission
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}