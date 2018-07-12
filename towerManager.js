const params = require('params');

const towerManager = {

    run: function() {

        for (let room of Object.values(Game.rooms)) {
            const towers = room.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
            if (towers.length) {
                const hostiles = room.find(FIND_HOSTILE_CREEPS, {
                    filter: (hostile) => {
                        return params.allies.indexOf(hostile.owner.username) === -1;
                    }
                });

                if (hostiles.length > 0) {
                    const target = hostiles[0];
                    Game.notify(`WARNING: Tower(s) attacking hostile \"${target.name}\", owned by \"${target.owner.username}\" (location: ${target.pos})`);
                    console.log("Tower(s) attacking hostile \"" + target.name + "\"");
                    towers.forEach(tower => tower.attack(target));
                } else {
                    for (let name of Object.keys(Game.creeps)) {
                        const creep = Game.creeps[name];
                        if (creep.hits < creep.hitsMax) {
                            towers.forEach(tower => tower.heal(creep));
                            console.log(`Tower(s) healing creep ${name}`);
                        }
                    }

                    for (const tower of towers) {
                        if (tower.energy > tower.energyCapacity * .9) {
                            const targets = tower.room.find(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    if (structure.structureType === STRUCTURE_RAMPART || structure.structureType === STRUCTURE_WALL) {
                                        return (structure.hits < 1000000)
                                    } else {
                                        return (structure.hits < structure.hitsMax * .8);
                                    }
                                }
                            }).sort(function (a, b) {
                                return (a.hits / a.hitsMax) - (b.hits / b.hitsMax);
                            });
                            const target = targets[0];
                            if (target) {
                                tower.repair(target);
                                console.log("Tower repairing " + target.structureType);
                            }
                        }
                    }

                }
            }
        }
    }
};

module.exports = towerManager;