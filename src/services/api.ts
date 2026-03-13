import axios from 'axios'

const DEFAULT_API_BASE_URL = 'https://tech-test-backend.dwsbrazil.io'

function getApiBaseUrl(): string {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim()

  if (!configuredUrl) {
    return DEFAULT_API_BASE_URL
  }

  return configuredUrl.endsWith('/')
    ? configuredUrl.slice(0, -1)
    : configuredUrl
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
})

export async function fetchJson<T>(path: string): Promise<T> {
  try {
    const response = await apiClient.get<T>(path)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Request failed (${error.response.status}) for ${path}`)
    }

    throw error
  }
}
