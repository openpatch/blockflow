import React from 'react';
import PropTypes from 'prop-types';
import queryString from 'query-string';
import {connect} from 'react-redux';

import fetchProjectFile from './fetch-project-file';
import {loadProjectFileAssets} from './project-file-assets';
import {setProjectFile, setProjectFileLoading, setProjectFileError} from '../reducers/project-file';
import {setDynamicAssets} from '../reducers/dynamic-assets';
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
 * Higher Order Component to load external project files via ?project=<value>.
 * The value can be:
 * - A base64-encoded JSON project file
 * - A URL to a .sb3 file
 * - A URL to a JSON project file
 *
 * When a project file is loaded, it:
 * - Fetches and parses the JSON
 * - Loads the .sb3 into the VM if specified
 * - Sets up external tutorial cards if steps are specified
 * - Injects UI-hiding props (showComingSoon=false, showTutorials=false)
 */
const isUrl = value => /^https?:\/\//.test(value) || value.startsWith('/') || value.startsWith('./');

// Resolve a relative URL against document.referrer (iframe) or window.location.href
const resolveUrl = url => {
    if (!url) return url;
    if (/^https?:\/\//.test(url)) return url;
    const base = document.referrer || window.location.href;
    return new URL(url, base).href;
};

const ProjectFileHOC = function (WrappedComponent) {
    class ProjectFileComponent extends React.Component {
        constructor (props) {
            super(props);
            const queryParams = queryString.parse(location.search);
            this.state = {
                projectFileUrl: null,
                isLoadingProjectFromUrl: !!queryParams.project
            };
        }
        componentDidMount () {
            const queryParams = queryString.parse(location.search);
            if (queryParams.project) {
                const value = queryParams.project;
                if (isUrl(value)) {
                    const resolvedValue = resolveUrl(value);
                    this.setState({projectFileUrl: resolvedValue});
                    if (resolvedValue.endsWith('.sb3')) {
                        // Claim the loading state to prevent the default project from loading
                        this.props.onRequestProjectUpload(this.props.loadingState);
                        this.props.onSetProjectFile({sb3: resolvedValue, title: ''});
                        if (this.props.vm) {
                            this.loadSb3(resolvedValue);
                        }
                    } else {
                        this.loadProjectFile(resolvedValue);
                    }
                } else {
                    // Treat as base64-encoded JSON
                    try {
                        const json = decodeURIComponent(atob(value));
                        const projectFile = JSON.parse(json);
                        if (!projectFile.title || typeof projectFile.title !== 'string') {
                            throw new Error('Project file must have a "title" string field');
                        }
                        // Resolve relative URLs against referrer when in an iframe
                        if (projectFile.sb3) {
                            projectFile.sb3 = resolveUrl(projectFile.sb3);
                        }
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
                        // Normalize asset-type field (flat array or {tags, library, showBuiltin})
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
                        if (Array.isArray(projectFile.sprites)) {
                            projectFile.sprites = projectFile.sprites.map(sprite => {
                                const resolved = Object.assign({}, sprite);
                                resolved.costumes = resolveAssetUrls(resolved.costumes);
                                resolved.sounds = resolveAssetUrls(resolved.sounds);
                                return resolved;
                            });
                        } else if (projectFile.sprites && typeof projectFile.sprites === 'object') {
                            const normalized = Object.assign({}, projectFile.sprites);
                            if (Array.isArray(normalized.library)) {
                                normalized.library = normalized.library.map(sprite => {
                                    const resolved = Object.assign({}, sprite);
                                    resolved.costumes = resolveAssetUrls(resolved.costumes);
                                    resolved.sounds = resolveAssetUrls(resolved.sounds);
                                    return resolved;
                                });
                            }
                            projectFile.sprites = normalized;
                        }
                        this.props.onSetProjectFile(projectFile);
                        if (projectFile.sb3 && this.props.vm) {
                            this.loadSb3(projectFile.sb3, projectFile);
                        } else if (!projectFile.sb3) {
                            this.loadAssets(projectFile);
                            this.setState({isLoadingProjectFromUrl: false});
                        }
                        this.setupDeck(projectFile);
                    } catch (error) {
                        log.error('Failed to parse project from URL:', error);
                        this.props.onSetProjectFileError(error.message);
                        this.setState({isLoadingProjectFromUrl: false});
                    }
                }
            }
        }
        componentDidUpdate (prevProps) {
            // When VM is ready and we have a project file, handle pending work
            if (this.props.projectFile && this.props.vm && !prevProps.vm) {
                if (this.props.projectFile.sb3) {
                    this.loadSb3(this.props.projectFile.sb3, this.props.projectFile);
                } else if (this.hasProjectAssets(this.props.projectFile) && !this._assetsLoaded) {
                    this.loadAssets(this.props.projectFile);
                }
            }
        }
        hasProjectAssets (projectFile) {
            const hasItems = field => {
                if (!field) return false;
                if (Array.isArray(field)) return field.length > 0;
                if (typeof field === 'object') {
                    return (field.library && field.library.length > 0) ||
                        (field.tags && field.tags.length > 0);
                }
                return false;
            };
            return hasItems(projectFile.sounds) ||
                hasItems(projectFile.costumes) ||
                hasItems(projectFile.backdrops) ||
                hasItems(projectFile.sprites);
        }
        loadAssets (projectFile) {
            if (!this.props.vm || !this.props.vm.runtime || !this.props.vm.runtime.storage) {
                return;
            }
            if (!this.hasProjectAssets(projectFile)) return;
            this._assetsLoaded = true;
            const storage = this.props.vm.runtime.storage;
            loadProjectFileAssets(projectFile, storage)
                .then(dynamicAssets => {
                    this.props.onSetDynamicAssets(dynamicAssets);
                })
                .catch(error => {
                    log.error('Failed to load project file assets:', error);
                });
        }
        setupDeck (projectFile) {
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
        }
        loadProjectFile (url) {
            this.props.onSetProjectFileLoading();
            fetchProjectFile(url)
                .then(projectFile => {
                    this.props.onSetProjectFile(projectFile);
                    this.setupDeck(projectFile);

                    // Load .sb3 if present
                    if (projectFile.sb3 && this.props.vm) {
                        this.loadSb3(projectFile.sb3, projectFile);
                    } else if (!projectFile.sb3) {
                        this.loadAssets(projectFile);
                        this.setState({isLoadingProjectFromUrl: false});
                    }
                })
                .catch(error => {
                    log.error('Failed to load project file:', error);
                    this.props.onSetProjectFileError(error.message);
                    this.setState({isLoadingProjectFromUrl: false});
                });
        }
        loadSb3 (sb3Url, projectFile) {
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
                    if (projectFile) {
                        this.loadAssets(projectFile);
                    }
                    this.setState({isLoadingProjectFromUrl: false});
                })
                .catch(error => {
                    log.error('Failed to load sb3:', error);
                    this.setState({isLoadingProjectFromUrl: false});
                });
        }
        render () {
            const {
                onSetProjectFile,
                onSetProjectFileLoading,
                onSetProjectFileError,
                onSetExternalDeck,
                onSetFullScreen,
                onSetDynamicAssets,
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

                // Hide costumes/sounds tabs if configured
                if (projectFile.costumes && typeof projectFile.costumes === 'object' &&
                    !Array.isArray(projectFile.costumes) &&
                    projectFile.costumes.enabled === false) {
                    componentProps.showCostumesTab = false;
                }
                if (projectFile.sounds && typeof projectFile.sounds === 'object' &&
                    !Array.isArray(projectFile.sounds) &&
                    projectFile.sounds.enabled === false) {
                    componentProps.showSoundsTab = false;
                }
            }

            return (
                <WrappedComponent
                    projectFileLoading={this.state.isLoadingProjectFromUrl || projectFileLoading}
                    {...componentProps}
                />
            );
        }
    }
    ProjectFileComponent.propTypes = {
        onSetDynamicAssets: PropTypes.func.isRequired,
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
        onSetDynamicAssets: assets => dispatch(setDynamicAssets(assets)),
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
