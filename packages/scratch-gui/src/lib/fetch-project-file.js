/**
 * Fetches and parses an external project file JSON.
 * Resolves relative URLs (sb3, images, videos) against the JSON file's base URL.
 * @param {string} url - Absolute or relative URL to the project file JSON
 * @returns {Promise<object>} Normalized project file object
 */
const fetchProjectFile = async function (url) {
    // Resolve the project file URL against the current page location
    const absoluteUrl = new URL(url, window.location.href).href;

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

    return projectFile;
};

export default fetchProjectFile;
