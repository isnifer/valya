import React, { PropTypes, Component } from 'react';

export default Base => {
    return class extends Component {
        static displayName = 'Valya';
        static defaultProps = {
            enabled: true,
            initialValidation: false,
            silentInitValidation: false,
            name: null
        };

        static propTypes = {
            name: PropTypes.string.isRequired
        };

        static contextTypes = {
            foma: PropTypes.object.isRequired
        };

        constructor(props, context) {
            super(props, context);

            this.state = {
                isValidating: false,
                isValid: true,
                validationErrorMessage: null
            };

            if (props.enabled && props.initialValidation) {
                this.state.isValidating = true;

                this._validate(props.value);
            }

            if (props.enabled && props.silentInitValidation) {
                this._silentValidate(props.value);
            }
        }

        componentWillReceiveProps(nextProps) {
            if (
                nextProps.enabled &&
                (
                    nextProps.enabled !== this.props.enabled ||
                    nextProps.value !== this.props.value
                )
            ) {
                this.setState({
                    isValidating: true
                }, () => {
                    this._validate(nextProps.value);
                });
            }
        }

        _callOnStart() {
            this._setValidationInfo(false, true);

            if ('onStart' in this.props) {
                this.props.onStart();
            }
        }

        _callOnEnd() {
            this._setValidationInfo(this.state.isValid, false);

            if ('onEnd' in this.props) {
                this.props.onEnd(this.state.isValid, this.state.validationErrorMessage);
            }
        }

        _setValidationInfo(isValid, isValidating) {
            if (this.props.customInformer) {
                return;
            }

            this.context.foma.setValidationInfo({
                isValid,
                isValidating,
                name: this.props.name
            });
        }

        _onResolve(value) {
            if (value === this.props.value) {
                this.setState({
                    isValid: true,
                    isValidating: false,
                    validationErrorMessage: null
                }, this._callOnEnd);
            }
        }

        _onCatch(value, message) {
            if (value === this.props.value) {
                this.setState({
                    isValid: false,
                    isValidating: false,
                    validationErrorMessage: message
                }, this._callOnEnd);
            }
        }

        _validate(value) {
            this._callOnStart();

            const validators = this.props.validators.reduce((sequence, next) => {
                return sequence.then(() => {
                    return next.validator(value, next.params);
                });
            }, Promise.resolve());

            validators.then(
                this._onResolve.bind(this, value),
                this._onCatch.bind(this, value)
            );
        }

        _silentValidate(value) {
            this._setValidationInfo(false, true);

            const validators = this.props.validators.reduce((sequence, next) => {
                return sequence.then(() => {
                    return next.validator(value, next.params);
                });
            }, Promise.resolve());

            validators.then(
                this._setValidationInfo.bind(this, true, false),
                this._setValidationInfo.bind(this, false, false)
            );
        }

        render() {
            return React.createElement(
                Base,
                {
                    ...this.props,
                    ...this.state
                },
                this.props.children
            );
        }
    };
};
