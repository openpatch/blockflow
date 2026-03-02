import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {injectIntl, defineMessages} from 'react-intl';
import {connect} from 'react-redux';
import intlShape from '../lib/intlShape.js';
import {spriteShape} from '../lib/assets-prop-types.js';
import VM from '@scratch/scratch-vm';
import mergeDynamicAssets from '../lib/merge-dynamic-assets.js';

import spriteLibraryContent from '../lib/libraries/sprites.json';
import randomizeSpritePosition from '../lib/randomize-sprite-position';
import spriteTags from '../lib/libraries/sprite-tags';

import LibraryComponent from '../components/library/library.jsx';

const messages = defineMessages({
    libraryTitle: {
        defaultMessage: 'Choose a Sprite',
        description: 'Heading for the sprite library',
        id: 'gui.spriteLibrary.chooseASprite'
    }
});

class SpriteLibrary extends React.PureComponent {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleItemSelect',
            'mergeDynamicAssets'
        ]);
        this.processedSprites = {};
    }
    handleItemSelect (item) {
        // Randomize position of library sprite
        randomizeSpritePosition(item);
        this.props.vm.addSprite(JSON.stringify(item)).then(() => {
            this.props.onActivateBlocksTab();
        });
    }
    mergeDynamicAssets () {
        if (this.processedSprites.source === this.props.dynamicSprites &&
            this.processedSprites.showBuiltin === this.props.showBuiltinSprites) {
            return this.processedSprites.data;
        }
        const staticAssets = this.props.showBuiltinSprites === false ? [] : spriteLibraryContent;
        this.processedSprites = mergeDynamicAssets(
            staticAssets,
            this.props.dynamicSprites
        );
        this.processedSprites.showBuiltin = this.props.showBuiltinSprites;
        return this.processedSprites.data;
    }
    render () {
        const data = this.mergeDynamicAssets();
        const {spriteTags: customSpriteTags, showBuiltinSprites} = this.props;
        let tags = spriteTags;
        if (showBuiltinSprites === false) {
            tags = customSpriteTags || [];
        } else if (customSpriteTags) {
            tags = spriteTags.concat(customSpriteTags);
        }
        return (
            <LibraryComponent
                data={data}
                id="spriteLibrary"
                tags={tags}
                title={this.props.intl.formatMessage(messages.libraryTitle)}
                onItemSelected={this.handleItemSelect}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

const mapStateToProps = state => {
    const projectFile = state.scratchGui.projectFile.projectFile;
    const da = state.scratchGui.dynamicAssets;
    let showBuiltinSprites;
    if (da.showBuiltinSprites !== null) {
        showBuiltinSprites = da.showBuiltinSprites;
    } else if (projectFile && projectFile.ui) {
        showBuiltinSprites = projectFile.ui.showBuiltinSprites;
    }
    return {
        dynamicSprites: da.sprites,
        showBuiltinSprites,
        spriteTags: da.spriteTags
    };
};

SpriteLibrary.propTypes = {
    dynamicSprites: PropTypes.arrayOf(spriteShape),
    intl: intlShape.isRequired,
    onActivateBlocksTab: PropTypes.func.isRequired,
    onRequestClose: PropTypes.func,
    showBuiltinSprites: PropTypes.bool,
    spriteTags: PropTypes.arrayOf(PropTypes.shape({
        tag: PropTypes.string,
        intlLabel: PropTypes.shape({
            id: PropTypes.string,
            defaultMessage: PropTypes.string
        })
    })),
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(connect(mapStateToProps)(SpriteLibrary));
