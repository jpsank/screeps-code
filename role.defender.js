const params = require('params');
const roleBase = require('role.base');

const roleDefender = {
    run: function(creep) {
        const base = [20,23];
        const baseID = "E27N51";

        const attack = params.ATTACK;

        if (attack) {
            const attackObject = Game.getObjectById(attack.attackID);

            if (!attackObject) {
                if (attack.room && creep.room.name !== attack.room) {
                    creep.moveTo(new RoomPosition(25, 25, attack.room), {visualizePathStyle: {stroke: '#ffff00'}})
                } else {
                    let target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
                        filter: (hostile) => {
                            return params.allies.indexOf(hostile.owner.username) === -1;
                        }
                    });
                    if (target) {
                        console.log(creep.name + ": Hostile \"" + target.name + "\" found");
                        if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                        }
                    } else if (attack.plunder) {
                        let target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                            filter: (structure) => {
                                return structure.structureType !== "controller"
                                    && params.allies.indexOf(structure.owner.username) === -1;
                            }
                        });
                        if (target) {
                            console.log(creep.name + ": Plundering " + target.owner.username + "'s " + target.structureType);
                            if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                                creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                            }
                        } else {
                            if (attack.roads) {
                                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                                    filter: (structure) => {
                                        return structure.structureType !== "controller";
                                    }
                                });
                            }
                            if (target) {
                                console.log(creep.name + ": Plundering " + target.structureType);
                                if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                                }
                            } else {
                                let target = creep.pos.findClosestByPath(FIND_HOSTILE_CONSTRUCTION_SITES, {
                                    filter: (structure) => {
                                        return params.allies.indexOf(structure.owner.username) === -1;
                                    }
                                });
                                if (target) {
                                    console.log(creep.name + ": Plundering " + target.owner.username + "'s " + target.structureType + " construction");
                                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                                } else if (creep.carryCapacity > 0) {
                                    let target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
                                    if (target) {
                                        console.log(creep.name + ": Stealing dropped resources");
                                        if (creep.pickup(target) === ERR_NOT_IN_RANGE) {
                                            creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                                        }
                                    }
                                } else {
                                    // done attacking
                                }
                            }
                        }
                    }
                }
            } else {
                if (creep.attack(attackObject) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(attackObject, {visualizePathStyle: {stroke: "#ff0000"}})
                }
            }
        } else {
            let target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
                filter: (hostile) => {
                    return params.allies.indexOf(hostile.owner.username) === -1;
                }
            });
            if (target) {
                Game.notify(`WARNING: ${creep.name} defending room \"${creep.room.name}\" from hostile \"${target.name}\", owned by \"${target.owner.username}\" ${target.pos}`);
                console.log(creep.name + ": Hostile \"" + target.name + "\" found");
                if (creep.attack(target) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ff0000'}});
                }
            } else if (creep.room.name !== baseID || creep.pos.x !== base[0] || creep.pos.y !== base[1]) {
                creep.moveTo(new RoomPosition(base[0], base[1], baseID), {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};

module.exports = roleDefender;