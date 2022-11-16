interface APIErrorResponse {
  success: false
  error: { message: string }
}

interface APISuccessResponse<T> {
  success: true
  data: T
}

export type APIResponse<T> = APISuccessResponse<T> | APIErrorResponse

export async function get<T> (url: string): Promise<APIResponse<T>> {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  return await response.json() as APIResponse<T>
}

export async function post<T, U> (url: string, body: T): Promise<APIResponse<U>> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  return await response.json() as APIResponse<U>
}
