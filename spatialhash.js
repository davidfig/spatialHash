/**
 * Copyright (c) 2016 YOPEY YOPEY LLC
 * @author David Figatner
 * @license MIT
*/

/**
 * 2D Spatial Hash
 * example:
 *
 * // the trick is to pick the right size for your hash based on your usage (i.e., the expected size of your objects)
 * var hash = new SpatialHash(100);
 *
 * // use your own 2D graphics libraries--I like PIXI.js
 * var circle = new Circle(10, 10, 5);
 *
 * // each object must have an AABB bounding box {top-left x, top-left y, width, height}
 * circle.AABB = {5, 5, 10, 10};
 * hash.insert(circle);
 *
 * // returns the circle
 * var results = hash.query({x: 0, y: 0, width: 10, height: 10});
 *
 * // or iterate over the results to avoid creating new arrays
 * hash.query({x: 0, y: 0, width: 10, height: 10},
 *  function(object)
 *  {
 *      object.draw();
 *  }
 * );
 */
class SpatialHash
{
    /**
     * @param {number} cellSize used to create hash
     */
    constructor(cellSize)
    {
        this.cellSize = cellSize;
        this.list = {};
    }

    /**
     * generates hash key
     * from https://github.com/troufster/spatial (MIT License)
     * @private
     * @param {number} x coordinate
     * @param {number} y coordinate
     * @return {string} hash key
     */
    _key(x, y)
    {
        // return Math.floor(x / this.cellSize) * this.cellSize + ' ' + Math.floor(y / this.cellSize) * this.cellSize;
        // return Math.floor(x / this.cellSize) + ' ' + Math.floor(y / this.cellSize);
        // return Math.floor(x / this.cellSize) + ' ' + Math.floor(y / this.cellSize);
        var cs = this.cellSize;
        var a = Math.floor(x / cs);
        var b = Math.floor(y / cs);
        return (b << 16) ^ a;
    }

    /**
     * inserts an object into the hash tree (also removes any existing spatialHashes)
     * side effect: adds object.spatialHashes to track existing hashes
     * @param {object} object
     * @param {object} object.AABB bounding box
     * @param {number} object.AABB.x
     * @param {number} object.AABB.y
     * @param {number} object.AABB.width
     * @param {number} object.AABB.height
     */
    insert(object)
    {
        if (object.spatialHashes)
        {
            if (object.spatialHashes.length)
            {
                this.remove(object);
            }
        }
        else
        {
            object.spatialHashes = [];
        }

        var AABB = object.AABB;
        for (var y = AABB.y, _y = AABB.y + AABB.height + this.cellSize; y < _y; y += this.cellSize)
        {
            for (var x = AABB.x, _x = AABB.x + AABB.width + this.cellSize; x < _x; x += this.cellSize)
            {
                var key = this._key(x, y);
                var length;
                if (!this.list[key])
                {
                    this.list[key] = [object];
                    length = 1;
                }
                else
                {
                    length = this.list[key].push(object);
                }
                object.spatialHashes.push({key: key, index: length - 1});
            }
        }
    }

    /**
     * removes existing object from the hash table
     * @param {object} object
     */
    remove(object)
    {
        while (object.spatialHashes.length)
        {
            var entry = object.spatialHashes.pop();
            this.list[entry.key].splice(entry.index, 1);
        }
    }

    /**
     * returns an array of objects contained within bounding box
     * @param {object} AABB bounding box to search
     * @param {number} object.AABB.x
     * @param {number} object.AABB.y
     * @param {number} object.AABB.width
     * @param {number} object.AABB.height
     * @return {object[]} search results
     */
    query(AABB)
    {
        var results = [];
        for (var y = AABB.y, _y = AABB.y + AABB.height + this.cellSize; y < _y; y += this.cellSize)
        {
            for (var x = AABB.x, _x = AABB.x + AABB.width + this.cellSize; x < _x; x += this.cellSize)
            {
                var list = this.list[this._key(x, y)];
                if (list)
                {
                    results = results.concat(list);
                }
            }
        }
        return results;
    }

    /**
     * iterates through objects contained within bounding box
     * stops iterating if the callback returns true
     * @param {object} AABB bounding box to search
     * @param {number} object.AABB.x
     * @param {number} object.AABB.y
     * @param {number} object.AABB.width
     * @param {number} object.AABB.height
     * @param {function} callback
     * @return {boolean} true if callback returned early
     */
    queryCallback(AABB, callback)
    {
        for (var y = AABB.y, _y = AABB.y + AABB.height + this.cellSize; y < _y; y += this.cellSize)
        {
            for (var x = AABB.x, _x = AABB.x + AABB.width + this.cellSize; x < _x; x += this.cellSize)
            {
                var list = this.list[this._key(x, y)];
                if (list)
                {
                    for (var i = 0; i < list.length; i++)
                    {
                        if (callback(list[i]))
                        {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * helper function to evaluate hash table
     * @return {number} the number of buckets in the hash table
     * */
    getBuckets()
    {
        var count = 0;
        for (var key in this.list)
        {
            count++;
        }
        return count;
    }

    /**
     * helper function to evaluate hash table
     * @return {number} the average number of entries in each bucket
     */
    getAverageSize()
    {
        var total = 0;
        for (var key in this.list)
        {
            total += this.list[key].length;
        }
        return total / this.getBuckets();
    }

    /**
     * helper function to evaluate the hash table
     * @return {number} the largest sized bucket
     */
    getLargest()
    {
        var largest = 0, object;
        for (var key in this.list)
        {
            if (this.list[key].length > largest)
            {
                largest = this.list[key].length;
                object = this.list[key];
            }
        }
        return largest;
    }
}

module.exports = SpatialHash;