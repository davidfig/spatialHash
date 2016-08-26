# 2D Spatial Hash
Javascript implementation of a 2D Spatial Hash

###Example:

    // the trick is to pick the right size for your hash based on your usage (i.e., the expected size of your objects)
    var hash = new SpatialHash(100);

    // use your own 2D graphics libraries--I like PIXI.js
    var circle = new Circle(10, 10, 5);

    // each object must have an AABB bounding box {top-left x, top-left y, width, height}
    circle.AABB = {5, 5, 10, 10};
    hash.insert(circle);

    // returns the circle
    var results = hash.query({x: 0, y: 0, width: 10, height: 10});

    // or iterate over the results to avoid creating new arrays
    hash.query({x: 0, y: 0, width: 10, height: 10},
        function(object)
        {
            object.draw();
        }
    );

###API

    /**
     * @param {number} cellSize used to create hash
     */
    constructor(cellSize)

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

    /**
     * removes existing object from the hash table
     * @param {object} object
     */
    remove(object)

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

#License
MIT