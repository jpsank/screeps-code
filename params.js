const myRoomName = "E27N51";

const allies = ["katzrkool","puffyboa"];

const ATTACK = null;
// const ATTACK = {
//     room: "E26N53",
//
//     attackID: null,
//     plunder: false,
//     roads: false, // destroy roads and other owner-less structures
//
//     stealID: null,
// };

// sources in order of priority
const sources = {
    "59f1a4d282100e1594f3d986": {"capacity": 3, "pos": new RoomPosition(33, 24, "E27N51")},
    "59f1a4d282100e1594f3d988": {"capacity": 1, "pos": new RoomPosition(45, 38, "E27N51")},

    "59f1a4bd82100e1594f3d73f": {"capacity": 3, "pos": new RoomPosition(39, 17, "E26N51")},
    "59f1a4bd82100e1594f3d740": {"capacity": 1, "pos": new RoomPosition(42, 46, "E26N51")},

    "59f1a4d282100e1594f3d984": {"capacity": 4, "pos": new RoomPosition(32, 40, "E27N52")},
};

getEnergy = function(room) {
    let energy = 0;

    for (const s of room.find(FIND_MY_STRUCTURES)) {
        if (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) {
            energy += s.energy;
        }
    }
    return energy;
};

getEnergyCap = function(room) {
    let energyCap = 0;

    for (const s of room.find(FIND_MY_STRUCTURES)) {
        if (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) {
            energyCap += s.energyCapacity;
        }
    }
    return energyCap;
};

module.exports = {getEnergy, getEnergyCap, sources, allies, ATTACK, myRoomName};