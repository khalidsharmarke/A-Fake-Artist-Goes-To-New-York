class ActiveGames{
    add(room_id, room_obj){
        this[room_id] = room_obj
    }
    has(room_id){
        return this.hasOwnProperty(room_id)
    }
}

module.exports = ActiveGames