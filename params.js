const rooms = [Game.rooms["E27N51"]];
const myRoomName = "E27N51";

const allies = ["katzrkool","puffyboa"];

const home = new RoomPosition(39,30,"E27N51");

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

    "59f1a4d282100e1594f3d984": {"capacity": 4, "pos": new RoomPosition(32, 40, "E27N52")},

    "59f1a4bd82100e1594f3d73f": {"capacity": 3, "pos": new RoomPosition(39, 17, "E26N51")},
    "59f1a4bd82100e1594f3d740": {"capacity": 1, "pos": new RoomPosition(42, 46, "E26N51")},
};

getEnergy = function() {
    let energy = 0;
    
    for (const room of rooms) {
        for (const s of room.find(FIND_MY_STRUCTURES)) {
            if (s.structureType === STRUCTURE_EXTENSION || s.structureType === STRUCTURE_SPAWN) {
                energy += s.energy;
            }
        }
    }
    return energy;
};

module.exports = {getEnergy, sources, home, allies, ATTACK, myRoomName};