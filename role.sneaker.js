const params = require('params');

const roleSneaker = {
    run: function(creep) {
        const attack = params.ATTACK;

        if(creep.memory.dumping && creep.carry.energy < 50) {
            creep.memory.dumping = false;
            creep.say('🔄 sneak');
        }
        if(!creep.memory.dumping && creep.carry.energy === creep.carryCapacity) {
            creep.memory.dumping = true;
            creep.say('🚚 dump');
        }

        if (!creep.memory.dumping) {
            if (attack) {
                if (creep.room.name !== attack.room) {
                    creep.moveTo(new RoomPosition(25, 25, attack.room), {visualizePathStyle: {stroke: '#ffff00'}})
                    // creep.moveTo(creep.pos.findClosestByPath(creep.room.findExitTo(steal.room)),
                    //     {visualizePathStyle: {stroke: '#ffff00'}});
                } else {
                    let stealObject = Game.getObjectById(attack.stealID);

                    if (stealObject && (stealObject.store > 0 || stealObject.energy > 0)) {
                        if (creep.withdraw(stealObject, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(stealObject, {visualizePathStyle: {stroke: '#ffff00'}});
                        }
                    } else {
                        let target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
                        if (target) {
                            console.log(creep.name + ": Stealing dropped resources");
                            if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}});
                            }
                        } else {
                            let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                                filter: (structure) => {
                                    return ((structure.structureType === STRUCTURE_CONTAINER
                                        || structure.structureType === STRUCTURE_STORAGE)
                                        && structure.store[RESOURCE_ENERGY] > 0)
                                        ||
                                        ((structure.structureType === STRUCTURE_EXTENSION
                                            || structure.structureType === STRUCTURE_SPAWN
                                            || structure.structureType === STRUCTURE_TOWER)
                                            && structure.energy > 0);
                                }
                            });
                            if (target) {
                                if (target.owner) {
                                    console.log("{0}: Stealing energy from {1}'s {2}".format(creep.name, target.owner.username, target.structureType));
                                } else {
                                    console.log("{0}: Stealing energy from {1} in room {2}".format(creep.name, target.structureType, target.room.name));
                                }
                                if (creep.harvest(target) === ERR_NOT_IN_RANGE
                                    || creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffff00'}});
                                }
                            } else {
                                // done stealing
                            }
                        }
                    }

                }
            } else {
                creep.moveTo(params.home, {visualizePathStyle: {stroke: '#ffffff'}})
            }
        } else {
            if (creep.room.name === params.home.roomName) {
                creep.memory.target = null;
                let target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_EXTENSION
                            || structure.structureType === STRUCTURE_SPAWN
                            || structure.structureType === STRUCTURE_TOWER
                            || structure.structureType === STRUCTURE_CONTAINER
                            || structure.structureType === STRUCTURE_STORAGE)
                            && structure.energy < structure.energyCapacity;
                    }
                });
                if (target) {
                    if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                } else {
                    creep.moveTo(params.home, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            } else {
                creep.moveTo(params.home, {visualizePathStyle: {stroke: '#ffffff'}})
            }
        }

    },
};

module.exports = roleSneaker;