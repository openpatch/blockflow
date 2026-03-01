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
        return (
            <LibraryComponent
                data={mergedAssets}
                id="backdropLibrary"
                tags={backdropTags}
                title={this.props.intl.formatMessage(messages.libraryTitle)}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
};

const mapStateToProps = state => {
    const projectFile = state.scratchGui.projectFile.projectFile;
    return {
        dynamicBackdrops: state.scratchGui.dynamicAssets.backdrops,
        showBuiltinBackdrops: projectFile && projectFile.ui ?
            projectFile.ui.showBuiltinBackdrops : undefined
    };
};

BackdropLibrary.propTypes = {
    dynamicBackdrops: PropTypes.arrayOf(costumeShape),
    intl: intlShape.isRequired,
    onRequestClose: PropTypes.func,
    showBuiltinBackdrops: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(connect(mapStateToProps)(BackdropLibrary));
