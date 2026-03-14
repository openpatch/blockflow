/**
 * Filters toolbox XML based on project file toolbox configuration.
 *
 * @param {string} toolboxXML - The full toolbox XML string from makeToolboxXML
 * @param {object} toolboxConfig - The toolbox config from the project file
 * @param {string[]} [toolboxConfig.categories] - Whitelist of category IDs to keep
 * @param {object} [toolboxConfig.blocks] - Per-category block whitelist { categoryId: blockTypeId[] }
 * @returns {string} Filtered toolbox XML
 */

// Map project file category names to toolboxitemid values in make-toolbox-xml.js
const categoryIdMap = {
    motion: 'motion',
    looks: 'looks',
    sound: 'sound',
    events: 'events',
    control: 'control',
    sensing: 'sensing',
    operators: 'operators',
    variables: 'variables',
    myBlocks: 'myBlocks'
};

const filterToolboxXML = function (toolboxXML, toolboxConfig) {
    if (!toolboxConfig) return toolboxXML;

    let filtered = toolboxXML;

    // Filter categories
    if (toolboxConfig.categories && Array.isArray(toolboxConfig.categories)) {
        const allowedIds = new Set(
            toolboxConfig.categories.map(name => categoryIdMap[name] || name)
        );

        // Remove category elements whose toolboxitemid is not in the whitelist
        // Match <category ... toolboxitemid="xxx" ...>...</category> including nested content
        filtered = filtered.replace(
            /<category\b[^>]*\btoolboxitemid="([^"]*)"[^>]*>[\s\S]*?<\/category>/g,
            (match, id) => (allowedIds.has(id) ? match : '')
        );

        // Clean up leftover separators (consecutive <sep> elements)
        filtered = filtered.replace(/(<sep[^/]*\/>[\s\n]*){2,}/g, '$1');
    }

    // Filter blocks within categories
    if (toolboxConfig.blocks && typeof toolboxConfig.blocks === 'object') {
        for (const [categoryName, allowedBlocks] of Object.entries(toolboxConfig.blocks)) {
            const categoryId = categoryIdMap[categoryName] || categoryName;
            const allowedSet = new Set(allowedBlocks);

            // Find the category and filter its blocks
            const categoryRegex = new RegExp(
                `(<category\\b[^>]*\\btoolboxitemid="${categoryId}"[^>]*>)([\\s\\S]*?)(</category>)`,
                'g'
            );

            filtered = filtered.replace(categoryRegex, (match, openTag, content, closeTag) => {
                // Remove block elements whose type is not in the allowedSet
                const filteredContent = content.replace(
                    /<block\b[^>]*\btype="([^"]*)"[^>]*>[\s\S]*?<\/block>|<block\b[^>]*\btype="([^"]*)"[^>]*\/>/g,
                    (blockMatch, type1, type2) => {
                        const blockType = type1 || type2;
                        return allowedSet.has(blockType) ? blockMatch : '';
                    }
                );
                // Clean up leftover separators
                const cleaned = filteredContent.replace(/(<sep[^/]*\/>[\s\n]*){2,}/g, '$1');
                return openTag + cleaned + closeTag;
            });
        }
    }

    return filtered;
};

export {filterToolboxXML as default, categoryIdMap};
