export type MerchantStatus = 'pending' | 'approved' | 'under_review' | 'blocked'
export type RiskLevel = 'low' | 'medium' | 'high'

export interface Merchant {
  id: string
  name: string
  email: string
  phone: string
  deviceFingerprint: string
  ipAddress: string
  bankAccountNumber: string
  bankAccountIfsc: string
  status: MerchantStatus
  riskScore: number
  riskLevel: RiskLevel
  createdAt: Date
  updatedAt: Date
}

export interface CreateMerchantDTO {
  name: string
  email: string
  phone: string
  deviceFingerprint: string
  ipAddress: string
  bankAccountNumber: string
  bankAccountIfsc: string
}

export interface UpdateMerchantDTO {
  name?: string
  email?: string
  phone?: string
  deviceFingerprint?: string
  ipAddress?: string
  bankAccountNumber?: string
  bankAccountIfsc?: string
  status?: MerchantStatus
  riskScore?: number
  riskLevel?: RiskLevel
}

export interface MerchantQuery {
  page?: number
  limit?: number
  status?: MerchantStatus
  riskLevel?: RiskLevel
  search?: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PayoutChangeDTO {
  newBankAccountNumber: string
  newBankAccountIfsc: string
  reason: string
}
