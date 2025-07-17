import { Store } from 'pinia'

export interface PersistOptions {
    key?: string
    paths?: string[]
    storage?: Storage
    serializer?: {
        serialize: (value: any) => string
        deserialize: (value: string) => any
    }
}

export interface StoreDefinition {
    id: string
    state: () => Record<string, any>
    persist?: boolean | PersistOptions
}

export interface BaseState {
    loading: boolean
    error: Error | null
}

// 用户状态
export interface UserState extends BaseState {
    token: string | null
    userInfo: User | null
    permissions: string[]
    roles: string[]
}

// 应用状态
export interface AppState extends BaseState {
    sidebar: {
        opened: boolean
        withoutAnimation: boolean
    }
    device: 'desktop' | 'tablet' | 'mobile'
    size: 'default' | 'large' | 'small'
    language: string
}

// 产品状态
export interface ProductState extends BaseState {
    products: any[]
    total: number
    currentProduct: any | null
}

// 订单状态
export interface OrderState extends BaseState {
    orders: any[]
    total: number
    currentOrder: any | null
}

// 客户状态
export interface CustomerState extends BaseState {
    customers: any[]
    total: number
    currentCustomer: any | null
} 