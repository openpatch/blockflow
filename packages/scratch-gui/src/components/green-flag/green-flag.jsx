import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import greenFlagIcon from './icon--green-flag.svg';
import styles from './green-flag.css';

const GreenFlagComponent = function (props) {
    const {
        active,
        className,
        onClick,
        title,
        ...componentProps
    } = props;
    return (
        <button
            className={styles.greenFlagButton}
            onClick={onClick}
        >
            <img
                className={classNames(
                    className,
                    styles.greenFlag,
                    {
                        [styles.isActive]: active
                    }
                )}
                draggable={false}
                src={greenFlagIcon}
                title={title}
                {...componentProps}
            />
        </button>
    );
};
GreenFlagComponent.propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string
};
GreenFlagComponent.defaultProps = {
    active: false,
    title: 'Go'
};
export default GreenFlagComponent;
