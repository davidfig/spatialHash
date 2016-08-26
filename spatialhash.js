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
     * @private
     * @param {number} x coordinate
     * @param {number} y coordinate
     * @return {string} hash key
     */
    _key(x, y)
    {
        return Math.floor(x / this.cellSize) * this.cellSize + ' ' + Math.floor(y / this.cellSize) * this.cellSize;
    }

    /**
     * inserts an object into the hash tree
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
        if (object.spatialHashes && object.spatialHashes.length)
        {
            this.remove(object);
        }
        else
        {
            object.spatialHashes = [];
        }
        var AABB = object.AABB;
        for (var y = AABB.y; y < AABB.y + AABB.height; y += this.cellSize)
        {
            for (var x = AABB.x; x < AABB.x + AABB.width; x += this.cellSize)
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
            if (this.list[entry.key].length === 1)
            {
                this.list[entry.key] = null;
            }
            else
            {
                this.list[entry.key].splice(entry.index, 1);
            }
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
        for (var y = AABB.y; y < AABB.y + AABB.height; y += this.cellSize)
        {
            for (var x = AABB.x; x < AABB.x + AABB.width; x += this.cellSize)
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
        for (var y = AABB.y; y < AABB.y + AABB.height; y += this.cellSize)
        {
            for (var x = AABB.x; x < AABB.x + AABB.width; x += this.cellSize)
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
}

module.exports = SpatialHash;