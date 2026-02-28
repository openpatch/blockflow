const SET_PROJECT_FILE = 'scratch-gui/project-file/SET_PROJECT_FILE';
const SET_PROJECT_FILE_LOADING = 'scratch-gui/project-file/SET_PROJECT_FILE_LOADING';
const SET_PROJECT_FILE_ERROR = 'scratch-gui/project-file/SET_PROJECT_FILE_ERROR';

const initialState = {
    projectFile: null,
    loading: false,
    error: null
};

const reducer = function (state, action) {
    if (typeof state === 'undefined') state = initialState;
    switch (action.type) {
    case SET_PROJECT_FILE:
        return Object.assign({}, state, {
            projectFile: action.projectFile,
            loading: false,
            error: null
        });
    case SET_PROJECT_FILE_LOADING:
        return Object.assign({}, state, {
            loading: true,
            error: null
        });
    case SET_PROJECT_FILE_ERROR:
        return Object.assign({}, state, {
            loading: false,
            error: action.error
        });
    default:
        return state;
    }
};

const setProjectFile = function (projectFile) {
    return {
        type: SET_PROJECT_FILE,
        projectFile
    };
};

const setProjectFileLoading = function () {
    return {type: SET_PROJECT_FILE_LOADING};
};

const setProjectFileError = function (error) {
    return {
        type: SET_PROJECT_FILE_ERROR,
        error
    };
};

export {
    reducer as default,
    initialState as projectFileInitialState,
    setProjectFile,
    setProjectFileLoading,
    setProjectFileError
};
