export interface Account {
	number: number
	label?: string
	type?: "T" | "S" | "K" | "I"
	opening?: number[]
	closing?: number[]
	result?: number[]
	sru?: number
}
export namespace Account {}
