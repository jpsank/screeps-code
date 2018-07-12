const params = require('params');
const roleBase = require('role.base');

const roleBuilder = {

    moveToSource: function(creep) {
        const target = Game.getObjectById(creep.memory.target);
        if (!target) {
            if (params.sources[creep.memory.target]) {
                creep.moveTo(params.sources[creep.memory.target].pos, {visualizePathStyle: {stroke: '#ffaa00'}})
            } else {
                creep.memory.target = null;
            }
        } else if (target.energy === 0 || (target.store && target.store[RESOURCE_ENERGY] === 0)) {
            creep.memory.target = null;
        } else if (creep.harvest(target) === ERR_NOT_IN_RANGE || creep.withdraw(target,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE || creep.pickup(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    },

	repairStuff: function(creep) {
        for (const room of Object.values(Game.rooms)) {
            if (!room.controller.owner || room.controller.my) {
                const targets = room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        if (!structure.owner || structure.my) {
                            if (structure.structureType === STRUCTURE_RAMPART || structure.structureType === STRUCTURE_WALL) {
                                return structure.hits < 110000;
                            } else {
                                return (structure.hits < structure.hitsMax);
                            }
                        }
                    }
                }).sort(function (a, b) {
                    return (a.hits / a.hitsMax) - (b.hits / b.hitsMax);
                });
                const target = targets[0];
                if (target) {
                    if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
            }
        }
	},

    /** @param {Creep} creep **/
    run: function(creep) {

        creep.memory.target = null;

    	const buildID = null;
    	const buildObject = Game.getObjectById(buildID);
        
	    if(creep.memory.building && creep.carry.energy === 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('🚧 build');
	    }

	    if(creep.memory.building) {
            creep.memory.target = null;

            if (buildObject) {
                let target = buildObject;
                if (creep.build(target) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                const target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        const range = creep.pos.getRangeTo(structure);
                        return structure.structureType === STRUCTURE_TOWER
                            && (range < (1-structure.energy/structure.energyCapacity)*100);
                    }
                });
                if (target) {
                    if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    const target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (s) => {
                            if ((!s.owner || s.my) && (!s.room.controller.owner || s.room.controller.my)) {
                                const range = creep.pos.getRangeTo(s);
                                if (s.structureType === STRUCTURE_RAMPART || s.structureType === STRUCTURE_WALL) {
                                    return (range < (1-s.hits/110000)*100);
                                } else {
                                    return (s.hits < s.hitsMax / 2 || (s.hits < s.hitsMax * .75 && range < 4));
                                }
                            }
                        }
                    });
                    if (target) {
                        if (target.structureType === STRUCTURE_TOWER) {
                            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        }
                        if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    } else {
                        let target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                        if (target) {
                            if (creep.build(target) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                        } else {
                            this.repairStuff(creep);
                        }
                    }
                }
            }
	    }
	    else {
            if (creep.memory.target == null) {
                let target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                    filter: (resource) => {
                        return (resource.energy > 50);
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
                    let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (s) => {
                            return (!s.room.controller.owner || s.room.controller.my)
                                && (s.structureType === STRUCTURE_CONTAINER || (s.structureType === STRUCTURE_STORAGE && s.my))
                                && s.store[RESOURCE_ENERGY] > 50;
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
                        let sourcesAvailable = Object.keys(params.sources).filter(
                            sourceID => {
                                return ((Game.getObjectById(sourceID) === null || Game.getObjectById(sourceID).energy !== 0)
                                    && (!otherGoing[sourceID] || otherGoing[sourceID] < params.sources[sourceID].capacity));
                            }
                        ).sort(function (a, b) {
                            return (creep.pos.getRangeTo(Game.getObjectById(a)) + Object.keys(params.sources).indexOf(a))
                                - (creep.pos.getRangeTo(Game.getObjectById(b)) + Object.keys(params.sources).indexOf(b));
                        });
                        creep.memory.target = sourcesAvailable[0];

                        if (creep.memory.target == null) {
                            target = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE, {
                                filter: source => (source.energy !== 0 && (!source.room.controller.owner || source.room.controller.my))
                            });
                            if (!target) {
                                for (let room of Object.values(Game.rooms)) {
                                    target = room.find(FIND_SOURCES_ACTIVE, {
                                        filter: source => (source.energy !== 0 && (!source.room.controller.owner || source.room.controller.my))
                                    })[0];
                                    if (target) {
                                        break;
                                    }
                                }
                            }
                            if (target) {
                                creep.memory.target = target.id;
                            }
                        }
                    }
                }
            }
            this.moveToSource(creep);
	    }
	}
};

module.exports = roleBuilder;