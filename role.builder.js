const params = require('params');

const roleBuilder = {

    moveToSource: function(creep) {
        const target = Game.getObjectById(creep.memory.target);
        if (!target) {
            creep.moveTo(params.sources[creep.memory.target].pos, {visualizePathStyle: {stroke: '#ffaa00'}})
        } else if (target.energy === 0 || (target.store && target.store[RESOURCE_ENERGY] === 0)) {
            creep.memory.target = null;
        } else if (creep.harvest(target) === ERR_NOT_IN_RANGE || creep.withdraw(target,RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    },

	repairStuff: function(creep) {
        const targets = creep.room.find(FIND_MY_STRUCTURES);
        if (targets.length) {
            let target = null;
            for (let t of targets) {
                if (target == null || (t.hits / t.hitsMax) < (target.hits / target.hitsMax)) {
                    target = t;
                }
            }
            if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            creep.moveTo(params.home, {visualizePathStyle: {stroke: '#ffffff'}});
        }
	},

    /** @param {Creep} creep **/
    run: function(creep) {

    	const buildID = "5b4171959c138c4544fb7c3f";
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

            const target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure) => {
                    const inRange = (Math.abs(structure.x - creep.pos.x) < 4 && Math.abs(structure.y - creep.pos.y) < 4);
                    return structure.structureType === STRUCTURE_TOWER
                        && ((structure.energy < structure.energyCapacity-50) || (inRange && structure.energy < structure.energyCapacity));
                }
            });
            if (target) {
                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                const target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        const inRange = (Math.abs(structure.x - creep.pos.x) < 4 && Math.abs(structure.y - creep.pos.y) < 4);
                        if (structure.structureType === STRUCTURE_RAMPART || structure.structureType === STRUCTURE_WALL) {
                            return (structure.hits < 100000 || (structure.hits < 150000 && inRange))
                        } else {
                            return (structure.hits < structure.hitsMax / 2 || (structure.hits < structure.hitsMax * .75 && inRange));
                        }
                    }
                });
                if (target) {
                    if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    if (buildObject) {
                        let target = buildObject;
                        if (creep.build(target) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                        }
                    } else {
                        let target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
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
                let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_CONTAINER
                            || structure.structureType === STRUCTURE_STORAGE)
                            && structure.store[RESOURCE_ENERGY] > 0;
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
                        creep.memory.target = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE, {
                            filter: source => source.energy !== 0
                        }).id;
                    }
                }
            }
            this.moveToSource(creep);
	    }
	}
};

module.exports = roleBuilder;