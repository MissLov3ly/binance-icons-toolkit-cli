import { fetch } from 'zx'
import { createHmac } from 'node:crypto'
import { joinQueryString } from '@/utils'

export class Binance {
  readonly #key: string
  readonly #secret: string

  constructor(key: string, secret: string) {
    this.#key = key
    this.#secret = secret
  }

  public async fetchRestrictions(): Promise<Binance.Restrictions> {
    return await this.makeRequest<Binance.Restrictions>('https://api.binance.com/sapi/v1/account/apiRestrictions')
  }

  public async fetchAll(): Promise<Array<Binance.Asset>> {
    return await this.makeRequest<Array<Binance.Asset>>('https://api.binance.com/sapi/v1/capital/config/getall', {
      includeEtf: 'true'
    })
  }

  private async makeRequest<T>(url: string, qs?: Record<string, string>): Promise<T> {
    qs ??= { recvWindow: 60000 }
    const options: RequestInit = {
      credentials: 'omit',
      headers: new Headers({
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-MBX-APIKEY': this.#key
      }),
      method: 'get',
      mode: 'no-cors'
    }
    const timestamp = new Date().getTime()
    const signature = createHmac('sha256', this.#secret)
      .update(joinQueryString({ ...qs, timestamp }).substring(1))
      .digest('hex')
    const response: Response = await fetch(url + joinQueryString({ ...qs, timestamp, signature }), options)
    if (response.ok) {
      return (await response.json()) as T
    }
    const e = (await response.json()) as Binance.Error
    throw new BinanceErrorImpl(e.code, e.msg)
  }
}

export class BinanceErrorImpl extends Error implements BinanceError {
  public code: number
  public msg?: string
  constructor(code?: number, message?: string) {
    super()
    this.code = code ?? -1
    this.message = message ?? ''
    this.msg = message
  }
}
