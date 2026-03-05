/* eslint-disable react/jsx-no-bind */
import React from 'react';
import pako from 'pako';

import blockflowLogo from '../components/menu-bar/blockflow-logo.svg';

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

const CATEGORY_COLORS = {
    motion: '#4C97FF',
    looks: '#9966FF',
    sound: '#CF63CF',
    events: '#FFBF00',
    control: '#FFAB19',
    sensing: '#5CB1D6',
    operators: '#59C059',
    variables: '#FF8C1A',
    myBlocks: '#FF6680'
};

const CATEGORY_KEYS = Object.keys(CATEGORIES);

// Block shape types for visual rendering
const BLOCK_SHAPES = {};
// Hat blocks (event triggers)
['event_whenflagclicked', 'event_whenkeypressed', 'event_whenthisspriteclicked',
    'event_whenstageclicked', 'event_whenbackdropswitchesto', 'event_whengreaterthan',
    'event_whenbroadcastreceived', 'control_start_as_clone'].forEach(b => { BLOCK_SHAPES[b] = 'hat'; });
// Boolean blocks (hexagonal reporters)
['sensing_touchingobject', 'sensing_touchingcolor', 'sensing_coloristouchingcolor',
    'sensing_keypressed', 'sensing_mousedown',
    'operator_gt', 'operator_lt', 'operator_equals',
    'operator_and', 'operator_or', 'operator_not', 'operator_contains'].forEach(b => { BLOCK_SHAPES[b] = 'boolean'; });
// Reporter blocks (rounded reporters)
['motion_xposition', 'motion_yposition', 'motion_direction',
    'looks_costumenumbername', 'looks_backdropnumbername', 'looks_size',
    'sound_volume', 'sensing_distanceto', 'sensing_answer', 'sensing_mousex', 'sensing_mousey',
    'sensing_loudness', 'sensing_timer', 'sensing_of', 'sensing_current',
    'sensing_dayssince2000', 'sensing_username',
    'operator_add', 'operator_subtract', 'operator_multiply', 'operator_divide',
    'operator_random', 'operator_join', 'operator_letter_of', 'operator_length',
    'operator_mod', 'operator_round', 'operator_mathop'].forEach(b => { BLOCK_SHAPES[b] = 'reporter'; });
// C-blocks (wrap blocks)
['control_repeat', 'control_forever', 'control_if', 'control_if_else',
    'control_repeat_until'].forEach(b => { BLOCK_SHAPES[b] = 'c-block'; });
// Cap blocks (end blocks)
['control_stop', 'control_delete_this_clone'].forEach(b => { BLOCK_SHAPES[b] = 'cap'; });

const BLOCK_LABELS = {
    // Motion
    motion_movesteps: 'move () steps',
    motion_turnright: 'turn ↻ () degrees',
    motion_turnleft: 'turn ↺ () degrees',
    motion_goto: 'go to ()',
    motion_gotoxy: 'go to x: () y: ()',
    motion_glideto: 'glide () secs to ()',
    motion_glidesecstoxy: 'glide () secs to x: () y: ()',
    motion_pointindirection: 'point in direction ()',
    motion_pointtowards: 'point towards ()',
    motion_changexby: 'change x by ()',
    motion_setx: 'set x to ()',
    motion_changeyby: 'change y by ()',
    motion_sety: 'set y to ()',
    motion_ifonedgebounce: 'if on edge, bounce',
    motion_setrotationstyle: 'set rotation style []',
    motion_xposition: 'x position',
    motion_yposition: 'y position',
    motion_direction: 'direction',
    // Looks
    looks_sayforsecs: 'say () for () seconds',
    looks_say: 'say ()',
    looks_thinkforsecs: 'think () for () seconds',
    looks_think: 'think ()',
    looks_switchcostumeto: 'switch costume to []',
    looks_nextcostume: 'next costume',
    looks_switchbackdropto: 'switch backdrop to []',
    looks_switchbackdroptoandwait: 'switch backdrop to [] and wait',
    looks_nextbackdrop: 'next backdrop',
    looks_changesizeby: 'change size by ()',
    looks_setsizeto: 'set size to () %',
    looks_changeeffectby: 'change [] effect by ()',
    looks_seteffectto: 'set [] effect to ()',
    looks_cleargraphiceffects: 'clear graphic effects',
    looks_show: 'show',
    looks_hide: 'hide',
    looks_gotofrontback: 'go to [] layer',
    looks_goforwardbackwardlayers: 'go [] () layers',
    looks_costumenumbername: 'costume []',
    looks_backdropnumbername: 'backdrop []',
    looks_size: 'size',
    // Sound
    sound_playuntildone: 'play sound [] until done',
    sound_play: 'start sound []',
    sound_stopallsounds: 'stop all sounds',
    sound_changeeffectby: 'change [] effect by ()',
    sound_seteffectto: 'set [] effect to ()',
    sound_cleareffects: 'clear sound effects',
    sound_changevolumeby: 'change volume by ()',
    sound_setvolumeto: 'set volume to () %',
    sound_volume: 'volume',
    // Events
    event_whenflagclicked: 'when ⚑ clicked',
    event_whenkeypressed: 'when [] key pressed',
    event_whenthisspriteclicked: 'when this sprite clicked',
    event_whenstageclicked: 'when stage clicked',
    event_whenbackdropswitchesto: 'when backdrop switches to []',
    event_whengreaterthan: 'when [] > ()',
    event_whenbroadcastreceived: 'when I receive []',
    event_broadcast: 'broadcast []',
    event_broadcastandwait: 'broadcast [] and wait',
    // Control
    control_wait: 'wait () seconds',
    control_repeat: 'repeat ()',
    control_forever: 'forever',
    control_if: 'if <> then',
    control_if_else: 'if <> then / else',
    control_wait_until: 'wait until <>',
    control_repeat_until: 'repeat until <>',
    control_stop: 'stop []',
    control_start_as_clone: 'when I start as a clone',
    control_create_clone_of: 'create clone of []',
    control_delete_this_clone: 'delete this clone',
    // Sensing
    sensing_touchingobject: 'touching [] ?',
    sensing_touchingcolor: 'touching color () ?',
    sensing_coloristouchingcolor: 'color () is touching () ?',
    sensing_distanceto: 'distance to []',
    sensing_askandwait: 'ask () and wait',
    sensing_answer: 'answer',
    sensing_keypressed: 'key [] pressed?',
    sensing_mousedown: 'mouse down?',
    sensing_mousex: 'mouse x',
    sensing_mousey: 'mouse y',
    sensing_setdragmode: 'set drag mode []',
    sensing_loudness: 'loudness',
    sensing_timer: 'timer',
    sensing_resettimer: 'reset timer',
    sensing_of: '[] of []',
    sensing_current: 'current []',
    sensing_dayssince2000: 'days since 2000',
    sensing_username: 'username',
    // Operators
    operator_add: '() + ()',
    operator_subtract: '() - ()',
    operator_multiply: '() * ()',
    operator_divide: '() / ()',
    operator_random: 'pick random () to ()',
    operator_gt: '() > ()',
    operator_lt: '() < ()',
    operator_equals: '() = ()',
    operator_and: '<> and <>',
    operator_or: '<> or <>',
    operator_not: 'not <>',
    operator_join: 'join () ()',
    operator_letter_of: 'letter () of ()',
    operator_length: 'length of ()',
    operator_contains: '() contains () ?',
    operator_mod: '() mod ()',
    operator_round: 'round ()',
    operator_mathop: '[] of ()'
};

const formatBlockName = name => BLOCK_LABELS[name] ||
    name.replace(/^[a-z]+_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const renderBlockShape = (block, color, size = 20) => {
    const shape = BLOCK_SHAPES[block] || 'stack';
    const w = size * 2.4;
    const h = size;
    switch (shape) {
    case 'hat':
        return (
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{flexShrink: 0}}>
                <path
                    d={`M0,${h * 0.4} Q${w * 0.15},0 ${w * 0.3},${h * 0.4} L${w},${h * 0.4} L${w},${h} L0,${h} Z`}
                    fill={color}
                    rx="3"
                />
            </svg>
        );
    case 'boolean':
        return (
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{flexShrink: 0}}>
                <polygon
                    points={`${h / 2},0 ${w - h / 2},0 ${w},${h / 2} ${w - h / 2},${h} ${h / 2},${h} 0,${h / 2}`}
                    fill={color}
                />
            </svg>
        );
    case 'reporter':
        return (
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{flexShrink: 0}}>
                <rect x="0" y="0" width={w} height={h} rx={h / 2} fill={color} />
            </svg>
        );
    case 'c-block':
        return (
            <svg width={w} height={h * 1.2} viewBox={`0 0 ${w} ${h * 1.2}`} style={{flexShrink: 0}}>
                <path
                    d={`M0,0 L${w},0 L${w},${h * 0.4} L${w * 0.3},${h * 0.4} L${w * 0.3},${h * 0.8} L${w},${h * 0.8} L${w},${h * 1.2} L0,${h * 1.2} Z`}
                    fill={color}
                />
            </svg>
        );
    case 'cap':
        return (
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{flexShrink: 0}}>
                <path
                    d={`M0,0 L${w},0 L${w},${h * 0.7} L${w / 2},${h} L0,${h * 0.7} Z`}
                    fill={color}
                />
            </svg>
        );
    default:
        return (
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{flexShrink: 0}}>
                <rect x="0" y="0" width={w} height={h} rx="3" fill={color} />
            </svg>
        );
    }
};

const styles = {
    body: {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        margin: 0,
        padding: 0,
        background: '#F5F5F5',
        color: '#242428',
        minHeight: '100vh'
    },
    navBar: {
        display: 'flex',
        alignItems: 'center',
        height: '64px',
        background: '#017460',
        color: '#fff',
        padding: '0 12px',
        fontSize: '14px',
        fontWeight: 'bold',
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        boxSizing: 'border-box'
    },
    navLogo: {
        height: '32px',
        marginRight: '16px'
    },
    navLinks: {
        display: 'flex',
        gap: '4px',
        marginLeft: 'auto'
    },
    navLink: {
        color: '#fff',
        textDecoration: 'none',
        padding: '0 12px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        transition: 'background-color 0.15s'
    },
    container: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '20px'
    },
    header: {
        marginBottom: '8px'
    },
    h1: {
        fontSize: '24px',
        fontWeight: 600,
        color: '#017460',
        margin: '0 0 4px 0'
    },
    subtitle: {
        fontSize: '14px',
        color: '#A4A4A4',
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
        borderBottom: '2px solid #017460'
    },
    panelTitleCollapsible: {
        fontSize: '16px',
        fontWeight: 600,
        margin: 0,
        paddingBottom: '8px',
        borderBottom: '2px solid #017460',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none'
    },
    chevron: {
        fontSize: '12px',
        transition: 'transform 0.15s',
        marginLeft: '8px'
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
        accentColor: '#017460'
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
        background: '#F5F5F5',
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
    stickyToolbar: {
        position: 'sticky',
        top: 0,
        zIndex: 90,
        background: '#fff',
        borderBottom: '2px solid #E0E0E0',
        padding: '8px 20px',
        display: 'flex',
        justifyContent: 'center'
    },
    stickyToolbarInner: {
        maxWidth: '900px',
        width: '100%',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap'
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
        background: '#017460'
    },
    copyUrlBtn: {
        background: '#004C45'
    },
    copyJsonBtn: {
        background: '#3C3C3C'
    },
    toast: {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#242428',
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
        background: '#017460',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '6px 12px',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: 600,
        lineHeight: '1.4'
    },
    selectAllLink: {
        fontSize: '11px',
        color: '#017460',
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        padding: 0,
        textDecoration: 'underline'
    },
    thumbnail: {
        width: '48px',
        height: '48px',
        objectFit: 'contain',
        borderRadius: '4px',
        border: '1px solid #eee',
        background: '#fafafa',
        flexShrink: 0
    },
    dragHandle: {
        cursor: 'grab',
        fontSize: '16px',
        color: '#999',
        padding: '0 4px',
        userSelect: 'none',
        display: 'flex',
        alignItems: 'center'
    },
    dragOver: {
        borderTop: '2px solid #017460'
    },
    dragging: {
        opacity: 0.4
    },
    inputError: {
        borderColor: '#ff4444'
    },
    errorText: {
        color: '#ff4444',
        fontSize: '11px',
        marginTop: '2px'
    },
    wizardNav: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0',
        margin: '0 0 24px 0',
        gridColumn: '1 / -1'
    },
    wizardStep: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        minWidth: '80px'
    },
    wizardCircle: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 600,
        border: '2px solid #ddd',
        background: '#fff',
        color: '#999',
        transition: 'all 0.15s'
    },
    wizardCircleActive: {
        border: '2px solid #017460',
        background: '#017460',
        color: '#fff'
    },
    wizardCircleDone: {
        border: '2px solid #017460',
        background: '#B5E3D8',
        color: '#017460'
    },
    wizardLabel: {
        fontSize: '11px',
        color: '#999',
        marginTop: '4px',
        textAlign: 'center'
    },
    wizardLabelActive: {
        color: '#017460',
        fontWeight: 600
    },
    wizardLine: {
        width: '40px',
        height: '2px',
        background: '#ddd',
        marginBottom: '18px'
    },
    wizardLineDone: {
        background: '#017460'
    },
    wizardButtons: {
        display: 'flex',
        gap: '8px',
        marginTop: '16px',
        justifyContent: 'space-between'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
    },
    modalContent: {
        background: '#fff',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '700px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '2px solid #017460'
    },
    spriteCompactCard: {
        border: '1px solid #eee',
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '8px',
        background: '#fafafa',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        transition: 'border-color 0.15s'
    },
    spriteCompactInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '2px'
    },
    previewToggle: {
        width: '100%',
        padding: '8px 16px',
        border: '1px solid #017460',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        background: '#fff',
        color: '#017460',
        marginTop: '8px',
        transition: 'all 0.15s'
    },
    previewIframe: {
        width: '100%',
        height: '100%',
        border: 'none',
        background: '#fff'
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
    delete s.collapsedSections;
    delete s.dragType;
    delete s.dragIndex;
    delete s.dragOverIndex;
    delete s.showPreview;
    delete s.previewUrl;
    delete s.editingSpriteIndex;
    delete s.validationErrors;
    delete s.libraryPreviews;
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
    s.collapsedSections = new Set();
    s.toast = null;
    s.dragType = null;
    s.dragIndex = null;
    s.dragOverIndex = null;
    s.showPreview = false;
    s.previewUrl = '';
    s.editingSpriteIndex = null;
    s.validationErrors = {};
    s.libraryPreviews = {};
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
            collapsedSections: new Set(),
            filterAllBlocks: false,
            steps: [],
            costumes: [],
            sounds: [],
            backdrops: [],
            sprites: [],
            costumeTags: [],
            soundTags: [],
            backdropTags: [],
            spriteTags: [],
            costumeLibraryUrls: [],
            soundLibraryUrls: [],
            backdropLibraryUrls: [],
            spriteLibraryUrls: [],
            toast: null,
            wizardMode: true,
            wizardStep: 0,
            dragType: null,
            dragIndex: null,
            dragOverIndex: null,
            showPreview: false,
            previewUrl: '',
            editingSpriteIndex: null,
            validationErrors: {},
            libraryPreviews: {}
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
            } catch (_e) {
                // Ignore quota errors
            }
        }
        // Debounced preview update
        if (this.state.showPreview && prevState !== this.state &&
            (prevState.showPreview !== this.state.showPreview ||
             prevState.previewUrl === this.state.previewUrl)) {
            clearTimeout(this._previewTimeout);
            this._previewTimeout = setTimeout(() => {
                this.updatePreviewUrl();
            }, 500);
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
    toggleSection (key) {
        this.setState(prev => {
            const next = new Set(prev.collapsedSections);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return {collapsedSections: next};
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

    // Library URL management
    addLibraryUrl (stateKey) {
        this.setState(prev => ({
            [stateKey]: [...prev[stateKey], '']
        }));
    }
    removeLibraryUrl (stateKey, index) {
        this.setState(prev => ({
            [stateKey]: prev[stateKey].filter((_, i) => i !== index)
        }));
    }
    updateLibraryUrl (stateKey, index, value) {
        this.setState(prev => {
            const urls = [...prev[stateKey]];
            urls[index] = value;
            // Clear preview when URL changes
            const previews = {...prev.libraryPreviews};
            delete previews[`${stateKey}.${index}`];
            return {[stateKey]: urls, libraryPreviews: previews};
        });
    }
    fetchLibraryPreview (stateKey, index, url) {
        if (!url) return;
        const previewKey = `${stateKey}.${index}`;
        this.setState(prev => ({
            libraryPreviews: {...prev.libraryPreviews, [previewKey]: {loading: true}}
        }));
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                const items = Array.isArray(data) ? data : [];
                // Resolve relative URLs
                const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
                const resolved = items.map(item => ({
                    ...item,
                    url: item.url && !item.url.startsWith('http') ?
                        baseUrl + item.url : item.url
                }));
                this.setState(prev => ({
                    libraryPreviews: {
                        ...prev.libraryPreviews,
                        [previewKey]: {loading: false, items: resolved}
                    }
                }));
            })
            .catch(err => {
                this.setState(prev => ({
                    libraryPreviews: {
                        ...prev.libraryPreviews,
                        [previewKey]: {loading: false, error: err.message}
                    }
                }));
            });
    }
    toggleLibraryPreview (stateKey, index, url) {
        const previewKey = `${stateKey}.${index}`;
        const existing = this.state.libraryPreviews[previewKey];
        if (existing && !existing.loading) {
            // Toggle off
            this.setState(prev => {
                const previews = {...prev.libraryPreviews};
                delete previews[previewKey];
                return {libraryPreviews: previews};
            });
        } else if (!existing) {
            this.fetchLibraryPreview(stateKey, index, url);
        }
    }

    // Drag-and-drop reordering
    moveItem (stateKey, fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        this.setState(prev => {
            const items = [...prev[stateKey]];
            const [moved] = items.splice(fromIndex, 1);
            items.splice(toIndex, 0, moved);
            return {[stateKey]: items};
        });
    }
    moveSpriteAsset (spriteIndex, type, fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        this.setState(prev => {
            const sprites = [...prev.sprites];
            const assets = [...sprites[spriteIndex][type]];
            const [moved] = assets.splice(fromIndex, 1);
            assets.splice(toIndex, 0, moved);
            sprites[spriteIndex] = {...sprites[spriteIndex], [type]: assets};
            return {sprites};
        });
    }
    handleDragStart (type, index, e) {
        this.setState({dragType: type, dragIndex: index, dragOverIndex: null});
        e.dataTransfer.effectAllowed = 'move';
    }
    handleDragOver (type, index, e) {
        e.preventDefault();
        if (this.state.dragType === type && this.state.dragOverIndex !== index) {
            this.setState({dragOverIndex: index});
        }
    }
    handleDrop (stateKey, e) {
        e.preventDefault();
        const {dragIndex, dragOverIndex} = this.state;
        if (dragIndex !== null && dragOverIndex !== null) {
            this.moveItem(stateKey, dragIndex, dragOverIndex);
        }
        this.setState({dragType: null, dragIndex: null, dragOverIndex: null});
    }
    handleDragEnd () {
        this.setState({dragType: null, dragIndex: null, dragOverIndex: null});
    }

    // Inline validation
    validateField (path, value, rules) {
        const errors = {...this.state.validationErrors};
        let error = null;
        if (rules.required && (!value || !value.trim())) {
            error = 'This field is required';
        } else if (rules.url && value && value.trim()) {
            try {
                new URL(value);
            } catch (_) {
                if (!value.startsWith('/') && !value.startsWith('./') && !value.startsWith('../')) {
                    error = 'Enter a valid URL';
                }
            }
        }
        if (error) {
            errors[path] = error;
        } else {
            delete errors[path];
        }
        this.setState({validationErrors: errors});
    }
    clearValidation (path) {
        if (this.state.validationErrors[path]) {
            const errors = {...this.state.validationErrors};
            delete errors[path];
            this.setState({validationErrors: errors});
        }
    }

    // Wizard navigation
    setWizardStep (step) {
        this.setState({wizardStep: step});
    }
    toggleWizardMode () {
        this.setState(prev => ({wizardMode: !prev.wizardMode}));
    }

    // Live preview
    updatePreviewUrl () {
        if (!this.state.showPreview) return;
        const json = this.getJSONString();
        const compressed = pako.deflate(json);
        const binary = String.fromCharCode.apply(null, compressed);
        const encoded = `pako:${btoa(binary)}`;
        const baseUrl = window.location.origin +
            window.location.pathname.replace(/generator\.html$/, 'editor.html');
        const url = `${baseUrl}?project=${encodeURIComponent(encoded)}`;
        this.setState({previewUrl: url});
    }
    togglePreview () {
        this.setState(prev => {
            const next = !prev.showPreview;
            return {showPreview: next, previewUrl: ''};
        }, () => {
            if (this.state.showPreview) {
                this.updatePreviewUrl();
            }
        });
    }

    // Sprite modal
    openSpriteModal (index) {
        this.setState({editingSpriteIndex: index});
    }
    closeSpriteModal () {
        this.setState({editingSpriteIndex: null});
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
            costumes, sounds, backdrops, sprites,
            costumeTags, soundTags, backdropTags, spriteTags,
            costumeLibraryUrls, soundLibraryUrls, backdropLibraryUrls, spriteLibraryUrls} = this.state;

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

        // Assets — use nested format {showBuiltin, tags, library} when needed
        const filterAssets = arr => arr
            .filter(a => a.name && a.url)
            .map(a => {
                const entry = {name: a.name, url: a.url};
                if (typeof a.centerX === 'number') entry.centerX = a.centerX;
                if (typeof a.centerY === 'number') entry.centerY = a.centerY;
                if (a.tags && a.tags.length > 0) entry.tags = a.tags;
                return entry;
            });

        const buildAssetTypeField = (items, tags, showBuiltin, enabled, libraryUrls) => {
            const hasItems = items.length > 0;
            const hasTags = tags.length > 0;
            const hasShowBuiltin = !showBuiltin;
            const hasEnabled = enabled === false;
            const filteredUrls = (libraryUrls || []).filter(u => u.trim());
            const hasUrls = filteredUrls.length > 0;
            if (!hasItems && !hasTags && !hasShowBuiltin && !hasEnabled && !hasUrls) return null;
            // Mixed library: combine URLs and inline items
            const library = [...filteredUrls, ...items];
            if (library.length > 0 && !hasTags && !hasShowBuiltin && !hasEnabled) {
                // If only URLs, return just the URLs
                if (!hasItems) return {library: filteredUrls.length === 1 ? filteredUrls[0] : filteredUrls};
                // If only inline items and no URLs, return flat array
                if (!hasUrls) return items;
                return {library};
            }
            const field = {};
            if (hasEnabled) field.enabled = false;
            if (hasShowBuiltin) field.showBuiltin = false;
            if (hasTags) field.tags = tags;
            if (library.length > 0) field.library = library;
            return field;
        };

        const filteredCostumes = filterAssets(costumes);
        const filteredSounds = sounds.filter(a => a.name && a.url).map(a => {
            const entry = {name: a.name, url: a.url};
            if (a.tags && a.tags.length > 0) entry.tags = a.tags;
            return entry;
        });
        const filteredBackdrops = filterAssets(backdrops);

        const costumeField = buildAssetTypeField(filteredCostumes, costumeTags, showBuiltinCostumes,
            showCostumesTab, costumeLibraryUrls);
        if (costumeField) project.costumes = costumeField;
        const soundField = buildAssetTypeField(filteredSounds, soundTags, showBuiltinSounds,
            showSoundsTab, soundLibraryUrls);
        if (soundField) project.sounds = soundField;
        const backdropField = buildAssetTypeField(filteredBackdrops, backdropTags, showBuiltinBackdrops,
            undefined, backdropLibraryUrls);
        if (backdropField) project.backdrops = backdropField;

        const filteredSprites = sprites
            .filter(s => s.name)
            .map(s => {
                const sprite = {name: s.name};
                const sc = filterAssets(s.costumes || []);
                const ss = (s.sounds || []).filter(a => a.name && a.url).map(a => {
                    const entry = {name: a.name, url: a.url};
                    if (a.tags && a.tags.length > 0) entry.tags = a.tags;
                    return entry;
                });
                if (sc.length > 0) sprite.costumes = sc;
                if (ss.length > 0) sprite.sounds = ss;
                if (s.tags && s.tags.length > 0) sprite.tags = s.tags;
                return sprite;
            });
        const spriteField = buildAssetTypeField(filteredSprites, spriteTags, showBuiltinSprites,
            undefined, spriteLibraryUrls);
        if (spriteField) project.sprites = spriteField;

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
        const compressed = pako.deflate(json);
        const binary = String.fromCharCode.apply(null, compressed);
        const encoded = `pako:${btoa(binary)}`;
        const baseUrl = window.location.origin + window.location.pathname.replace(/generator\.html$/, 'editor.html');
        const url = `${baseUrl}?project=${encodeURIComponent(encoded)}`;
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
        // Helper to extract inline items from flat array or nested format (skip URL strings)
        const getItems = field => {
            if (!field) return [];
            if (Array.isArray(field)) return field;
            const lib = field.library;
            if (!lib) return [];
            if (typeof lib === 'string') return [];
            if (Array.isArray(lib)) return lib.filter(item => typeof item !== 'string');
            return [];
        };
        // Helper to extract library URLs from nested format
        const getLibraryUrls = field => {
            if (!field || Array.isArray(field)) return [];
            const lib = field.library;
            if (typeof lib === 'string') return [lib];
            if (Array.isArray(lib)) return lib.filter(item => typeof item === 'string');
            return [];
        };
        const getTags = field => {
            if (!field || Array.isArray(field)) return [];
            return field.tags || [];
        };
        const getShowBuiltin = (field, uiFallback) => {
            if (field && !Array.isArray(field) && typeof field.showBuiltin === 'boolean') {
                return field.showBuiltin;
            }
            // Backward compat: check ui.showBuiltin*
            if (typeof uiFallback === 'boolean') return uiFallback;
            return true;
        };

        const costumeItems = getItems(pf.costumes);
        const soundItems = getItems(pf.sounds);
        const backdropItems = getItems(pf.backdrops);
        const spriteItems = getItems(pf.sprites);

        const newState = {
            title: pf.title || 'My Project',
            sb3: pf.sb3 || '',
            allowExtensions: !(pf.ui && pf.ui.allowExtensions === false),
            showCostumesTab: !(pf.costumes && typeof pf.costumes === 'object' &&
                !Array.isArray(pf.costumes) && pf.costumes.enabled === false),
            showSoundsTab: !(pf.sounds && typeof pf.sounds === 'object' &&
                !Array.isArray(pf.sounds) && pf.sounds.enabled === false),
            showBuiltinCostumes: getShowBuiltin(pf.costumes,
                pf.ui && pf.ui.showBuiltinCostumes),
            showBuiltinSounds: getShowBuiltin(pf.sounds,
                pf.ui && pf.ui.showBuiltinSounds),
            showBuiltinBackdrops: getShowBuiltin(pf.backdrops,
                pf.ui && pf.ui.showBuiltinBackdrops),
            showBuiltinSprites: getShowBuiltin(pf.sprites,
                pf.ui && pf.ui.showBuiltinSprites),
            costumes: costumeItems.map(a => ({name: a.name || '', url: a.url || '',
                ...(typeof a.centerX === 'number' ? {centerX: a.centerX} : {}),
                ...(typeof a.centerY === 'number' ? {centerY: a.centerY} : {}),
                ...(a.tags ? {tags: a.tags} : {})})),
            sounds: soundItems.map(a => ({
                name: a.name || '',
                url: a.url || '',
                ...(a.tags ? {tags: a.tags} : {})
            })),
            backdrops: backdropItems.map(a => ({name: a.name || '', url: a.url || '',
                ...(typeof a.centerX === 'number' ? {centerX: a.centerX} : {}),
                ...(typeof a.centerY === 'number' ? {centerY: a.centerY} : {}),
                ...(a.tags ? {tags: a.tags} : {})})),
            sprites: spriteItems.map(s => ({
                name: s.name || '',
                costumes: (s.costumes || []).map(a => ({name: a.name || '', url: a.url || '',
                    ...(typeof a.centerX === 'number' ? {centerX: a.centerX} : {}),
                    ...(typeof a.centerY === 'number' ? {centerY: a.centerY} : {})})),
                sounds: (s.sounds || []).map(a => ({name: a.name || '', url: a.url || ''})),
                ...(s.tags ? {tags: s.tags} : {})
            })),
            costumeTags: getTags(pf.costumes),
            soundTags: getTags(pf.sounds),
            backdropTags: getTags(pf.backdrops),
            spriteTags: getTags(pf.sprites),
            costumeLibraryUrls: getLibraryUrls(pf.costumes),
            soundLibraryUrls: getLibraryUrls(pf.sounds),
            backdropLibraryUrls: getLibraryUrls(pf.backdrops),
            spriteLibraryUrls: getLibraryUrls(pf.sprites),
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
            collapsedSections: new Set(),
            filterAllBlocks: false,
            steps: [],
            costumes: [],
            sounds: [],
            backdrops: [],
            sprites: [],
            costumeTags: [],
            soundTags: [],
            backdropTags: [],
            spriteTags: [],
            costumeLibraryUrls: [],
            soundLibraryUrls: [],
            backdropLibraryUrls: [],
            spriteLibraryUrls: [],
            toast: null,
            validationErrors: {},
            editingSpriteIndex: null
        });
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (_e) {
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
                <div
                    style={styles.categoryHeader}
                    onClick={() => {
                        if (cat.blocks.length > 0 && this.state.filterAllBlocks) {
                            this.toggleExpandCategory(key);
                        }
                    }}
                >
                    <label style={{...styles.checkboxLabel, margin: 0}}
                        onClick={e => e.stopPropagation()}>
                        <input
                            type="checkbox"
                            style={styles.checkbox}
                            checked={enabled}
                            onChange={() => this.toggleCategory(key)}
                        />
                        <span style={styles.categoryName}>{cat.label}</span>
                    </label>
                    {cat.blocks.length > 0 && this.state.filterAllBlocks && (
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}
                            onClick={e => e.stopPropagation()}>
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
                        {cat.blocks.map(block => {
                            const color = CATEGORY_COLORS[key] || '#999';
                            const blockEnabled = this.state.enabledBlocks[key].has(block);
                            return (
                                <label key={block} style={styles.blockItem}>
                                    <input
                                        type="checkbox"
                                        style={styles.checkbox}
                                        checked={blockEnabled}
                                        onChange={() => this.toggleBlock(key, block)}
                                        disabled={!enabled}
                                    />
                                    {renderBlockShape(block, blockEnabled && enabled ? color : '#ccc', 14)}
                                    <span style={{marginLeft: '4px'}}>
                                        {formatBlockName(block)}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    renderStepCard (step, index) {
        const isDragging = this.state.dragType === 'steps' && this.state.dragIndex === index;
        const isDragOver = this.state.dragType === 'steps' && this.state.dragOverIndex === index;
        return (
            <div
                key={index}
                style={{
                    ...styles.stepCard,
                    ...(isDragging ? styles.dragging : {}),
                    ...(isDragOver ? styles.dragOver : {})
                }}
                draggable
                onDragStart={e => this.handleDragStart('steps', index, e)}
                onDragOver={e => this.handleDragOver('steps', index, e)}
                onDrop={e => this.handleDrop('steps', e)}
                onDragEnd={() => this.handleDragEnd()}
            >
                <div style={styles.stepHeader}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                        <span style={styles.dragHandle}>⠿</span>
                        <span style={{fontWeight: 600, fontSize: '13px'}}>
                            Step {index + 1}
                        </span>
                    </div>
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

    renderLibraryUrls (stateKey, label) {
        const urls = this.state[stateKey];
        const dragKey = `lib_${stateKey}`;
        const isImageType = stateKey === 'costumeLibraryUrls' ||
            stateKey === 'backdropLibraryUrls' || stateKey === 'spriteLibraryUrls';
        return (
            <div style={{marginBottom: '8px'}}>
                <label style={{...styles.label, fontWeight: 600}}>{label}</label>
                {urls.map((url, i) => {
                    const isDragging = this.state.dragType === dragKey && this.state.dragIndex === i;
                    const isDragOver = this.state.dragType === dragKey && this.state.dragOverIndex === i;
                    const errKey = `${stateKey}.${i}`;
                    const previewKey = `${stateKey}.${i}`;
                    const preview = this.state.libraryPreviews[previewKey];
                    const hasUrl = url && url.trim().length > 0;
                    return (
                        <div key={i} style={{marginBottom: '4px'}}>
                            <div
                                style={{
                                    display: 'flex', gap: '8px', alignItems: 'center',
                                    ...(isDragging ? styles.dragging : {}),
                                    ...(isDragOver ? styles.dragOver : {})
                                }}
                                draggable
                                onDragStart={e => this.handleDragStart(dragKey, i, e)}
                                onDragOver={e => this.handleDragOver(dragKey, i, e)}
                                onDrop={e => this.handleDrop(stateKey, e)}
                                onDragEnd={() => this.handleDragEnd()}
                            >
                                <span style={styles.dragHandle}>⠿</span>
                                <div style={{flex: 1}}>
                                    <input
                                        style={{
                                            ...styles.input, marginBottom: 0,
                                            ...(this.state.validationErrors[errKey] ? styles.inputError : {})
                                        }}
                                        value={url}
                                        onChange={e => {
                                            this.updateLibraryUrl(stateKey, i, e.target.value);
                                            this.clearValidation(errKey);
                                        }}
                                        onBlur={() => this.validateField(errKey, url, {url: true})}
                                        placeholder="https://example.com/library.json"
                                    />
                                    {this.state.validationErrors[errKey] && (
                                        <div style={styles.errorText}>{this.state.validationErrors[errKey]}</div>
                                    )}
                                </div>
                                <button
                                    style={{
                                        ...styles.addBtn,
                                        opacity: hasUrl ? 1 : 0.4
                                    }}
                                    disabled={!hasUrl || (preview && preview.loading)}
                                    onClick={() => this.toggleLibraryPreview(stateKey, i, url)}
                                >{preview && !preview.loading ? '▲ Hide' : '▼ Preview'}</button>
                                <button
                                    style={styles.removeBtn}
                                    onClick={() => this.removeLibraryUrl(stateKey, i)}
                                >✕</button>
                            </div>
                            {preview && (
                                <div style={{
                                    marginTop: '4px', marginLeft: '28px', padding: '8px',
                                    background: '#F9F9F9', borderRadius: '6px', border: '1px solid #E0E0E0',
                                    fontSize: '12px'
                                }}>
                                    {preview.loading && (
                                        <span style={{color: '#999'}}>Loading...</span>
                                    )}
                                    {preview.error && (
                                        <span style={{color: '#e74c3c'}}>Error: {preview.error}</span>
                                    )}
                                    {preview.items && (
                                        <div>
                                            <div style={{
                                                fontWeight: 600, marginBottom: '6px', color: '#555'
                                            }}>
                                                {preview.items.length} item{preview.items.length !== 1 ? 's' : ''}
                                            </div>
                                            <div style={{
                                                display: 'flex', flexWrap: 'wrap', gap: '8px',
                                                maxHeight: '200px', overflowY: 'auto'
                                            }}>
                                                {preview.items.map((item, j) => (
                                                    <div key={j} style={{
                                                        display: 'flex', flexDirection: 'column',
                                                        alignItems: 'center', width: '72px'
                                                    }}>
                                                        {isImageType && item.url ? (
                                                            <div style={{
                                                                width: '48px', height: '48px',
                                                                position: 'relative',
                                                                background: '#fff',
                                                                borderRadius: '4px',
                                                                border: '1px solid #ddd',
                                                                overflow: 'hidden'
                                                            }}
                                                            title={item.centerX != null || item.centerY != null ?
                                                                `center: ${item.centerX ?? 0}, ${item.centerY ?? 0}` :
                                                                item.name}
                                                            >
                                                                <img
                                                                    src={item.url}
                                                                    alt={item.name}
                                                                    style={{
                                                                        width: '48px', height: '48px',
                                                                        objectFit: 'contain'
                                                                    }}
                                                                    onLoad={e => {
                                                                        const img = e.target;
                                                                        const nw = img.naturalWidth;
                                                                        const nh = img.naturalHeight;
                                                                        if ((item.centerX != null || item.centerY != null) && nw && nh) {
                                                                            // Store natural size for crosshair
                                                                            item._nw = nw;
                                                                            item._nh = nh;
                                                                            this.forceUpdate();
                                                                        }
                                                                    }}
                                                                    onError={e => {
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                />
                                                                {(item.centerX != null || item.centerY != null) &&
                                                                    item._nw && item._nh && (() => {
                                                                    const cx = item.centerX ?? 0;
                                                                    const cy = item.centerY ?? 0;
                                                                    const pxX = (cx / item._nw) * 48;
                                                                    const pxY = (cy / item._nh) * 48;
                                                                    return (
                                                                        <svg style={{
                                                                            position: 'absolute', top: 0, left: 0,
                                                                            width: '48px', height: '48px',
                                                                            pointerEvents: 'none'
                                                                        }}>
                                                                            <line x1={pxX} y1="0" x2={pxX} y2="48"
                                                                                stroke="red" strokeWidth="1"
                                                                                opacity="0.5"
                                                                                strokeDasharray="2,2" />
                                                                            <line x1="0" y1={pxY} x2="48" y2={pxY}
                                                                                stroke="red" strokeWidth="1"
                                                                                opacity="0.5"
                                                                                strokeDasharray="2,2" />
                                                                            <circle cx={pxX} cy={pxY} r="3"
                                                                                fill="none" stroke="red"
                                                                                strokeWidth="1.5" opacity="0.8" />
                                                                        </svg>
                                                                    );
                                                                })()}
                                                            </div>
                                                        ) : (
                                                            <div style={{
                                                                width: '48px', height: '48px',
                                                                background: '#E0E0E0',
                                                                borderRadius: '4px',
                                                                display: 'flex', alignItems: 'center',
                                                                justifyContent: 'center', fontSize: '18px'
                                                            }}>
                                                                {stateKey === 'soundLibraryUrls' ? '🔊' : '📄'}
                                                            </div>
                                                        )}
                                                        <span style={{
                                                            fontSize: '10px', color: '#666',
                                                            textAlign: 'center', marginTop: '2px',
                                                            overflow: 'hidden', textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap', width: '100%'
                                                        }} title={item.name}>
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
                <button
                    style={styles.addBtn}
                    onClick={() => this.addLibraryUrl(stateKey)}
                >+ Add Library URL</button>
            </div>
        );
    }

    renderAssetCard (type, asset, index) {
        const isCostumeOrBackdrop = type === 'costumes' || type === 'backdrops';
        const isDragging = this.state.dragType === type && this.state.dragIndex === index;
        const isDragOver = this.state.dragType === type && this.state.dragOverIndex === index;
        const isImage = asset.url && /\.(svg|png|jpg|jpeg|gif|webp)(\?|$)/i.test(asset.url);
        const nameKey = `${type}.${index}.name`;
        const urlKey = `${type}.${index}.url`;
        return (
            <div
                key={index}
                style={{
                    ...styles.stepCard,
                    ...(isDragging ? styles.dragging : {}),
                    ...(isDragOver ? styles.dragOver : {}),
                    display: 'flex', gap: '12px', alignItems: 'flex-start'
                }}
                draggable
                onDragStart={e => this.handleDragStart(type, index, e)}
                onDragOver={e => this.handleDragOver(type, index, e)}
                onDrop={e => this.handleDrop(type, e)}
                onDragEnd={() => this.handleDragEnd()}
            >
                <span style={{...styles.dragHandle, marginTop: '8px'}}>⠿</span>
                {isImage && isCostumeOrBackdrop && (
                    <div style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', marginTop: '8px', gap: '4px'
                    }}>
                        <div style={{
                            ...styles.thumbnail,
                            position: 'relative', overflow: 'hidden'
                        }}>
                            <img
                                src={asset.url}
                                alt={asset.name}
                                style={{
                                    width: '100%', height: '100%',
                                    objectFit: 'contain'
                                }}
                                onLoad={e => {
                                    if (asset.centerX != null || asset.centerY != null) {
                                        const img = e.target;
                                        if (!asset._nw && img.naturalWidth) {
                                            asset._nw = img.naturalWidth;
                                            asset._nh = img.naturalHeight;
                                            this.forceUpdate();
                                        }
                                    }
                                }}
                                onError={e => { e.target.style.display = 'none'; }}
                            />
                            {(asset.centerX != null || asset.centerY != null) &&
                                asset._nw && asset._nh && (() => {
                                const cx = asset.centerX ?? 0;
                                const cy = asset.centerY ?? 0;
                                const pxX = (cx / asset._nw) * 48;
                                const pxY = (cy / asset._nh) * 48;
                                return (
                                    <svg style={{
                                        position: 'absolute', top: 0, left: 0,
                                        width: '48px', height: '48px',
                                        pointerEvents: 'none'
                                    }}>
                                        <line x1={pxX} y1="0" x2={pxX} y2="48"
                                            stroke="red" strokeWidth="1"
                                            opacity="0.5" strokeDasharray="2,2" />
                                        <line x1="0" y1={pxY} x2="48" y2={pxY}
                                            stroke="red" strokeWidth="1"
                                            opacity="0.5" strokeDasharray="2,2" />
                                        <circle cx={pxX} cy={pxY} r="3"
                                            fill="none" stroke="red"
                                            strokeWidth="1.5" opacity="0.8" />
                                    </svg>
                                );
                            })()}
                        </div>
                        <button
                            style={{
                                ...styles.addBtn,
                                margin: 0
                            }}
                            title="Set center to half of image dimensions"
                            onClick={() => {
                                const img = new Image();
                                img.onload = () => {
                                    const cx = Math.round(img.naturalWidth / 2);
                                    const cy = Math.round(img.naturalHeight / 2);
                                    this.updateAsset(type, index, 'centerX', cx);
                                    this.updateAsset(type, index, 'centerY', cy);
                                    asset._nw = img.naturalWidth;
                                    asset._nh = img.naturalHeight;
                                };
                                img.src = asset.url;
                            }}
                        >⊹ Auto</button>
                    </div>
                )}
                {isImage && !isCostumeOrBackdrop && (
                    <div style={{
                        ...styles.thumbnail, marginTop: '8px',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <img
                            src={asset.url}
                            alt={asset.name}
                            style={{
                                width: '100%', height: '100%',
                                objectFit: 'contain'
                            }}
                            onError={e => { e.target.style.display = 'none'; }}
                        />
                    </div>
                )}
                <div style={{flex: 1}}>
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
                                style={{
                                    ...styles.input,
                                    ...(this.state.validationErrors[nameKey] ? styles.inputError : {})
                                }}
                                value={asset.name}
                                onChange={e => {
                                    this.updateAsset(type, index, 'name', e.target.value);
                                    this.clearValidation(nameKey);
                                }}
                                onBlur={() => {
                                    if (asset.url) this.validateField(nameKey, asset.name, {required: true});
                                }}
                                placeholder="Asset name"
                            />
                            {this.state.validationErrors[nameKey] && (
                                <div style={styles.errorText}>{this.state.validationErrors[nameKey]}</div>
                            )}
                        </div>
                        <div>
                            <label style={styles.label}>URL</label>
                            <input
                                style={{
                                    ...styles.input,
                                    ...(this.state.validationErrors[urlKey] ? styles.inputError : {})
                                }}
                                value={asset.url}
                                onChange={e => {
                                    this.updateAsset(type, index, 'url', e.target.value);
                                    this.clearValidation(urlKey);
                                }}
                                onBlur={() => this.validateField(urlKey, asset.url, {url: true})}
                                placeholder="https://..."
                            />
                            {this.state.validationErrors[urlKey] && (
                                <div style={styles.errorText}>{this.state.validationErrors[urlKey]}</div>
                            )}
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
            </div>
        );
    }

    renderSpriteCard (sprite, spriteIndex) {
        const isDragging = this.state.dragType === 'sprites' && this.state.dragIndex === spriteIndex;
        const isDragOver = this.state.dragType === 'sprites' && this.state.dragOverIndex === spriteIndex;
        const firstCostume = (sprite.costumes || [])[0];
        const thumbUrl = firstCostume && firstCostume.url &&
            /\.(svg|png|jpg|jpeg|gif|webp)(\?|$)/i.test(firstCostume.url) ? firstCostume.url : null;
        return (
            <div
                key={spriteIndex}
                style={{
                    ...styles.spriteCompactCard,
                    ...(isDragging ? styles.dragging : {}),
                    ...(isDragOver ? styles.dragOver : {})
                }}
                draggable
                onDragStart={e => this.handleDragStart('sprites', spriteIndex, e)}
                onDragOver={e => this.handleDragOver('sprites', spriteIndex, e)}
                onDrop={e => this.handleDrop('sprites', e)}
                onDragEnd={() => this.handleDragEnd()}
                onClick={() => this.openSpriteModal(spriteIndex)}
            >
                <span style={styles.dragHandle}>⠿</span>
                {thumbUrl ? (
                    <img
                        src={thumbUrl}
                        alt={sprite.name}
                        style={styles.thumbnail}
                        onError={e => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <div style={{...styles.thumbnail, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '20px', color: '#ccc'}}>🎭</div>
                )}
                <div style={styles.spriteCompactInfo}>
                    <span style={{fontWeight: 600, fontSize: '14px'}}>
                        {sprite.name || `Sprite ${spriteIndex + 1}`}
                    </span>
                    <span style={{fontSize: '12px', color: '#999'}}>
                        {(sprite.costumes || []).length} costumes · {(sprite.sounds || []).length} sounds
                    </span>
                </div>
                <button
                    style={styles.removeBtn}
                    onClick={e => {
                        e.stopPropagation();
                        this.removeSprite(spriteIndex);
                    }}
                >Remove</button>
            </div>
        );
    }

    renderSpriteModal () {
        const idx = this.state.editingSpriteIndex;
        if (idx === null || !this.state.sprites[idx]) return null;
        const sprite = this.state.sprites[idx];
        return (
            <div style={styles.modalOverlay} onClick={() => this.closeSpriteModal()}>
                <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <div style={styles.modalHeader}>
                        <h2 style={{margin: 0, fontSize: '18px', color: '#017460'}}>
                            Edit Sprite: {sprite.name || `Sprite ${idx + 1}`}
                        </h2>
                        <button
                            style={{...styles.removeBtn, background: '#999', fontSize: '16px',
                                padding: '4px 12px'}}
                            onClick={() => this.closeSpriteModal()}
                        >✕</button>
                    </div>

                    <div style={{marginBottom: '16px'}}>
                        <label style={styles.label}>Sprite Name</label>
                        <input
                            style={styles.input}
                            value={sprite.name}
                            onChange={e => this.updateSpriteName(idx, e.target.value)}
                            placeholder="Sprite name"
                        />
                    </div>

                    <div style={{marginBottom: '16px'}}>
                        <h3 style={{fontSize: '14px', color: '#017460', margin: '0 0 8px 0'}}>
                            Costumes ({(sprite.costumes || []).length})
                        </h3>
                        {(sprite.costumes || []).map((c, i) => {
                            const isImg = c.url && /\.(svg|png|jpg|jpeg|gif|webp)(\?|$)/i.test(c.url);
                            const isDrag = this.state.dragType === `sprite_${idx}_costumes` &&
                                this.state.dragIndex === i;
                            const isOver = this.state.dragType === `sprite_${idx}_costumes` &&
                                this.state.dragOverIndex === i;
                            return (
                                <div
                                    key={i}
                                    style={{
                                        ...styles.stepCard,
                                        display: 'flex', gap: '8px', alignItems: 'flex-start',
                                        ...(isDrag ? styles.dragging : {}),
                                        ...(isOver ? styles.dragOver : {})
                                    }}
                                    draggable
                                    onDragStart={e =>
                                        this.handleDragStart(`sprite_${idx}_costumes`, i, e)}
                                    onDragOver={e =>
                                        this.handleDragOver(`sprite_${idx}_costumes`, i, e)}
                                    onDrop={e => {
                                        e.preventDefault();
                                        const {dragIndex, dragOverIndex} = this.state;
                                        if (dragIndex !== null && dragOverIndex !== null) {
                                            this.moveSpriteAsset(idx, 'costumes', dragIndex, dragOverIndex);
                                        }
                                        this.setState({dragType: null, dragIndex: null, dragOverIndex: null});
                                    }}
                                    onDragEnd={() => this.handleDragEnd()}
                                >
                                    <span style={styles.dragHandle}>⠿</span>
                                    {isImg && (
                                        <img
                                            src={c.url}
                                            alt={c.name}
                                            style={styles.thumbnail}
                                            onError={e => { e.target.style.display = 'none'; }}
                                        />
                                    )}
                                    <div style={{flex: 1}}>
                                        <div style={{display: 'grid',
                                            gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
                                            <div>
                                                <label style={styles.label}>Name</label>
                                                <input
                                                    style={styles.input}
                                                    value={c.name}
                                                    onChange={e => this.updateSpriteAsset(idx,
                                                        'costumes', i, 'name', e.target.value)}
                                                    placeholder="Costume name"
                                                />
                                            </div>
                                            <div>
                                                <label style={styles.label}>URL</label>
                                                <input
                                                    style={styles.input}
                                                    value={c.url}
                                                    onChange={e => this.updateSpriteAsset(idx,
                                                        'costumes', i, 'url', e.target.value)}
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div>
                                                <label style={styles.label}>Center X</label>
                                                <input
                                                    style={styles.input}
                                                    type="number"
                                                    value={c.centerX ?? ''}
                                                    onChange={e => this.updateSpriteAsset(idx,
                                                        'costumes', i, 'centerX',
                                                        e.target.value === '' ? undefined :
                                                            Number(e.target.value))}
                                                    placeholder="auto"
                                                />
                                            </div>
                                            <div>
                                                <label style={styles.label}>Center Y</label>
                                                <input
                                                    style={styles.input}
                                                    type="number"
                                                    value={c.centerY ?? ''}
                                                    onChange={e => this.updateSpriteAsset(idx,
                                                        'costumes', i, 'centerY',
                                                        e.target.value === '' ? undefined :
                                                            Number(e.target.value))}
                                                    placeholder="auto"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        style={{...styles.removeBtn, alignSelf: 'center'}}
                                        onClick={() => this.removeSpriteAsset(idx, 'costumes', i)}
                                    >✕</button>
                                </div>
                            );
                        })}
                        <button
                            style={styles.addBtn}
                            onClick={() => this.addSpriteAsset(idx, 'costumes')}
                        >+ Add Costume</button>
                    </div>

                    <div>
                        <h3 style={{fontSize: '14px', color: '#004C45', margin: '0 0 8px 0'}}>
                            Sounds ({(sprite.sounds || []).length})
                        </h3>
                        {(sprite.sounds || []).map((s, i) => {
                            const isDrag = this.state.dragType === `sprite_${idx}_sounds` &&
                                this.state.dragIndex === i;
                            const isOver = this.state.dragType === `sprite_${idx}_sounds` &&
                                this.state.dragOverIndex === i;
                            return (
                                <div
                                    key={i}
                                    style={{
                                        ...styles.stepCard,
                                        display: 'flex', gap: '8px', alignItems: 'center',
                                        ...(isDrag ? styles.dragging : {}),
                                        ...(isOver ? styles.dragOver : {})
                                    }}
                                    draggable
                                    onDragStart={e =>
                                        this.handleDragStart(`sprite_${idx}_sounds`, i, e)}
                                    onDragOver={e =>
                                        this.handleDragOver(`sprite_${idx}_sounds`, i, e)}
                                    onDrop={e => {
                                        e.preventDefault();
                                        const {dragIndex, dragOverIndex} = this.state;
                                        if (dragIndex !== null && dragOverIndex !== null) {
                                            this.moveSpriteAsset(idx, 'sounds', dragIndex, dragOverIndex);
                                        }
                                        this.setState({dragType: null, dragIndex: null, dragOverIndex: null});
                                    }}
                                    onDragEnd={() => this.handleDragEnd()}
                                >
                                    <span style={styles.dragHandle}>⠿</span>
                                    <div style={{flex: 1, display: 'grid',
                                        gridTemplateColumns: '1fr 1fr', gap: '8px'}}>
                                        <div>
                                            <label style={styles.label}>Name</label>
                                            <input
                                                style={styles.input}
                                                value={s.name}
                                                onChange={e => this.updateSpriteAsset(idx,
                                                    'sounds', i, 'name', e.target.value)}
                                                placeholder="Sound name"
                                            />
                                        </div>
                                        <div>
                                            <label style={styles.label}>URL</label>
                                            <input
                                                style={styles.input}
                                                value={s.url}
                                                onChange={e => this.updateSpriteAsset(idx,
                                                    'sounds', i, 'url', e.target.value)}
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                    <button
                                        style={{...styles.removeBtn, alignSelf: 'center'}}
                                        onClick={() => this.removeSpriteAsset(idx, 'sounds', i)}
                                    >✕</button>
                                </div>
                            );
                        })}
                        <button
                            style={{...styles.addBtn,
                                background: '#004C45'}}
                            onClick={() => this.addSpriteAsset(idx, 'sounds')}
                        >+ Add Sound</button>
                    </div>
                </div>
            </div>
        );
    }

    renderTagsEditor (stateKey) {
        const tags = this.state[stateKey];
        return (
            <div style={{marginBottom: '8px'}}>
                <label style={styles.label}>Tags</label>
                {tags.map((t, i) => (
                    <div
                        key={i}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr auto',
                            gap: '8px',
                            marginBottom: '4px'
                        }}
                    >
                        <input
                            style={styles.input}
                            value={t.key}
                            onChange={e => {
                                const updated = [...tags];
                                updated[i] = {...updated[i], key: e.target.value};
                                this.setState({[stateKey]: updated});
                            }}
                            placeholder="key"
                        />
                        <input
                            style={styles.input}
                            value={t.label}
                            onChange={e => {
                                const updated = [...tags];
                                updated[i] = {...updated[i], label: e.target.value};
                                this.setState({[stateKey]: updated});
                            }}
                            placeholder="Label"
                        />
                        <button
                            style={styles.removeBtn}
                            onClick={() => {
                                const updated = tags.filter((_, idx) => idx !== i);
                                this.setState({[stateKey]: updated});
                            }}
                        >✕</button>
                    </div>
                ))}
                <button
                    style={styles.addBtn}
                    onClick={() => this.setState({[stateKey]: [...tags, {key: '', label: ''}]})}
                >+ Add Tag</button>
            </div>
        );
    }

    renderGeneralPanel () {
        const titleErr = this.state.validationErrors.title;
        const sb3Err = this.state.validationErrors.sb3;
        return (
            <div style={{marginTop: '16px'}}>
                <div style={styles.field}>
                    <label style={styles.label}>Title *</label>
                    <input
                        style={{...styles.input, ...(titleErr ? styles.inputError : {})}}
                        value={this.state.title}
                        onChange={e => {
                            this.handleTitleChange(e);
                            this.clearValidation('title');
                        }}
                        onBlur={() => this.validateField('title', this.state.title, {required: true})}
                        placeholder="Project title"
                    />
                    {titleErr && <div style={styles.errorText}>{titleErr}</div>}
                </div>
                <div style={styles.field}>
                    <label style={styles.label}>SB3 URL</label>
                    <input
                        style={{...styles.input, ...(sb3Err ? styles.inputError : {})}}
                        value={this.state.sb3}
                        onChange={e => {
                            this.handleSb3Change(e);
                            this.clearValidation('sb3');
                        }}
                        onBlur={() => this.validateField('sb3', this.state.sb3, {url: true})}
                        placeholder="https://example.com/project.sb3"
                    />
                    {sb3Err && <div style={styles.errorText}>{sb3Err}</div>}
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
        );
    }

    renderToolboxPanel () {
        return (
            <div style={{marginTop: '16px'}}>
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
                {this.renderToolboxPreview()}
            </div>
        );
    }

    renderToolboxPreview () {
        const {enabledCategories, enabledBlocks, filterAllBlocks} = this.state;
        const activeCategories = CATEGORY_KEYS.filter(k => enabledCategories.has(k));
        if (activeCategories.length === CATEGORY_KEYS.length && !filterAllBlocks) return null;

        return (
            <div style={{
                marginTop: '16px', padding: '12px', background: '#f8f8f8',
                borderRadius: '6px', border: '1px solid #eee'
            }}>
                <label style={{...styles.label, fontWeight: 600, marginBottom: '8px'}}>
                    Toolbox Preview
                </label>
                <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                    {activeCategories.length === 0 ? (
                        <span style={{fontSize: '12px', color: '#999', fontStyle: 'italic'}}>
                            No categories enabled
                        </span>
                    ) : activeCategories.map(key => {
                        const cat = CATEGORIES[key];
                        const color = CATEGORY_COLORS[key] || '#999';
                        const totalBlocks = cat.blocks.length;
                        const activeBlocks = filterAllBlocks ?
                            enabledBlocks[key].size : totalBlocks;
                        const blocksFiltered = filterAllBlocks && activeBlocks < totalBlocks;
                        return (
                            <div key={key} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                <div style={{
                                    width: '12px', height: '12px', borderRadius: '3px',
                                    background: color, flexShrink: 0
                                }} />
                                <span style={{
                                    fontSize: '13px', fontWeight: 600, minWidth: '70px'
                                }}>{cat.label}</span>
                                {totalBlocks > 0 && (
                                    <div style={{flex: 1, display: 'flex', gap: '3px',
                                        alignItems: 'center'}}>
                                        {cat.blocks.map(block => {
                                            const active = !filterAllBlocks ||
                                                enabledBlocks[key].has(block);
                                            return (
                                                <div
                                                    key={block}
                                                    title={formatBlockName(block)}
                                                    style={{
                                                        width: '16px', height: '8px',
                                                        borderRadius: '2px',
                                                        background: active ? color : '#ddd',
                                                        opacity: active ? 1 : 0.4,
                                                        transition: 'all 0.15s'
                                                    }}
                                                />
                                            );
                                        })}
                                        {blocksFiltered && (
                                            <span style={{
                                                fontSize: '10px', color: '#999', marginLeft: '4px'
                                            }}>{activeBlocks}/{totalBlocks}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    renderStepsPanel () {
        return (
            <div style={{marginTop: '16px'}}>
                {this.state.steps.map((step, i) =>
                    this.renderStepCard(step, i)
                )}
                <button
                    style={styles.addBtn}
                    onClick={() => this.addStep()}
                >+ Add Step</button>
            </div>
        );
    }

    renderAssetsPanel () {
        return (
            <div style={{marginTop: '16px'}}>
                {/* Costumes sub-section */}
                <div style={{...styles.panel, marginBottom: '16px'}}>
                    <h3
                        style={styles.panelTitleCollapsible}
                        onClick={() => this.toggleSection('costumes')}
                    >
                        <span>Costumes</span>
                        <span style={{...styles.chevron,
                            transform: this.state.collapsedSections.has('costumes') ?
                                'rotate(-90deg)' : 'rotate(0deg)'}}>▼</span>
                    </h3>
                    {!this.state.collapsedSections.has('costumes') && (
                        <div style={{marginTop: '12px'}}>
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
                            {this.renderTagsEditor('costumeTags')}
                            {this.renderLibraryUrls('costumeLibraryUrls', 'Library URLs')}
                            {this.state.costumes.map((c, i) =>
                                this.renderAssetCard('costumes', c, i)
                            )}
                            <button
                                style={styles.addBtn}
                                onClick={() => this.addAsset('costumes')}
                            >+ Add Costume</button>
                        </div>
                    )}
                </div>

                {/* Sounds sub-section */}
                <div style={{...styles.panel, marginBottom: '16px'}}>
                    <h3
                        style={styles.panelTitleCollapsible}
                        onClick={() => this.toggleSection('sounds')}
                    >
                        <span>Sounds</span>
                        <span style={{...styles.chevron,
                            transform: this.state.collapsedSections.has('sounds') ?
                                'rotate(-90deg)' : 'rotate(0deg)'}}>▼</span>
                    </h3>
                    {!this.state.collapsedSections.has('sounds') && (
                        <div style={{marginTop: '12px'}}>
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
                            {this.renderTagsEditor('soundTags')}
                            {this.renderLibraryUrls('soundLibraryUrls', 'Library URLs')}
                            {this.state.sounds.map((s, i) =>
                                this.renderAssetCard('sounds', s, i)
                            )}
                            <button
                                style={styles.addBtn}
                                onClick={() => this.addAsset('sounds')}
                            >+ Add Sound</button>
                        </div>
                    )}
                </div>

                {/* Backdrops sub-section */}
                <div style={{...styles.panel, marginBottom: '16px'}}>
                    <h3
                        style={styles.panelTitleCollapsible}
                        onClick={() => this.toggleSection('backdrops')}
                    >
                        <span>Backdrops</span>
                        <span style={{...styles.chevron,
                            transform: this.state.collapsedSections.has('backdrops') ?
                                'rotate(-90deg)' : 'rotate(0deg)'}}>▼</span>
                    </h3>
                    {!this.state.collapsedSections.has('backdrops') && (
                        <div style={{marginTop: '12px'}}>
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
                            {this.renderTagsEditor('backdropTags')}
                            {this.renderLibraryUrls('backdropLibraryUrls', 'Library URLs')}
                            {this.state.backdrops.map((b, i) =>
                                this.renderAssetCard('backdrops', b, i)
                            )}
                            <button
                                style={styles.addBtn}
                                onClick={() => this.addAsset('backdrops')}
                            >+ Add Backdrop</button>
                        </div>
                    )}
                </div>

                {/* Sprites sub-section */}
                <div style={styles.panel}>
                    <h3
                        style={styles.panelTitleCollapsible}
                        onClick={() => this.toggleSection('sprites')}
                    >
                        <span>Sprites</span>
                        <span style={{...styles.chevron,
                            transform: this.state.collapsedSections.has('sprites') ?
                                'rotate(-90deg)' : 'rotate(0deg)'}}>▼</span>
                    </h3>
                    {!this.state.collapsedSections.has('sprites') && (
                        <div style={{marginTop: '12px'}}>
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
                            {this.renderTagsEditor('spriteTags')}
                            {this.renderLibraryUrls('spriteLibraryUrls', 'Library URLs')}
                            {this.state.sprites.map((sprite, i) =>
                                this.renderSpriteCard(sprite, i)
                            )}
                            <button
                                style={styles.addBtn}
                                onClick={() => this.addSprite()}
                            >+ Add Sprite</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    renderWizardNav () {
        const WIZARD_STEPS = ['General', 'Toolbox', 'Steps', 'Assets', 'Export'];
        const {wizardStep} = this.state;
        return (
            <div style={styles.wizardNav}>
                {WIZARD_STEPS.map((label, i) => (
                    <React.Fragment key={i}>
                        {i > 0 && (
                            <div style={{
                                ...styles.wizardLine,
                                ...(i <= wizardStep ? styles.wizardLineDone : {})
                            }} />
                        )}
                        <div
                            style={styles.wizardStep}
                            onClick={() => this.setWizardStep(i)}
                        >
                            <div style={{
                                ...styles.wizardCircle,
                                ...(i === wizardStep ? styles.wizardCircleActive : {}),
                                ...(i < wizardStep ? styles.wizardCircleDone : {})
                            }}>
                                {i < wizardStep ? '✓' : i + 1}
                            </div>
                            <span style={{
                                ...styles.wizardLabel,
                                ...(i === wizardStep ? styles.wizardLabelActive : {})
                            }}>{label}</span>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        );
    }

    renderWizardContent () {
        const {wizardStep} = this.state;
        const WIZARD_STEP_COUNT = 5;
        let content;
        switch (wizardStep) {
        case 0:
            content = this.renderGeneralPanel();
            break;
        case 1:
            content = this.renderToolboxPanel();
            break;
        case 2:
            content = this.renderStepsPanel();
            break;
        case 3:
            content = this.renderAssetsPanel();
            break;
        case 4:
            content = (
                <div style={{marginTop: '16px', textAlign: 'center'}}>
                    <p style={{fontSize: '14px', color: '#555', marginBottom: '16px'}}>
                        Your project is ready! Download the JSON file or copy a shareable URL.
                    </p>
                    <div style={{...styles.buttonRow, justifyContent: 'center'}}>
                        <button
                            style={{...styles.button, ...styles.downloadBtn, flex: 'none',
                                padding: '12px 24px'}}
                            onClick={() => this.handleDownload()}
                        >⬇ Download JSON</button>
                        <button
                            style={{...styles.button, ...styles.copyJsonBtn, flex: 'none',
                                padding: '12px 24px'}}
                            onClick={() => this.handleCopyJSON()}
                        >📋 Copy JSON</button>
                        <button
                            style={{...styles.button, ...styles.copyUrlBtn, flex: 'none',
                                padding: '12px 24px'}}
                            onClick={() => this.handleCopyUrl()}
                        >🔗 Copy URL</button>
                    </div>
                </div>
            );
            break;
        default:
            content = null;
        }
        return (
            <div style={{...styles.panel, marginBottom: '16px'}}>
                {content}
                <div style={styles.wizardButtons}>
                    <button
                        style={{...styles.button, background: wizardStep > 0 ? '#017460' : '#ddd',
                            color: wizardStep > 0 ? '#fff' : '#999', flex: 'none',
                            padding: '10px 24px'}}
                        disabled={wizardStep === 0}
                        onClick={() => this.setWizardStep(wizardStep - 1)}
                    >← Previous</button>
                    {wizardStep < WIZARD_STEP_COUNT - 1 && (
                        <button
                            style={{...styles.button, ...styles.downloadBtn, flex: 'none',
                                padding: '10px 24px'}}
                            onClick={() => this.setWizardStep(wizardStep + 1)}
                        >Next →</button>
                    )}
                </div>
            </div>
        );
    }

    renderAdvancedForm () {
        return (
            <div>
                {/* General */}
                <div style={{...styles.panel, marginBottom: '16px'}}>
                    <h2
                        style={styles.panelTitleCollapsible}
                        onClick={() => this.toggleSection('general')}
                    >
                        <span>General</span>
                        <span style={{...styles.chevron,
                            transform: this.state.collapsedSections.has('general') ?
                                'rotate(-90deg)' : 'rotate(0deg)'}}>▼</span>
                    </h2>
                    {!this.state.collapsedSections.has('general') && this.renderGeneralPanel()}
                </div>

                {/* Toolbox */}
                <div style={{...styles.panel, marginBottom: '16px'}}>
                    <h2
                        style={styles.panelTitleCollapsible}
                        onClick={() => this.toggleSection('toolbox')}
                    >
                        <span>Toolbox</span>
                        <span style={{...styles.chevron,
                            transform: this.state.collapsedSections.has('toolbox') ?
                                'rotate(-90deg)' : 'rotate(0deg)'}}>▼</span>
                    </h2>
                    {!this.state.collapsedSections.has('toolbox') && this.renderToolboxPanel()}
                </div>

                {/* Steps */}
                <div style={{...styles.panel, marginBottom: '16px'}}>
                    <h2
                        style={styles.panelTitleCollapsible}
                        onClick={() => this.toggleSection('steps')}
                    >
                        <span>Tutorial Steps</span>
                        <span style={{...styles.chevron,
                            transform: this.state.collapsedSections.has('steps') ?
                                'rotate(-90deg)' : 'rotate(0deg)'}}>▼</span>
                    </h2>
                    {!this.state.collapsedSections.has('steps') && this.renderStepsPanel()}
                </div>

                {/* Costumes */}
                <div style={{...styles.panel, marginBottom: '16px'}}>
                    <h2
                        style={styles.panelTitleCollapsible}
                        onClick={() => this.toggleSection('costumes')}
                    >
                        <span>Costumes</span>
                        <span style={{...styles.chevron,
                            transform: this.state.collapsedSections.has('costumes') ?
                                'rotate(-90deg)' : 'rotate(0deg)'}}>▼</span>
                    </h2>
                    {!this.state.collapsedSections.has('costumes') && (
                        <div style={{marginTop: '16px'}}>
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
                            {this.renderTagsEditor('costumeTags')}
                            {this.renderLibraryUrls('costumeLibraryUrls', 'Library URLs')}
                            {this.state.costumes.map((c, i) =>
                                this.renderAssetCard('costumes', c, i)
                            )}
                            <button
                                style={styles.addBtn}
                                onClick={() => this.addAsset('costumes')}
                            >+ Add Costume</button>
                        </div>
                    )}
                </div>

                {/* Sounds */}
                <div style={{...styles.panel, marginBottom: '16px'}}>
                    <h2
                        style={styles.panelTitleCollapsible}
                        onClick={() => this.toggleSection('sounds')}
                    >
                        <span>Sounds</span>
                        <span style={{...styles.chevron,
                            transform: this.state.collapsedSections.has('sounds') ?
                                'rotate(-90deg)' : 'rotate(0deg)'}}>▼</span>
                    </h2>
                    {!this.state.collapsedSections.has('sounds') && (
                        <div style={{marginTop: '16px'}}>
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
                            {this.renderTagsEditor('soundTags')}
                            {this.renderLibraryUrls('soundLibraryUrls', 'Library URLs')}
                            {this.state.sounds.map((s, i) =>
                                this.renderAssetCard('sounds', s, i)
                            )}
                            <button
                                style={styles.addBtn}
                                onClick={() => this.addAsset('sounds')}
                            >+ Add Sound</button>
                        </div>
                    )}
                </div>

                {/* Backdrops */}
                <div style={{...styles.panel, marginBottom: '16px'}}>
                    <h2
                        style={styles.panelTitleCollapsible}
                        onClick={() => this.toggleSection('backdrops')}
                    >
                        <span>Backdrops</span>
                        <span style={{...styles.chevron,
                            transform: this.state.collapsedSections.has('backdrops') ?
                                'rotate(-90deg)' : 'rotate(0deg)'}}>▼</span>
                    </h2>
                    {!this.state.collapsedSections.has('backdrops') && (
                        <div style={{marginTop: '16px'}}>
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
                            {this.renderTagsEditor('backdropTags')}
                            {this.renderLibraryUrls('backdropLibraryUrls', 'Library URLs')}
                            {this.state.backdrops.map((b, i) =>
                                this.renderAssetCard('backdrops', b, i)
                            )}
                            <button
                                style={styles.addBtn}
                                onClick={() => this.addAsset('backdrops')}
                            >+ Add Backdrop</button>
                        </div>
                    )}
                </div>

                {/* Sprites */}
                <div style={styles.panel}>
                    <h2
                        style={styles.panelTitleCollapsible}
                        onClick={() => this.toggleSection('sprites')}
                    >
                        <span>Sprites</span>
                        <span style={{...styles.chevron,
                            transform: this.state.collapsedSections.has('sprites') ?
                                'rotate(-90deg)' : 'rotate(0deg)'}}>▼</span>
                    </h2>
                    {!this.state.collapsedSections.has('sprites') && (
                        <div style={{marginTop: '16px'}}>
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
                            {this.renderTagsEditor('spriteTags')}
                            {this.renderLibraryUrls('spriteLibraryUrls', 'Library URLs')}
                            {this.state.sprites.map((sprite, i) =>
                                this.renderSpriteCard(sprite, i)
                            )}
                            <button
                                style={styles.addBtn}
                                onClick={() => this.addSprite()}
                            >+ Add Sprite</button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    render () {
        const {wizardMode} = this.state;

        return (
            <div style={styles.body}>
                <nav style={styles.navBar}>
                    <a href="./">
                        <img
                            alt="Blockflow"
                            src={blockflowLogo}
                            style={styles.navLogo}
                        />
                    </a>
                    <div style={styles.navLinks}>
                        <a
                            href="editor.html"
                            style={styles.navLink}
                        >Editor</a>
                        <a
                            href="generator.html"
                            style={styles.navLink}
                        >Generator</a>
                    </div>
                </nav>
                {/* Sticky action toolbar - full width */}
                <div style={styles.stickyToolbar}>
                    <div style={styles.stickyToolbarInner}>
                        <button
                            style={{...styles.button, ...styles.downloadBtn, flex: 'none',
                                padding: '8px 14px', fontSize: '13px'}}
                            onClick={() => this.handleNewProject()}
                        >📄 New</button>
                        <button
                            style={{...styles.button, ...styles.copyJsonBtn, flex: 'none',
                                padding: '8px 14px', fontSize: '13px'}}
                            onClick={() => this.handleLoadFile()}
                        >📂 Load</button>
                        <div style={{
                            width: '1px', height: '24px', background: '#ddd'
                        }} />
                        <button
                            style={{...styles.button, ...styles.downloadBtn, flex: 'none',
                                padding: '8px 14px', fontSize: '13px'}}
                            onClick={() => this.handleDownload()}
                        >⬇ Download</button>
                        <button
                            style={{...styles.button, ...styles.copyJsonBtn, flex: 'none',
                                padding: '8px 14px', fontSize: '13px'}}
                            onClick={() => this.handleCopyJSON()}
                        >📋 Copy JSON</button>
                        <button
                            style={{...styles.button, ...styles.copyUrlBtn, flex: 'none',
                                padding: '8px 14px', fontSize: '13px'}}
                            onClick={() => this.handleCopyUrl()}
                        >🔗 Copy URL</button>
                        <div style={{
                            width: '1px', height: '24px', background: '#ddd'
                        }} />
                        <button
                            style={{
                                ...styles.button, flex: 'none',
                                padding: '8px 14px', fontSize: '13px',
                                background: this.state.showPreview ? '#017460' : '#fff',
                                color: this.state.showPreview ? '#fff' : '#017460',
                                border: '2px solid #017460'
                            }}
                            onClick={() => this.togglePreview()}
                        >▶ Preview</button>
                        <button
                            style={{
                                ...styles.button, flex: 'none',
                                padding: '8px 14px', fontSize: '13px',
                                background: wizardMode ? '#fff' : '#017460',
                                color: wizardMode ? '#017460' : '#fff',
                                border: '2px solid #017460'
                            }}
                            onClick={() => this.toggleWizardMode()}
                        >{wizardMode ? '⚙ Advanced' : '✦ Wizard'}</button>
                    </div>
                </div>
                <div style={styles.container}>
                    <div style={styles.header}>
                        <h1 style={styles.h1}>Blockflow Project Generator</h1>
                        <p style={styles.subtitle}>
                            Configure your project and download the JSON or copy a URL with the configuration encoded.
                        </p>
                        <input
                            ref={this._fileInput}
                            type="file"
                            accept=".json,application/json"
                            style={{display: 'none'}}
                            onChange={e => this.handleFileSelected(e)}
                        />
                    </div>

                    {wizardMode && this.renderWizardNav()}

                    {/* Form */}
                    <div>
                        {wizardMode ? this.renderWizardContent() : this.renderAdvancedForm()}
                    </div>
                </div>

                {this.state.showPreview && this.state.previewUrl && (
                    <div style={styles.modalOverlay} onClick={() => this.togglePreview()}>
                        <div
                            style={{
                                background: '#fff',
                                borderRadius: '12px',
                                width: '95vw',
                                height: '90vh',
                                overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', padding: '12px 16px',
                                borderBottom: '2px solid #017460'
                            }}>
                                <h2 style={{margin: 0, fontSize: '16px', color: '#017460'}}>
                                    Live Preview
                                </h2>
                                <button
                                    style={{...styles.removeBtn, background: '#999',
                                        fontSize: '16px', padding: '4px 12px'}}
                                    onClick={() => this.togglePreview()}
                                >✕</button>
                            </div>
                            <iframe
                                src={this.state.previewUrl}
                                style={styles.previewIframe}
                                title="Editor Preview"
                            />
                        </div>
                    </div>
                )}

                {this.renderSpriteModal()}

                {this.state.toast && (
                    <div style={styles.toast}>{this.state.toast}</div>
                )}
            </div>
        );
    }
}

export default GeneratorApp;
