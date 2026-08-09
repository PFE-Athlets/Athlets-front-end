import api from './config'

const extractError = (error, fallback) => {
  const data = error.response?.data

  if (typeof data === 'string') {
    return data
  }

  return (
    data?.message ??
    data?.error ??
    data?.erreur ??
    fallback
  )
}

const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const toId = (value) =>
  value == null ? '' : String(value)

const mapFilterOption = (item) => {
  if (item == null) {
    return null
  }

  if (
    typeof item === 'string' ||
    typeof item === 'number'
  ) {
    return {
      value: String(item),
      label: String(item),
    }
  }

  const value =
    item.value ??
    item.id ??
    item.code ??
    item.statusCode ??
    item.label

  const label =
    item.label ??
    item.name ??
    item.displayName ??
    item.statusLabel ??
    item.value

  if (value == null || label == null) {
    return null
  }

  return {
    value: String(value),
    label: String(label),
  }
}

const uniqueOptions = (options) => {
  const seen = new Set()

  return options.filter((option) => {
    if (!option || seen.has(option.value)) {
      return false
    }

    seen.add(option.value)
    return true
  })
}

const mapResult = (result) => {
  const athlete = result?.athlete ?? {}
  const test = result?.test ?? {}
  const team = result?.team ?? {}
  const battery = result?.battery ?? {}
  const intervenant = result?.intervenant ?? {}
  const resultValues = Array.isArray(result?.resultValues)
    ? result.resultValues
    : []

  return {
    id: toId(result?.id),
    testDate: result?.testDate ?? '',
    statusCode: String(
      result?.statusCode ?? '',
    ).trim(),
    statusLabel:
      result?.statusLabel ??
      result?.statusCode ??
      'Statut inconnu',
    commentText: result?.commentText ?? '',
    proof: result?.proof ?? null,
    athlete: {
      id: toId(athlete.id),
      username: athlete.username ?? '',
      firstName: athlete.firstName ?? '',
      lastName: athlete.lastName ?? '',
      displayName:
        athlete.displayName ??
        [athlete.firstName, athlete.lastName]
          .filter(Boolean)
          .join(' ') ??
        'Athlète inconnu',
    },
    test: {
      id: toId(test.id),
      name: test.name ?? 'Test inconnu',
    },
    team: {
      id: toId(team.id),
      name: team.name ?? 'Aucune équipe',
    },
    battery: {
      id: toId(battery.id),
      name:
        battery.name ??
        'Aucune batterie',
    },
    intervenant: {
      id: toId(intervenant.id),
      firstName: intervenant.firstName ?? '',
      lastName: intervenant.lastName ?? '',
      displayName:
        intervenant.displayName ??
        [intervenant.firstName, intervenant.lastName]
          .filter(Boolean)
          .join(' ') ??
        'Intervenant inconnu',
      role: intervenant.role ?? '',
    },
    resultValues,
    resultValueSummary:
      result?.resultValueSummary ??
      resultValues
        .map((item) => item?.formattedValue)
        .filter(Boolean)
        .join(' | '),
  }
}

const buildFallbackFilters = (results) => {
  const dates = results
    .map((result) => result.testDate)
    .filter(Boolean)
    .sort()

  return {
    minDate: dates[0] ?? '',
    maxDate: dates[dates.length - 1] ?? '',
    athletes: uniqueOptions(
      results.map((result) => ({
        value: result.athlete.id,
        label: result.athlete.displayName,
      })),
    ),
    tests: uniqueOptions(
      results.map((result) => ({
        value: result.test.id,
        label: result.test.name,
      })),
    ),
    teams: uniqueOptions(
      results.map((result) => ({
        value: result.team.id,
        label: result.team.name,
      })),
    ),
    batteries: uniqueOptions(
      results.map((result) => ({
        value: result.battery.id,
        label: result.battery.name,
      })),
    ),
    statuses: uniqueOptions(
      results.map((result) => ({
        value: result.statusCode,
        label: result.statusLabel,
      })),
    ),
  }
}

const mergeFilters = (apiFilters, fallbackFilters) => {
  const filters = apiFilters ?? {}

  return {
    minDate:
      filters.minDate ??
      fallbackFilters.minDate,
    maxDate:
      filters.maxDate ??
      fallbackFilters.maxDate,
    athletes: uniqueOptions(
      (Array.isArray(filters.athletes)
        ? filters.athletes
        : []
      )
        .map(mapFilterOption)
        .filter(Boolean),
    ),
    tests: uniqueOptions(
      (
        Array.isArray(filters.tests)
          ? filters.tests
          : Array.isArray(filters.physicalTests)
            ? filters.physicalTests
            : []
      )
        .map(mapFilterOption)
        .filter(Boolean),
    ),
    teams: uniqueOptions(
      (Array.isArray(filters.teams)
        ? filters.teams
        : []
      )
        .map(mapFilterOption)
        .filter(Boolean),
    ),
    batteries: uniqueOptions(
      (
        Array.isArray(filters.batteries)
          ? filters.batteries
          : Array.isArray(filters.testBatteries)
            ? filters.testBatteries
            : []
      )
        .map(mapFilterOption)
        .filter(Boolean),
    ),
    statuses: uniqueOptions(
      (
        Array.isArray(filters.statuses)
          ? filters.statuses
          : Array.isArray(filters.resultStatuses)
            ? filters.resultStatuses
            : []
      )
        .map(mapFilterOption)
        .filter(Boolean),
    ),
  }
}

const getDownloadFilename = (headers) => {
  const disposition =
    headers?.['content-disposition'] ??
    headers?.['Content-Disposition'] ??
    ''

  const utf8Match = disposition.match(
    /filename\*=UTF-8''([^;]+)/i,
  )

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }

  const fallbackMatch = disposition.match(
    /filename=\"?([^\";]+)\"?/i,
  )

  if (fallbackMatch?.[1]) {
    return fallbackMatch[1]
  }

  return 'resultats.xlsx'
}

export const resultService = {
  getPageData: async () => {
    try {
      const response = await api.get(
        '/api/result/page-data',
      )

      const rawResults = Array.isArray(
        response.data?.results,
      )
        ? response.data.results
        : []

      const results = rawResults.map(mapResult)
      const fallbackFilters =
        buildFallbackFilters(results)
      const filters = mergeFilters(
        response.data?.filters,
        fallbackFilters,
      )

      return {
        success: true,
        data: {
          results,
          filters: {
            ...filters,
            athletes:
              filters.athletes.length > 0
                ? filters.athletes
                : fallbackFilters.athletes,
            tests:
              filters.tests.length > 0
                ? filters.tests
                : fallbackFilters.tests,
            teams:
              filters.teams.length > 0
                ? filters.teams
                : fallbackFilters.teams,
            batteries:
              filters.batteries.length > 0
                ? filters.batteries
                : fallbackFilters.batteries,
            statuses:
              filters.statuses.length > 0
                ? filters.statuses
                : fallbackFilters.statuses,
          },
        },
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Erreur lors du chargement des résultats.',
        ),
      }
    }
  },

  getTeamResults: async (teamId) => {
    try {
      const response = await api.get(
        `/api/result/team/${teamId}`,
      )

      return {
        success: true,
        data: response.data ?? [],
      }
    } catch (error) {
      return {
        success: false,
        error: extractError(
          error,
          'Impossible de charger les résultats de cette équipe.',
        ),
      }
    }
  },

  submit: async (payload) => {
    try {
      await api.put(
        '/api/result/submit',
        payload,
      )

      return {
        success: true,
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Impossible d’enregistrer le résultat.',
        ),
      }
    }
  },

  exportResults: async (filters = {}) => {
    try {
      const params = {}

      if (filters.startDate) {
        params.startDate = filters.startDate
      }

      if (filters.endDate) {
        params.endDate = filters.endDate
      }

      if (filters.athlete && filters.athlete !== 'all') {
        params.athleteId = filters.athlete
      }

      if (filters.test && filters.test !== 'all') {
        params.testId = filters.test
      }

      if (filters.team && filters.team !== 'all') {
        params.teamId = filters.team
      }

      if (filters.status && filters.status !== 'all') {
        params.statusCode = filters.status
      }

      if (filters.battery && filters.battery !== 'all') {
        params.batteryId = filters.battery
      }

      const response = await api.get(
        '/api/result/export',
        {
          params,
          responseType: 'blob',
        },
      )

      return {
        success: true,
        data: response.data,
        contentType:
          response.headers?.['content-type'] ??
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: getDownloadFilename(
          response.headers,
        ),
      }
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        error: extractError(
          error,
          'Impossible d’exporter les résultats.',
        ),
      }
    }
  },

  helpers: {
    normalizeText,
  },
}
