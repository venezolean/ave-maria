const BASE_URL = 'https://edwin.edabso.com/api'

interface LoginCredentials {
  company_slug?: string
  email: string
  password: string
}

type LoginUniversalResponse =
  | {
      token: string
      user: {
        id: string
        nombre: string
        tipo_usuario: string
      }
    }
  | {
      requires_company: true
      companies: {
        slug: string
        company_id: string
      }[]
    }

interface LoginResponse {
  token: string
  user: {
    id: string
    nombre: string
    tipo_usuario: string
    trial?: boolean
  }
}
interface TrialFeedbackRequest {
  meta: {
    question: string
    answer: string
    screen: string
    time_in_app: number
  }
}

interface TrialFeedbackResponse {
  success: boolean
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getToken(): string | null {
    return localStorage.getItem('pos_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken()

    const headers: HeadersInit = {
      ...(options.body && { 'Content-Type': 'application/json' }),
      ...options.headers,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    })

    if (response.status === 401) {
      localStorage.removeItem('pos_token')
      localStorage.removeItem('pos_user')
      window.location.href = '/'
      throw new Error('Session expired')
    }

    let data: any = null

    try {
      data = await response.json()
    } catch {
      throw new Error('Invalid JSON response from server')
    }

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.message ||
          data?.error ||
          'Request failed'
      )
    }

    return data as T
  }

  async sendTrialFeedback(
    data: TrialFeedbackRequest
  ): Promise<TrialFeedbackResponse> {

    return this.request<TrialFeedbackResponse>(
      '/trial-feedback',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
  }
  
  /* ============================= */
  /*           REGISTER            */
  /* ============================= */

  async register(data: {
    company_name: string
    company_slug: string
    nombre: string
    email: string
    password: string
  }) {
    const payload = {
      company: {
        name: data.company_name,
        slug: data.company_slug
      },
      admin: {
        email: data.email,
        password: data.password,
        nombre: data.nombre
      }
    }

    const response = await this.request<{
      token: string
      company: {
        id: string
        name: string
        slug: string
      }
      user: {
        id: string
        email: string
        nombre: string
        role: string
      }
    }>(
      '/bootstrap/company',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    )

    localStorage.setItem('pos_token', response.token)
    localStorage.setItem('pos_user', JSON.stringify(response.user))

    return response
  }

  /* ============================= */
  /*            AUTH               */
  /* ============================= */
  

  async login(data: {
    email: string
    password?: string
    company_slug?: string
  }): Promise<LoginUniversalResponse> {

    const response = await this.request<LoginUniversalResponse>(
      '/auth/login-universal',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )

    // 🔥 SOLO si hay token guardas sesión
    if ('token' in response) {
      localStorage.setItem('pos_token', response.token)
      localStorage.setItem('pos_user', JSON.stringify(response.user))
    }

    return response
  }

  logout() {
    localStorage.removeItem('pos_token')
    localStorage.removeItem('pos_user')
  }

  getUser() {
    const userStr = localStorage.getItem('pos_user')
    return userStr ? JSON.parse(userStr) : null
  }

  /* ============================= */
  /*         DASHBOARD             */
  /* ============================= */

  async getDashboard() {
    return this.request('/dashboard')
  }

  /* ============================= */
  /*          INVENTORY            */
  /* ============================= */

  async getProducts() {
    return this.request('/inventory/products')
  }

  async getProductMovements(productId: string) {
    return this.request(`/inventory/movements/${productId}`)
  }

  async createProduct(data: {
    name: string
    price: number
    stock: number
  }) {
    return this.request<{ id: string }>(
      '/products',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
  }

  async updateProduct(
    id: string,
    data: Partial<{ name: string; price: number; stock: number }>
  ) {
    return this.request(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async getProductUploadUrl(
    id: string,
    contentType: string
  ): Promise<{
    upload_url: string
    public_url: string
    key: string
  }> {
    return this.request(`/products/${id}/upload-url`, {
      method: 'POST',
      body: JSON.stringify({
        content_type: contentType,
      }),
    })
  }

  async setProductImage(id: string, imageUrl: string) {
    return this.request(`/products/${id}/image`, {
      method: 'PUT',
      body: JSON.stringify({
        image_url: imageUrl,
      }),
    })
  }

  

  
  /* ============================= */
  /*            TRIAL              */
  /* ============================= */
  
  
  async startTrial(): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>(
      '/trial',
      { method: 'POST' }
    )

    localStorage.setItem('pos_token', response.token)
    localStorage.setItem('pos_user', JSON.stringify(response.user))

    return response
  }


  async adjustStock(productId: string, data: {
  quantity: number
  reason: string
}) {

  return this.request(`/products/${productId}/adjust`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })

}


  /* ============================= */
  /*            SALES              */
  /* ============================= */

  async createSale(data: {
    items: Array<{
      product_id: string
      quantity: number
      price: number
    }>
    payment_method: string
  }) {
    return this.request('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getSales() {
    return this.request('/sales')
  }

  async returnSale(saleId: string) {
    return this.request(`/sales/${saleId}/return`, {
      method: 'POST',
    })
  }
  
}

export const api = new ApiClient(BASE_URL)