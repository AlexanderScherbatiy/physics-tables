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

enum MassUnitType {
    KILOGRAM,
    ELECTRON_VOLT,
}

interface PhysicsUnit {
}

class MassUnit implements PhysicsUnit {

    private constructor(private mass: number) {
    }

    static from(mass: number, unit: MassUnitType) {
        return new MassUnit(this.toKilogram(mass, unit))
    }

    to(unit: MassUnitType): number {
        switch (unit) {
            case MassUnitType.KILOGRAM: return this.mass
            case MassUnitType.ELECTRON_VOLT: return this.mass * CONVERSION_KG_TO_EV
            default:
                throw new Error(`Unknow unit type: ${unit} to mass conversion.`)
        }

        return this.mass
    }

    private static toKilogram(mass: number, unit: MassUnitType): number {
        switch (unit) {
            case MassUnitType.KILOGRAM: return mass
            case MassUnitType.ELECTRON_VOLT: return mass / CONVERSION_KG_TO_EV
            default:
                throw new Error(`Unknow unit type: ${unit} from mass conversion.`)
        }
    }
}

function toKg(mass: number): MassUnit {
    return MassUnit.from(mass, MassUnitType.KILOGRAM)
}

const particles: Particle[] = [
    new Particle([
        [PARTICLE_NAME, "electron"],
        [PARTICLE_MASS, toKg(9.11e-31)],
    ]),
    new Particle([
        [PARTICLE_NAME, "proton"],
        [PARTICLE_MASS, toKg(1.67e-27)],
    ]),
    new Particle([
        [PARTICLE_NAME, "neutron"],
        [PARTICLE_MASS, toKg(1.68e-27)],
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
            case 1: return (p.get(PARTICLE_MASS) as MassUnit).to(MassUnitType.KILOGRAM)
            case 2: return (p.get(PARTICLE_MASS) as MassUnit).to(MassUnitType.ELECTRON_VOLT)
            default:
                throw new Error(`Index ${i} out of table column bounds ${columns.length}`)
        }
    })

    dataView.popHeader()
    dataView.popHeader()
    dataView.save()
}

function pad(value: any, maxLength: number): string {
    if (typeof value == "number") return pad(value.toExponential(2), maxLength)
    return `${value}`.padEnd(maxLength)
}
