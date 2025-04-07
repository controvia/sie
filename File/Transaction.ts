import { isoly } from "isoly"

export interface Transaction {
	account: number
	amount: number
	date?: isoly.Date
	registered?: isoly.Date
	description?: string
	quantity?: number
	signature?: string
}
export namespace Transaction {}
