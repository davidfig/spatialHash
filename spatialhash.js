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
        if (!object.spatial)
        {
            object.spatial = {hashes: []};
        }
        var AABB = object.AABB;
        var xStart = Math.floor(AABB.x / this.cellSize);
        xStart = xStart < 0 ? 0 : xStart;
        var yStart = Math.floor(AABB.y / this.cellSize);
        yStart = yStart < 0 ? 0 : yStart;
        var xEnd = Math.floor((AABB.x + AABB.width) / this.cellSize);
        xEnd = xEnd >= this.width ? this.width - 1 : xEnd;
        var yEnd = Math.floor((AABB.y + AABB.height) / this.cellSize);
        yEnd = yEnd >= this.height ? this.height - 1 : yEnd;
        // only remove and insert if mapping has changed
        if (object.spatial.xStart !== xStart || object.spatial.yStart !== yStart || object.spatial.xEnd !== xEnd || object.spatial.yEnd !== yEnd)
        {
            if (object.spatial.maps.length)
            {
                this.remove(object);
            }
            for (var y = yStart; y <= yEnd; y++)
            {
                for (var x = xStart; x <= xEnd; x++)
                {
                    var key = x + ' ' + y;
                    if (!this.list[key])
                    {
                        this.list[key] = [object];
                    }
                    else
                    {
                        this.list[key].push(object);
                    }
                    object.spatial.hashes.push({list: list, key: key});
                }
            }
            object.spatial.xStart = xStart;
            object.spatial.yStart = yStart;
            object.spatial.xEnd = xEnd;
            object.spatial.yEnd = yEnd;
        }
    }

    /**
     * removes existing object from the hash table
     * @param {object} object
     */
    remove(object)
    {
        while (object.spatial.hashes.length)
        {
            var entry = object.spatial.hashes.pop();
            if (entry.list.length === 1)
            {
                this.list[entry.key] = null;
            }
            else
            {
                var index = entry.list.indexOf(object);
                entry.list.splice(index, 1);
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
        var xStart = Math.floor(AABB.x / this.cellSize);
        xStart = xStart < 0 ? 0 : xStart;
        var yStart = Math.floor(AABB.y / this.cellSize);
        yStart = yStart < 0 ? 0 : yStart;
        var xEnd = Math.floor((AABB.x + AABB.width) / this.cellSize);
        xEnd = xEnd >= this.width ? this.width - 1 : xEnd;
        var yEnd = Math.floor((AABB.y + AABB.height) / this.cellSize);
        yEnd = yEnd >= this.height ? this.height - 1 : yEnd;
        for (var y = yStart; y <= yEnd; y++)
        {
            for (var x = xStart; x <= xEnd; x++)
            {
                var entry = this.list[x + ' ' + y];
                if (entry)
                {
                    results = results.concat(entry.list);
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
        var xStart = Math.floor(AABB.x / this.cellSize);
        xStart = xStart < 0 ? 0 : xStart;
        var yStart = Math.floor(AABB.y / this.cellSize);
        yStart = yStart < 0 ? 0 : yStart;
        var xEnd = Math.floor((AABB.x + AABB.width) / this.cellSize);
        xEnd = xEnd >= this.width ? this.width - 1 : xEnd;
        var yEnd = Math.floor((AABB.y + AABB.height) / this.cellSize);
        yEnd = yEnd >= this.height ? this.height - 1 : yEnd;
        for (var y = yStart; y <= yEnd; y++)
        {
            for (var x = xStart; x <= xEnd; x++)
            {
                var entry = this.list[x + ' ' + y];
                if (entry)
                {
                    for (var i = 0; i < entry.list.length; i++)
                    {
                        if (callback(entry.list[i]))
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

    /** helper function to evalute the hash table
     * @param {object} AABB bounding box to search
     * @param {number} object.AABB.x
     * @param {number} object.AABB.y
     * @param {number} object.AABB.width
     * @param {number} object.AABB.height
     * @return {number} sparseness percentage
     */
    getSparseness(AABB)
    {
        var count = 0, total = 0;
        var xStart = Math.floor(AABB.x / this.cellSize);
        var yStart = Math.floor(AABB.y / this.cellSize);
        var xEnd = Math.ceil((AABB.x + AABB.width) / this.cellSize);
        var yEnd = Math.ceil((AABB.y + AABB.height) / this.cellSize);
        for (var y = yStart; y < yEnd; y++)
        {
            for (var x = xStart; x < xEnd; x++)
            {
                count += (this.list[x + ' ' + y] ? 1 : 0);
                total++;
            }
        }
        return count;
    }
}

module.exports = SpatialHash;