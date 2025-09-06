import { writeFileSync } from 'fs';

// units second/kg/meter

const CONST_LIGHT_VELOCITY = 3e8 // m/s
const CONST_ELECTRON_CHARGE = 1.60e-19 // coulomb

const CONVERSION_KG_TO_EV = CONST_LIGHT_VELOCITY * CONST_LIGHT_VELOCITY / CONST_ELECTRON_CHARGE

const PARTICLE_NAME = "PARTICLE_NAME"
const PARTICLE_MASS = "PARTICLE_MASS"

class Particle {
    public properties: Map<string, any>
    constructor(props: [key: string, value: any][]) {
        this.properties = new Map<string, any>(props)
    }

    get(key: string): any {
        return this.properties.get(key)
    }
}

enum UnitType {
    KILOGRAM,
    ELECTRON_VOLT,
}

class UnitValue {
    constructor(public unit: UnitType, public value: number) { }
}

class UnitConversion {

    toElectronVolts(unitValue: UnitValue): UnitValue {
        return new UnitValue(UnitType.ELECTRON_VOLT, this.convertToElectronVolts(unitValue))
    }

    private convertToElectronVolts(unitValue: UnitValue): number {
        const value = unitValue.value
        switch (unitValue.unit) {
            case UnitType.ELECTRON_VOLT: return value
            case UnitType.KILOGRAM: return CONVERSION_KG_TO_EV * value
            default:
                throw new Error(`Unknow unit type: ${unitValue.unit} for conversion to electron volts.`)
        }
    }
}

const UNIT_CONVERSION = new UnitConversion()


const particles: Particle[] = [
    new Particle([
        [PARTICLE_NAME, "electron"],
        [PARTICLE_MASS, 9.11e-31],
    ]),
    new Particle([
        [PARTICLE_NAME, "proton"],
        [PARTICLE_MASS, 1.67e-27],
    ]),
    new Particle([
        [PARTICLE_NAME, "neutron"],
        [PARTICLE_MASS, 1.68e-27],
    ]),
]

/*
for (const particle of particles) {
    for (const [key, value] of particle.properties) {
        console.log(`key: ${key}, value: ${value}`)
    }
}
*/

interface DataView {
    pushHeader(header: string)
    popHeader()
    writeTable<T>(columns: string[], rows: T[], mapper: (value: T, rowIndex: number) => string)
    save()
}

class MarkDownDataView implements DataView {

    private headerPrefix: string = ""
    private lines: string[] = []

    constructor(public fileName: string) {
    }

    pushHeader(header: string) {
        this.headerPrefix += "#"
        this.lines.push(`${this.headerPrefix} ${header}`)
    }

    popHeader() {
        this.headerPrefix = this.headerPrefix.substring(0, this.headerPrefix.length - 1)
    }

    writeTable<T>(columns: string[], rows: T[], mapper: (value: T, rowIndex: number) => string) {

        const pads = columns.map(it => it.length)
        this.writeTableRow(columns)
        this.writeTableRow(columns.map((_, i) => `-`.repeat(pads[i])))

        for (const row of rows) {
            const values = columns.map((_, i) => mapper(row, i))
            this.writeTableRow(values.map((it, i) => pad(it, pads[i])))
        }
    }

    private writeTableRow(values: string[]) {
        this.lines.push(`|${values.join("|")}|`)
    }

    save() {
        writeFileSync(`./${this.fileName}`, this.lines.join("\n"));
    }
}

generatePhysicsTables()

function generatePhysicsTables() {
    const dataView: DataView = new MarkDownDataView("README.md")
    dataView.pushHeader(`Phyiscs Tables`)
    dataView.pushHeader(`Elementary particles`)

    const columns = ["particle / mass", "kg", "ev"]

    dataView.writeTable(columns, particles, (p, i) => {
        switch (i) {
            case 0: return p.get(PARTICLE_NAME)
            case 1: return p.get(PARTICLE_MASS)
            case 2: {
                const massKg = p.get(PARTICLE_MASS) as number
                const mass = new UnitValue(UnitType.KILOGRAM, massKg)
                const massEv = padNumber(UNIT_CONVERSION.toElectronVolts(mass).value, 0)
                return massEv
            }
        }
    })

    dataView.popHeader()
    dataView.popHeader()
    dataView.save()
}

function pad(value: any, maxLength: number): string {
    return `${value}`.padEnd(maxLength)
}

function padNumber(value: number, maxLength: number): string {
    return pad(value.toExponential(2), maxLength)
}
