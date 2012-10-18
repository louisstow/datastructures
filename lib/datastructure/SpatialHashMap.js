/**
* Spatial HashMap for broad phase collision
*
* @author Louis Stowasser
*/
var SPACE = " ";

var HashMap = exports = Class(function() {
	this.init = function(opts) {
    opts = opts || {};
		this.cellSize = opts.cellSize || 64;
		this.map = {};
	}

	this.insert = function(obj, ent) {
		var keys = this.key(obj),
        entry,
        i = 0,
        j,
        hash;

		if(ent) {
			entry = ent;
			entry.keys = keys;
			entry.obj = obj;
			entry.map = this;
		} else {
			entry = new Entry(keys, obj, this);
		}

		//insert into all x buckets
		for(i = keys.x1; i <= keys.x2; i++) {
			//insert into all y buckets
			for(j = keys.y1; j <= keys.y2; j++) {
				hash =  i + SPACE + j;
				if(!this.map[hash]) this.map[hash] = [];
				this.map[hash].push(obj);
			}
		}

		return entry;
	}

	this.search = function(rect, filter) {
		var keys = this.key(rect),
			i,j,
			hash,
			results = [];

		if(filter === undefined) filter = true; //default filter to true

		//search in all x buckets
		for(i = keys.x1; i <= keys.x2; i++) {
			//insert into all y buckets
			for(j = keys.y1; j <= keys.y2; j++) {
				hash = i + SPACE + j;

				if(this.map[hash]) {
					results = results.concat(this.map[hash]);
				}
			}
		}

		if(filter) {
			var obj, id, finalresult = [], found = {};

			//add unique elements to lookup table with the entity ID as unique key
			for(i = 0, l = results.length; i < l; i++) {
				obj = results[i];
				if(!obj) continue; //skip if deleted
				id = obj[0]; //unique ID

				//check if not added to hash and that actually intersects
				if(!found[id] && obj.x < rect.x + rect.width && obj.x + obj.width > rect.x &&
								 obj.y < rect.y + rect.height && obj.height + obj.y > rect.y) 
				   found[id] = results[i];
			}

			//loop over lookup table and copy to final array
			for(obj in found) finalresult.push(found[obj]);

			return finalresult;
		} else {
			return results;
		}
	}

	this.remove = function(keys,obj) {
		var i = 0, j, hash;

		if(arguments.length == 1) {
			obj = keys;
			keys = HashMap.key(obj);
		}	

		//search in all x buckets
		for(i = keys.x1; i <= keys.x2; i++) {
			//insert into all y buckets
			for(j = keys.y1; j <= keys.y2; j++) {
				hash = i + SPACE + j;

				if(this.map[hash]) {
					var cell = this.map[hash], m = 0, n = cell.length;

					//loop over objs in cell and delete
					for(;m<n;m++) if(cell[m] && cell[m][0] === obj[0]) 
						cell.splice(m,1);
				}
			}
		}
	}

	this.key = function(obj) {
		var x1 = ~~(obj.x / this.cellSize),
			y1 = ~~(obj.y / this.cellSize),
			x2 = ~~((obj.width + obj.x) / this.cellSize),
			y2 = ~~((obj.height + obj.y) / this.cellSize);
		return {x1: x1, y1: y1, x2: x2, y2: y2};
	}

	this.hash = function(keys) {
		return keys.x1 + SPACE + keys.y1 + SPACE + keys.x2 + SPACE + keys.y2;
	}
});

function Entry(keys, obj, map) {
	this.keys = keys;
	this.map = map;
	this.obj = obj;
}

Entry.prototype = {
	update: function(rect) {
		//check if buckets change
		if(this.map.hash(this.map.key(rect)) != this.map.hash(this.keys)) {
			this.map.remove(this.keys, this.obj);

			//insert again with using Entry object
			this.map.insert(this.obj, this);
		}
	}
};

