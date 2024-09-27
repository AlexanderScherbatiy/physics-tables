import { writeFileSync } from 'fs';

const PARTICLE_NAME = "PARTICLE_NAME"
const PARTICLE_MASS = "PARTICLE_MASS" // kg

class Particle {
    public properties: Map<string, any>
    constructor(props: [key: string, value: any][]) {
        this.properties = new Map<string, any>(props)
    }

    get(key: string): any {
        return this.properties.get(key)
    }
}

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

function elementaryParticlesTable(writer: TableWriter, particles: Particle[]): void {
    writer.write(`## Elementary particles`)
    writer.write(`| particle / mass  |kg|`)
    writer.write(`|------------|------------|`)
    const pad = 12
    for (const p of particles) {
        const name = `${p.get(PARTICLE_NAME)}`.padEnd(pad)
        const mass = `${p.get(PARTICLE_MASS)}`.padEnd(pad)
        writer.write(`|${name}|${mass}|`)
    }
}