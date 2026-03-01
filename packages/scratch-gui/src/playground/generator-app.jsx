/* eslint-disable react/jsx-no-bind */
import React from 'react';

// Block definitions per category (project file uses these keys)
const CATEGORIES = {
    motion: {
        label: 'Motion',
        blocks: [
            'motion_movesteps', 'motion_turnright', 'motion_turnleft',
            'motion_goto', 'motion_gotoxy',
            'motion_glideto', 'motion_glidesecstoxy',
            'motion_pointindirection', 'motion_pointtowards',
            'motion_changexby', 'motion_setx', 'motion_changeyby', 'motion_sety',
            'motion_ifonedgebounce', 'motion_setrotationstyle',
            'motion_xposition', 'motion_yposition', 'motion_direction'
        ]
    },
    looks: {
        label: 'Looks',
        blocks: [
            'looks_sayforsecs', 'looks_say', 'looks_thinkforsecs', 'looks_think',
            'looks_switchcostumeto', 'looks_nextcostume',
            'looks_switchbackdropto', 'looks_switchbackdroptoandwait', 'looks_nextbackdrop',
            'looks_changesizeby', 'looks_setsizeto',
            'looks_changeeffectby', 'looks_seteffectto', 'looks_cleargraphiceffects',
            'looks_show', 'looks_hide',
            'looks_gotofrontback', 'looks_goforwardbackwardlayers',
            'looks_costumenumbername', 'looks_backdropnumbername', 'looks_size'
        ]
    },
    sound: {
        label: 'Sound',
        blocks: [
            'sound_playuntildone', 'sound_play', 'sound_stopallsounds',
            'sound_changeeffectby', 'sound_seteffectto', 'sound_cleareffects',
            'sound_changevolumeby', 'sound_setvolumeto', 'sound_volume'
        ]
    },
    events: {
        label: 'Events',
        blocks: [
            'event_whenflagclicked', 'event_whenkeypressed',
            'event_whenthisspriteclicked', 'event_whenstageclicked',
            'event_whenbackdropswitchesto', 'event_whengreaterthan',
            'event_whenbroadcastreceived',
            'event_broadcast', 'event_broadcastandwait'
        ]
    },
    control: {
        label: 'Control',
        blocks: [
            'control_wait',
            'control_repeat', 'control_forever',
            'control_if', 'control_if_else',
            'control_wait_until', 'control_repeat_until',
            'control_stop',
            'control_start_as_clone', 'control_create_clone_of', 'control_delete_this_clone'
        ]
    },
    sensing: {
        label: 'Sensing',
        blocks: [
            'sensing_touchingobject', 'sensing_touchingcolor', 'sensing_coloristouchingcolor',
            'sensing_distanceto',
            'sensing_askandwait', 'sensing_answer',
            'sensing_keypressed', 'sensing_mousedown', 'sensing_mousex', 'sensing_mousey',
            'sensing_setdragmode',
            'sensing_loudness', 'sensing_timer', 'sensing_resettimer',
            'sensing_of', 'sensing_current', 'sensing_dayssince2000',
            'sensing_username'
        ]
    },
    operators: {
        label: 'Operators',
        blocks: [
            'operator_add', 'operator_subtract', 'operator_multiply', 'operator_divide',
            'operator_random',
            'operator_gt', 'operator_lt', 'operator_equals',
            'operator_and', 'operator_or', 'operator_not',
            'operator_join', 'operator_letter_of', 'operator_length', 'operator_contains',
            'operator_mod', 'operator_round', 'operator_mathop'
        ]
    },
    variables: {
        label: 'Variables',
        blocks: []
    },
    myBlocks: {
        label: 'My Blocks',
        blocks: []
    }
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);

const formatBlockName = name => name
    .replace(/^[a-z]+_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

const styles = {
    body: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: '20px',
        background: '#f4f4f8',
        color: '#333',
        minHeight: '100vh'
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
    },
    header: {
        gridColumn: '1 / -1',
        marginBottom: '8px'
    },
    h1: {
        fontSize: '24px',
        fontWeight: 600,
        color: '#4C97FF',
        margin: '0 0 4px 0'
    },
    subtitle: {
        fontSize: '14px',
        color: '#888',
        margin: 0
    },
    panel: {
        background: '#fff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    panelTitle: {
        fontSize: '16px',
        fontWeight: 600,
        margin: '0 0 16px 0',
        paddingBottom: '8px',
        borderBottom: '2px solid #4C97FF'
    },
    field: {
        marginBottom: '16px'
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: 600,
        marginBottom: '4px',
        color: '#555'
    },
    input: {
        width: '100%',
        padding: '8px 10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '14px',
        boxSizing: 'border-box'
    },
    checkbox: {
        marginRight: '6px',
        accentColor: '#4C97FF'
    },
    checkboxLabel: {
        fontSize: '13px',
        display: 'inline-flex',
        alignItems: 'center',
        marginRight: '12px',
        marginBottom: '4px',
        cursor: 'pointer'
    },
    categorySection: {
        marginBottom: '16px',
        border: '1px solid #eee',
        borderRadius: '6px',
        overflow: 'hidden'
    },
    categoryHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: '#f8f8fc',
        cursor: 'pointer',
        userSelect: 'none'
    },
    categoryName: {
        fontSize: '14px',
        fontWeight: 600
    },
    blocksGrid: {
        padding: '8px 12px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px 0'
    },
    blockItem: {
        width: '50%',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center'
    },
    jsonPanel: {
        position: 'sticky',
        top: '20px',
        maxHeight: 'calc(100vh - 40px)',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden'
    },
    jsonPre: {
        background: '#1e1e1e',
        color: '#d4d4d4',
        padding: '16px',
        borderRadius: '6px',
        fontSize: '12px',
        lineHeight: '1.5',
        overflow: 'auto',
        flex: 1,
        margin: '0 0 12px 0',
        maxHeight: '60vh',
        maxWidth: '100%',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap'
    },
    buttonRow: {
        display: 'flex',
        gap: '8px'
    },
    button: {
        flex: 1,
        padding: '10px 16px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer',
        color: '#fff',
        transition: 'opacity 0.15s'
    },
    downloadBtn: {
        background: '#4C97FF'
    },
    copyUrlBtn: {
        background: '#4CBB17'
    },
    copyJsonBtn: {
        background: '#FF8C1A'
    },
    toast: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#333',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '6px',
        fontSize: '14px',
        zIndex: 1000,
        animation: 'fadeIn 0.2s'
    },
    stepCard: {
        border: '1px solid #eee',
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '8px',
        background: '#fafafa'
    },
    stepHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    },
    removeBtn: {
        background: '#ff4444',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        padding: '4px 10px',
        cursor: 'pointer',
        fontSize: '12px'
    },
    addBtn: {
        background: '#4C97FF',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '8px 16px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 600
    },
    selectAllLink: {
        fontSize: '11px',
        color: '#4C97FF',
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        padding: 0,
        textDecoration: 'underline'
    }
};

const STORAGE_KEY = 'blockflow-generator-state';

// Serialize state for localStorage (Sets → Arrays)
const serializeState = state => {
    const s = {...state};
    s.enabledCategories = Array.from(s.enabledCategories);
    s.expandedCategories = Array.from(s.expandedCategories);
    const eb = {};
    for (const key of Object.keys(s.enabledBlocks)) {
        eb[key] = Array.from(s.enabledBlocks[key]);
    }
    s.enabledBlocks = eb;
    delete s.toast;
    return JSON.stringify(s);
};

// Deserialize state from localStorage (Arrays → Sets)
const deserializeState = json => {
    const s = JSON.parse(json);
    s.enabledCategories = new Set(s.enabledCategories);
    s.expandedCategories = new Set(s.expandedCategories || []);
    const eb = {};
    for (const key of Object.keys(s.enabledBlocks || {})) {
        eb[key] = new Set(s.enabledBlocks[key]);
    }
    // Ensure all categories have a block set
    for (const key of CATEGORY_KEYS) {
        if (!eb[key]) {
            eb[key] = new Set(CATEGORIES[key].blocks);
        }
    }
    s.enabledBlocks = eb;
    s.toast = null;
    return s;
};

class GeneratorApp extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            title: 'My Project',
            sb3: '',
            allowExtensions: true,
            showCostumesTab: true,
            showSoundsTab: true,
            showBuiltinCostumes: true,
            showBuiltinSounds: true,
            showBuiltinBackdrops: true,
            showBuiltinSprites: true,
            enabledCategories: new Set(CATEGORY_KEYS),
            enabledBlocks: {},
            expandedCategories: new Set(),
            filterAllBlocks: false,
            steps: [],
            costumes: [],
            sounds: [],
            backdrops: [],
            sprites: [],
            toast: null
        };

        // Initialize all blocks as enabled per category
        const enabledBlocks = {};
        for (const key of CATEGORY_KEYS) {
            enabledBlocks[key] = new Set(CATEGORIES[key].blocks);
        }
        this.state.enabledBlocks = enabledBlocks;

        // Restore from localStorage if available
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const restored = deserializeState(saved);
                Object.assign(this.state, restored);
            }
        } catch (_) {
            // Ignore parse errors
        }

        this._fileInput = React.createRef();
    }

    componentDidUpdate (_, prevState) {
        // Autosave to localStorage on every state change (skip toast-only changes)
        if (prevState !== this.state) {
            try {
                localStorage.setItem(STORAGE_KEY, serializeState(this.state));
            } catch (_) {
                // Ignore quota errors
            }
        }
    }

    handleTitleChange (e) {
        this.setState({title: e.target.value});
    }
    handleSb3Change (e) {
        this.setState({sb3: e.target.value});
    }
    handleAllowExtensionsChange (e) {
        this.setState({allowExtensions: e.target.checked});
    }
    handleShowCostumesTabChange (e) {
        this.setState({showCostumesTab: e.target.checked});
    }
    handleShowSoundsTabChange (e) {
        this.setState({showSoundsTab: e.target.checked});
    }
    handleFilterAllBlocksChange (e) {
        this.setState({filterAllBlocks: e.target.checked});
    }

    toggleCategory (key) {
        this.setState(prev => {
            const next = new Set(prev.enabledCategories);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return {enabledCategories: next};
        });
    }
    toggleExpandCategory (key) {
        this.setState(prev => {
            const next = new Set(prev.expandedCategories);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return {expandedCategories: next};
        });
    }
    toggleBlock (category, block) {
        this.setState(prev => {
            const next = {...prev.enabledBlocks};
            next[category] = new Set(next[category]);
            if (next[category].has(block)) {
                next[category].delete(block);
            } else {
                next[category].add(block);
            }
            return {enabledBlocks: next};
        });
    }
    selectAllBlocks (category) {
        this.setState(prev => {
            const next = {...prev.enabledBlocks};
            next[category] = new Set(CATEGORIES[category].blocks);
            return {enabledBlocks: next};
        });
    }
    deselectAllBlocks (category) {
        this.setState(prev => {
            const next = {...prev.enabledBlocks};
            next[category] = new Set();
            return {enabledBlocks: next};
        });
    }

    // Steps management
    addStep () {
        this.setState(prev => ({
            steps: [...prev.steps, {title: '', text: '', image: '', video: ''}]
        }));
    }
    removeStep (index) {
        this.setState(prev => ({
            steps: prev.steps.filter((_, i) => i !== index)
        }));
    }
    updateStep (index, field, value) {
        this.setState(prev => {
            const steps = [...prev.steps];
            steps[index] = {...steps[index], [field]: value};
            return {steps};
        });
    }

    // Asset management
    addAsset (type) {
        this.setState(prev => ({
            [type]: [...prev[type], {name: '', url: ''}]
        }));
    }
    removeAsset (type, index) {
        this.setState(prev => ({
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    }
    updateAsset (type, index, field, value) {
        this.setState(prev => {
            const items = [...prev[type]];
            items[index] = {...items[index], [field]: value};
            return {[type]: items};
        });
    }

    // Sprite management
    addSprite () {
        this.setState(prev => ({
            sprites: [...prev.sprites, {name: '', costumes: [], sounds: []}]
        }));
    }
    removeSprite (index) {
        this.setState(prev => ({
            sprites: prev.sprites.filter((_, i) => i !== index)
        }));
    }
    updateSpriteName (index, value) {
        this.setState(prev => {
            const sprites = [...prev.sprites];
            sprites[index] = {...sprites[index], name: value};
            return {sprites};
        });
    }
    addSpriteAsset (spriteIndex, type) {
        this.setState(prev => {
            const sprites = [...prev.sprites];
            sprites[spriteIndex] = {
                ...sprites[spriteIndex],
                [type]: [...sprites[spriteIndex][type], {name: '', url: ''}]
            };
            return {sprites};
        });
    }
    removeSpriteAsset (spriteIndex, type, assetIndex) {
        this.setState(prev => {
            const sprites = [...prev.sprites];
            sprites[spriteIndex] = {
                ...sprites[spriteIndex],
                [type]: sprites[spriteIndex][type].filter((_, i) => i !== assetIndex)
            };
            return {sprites};
        });
    }
    updateSpriteAsset (spriteIndex, type, assetIndex, field, value) {
        this.setState(prev => {
            const sprites = [...prev.sprites];
            const assets = [...sprites[spriteIndex][type]];
            assets[assetIndex] = {...assets[assetIndex], [field]: value};
            sprites[spriteIndex] = {...sprites[spriteIndex], [type]: assets};
            return {sprites};
        });
    }

    buildProjectJSON () {
        const {title, sb3, allowExtensions, showCostumesTab, showSoundsTab,
            showBuiltinCostumes, showBuiltinSounds, showBuiltinBackdrops, showBuiltinSprites,
            enabledCategories, enabledBlocks, filterAllBlocks, steps,
            costumes, sounds, backdrops, sprites} = this.state;

        const project = {title};

        if (sb3) {
            project.sb3 = sb3;
        }

        // Only add toolbox config if not all categories/blocks are enabled
        const allCategoriesEnabled = enabledCategories.size === CATEGORY_KEYS.length;
        let hasBlockFilter = false;
        if (filterAllBlocks) {
            for (const key of CATEGORY_KEYS) {
                const cat = CATEGORIES[key];
                if (cat.blocks.length > 0 && enabledBlocks[key].size < cat.blocks.length) {
                    hasBlockFilter = true;
                    break;
                }
            }
        }

        if (!allCategoriesEnabled || hasBlockFilter) {
            const toolbox = {};
            const categories = CATEGORY_KEYS.filter(k => enabledCategories.has(k));
            toolbox.categories = categories;

            if (hasBlockFilter) {
                const blocks = {};
                for (const key of categories) {
                    const cat = CATEGORIES[key];
                    if (cat.blocks.length > 0 &&
                        enabledBlocks[key].size < cat.blocks.length) {
                        blocks[key] = Array.from(enabledBlocks[key]);
                    }
                }
                if (Object.keys(blocks).length > 0) {
                    toolbox.blocks = blocks;
                }
            }

            project.toolbox = toolbox;
        }

        const ui = {};
        if (!allowExtensions) ui.allowExtensions = false;
        if (!showCostumesTab) ui.showCostumesTab = false;
        if (!showSoundsTab) ui.showSoundsTab = false;
        if (!showBuiltinCostumes) ui.showBuiltinCostumes = false;
        if (!showBuiltinSounds) ui.showBuiltinSounds = false;
        if (!showBuiltinBackdrops) ui.showBuiltinBackdrops = false;
        if (!showBuiltinSprites) ui.showBuiltinSprites = false;
        if (Object.keys(ui).length > 0) {
            project.ui = ui;
        }

        if (steps.length > 0) {
            const nonEmpty = steps.filter(s => s.title || s.text || s.image || s.video);
            if (nonEmpty.length > 0) {
                project.steps = nonEmpty.map(s => {
                    const step = {};
                    if (s.title) step.title = s.title;
                    if (s.text) step.text = s.text;
                    if (s.image) step.image = s.image;
                    if (s.video) step.video = s.video;
                    return step;
                });
            }
        }

        // Assets
        const filterAssets = arr => arr
            .filter(a => a.name && a.url)
            .map(a => {
                const entry = {name: a.name, url: a.url};
                if (typeof a.centerX === 'number') entry.centerX = a.centerX;
                if (typeof a.centerY === 'number') entry.centerY = a.centerY;
                return entry;
            });

        const filteredCostumes = filterAssets(costumes);
        const filteredSounds = sounds.filter(a => a.name && a.url).map(a => ({name: a.name, url: a.url}));
        const filteredBackdrops = filterAssets(backdrops);
        if (filteredCostumes.length > 0) project.costumes = filteredCostumes;
        if (filteredSounds.length > 0) project.sounds = filteredSounds;
        if (filteredBackdrops.length > 0) project.backdrops = filteredBackdrops;

        const filteredSprites = sprites
            .filter(s => s.name)
            .map(s => {
                const sprite = {name: s.name};
                const sc = filterAssets(s.costumes || []);
                const ss = (s.sounds || []).filter(a => a.name && a.url).map(a => ({name: a.name, url: a.url}));
                if (sc.length > 0) sprite.costumes = sc;
                if (ss.length > 0) sprite.sounds = ss;
                return sprite;
            });
        if (filteredSprites.length > 0) project.sprites = filteredSprites;

        return project;
    }

    getJSONString () {
        return JSON.stringify(this.buildProjectJSON(), null, 2);
    }

    handleDownload () {
        const json = this.getJSONString();
        const blob = new Blob([json], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.state.title || 'project'}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('Downloaded!');
    }

    handleCopyUrl () {
        const json = this.getJSONString();
        const encoded = btoa(encodeURIComponent(json));
        const baseUrl = window.location.origin + window.location.pathname.replace(/generator\.html$/, '');
        const url = `${baseUrl}?project=${encoded}`;
        this.copyToClipboard(url).then(() => {
            this.showToast('URL copied to clipboard!');
        });
    }

    handleCopyJSON () {
        const json = this.getJSONString();
        this.copyToClipboard(json).then(() => {
            this.showToast('JSON copied to clipboard!');
        });
    }

    copyToClipboard (text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        // Fallback for non-secure contexts (e.g. HTTP)
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return Promise.resolve();
    }

    showToast (message) {
        this.setState({toast: message});
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            this.setState({toast: null});
        }, 2000);
    }

    handleLoadFile () {
        this._fileInput.current.click();
    }

    handleFileSelected (e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const projectFile = JSON.parse(event.target.result);
                this.loadFromProjectJSON(projectFile);
                this.showToast(`Loaded "${projectFile.title || file.name}"`);
            } catch (err) {
                this.showToast(`Error: ${err.message}`);
            }
        };
        reader.readAsText(file);
        // Reset so the same file can be loaded again
        e.target.value = '';
    }

    loadFromProjectJSON (pf) {
        const newState = {
            title: pf.title || 'My Project',
            sb3: pf.sb3 || '',
            allowExtensions: !(pf.ui && pf.ui.allowExtensions === false),
            showCostumesTab: !(pf.ui && pf.ui.showCostumesTab === false),
            showSoundsTab: !(pf.ui && pf.ui.showSoundsTab === false),
            showBuiltinCostumes: !(pf.ui && pf.ui.showBuiltinCostumes === false),
            showBuiltinSounds: !(pf.ui && pf.ui.showBuiltinSounds === false),
            showBuiltinBackdrops: !(pf.ui && pf.ui.showBuiltinBackdrops === false),
            showBuiltinSprites: !(pf.ui && pf.ui.showBuiltinSprites === false),
            costumes: (pf.costumes || []).map(a => ({name: a.name || '', url: a.url || '',
                ...(typeof a.centerX === 'number' ? {centerX: a.centerX} : {}),
                ...(typeof a.centerY === 'number' ? {centerY: a.centerY} : {})})),
            sounds: (pf.sounds || []).map(a => ({name: a.name || '', url: a.url || ''})),
            backdrops: (pf.backdrops || []).map(a => ({name: a.name || '', url: a.url || '',
                ...(typeof a.centerX === 'number' ? {centerX: a.centerX} : {}),
                ...(typeof a.centerY === 'number' ? {centerY: a.centerY} : {})})),
            sprites: (pf.sprites || []).map(s => ({
                name: s.name || '',
                costumes: (s.costumes || []).map(a => ({name: a.name || '', url: a.url || '',
                    ...(typeof a.centerX === 'number' ? {centerX: a.centerX} : {}),
                    ...(typeof a.centerY === 'number' ? {centerY: a.centerY} : {})})),
                sounds: (s.sounds || []).map(a => ({name: a.name || '', url: a.url || ''}))
            })),
            steps: (pf.steps || []).map(s => ({
                title: s.title || '', text: s.text || '',
                image: s.image || '', video: s.video || ''
            }))
        };

        // Toolbox: categories and blocks
        if (pf.toolbox && pf.toolbox.categories) {
            newState.enabledCategories = new Set(pf.toolbox.categories);
            const eb = {};
            for (const key of CATEGORY_KEYS) {
                if (pf.toolbox.blocks && pf.toolbox.blocks[key]) {
                    eb[key] = new Set(pf.toolbox.blocks[key]);
                } else {
                    eb[key] = new Set(CATEGORIES[key].blocks);
                }
            }
            newState.enabledBlocks = eb;
            newState.filterAllBlocks = !!pf.toolbox.blocks;
        } else {
            newState.enabledCategories = new Set(CATEGORY_KEYS);
            const eb = {};
            for (const key of CATEGORY_KEYS) {
                eb[key] = new Set(CATEGORIES[key].blocks);
            }
            newState.enabledBlocks = eb;
            newState.filterAllBlocks = false;
        }
        newState.expandedCategories = new Set();

        this.setState(newState);
    }

    handleNewProject () {
        // eslint-disable-next-line no-alert
        if (!confirm('Start a new project? Unsaved changes will be lost.')) return;
        const enabledBlocks = {};
        for (const key of CATEGORY_KEYS) {
            enabledBlocks[key] = new Set(CATEGORIES[key].blocks);
        }
        this.setState({
            title: 'My Project',
            sb3: '',
            allowExtensions: true,
            showCostumesTab: true,
            showSoundsTab: true,
            showBuiltinCostumes: true,
            showBuiltinSounds: true,
            showBuiltinBackdrops: true,
            showBuiltinSprites: true,
            enabledCategories: new Set(CATEGORY_KEYS),
            enabledBlocks,
            expandedCategories: new Set(),
            filterAllBlocks: false,
            steps: [],
            costumes: [],
            sounds: [],
            backdrops: [],
            sprites: [],
            toast: null
        });
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (_) {
            // Ignore
        }
        this.showToast('New project created');
    }

    renderCategorySection (key) {
        const cat = CATEGORIES[key];
        const enabled = this.state.enabledCategories.has(key);
        const expanded = this.state.expandedCategories.has(key);
        const allSelected = cat.blocks.length > 0 &&
            this.state.enabledBlocks[key].size === cat.blocks.length;
        const noneSelected = cat.blocks.length > 0 &&
            this.state.enabledBlocks[key].size === 0;

        return (
            <div key={key} style={styles.categorySection}>
                <div style={styles.categoryHeader}>
                    <label style={{...styles.checkboxLabel, margin: 0}}>
                        <input
                            type="checkbox"
                            style={styles.checkbox}
                            checked={enabled}
                            onChange={() => this.toggleCategory(key)}
                        />
                        <span style={styles.categoryName}>{cat.label}</span>
                    </label>
                    {cat.blocks.length > 0 && this.state.filterAllBlocks && (
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <button
                                style={styles.selectAllLink}
                                onClick={() => this.selectAllBlocks(key)}
                                disabled={allSelected}
                            >All</button>
                            <button
                                style={styles.selectAllLink}
                                onClick={() => this.deselectAllBlocks(key)}
                                disabled={noneSelected}
                            >None</button>
                            <span
                                style={{cursor: 'pointer', fontSize: '12px', color: '#999'}}
                                onClick={() => this.toggleExpandCategory(key)}
                            >{expanded ? '▲' : '▼'}</span>
                        </div>
                    )}
                </div>
                {expanded && this.state.filterAllBlocks && cat.blocks.length > 0 && (
                    <div style={styles.blocksGrid}>
                        {cat.blocks.map(block => (
                            <label key={block} style={styles.blockItem}>
                                <input
                                    type="checkbox"
                                    style={styles.checkbox}
                                    checked={this.state.enabledBlocks[key].has(block)}
                                    onChange={() => this.toggleBlock(key, block)}
                                    disabled={!enabled}
                                />
                                {formatBlockName(block)}
                            </label>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    renderStepCard (step, index) {
        return (
            <div key={index} style={styles.stepCard}>
                <div style={styles.stepHeader}>
                    <span style={{fontWeight: 600, fontSize: '13px'}}>
                        Step {index + 1}
                    </span>
                    <button
                        style={styles.removeBtn}
                        onClick={() => this.removeStep(index)}
                    >Remove</button>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
                    <div>
                        <label style={styles.label}>Title</label>
                        <input
                            style={styles.input}
                            value={step.title}
                            onChange={e => this.updateStep(index, 'title', e.target.value)}
                            placeholder="Step title"
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Text</label>
                        <input
                            style={styles.input}
                            value={step.text}
                            onChange={e => this.updateStep(index, 'text', e.target.value)}
                            placeholder="Step description"
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Image URL</label>
                        <input
                            style={styles.input}
                            value={step.image}
                            onChange={e => this.updateStep(index, 'image', e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label style={styles.label}>Video URL</label>
                        <input
                            style={styles.input}
                            value={step.video}
                            onChange={e => this.updateStep(index, 'video', e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                </div>
            </div>
        );
    }

    renderAssetCard (type, asset, index) {
        const isCostumeOrBackdrop = type === 'costumes' || type === 'backdrops';
        return (
            <div key={index} style={styles.stepCard}>
                <div style={styles.stepHeader}>
                    <span style={{fontWeight: 600, fontSize: '13px'}}>
                        {asset.name || `${type.slice(0, -1)} ${index + 1}`}
                    </span>
                    <button
                        style={styles.removeBtn}
                        onClick={() => this.removeAsset(type, index)}
                    >Remove</button>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
                    <div>
                        <label style={styles.label}>Name</label>
                        <input
                            style={styles.input}
                            value={asset.name}
                            onChange={e => this.updateAsset(type, index, 'name', e.target.value)}
                            placeholder="Asset name"
                        />
                    </div>
                    <div>
                        <label style={styles.label}>URL</label>
                        <input
                            style={styles.input}
                            value={asset.url}
                            onChange={e => this.updateAsset(type, index, 'url', e.target.value)}
                            placeholder="https://..."
                        />
                    </div>
                    {isCostumeOrBackdrop && (
                        <div>
                            <label style={styles.label}>Center X</label>
                            <input
                                style={styles.input}
                                type="number"
                                value={asset.centerX ?? ''}
                                onChange={e => this.updateAsset(type, index, 'centerX',
                                    e.target.value === '' ? undefined : Number(e.target.value))}
                                placeholder="auto (center)"
                            />
                        </div>
                    )}
                    {isCostumeOrBackdrop && (
                        <div>
                            <label style={styles.label}>Center Y</label>
                            <input
                                style={styles.input}
                                type="number"
                                value={asset.centerY ?? ''}
                                onChange={e => this.updateAsset(type, index, 'centerY',
                                    e.target.value === '' ? undefined : Number(e.target.value))}
                                placeholder="auto (center)"
                            />
                        </div>
                    )}
                </div>
            </div>
        );
    }

    renderSpriteCard (sprite, spriteIndex) {
        return (
            <div key={spriteIndex} style={{...styles.stepCard, background: '#f0f4ff'}}>
                <div style={styles.stepHeader}>
                    <span style={{fontWeight: 600, fontSize: '13px'}}>
                        {sprite.name || `Sprite ${spriteIndex + 1}`}
                    </span>
                    <button
                        style={styles.removeBtn}
                        onClick={() => this.removeSprite(spriteIndex)}
                    >Remove</button>
                </div>
                <div style={{marginBottom: '8px'}}>
                    <label style={styles.label}>Name</label>
                    <input
                        style={styles.input}
                        value={sprite.name}
                        onChange={e => this.updateSpriteName(spriteIndex, e.target.value)}
                        placeholder="Sprite name"
                    />
                </div>
                <div style={{marginBottom: '8px'}}>
                    <label style={{...styles.label, color: '#4C97FF'}}>Costumes</label>
                    {(sprite.costumes || []).map((c, i) => (
                        <div key={i} style={{marginBottom: '4px'}}>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px'}}>
                                <input
                                    style={styles.input}
                                    value={c.name}
                                    onChange={e => this.updateSpriteAsset(spriteIndex, 'costumes', i, 'name',
                                        e.target.value)}
                                    placeholder="Costume name"
                                />
                                <input
                                    style={styles.input}
                                    value={c.url}
                                    onChange={e => this.updateSpriteAsset(spriteIndex, 'costumes', i, 'url',
                                        e.target.value)}
                                    placeholder="https://..."
                                />
                                <button
                                    style={styles.removeBtn}
                                    onClick={() => this.removeSpriteAsset(spriteIndex, 'costumes', i)}
                                >✕</button>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px',
                                marginTop: '4px'}}>
                                <input
                                    style={styles.input}
                                    type="number"
                                    value={c.centerX ?? ''}
                                    onChange={e => this.updateSpriteAsset(spriteIndex, 'costumes', i, 'centerX',
                                        e.target.value === '' ? undefined : Number(e.target.value))}
                                    placeholder="Center X (auto)"
                                />
                                <input
                                    style={styles.input}
                                    type="number"
                                    value={c.centerY ?? ''}
                                    onChange={e => this.updateSpriteAsset(spriteIndex, 'costumes', i, 'centerY',
                                        e.target.value === '' ? undefined : Number(e.target.value))}
                                    placeholder="Center Y (auto)"
                                />
                                <div style={{width: '60px'}} />
                            </div>
                        </div>
                    ))}
                    <button
                        style={{...styles.addBtn, fontSize: '11px', padding: '4px 10px'}}
                        onClick={() => this.addSpriteAsset(spriteIndex, 'costumes')}
                    >+ Costume</button>
                </div>
                <div>
                    <label style={{...styles.label, color: '#FF8C1A'}}>Sounds</label>
                    {(sprite.sounds || []).map((s, i) => (
                        <div key={i} style={{display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px',
                            marginBottom: '4px'}}>
                            <input
                                style={styles.input}
                                value={s.name}
                                onChange={e => this.updateSpriteAsset(spriteIndex, 'sounds', i, 'name',
                                    e.target.value)}
                                placeholder="Sound name"
                            />
                            <input
                                style={styles.input}
                                value={s.url}
                                onChange={e => this.updateSpriteAsset(spriteIndex, 'sounds', i, 'url',
                                    e.target.value)}
                                placeholder="https://..."
                            />
                            <button
                                style={styles.removeBtn}
                                onClick={() => this.removeSpriteAsset(spriteIndex, 'sounds', i)}
                            >✕</button>
                        </div>
                    ))}
                    <button
                        style={{...styles.addBtn, fontSize: '11px', padding: '4px 10px',
                            background: '#FF8C1A'}}
                        onClick={() => this.addSpriteAsset(spriteIndex, 'sounds')}
                    >+ Sound</button>
                </div>
            </div>
        );
    }

    render () {
        const jsonString = this.getJSONString();

        return (
            <div style={styles.body}>
                <div style={styles.container}>
                    <div style={styles.header}>
                        <h1 style={styles.h1}>Blockflow Project Generator</h1>
                        <p style={styles.subtitle}>
                            Configure your project and download the JSON or copy a URL with the configuration encoded.
                        </p>
                        <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                            <button
                                style={{...styles.button, ...styles.downloadBtn}}
                                onClick={() => this.handleNewProject()}
                            >📄 New</button>
                            <button
                                style={{...styles.button, ...styles.copyJsonBtn}}
                                onClick={() => this.handleLoadFile()}
                            >📂 Load</button>
                        </div>
                        <input
                            ref={this._fileInput}
                            type="file"
                            accept=".json,application/json"
                            style={{display: 'none'}}
                            onChange={e => this.handleFileSelected(e)}
                        />
                    </div>

                    {/* Left: Form */}
                    <div>
                        {/* General */}
                        <div style={{...styles.panel, marginBottom: '16px'}}>
                            <h2 style={styles.panelTitle}>General</h2>
                            <div style={styles.field}>
                                <label style={styles.label}>Title *</label>
                                <input
                                    style={styles.input}
                                    value={this.state.title}
                                    onChange={e => this.handleTitleChange(e)}
                                    placeholder="Project title"
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.label}>SB3 URL</label>
                                <input
                                    style={styles.input}
                                    value={this.state.sb3}
                                    onChange={e => this.handleSb3Change(e)}
                                    placeholder="https://example.com/project.sb3"
                                />
                            </div>
                            <div style={styles.field}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        style={styles.checkbox}
                                        checked={this.state.allowExtensions}
                                        onChange={e => this.handleAllowExtensionsChange(e)}
                                    />
                                    Allow Extensions
                                </label>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        style={styles.checkbox}
                                        checked={this.state.showCostumesTab}
                                        onChange={e => this.handleShowCostumesTabChange(e)}
                                    />
                                    Show Costumes Tab
                                </label>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        style={styles.checkbox}
                                        checked={this.state.showSoundsTab}
                                        onChange={e => this.handleShowSoundsTabChange(e)}
                                    />
                                    Show Sounds Tab
                                </label>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        style={styles.checkbox}
                                        checked={this.state.showBuiltinCostumes}
                                        onChange={e => this.setState({showBuiltinCostumes: e.target.checked})}
                                    />
                                    Show Built-in Costumes
                                </label>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        style={styles.checkbox}
                                        checked={this.state.showBuiltinSounds}
                                        onChange={e => this.setState({showBuiltinSounds: e.target.checked})}
                                    />
                                    Show Built-in Sounds
                                </label>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        style={styles.checkbox}
                                        checked={this.state.showBuiltinBackdrops}
                                        onChange={e => this.setState({showBuiltinBackdrops: e.target.checked})}
                                    />
                                    Show Built-in Backdrops
                                </label>
                            </div>
                            <div style={styles.field}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        style={styles.checkbox}
                                        checked={this.state.showBuiltinSprites}
                                        onChange={e => this.setState({showBuiltinSprites: e.target.checked})}
                                    />
                                    Show Built-in Sprites
                                </label>
                            </div>
                        </div>

                        {/* Toolbox */}
                        <div style={{...styles.panel, marginBottom: '16px'}}>
                            <h2 style={styles.panelTitle}>Toolbox</h2>
                            <div style={{...styles.field, marginBottom: '12px'}}>
                                <label style={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        style={styles.checkbox}
                                        checked={this.state.filterAllBlocks}
                                        onChange={e => this.handleFilterAllBlocksChange(e)}
                                    />
                                    Filter individual blocks
                                </label>
                            </div>
                            {CATEGORY_KEYS.map(key => this.renderCategorySection(key))}
                        </div>

                        {/* Steps */}
                        <div style={{...styles.panel, marginBottom: '16px'}}>
                            <h2 style={styles.panelTitle}>Tutorial Steps</h2>
                            {this.state.steps.map((step, i) =>
                                this.renderStepCard(step, i)
                            )}
                            <button
                                style={styles.addBtn}
                                onClick={() => this.addStep()}
                            >+ Add Step</button>
                        </div>

                        {/* Costumes */}
                        <div style={{...styles.panel, marginBottom: '16px'}}>
                            <h2 style={styles.panelTitle}>Costumes</h2>
                            {this.state.costumes.map((c, i) =>
                                this.renderAssetCard('costumes', c, i)
                            )}
                            <button
                                style={styles.addBtn}
                                onClick={() => this.addAsset('costumes')}
                            >+ Add Costume</button>
                        </div>

                        {/* Sounds */}
                        <div style={{...styles.panel, marginBottom: '16px'}}>
                            <h2 style={styles.panelTitle}>Sounds</h2>
                            {this.state.sounds.map((s, i) =>
                                this.renderAssetCard('sounds', s, i)
                            )}
                            <button
                                style={styles.addBtn}
                                onClick={() => this.addAsset('sounds')}
                            >+ Add Sound</button>
                        </div>

                        {/* Backdrops */}
                        <div style={{...styles.panel, marginBottom: '16px'}}>
                            <h2 style={styles.panelTitle}>Backdrops</h2>
                            {this.state.backdrops.map((b, i) =>
                                this.renderAssetCard('backdrops', b, i)
                            )}
                            <button
                                style={styles.addBtn}
                                onClick={() => this.addAsset('backdrops')}
                            >+ Add Backdrop</button>
                        </div>

                        {/* Sprites */}
                        <div style={styles.panel}>
                            <h2 style={styles.panelTitle}>Sprites</h2>
                            {this.state.sprites.map((sprite, i) =>
                                this.renderSpriteCard(sprite, i)
                            )}
                            <button
                                style={styles.addBtn}
                                onClick={() => this.addSprite()}
                            >+ Add Sprite</button>
                        </div>
                    </div>

                    {/* Right: Preview & Actions */}
                    <div style={{...styles.panel, ...styles.jsonPanel}}>
                        <h2 style={styles.panelTitle}>Project JSON</h2>
                        <pre style={styles.jsonPre}>{jsonString}</pre>
                        <div style={styles.buttonRow}>
                            <button
                                style={{...styles.button, ...styles.downloadBtn}}
                                onClick={() => this.handleDownload()}
                            >⬇ Download</button>
                            <button
                                style={{...styles.button, ...styles.copyJsonBtn}}
                                onClick={() => this.handleCopyJSON()}
                            >📋 Copy JSON</button>
                            <button
                                style={{...styles.button, ...styles.copyUrlBtn}}
                                onClick={() => this.handleCopyUrl()}
                            >🔗 Copy URL</button>
                        </div>
                    </div>
                </div>

                {this.state.toast && (
                    <div style={styles.toast}>{this.state.toast}</div>
                )}
            </div>
        );
    }
}

export default GeneratorApp;
