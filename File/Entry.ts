import { isoly } from "isoly"
import { Transaction } from "./Transaction"

export interface Entry {
	series: string
	number: string
	date: isoly.Date
	registered?: isoly.Date
	description?: string
	transactions: Transaction[]
}
export namespace Entry {}
