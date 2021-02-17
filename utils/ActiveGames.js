class ActiveGames {
	add(room_obj) {
		this[room_obj.id] = room_obj
	}
	has(room_id) {
		return this.hasOwnProperty(room_id)
	}
	remove(room_id) {
		delete this[room_id]
	}
}

module.exports = ActiveGames
