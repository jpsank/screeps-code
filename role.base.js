const params = require('params');

const roleBase = {

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

    /** @param {Creep} creep **/
    run: function(creep) {

    }
};

module.exports = roleBase;