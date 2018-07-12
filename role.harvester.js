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
        } else if (target.energy === 0 || (target.store && _.sum(target.store) === 0)) {
            creep.memory.target = null;
        } else {
            if (target.store && Object.keys(target.store).length > 1) {
                const resource = Object.keys(target.store).filter((r) => r !== RESOURCE_ENERGY)[0];
                if (creep.withdraw(target, resource) === ERR_NOT_IN_RANGE || creep.pickup(target) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            } else if (creep.harvest(target) === ERR_NOT_IN_RANGE
                || creep.pickup(target) === ERR_NOT_IN_RANGE
                || creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        //creep.memory.target = null;
        // if (creep.name === 'harvester7804081') {
        //     if (creep.roomName.name === 'E27N51') {
        //         if (creep.transfer(creep.roomName.terminal, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
        //             creep.moveTo(creep.roomName.terminal);
        //         }
        //     } else {
        //         creep.moveTo(new RoomPosition(25,25,'E27N51'));
        //     }
        //     return;
        // }

        if(creep.memory.dumping && _.sum(creep.carry) < 50) {
            creep.memory.dumping = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.dumping && _.sum(creep.carry) === creep.carryCapacity) {
            creep.memory.dumping = true;
            creep.say('🚚 dump');
        }

	    if (!creep.memory.dumping) {
            let target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                filter: (resource) => {
                    return (resource.resourceType !== RESOURCE_ENERGY);
                }
            });
            if (target) {
                creep.memory.target = target.id;
            }
	        if (creep.memory.target == null) {
	            let target = null;
	            if (creep.room.terminal) {
                    target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                        filter: (s) => {
                            return (s.structureType === STRUCTURE_STORAGE
                                && _.sum(Object.values(s.store).filter((s) => s !== RESOURCE_ENERGY)) > 0);
                        }
                    });
                }
                if (target) {
                    creep.memory.target = target.id;
                } else {
                    target = creep.pos.findClosestByRange(FIND_TOMBSTONES, {
                        filter: (tombstone) => {
                            const store = _.sum(tombstone.store);
                            return (store > 50) || (store > 0 && creep.pos.isNearTo(tombstone));
                        }
                    });
                    if (target) {
                        creep.memory.target = target.id;
                    } else {
                        let target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                            filter: (resource) => {
                                return ((resource.resourceType === RESOURCE_ENERGY && resource.amount > 50));
                            }
                        });
                        if (!target) {
                            for (let room of Object.values(Game.rooms)) {
                                if (!room.controller.owner || room.controller.my) {
                                    let targets = room.find(FIND_DROPPED_RESOURCES, {
                                        filter: (resource) => {
                                            return (resource.energy >= creep.carryCapacity);
                                        }
                                    });
                                    if (targets[0]) {
                                        target = targets[0];
                                        break;
                                    }
                                }
                            }
                        }
                        if (target) {
                            creep.memory.target = target.id;
                        } else {
                            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return (structure.structureType === STRUCTURE_CONTAINER)
                                        && (structure.store[RESOURCE_ENERGY] > 50);
                                }
                            });
                            if (!target) {
                                let target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                                    filter: (structure) => {
                                        return (structure.structureType === STRUCTURE_STORAGE)
                                            && (structure.store[RESOURCE_ENERGY] > 50);
                                    }
                                });
                            }
                            if (target) {
                                creep.memory.target = target.id;
                            } else {
                                let otherGoing = {};
                                for (const name of Object.keys(Game.creeps)) {
                                    const c = Game.creeps[name];
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
                                    let target = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
                                    if (!target) {
                                        for (let room of Object.values(Game.rooms)) {
                                            target = room.find(FIND_SOURCES_ACTIVE)[0];
                                            if (target) {
                                                break;
                                            }
                                        }
                                    }
                                    creep.memory.target = target.id;
                                }
                            }
                        }
                    }
                }
            }
            this.moveToSource(creep);
        } else {
	        creep.memory.target = null;

	        let target = null;
	        if (_.some(Object.keys(creep.carry), (r) => (r !== RESOURCE_ENERGY))) {
	            target = creep.room.terminal;
	            if (!target) {
                    target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                        filter: (s) => {
                            return (s.structureType === STRUCTURE_STORAGE && _.sum(s.store) < s.storeCapacity);
                        }
                    });
                    if (!target) {
                        for (let room of Object.values(Game.rooms)) {
                            target = room.find(FIND_MY_STRUCTURES, {
                                filter: (s) => {
                                    return (s.structureType === STRUCTURE_STORAGE && _.sum(s.store) < s.storeCapacity);
                                }
                            });
                            if (target) {
                                break;
                            }
                        }
                    }
                }
            }
            if (target) {
	            const resource = _.filter(Object.keys(creep.carry), (r) => (r !== RESOURCE_ENERGY))[0];
                if (creep.transfer(target, resource) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (s) => {
                        const range = creep.pos.getRangeTo(s);
                        return ((s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN)
                            && s.energy < s.energyCapacity)
                            || (s.structureType === STRUCTURE_TOWER && (range < (1 - s.energy / s.energyCapacity) * 60))
                            || ((s.structureType === STRUCTURE_LINK || s.structureType === STRUCTURE_TERMINAL) && _.sum(s.store) < s.storeCapacity)
                    }
                });
                if (!target) {
                    target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                        filter: (s) => {
                            return (s.structureType === STRUCTURE_STORAGE
                                && s.store[RESOURCE_ENERGY] < s.storeCapacity);
                        }
                    });
                }
                if (target) {
                    if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    for (let room of Object.values(Game.rooms)) {
                        let targets = room.find(FIND_MY_STRUCTURES, {
                            filter: (structure) => {
                                const range = creep.pos.getRangeTo(structure);
                                return ((structure.structureType === STRUCTURE_EXTENSION || structure.structureType === STRUCTURE_SPAWN)
                                    && structure.energy < structure.energyCapacity)
                                    || (structure.structureType === STRUCTURE_TOWER && (range < (1 - structure.energy / structure.energyCapacity) * 60))
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
                            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                            break;
                        }
                    }
                    // creep.moveTo(creep.roomName.controller.pos, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
	}


	
};

module.exports = roleHarvester;