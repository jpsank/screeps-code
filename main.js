const roleBuilder = require('role.builder');
const roleMiner = require('role.miner');
const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleDefender = require('role.defender');
const roleClaimer = require('role.claimer');
const roleSneaker = require('role.sneaker');
const roleLabber = require('role.labber');
const towerManager = require('towerManager');
const params = require('params');

const _ = require('lodash');

RoomPosition.prototype.hasPathTo = function(target, opts){
    return this.isNearTo(target) || this.findClosestByPath([target], opts);
};

// mapping of creep spawnage, in order of priority
const creepMap = {
    defender: {
        num: 2,
        parts: [TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
    },
    miner: {
        num: 4,
        parts: [WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
    },
    harvester: {
        num: 7,
        parts: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
    },
    builder: {
        num: 4,
        parts: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
    },
    upgrader: {
        num: 5,
        parts: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
    },
    labber: {
        num: 2,
        parts: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
    },
    sneaker: {
        num: 0,
        parts: [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
    },
    claimer: {
        num: 0,
        parts: [CLAIM,MOVE],
    },
};

const logTable = function (rows) {
    let maxLen = 0;
    for (const row of rows) {
        const longest = [...row].sort((a, b) => (b.length-a.length))[0];
        if (longest.length > maxLen) {
            maxLen = longest.length;
        }
    }
    maxLen += 2; // padding
    for (const row of rows) {
        let str = '';
        for (const col of row) {
            str += col+' '.repeat(maxLen-col.length);
        }
        console.log(str);
    }
};


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

    let statTable = [ ['spawn','energy',...Object.keys(creepMap)] ];

    for (let spawn of Object.keys(Game.spawns)) {
        const spawnEnergy = params.getEnergy(Game.spawns[spawn].room);
        const spawnEnergyCap = params.getEnergyCap(Game.spawns[spawn].room);
        statTable.push([spawn,`${spawnEnergy}/${spawnEnergyCap}`]);
        for (let type of Object.keys(creepMap)) {
            creepMap[type].creeps = Game.spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (creep) => creep.memory.role === type});

            if (!Game.spawns[spawn].spawning) {
                let bodyParts = creepMap[type].parts;
                // handle crisis situation
                const inRoomCount = Game.spawns[spawn].room.find(FIND_MY_CREEPS, {filter: (c) => c.memory.role === type});
                if ((type === "harvester" || type === "builder" || type === "upgrader" || type === "miner")
                    && ((spawnEnergy < countBodyParts(bodyParts) && inRoomCount < 1)
                        || (spawnEnergy === spawnEnergyCap && spawnEnergyCap < countBodyParts(bodyParts)))) {
                    let bodyDict = {};
                    for (let part of bodyParts) {
                        if (bodyDict[part]) {
                            bodyDict[part] += 1
                        } else {
                            bodyDict[part] = 1
                        }
                    }
                    while (spawnEnergy < countBodyParts(bodyParts)) {
                        const min = Math.min(...Object.values(bodyDict));
                        if (min < 2) {
                            break;
                        }

                        bodyParts = [];
                        for (let k of Object.keys(bodyDict)) {
                            bodyDict[k] -= bodyDict[k] / min;
                            for (let i = 0; i < bodyDict[k]; i++) {
                                bodyParts.push(k);
                            }
                        }
                    }
                }

                if (creepMap[type].creeps.length < creepMap[type].num && spawnEnergy >= countBodyParts(bodyParts)) {
                    const newName = type + Game.time;
                    console.log(`${spawn} spawning new ${type}: ${newName}`);
                    Game.spawns[spawn].spawnCreep(bodyParts, newName,
                        {memory: {role: type}});
                    break;
                }
            }
            statTable[statTable.length-1].push(creepMap[type].creeps.length.toString());
        }
    }

    logTable(statTable);

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
        } else if(creep.memory.role === 'labber') {
            roleLabber.run(creep);
        }
    }

    towerManager.run()

};
