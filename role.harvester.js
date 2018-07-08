const params = require('params');
const roleBase = require('role.base');

const roleHarvester = {

    moveToSource: function(creep) {
        const target = Game.getObjectById(creep.memory.target);
        if (!target) {
            if (!params.sources[creep.memory.target]) {
                creep.memory.target = null;
            } else {
                creep.moveTo(params.sources[creep.memory.target].pos, {visualizePathStyle: {stroke: '#ffaa00'}})
            }
        } else if (target.energy === 0 || (target.store && target.store[RESOURCE_ENERGY] === 0)) {
            creep.memory.target = null;
        } else {
            if (creep.harvest(target) === ERR_NOT_IN_RANGE || creep.pickup(target) === ERR_NOT_IN_RANGE || creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.dumping && creep.carry.energy < 50) {
            creep.memory.dumping = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.dumping && creep.carry.energy === creep.carryCapacity) {
            creep.memory.dumping = true;
            creep.say('🚚 dump');
        }

	    if (!creep.memory.dumping) {
	        if (creep.memory.target == null) {
                let target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
                    filter: (resource) => {
                        return (resource.energy > 50);
                    }
                });
                if (target) {
                    creep.memory.target = target.id;
                } else {
                    let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType === STRUCTURE_CONTAINER || structure.structureType === STRUCTURE_STORAGE)
                                && (structure.store[RESOURCE_ENERGY] > 50);
                        }
                    });
                    if (target) {
                        creep.memory.target = target.id;
                    } else {
                        let otherGoing = {};
                        for (let c of creep.room.find(FIND_MY_CREEPS)) {
                            if (c !== creep && c.memory.target) {
                                if (!otherGoing[c.memory.target]) {
                                    otherGoing[c.memory.target] = 1;
                                } else {
                                    otherGoing[c.memory.target] += 1;
                                }
                            }
                        }
                        for (let sourceID of Object.keys(params.sources)) {
                            if ((Game.getObjectById(sourceID) === null || Game.getObjectById(sourceID).energy !== 0)
                                && (!otherGoing[sourceID] || otherGoing[sourceID] < params.sources[sourceID].capacity)) {
                                creep.memory.target = sourceID;
                                break;
                            }
                        }
                        if (creep.memory.target == null) {
                            creep.memory.target = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE).id;
                        }
                    }
                }
            }
            this.moveToSource(creep);
        } else {
	        creep.memory.target = null;
            let target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    const range = creep.pos.getRangeTo(structure);
                    return ((structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN)
                        && structure.energy < structure.energyCapacity)
                        || (structure.structureType === STRUCTURE_TOWER && (range < (1-structure.energy/structure.energyCapacity)*60))
                        // || ((structure.structureType === STRUCTURE_CONTAINER
                        //     || structure.structureType === STRUCTURE_STORAGE)
                        //     && structure.store[RESOURCE_ENERGY] < structure.storeCapacity)
                }
            });
            // if (!target) {
            //     target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            //         filter: (structure) => {
            //             return ((structure.structureType === STRUCTURE_CONTAINER
            //                 || structure.structureType === STRUCTURE_STORAGE)
            //                 && structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
            //         }
            //     });
            // }
            if(target) {
                if(creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                for (let roomName of Object.keys(Game.rooms)) {
                    let targets = Game.rooms[roomName].find(FIND_MY_STRUCTURES, {
                        filter: (structure) => {
                            const range = creep.pos.getRangeTo(structure);
                            return ((structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN)
                                && structure.energy < structure.energyCapacity)
                                || (structure.structureType === STRUCTURE_TOWER && (range < (1-structure.energy/structure.energyCapacity)*60))
                            // || ((structure.structureType === STRUCTURE_CONTAINER
                            //     || structure.structureType === STRUCTURE_STORAGE)
                            //     && structure.store[RESOURCE_ENERGY] < structure.storeCapacity)
                        }
                    });
                    // if (!targets.length) {
                    //     targets = Game.rooms[roomName].find(FIND_STRUCTURES, {
                    //         filter: (structure) => {
                    //             return ((structure.structureType === STRUCTURE_CONTAINER
                    //                 || structure.structureType === STRUCTURE_STORAGE)
                    //                 && structure.store[RESOURCE_ENERGY] < structure.storeCapacity);
                    //         }
                    //     });
                    // }
                    if (targets.length) {
                        const target = targets[0];
                        if(creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                        break;
                    }
                }
                // creep.moveTo(creep.room.controller.pos, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
	}


	
};

module.exports = roleHarvester;