const params = require('params');
const roleBase = require('role.base');

const roleUpgrader = {

    moveToTarget: function(creep) {
        const target = Game.getObjectById(creep.memory.target);
        if (!target) {
            if (params.sources[creep.memory.target]) {
                creep.moveTo(params.sources[creep.memory.target].pos, {visualizePathStyle: {stroke: '#ffaa00'}})
            } else {
                creep.memory.target = null;
            }
        } else {
            if (target.energy === 0 || (target.store && target.store[RESOURCE_ENERGY] === 0)) {
                creep.memory.target = null;
            } else if (creep.harvest(target) === ERR_NOT_IN_RANGE
                || creep.pickup(target) === ERR_NOT_IN_RANGE
                || creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
            } else if (creep.harvest(target) === ERR_NO_PATH) {
                creep.memory.target = null;
            }
        }
    },

    /** @param {Creep} creep **/
    run: function(creep) {

        const targetRoomName = null;
        const targetRoom = Game.rooms[targetRoomName];

        if(creep.memory.upgrading && creep.carry.energy === 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if (targetRoom && creep.room !== targetRoom) {
            creep.moveTo(new RoomPosition(25,25,targetRoomName), {visualizePathStyle: {stroke: '#ffffff'}})
        }
        else if(creep.memory.upgrading) {
            creep.memory.target = null;
            if (creep.room.controller.my) {
                if (creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                const exitDir = creep.room.findExitTo(params.homeRoom);
                creep.moveTo(creep.pos.findClosestByRange(exitDir), {visualizePathStyle: {stroke: '#ffffff'}});
            }
        } else {
            if (creep.memory.target === null) {
                let target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                    filter: (resource) => {
                        return (resource.energy > 50 && resource.room === creep.room);
                    }
                });
                if (target) {
                    creep.memory.target = target.id;
                } else {

                    let target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType === STRUCTURE_CONTAINER
                                || structure.structureType === STRUCTURE_STORAGE)
                                && structure.store[RESOURCE_ENERGY] > 50;
                        }
                    });
                    const source = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE, {
                        filter: (s) => (s.energy > 0 && creep.pos.hasPathTo(s))
                    });
                    if (target && (creep.pos.getRangeTo(target) <= creep.pos.getRangeTo(source) || !source)) {
                        creep.memory.target = target.id;
                    } else if (source) {
                        creep.memory.target = source.id;
                    } else {
                        creep.memory.target = null;
                    }
                }
            }
            this.moveToTarget(creep);
        }
	}
};

module.exports = roleUpgrader;