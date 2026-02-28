import React from 'react';
import ReactDomClient from 'react-dom/client';
import {connect} from 'react-redux';
import {compose} from 'redux';
import queryString from 'query-string';

import GUI from '../containers/gui.jsx';
import HashParserHOC from '../lib/hash-parser-hoc.jsx';
import AppStateHOC from '../lib/app-state-hoc.jsx';

import {setFullScreen} from '../reducers/mode';

if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
    // Warn before navigating away
    window.onbeforeunload = () => true;
}

class Player extends React.Component {
    componentDidMount () {
        const queryParams = queryString.parse(location.search);
        if (queryParams.project) {
            this.props.onSetFullScreen(true);
        }
    }
    render () {
        const {onSetFullScreen, ...props} = this.props;
        return (
            <GUI
                isPlayerOnly
                {...props}
            />
        );
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
    onSetFullScreen: isFullScreen => dispatch(setFullScreen(isFullScreen))
});

const ConnectedPlayer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Player);

// note that redux's 'compose' function is just being used as a general utility to make
// the hierarchy of HOC constructor calls clearer here; it has nothing to do with redux's
// ability to compose reducers.
const WrappedPlayer = compose(
    AppStateHOC,
    HashParserHOC
)(ConnectedPlayer);

const appTarget = document.createElement('div');
document.body.appendChild(appTarget);

const root = ReactDomClient.createRoot(appTarget);
root.render(<WrappedPlayer isPlayerOnly />);
