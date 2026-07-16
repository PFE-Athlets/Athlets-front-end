export function formatDate(value) {
  if (!value) return 'Non spécifié'

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('fr-CA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatGender(value) {
  const normalizedValue = value?.trim().toLowerCase()

  if (
    normalizedValue === 'female' ||
    normalizedValue === 'femme'
  ) {
    return 'Féminin'
  }

  if (
    normalizedValue === 'male' ||
    normalizedValue === 'homme'
  ) {
    return 'Masculin'
  }

  return value || 'Non spécifié'
}

export function formatDominantSide(value) {
  const normalizedValue = value?.trim().toLowerCase()

  if (
    normalizedValue === 'right' ||
    normalizedValue === 'droite'
  ) {
    return 'Droite'
  }

  if (
    normalizedValue === 'left' ||
    normalizedValue === 'gauche'
  ) {
    return 'Gauche'
  }

  if (
    normalizedValue === 'both' ||
    normalizedValue === 'ambidextre' ||
    normalizedValue === 'les deux'
  ) {
    return 'Les deux'
  }

  return value || 'Non spécifié'
}