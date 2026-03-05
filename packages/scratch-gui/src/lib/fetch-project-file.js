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
    const resolveAssetUrls = (assets, resolveUrlFn) => {
        const resolve = resolveUrlFn || resolveUrl;
        if (!Array.isArray(assets)) return assets;
        return assets.map(item => {
            const resolved = Object.assign({}, item);
            if (resolved.url) {
                resolved.url = resolve(resolved.url);
            }
            return resolved;
        });
    };

    // Fetch a remote library JSON and resolve its relative URLs against its own base
    const fetchLibrary = async libraryUrl => {
        const absLibUrl = resolveUrl(libraryUrl);
        const res = await fetch(absLibUrl);
        if (!res.ok) {
            throw new Error(`Failed to fetch library: ${res.status} ${res.statusText}`);
        }
        const items = await res.json();
        const libBase = absLibUrl.substring(0, absLibUrl.lastIndexOf('/') + 1);
        const resolveLibUrl = relative => {
            if (!relative) return null;
            if (/^https?:\/\//.test(relative)) return relative;
            return new URL(relative, libBase).href;
        };
        return resolveAssetUrls(items, resolveLibUrl);
    };

    // Resolve a library value: string URL → fetch, array → mixed items, object array → resolve URLs
    const resolveLibrary = async library => {
        if (typeof library === 'string') {
            return fetchLibrary(library);
        }
        if (Array.isArray(library)) {
            const parts = await Promise.all(library.map(item => {
                if (typeof item === 'string') return fetchLibrary(item);
                // inline asset object
                const resolved = Object.assign({}, item);
                if (resolved.url) resolved.url = resolveUrl(resolved.url);
                return [resolved];
            }));
            return parts.flat();
        }
        return library;
    };

    // Normalize an asset-type field that may be a flat array or {tags, library, showBuiltin}
    // library can be a URL string, an array of items, or a mixed array of URLs and objects
    const normalizeAssetField = async field => {
        if (!field) return field;
        if (Array.isArray(field)) return resolveAssetUrls(field);
        if (typeof field === 'object') {
            const normalized = Object.assign({}, field);
            normalized.library = await resolveLibrary(normalized.library);
            return normalized;
        }
        return field;
    };

    projectFile.sounds = await normalizeAssetField(projectFile.sounds);
    projectFile.costumes = await normalizeAssetField(projectFile.costumes);
    projectFile.backdrops = await normalizeAssetField(projectFile.backdrops);

    // Resolve sprite asset URLs (nested costumes and sounds)
    // Fetch a single sprite library URL and resolve its relative asset URLs
    const fetchSpriteLibrary = async libraryUrl => {
        const absLibUrl = resolveUrl(libraryUrl);
        const res = await fetch(absLibUrl);
        if (!res.ok) {
            throw new Error(`Failed to fetch sprite library: ${res.status} ${res.statusText}`);
        }
        const items = await res.json();
        const libBase = absLibUrl.substring(0, absLibUrl.lastIndexOf('/') + 1);
        const resolveLibUrl = relative => {
            if (!relative) return null;
            if (/^https?:\/\//.test(relative)) return relative;
            return new URL(relative, libBase).href;
        };
        return items.map(sprite => {
            const s = Object.assign({}, sprite);
            s.costumes = resolveAssetUrls(s.costumes, resolveLibUrl);
            s.sounds = resolveAssetUrls(s.sounds, resolveLibUrl);
            return s;
        });
    };

    const resolveSpriteLibrary = async library => {
        if (typeof library === 'string') {
            return fetchSpriteLibrary(library);
        }
        if (Array.isArray(library)) {
            const parts = await Promise.all(library.map(item => {
                if (typeof item === 'string') return fetchSpriteLibrary(item);
                // inline sprite object
                const s = Object.assign({}, item);
                s.costumes = resolveAssetUrls(s.costumes);
                s.sounds = resolveAssetUrls(s.sounds);
                return [s];
            }));
            return parts.flat();
        }
        return library;
    };

    const normalizeSprites = async sprites => {
        if (!sprites) return sprites;
        if (Array.isArray(sprites)) {
            return sprites.map(sprite => {
                const s = Object.assign({}, sprite);
                s.costumes = resolveAssetUrls(s.costumes);
                s.sounds = resolveAssetUrls(s.sounds);
                return s;
            });
        }
        const normalized = Object.assign({}, sprites);
        normalized.library = await resolveSpriteLibrary(normalized.library);
        return normalized;
    };
    projectFile.sprites = await normalizeSprites(projectFile.sprites);

    return projectFile;
};

export default fetchProjectFile;
