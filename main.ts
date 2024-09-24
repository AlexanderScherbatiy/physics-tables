
const PARTICLE_NAME = "PARTICLE_NAME"
const PARTICLE_MASS = "PARTICLE_MASS" // kg

class Particle {
    public properties: Map<string, any>
    constructor(props: [key: string, value: any][]) {
        this.properties = new Map<string, any>(props)
    }
}

const particles: Particle[] = [
    new Particle([
        [PARTICLE_NAME, "electron"],
        [PARTICLE_MASS, 9.1e-31],
    ]),
    new Particle([
        [PARTICLE_NAME, "proton"],
        [PARTICLE_MASS, 1.7e-27],
    ]),
]

const map2 = new Map<string, string>([["one", "1"], ["two", "two"]])

for (const particle of particles) {
    for (const [key, value] of particle.properties) {
        console.log(`key: ${key}, value: ${value}`)
    }
}
