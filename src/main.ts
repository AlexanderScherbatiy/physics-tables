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

class TableWriter {
    private lines: string[] = []

    write(line: string): void {
        this.lines.push(line)
    }

    toFile(fileName: string): void {
        writeFileSync(`./${fileName}`, this.lines.join("\n"));
    }
}

const writer = new TableWriter()
physicsTables(writer, particles)
writer.toFile("README.md")

function physicsTables(writer: TableWriter, particles: Particle[]) {
    writer.write(`# Phyiscs Tables`)
    elementaryParticlesTable(writer, particles)
}

function pad(value: any, maxLength: number): string {
    return `${value}`.padEnd(maxLength)
}

function padNumber(value: number, maxLength: number): string {
    return pad(value.toExponential(2), maxLength)
}

function elementaryParticlesTable(writer: TableWriter, particles: Particle[]): void {
    writer.write(`## Elementary particles`)
    writer.write(`| particle / mass  |kg|ev`)
    writer.write(`|------------|------------|------------|`)
    const PAD = 12
    for (const p of particles) {
        const name = p.get(PARTICLE_NAME) as string
        const massKg = p.get(PARTICLE_MASS) as number
        const mass = new UnitValue(UnitType.KILOGRAM, massKg)
        const massEv = UNIT_CONVERSION.toElectronVolts(mass).value
        writer.write(`|${pad(name, PAD)}|${padNumber(massKg, PAD)}|${padNumber(massEv, PAD)}|`)
    }
}