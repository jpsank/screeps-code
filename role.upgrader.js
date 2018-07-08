const params = require('params');

const roleUpgrader = {

    moveToTarget: function(creep) {
        const target = Game.getObjectById(creep.memory.target);
        if (!target) {
            creep.moveTo(params.sources[creep.memory.target].pos, {visualizePathStyle: {stroke: '#ffaa00'}})
        } else if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
            creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.upgrading && creep.carry.energy === 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy === creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
            creep.memory.target = null;
            if(creep.upgradeController(creep.room.controller) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            if (creep.memory.target == null) {
                creep.memory.target = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE).id;
            }
            this.moveToTarget(creep);
        }
	}
};

module.exports = roleUpgrader;