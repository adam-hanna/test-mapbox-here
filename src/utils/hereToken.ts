import { Mutex } from 'async-mutex'
import { hmacsign256 } from 'oauth-sign'

export const API_URL = 'https://account.api.here.com/oauth2/token'
export const tokenStorageKey = 'here-api-token'
export const { localStorage } = window
export const refetchWindow = 15 * 60 * 60 // note: refetch a token if it is set to expire in the next 15 minutes
export const nonceLength = 2**5

// note: https://www.sitepoint.com/javascript-design-patterns-singleton/
export const mutexSingleton = Object.freeze({
  mutex: new Mutex()
})

export interface TokenResponse {
  AccessToken: string
  TokenType: string
  ExpiresIn: number
}

export interface RequestData {
  URL: string
  Method: string
  Data: { [key: string]: string }
}

export const generateNonce = (length: number): string => {
  let s = ''
  do {
    s += Math.random().toString(36).substr(2)
  } while (s.length < length)
  return s.substr(0, length)
}

export const storeToken = async (t: TokenResponse, key: string): Promise<void> => {
  await localStorage.setItem(key, JSON.stringify(t))
}

export const getTokenFromStorage = async (key: string): Promise<TokenResponse | undefined> => {
  const token = await localStorage.getItem(key)
  if (!token)
    return undefined
  
  return JSON.parse(token)
}

export const validateToken = ({ token, goodUntil }: { token?: TokenResponse, goodUntil: number }): boolean => {
  const seconds = new Date().getTime() / 1000
  if (!token || !token.ExpiresIn || token.ExpiresIn - seconds <= goodUntil)
    return false


  return true
}

export const fetchNewTokenFromAPI = async ({ key, secret }: { key: string, secret: string }): Promise<TokenResponse> => {
  const url = API_URL
  const method = 'POST'
  const body = 'grant_type=client_credentials'

  const auth = {
    oauth_consumer_key: key,
    oauth_nonce: generateNonce(nonceLength),
    oauth_signature_method: 'HMAC-SHA256',
    oauth_timestamp: String(Math.round(new Date().getTime() / 1000)),
    oauth_version: '1.0',
  }

  const sig = encodeURIComponent(hmacsign256(method, API_URL, auth, key, secret))
  let headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `OAuth oauth_consumer_key="${auth['oauth_consumer_key']}",oauth_nonce="${auth['oauth_nonce']}",oauth_signature="${sig}",oauth_signature_method="HMAC-SHA256",oauth_timestamp="${auth['oauth_timestamp']}",oauth_version="1.0"`
  }
  console.log('headers', headers)

  const options: RequestInit = {
    method,
    headers,
    body,
    mode: 'cors',
  }

  const response = await fetch(url, options)
  if (response.ok)
    throw new Error(`expected 200 status, received ${response.status}`)

  return await response.json()
}

// note: retrieveToken first checks for a token in local storage, and if no valid token exists, it retrieves the token from the api
export const retrieveToken = async ({ key, secret }: { key: string, secret: string }): Promise<string> => {
  // 0. acquire a lock on the mutex
  const release = await mutexSingleton.mutex.acquire();

  try {
    // 1. check local storage
    let token = await getTokenFromStorage(tokenStorageKey)
    console.log('token from stroage', token)

    // 2. validate local token
    if (token && validateToken({ token, goodUntil: refetchWindow })) {
      console.log('local token is valid')
      return token.AccessToken
    }

    // 3. local token is not valid, must fetch another from the api
    token = await fetchNewTokenFromAPI({ key, secret })
    if (!token)
      throw new Error('access token could not be getched from here api')
    console.log('token from api', token)

    // 4. store the token, locally
    await storeToken(token, tokenStorageKey)

    // 5. return the token to the user
    return token.AccessToken
  } catch(e) {
    throw e

  } finally {
    // 6. give up the mutex lock
    release()
  }
}

export default retrieveToken
