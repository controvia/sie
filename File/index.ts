import { isoly } from "isoly"
import { controvia } from "@controvia/model"
import { isly } from "isly"
import { Account as _Account } from "./Account"
import { Encoder } from "./Encoder"
import { Entry as _Entry } from "./Entry"
import { Transaction as _Transaction } from "./Transaction"

export interface File {
	type?: string
	currency?: isoly.Currency
	encoding?: string
	program?: string
	generated?: isoly.Date
	version?: number
	organization: {
		number?: string
		name?: string
		type?: string
		address?: {
			contact?: string
			street?: string
			zip?: string
			phone?: string
		}
	}
	years: controvia.Period[]
	accounts: Record<number, File.Account>
	entries: File.Entry[]
}
export namespace File {
	export import Account = _Account
	export import Entry = _Entry
	export import Transaction = _Transaction

	function parseDate(value: string): isoly.Date
	function parseDate(value: string | undefined): isoly.Date | undefined
	function parseDate(value: string | undefined): isoly.Date | undefined {
		return value && isoly.Date.type.get(`${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`)
	}
	function tokenize(line: string): string[] {
		const result: string[] = []
		line = line.trim()
		if (line.startsWith("#")) {
			let separator = " "
			let token = ""
			for (const character of line) {
				switch (character) {
					case '"':
						separator = separator == " " ? "" : " "
						break
					case separator:
						result.push(token)
						token = ""
						break
					default:
						token += character
						break
				}
			}
			result.push(token)
		}
		return result
	}
	export function parse(buffer: Uint8Array | string): File | undefined {
		const content = new Encoder("cp437").decode(typeof buffer == "string" ? new TextEncoder().encode(buffer) : buffer)
		const lines = content.split("\n")
		const result: File = {
			years: [],
			accounts: {},
			entries: [],
			organization: {},
		}
		let entry: File.Entry | undefined
		for (const line of lines) {
			const parts = tokenize(line)
			switch (parts[0]) {
				case "#FLAGGA":
					break
				case "#PROGRAM":
					if (parts[1] != undefined)
						result.program = parts[1]
					break
				case "#FORMAT":
					if (parts[1] != undefined)
						result.encoding = parts[1]
					break
				case "#GEN":
					if (parts[1] != undefined)
						result.generated = parseDate(parts[1])
					break
				case "#SIETYP":
					if (parts[1] != undefined)
						result.type = parts[1]
					break
				case "#ORGNR":
					if (parts[1] != undefined)
						result.organization.number = parts[1]
					break
				case "#FNAMN":
					if (parts[1] != undefined)
						result.organization.name = parts[1]
					break
				case "#FTYP":
					if (parts[1] != undefined)
						result.organization.type = parts[1]
					break
				case "#ADRESS":
					if (parts[1] != undefined && parts[2] != undefined && parts[3] != undefined && parts[4] != undefined)
						result.organization.address = { contact: parts[1], street: parts[2], zip: parts[3], phone: parts[4] }
					break
				case "#VALUTA":
					if (parts[1] != undefined)
						result.currency = isoly.Currency.type.get(parts[1]) ?? "SEK"
					break
				case "#KPTYP":
					if (parts[1] != undefined)
						result.type = parts[1]
					break
				case "#RAR":
					{
						const year = parts[1] == undefined ? undefined : parseInt(parts[1])
						const start = parseDate(parts[2])
						const end = parseDate(parts[3])
						if (year != undefined && start != undefined && end != undefined)
							result.years[-year] = `${start}--${end}`
					}
					break
				case "#KONTO":
					{
						if (parts[1] != undefined && parts[2] != undefined) {
							const account = {
								number: parseInt(parts[1]),
								label: parts[2],
							}
							result.accounts[account.number] = account
						}
					}
					break
				case "#IB":
				case "#UB":
				case "#RES":
					const property = parts[0] == "#IB" ? "opening" : parts[0] == "#UB" ? "closing" : "result"
					const year = parts[1] == undefined ? undefined : parseInt(parts[1])
					const account = parts[2] == undefined ? undefined : result.accounts[parseInt(parts[2])]
					const amount = parts[3] == undefined ? undefined : parseFloat(parts[3])
					// const quantity = parseFloat(parts[4]) // TODO: add support for quantity
					if (typeof year == "number" && account && typeof amount == "number")
						(account[property] ??= [])[-year] = amount
					break
				case "#SRU":
					if (parts[1] != undefined && parts[2] != undefined) {
						const account = parseInt(parts[1])
						;(result.accounts[account] ??= { number: account }).sru = parseInt(parts[2])
					}
					break
				case "#VER":
					if (
						parts[1] != undefined &&
						parts[2] != undefined &&
						parts[3] != undefined &&
						parts[4] != undefined &&
						parts[5] != undefined
					) {
						const date = parseDate(parts[3]) ?? "0000-01-01"
						entry = {
							series: parts[1],
							number: parts[2],
							date,
							description: parts[4],
							registered: parseDate(parts[5]),
							transactions: [],
						}
						result.entries.push(entry)
					}
					break
				case "#TRANS":
					if (entry && parts[1] != undefined && parts[3] != undefined) {
						entry.transactions.push({
							account: parseInt(parts[1]),
							amount: parseFloat(parts[3]),
						})
						break
					}
			}
		}
		return result
	}
	export function to(
		type: "organization",
		value: File | undefined,
		language?: isoly.Language
	): controvia.Organization.Creatable | undefined
	export function to(type: "ledger", value: File | undefined, language?: isoly.Language): controvia.Ledger | undefined
	export function to(
		type: "organization" | "ledger",
		value: File | undefined,
		language: isoly.Language = "sv"
	): controvia.Ledger | controvia.Organization.Creatable | undefined {
		let result: controvia.Ledger | controvia.Organization.Creatable | undefined
		if (value)
			switch (type) {
				case "organization":
					const { number, name } = value.organization
					result = {
						...(number != undefined ? { number } : {}),
						...(name != undefined ? { name } : {}),
					}
					break
				case "ledger":
					result = value.years[0] && {
						chart: isly.string().get(value.type?.toLowerCase(), "bas2014"),
						currency: value.currency ?? "SEK",
						period: value.years[0],
						accounts: Object.values(value.accounts).map(account => {
							const opening = account?.opening?.[0]
							const closing = account?.closing?.[0] ?? account?.result?.[0]
							const result: controvia.Ledger.Account = {
								number: account.number,
								...(opening != undefined ? { opening } : {}),
								...(closing != undefined ? { closing } : {}),
							}
							if (account.label)
								(result.label ??= {})[language] = account.label
							return result
						}),
						journal: value.entries.map(entry => ({
							series: entry.series,
							number: entry.number,
							date: entry.date,
							registered: entry.registered ?? entry.date,
							description: entry.description ?? "",
							transactions: entry.transactions.map(transaction => ({
								account: transaction.account,
								amount: transaction.amount,
							})),
						})),
					}
					break
			}
		return result
	}
}
