import { describe, expect, it } from "vitest"
import { sie } from "../index"

describe("sie.File", () => {
	it.each([
		[
			`#FLAGGA 0
#PROGRAM "Software" 1.0
#FORMAT PC8
#GEN 20250221
#SIETYP 4
#ORGNR 5569010000
#FNAMN "ACME AB"
#FTYP "AB"
#ADRESS "Kalle Anka" "Ankeborg" "12345" "070-1234567"
#VALUTA SEK
#RAR 0 20240101 20241231
#RAR -1 20230101 20231231
#KPTYP BAS2014
#KONTO 1080 "P\u0086g\u0086ende projekt och f\u0094rskott f\u0094r immateriella anl\u0084ggningstillg\u0086ngar"
#SRU 1080 7201
#IB 0 1080 0.00
#UB -1 1080 0.00
#UB 0 1080 0.00
`,
			{
				accounts: {
					"1080": {
						label: "Pågående projekt och förskott för immateriella anläggningstillgångar",
						closing: [0, 0],
						number: 1080,
						opening: [0],
						sru: 7201,
					},
				},
				currency: "SEK",
				encoding: "PC8",
				generated: "2025-02-21",
				organization: {
					address: {
						contact: "Kalle Anka",
						phone: "070-1234567",
						street: "Ankeborg",
						zip: "12345",
					},
					name: "ACME AB",
					number: "5569010000",
					type: "AB",
				},
				program: "Software",
				type: "BAS2014",
				years: ["2024-01-01--2024-12-31", "2023-01-01--2023-12-31"],
				entries: [],
			},
		],
	] as const)("parse(%s)", (value, expected) => expect(sie.File.parse(value)).toEqual(expected))
})
