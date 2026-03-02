/**
 * Fetches and parses an external project file JSON.
 * Resolves relative URLs (sb3, images, videos) against the JSON file's base URL.
 * @param {string} url - Absolute or relative URL to the project file JSON
 * @returns {Promise<object>} Normalized project file object
 */
const fetchProjectFile = async function (url) {
    // Use document.referrer as base when in an iframe, otherwise fall back to page location
    const base = document.referrer || window.location.href;
    const absoluteUrl = new URL(url, base).href;

    const response = await fetch(absoluteUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch project file: ${response.status} ${response.statusText}`);
    }
    const projectFile = await response.json();

    // Validate required fields
    if (!projectFile.title || typeof projectFile.title !== 'string') {
        throw new Error('Project file must have a "title" string field');
    }

    const baseUrl = absoluteUrl.substring(0, absoluteUrl.lastIndexOf('/') + 1);

    const resolveUrl = relative => {
        if (!relative) return null;
        if (/^https?:\/\//.test(relative)) return relative;
        return new URL(relative, baseUrl).href;
    };

    // Resolve sb3 URL
    if (projectFile.sb3) {
        projectFile.sb3 = resolveUrl(projectFile.sb3);
    }

    // Resolve step URLs
    if (Array.isArray(projectFile.steps)) {
        projectFile.steps = projectFile.steps.map(step => {
            const resolved = Object.assign({}, step);
            if (resolved.image) {
                resolved.image = resolveUrl(resolved.image);
            }
            if (resolved.video) {
                resolved.video = resolveUrl(resolved.video);
            }
            return resolved;
        });
    }

    // Resolve asset URLs (sounds, costumes, backdrops)
    const resolveAssetUrls = assets => {
        if (!Array.isArray(assets)) return assets;
        return assets.map(item => {
            const resolved = Object.assign({}, item);
            if (resolved.url) {
                resolved.url = resolveUrl(resolved.url);
            }
            return resolved;
        });
    };

    // Normalize an asset-type field that may be a flat array or {tags, library, showBuiltin}
    const normalizeAssetField = field => {
        if (!field) return field;
        if (Array.isArray(field)) return resolveAssetUrls(field);
        if (typeof field === 'object') {
            const normalized = Object.assign({}, field);
            if (Array.isArray(normalized.library)) {
                normalized.library = resolveAssetUrls(normalized.library);
            }
            return normalized;
        }
        return field;
    };

    projectFile.sounds = normalizeAssetField(projectFile.sounds);
    projectFile.costumes = normalizeAssetField(projectFile.costumes);
    projectFile.backdrops = normalizeAssetField(projectFile.backdrops);

    // Resolve sprite asset URLs (nested costumes and sounds)
    const normalizeSprites = sprites => {
        if (!sprites) return sprites;
        const list = Array.isArray(sprites) ? sprites : (sprites.library || []);
        const resolved = list.map(sprite => {
            const s = Object.assign({}, sprite);
            s.costumes = resolveAssetUrls(s.costumes);
            s.sounds = resolveAssetUrls(s.sounds);
            return s;
        });
        if (Array.isArray(sprites)) return resolved;
        return Object.assign({}, sprites, {library: resolved});
    };
    projectFile.sprites = normalizeSprites(projectFile.sprites);

    return projectFile;
};

export default fetchProjectFile;
