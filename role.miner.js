const params = require('params');
const roleBase = require('role.base');

const roleMiner = {

    moveToContainer: function(creep) {
        const target = Game.getObjectById(creep.memory.target);
        if (!target) {
            creep.moveTo(params.sources[creep.memory.target].pos, {visualizePathStyle: {stroke: '#ffaa00'}})
        } else {
            if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
                let containers = target.pos.findInRange(FIND_STRUCTURES, 1).filter(
                    (s) => (s.structureType === STRUCTURE_CONTAINER
                        && s.room.lookAt(s.pos).filter((o) => o.type === "creep").length === 0)
                );
                const container = containers[0];
                creep.moveTo(container, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    },

    /** @param {Creep} creep **/
    run: function(creep) {
        if (creep.memory.target == null) {
            for (const roomName of Object.keys(Game.rooms)) {
                const room = Game.rooms[roomName];
                let containers = room.find(FIND_STRUCTURES, {
                    filter: (s) => (s.structureType === STRUCTURE_CONTAINER
                        && s.pos.findInRange(FIND_SOURCES_ACTIVE, 1).length > 0
                        && room.lookAt(s.pos).filter((o) => o.type === "creep").length === 0)
                });
                const container = containers[0];
                if (container) {
                    creep.memory.target = container.pos.findInRange(FIND_SOURCES_ACTIVE, 1)[0].id;
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