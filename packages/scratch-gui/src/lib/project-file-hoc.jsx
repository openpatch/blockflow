import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import {connect} from 'react-redux';

import fetchProjectFile from './fetch-project-file';
import {setProjectFile, setProjectFileLoading, setProjectFileError} from '../reducers/project-file';
import {setExternalDeck} from '../reducers/cards';
import {setFullScreen} from '../reducers/mode';
import {
    LoadingState,
    requestProjectUpload,
    onLoadedProject
} from '../reducers/project-state';
import log from './log';

const EXTERNAL_DECK_ID = '__external__';

/**
 * Higher Order Component to load external project files via ?project=<url>.
 * When a project file is loaded, it:
 * - Fetches and parses the JSON
 * - Loads the .sb3 into the VM if specified
 * - Sets up external tutorial cards if steps are specified
 * - Injects UI-hiding props (showComingSoon=false, showTutorials=false)
 */
const ProjectFileHOC = function (WrappedComponent) {
    class ProjectFileComponent extends React.Component {
        constructor (props) {
            super(props);
            this.state = {
                projectFileUrl: null
            };
        }
        componentDidMount () {
            const queryParams = queryString.parse(location.search);
            if (queryParams.project) {
                const url = queryParams.project;
                this.setState({projectFileUrl: url});
                if (url.endsWith('.sb3')) {
                    // Claim the loading state to prevent the default project from loading
                    this.props.onRequestProjectUpload(this.props.loadingState);
                    this.props.onSetProjectFile({sb3: url, title: ''});
                    if (this.props.vm) {
                        this.loadSb3(url);
                    }
                } else {
                    this.loadProjectFile(url);
                }
            }
        }
        componentDidUpdate (prevProps) {
            // When VM is ready and we have an sb3 to load, load it
            if (this.props.projectFile && this.props.projectFile.sb3 &&
                this.props.vm && !prevProps.vm) {
                this.loadSb3(this.props.projectFile.sb3);
            }
        }
        loadProjectFile (url) {
            this.props.onSetProjectFileLoading();
            fetchProjectFile(url)
                .then(projectFile => {
                    this.props.onSetProjectFile(projectFile);

                    // Set up external tutorial deck if steps exist
                    if (projectFile.steps && projectFile.steps.length > 0) {
                        const deck = {
                            name: projectFile.title,
                            img: projectFile.steps[0].image || '',
                            steps: projectFile.steps.map(step => ({
                                title: step.title,
                                text: step.text || null,
                                image: step.image || null,
                                video: step.video || null
                            }))
                        };
                        this.props.onSetExternalDeck(EXTERNAL_DECK_ID, deck);
                    }

                    // Load .sb3 if present
                    if (projectFile.sb3 && this.props.vm) {
                        this.loadSb3(projectFile.sb3);
                    }
                })
                .catch(error => {
                    log.error('Failed to load project file:', error);
                    this.props.onSetProjectFileError(error.message);
                });
        }
        loadSb3 (sb3Url) {
            fetch(sb3Url)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Failed to fetch sb3: ${response.status}`);
                    }
                    return response.arrayBuffer();
                })
                .then(buffer => this.props.vm.loadProject(buffer))
                .then(() => {
                    this.props.onProjectLoaded(LoadingState.LOADING_VM_FILE_UPLOAD);
                })
                .catch(error => {
                    log.error('Failed to load sb3:', error);
                });
        }
        render () {
            const {
                onSetProjectFile,
                onSetProjectFileLoading,
                onSetProjectFileError,
                onSetExternalDeck,
                onSetFullScreen,
                onRequestProjectUpload,
                onProjectLoaded,
                loadingState: loadingStateProp,
                projectFile,
                projectFileLoading,
                ...componentProps
            } = this.props;

            // When a project file is loaded, inject UI-hiding props
            if (projectFile) {
                // Hide "coming soon" placeholders for Share, Community, My Stuff, Account
                componentProps.showComingSoon = false;
                // Hide the tutorials button
                componentProps.showTutorials = false;

                // Hide extension button if ui.allowExtensions is false
                if (projectFile.ui && projectFile.ui.allowExtensions === false) {
                    componentProps.allowExtensions = false;
                }
            }

            return (
                <WrappedComponent
                    {...componentProps}
                />
            );
        }
    }
    ProjectFileComponent.propTypes = {
        onSetExternalDeck: PropTypes.func.isRequired,
        onSetProjectFile: PropTypes.func.isRequired,
        onSetProjectFileError: PropTypes.func.isRequired,
        onSetProjectFileLoading: PropTypes.func.isRequired,
        onSetFullScreen: PropTypes.func.isRequired,
        onRequestProjectUpload: PropTypes.func.isRequired,
        onProjectLoaded: PropTypes.func.isRequired,
        loadingState: PropTypes.string,
        projectFile: PropTypes.object,
        projectFileLoading: PropTypes.bool,
        vm: PropTypes.object
    };

    const mapStateToProps = state => ({
        projectFile: state.scratchGui.projectFile.projectFile,
        projectFileLoading: state.scratchGui.projectFile.loading,
        loadingState: state.scratchGui.projectState.loadingState,
        vm: state.scratchGui.vm
    });

    const mapDispatchToProps = dispatch => ({
        onSetProjectFile: pf => dispatch(setProjectFile(pf)),
        onSetProjectFileLoading: () => dispatch(setProjectFileLoading()),
        onSetProjectFileError: error => dispatch(setProjectFileError(error)),
        onSetExternalDeck: (deckId, deck) => dispatch(setExternalDeck(deckId, deck)),
        onSetFullScreen: isFullScreen => dispatch(setFullScreen(isFullScreen)),
        onRequestProjectUpload: loadingState => dispatch(requestProjectUpload(loadingState)),
        onProjectLoaded: loadingState => dispatch(onLoadedProject(loadingState, false, true))
    });

    return connect(
        mapStateToProps,
        mapDispatchToProps
    )(ProjectFileComponent);
};

export {
    ProjectFileHOC as default,
    EXTERNAL_DECK_ID
};
