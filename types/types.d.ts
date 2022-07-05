/// <reference types="node" />

declare interface Config {
  map(): Map<string, unknown>
  load(): Promise<void>
  get path(): string
  get size(): number
  get<T>(key: string, defaultValue?: T | undefined): T | void
  set(key: string, value: unknown)
  sets(obj: Record<string, unknown> = {})
  delete(key: string): Promise<void>
}

declare namespace Binance {
  declare interface Restrictions {
    readonly ipRestrict: boolean
    readonly createTime: number
    readonly enableMargin: boolean
    readonly enableFutures: boolean
    readonly enableVanillaOptions: boolean
    readonly enableReading: boolean
    readonly enableSpotAndMarginTrading: boolean
    readonly enableWithdrawals: boolean
    readonly enableInternalTransfer: boolean
    readonly permitsUniversalTransfer: boolean
  }

  declare interface NetworkList {
    readonly addressRegex: string
    readonly coin: string
    readonly depositDesc: string
    readonly depositEnable: boolean
    readonly isDefault: boolean
    readonly memoRegex: string
    readonly minConfirm: number
    readonly name: string
    readonly network: string
    readonly resetAddressStatus: false
    readonly specialTips: string
    readonly unLockConfirm: number
    readonly withdrawDesc: string
    readonly withdrawEnable: boolean
    readonly withdrawFee: number
    readonly withdrawIntegerMultiple: number
    readonly withdrawMax: number
    readonly withdrawMin: number
    readonly sameAddress: boolean
  }

  declare interface Asset {
    readonly coin: string
    readonly depositAllEnable: boolean
    readonly free: number
    readonly freeze: number
    readonly ipoable: number
    readonly ipoing: number
    readonly isLegalMoney: boolean
    readonly locked: number
    readonly name: string
    readonly networkList: Array<NetworkList>
    readonly storage: number
    readonly trading: boolean
    readonly withdrawAllEnable: boolean
    readonly withdrawing: number
  }

  declare interface Error {
    readonly code?: number
    readonly msg?: string
  }
}

declare namespace Git {
  declare interface Options {
    cmd?: string
    branch?: string
    depth?: string
    verbose?: boolean
  }
  declare interface CloneOptions {
    depth?: string
    verbose?: boolean
  }
  declare interface ParseOutput {
    level?: string
    message?: string
  }
  declare interface CloneOutput {
    code?: string
    messages?: ParseOutput[]
  }
}

declare namespace Generated {
  declare interface Asset {
    coin: string
    depositAllEnable: boolean
    withdrawAllEnable: boolean
    name: string
    free: string
    locked: string
    freeze: string
    withdrawing: string
    ipoing: string
    ipoable: string
    storage: string
    isLegalMoney: boolean
    trading: boolean
    networkList: NetworkList[]
  }

  declare interface NetworkList {
    network: string
    coin: string
    withdrawIntegerMultiple: string
    isDefault: boolean
    depositEnable: boolean
    withdrawEnable: boolean
    depositDesc: string
    withdrawDesc: string
    specialTips?: string
    specialWithdrawTips?: string
    name: string
    resetAddressStatus: boolean
    addressRegex: string
    addressRule: AddressRule
    memoRegex: MemoRegex
    withdrawFee: string
    withdrawMin: string
    withdrawMax: string
    minConfirm: number
    unLockConfirm: number
    sameAddress: boolean
    depositDust?: string
  }

  declare enum AddressRule {
    Address = 'ADDRESS',
    Empty = ''
  }

  declare enum MemoRegex {
    Empty = '',
    MemoRegex09AZaZ1120$ = '^[0-9A-Za-z\\-_,]{1,120}$',
    Purple09AZaZ1120$ = '^[0-9A-Za-z\\-_,.]{1,120}$',
    The009110$ = '^((?!0)[0-9]{1,10})$',
    The09AZAZ020$ = '^[0-9a-zA-Z]{0,20}$',
    The09AZaZ1120$ = '^[0-9A-Za-z\\-_]{1,120}$',
    The09AZaZ128$ = '^[0-9A-Za-z-]{1,28}$',
    W0120 = '\\w{0,120}'
  }

  declare type AssetName = {
    [key: string]: string
  }

  declare interface Markdown {
    cryptoCount: number
    cryptoTable: string

    etfCount: number
    etfTable: string

    currencyCount: number
    currencyTable: string
  }
}

declare namespace Repository {
  declare interface Manifest {
    /**
     * Binance Crypto Icons
     */
    readonly crypto: Asset[]

    /**
     * Binance Currency Icons
     */
    readonly currency: Asset[]

    /**
     * Binance ETF Icons
     */
    readonly etf: Asset[]
  }

  declare interface Asset {
    readonly symbol: string
    readonly name: string
  }
}

type SetupAnswers = {
  readonly key: string
  readonly secret: string
}
