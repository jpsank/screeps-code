const params = require('params');
const roleBase = require('role.base');

const roleLabber = {
    run: function (creep) {

        if (creep.ticksToLive <= creep.pos.getRangeTo(creep.room.terminal) && _.sum(creep.carry) > 0) {
            creep.memory.extracting = false;
        } else {
            if (!creep.memory.extracting && _.sum(creep.carry) === 0) {
                creep.memory.extracting = true;
                creep.say('🔄 extract');
            }
            if (creep.memory.extracting && creep.carry.energy === creep.carryCapacity) {
                creep.memory.extracting = false;
                creep.say('🔄 transfer');
            }
        }

        if (creep.memory.extracting) {
            let extractor = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType === STRUCTURE_EXTRACTOR
            });
            if (extractor) {
                let mineral = extractor.pos.lookFor(LOOK_MINERALS)[0];
                if (creep.harvest(mineral) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(extractor, {visualizePathStyle: {stroke: '#aaaaff'}});
                }
            }
        } else {
            if (creep.transfer(creep.room.terminal, creep.carry[0]) === ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.terminal, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
    }
};

module.exports = roleLabber;