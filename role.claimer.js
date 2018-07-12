const params = require('params');
const roleBase = require('role.base');

const roleClaimer = {

    run: function(creep) {
        const claim = {
            roomName: "E26N51",
        };

        creep.memory.targetRoom = null;

        if (creep.room.name !== claim.roomName) {
            creep.moveTo(creep.pos.findClosestByPath(creep.room.findExitTo(claim.roomName)), {visualizePathStyle: {stroke: '#ff99ff'}});
        } else {
            const target = creep.room.controller;
            if (target) {
                if (target.owner && params.allies.indexOf(target.owner.username) === -1) {
                    if (creep.attackController(target) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ff99ff'}});
                    } else {
                        console.log("{0}: Attacking {1}'s room controller".format(creep.name, target.owner.username))
                    }
                } else {
                    if (creep.claimController(target) === ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ff99ff'}});
                    } else {
                        console.log("{0}: Reserving controller in room {1}".format(creep.name,creep.room.name))
                    }
                }
            }
        }
	}
};

module.exports = roleClaimer;