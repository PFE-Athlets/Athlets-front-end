import { useEffect } from 'react'
import { useResultStore } from '@/stores/resultStore'
import { ResultFilters } from '../components/results/ResultsFilters'
import { ResultList } from '../components/results/ResultList'
import { Container, Alert, Box, CircularProgress } from '@mui/material'

export const ResultsDashboard = () => {
  const results = useResultStore((state) => state.results)
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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    console.log('Rendering ResultsDashboard with results:', results),
    <Container sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
  <ResultFilters />
</Box>
      
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <ResultList 
        results={results}
        onCancelResult={handleCancel}
      />
    </Container>
  )
}