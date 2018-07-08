const roleBuilder = require('role.builder');
const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleDefender = require('role.defender');
const roleClaimer = require('role.claimer');
const roleSneaker = require('role.sneaker');
const towerManager = require('towerManager');
const params = require('params');

if (!String.prototype.format) {
    String.prototype.format = function() {
        const args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] !== 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

const numDefenders = 3; // 2
const numHarvesters = 7; // 8
const numBuilders = 4; // 5
const numUpgraders = 4; // 4
const numSneakers = 0; // 0
const numClaimers = 0; // 0

const bodyDefenders =  [TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
const bodyHarvesters = [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
const bodyBuilders =   [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
const bodyUpgraders =  [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
const bodySneakers =   [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE];
const bodyClaimers =   [CLAIM,MOVE];


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

for (const b of [bodyDefenders,bodyHarvesters,bodyBuilders,bodyUpgraders,bodySneakers,bodyClaimers]) {
    console.log(b, countBodyParts(b))
}

module.exports.loop = function () {

    for(const name of Object.keys(Memory.creeps)) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
    const builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder');
    const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader');
    const defenders = _.filter(Game.creeps, (creep) => creep.memory.role === 'defender');
    const sneakers = _.filter(Game.creeps, (creep) => creep.memory.role === 'sneaker');
    const claimers = _.filter(Game.creeps, (creep) => creep.memory.role === 'claimer');

    console.log("Energy: {0}; Defenders: {1}; Harvesters: {2}; Builders: {3}; Upgraders: {4}; Sneakers: {5}; Claimers: {6}".format(
        params.getEnergy(),
        defenders.length,
        harvesters.length,
        builders.length,
        upgraders.length,
        sneakers.length,
        claimers.length
    ));
    // console.log("Energy: "+params.getEnergy()+
    // "; Defenders: "+defenders.length+
    // "; Harvesters: "+harvesters.length+
    // "; Builders: "+builders.length+
    // "; Upgraders: "+upgraders.length+
    // "; Claimers: "+claimers.length+
    // "; Sneakers: "+sneakers.length);

    for (let spawn of Object.keys(Game.spawns)) {
        if (!Game.spawns[spawn].spawning) {
            const spawnEnergy = params.getEnergy();
            if (harvesters.length < 1 && spawnEnergy >= countBodyParts(bodyHarvesters)) {
                const newName = 'Harvester' + Game.time;
                console.log('Spawning new harvester: ' + newName);
                Game.spawns[spawn].spawnCreep(bodyHarvesters, newName,
                    {memory: {role: 'harvester'}});
            } else if (builders.length < 1 && spawnEnergy >= countBodyParts(bodyBuilders)) {
                const newName = 'Builder' + Game.time;
                console.log('Spawning new builder: ' + newName);
                Game.spawns[spawn].spawnCreep(bodyBuilders, newName,
                    {memory: {role: 'builder'}});
            } else if (upgraders.length < 1 && spawnEnergy >= countBodyParts(bodyUpgraders)) {
                const newName = 'Upgrader' + Game.time;
                console.log('Spawning new upgrader: ' + newName);
                Game.spawns[spawn].spawnCreep(bodyUpgraders, newName,
                    {memory: {role: 'upgrader'}});
            }

            else if (defenders.length < numDefenders && spawnEnergy >= countBodyParts(bodyDefenders)) {
                const newName = 'Defender' + Game.time;
                console.log('Spawning new defender: ' + newName);
                Game.spawns[spawn].spawnCreep(bodyDefenders, newName,
                    {memory: {role: 'defender'}});
            } else if (harvesters.length < numHarvesters && spawnEnergy >= countBodyParts(bodyHarvesters)) {
                const newName = 'Harvester' + Game.time;
                console.log('Spawning new harvester: ' + newName);
                Game.spawns[spawn].spawnCreep(bodyHarvesters, newName,
                    {memory: {role: 'harvester'}});
            } else if (builders.length < numBuilders && spawnEnergy >= countBodyParts(bodyBuilders)) {
                const newName = 'Builder' + Game.time;
                console.log('Spawning new builder: ' + newName);
                Game.spawns[spawn].spawnCreep(bodyBuilders, newName,
                    {memory: {role: 'builder'}});
            } else if (upgraders.length < numUpgraders && spawnEnergy >= countBodyParts(bodyUpgraders)) {
                const newName = 'Upgrader' + Game.time;
                console.log('Spawning new upgrader: ' + newName);
                Game.spawns[spawn].spawnCreep(bodyUpgraders, newName,
                    {memory: {role: 'upgrader'}});
            } else if (sneakers.length < numSneakers && spawnEnergy >= countBodyParts(bodySneakers)) {
                const newName = 'Sneaker' + Game.time;
                console.log('Spawning new sneaker: ' + newName);
                Game.spawns[spawn].spawnCreep(bodySneakers, newName,
                    {memory: {role: 'sneaker'}});
            } else if (claimers.length < numClaimers && spawnEnergy >= countBodyParts(bodyClaimers)) {
                const newName = 'Claimer' + Game.time;
                console.log('Spawning new claimer: ' + newName);
                Game.spawns[spawn].spawnCreep(bodyClaimers, newName,
                    {memory: {role: 'claimer'}});
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
