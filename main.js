const roleBuilder = require('role.builder');
const roleMiner = require('role.miner');
const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleDefender = require('role.defender');
const roleClaimer = require('role.claimer');
const roleSneaker = require('role.sneaker');
const towerManager = require('towerManager');
const params = require('params');

const creepMap = {
    defender: {
        num: 2,
        parts: [TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
    },
    miner: {
        num: 1,
        parts: [WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
    },
    harvester: {
        num: 6,
        parts: [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
    },
    builder: {
        num: 4,
        parts: [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
    },
    upgrader: {
        num: 4,
        parts: [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
    },
    sneaker: {
        num: 0,
        parts: [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
    },
    claimer: {
        num: 0,
        parts: [CLAIM,MOVE],
    },
};

// const numDefenders = 3; // 2
// const numMiners = 2; // 8
// const numHarvesters = 7; // 8
// const numBuilders = 4; // 5
// const numUpgraders = 5; // 4
// const numSneakers = 0; // 0
// const numClaimers = 0; // 0
//
// const bodyDefenders =  [TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
// const bodyMiners = [WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
// const bodyHarvesters = [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
// const bodyBuilders =   [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
// const bodyUpgraders =  [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
// const bodySneakers =   [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
// const bodyClaimers =   [CLAIM,MOVE];


const countBodyParts = function (parts) {
    let num = 0;
    for (const p of parts) {
        if (p === MOVE) {num += 50}
        else if (p === WORK) {num += 100}
        else if (p === CARRY) {num += 50}
        else if (p === ATTACK) {num += 80}
        else if (p === RANGED_ATTACK) {num += 150}
        else if (p === HEAL) {num += 250}
        else if (p === TOUGH) {num += 10}
        else if (p === CLAIM) {num += 600}
    }
    return num;
};

// for (const b of [bodyDefenders,bodyMiners,bodyHarvesters,bodyBuilders,bodyUpgraders,bodySneakers,bodyClaimers]) {
//     console.log(b, countBodyParts(b))
// }

module.exports.loop = function () {

    for(const name of Object.keys(Memory.creeps)) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    let creepString = "";
    for (const type of Object.keys(creepMap)) {
        creepMap[type].creeps = _.filter(Game.creeps, (creep) => creep.memory.role === type);
        creepString += `${type}: ${creepMap[type].creeps.length}; `;
    }

    let energyString = "";
    for (let spawn of Object.keys(Game.spawns)) {
        energyString += `${spawn}: ${params.getEnergy(Game.spawns[spawn].room)}/${params.getEnergyCap(Game.spawns[spawn].room)}; `;
    }
    console.log(energyString+creepString);

    for (let spawn of Object.keys(Game.spawns)) {
        const spawnEnergy = params.getEnergy(Game.spawns[spawn].room);
        const spawnEnergyCap = params.getEnergyCap(Game.spawns[spawn].room);
        if (!Game.spawns[spawn].spawning) {

            for (let type of Object.keys(creepMap)) {
                let bodyParts = creepMap[type].parts;
                if (spawnEnergy < countBodyParts(bodyParts)
                    && (type === "harvester" || type === "builder" || type === "upgrader")
                    && creepMap[type].creeps.length < 1) {
                    let bodyDict = {};
                    for (let part of bodyParts) {
                        if (bodyDict[part]) {
                            bodyDict[part] += 1
                        } else {
                            bodyDict[part] = 1
                        }
                    }
                    while (spawnEnergy < countBodyParts(bodyParts)) {
                        bodyParts = [];
                        const min = Math.min(...Object.values(bodyDict));
                        for (let k of Object.keys(bodyDict)) {
                            bodyDict[k] -= bodyDict[k]/min;
                            for (let i = 0; i < bodyDict[k]; i++) {
                                bodyParts.push(k);
                            }
                        }
                    }
                }
                if (creepMap[type].creeps.length < creepMap[type].num && spawnEnergy >= countBodyParts(bodyParts)) {
                    const newName = type + Game.time;
                    console.log(`Spawning new ${type}: ${newName}`);
                    Game.spawns[spawn].spawnCreep(bodyParts, newName,
                        {memory: {role: type}});
                    break;
                }
            }

        }
    }
    
    for (let s of Object.keys(Game.spawns)) {
        let spawn = Game.spawns[s];
        if (spawn.spawning) {
            const spawningCreep = Game.creeps[spawn.spawning.name];
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                spawn.pos.x + 1, 
                spawn.pos.y, 
                {align: 'left', opacity: 0.8});
        }
    }

    for(const name of Object.keys(Game.creeps)) {
        const creep = Game.creeps[name];
        if(creep.memory.role === 'harvester') {
            roleHarvester.run(creep);
        } else if(creep.memory.role === 'miner') {
            roleMiner.run(creep);
        } else if(creep.memory.role === 'upgrader') {
            roleUpgrader.run(creep);
        } else if(creep.memory.role === 'builder') {
            roleBuilder.run(creep);
        } else if(creep.memory.role === 'defender') {
            roleDefender.run(creep);
        } else if(creep.memory.role === 'sneaker') {
            roleSneaker.run(creep);
        } else if(creep.memory.role === 'claimer') {
            roleClaimer.run(creep);
        }
    }

    towerManager.run()

};
