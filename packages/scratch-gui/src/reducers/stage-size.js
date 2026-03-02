import {STAGE_DISPLAY_SIZES} from '../lib/layout-constants.js';

const SET_STAGE_SIZE = 'scratch-gui/StageSize/SET_STAGE_SIZE';

const isInIframe = typeof window !== 'undefined' && window.self !== window.top;

const initialState = {
    stageSize: isInIframe ? STAGE_DISPLAY_SIZES.small : STAGE_DISPLAY_SIZES.large
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_STAGE_SIZE:
        return {
            stageSize: action.stageSize
        };
    default:
        return state;
    }
};

const setStageSize = function (stageSize) {
    return {
        type: SET_STAGE_SIZE,
        stageSize: stageSize
    };
};

export {
    reducer as default,
    initialState as stageSizeInitialState,
    setStageSize
};
