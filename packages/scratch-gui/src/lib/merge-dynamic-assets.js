/**
 * Merge static and dynamic assets, using name as key, giving precedence to dynamic assets
 * @param {Array} staticAssets the static assets bundled with the editor
 * @param {Array} dynamicAssets an array of dynamic assets loaded at runtime
 * @returns {Object} an object containing `source` and `data` properties, where:
 *  - `source` - the original dynamicAssets array (or null/undefined)
 *  - `data` - the merged array of assets
 */
const mergeDynamicAssets = (staticAssets, dynamicAssets) => {
    const effectiveDynamicAssets = dynamicAssets || [];

    let data = staticAssets;
    if (effectiveDynamicAssets.length > 0) {
        const map = new Map();
        staticAssets.forEach(item => map.set(item.name, item));
        effectiveDynamicAssets.forEach(item => map.set(item.name, item));
        data = Array.from(map.values());
        data.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    const processedAssets = {};
    processedAssets.source = dynamicAssets;
    processedAssets.data = data;

    return processedAssets;
};

export default mergeDynamicAssets;
