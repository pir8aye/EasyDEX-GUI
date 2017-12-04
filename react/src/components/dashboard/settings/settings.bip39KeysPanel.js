import React from 'react';
import { translate } from '../../../translate/translate';
import { connect } from 'react-redux';
import {
  shepherdElectrumBip39Keys,
  copyCoinAddress,
  triggerToaster,
} from '../../../actions/actionCreators';
import Store from '../../../store';

class Bip39KeysPanel extends React.Component {
  constructor() {
    super();
    this.state = {
      keys: null,
      match: '',
      passphrase: '',
      seedInputVisibility: false,
      trimPassphraseTimer: null,
    };
    this._getBip39Keys = this._getBip39Keys.bind(this);
    this.updateInput = this.updateInput.bind(this);
    this.toggleSeedInputVisibility = this.toggleSeedInputVisibility.bind(this);
    this._copyCoinAddress = this._copyCoinAddress.bind(this);
  }

  componentWillReceiveProps(props) {
    if (props.Dashboard &&
        props.Dashboard.activeSection !== 'settings') {
      // reset input vals
      this.refs.passphrase.value = '';
      this.refs.passphraseTextarea.value = '';

      this.setState(Object.assign({}, this.state, {
        passphrase: '',
        keys: null,
        match: null,
      }));
    }
  }

  toggleSeedInputVisibility() {
    this.setState({
      seedInputVisibility: !this.state.seedInputVisibility,
    });
  }

  updateInput(e) {
    if (e.target.name === 'passphrase') {
      // remove any empty chars from the start/end of the string
      const newValue = e.target.value;

      clearTimeout(this.state.trimPassphraseTimer);

      const _trimPassphraseTimer = setTimeout(() => {
        this.setState({
          passphrase: newValue ? newValue.trim() : '', // hardcoded field name
        });
      }, 2000);

      this.resizeLoginTextarea();

      this.setState({
        trimPassphraseTimer: _trimPassphraseTimer,
        [e.target.name === 'passphraseTextarea' ? 'passphrase' : e.target.name]: newValue,
      });
    } else {
      this.setState({
        [e.target.name === 'passphraseTextarea' ? 'passphrase' : e.target.name]: e.target.value,
      });
    }
  }

  resizeLoginTextarea() {
    // auto-size textarea
    setTimeout(() => {
      if (this.state.seedInputVisibility) {
        document.querySelector('#passphraseTextarea').style.height = '1px';
        document.querySelector('#passphraseTextarea').style.height = `${(15 + document.querySelector('#passphraseTextarea').scrollHeight)}px`;
      }
    }, 100);
  }

  _copyCoinAddress(address) {
    Store.dispatch(copyCoinAddress(address));
  }

  _getBip39Keys() {
    shepherdElectrumBip39Keys(this.state.passphrase, this.state.match)
    .then((res) => {
      this.setState({
        keys: res.result.priv ? res.result : 'empty',
      });
    });
  }

  updateInput(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  render() {
    return (
      <div>
        <div className="row">
          <div className="col-sm-12 padding-bottom-10">
            <h4 className="col-red">
              <i className="fa fa-warning"></i> { translate('SETTINGS.BIP39_DISC') }
            </h4>
            <div>{ translate('SETTINGS.BIP39_DESC_P1') }</div>
            <div>{ translate('SETTINGS.BIP39_DESC_P2') }</div>
            <div>
              <div className="col-sm-12 no-padding-left margin-top-10">
                <div className="form-group form-material floating">
                  <input
                    type="password"
                    className={ !this.state.seedInputVisibility ? 'form-control' : 'hide' }
                    autoComplete="off"
                    name="passphrase"
                    ref="passphrase"
                    id="passphrase"
                    onChange={ this.updateInput }
                    value={ this.state.passphrase } />
                  <textarea
                    className={ this.state.seedInputVisibility ? 'form-control' : 'hide' }
                    autoComplete="off"
                    id="passphraseTextarea"
                    ref="passphraseTextarea"
                    name="passphraseTextarea"
                    onChange={ this.updateInput }
                    value={ this.state.passphrase }></textarea>
                  <i
                    className={ 'seed-toggle fa fa-eye' + (!this.state.seedInputVisibility ? '-slash' : '') }
                    onClick={ this.toggleSeedInputVisibility }></i>
                  <label
                    className="floating-label"
                    htmlFor="passphrase">{ translate('INDEX.PASSPHRASE') }</label>
                </div>
              </div>
              <div className="col-sm-4 no-padding-left text-center">
                <input
                  type="text"
                  className="form-control margin-top-10"
                  autoComplete="off"
                  name="match"
                  onChange={ this.updateInput }
                  placeholder="Search key pattern"
                  value={ this.state.match } />
                <button
                  type="button"
                  className="btn btn-primary waves-effect waves-light margin-top-20"
                  disabled={ !this.state.match || !this.state.passphrase || this.state.passphrase.length < 2 }
                  onClick={ this._getBip39Keys }>Get key</button>
              </div>
            </div>
          </div>
          { this.state.keys &&
            <div className="col-sm-12 margin-top-30 margin-bottom-20">
              { this.state.keys !== 'empty' &&
                <div>
                  <strong>WIF:</strong> <span>{ this.state.keys.priv }</span>
                  <button
                    className="btn btn-default btn-xs clipboard-edexaddr margin-left-10"
                    title={ translate('INDEX.COPY_TO_CLIPBOARD') }
                    onClick={ () => this._copyCoinAddress(this.state.keys.priv) }>
                      <i className="icon wb-copy"></i> { translate('INDEX.COPY') }
                  </button>
                </div>
              }
              { this.state.keys === 'empty' &&
                <strong>Key is not found</strong>
              }
            </div>
          }
        </div>
      </div>
    );
  };
}

export default Bip39KeysPanel;