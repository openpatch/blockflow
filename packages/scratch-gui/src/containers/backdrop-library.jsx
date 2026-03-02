import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl} from 'react-intl';
import {connect} from 'react-redux';
import intlShape from '../lib/intlShape.js';
import {costumeShape} from '../lib/assets-prop-types.js';
import VM from '@scratch/scratch-vm';
import mergeDynamicAssets from '../lib/merge-dynamic-assets.js';

import backdropLibraryContent from '../lib/libraries/backdrops.json';
import backdropTags from '../lib/libraries/backdrop-tags';
import LibraryComponent from '../components/library/library.jsx';

const messages = defineMessages({
    libraryTitle: {
        defaultMessage: 'Choose a Backdrop',
        description: 'Heading for the backdrop library',
        id: 'gui.costumeLibrary.chooseABackdrop'
    }
});


class BackdropLibrary extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect',
            'mergeDynamicAssets'
        ]);
        this.processedBackdrops = {};
    }
    handleItemSelect (item) {
        const vmBackdrop = {
            name: item.name,
            rotationCenterX: item.rotationCenterX,
            rotationCenterY: item.rotationCenterY,
            bitmapResolution: item.bitmapResolution,
            skinId: null
        };
        // Do not switch to stage, just add the backdrop
        this.props.vm.addBackdrop(item.md5ext, vmBackdrop);
    }
    mergeDynamicAssets () {
        if (this.processedBackdrops.source === this.props.dynamicBackdrops &&
            this.processedBackdrops.showBuiltin === this.props.showBuiltinBackdrops) {
            return this.processedBackdrops.data;
        }
        const staticAssets = this.props.showBuiltinBackdrops === false ? [] : backdropLibraryContent;
        this.processedBackdrops = mergeDynamicAssets(
            staticAssets,
            this.props.dynamicBackdrops
        );
        this.processedBackdrops.showBuiltin = this.props.showBuiltinBackdrops;
        return this.processedBackdrops.data;
    }
    render () {
        const mergedAssets = this.mergeDynamicAssets();
        const {backdropTags: customBackdropTags, showBuiltinBackdrops} = this.props;
        let tags = backdropTags;
        if (showBuiltinBackdrops === false) {
            tags = customBackdropTags || [];
        } else if (customBackdropTags) {
            tags = backdropTags.concat(customBackdropTags);
        }
        return (
            <LibraryComponent
                data={mergedAssets}
                id="backdropLibrary"
                tags={tags}
                title={this.props.intl.formatMessage(messages.libraryTitle)}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
};

const mapStateToProps = state => {
    const projectFile = state.scratchGui.projectFile.projectFile;
    const da = state.scratchGui.dynamicAssets;
    let showBuiltinBackdrops;
    if (da.showBuiltinBackdrops !== null) {
        showBuiltinBackdrops = da.showBuiltinBackdrops;
    } else if (projectFile && projectFile.ui) {
        showBuiltinBackdrops = projectFile.ui.showBuiltinBackdrops;
    }
    return {
        dynamicBackdrops: da.backdrops,
        showBuiltinBackdrops,
        backdropTags: da.backdropTags
    };
};

BackdropLibrary.propTypes = {
    backdropTags: PropTypes.arrayOf(PropTypes.shape({
        tag: PropTypes.string,
        intlLabel: PropTypes.shape({
            id: PropTypes.string,
            defaultMessage: PropTypes.string
        })
    })),
    dynamicBackdrops: PropTypes.arrayOf(costumeShape),
    intl: intlShape.isRequired,
    onRequestClose: PropTypes.func,
    showBuiltinBackdrops: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(connect(mapStateToProps)(BackdropLibrary));
