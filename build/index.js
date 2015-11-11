'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

exports['default'] = function (Base) {
    return (function (_Component) {
        _inherits(_class, _Component);

        _createClass(_class, null, [{
            key: 'displayName',
            value: 'Valya',
            enumerable: true
        }, {
            key: 'defaultProps',
            value: {
                enabled: true,
                initialValidation: false,
                silentInitValidation: false,
                name: null
            },
            enumerable: true
        }, {
            key: 'propTypes',
            value: {
                name: _react.PropTypes.string.isRequired
            },
            enumerable: true
        }, {
            key: 'contextTypes',
            value: {
                foma: _react.PropTypes.object.isRequired
            },
            enumerable: true
        }]);

        function _class(props, context) {
            _classCallCheck(this, _class);

            _get(Object.getPrototypeOf(_class.prototype), 'constructor', this).call(this, props, context);

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

        _createClass(_class, [{
            key: 'componentWillReceiveProps',
            value: function componentWillReceiveProps(nextProps) {
                var _this = this;

                if (nextProps.enabled && (nextProps.enabled !== this.props.enabled || nextProps.value !== this.props.value)) {
                    this.setState({
                        isValidating: true
                    }, function () {
                        _this._validate(nextProps.value);
                    });
                }
            }
        }, {
            key: '_callOnStart',
            value: function _callOnStart() {
                this._setValidationInfo(false, true);

                if ('onStart' in this.props) {
                    this.props.onStart();
                }
            }
        }, {
            key: '_callOnEnd',
            value: function _callOnEnd() {
                this._setValidationInfo(this.state.isValid, false);

                if ('onEnd' in this.props) {
                    this.props.onEnd(this.state.isValid, this.state.validationErrorMessage);
                }
            }
        }, {
            key: '_setValidationInfo',
            value: function _setValidationInfo(isValid, isValidating) {
                if (this.props.customInformer) {
                    return;
                }

                this.context.foma.setValidationInfo({
                    isValid: isValid,
                    isValidating: isValidating,
                    name: this.props.name
                });
            }
        }, {
            key: '_onResolve',
            value: function _onResolve(value) {
                if (value === this.props.value) {
                    this.setState({
                        isValid: true,
                        isValidating: false,
                        validationErrorMessage: null
                    }, this._callOnEnd);
                }
            }
        }, {
            key: '_onCatch',
            value: function _onCatch(value, message) {
                if (value === this.props.value) {
                    this.setState({
                        isValid: false,
                        isValidating: false,
                        validationErrorMessage: message
                    }, this._callOnEnd);
                }
            }
        }, {
            key: '_validate',
            value: function _validate(value) {
                this._callOnStart();

                var validators = this.props.validators.reduce(function (sequence, next) {
                    return sequence.then(function () {
                        return next.validator(value, next.params);
                    });
                }, _Promise.resolve());

                validators.then(this._onResolve.bind(this, value), this._onCatch.bind(this, value));
            }
        }, {
            key: '_silentValidate',
            value: function _silentValidate(value) {
                this._setValidationInfo(false, true);

                var validators = this.props.validators.reduce(function (sequence, next) {
                    return sequence.then(function () {
                        return next.validator(value, next.params);
                    });
                }, _Promise.resolve());

                validators.then(this._setValidationInfo.bind(this, true, false), this._setValidationInfo.bind(this, false, false));
            }
        }, {
            key: 'render',
            value: function render() {
                return _react2['default'].createElement(Base, _extends({}, this.props, this.state), this.props.children);
            }
        }]);

        return _class;
    })(_react.Component);
};

module.exports = exports['default'];