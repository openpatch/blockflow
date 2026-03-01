/**
 * Utilities for pre-fetching project-file assets (sounds, costumes, backdrops,
 * sprites) from external URLs and registering them in the Scratch storage cache
 * so that the existing library → VM loading pipeline works unchanged.
 */

const EXTENSION_TO_FORMAT = {
    svg: {dataFormat: 'svg', assetType: 'ImageVector'},
    png: {dataFormat: 'png', assetType: 'ImageBitmap'},
    jpg: {dataFormat: 'jpg', assetType: 'ImageBitmap'},
    jpeg: {dataFormat: 'jpg', assetType: 'ImageBitmap'},
    gif: {dataFormat: 'gif', assetType: 'ImageBitmap'},
    bmp: {dataFormat: 'bmp', assetType: 'ImageBitmap'},
    mp3: {dataFormat: 'mp3', assetType: 'Sound'},
    wav: {dataFormat: 'wav', assetType: 'Sound'}
};

/**
 * Extract the file extension from a URL (ignoring query/hash).
 * @param {string} url - asset URL
 * @returns {string} lowercase extension without the dot
 */
const extensionFromUrl = url => {
    try {
        const pathname = new URL(url).pathname;
        const dot = pathname.lastIndexOf('.');
        if (dot === -1) return '';
        return pathname.substring(dot + 1).toLowerCase();
    } catch (_) {
        const dot = url.lastIndexOf('.');
        if (dot === -1) return '';
        return url.substring(dot + 1).split(/[?#]/)[0].toLowerCase();
    }
};

/**
 * Get the dimensions of a bitmap image from its binary data.
 * Returns a promise resolving to {width, height}.
 * @param {Uint8Array} data - image binary data
 * @param {string} url - original URL (used as fallback source)
 * @returns {Promise<{width: number, height: number}>}
 */
const getImageDimensions = (data, url) => new Promise(resolve => {
    try {
        const blob = new Blob([data]);
        const objectUrl = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({width: img.naturalWidth, height: img.naturalHeight});
        };
        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            resolve({width: 0, height: 0});
        };
        img.src = objectUrl;
    } catch (_) {
        resolve({width: 0, height: 0});
    }
});

/**
 * Fetch a single asset from a URL and register it in Scratch storage.
 * Returns a library-compatible metadata object.
 *
 * @param {object} assetDef - { name, url, centerX?, centerY? }
 * @param {string} kind - 'costume' | 'sound'
 * @param {object} storage - vm.runtime.storage (ScratchStorage instance)
 * @returns {Promise<object>} library-compatible asset metadata
 */
const fetchAndCacheAsset = async (assetDef, kind, storage) => {
    const ext = extensionFromUrl(assetDef.url);
    const formatInfo = EXTENSION_TO_FORMAT[ext];
    if (!formatInfo) {
        throw new Error(`Unsupported asset format "${ext}" for "${assetDef.name}"`);
    }

    const response = await fetch(assetDef.url);
    if (!response.ok) {
        throw new Error(`Failed to fetch asset "${assetDef.name}": ${response.status}`);
    }
    const buffer = await response.arrayBuffer();
    const data = new Uint8Array(buffer);

    const assetType = storage.AssetType[formatInfo.assetType];
    const dataFormat = storage.DataFormat[formatInfo.dataFormat.toUpperCase()];

    // Store in the builtinHelper so storage.load() can find it later
    const assetId = storage.builtinHelper._store(assetType, dataFormat, data);

    const md5ext = `${assetId}.${formatInfo.dataFormat}`;

    if (kind === 'sound') {
        return {
            name: assetDef.name,
            tags: [],
            isPublic: true,
            assetId,
            dataFormat: formatInfo.dataFormat,
            md5ext,
            sampleCount: 0,
            rate: 22050
        };
    }

    // costume / backdrop — resolve rotation center
    let rotationCenterX = 0;
    let rotationCenterY = 0;
    if (typeof assetDef.centerX === 'number' && typeof assetDef.centerY === 'number') {
        rotationCenterX = assetDef.centerX;
        rotationCenterY = assetDef.centerY;
    } else if (formatInfo.assetType !== 'ImageVector') {
        const dims = await getImageDimensions(data, assetDef.url);
        rotationCenterX = Math.round(dims.width / 2);
        rotationCenterY = Math.round(dims.height / 2);
    }

    return {
        name: assetDef.name,
        tags: [],
        isPublic: true,
        rawURL: assetDef.url,
        assetId,
        dataFormat: formatInfo.dataFormat,
        md5ext,
        rotationCenterX,
        rotationCenterY,
        bitmapResolution: formatInfo.assetType === 'ImageVector' ? 1 : 2
    };
};

/**
 * Process an array of asset definitions and return library-compatible entries.
 *
 * @param {Array<{name: string, url: string}>} assetDefs
 * @param {string} kind - 'costume' | 'sound'
 * @param {object} storage - vm.runtime.storage
 * @returns {Promise<Array<object>>} library entries
 */
const processAssets = async (assetDefs, kind, storage) => {
    if (!assetDefs || assetDefs.length === 0) return [];
    const results = await Promise.all(
        assetDefs.map(def => fetchAndCacheAsset(def, kind, storage))
    );
    return results;
};

/**
 * Process sprite definitions. Each sprite has a name and arrays of
 * costume and sound definitions.
 *
 * @param {Array<{name: string, costumes: Array, sounds: Array}>} spriteDefs
 * @param {object} storage - vm.runtime.storage
 * @returns {Promise<Array<object>>} library-compatible sprite entries
 */
const processSprites = async (spriteDefs, storage) => {
    if (!spriteDefs || spriteDefs.length === 0) return [];
    return Promise.all(
        spriteDefs.map(async sprite => {
            const costumes = await processAssets(sprite.costumes || [], 'costume', storage);
            const sounds = await processAssets(sprite.sounds || [], 'sound', storage);
            return {
                name: sprite.name,
                tags: [],
                isPublic: true,
                isStage: false,
                variables: {},
                blocks: {},
                costumes,
                sounds
            };
        })
    );
};

/**
 * Load all project-file assets, cache them in storage, and return a
 * dynamic-assets object ready for dispatch to the Redux store.
 *
 * @param {object} projectFile - parsed project file JSON
 * @param {object} storage - vm.runtime.storage
 * @returns {Promise<{costumes: Array, sounds: Array, backdrops: Array, sprites: Array}>}
 */
const loadProjectFileAssets = async (projectFile, storage) => {
    const [costumes, sounds, backdrops, sprites] = await Promise.all([
        processAssets(projectFile.costumes, 'costume', storage),
        processAssets(projectFile.sounds, 'sound', storage),
        processAssets(projectFile.backdrops, 'costume', storage),
        processSprites(projectFile.sprites, storage)
    ]);
    return {costumes, sounds, backdrops, sprites};
};

export {
    loadProjectFileAssets as default,
    loadProjectFileAssets,
    fetchAndCacheAsset,
    processAssets,
    processSprites,
    extensionFromUrl,
    EXTENSION_TO_FORMAT
};
