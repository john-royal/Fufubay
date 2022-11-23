interface APIErrorResponse {
  success: false
  error: { message: string }
}

interface APISuccessResponse<T> {
  success: true
  data: T
}

export type APIResponse<T> = APISuccessResponse<T> | APIErrorResponse

interface RequestOptionsNoBody {
  method: 'GET' | 'DELETE'
  url: string
  headers?: Record<string, string | undefined>
}

interface RequestOptionsBody {
  method: 'POST' | 'PUT' | 'PATCH'
  url: string
  headers?: Record<string, string | undefined>
  body: Record<string, any>
}

export type RequestOptions = RequestOptionsNoBody | RequestOptionsBody

export default async function request<T> (options: RequestOptions): Promise<T> {
  const response = await fetch(options.url, {
    method: options.method,
    headers: Object.assign({}, options.headers as Record<string, string>, { 'Content-Type': 'application/json' }),
    body: 'body' in options ? JSON.stringify(options.body) : null
  })
  const json = await response.json() as APIResponse<T>
  if (json.success) return json.data
  else throw new Error(json.error.message)
}

export async function get<T> (url: string): Promise<APIResponse<T>> {
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  return await response.json() as APIResponse<T>
}
