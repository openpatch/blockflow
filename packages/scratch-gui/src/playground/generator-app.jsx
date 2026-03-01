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
        flexDirection: 'column'
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
        maxHeight: '60vh'
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

class GeneratorApp extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            title: 'My Project',
            sb3: '',
            allowExtensions: true,
            showCostumesTab: true,
            showSoundsTab: true,
            enabledCategories: new Set(CATEGORY_KEYS),
            enabledBlocks: {},
            expandedCategories: new Set(),
            filterAllBlocks: false,
            steps: [],
            toast: null
        };

        // Initialize all blocks as enabled per category
        const enabledBlocks = {};
        for (const key of CATEGORY_KEYS) {
            enabledBlocks[key] = new Set(CATEGORIES[key].blocks);
        }
        this.state.enabledBlocks = enabledBlocks;
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

    buildProjectJSON () {
        const {title, sb3, allowExtensions, showCostumesTab, showSoundsTab,
            enabledCategories, enabledBlocks, filterAllBlocks, steps} = this.state;

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
        const url = `${baseUrl}?projectJson=${encoded}`;
        navigator.clipboard.writeText(url).then(() => {
            this.showToast('URL copied to clipboard!');
        });
    }

    handleCopyJSON () {
        const json = this.getJSONString();
        navigator.clipboard.writeText(json).then(() => {
            this.showToast('JSON copied to clipboard!');
        });
    }

    showToast (message) {
        this.setState({toast: message});
        clearTimeout(this._toastTimeout);
        this._toastTimeout = setTimeout(() => {
            this.setState({toast: null});
        }, 2000);
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
                        <div style={styles.panel}>
                            <h2 style={styles.panelTitle}>Tutorial Steps</h2>
                            {this.state.steps.map((step, i) =>
                                this.renderStepCard(step, i)
                            )}
                            <button
                                style={styles.addBtn}
                                onClick={() => this.addStep()}
                            >+ Add Step</button>
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
