const params = require('params');
const roleBase = require('role.base');

const roleHealer = {
    run: function (creep) {

        const attack = params.ATTACK;

        const defenders = creep.room.find(FIND_MY_CREEPS, {
            filter: (c) => c.memory.role === 'defender'
        });
        const hurtDefenders = defenders.filter((c) => c.hits < c.hitsMax);

        if (creep.hits < creep.hitsMax) {
            creep.heal()
        } else if (hurtDefenders.length > 0) {
            const target = creep.findClosestByPath(hurtDefenders);
            if (creep.heal(target) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
        } else if (defenders.length > 0) {
            creep.moveTo(creep.findClosestByPath(defenders));
        } else {
            if (attack) {
                if (creep.room.name !== attack.roomName) {
                    creep.moveTo(new RoomPosition(25, 25, attack.roomName));
                }
            }
        }
    }
};

module.exports = roleHealer;