import * as React from 'react';
import './App.css';

import * as AWS from 'aws-sdk';

const IDENTITY_POOL_ID = 'us-west-2:e2c31f62-f30d-42fc-a978-b186112d3c20';
const LOGIN_LINK = 'https://blogger-auth.peterzieske.com/login?response_type=token&client_id=1700rjnl1dqtdlt7bru1t02850&redirect_uri=https%3A%2F%2Fblogger.peterzieske.com%2F#'
// const LOGIN_LINK = 'https://blogger-auth.peterzieske.com/login?response_type=token&client_id=1700rjnl1dqtdlt7bru1t02850&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000'

const hashParams = ((params: string[]) => {
  const h = {};
  // tslint:disable-next-line:prefer-for-of
  for (let i = 0; i < params.length; i++) {
    const parts = params[i].split('=', 2);
    // tslint:disable-next-line:no-console
    if (parts.length === 1) {
      h[parts[0]] = '';
    } else {
      h[parts[0]] = decodeURIComponent(parts[1].replace(/\+/g, " "));
    }
  }
  return h;
})(window.location.hash.replace(/#/, '').split('&'));

// let accessToken = urlParams.get('access_token');
const ID_TOKEN_KEY = 'id_token';
const idToken = hashParams[ID_TOKEN_KEY];
if (idToken) {
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IDENTITY_POOL_ID,
    Logins: {
      'cognito-idp.us-west-2.amazonaws.com/us-west-2_4qlTufxN5': idToken,
    }
  },{
    region: 'us-west-2',
  });
}

interface IAppState {
  userArn?: string;
}

class App extends React.Component<{}, IAppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
    };
  }

  public componentDidMount() {
    if (idToken) {
      const sts = new AWS.STS();
      sts.getCallerIdentity((err: AWS.AWSError, data: AWS.STS.GetCallerIdentityResponse) => {
        this.setState({
          userArn: data.Arn,
        });
      });
    }
  }

  public render() {
    return (
      <div>
        <h1>Blog authorer</h1>
        {
          idToken ? null : <p><a href={ LOGIN_LINK }>Login!</a></p>
        }
        {
          this.state.userArn ? <p>{ this.state.userArn }</p> : null
        }
      </div>
    );
  }
}

export default App;
