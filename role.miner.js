const params = require('params');
const roleBase = require('role.base');

const roleMiner = {

    moveToContainer: function(creep) {
        const target = Game.getObjectById(creep.memory.target);
        const ctarget = Game.getObjectById(creep.memory.ctarget);
        if (!target) {
            if (params.sources[creep.memory.target]) {
                creep.moveTo(params.sources[creep.memory.target].pos, {visualizePathStyle: {stroke: '#ffaa00'}})
            } else {
                creep.memory.target = null;
            }
        } else {
            creep.moveTo(ctarget, {visualizePathStyle: {stroke: '#ffaa00'}});
            if (creep.pos.isEqualTo(ctarget.pos)) {
                creep.harvest(target);
            }
            if (ctarget.pos.lookFor(LOOK_CREEPS).filter((c) => (c !== creep)).length > 0) {
                creep.memory.target = null;
            }
        }
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        // creep.memory.target = null;

        if (creep.memory.target == null) {
            let otherGoing = {};
            for (const name of Object.keys(Game.creeps)) {
                const c = Game.creeps[name];
                if (c !== creep && c.memory.ctarget) {
                    if (!otherGoing[c.memory.ctarget]) {
                        otherGoing[c.memory.ctarget] = 1;
                    } else {
                        otherGoing[c.memory.ctarget] += 1;
                    }
                }
            }
            for (const room of Object.values(Game.rooms).reverse()) {
                let containers = room.find(FIND_STRUCTURES, {
                    filter: (s) => ((s.structureType === STRUCTURE_CONTAINER)
                        && s.pos.findInRange(FIND_SOURCES_ACTIVE, 1).length > 0
                        && !otherGoing[s.id])
                }).sort(function (a, b) {
                    // let energyA;
                    // let energyB;
                    // if (a.store !== undefined) {
                    //     energyA = a.store[RESOURCE_ENERGY]/a.storeCapacity;
                    // } else {
                    //     energyA = a.energy/a.energyCapacity;
                    // }
                    // if (b.store !== undefined) {
                    //     energyB = b.store[RESOURCE_ENERGY]/b.storeCapacity;
                    // } else {
                    //     energyB = b.energy/b.energyCapacity;
                    // }
                    return a.store[RESOURCE_ENERGY] - b.store[RESOURCE_ENERGY];
                });
                const ctarget = containers[0];
                if (ctarget) {
                    creep.memory.ctarget = ctarget.id;
                    creep.memory.target = ctarget.pos.findInRange(FIND_SOURCES_ACTIVE, 1)[0].id;
                    break;
                }
            }
        }
        if (creep.memory.target != null) {
            this.moveToContainer(creep);
        }
    }



};

module.exports = roleMiner;